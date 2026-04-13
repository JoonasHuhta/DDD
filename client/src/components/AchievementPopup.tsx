import React, { useState, useEffect } from 'react';
import { Achievement } from '../lib/achievements/AchievementSystem';
import { Box, Trophy, Zap, X, ChevronRight, Eye } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClaim: (achievementId: string) => void;
  onClose: () => void;
}

export default function AchievementPopup({ achievement, onClaim, onClose }: AchievementPopupProps) {
  const [showParticles, setShowParticles] = useState(false);
  const [screenFlash, setScreenFlash] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 transition-all duration-500"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isFlipped) onClose();
        }}
        style={{ perspective: '1000px' }}
      >
        <div 
          className="relative w-full max-w-sm transition-all duration-700"
          style={{ 
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            height: '480px'
          }}
        >
          {/* FRONT SIDE */}
          <div 
            className="absolute inset-0 bg-[#FFD700] border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] rounded-2xl overflow-hidden flex flex-col"
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Header */}
            <div className="bg-black p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-[#FFD700]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#FFD700]">
                  NEW ASSET UNLOCKED
                </span>
              </div>
              <button onClick={onClose} className="text-white hover:text-red-500 p-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-center text-center">
              <div className="mb-4 mx-auto inline-block p-4 border-4 border-black bg-white rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <Trophy className="w-12 h-12 text-[#FFD700] fill-black" />
              </div>
              
              <h1 className="text-xs font-black text-black/60 mb-1 uppercase tracking-widest">
                OFFICIAL VERIFICATION
              </h1>
              
              <h2 className="text-4xl font-black text-black italic uppercase tracking-tighter mb-2 comic-text-stroke-white">
                {achievement.name}
              </h2>
              
              <p className="text-xs font-bold text-black uppercase mb-6 leading-tight">
                {achievement.description}
              </p>

              {/* Value Display */}
              <div className="bg-white border-4 border-black p-4 mb-6 rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)] mx-4">
                <div className="text-[10px] font-black text-black/50 uppercase mb-1">Asset Value</div>
                <div className="text-3xl font-black text-green-600">
                  ${formatNumber(achievement.reward)}
                </div>
              </div>

              <button
                onClick={handleClaim}
                className="w-full bg-[#FF6B35] hover:bg-[#ff8c42] text-white border-4 border-black font-black py-4 px-6 uppercase italic tracking-tighter transition-all active:translate-y-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none"
              >
                SECURE ASSET
              </button>
              
              {achievement.costMetrics && (
                <div className="mt-4 flex justify-end">
                  <button 
                    onClick={() => setIsFlipped(true)}
                    className="flex items-center gap-1 text-[9px] font-bold text-black/40 hover:text-black/80 transition-colors uppercase tracking-widest"
                  >
                    <ChevronRight className="w-3 h-3" />
                    VIEW ALT METRICS
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* BACK SIDE (COST METRICS) */}
          <div 
            className="absolute inset-0 bg-[#0a0f0d] border border-[#1a2f24] rounded-2xl overflow-hidden flex flex-col shadow-[0_0_30px_rgba(0,255,100,0.05)]"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              backgroundImage: 'radial-gradient(circle at center, #0d1a14 0%, #050a08 100%)'
            }}
          >
            {/* Header */}
            <div className="border-b border-[#1a2f24] p-3 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#4ade80]/50" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#4ade80]/50">
                  INTERNAL REPORT
                </span>
              </div>
              <button onClick={() => setIsFlipped(false)} className="text-[#4ade80]/50 hover:text-[#4ade80] p-1 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 flex-1 flex flex-col justify-start">
              <h2 className="text-xl font-mono text-[#4ade80] uppercase tracking-wider mb-6 pb-2 border-b border-[#1a2f24]">
                THE COST
              </h2>
              
              {achievement.costMetrics ? (
                <div className="space-y-6 flex-1 font-mono text-sm">
                  <div>
                    <div className="text-[10px] text-[#4ade80]/40 tracking-widest mb-1">ATTENTION</div>
                    <div className="text-[#e2e8f0]">{achievement.costMetrics.attention}</div>
                  </div>
                  
                  <div>
                    <div className="text-[10px] text-[#4ade80]/40 tracking-widest mb-1">BEHAVIOR</div>
                    <div className="text-[#e2e8f0]">{achievement.costMetrics.behavior}</div>
                  </div>
                  
                  <div>
                    <div className="text-[10px] text-[#4ade80]/40 tracking-widest mb-1">WELLBEING</div>
                    <div className="text-[#e2e8f0]">{achievement.costMetrics.wellbeing}</div>
                  </div>
                  
                  <div className="pt-4 mt-auto">
                    <div className="text-[10px] text-red-500/60 tracking-widest mb-1">SYSTEM NOTE</div>
                    <div className="text-red-400 font-italic text-xs italic opacity-80 border-l-2 border-red-900/50 pl-3">
                      {achievement.costMetrics.systemNote}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center font-mono text-[#4ade80]/30 text-sm italic">
                  DATA UNAVAILABLE
                </div>
              )}
            </div>

            <div className="p-4 bg-black/60 border-t border-[#1a2f24]">
              <button
                onClick={handleClaim}
                className="w-full bg-transparent hover:bg-[#1a2f24] text-[#4ade80] border border-[#1a2f24] font-mono py-3 px-6 uppercase tracking-widest transition-colors text-xs"
              >
                ACKNOWLEDGE & SECURE
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}