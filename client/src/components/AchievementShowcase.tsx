import React, { useState, useEffect } from 'react';
import { Trophy, Star, Zap, Award, Crown, Target, Box } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';

interface AchievementShowcaseProps {
  achievement: any;
  onComplete: () => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export default function AchievementShowcase({ achievement, onComplete }: AchievementShowcaseProps) {
  const { formatNumber, claimAchievement } = useMetamanGame();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showContent, setShowContent] = useState(false);
  const [animationPhase, setAnimationPhase] = useState<'entrance' | 'display' | 'exit'>('entrance');

  // Create celebratory particles (Simplified for performance)
  const createParticles = () => {
    const newParticles: Particle[] = [];
    const colors = ['#00FF00', '#FFFFFF', '#333333']; // Corporate colors
    
    for (let i = 0; i < 30; i++) { // Reduced count
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: window.innerHeight + Math.random() * 100,
        vx: (Math.random() - 0.5) * 3, // Slower
        vy: -Math.random() * 6 - 2,
        life: 1,
        maxLife: Math.random() * 2 + 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 1
      });
    }
    
    setParticles(newParticles);
  };

  // Update particles animation with proper cleanup
  useEffect(() => {
    // Force clear particles when not displaying
    if (animationPhase !== 'display') {
      setParticles([]);
      return;
    }

    const interval = setInterval(() => {
      setParticles(prevParticles => {
        // Exit immediately if animation phase changed
        if (animationPhase !== 'display') return [];
        
        return prevParticles
          .map(particle => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.2, // gravity
            life: particle.life - 0.016 // 60fps
          }))
          .filter(particle => particle.life > 0 && particle.y < window.innerHeight + 50);
      });
    }, 16);

    return () => clearInterval(interval);
  }, [animationPhase]);

  // Animation sequence
  useEffect(() => {
    // Entrance phase
    setTimeout(() => {
      setShowContent(true);
      setAnimationPhase('display');
      createParticles();
    }, 100);

    // Display phase - extended duration for better readability
    setTimeout(() => {
      setAnimationPhase('exit');
    }, 7000);

    // Exit phase - automatically claim achievement and close
    const exitTimer = setTimeout(() => {
      // Clear particles before claiming
      setParticles([]);
      setAnimationPhase('exit');
      
      // Clean timeout for claiming
      setTimeout(() => {
        if (achievement.id) {
          claimAchievement(achievement.id);
        }
        onComplete();
      }, 500); // Brief delay for exit animation
    }, 8000);

    // Cleanup function to prevent memory leaks
    return () => {
      clearTimeout(exitTimer);
      setParticles([]);
    };
  }, [onComplete]);

  if (!achievement) return null;

  const getAchievementIcon = (achievement: any) => {
    // Use the icon from the achievement data if available
    if (achievement.icon) {
      return <div className="text-4xl">{achievement.icon}</div>;
    }
    
    // Fallback based on type
    switch (achievement.type?.toLowerCase()) {
      case 'money': return <Trophy className="w-8 h-8" />;
      case 'users': return <Target className="w-8 h-8" />;
      case 'buildings': return <Crown className="w-8 h-8" />;
      case 'special': return <Star className="w-8 h-8" />;
      default: return <Award className="w-8 h-8" />;
    }
  };

  const getRarityColor = (achievement: any) => {
    // Determine rarity based on reward amount or achievement type
    const reward = achievement.reward || 0;
    
    if (reward >= 1000000) return 'from-purple-500 to-pink-400'; // Diamond
    if (reward >= 500000) return 'from-blue-400 to-cyan-300'; // Platinum  
    if (reward >= 100000) return 'from-yellow-500 to-yellow-300'; // Gold
    if (reward >= 50000) return 'from-gray-400 to-gray-200'; // Silver
    if (reward >= 10000) return 'from-amber-600 to-amber-400'; // Bronze
    
    return 'from-green-500 to-blue-500'; // Default
  };

  const handleDismiss = () => {
    // Force clear all particles immediately
    setParticles([]);
    setAnimationPhase('exit');
    
    setTimeout(() => {
      if (achievement.id) {
        claimAchievement(achievement.id);
      }
      onComplete();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-[70] pointer-events-auto cursor-pointer" onClick={handleDismiss}>
      {/* Particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.life / particle.maxLife,
            transform: `scale(${particle.life / particle.maxLife})`
          }}
        />
      ))}

      {/* Achievement Showcase - Corporate Style */}
      <div className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ${
        animationPhase === 'entrance' ? 'scale-90 opacity-0' :
        animationPhase === 'display' ? 'scale-100 opacity-100' :
        'scale-105 opacity-0'
      }`}>
        <div 
          className="relative w-full max-w-xl p-1 bg-black border-4 border-green-500 shadow-[20px_20px_0_0_rgba(0,0,0,0.5)] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scanning line effect */}
          <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(transparent_0%,rgba(0,255,0,0.2)_50%,transparent_100%)] bg-[length:100%_4px] animate-scanline" />

            <div className="relative z-10 sm:p-8 p-4 border-2 border-green-500/20 bg-black flex flex-col items-center">
            {/* Header Section */}
            <div className="w-full border-b-2 border-green-500/30 pb-4 mb-4 sm:mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <Box className="w-4 h-4 sm:w-6 sm:h-6 text-green-500 animate-pulse" />
                <h2 className="text-sm sm:text-xl font-black italic tracking-tighter text-green-500 font-mono">
                  [ ASSET REGISTERED ]
                </h2>
              </div>
              <div className="text-[8px] sm:text-[10px] font-mono text-green-500/50 text-right uppercase">
                Ref: {achievement.id.substring(0, 12)}...<br />
                Status: Verified
              </div>
            </div>

            {/* Achievement Details */}
            <div className="mb-6 sm:mb-8 text-center space-y-3 sm:space-y-4">
              <div className="inline-block p-4 sm:p-6 bg-green-500/5 border-2 border-green-500/20 rounded-none relative">
                <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 w-3 h-3 sm:w-4 sm:h-4 border-t-2 border-l-2 border-green-500" />
                <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-3 h-3 sm:w-4 sm:h-4 border-b-2 border-r-2 border-green-500" />
                <div className="text-4xl sm:text-6xl mb-1 sm:mb-2 opacity-80">{achievement.icon}</div>
              </div>
              
              <h3 className="text-3xl sm:text-5xl font-black text-white italic uppercase tracking-tighter leading-tight sm:leading-none mb-1 sm:mb-2">
                {achievement.name}
              </h3>
              
              <p className="text-green-500/70 font-mono text-[10px] sm:text-xs max-w-sm mx-auto uppercase italic px-2">
                {achievement.description}
              </p>
            </div>

            {/* Value Section */}
            <div className="w-full bg-green-500 sm:p-6 p-4 flex items-center justify-between shadow-[inset_0_4px_10px_rgba(0,0,0,0.3)]">
              <div className="text-black font-black italic uppercase leading-tight mr-2">
                <div className="text-[10px] sm:text-xs opacity-70">Market Value</div>
                <div className="text-xl sm:text-2xl tracking-tighter">${formatNumber(achievement.reward || 0)}</div>
              </div>
              
              <button 
                onClick={handleDismiss}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-black text-green-500 text-xs sm:text-sm font-black italic uppercase tracking-widest border-2 border-black hover:bg-green-600 hover:text-black transition-colors shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] active:translate-y-1 active:shadow-none whitespace-nowrap"
              >
                SECURE ASSET
              </button>
            </div>

            {/* Hint Section */}
            <div className="mt-4 sm:mt-6 w-full flex justify-between items-center text-[8px] sm:text-[10px] font-mono text-green-500/40 uppercase">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 animate-pulse rounded-full" />
                System ready for transfer
              </div>
              <div className="hidden sm:block">Click to transmit to suitcase</div>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle background overlay */}
      <div className={`absolute inset-0 bg-black/20 transition-opacity duration-1000 ${
        animationPhase === 'entrance' || animationPhase === 'display' ? 'opacity-100' : 'opacity-0'
      }`} />
    </div>
  );
}