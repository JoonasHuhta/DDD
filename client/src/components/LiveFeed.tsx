import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { getStage } from '../lib/utils/stageSystem';
import {
  getFeedMessages,
  type CohortType,
  type FeedMessage,
} from '../data/feedMessages';

const MAX_MESSAGES = 12;
const MIN_SPAWN_DELAY_MS = 2_000;
const MAX_SPAWN_DELAY_MS = 4_000;

const COHORT_DEPARTMENT_MAP: Record<CohortType, string[]> = {
  teen: ['supply_networks', 'customer_relations', 'user_farms', 'influencer_networks'],
  pro: ['customer_relations', 'data_miners', 'influencer_networks', 'government_relations'],
  senior: ['customer_relations', 'global_server_farms', 'government_relations'],
  addict: ['algorithm_centers', 'data_miners', 'neural_networks', 'reality_distortion_centers', 'consciousness_harvesters'],
  bot: ['algorithm_centers', 'data_miners', 'neural_networks', 'global_server_farms', 'reality_distortion_centers', 'consciousness_harvesters'],
  system: ['neural_networks', 'government_relations', 'reality_distortion_centers', 'consciousness_harvesters'],
};

function pickWeightedMessage(messages: FeedMessage[]): FeedMessage | null {
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

function getRandomDelay(): number {
  return Math.floor(Math.random() * (MAX_SPAWN_DELAY_MS - MIN_SPAWN_DELAY_MS + 1)) + MIN_SPAWN_DELAY_MS;
}

function getCohortTagClass(cohort: CohortType): string {
  switch (cohort) {
    case 'teen':
      return 'bg-[#FF69B4] text-white';
    case 'pro':
      return 'bg-[#4169E1] text-white';
    case 'senior':
      return 'bg-[#808080] text-white';
    case 'addict':
      return 'bg-[#FF4444] text-white';
    case 'bot':
      return 'bg-[#00FF41] text-black';
    case 'system':
      return 'bg-black text-[#FFD700] italic';
    default:
      return 'bg-black text-white';
  }
}

function getRowClass(message: FeedMessage, index: number): string {
  const opacityClass = index === 0 ? 'opacity-100' : index < 4 ? 'opacity-60' : 'opacity-30';
  const glitchClass = index === 0 && message.isGlitch ? 'animate-pulse bg-red-100' : 'bg-transparent';
  const enterClass = index === 0 ? 'translate-y-0 animate-[live-feed-enter_220ms_ease-out]' : '';

  return `${opacityClass} ${glitchClass} ${enterClass}`.trim();
}

export default function LiveFeed() {
  const { users, heat, departments } = useMetamanGame(
    useShallow((state) => ({
      users: state.users,
      heat: state.heat,
      departments: state.departments,
    }))
  );

  const stage = getStage(users);
  const availableCohorts = useMemo(() => {
    const unlockedDepartmentIds = new Set(
      departments
        .filter((department) => department.owned > 0)
        .map((department) => department.id)
    );

    return (Object.keys(COHORT_DEPARTMENT_MAP) as CohortType[]).filter((cohort) =>
      COHORT_DEPARTMENT_MAP[cohort].some((departmentId) => unlockedDepartmentIds.has(departmentId))
    );
  }, [departments]);

  const eligibleMessages = useMemo(
    () => getFeedMessages(stage, heat, availableCohorts),
    [stage, heat, availableCohorts]
  );

  const [messages, setMessages] = useState<FeedMessage[]>([]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const spawnMessage = () => {
      if (cancelled) {
        return;
      }

      const nextMessage = pickWeightedMessage(eligibleMessages);
      if (nextMessage) {
        setMessages((prev) => [nextMessage, ...prev].slice(0, MAX_MESSAGES));
      }

      timeoutId = setTimeout(spawnMessage, getRandomDelay());
    };

    timeoutId = setTimeout(spawnMessage, getRandomDelay());

    return () => {
      cancelled = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [eligibleMessages]);

  return (
    <div className="mt-3 rounded-2xl border-4 border-black bg-white p-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
      <style>{`
        @keyframes live-feed-enter {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="text-xs font-black uppercase">Live User Feed</div>
        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      </div>

      <div className="max-h-48 space-y-2 overflow-y-auto">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div
              key={`${message.cohort}-${message.text}-${index}`}
              className={`rounded-lg border-2 border-black p-2 transition-all duration-200 ${getRowClass(message, index)}`}
            >
              <div className="flex items-start gap-2">
                <span className={`shrink-0 rounded-md border-2 border-black px-1.5 py-0.5 text-[10px] font-black uppercase ${getCohortTagClass(message.cohort)}`}>
                  [{message.cohort.toUpperCase()}]
                </span>
                <span className="pt-[1px] font-mono text-xs">
                  {message.text}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-lg border-2 border-black bg-gray-50 p-2 font-mono text-xs text-gray-500">
            Waiting for users to say something regrettable...
          </div>
        )}
      </div>
    </div>
  );
}
