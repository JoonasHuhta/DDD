import { useEffect, useMemo, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { getStage, getStageInfo } from '../lib/utils/stageSystem';
import {
  getTickerMessages,
  TICKER_COMBOS,
  type TickerCombo,
  type TickerMessage,
} from '../data/tickerMessages';

const IDLE_THRESHOLD_MS = 60_000;
const IDLE_CHECK_INTERVAL_MS = 5_000;
const MESSAGE_CYCLE_MS = 12_000;
const COMBO_FOLLOWUP_DELAY_MS = 6_000;
const MAX_HISTORY_ITEMS = 8;

function pickWeightedMessage(messages: TickerMessage[]): TickerMessage | null {
  if (messages.length === 0) {
    return null;
  }

  const totalWeight = messages.reduce((sum, message) => sum + (message.weight ?? 1), 0);

  if (totalWeight <= 0) {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  let roll = Math.random() * totalWeight;

  for (const message of messages) {
    roll -= message.weight ?? 1;
    if (roll <= 0) {
      return message;
    }
  }

  return messages[messages.length - 1];
}

function getMessageColorClass(message: TickerMessage | null): string {
  if (!message) {
    return 'text-white';
  }

  if (message.type === 'dan') {
    return 'text-[#FFD700]';
  }

  if (message.type === 'news') {
    return 'text-white';
  }

  if (message.type === 'meta') {
    return 'text-[#FF6B35]';
  }

  if (message.type === 'legendary') {
    return 'animate-pulse text-red-400';
  }

  if (message.type === 'market') {
    if (message.text.includes('▼')) {
      return 'text-[#FF4444]';
    }

    if (message.text.includes('▲')) {
      return 'text-[#00FF41]';
    }
  }

  return 'text-white';
}

function getHeatColorClass(heat: number): string {
  if (heat >= 70) {
    return 'text-red-500';
  }

  if (heat >= 40) {
    return 'text-yellow-400';
  }

  return 'text-green-400';
}

function buildHeatHearts(heat: number): string {
  const filledHearts = Math.max(1, Math.min(5, Math.ceil(heat / 20)));
  return '♥'.repeat(filledHearts) + '♡'.repeat(5 - filledHearts);
}

function comboToMessages(combo: TickerCombo): { lead: TickerMessage; followup: TickerMessage } {
  return {
    lead: {
      text: combo.lead,
      type: 'news',
    },
    followup: {
      text: combo.followup,
      type: 'dan',
    },
  };
}

export default function DanTV() {
  const { users, heat, lastClickTime } = useMetamanGame(
    useShallow((state) => ({
      users: state.users,
      heat: state.heat,
      lastClickTime: state.lastClickTime,
    }))
  );

  const stage = getStage(users);
  const stageName = getStageInfo(users).name;
  const [isIdle, setIsIdle] = useState<boolean>(() => Date.now() - lastClickTime > IDLE_THRESHOLD_MS);
  const [currentMessage, setCurrentMessage] = useState<TickerMessage | null>(null);
  const [messageHistory, setMessageHistory] = useState<TickerMessage[]>([]);
  const [isComboMode, setIsComboMode] = useState(false);
  const [comboFollowup, setComboFollowup] = useState<string | null>(null);
  const cycleCountRef = useRef(0);
  const comboTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const eligibleMessages = useMemo(
    () => getTickerMessages(stage, heat, isIdle),
    [stage, heat, isIdle]
  );

  useEffect(() => {
    const idleInterval = setInterval(() => {
      setIsIdle(Date.now() - lastClickTime > IDLE_THRESHOLD_MS);
    }, IDLE_CHECK_INTERVAL_MS);

    setIsIdle(Date.now() - lastClickTime > IDLE_THRESHOLD_MS);

    return () => clearInterval(idleInterval);
  }, [lastClickTime]);

  useEffect(() => {
    const pushHistory = (message: TickerMessage) => {
      setMessageHistory((prev) => [message, ...prev].slice(0, MAX_HISTORY_ITEMS));
    };

    const clearComboTimeout = () => {
      if (comboTimeoutRef.current) {
        clearTimeout(comboTimeoutRef.current);
        comboTimeoutRef.current = null;
      }
    };

    const showMessage = (message: TickerMessage) => {
      setCurrentMessage(message);
      pushHistory(message);
    };

    const showRandomTicker = () => {
      clearComboTimeout();
      cycleCountRef.current += 1;

      const shouldShowCombo = cycleCountRef.current % 4 === 0 && Math.random() < 0.15 && TICKER_COMBOS.length > 0;

      if (shouldShowCombo) {
        const combo = TICKER_COMBOS[Math.floor(Math.random() * TICKER_COMBOS.length)];
        const comboMessages = comboToMessages(combo);

        setIsComboMode(true);
        setComboFollowup(combo.followup);
        showMessage(comboMessages.lead);

        comboTimeoutRef.current = setTimeout(() => {
          setCurrentMessage(comboMessages.followup);
          pushHistory(comboMessages.followup);
          setIsComboMode(false);
          setComboFollowup(null);
          comboTimeoutRef.current = null;
        }, COMBO_FOLLOWUP_DELAY_MS);

        return;
      }

      setIsComboMode(false);
      setComboFollowup(null);

      const pickedMessage = pickWeightedMessage(eligibleMessages);
      if (pickedMessage) {
        showMessage(pickedMessage);
      } else {
        setCurrentMessage(null);
      }
    };

    showRandomTicker();
    const messageInterval = setInterval(showRandomTicker, MESSAGE_CYCLE_MS);

    return () => {
      clearInterval(messageInterval);
      clearComboTimeout();
    };
  }, [eligibleMessages]);

  const messageColorClass = getMessageColorClass(currentMessage);
  const heatColorClass = getHeatColorClass(heat);
  const heatHearts = buildHeatHearts(heat);

  return (
    <div className="w-full">
      <style>{`
        @keyframes dan-tv-scroll {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      <div className="relative mb-3 overflow-hidden rounded-2xl border-4 border-black bg-black p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <div className="mb-2 text-xs font-black uppercase tracking-wide text-[#FFD700]">
          DAN&apos;S PROPAGANDA TV
        </div>

        <div className="relative min-h-[70px] overflow-hidden">
          <div className={`inline-block whitespace-nowrap font-mono text-sm font-bold ${messageColorClass}`} style={{ animation: 'dan-tv-scroll 10s linear infinite' }}>
            {currentMessage?.text ?? 'Signal calibrating... please remain emotionally available.'}
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, rgba(255,255,255,0.9) 0px, rgba(255,255,255,0.9) 1px, transparent 1px, transparent 4px)',
          }}
        />
      </div>

      <div className="mb-3 flex items-center justify-between gap-3 text-[10px] font-black uppercase">
        <div className="text-gray-700">Stage: {stageName}</div>
        <div className={`${heatColorClass}`}>
          Heat: {heatHearts}
        </div>
      </div>

      <div className="max-h-40 overflow-y-auto rounded-2xl border-4 border-black bg-white p-3 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <div className="mb-2 text-[10px] font-black uppercase text-gray-500">
          // Broadcast Log
        </div>

        <div className="space-y-2">
          {messageHistory.length > 0 ? (
            messageHistory.map((message, index) => (
              <div
                key={`${message.text}-${index}`}
                className={`text-[10px] font-bold opacity-50 ${getMessageColorClass(message)}`}
              >
                {message.text}
              </div>
            ))
          ) : (
            <div className="text-[10px] font-bold uppercase text-gray-400">
              No broadcasts logged yet.
            </div>
          )}
        </div>
      </div>

      {isComboMode && comboFollowup ? (
        <div className="mt-2 text-[10px] font-black uppercase text-gray-500">
          Incoming response: {comboFollowup}
        </div>
      ) : null}
    </div>
  );
}
