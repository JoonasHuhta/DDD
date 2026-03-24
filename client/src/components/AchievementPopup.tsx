import React, { useState, useEffect } from 'react';
import { Achievement } from '../lib/achievements/AchievementSystem';
import { Box, Shield, Zap, X } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClaim: (achievementId: string) => void;
  onClose: () => void;
}

export default function AchievementPopup({ achievement, onClaim, onClose }: AchievementPopupProps) {
  const [showParticles, setShowParticles] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);
  const { formatNumber } = useMetamanGame();

  useEffect(() => {
    let flashTimer: NodeJS.Timeout | null = null;
    let particleTimer: NodeJS.Timeout | null = null;
    
    if (achievement) {
      setScreenFlash(true);
      flashTimer = setTimeout(() => setScreenFlash(false), 150) as any;
      
      setShowParticles(true);
      particleTimer = setTimeout(() => setShowParticles(false), 1000) as any;
    }

    return () => {
      if (flashTimer) clearTimeout(flashTimer);
      if (particleTimer) clearTimeout(particleTimer);
    };
  }, [achievement]);

  if (!achievement) return null;

  const handleClaim = () => {
    onClaim(achievement.id);
    onClose();
  };

  return (
    <>
      {/* Subtle Scanline Flash */}
      {screenFlash && (
        <div className="fixed inset-0 bg-green-500 opacity-10 z-[70] pointer-events-none" />
      )}

      {/* Simplified Particles */}
      {showParticles && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-green-500 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random()}s`,
              }}
            />
          ))}
        </div>
      )}

      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div className="bg-black border-4 border-green-500 max-w-sm w-full relative shadow-[0_0_30px_rgba(34,197,94,0.2)]">
          {/* Header */}
          <div className="bg-green-500 p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-black" />
              <span className="text-[10px] font-black uppercase tracking-widest text-black font-mono">
                Asset.Verified
              </span>
            </div>
            <button onClick={onClose} className="text-black hover:bg-black hover:text-green-500 p-1 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 text-center">
            <div className="mb-4 inline-block p-4 border-2 border-green-500/20 bg-green-500/5">
              <Shield className="w-12 h-12 text-green-500 animate-pulse" />
            </div>
            
            <h1 className="text-xs font-mono text-green-500 mb-1 uppercase tracking-widest">
              NOTIFICATION: NEW ASSET DETECTED
            </h1>
            
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-4">
              {achievement.name}
            </h2>
            
            <p className="text-[10px] font-mono text-green-500/60 uppercase mb-6 leading-tight">
              {achievement.description}
            </p>

            {/* Value Display */}
            <div className="bg-green-500/10 border-2 border-dashed border-green-500/30 p-4 mb-6">
              <div className="text-[10px] font-mono text-green-500/50 uppercase mb-1">Potential Value</div>
              <div className="text-3xl font-black text-green-400">
                ${formatNumber(achievement.reward)}
              </div>
            </div>

            <button
              onClick={handleClaim}
              className="w-full bg-green-500 hover:bg-green-400 text-black font-black py-4 px-6 uppercase italic tracking-tighter transition-all active:translate-y-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-none"
            >
              SECURE ASSET
            </button>
            
            <div className="mt-4 text-[9px] font-mono text-green-500/30 uppercase">
              Transfer to suitcase for extraction
            </div>
          </div>
        </div>
      </div>
    </>
  );
}