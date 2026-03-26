import React, { useEffect, useMemo } from 'react';
import { DollarSign, Users, Shield, Zap, Box } from 'lucide-react';

interface Effect {
  id: number;
  type: 'money' | 'users' | 'purchase' | 'achievement' | 'crisis';
  x: number;
  y: number;
  duration: number;
  intensity: 'low' | 'medium' | 'high' | 'extreme';
  color?: string;
  value?: string | number;
}

interface VisualEffectsProps {
  effects: Effect[];
  onEffectComplete: (id: number) => void;
}

// Optimization: Memoize individual effects to prevent re-renders
const VisualEffectItem = React.memo(({ effect, onComplete }: { effect: Effect, onComplete: (id: number) => void }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(effect.id), effect.duration);
    return () => clearTimeout(timer);
  }, [effect, onComplete]);

  const baseClasses = "absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 will-change-transform";
  
  // Custom fast bounce and fade out animation
  const effectStyle = { 
    left: effect.x, 
    top: effect.y,
    animation: `fastBounce 0.4s ease-in-out infinite alternate, fadeOutEffect ${effect.duration}ms ease-out forwards`
  };

  const renderParticles = (count: number, color: string) => {
    return (
      <div className="absolute inset-0">
        {[...Array(count)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full animate-ping ${color}`}
            style={{
              width: '4px',
              height: '4px',
              left: `${Math.random() * 40 - 20}px`, // Corrected 'h.random()' to 'Math.random()'
              top: `${Math.random() * 40 - 20}px`,
              animationDelay: `${Math.random() * 0.5}s`,
              animationDuration: `${0.4 + Math.random() * 0.4}s`
            }}
          />
        ))}
      </div>
    );
  };

  switch (effect.type) {
    case 'money':
      const isLoss = effect.color === 'red' || (typeof effect.value === 'string' && effect.value.startsWith('-'));
      const colorClass = effect.color === 'red' ? 'text-red-500' : 'text-green-400';
      const borderColor = effect.color === 'red' ? 'border-red-500/40' : 'border-green-500/40';
      const glowColor = effect.color === 'red' ? 'shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'shadow-[0_0_15px_rgba(34,197,94,0.4)]';

      return (
        <div className={baseClasses} style={effectStyle}>
          <div className={`flex items-center gap-1 bg-black/95 border ${borderColor} rounded-full px-3 py-1 scale-75 md:scale-100 ${glowColor}`}>
            <DollarSign className={`w-3 h-3 md:w-4 h-4 ${colorClass}`} />
            <span className={`text-xs md:text-sm font-black whitespace-nowrap font-mono ${colorClass}`}>{effect.value || '+'}</span>
          </div>
          {renderParticles(effect.intensity === 'extreme' ? 8 : 4, isLoss ? 'bg-red-500' : 'bg-yellow-400')}
        </div>
      );

    case 'users':
      return (
        <div className={baseClasses} style={effectStyle}>
          <div className={`flex items-center gap-1 bg-black/95 border ${effect.color === 'red' ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.4)]'} rounded-full px-3 py-1 scale-75 md:scale-100`}>
            <Users className={`w-3 h-3 md:w-4 h-4 ${effect.color === 'red' ? 'text-red-500' : 'text-blue-400'}`} />
            <span className={`text-xs md:text-sm font-black whitespace-nowrap font-mono ${effect.color === 'red' ? 'text-red-500' : 'text-blue-400'}`}>{effect.value || '+USERS'}</span>
          </div>
          {renderParticles(5, effect.color === 'red' ? 'bg-red-500' : 'bg-blue-400')}
        </div>
      );

    case 'purchase':
      return (
        <div className={baseClasses} style={effectStyle}>
          <div className="relative">
            <Zap className="w-8 h-8 animate-ping text-purple-400" />
            {renderParticles(10, 'bg-purple-400')}
          </div>
        </div>
      );

    case 'achievement':
      return (
        <div className={baseClasses} style={{...effectStyle, animation: `achievementEntrance 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`}}>
          <div className="relative">
            <div className="w-12 h-12 bg-yellow-400/20 border-2 border-yellow-400 rounded-lg animate-spin rotate-45 flex items-center justify-center">
               <Shield className="w-6 h-6 text-yellow-400 -rotate-45" />
            </div>
            <div className="absolute inset-x-0 -top-8 text-center">
              <span className="text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-black px-2 py-0.5 whitespace-nowrap shadow-[0_0_10px_rgba(250,204,21,0.5)]">
                ASSET SECURED
              </span>
            </div>
            {renderParticles(15, 'bg-yellow-400')}
          </div>
        </div>
      );

    case 'crisis': // Added new 'crisis' effect type
      return (
        <div className={baseClasses} style={{...effectStyle, animation: `crisisPulse 1s ease-in-out infinite alternate`}}>
          <div className="relative p-4 bg-red-800/80 border-2 border-red-500 rounded-lg shadow-xl text-center">
            <div className="text-white font-black text-3xl uppercase whitespace-nowrap animate-pulse">
              🚨 PR DISASTER! 🚨 SCANDALS! 🚨 DEFEND THE HQ! 🚨 STOCK PRICES PLUMMETING! 🚨
            </div>
            {renderParticles(effect.intensity === 'extreme' ? 20 : 10, 'bg-red-500')}
          </div>
        </div>
      );

    default:
      return null;
  }
});

VisualEffectItem.displayName = 'VisualEffectItem';

const VisualEffects = ({ effects, onEffectComplete }: VisualEffectsProps) => {
  const visibleEffects = useMemo(() => effects.slice(-15), [effects]); // Limit slightly more for performance

  return (
    <div 
      className="absolute inset-0 overflow-hidden z-30 pointer-events-none"
      data-visual-effects="true"
    >
      {visibleEffects.map(effect => (
        <VisualEffectItem 
          key={effect.id} 
          effect={effect} 
          onComplete={onEffectComplete} 
        />
      ))}
      
      <style>{`
        @keyframes fastBounce {
          from { transform: translateY(0); }
          to { transform: translateY(-15px); }
        }
        @keyframes fadeOutEffect {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          15% { opacity: 1; transform: scale(1) translateY(0); }
          80% { opacity: 1; transform: scale(1) translateY(0); }
          100% { opacity: 0; transform: scale(1.1) translateY(-20px); }
        }
        @keyframes achievementEntrance {
          0% { transform: scale(0) rotate(-180deg); opacity: 0; }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default React.memo(VisualEffects);