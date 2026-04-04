import React, { useEffect, useState } from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { Zap, Users, Target, Eye, Heart } from 'lucide-react';
import { useResponsiveUI } from '../hooks/useResponsiveUI';
import { motion, AnimatePresence } from 'framer-motion';

interface CampaignEffect {
  id: string;
  x: number;
  y: number;
  campaignType: string;
  createdAt: number;
  users: number;
}

export default function CampaignVisualEffects() {
  const [effects, setEffects] = useState<CampaignEffect[]>([]);
  const { selectedCampaign, campaignCharges, getMaxCampaignCharges } = useMetamanGame();
  const responsive = useResponsiveUI();
  const maxCharges = getMaxCampaignCharges();

  // Campaign icons and colors - match actual campaign IDs
  const campaignVisuals = {
    social_feed: { icon: Heart, color: 'text-blue-400', bg: 'bg-blue-500' },
    viral_challenge: { icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500' },
    addiction_algorithm: { icon: Target, color: 'text-pink-400', bg: 'bg-pink-500' },
    underage_targeting: { icon: Eye, color: 'text-red-400', bg: 'bg-red-500' },
  };

  // Listen for campaign casts - BASEMENT DOM FIX: Safe basement detection
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      try {
        // CRITICAL DOM FIX: Safe basement mode detection to prevent DOM errors
        const target = event.target as HTMLElement;
        
        // Safe basement detection with null checks
        const basementContainer = document.querySelector('[data-basement-mode="true"]');
        const isInBasement = basementContainer !== null;
        
        if (isInBasement) {
          console.log('Campaign effects disabled in basement mode - preventing DOM conflicts');
          return; // Prevent DOM manipulation conflicts in basement
        }
      } catch (error) {
        console.warn('Safe basement detection failed:', error);
        return; // Fail safe - don't add effects if DOM state is unclear
      }
      
      if (selectedCampaign && campaignCharges > 0) {
        try {
          // BASEMENT DOM FIX: Safe canvas access with error handling
          const canvas = document.querySelector('canvas');
          const rect = canvas?.getBoundingClientRect();
          
          // Additional safety checks for DOM state
          if (rect && canvas && event.target === canvas && canvas.parentNode) {
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // SAFE: Only add effects if DOM structure is stable
            const effect: CampaignEffect = {
              id: Math.random().toString(36).substr(2, 9),
              x,
              y,
              campaignType: selectedCampaign,
              createdAt: Date.now(),
              users: Math.floor(Math.random() * 5) + 1,
            };
            
            setEffects(prev => [...prev, effect]);
          }
        } catch (domError) {
          console.warn('Safe campaign effect creation failed:', domError);
          // Fail safe - don't crash the game if DOM is unstable
        }
      }
    };

    // BASEMENT DOM FIX: Safe event listener management
    try {
      const canvas = document.querySelector('canvas');
      if (canvas && canvas.parentNode) {
        canvas.addEventListener('click', handleClick);
        return () => {
          try {
            canvas.removeEventListener('click', handleClick);
          } catch (cleanup) {
            console.warn('Campaign effect cleanup failed safely:', cleanup);
          }
        };
      }
    } catch (listenerError) {
      console.warn('Campaign effect listener setup failed safely:', listenerError);
    }
  }, [selectedCampaign, campaignCharges]);

  // PERFORMANCE FIX: Use requestAnimationFrame instead of setInterval
  useEffect(() => {
    let animationFrame: number;
    
    const cleanupEffects = () => {
      setEffects(prev => {
        const filtered = prev.filter(effect => Date.now() - effect.createdAt < 1500); // Reduced duration
        
        // PERFORMANCE: Limit maximum effects to prevent lag
        if (filtered.length > 10) {
          return filtered.slice(-10); // Keep only the latest 10 effects
        }
        return filtered;
      });
      
      animationFrame = requestAnimationFrame(cleanupEffects);
    };
    
    cleanupEffects();
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-20"
      data-campaign-effects="true"
    >
      {effects.map(effect => {
        const visual = campaignVisuals[effect.campaignType as keyof typeof campaignVisuals];
        const Icon = visual?.icon || Zap;
        const age = Date.now() - effect.createdAt;
        const opacity = Math.max(0, 1 - age / 1500); // Faster fade out for performance
        const scale = Math.min(1.2, 0.5 + age / 800);  // Reduced scale for performance
        
        return (
          <div
            key={effect.id}
            className="absolute animate-pulse"
            style={{
              left: effect.x - 20,
              top: effect.y - 20,
              opacity,
              transform: `scale(${scale})`,
              transition: 'all 0.5s ease-out',
            }}
          >
            {/* Ripple effect */}
            <div 
              className={`absolute inset-0 rounded-full border-2 ${visual?.color || 'border-blue-400'} animate-ping`}
              style={{
                width: '40px',
                height: '40px',
                animation: `ping 1s cubic-bezier(0, 0, 0.2, 1) infinite`,
              }}
            />
            
            {/* Campaign icon */}
            <div className={`w-10 h-10 rounded-full ${visual?.bg || 'bg-blue-500'} bg-opacity-80 flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            
            {/* User count indicator */}
            <motion.div 
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], y: -20 }}
              transition={{ duration: 0.8 }}
              className="absolute -top-4 left-1/2 -translate-x-1/2 text-green-400 font-bold text-sm pointer-events-none whitespace-nowrap"
            >
              +{effect.users} citizens
            </motion.div>
          </div>
        );
      })}
      
      {/* Comic-Style Active Campaign Sticker - Refined Scale and Position */}
      {selectedCampaign && (
        <div className={`absolute ${
          responsive.isMobile 
            ? 'bottom-2 left-2' // Below the bottom menu on mobile
            : 'bottom-4 left-4' // Corner on desktop
        } bg-[#FFD700] rounded-xl border-[3px] border-black p-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)] flex flex-col items-center min-w-[110px] -rotate-2 origin-bottom-left transition-all z-50 pointer-events-auto transform scale-80`}>
          <div className="flex flex-col items-center">
            <div className="font-black text-black uppercase text-[11px] tracking-tighter text-center leading-tight mb-1">
              {selectedCampaign.replace(/_/g, ' ').split(' ').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </div>
            
            <div className={`flex items-center gap-1 font-black text-lg px-2 rounded-lg border-2 border-black ${
              campaignCharges > 0 ? 'bg-white text-black' : 'bg-[#FF1744] text-white'
            }`}>
              {(() => {
                const visual = campaignVisuals[selectedCampaign as keyof typeof campaignVisuals];
                const Icon = visual?.icon || Zap;
                return <Icon className={`w-4 h-4 ${campaignCharges > 0 ? (visual?.color || 'text-purple-500') : 'text-white'}`} />;
              })()}
              <span>{campaignCharges}/{maxCharges}</span>
            </div>
            {campaignCharges === 0 && (
              <div className="text-[9px] uppercase font-black text-[#FF1744] bg-white px-1 border-2 border-black rounded mt-1 animate-pulse">
                DEPLETED
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}