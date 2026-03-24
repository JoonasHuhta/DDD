import React, { useState } from 'react';
import { Zap, Sparkles, Target, Gamepad2, Timer, Diamond, Eye } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import AdaptivePanel from './AdaptivePanel';
import AdaptiveText from './AdaptiveText';

interface LightningCampaign {
  id: string;
  name: string;
  description: string;
  cost: number;
  currency: 'orbs' | 'diamonds';
  effect: string;
  bonus: number;
  duration: number;
  minigame: 'lightning_tap' | 'puzzle_solve' | 'timing_challenge';
  icon: React.ReactNode;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function LuringLab({ onClose }: { onClose: () => void }) {
  const { 
    dataInventory,
    formatNumber
  } = useMetamanGame();

  const [activeMinigame, setActiveMinigame] = useState<string | null>(null);
  const [lightningProgress, setLightningProgress] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState<{[key: string]: number}>({});

  const lightningCampaigns: LightningCampaign[] = [
    {
      id: 'viral_storm',
      name: 'Viral Storm',
      description: 'Rapid user acquisition content',
      cost: 300,
      currency: 'orbs',
      effect: '+50% lure rate for 1h',
      bonus: 50,
      duration: 1,
      minigame: 'lightning_tap',
      difficulty: 'easy',
      icon: <Zap className="w-5 h-5 text-yellow-400" />
    },
    {
      id: 'diamond_dash',
      name: 'Diamond Dash',
      description: 'Premium growth boost',
      cost: 500,
      currency: 'diamonds',
      effect: '+75% passive gain for 2h',
      bonus: 75,
      duration: 2,
      minigame: 'puzzle_solve',
      difficulty: 'medium',
      icon: <Diamond className="w-5 h-5 text-purple-400" />
    },
    {
      id: 'hypnotic_wave',
      name: 'Hypnotic Wave',
      description: 'Advanced psychological campaign',
      cost: 800,
      currency: 'diamonds',
      effect: '+100% effectiveness for 3h',
      bonus: 100,
      duration: 3,
      minigame: 'timing_challenge',
      difficulty: 'hard',
      icon: <Eye className="w-5 h-5 text-pink-500" />
    }
  ];

  const playLightningTap = (campaign: LightningCampaign) => {
    setActiveMinigame(campaign.id);
    setLightningProgress(0);
    
    const interval = setInterval(() => {
      setLightningProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          completeCampaign(campaign);
          setActiveMinigame(null);
          return 100;
        }
        return prev + Math.random() * 5;
      });
    }, 100);
  };

  const completeCampaign = (campaign: LightningCampaign) => {
    const newActiveCampaigns = { ...activeCampaigns };
    newActiveCampaigns[campaign.id] = Date.now() + (campaign.duration * 60 * 60 * 1000);
    setActiveCampaigns(newActiveCampaigns);
  };

  const getCostAffordable = (campaign: LightningCampaign) => {
    if (campaign.currency === 'diamonds') {
      const availableDiamonds = Math.floor(dataInventory / 100);
      return availableDiamonds >= campaign.cost;
    }
    return dataInventory >= campaign.cost;
  };

  const getActiveCampaignTimeRemaining = (campaignId: string) => {
    const expiryTime = activeCampaigns[campaignId];
    if (!expiryTime || Date.now() > expiryTime) return 0;
    return Math.ceil((expiryTime - Date.now()) / (60 * 60 * 1000));
  };

  return (
    <AdaptivePanel title="LURING LAB" onClose={onClose} position="center" icon={<Sparkles className="w-5 h-5" />}>
      {/* Minigame Overlay (Internal to scope) */}
      {activeMinigame && (
        <div className="absolute inset-0 bg-black/90 z-20 flex flex-col items-center justify-center p-6 text-center">
          <h3 className="text-xl font-black text-[#FFD700] uppercase italic mb-4">Lightning Challenge!</h3>
          <div className="w-full bg-gray-800 border-4 border-black rounded-full h-8 overflow-hidden mb-6">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-full transition-all duration-100"
              style={{ width: `${lightningProgress}%` }}
            />
          </div>
          <button
            onMouseDown={() => setLightningProgress(prev => Math.min(100, prev + 5))}
            className="w-32 h-32 bg-yellow-400 border-8 border-black rounded-full flex items-center justify-center animate-pulse active:scale-95 transition-transform"
          >
            <Zap className="w-12 h-12 text-black fill-black" />
          </button>
          <p className="mt-4 text-xs font-black text-white uppercase italic">Tap to charge!</p>
        </div>
      )}

      <div className="space-y-6 pb-20">
        {/* Resource Header */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="text-[10px] font-black text-gray-500 uppercase">Orbs</div>
            <div className="text-2xl font-black text-black">{dataInventory}</div>
          </div>
          <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="text-[10px] font-black text-gray-500 uppercase">Diamonds</div>
            <div className="text-2xl font-black text-purple-600">{Math.floor(dataInventory / 100)}</div>
          </div>
        </div>

        {/* Campaigns */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase text-black mb-2 px-1 italic">Lightning Operations</h3>
          {lightningCampaigns.map(campaign => {
            const canAfford = getCostAffordable(campaign);
            const timeRemaining = getActiveCampaignTimeRemaining(campaign.id);
            const isActive = timeRemaining > 0;
            
            return (
              <div 
                key={campaign.id}
                className={`p-4 bg-white border-4 border-black rounded-22 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all ${
                  isActive ? 'border-[#FFD700]' : 'border-black'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black rounded-xl text-white">
                      {campaign.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-xs uppercase tracking-tighter">{campaign.name}</h4>
                      <div className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full inline-block border-2 border-black mt-1 ${
                        campaign.difficulty === 'easy' ? 'bg-green-400' :
                        campaign.difficulty === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                      }`}>
                        {campaign.difficulty}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-black italic">
                      {campaign.cost} {campaign.currency === 'diamonds' ? '💎' : 'orb'}
                    </div>
                    <div className="text-[8px] font-bold text-gray-500 uppercase">{campaign.duration}H STRENGTH</div>
                  </div>
                </div>

                <div className="text-[10px] font-bold text-gray-600 uppercase italic mb-4 leading-none">
                  {campaign.description} • <span className="text-yellow-600 font-black">{campaign.effect}</span>
                </div>

                {isActive ? (
                  <div className="w-full py-2 bg-[#FFD700] border-4 border-black rounded-xl flex items-center justify-center gap-2">
                    <Timer className="w-4 h-4 text-black animate-spin-slow" />
                    <span className="text-[10px] font-black uppercase italic">{timeRemaining}H REMAINING</span>
                  </div>
                ) : (
                  <button
                    onClick={() => playLightningTap(campaign)}
                    disabled={!canAfford}
                    className={`w-full py-3 border-4 border-black rounded-xl font-black uppercase italic text-xs transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none ${
                      canAfford ? 'bg-[#4ECDC4] hover:bg-cyan-400' : 'bg-gray-200 text-gray-400 grayscale'
                    }`}
                  >
                    START CHALLENGE
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Guide */}
        <div className="p-4 bg-black text-white rounded-2xl border-4 border-black">
          <h4 className="text-xs font-black uppercase mb-2 text-[#FFD700]">Lightning Protocol</h4>
          <ul className="text-[8px] font-bold space-y-1 opacity-90 uppercase tracking-tighter">
            <li>• Campaigns provide massive temporary scaling</li>
            <li>• Minigames required for successful activation</li>
            <li>• High difficulty = High performance</li>
            <li>• All effects are additive</li>
          </ul>
        </div>
      </div>
    </AdaptivePanel>
  );
}