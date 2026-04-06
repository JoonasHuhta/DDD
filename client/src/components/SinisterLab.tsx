import React, { useState, useMemo } from 'react';
import { Zap, Diamond, Pickaxe, Star, Sparkles, Lock, Timer, Ghost, TrendingUp, Cpu, Globe, Infinity, Activity } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { getStage } from '../lib/utils/stageSystem';
import AdaptivePanel from './AdaptivePanel';

// Icon mapping based on gem type to avoid storing React nodes in state
const getGemIcon = (type: string) => {
  switch (type) {
    case 'speed': return <Zap className="w-5 h-5" />;
    case 'power': return <Star className="w-5 h-5" />;
    case 'collection': return <Diamond className="w-5 h-5" />;
    case 'efficiency': return <Sparkles className="w-5 h-5" />;
    case 'influence': return <Star className="w-5 h-5 text-yellow-400" />;
    case 'lucky': return <Sparkles className="w-5 h-5 text-green-400" />;
    case 'viral': return <Zap className="w-5 h-5 text-purple-400" />;
    case 'chaos': return <Sparkles className="w-5 h-5 text-rainbow" />;
    case 'corrupt': return <Pickaxe className="w-5 h-5 text-red-600" />;
    case 'reality': return <Star className="w-5 h-5 text-rainbow" />;
    case 'temporal': return <Zap className="w-5 h-5 text-cyan-400" />;
    case 'meta': return <Diamond className="w-5 h-5 text-gold" />;
    // Endgame types
    case 'quantum': return <Timer className="w-5 h-5 text-blue-300" />;
    case 'void': return <Ghost className="w-5 h-5 text-purple-900" />;
    case 'ratio': return <TrendingUp className="w-5 h-5 text-amber-500" />;
    case 'neural': return <Cpu className="w-5 h-5 text-green-500" />;
    case 'market': return <Globe className="w-5 h-5 text-blue-600" />;
    case 'scale': return <Infinity className="w-5 h-5 text-indigo-500" />;
    case 'matter': return <Activity className="w-5 h-5 text-red-900" />;
    default: return <Diamond className="w-5 h-5" />;
  }
};

