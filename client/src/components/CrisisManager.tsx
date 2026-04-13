import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

const MAX_POOPS = 25; // Entity Cap!

export default function CrisisManager() {
  const isCrisisActive = useMetamanGame(state => state.lawsuitState.isCrisisActive);
  const isCrisisWarning = useMetamanGame(state => state.lawsuitState.isCrisisWarning);
  const modifyHeat = useMetamanGame(state => state.modifyHeat);
  const formatNumber = useMetamanGame(state => state.formatNumber);
  const addVisualEffect = useMetamanGame(state => state.addVisualEffect);
  const triggerCrisisSpeech = useMetamanGame(state => state.triggerCrisisSpeech);
  const showCharacterDialogue = useMetamanGame(state => state.speechBubbleState.isVisible);
  const showSenateHearing = useMetamanGame(state => state.showSenateHearing);
  
  const [score, setScore] = useState(0);
  const [hitPulse, setHitPulse] = useState(false);
  const { playHit, playSuccess, playPlop } = useAudio();
  
  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  
  // PURE ENGINE LAYER (Local Mutable State)
  const engine = useRef({
    threats: [] as PoopThreat[],
    spawnTimer: 0,
    hitCountThisFrame: 0,
    lastTime: 0,
  });

  // DOM POOL LAYER
  const poopRefs = useRef<(HTMLDivElement | null)[]>([]);

  const spawnPoop = () => {
    if (engine.current.threats.length >= MAX_POOPS) return; // ENTITY CAP!

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
      speed: 0.35 + Math.random() * 0.9,
      scale: 0.8 + Math.random() * 0.4
    };

    engine.current.threats.push(newThreat);
  };

  const triggerHitPulse = () => {
    setHitPulse(true);
    setTimeout(() => setHitPulse(false), 300);
  };

  const handleHQDamage = (hitCount: number) => {
    const { users, income, researchState, addToForge } = useMetamanGame.getState();
    const stage = getStage(users);
    
    // User loss scales by stage
    // Stage 1-3: 2-5%
    // Stage 4-6: 1-3%
    // Stage 7-10: 0.5-1%
    let userLossPercent = 0.01;
    if (stage <= 3) userLossPercent = 0.02 + Math.random() * 0.03;
    else if (stage <= 6) userLossPercent = 0.01 + Math.random() * 0.02;
    else userLossPercent = 0.005 + Math.random() * 0.005;

    let baseUserLoss = Math.max(10, Math.floor(users * userLossPercent));
    let moneyLoss = Math.max(1000, Math.floor(income * 0.05)); 
    
    // Batch the damage for multiple poops hitting the same frame!
    baseUserLoss *= hitCount;
    moneyLoss *= hitCount;

    // Check for Addiction Science Tier 4: Zero Churn
    const hasCapture = researchState.completed.includes('psychological_capture');
    const userLoss = hasCapture ? 0 : baseUserLoss;
    
    useMetamanGame.setState(state => ({
      users: Math.max(0, state.users - userLoss),
      income: Math.max(0, state.income - moneyLoss),
      lastUserLossTime: Date.now() // Trigger HUD shake
    }));

    // Add item to Forge (Shitstorm creates Evidence/Proof) - Scale by hits
    for(let i=0; i<hitCount; i++) {
       if (Math.random() < 0.7) {
         addToForge(Math.random() < 0.5 ? 'doc' : 'proof');
       }
    }

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
    const e = engine.current;
    
    if (e.lastTime !== 0) {
      const deltaTime = time - e.lastTime;
      const targetX = window.innerWidth / 2;
      const targetY = window.innerHeight / 2;

      // Handle Spawning
      if (isCrisisActive) {
        e.spawnTimer += deltaTime;
        if (e.spawnTimer > 2500) { 
          spawnPoop();
          e.spawnTimer = 0;
        }
      }

      let hitDetected = false;
      
      // Update Physics & Collisions (Pure Data loop)
      for (let i = e.threats.length - 1; i >= 0; i--) {
        const t = e.threats[i];
        const dx = targetX - t.x;
        const dy = targetY - t.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 50) {
          e.hitCountThisFrame++;
          e.threats.splice(i, 1); // Remove from logic
          hitDetected = true;
          continue;
        }

        const vx = (dx / dist) * t.speed;
        const vy = (dy / dist) * t.speed;

        t.x += vx;
        t.y += vy;
        t.rotation += 2;
      }

      // Sync to DOM layer (Direct mapping 1-to-1 max entities)
      for (let i = 0; i < MAX_POOPS; i++) {
        const el = poopRefs.current[i];
        if (!el) continue;
        
        const t = e.threats[i];
        if (t) {
          el.style.display = 'block';
          el.style.transform = `translate(-50%, -50%) translate(${t.x}px, ${t.y}px) rotate(${t.rotation}deg) scale(${t.scale})`;
          
          if (t.isHit) {
            el.style.filter = 'drop-shadow(0 0 15px rgba(255,255,255,0.8)) brightness(1.5)';
            t.isHit = false; // single frame hit flash
          } else {
            el.style.filter = 'none';
          }

          // Update internal HP bar blindly
          const hpBar = el.children[0]?.children[0] as HTMLElement;
          if (hpBar) {
            hpBar.style.width = `${(t.hp / t.maxHp) * 100}%`;
            hpBar.style.backgroundColor = t.hp < 1 ? '#f97316' : '#ef4444';
          }
        } else {
          el.style.display = 'none';
        }
      }

      // Apply Batched Gameplay Events
      if (hitDetected && e.hitCountThisFrame > 0) {
        triggerHitPulse();
        handleHQDamage(e.hitCountThisFrame); // Only 1 state update globally per frame
        e.hitCountThisFrame = 0;
      }
    }
    
    e.lastTime = time;
    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isCrisisActive]);

  // Clear threats when crisis ends
  useEffect(() => {
    if (!isCrisisActive) {
      engine.current.threats = [];
      // clear DOM visually instantly
      poopRefs.current.forEach(el => { if (el) el.style.display = 'none'; });
    }
  }, [isCrisisActive]);

  const handleHitLayer = (index: number) => {
    const t = engine.current.threats[index];
    if (!t) return;
    
    playHit();
    const damage = 1.0 + Math.random() * 0.5;
    let newHp = t.hp - damage;
    
    if (newHp > 0 && newHp < 0.4 && Math.random() > 0.6) {
      newHp = 0.15;
    }

    if (newHp <= 0) {
      playPlop(); 
      addVisualEffect('confetti' as any, t.x, t.y, 'medium', ''); 
      setScore(s => s + 1);
      modifyHeat(-2.0); 
      engine.current.threats.splice(index, 1);
    } else {
      t.hp = newHp;
      t.isHit = true;
    }
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
        {isCrisisActive && (
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
        {isCrisisWarning && !isCrisisActive && !showCharacterDialogue && !showSenateHearing && (
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

      {/* POOP ENTITY POOL (DOM LAYER) */}
      {Array.from({ length: MAX_POOPS }).map((_, i) => (
        <div
          key={i}
          ref={el => { poopRefs.current[i] = el; }}
          className="absolute pointer-events-auto cursor-crosshair hidden"
          style={{ willChange: 'transform' }}
          onMouseDown={(e) => {
            e.stopPropagation();
            handleHitLayer(i);
          }}
        >
          <div 
            className="relative select-none"
            style={{ fontSize: '48px' }}
          >
            💩
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-black border border-white rounded-full overflow-hidden">
              {/* This inner div maps to hpBar in update loop */}
              <div className="h-full bg-red-500 w-full" />
            </div>
          </div>
        </div>
      ))}

      {/* HQ Visualization Overlay */}
      <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-4 border-dashed rounded-full pointer-events-none transition-all duration-300 ${hitPulse ? 'border-amber-900 scale-125 opacity-100' : 'border-red-500/10 scale-100 opacity-0'}`} />
    </div>
  );
}
