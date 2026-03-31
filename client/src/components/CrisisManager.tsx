import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudio } from '../lib/stores/useAudio';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { getStage } from '../lib/utils/stageSystem';

interface PoopThreat {
  id: string;
  x: number;
  y: number;
  rotation: number;
  hp: number;
  maxHp: number;
  speed: number;
  scale: number;
  isHit?: boolean;
}

export default function CrisisManager() {
  const { lawsuitState, modifyHeat, incrementUsers, incrementIncome, formatNumber, addVisualEffect, showCharacterDialogue, triggerCrisisSpeech } = useMetamanGame();
  const { isCrisisActive, isCrisisWarning } = lawsuitState;
  
  const [threats, setThreats] = useState<PoopThreat[]>([]);
  const [score, setScore] = useState(0);
  const [hitPulse, setHitPulse] = useState(false);
  const { playHit, playSuccess } = useAudio();
  
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const spawnTimerRef = useRef<number>(0);

  const spawnPoop = () => {
    const side = Math.floor(Math.random() * 4);
    let x = 0, y = 0;
    const padding = 50;

    if (side === 0) { // Top
      x = Math.random() * window.innerWidth;
      y = -padding;
    } else if (side === 1) { // Right
      x = window.innerWidth + padding;
      y = Math.random() * window.innerHeight;
    } else if (side === 2) { // Bottom
      x = Math.random() * window.innerWidth;
      y = window.innerHeight + padding;
    } else { // Left
      x = -padding;
      y = Math.random() * window.innerHeight;
    }

    const newThreat: PoopThreat = {
      id: Math.random().toString(36).substr(2, 9),
      x,
      y,
      rotation: 0,
      hp: 5,
      maxHp: 5,
      speed: 0.35 + Math.random() * 0.9, // ~10% slower max speed to make them catchable
      scale: 0.8 + Math.random() * 0.4
    };

    setThreats(prev => [...prev, newThreat]);
  };

  const triggerHitPulse = () => {
    setHitPulse(true);
    // Apply Damage
    handleHQDamage();
    setTimeout(() => setHitPulse(false), 300);
  };

  const handleHQDamage = () => {
    const { users, income } = useMetamanGame.getState();
    const stage = getStage(users);
    
    // User loss scales by stage
    // Stage 1-3: 2-5%
    // Stage 4-6: 1-3%
    // Stage 7-10: 0.5-1%
    let userLossPercent = 0.01;
    if (stage <= 3) userLossPercent = 0.02 + Math.random() * 0.03;
    else if (stage <= 6) userLossPercent = 0.01 + Math.random() * 0.02;
    else userLossPercent = 0.005 + Math.random() * 0.005;

    const baseUserLoss = Math.max(10, Math.floor(users * userLossPercent));
    const moneyLoss = Math.max(1000, Math.floor(income * 0.05)); // Constant impact for money
    
    // Check for Addiction Science Tier 4: Zero Churn
    const hasCapture = useMetamanGame.getState().researchState.completed.includes('psychological_capture');
    const userLoss = hasCapture ? 0 : baseUserLoss;

    useMetamanGame.setState(state => ({
      users: Math.max(0, state.users - userLoss),
      income: Math.max(0, state.income - moneyLoss),
      lastUserLossTime: Date.now() // Trigger HUD shake
    }));

    // Floating effects
    addVisualEffect('money', window.innerWidth / 2, window.innerHeight / 2, 'extreme', `-${formatNumber(moneyLoss)}`, 'red');
    addVisualEffect('users', window.innerWidth / 2, window.innerHeight / 2 + 30, 'high', `-${formatNumber(userLoss)}`, 'red');
    
    // Random Dan comments
    if (Math.random() < 0.3) {
      const messages = [
        "They're leaving. Can't imagine why.",
        "User churn accelerating. Classic.",
        "Wait, are those users or just bots leaving?",
        "Don't worry, we'll lure more later. Maybe.",
        "The shareholders won't like this one bit."
      ];
      triggerCrisisSpeech(messages[Math.floor(Math.random() * messages.length)]);
    }

    playHit(); // Sound when hit!
  };

  const update = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      const targetX = window.innerWidth / 2;
      const targetY = window.innerHeight / 2;

      // Handle Spawning
      if (isCrisisActive) {
        spawnTimerRef.current += deltaTime;
        if (spawnTimerRef.current > 2500) { // Slightly slower spawn (was 1.5s)
          spawnPoop();
          spawnTimerRef.current = 0;
        }
      }

      setThreats(prev => {
        let hitDetected = false;
        const remaining = prev.map(t => {
          const dx = targetX - t.x;
          const dy = targetY - t.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 50) {
            hitDetected = true;
            return null; // Hit HQ
          }

          const vx = (dx / dist) * t.speed;
          const vy = (dy / dist) * t.speed;

          return {
            ...t,
            x: t.x + vx,
            y: t.y + vy,
            rotation: t.rotation + 2
          };
        }).filter(Boolean) as PoopThreat[];

        if (hitDetected) {
          triggerHitPulse();
        }

        return remaining;
      });
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isCrisisActive]);

  // Clear threats when crisis ends
  useEffect(() => {
    if (!isCrisisActive && threats.length > 0) {
      const timeout = setTimeout(() => setThreats([]), 3000); // Wait a bit for stragglers
      return () => clearTimeout(timeout);
    }
  }, [isCrisisActive, threats.length]);

  const handleHit = (id: string) => {
    playHit();
    setThreats(prev => prev.map(t => {
      if (t.id === id) {
        const damage = 1.0 + Math.random() * 0.5;
        let newHp = t.hp - damage;
        
        if (newHp > 0 && newHp < 0.4 && Math.random() > 0.6) {
          newHp = 0.15;
        }

        if (newHp <= 0) {
          playSuccess();
          setScore(s => s + 1);
          // Deflecting poops significantly reduces heat!
          modifyHeat(-2.0); 
          return null;
        }
        return { ...t, hp: newHp, isHit: true };
      }
      return t;
    }).filter(Boolean) as PoopThreat[]);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {/* Hit Pulse Overlay */}
      <AnimatePresence>
        {hitPulse && (
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 2, opacity: 0.3 }}
            exit={{ opacity: 0 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#634832] rounded-full blur-3xl pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Breaking News Banner (Phase 2) */}
      <AnimatePresence>
        {isCrisisActive && threats.length > 0 && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            // Moved banner down from top-0 to top-[100px] so it doesn't block the stat bar
            className="absolute top-[100px] left-0 w-full bg-red-600 border-b-4 border-t-4 border-black py-2 z-[10000] pointer-events-auto shadow-2xl flex items-center"
          >
            {/* Fixed Label with higher z-index and clip-path for sharp comic look */}
            <div className="relative z-20 bg-black text-white px-6 py-2 font-black text-2xl italic uppercase skew-x-[-12deg] border-r-4 border-white shadow-[4px_0_0_0_rgba(0,0,0,1)] ml-[-10px]">
              BREAKING NEWS
            </div>
            {/* Scrolling Marquee Container */}
            <div className="flex-1 overflow-hidden relative h-10 flex items-center">
              <motion.div 
                animate={{ x: [window.innerWidth, -2000] }}
                transition={{ 
                  duration: 25, // MUCH slower (was 10)
                  repeat: Infinity, 
                  ease: "linear" 
                }}
                className="text-white font-black text-3xl uppercase whitespace-nowrap"
              >
                🚨 PR DISASTER! 🚨 SCANDALS! 🚨 DEFEND THE HQ! 🚨 STOCK PRICES PLUMMETING! 🚨
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Warning Ticker (Phase 1) */}
      <AnimatePresence>
        {isCrisisWarning && !isCrisisActive && !showCharacterDialogue && !useMetamanGame.getState().showSenateHearing && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-yellow-400 border-4 border-black px-6 py-2 rounded-full shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-[10000] pointer-events-none"
          >
            <span className="font-black text-lg text-black uppercase animate-pulse">
              ⚠️ Warning: Public Outrage Growing...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {threats.map(t => (
        <motion.div
          key={t.id}
          className="absolute pointer-events-auto cursor-crosshair transform -translate-x-1/2 -translate-y-1/2"
          style={{ left: t.x, top: t.y }}
          animate={t.isHit ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.1 }}
          onAnimationComplete={() => {
            setThreats(prev => prev.map(p => p.id === t.id ? { ...p, isHit: false } : p));
          }}
        >
          <div 
            className="relative select-none"
            style={{ 
              transform: `rotate(${t.rotation}deg) scale(${t.scale})`,
              fontSize: '48px'
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              handleHit(t.id);
            }}
          >
            💩
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-black border border-white rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${t.hp < 1 ? 'bg-orange-500' : 'bg-red-500'}`}
                animate={{ width: `${(t.hp / t.maxHp) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>
      ))}

      {/* HQ Visualization Overlay */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-4 border-dashed rounded-full pointer-events-none transition-all duration-300 ${hitPulse ? 'border-amber-900 scale-125 opacity-100' : 'border-red-500/10 scale-100 opacity-0'}`} />
    </div>
  );
}