interface DiamondGem {
  id: string;
  type: string;
  name: string;
  description: string;
  color: string;
  modifier: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface SinisterLabProps {
  onClose: () => void;
}

export default function SinisterLab({ onClose }: SinisterLabProps) {
  const { 
    dataInventory, 
    sinisterLab,
    addGemToInventory,
    addGemToSlot,
    removeGemFromSlot,
    addDiscoveredGem,
    incrementOrbBreakCount,
    setDataInventory,
    users
  } = useMetamanGame();
  
  const [orbBreakAnimation, setOrbBreakAnimation] = useState<number | null>(null);
  
  const currentStage = getStage(users);
  const slots = (sinisterLab?.slots || [null, null, null, null]) as (DiamondGem | null)[];
  const inventory = (sinisterLab?.inventory || []) as DiamondGem[];
  const discoveredItems = (sinisterLab?.discoveredItems || []) as DiamondGem[];
  const orbBreakCount = sinisterLab?.orbBreakCount || 0;

  // Expanded laboratory item pool (Endgame Gems added)
  const diamondTypes: Omit<DiamondGem, 'id'>[] = [
    { type: 'speed', name: 'Speed Crystal', description: 'Generates users/sec', color: 'text-blue-400', modifier: 5, rarity: 'common' },
    { type: 'power', name: 'Basic Amplifier', description: '+15% click power', color: 'text-gray-400', modifier: 15, rarity: 'common' },
    { type: 'collection', name: 'Data Magnet', description: '+20% collection rate', color: 'text-cyan-400', modifier: 20, rarity: 'common' },
    { type: 'speed', name: 'Power Ruby', description: 'Generates 10 users/sec', color: 'text-red-400', modifier: 10, rarity: 'rare' },
    { type: 'efficiency', name: 'Focus Sapphire', description: '+35% efficiency', color: 'text-blue-500', modifier: 35, rarity: 'rare' },
    { type: 'influence', name: 'Charm Topaz', description: '+50% influence', color: 'text-orange-400', modifier: 50, rarity: 'rare' },
    { type: 'lucky', name: 'Lucky Emerald', description: '+60% orb drop', color: 'text-green-400', modifier: 60, rarity: 'epic' },
    { type: 'viral', name: 'Viral Diamond', description: '+75% campaign boost', color: 'text-yellow-400', modifier: 75, rarity: 'epic' },
    { type: 'chaos', name: 'Chaos Prism', description: 'Random +100% bonus', color: 'text-purple-400', modifier: 100, rarity: 'epic' },
    { type: 'corrupt', name: 'Corrupt Onyx', description: '+200% energy', color: 'text-purple-600', modifier: 200, rarity: 'legendary' },
    { type: 'reality', name: 'Reality Shard', description: '+500% ALL stats', color: 'text-pink-500', modifier: 500, rarity: 'legendary' },
    { type: 'temporal', name: 'Time Crystal', description: '2x passive income', color: 'text-cyan-300', modifier: 100, rarity: 'legendary' },
    { type: 'meta', name: 'Dan Core', description: 'Ultimate power', color: 'text-yellow-500', modifier: 1000, rarity: 'legendary' },
    // NEW ENDGAME GEMS
    { type: 'quantum', name: 'Quantum Loop', description: 'Exponential user lures', color: 'text-cyan-100', modifier: 250, rarity: 'legendary' },
    { type: 'void', name: 'Void Pulse', description: 'Dampens heat spike', color: 'text-indigo-900', modifier: 15, rarity: 'legendary' },
    { type: 'ratio', name: 'Golden Ratio', description: 'Stage-scaling income', color: 'text-amber-600', modifier: 20, rarity: 'legendary' },
    { type: 'neural', name: 'Neural Overload', description: 'Auto-clicker active', color: 'text-green-600', modifier: 300, rarity: 'legendary' },
    { type: 'market', name: 'Market Manipulator', description: '+50% Data Prices', color: 'text-blue-700', modifier: 50, rarity: 'legendary' },
    { type: 'scale', name: 'Infinite Scale', description: 'User count boost', color: 'text-indigo-600', modifier: 500, rarity: 'legendary' },
    { type: 'matter', name: 'Dark Matter', description: 'Void energy generation', color: 'text-red-950', modifier: 100, rarity: 'legendary' }
  ];

  const breakOrbForGems = () => {
    if (dataInventory < 50) return;
    
    setOrbBreakAnimation(Date.now());
    setDataInventory(dataInventory - 50);
    incrementOrbBreakCount();
    
    setTimeout(() => {
      const roll = Math.random() * 100;
      let targetRarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
      
      if (roll < 0.5 && orbBreakCount >= 100) targetRarity = 'legendary';
      else if (roll < 5) targetRarity = 'epic';
      else if (roll < 15) targetRarity = 'rare';
      
      const pool = diamondTypes.filter(g => g.rarity === targetRarity);
      const lootTemplate = pool[Math.floor(Math.random() * pool.length)];
      
      if (lootTemplate) {
        const newGem: DiamondGem = {
          ...lootTemplate,
          id: `${lootTemplate.type}_${Date.now()}`
        };
        
        addDiscoveredGem(newGem);
        const emptySlot = slots.findIndex((s, idx) => {
          if (idx === 1 && currentStage < 3) return false;
          if (idx === 2 && currentStage < 5) return false;
          if (idx === 3 && currentStage < 8) return false;
          return s === null;
        });
        
        if (emptySlot !== -1) addGemToSlot(newGem, emptySlot);
        else addGemToInventory(newGem);
      }
      
      setOrbBreakAnimation(null);
    }, 800);
  };

  const getRarityClass = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 border-gray-400 text-gray-800';
      case 'rare': return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'epic': return 'bg-purple-100 border-purple-400 text-purple-800';
      case 'legendary': return 'bg-amber-100 border-amber-400 text-amber-800 animate-pulse';
      default: return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const slotRequirements = [1, 3, 5, 8];

  return (
    <AdaptivePanel title="SINISTER LAB" onClose={onClose}>
      <div className="space-y-6 pb-20 px-2 lg:px-4">
        {/* Lab Header/Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="text-[10px] font-black text-gray-500 uppercase">Data Orbs</div>
            <div className="text-2xl font-black text-black">{Math.floor(dataInventory)}</div>
          </div>
          <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="text-[10px] font-black text-gray-500 uppercase">Discoveries</div>
            <div className="text-2xl font-black text-black">{discoveredItems.length}</div>
          </div>
        </div>

        {/* Break Orb Action */}
        <div className="relative">
          <button
            onClick={breakOrbForGems}
            disabled={dataInventory < 50 || !!orbBreakAnimation}
            className={`w-full py-6 rounded-2xl border-4 border-black font-black uppercase italic tracking-widest text-xl transition-all shadow-[6px_6px_0_0_rgba(0,0,0,1)] ${
              dataInventory < 50 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-[#FF6B35] text-white hover:bg-[#FF8B55] active:translate-x-1 active:translate-y-1 active:shadow-none'
            }`}
          >
            {orbBreakAnimation ? 'SHATTERING...' : 'BREAK ORB (50)'}
            {!orbBreakAnimation && dataInventory >= 50 && (
              <Sparkles className="absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 animate-spin-slow" />
            )}
          </button>
        </div>

        {/* Equipment Slots */}
        <div>
          <h3 className="text-sm font-black text-black uppercase mb-3 px-1 italic">Active Augments</h3>
          <div className="grid grid-cols-4 gap-3">
            {slots.map((gem, i) => {
              const isLocked = currentStage < slotRequirements[i];
              return (
                <button
                  key={i}
                  disabled={isLocked}
                  onClick={() => gem && removeGemFromSlot(i)}
                  className={`aspect-square rounded-2xl border-4 border-black flex flex-col items-center justify-center transition-all p-1 relative ${
                    isLocked 
                      ? 'bg-black/20 border-black/10 grayscale cursor-not-allowed'
                      : gem 
                        ? `bg-white hover:bg-red-50 hover:border-red-600 group shadow-[4px_4px_0_0_rgba(0,0,0,1)]` 
                        : 'bg-black/5 border-dashed opacity-40 hover:opacity-100'
                  }`}
                >
                  {isLocked ? (
                    <div className="flex flex-col items-center gap-1">
                      <Lock className="w-5 h-5 text-black/40" />
                      <span className="text-[7px] font-black uppercase">St. {slotRequirements[i]}</span>
                    </div>
                  ) : gem ? (
                    <>
                      <div className={gem.color}>{getGemIcon(gem.type)}</div>
                      <div className="text-[7px] font-black text-black truncate w-full text-center px-1 uppercase">
                        {gem.name}
                      </div>
                      <div className="text-[9px] font-black text-green-600">+{gem.modifier}%</div>
                      <div className="hidden group-hover:flex absolute inset-0 bg-red-600/90 rounded-xl items-center justify-center text-white text-[9px] font-black uppercase">
                        REMOVE
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center opacity-30">
                      <Pickaxe className="w-6 h-6 text-black" />
                      <span className="text-[6px] font-black uppercase mt-1">Empty Slot</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Inventory */}
        <div>
          <h3 className="text-sm font-black text-black uppercase mb-3 px-1 italic">
            Inventory ({inventory.length})
          </h3>
          {inventory.length === 0 ? (
            <div className="p-8 text-center bg-black/5 rounded-2xl border-4 border-dashed border-black/10">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Your lab is empty...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {inventory.map((gem) => (
                <button
                  key={gem.id}
                  onClick={() => {
                    const emptySlot = slots.findIndex((s, idx) => {
                      if (idx === 1 && currentStage < 3) return false;
                      if (idx === 2 && currentStage < 5) return false;
                      if (idx === 3 && currentStage < 8) return false;
                      return s === null;
                    });
                    if (emptySlot !== -1) addGemToSlot(gem, emptySlot);
                  }}
                  className={`p-3 rounded-2xl border-4 border-black text-left transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${getRarityClass(gem.rarity)}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={gem.color}>{getGemIcon(gem.type)}</div>
                    <div className="font-black text-[10px] leading-none uppercase truncate">{gem.name}</div>
                  </div>
                  <div className="text-[8px] font-bold opacity-80 leading-none mb-1">{gem.description}</div>
                  <div className="text-[10px] font-black uppercase italic">+{gem.modifier}%</div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lab Guide */}
        <div className="p-4 bg-black text-white rounded-2xl border-4 border-black">
          <h4 className="text-xs font-black uppercase mb-2 text-[#FFD700]">Laboratory Protocol</h4>
          <ul className="text-[9px] font-bold space-y-1 opacity-90 uppercase tracking-tighter">
            <li>• Shatter orbs for rare augmentations</li>
            <li>• Maximum 4 active augments (Gate: St. 3, 5, 8)</li>
            <li>• Legendary finds require 100+ breaks</li>
            <li>• Removal restores items to inventory</li>
          </ul>
        </div>
      </div>
    </AdaptivePanel>
  );
}