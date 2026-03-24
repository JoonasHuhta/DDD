import React from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { Trophy, Star, TrendingUp, Zap, Radio, Target } from 'lucide-react';
import AdaptivePanel from './AdaptivePanel';
import AdaptiveText from './AdaptiveText';

export default function ProgressionPanel({ onClose }: { onClose: () => void }) {
  const { 
    prestigeState,
    unlockedAchievements,
    totalLifetimeIncome,
    totalClicks,
    formatNumber,
    performPrestige,
    getGameStats,
    sessionClicks,
    sessionMoneyEarned,
    sessionUsersGained,
    totalOrbsCollected,
    totalCampaignsUsed,
    totalDataSold,
    resetSessionStats
  } = useMetamanGame();

  const stats = getGameStats();
  const canPrestige = prestigeState.canPrestige;
  const influencePointsGain = Math.floor(Math.sqrt(totalLifetimeIncome / 1e12)) - prestigeState.influencePoints;

  return (
    <AdaptivePanel title="PROGRESSION" onClose={onClose} position="right" icon={<Trophy className="w-5 h-5" />}>
      <div className="space-y-6 pb-20">
        {/* Prestige System */}
        <div className="p-4 bg-[#FF6B35] border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-white">
          <h3 className="text-sm font-black uppercase mb-3 flex items-center gap-2 italic">
            <Star className="w-4 h-4 text-[#FFD700]" />
            Corporate Prestige
          </h3>
          
          <div className="space-y-2 text-[10px] font-black uppercase italic">
            <div className="flex justify-between border-b border-black/20 pb-1">
              <span>Influence:</span>
              <span>{prestigeState.influencePoints} IP</span>
            </div>
            <div className="flex justify-between border-b border-black/20 pb-1">
              <span>Multiplier:</span>
              <span className="text-[#FFD700]">{prestigeState.prestigeMultiplier.toFixed(2)}x</span>
            </div>
            
            {canPrestige ? (
              <div className="mt-4">
                <div className="text-[8px] font-bold text-white/80 mb-2 text-center uppercase">
                  Reset everything for +{influencePointsGain} Influence Points
                </div>
                <button
                  onClick={performPrestige}
                  className="w-full py-3 bg-black text-white border-2 border-white rounded-xl font-black uppercase italic text-xs hover:bg-gray-900 transition-all active:translate-y-1 active:shadow-none shadow-[4px_4px_0_0_rgba(255,255,255,0.2)]"
                >
                  PERFORM PRESTIGE
                </button>
              </div>
            ) : (
              <div className="text-[8px] font-bold text-white/60 mt-4 text-center uppercase tracking-widest bg-black/20 p-2 rounded-lg">
                NEXT PRESTIGE AT $1.00T LIFETIME
              </div>
            )}
          </div>
        </div>

        {/* Lifetime Statistics */}
        <div>
          <h3 className="text-xs font-black uppercase text-black mb-2 px-1 italic">Historical Records</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 bg-white border-4 border-black rounded-xl">
              <div className="text-[8px] font-black text-gray-400 uppercase">Lifetime Rev</div>
              <div className="text-xs font-black text-black">${formatNumber(totalLifetimeIncome)}</div>
            </div>
            <div className="p-3 bg-white border-4 border-black rounded-xl">
              <div className="text-[8px] font-black text-gray-400 uppercase">Total Clicks</div>
              <div className="text-xs font-black text-black">{formatNumber(totalClicks)}</div>
            </div>
          </div>
        </div>

        {/* Session Stats */}
        <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-black uppercase text-black italic flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#4ECDC4]" /> Current Session
            </h3>
            <button 
              onClick={resetSessionStats}
              className="text-[8px] font-black uppercase bg-black text-white px-2 py-1 rounded-lg hover:bg-gray-800"
            >
              Reset
            </button>
          </div>
          
          <div className="space-y-2 text-[10px] font-black uppercase text-black">
            <div className="flex justify-between"><span>Session Money:</span><span>${formatNumber(sessionMoneyEarned || 0)}</span></div>
            <div className="flex justify-between"><span>Citz Lured:</span><span>{formatNumber(sessionUsersGained || 0)}</span></div>
            <div className="flex justify-between"><span>Campaigns:</span><span>{formatNumber(totalCampaignsUsed || 0)}</span></div>
            <div className="flex justify-between font-black text-[#FF6B35]"><span>Data Sold:</span><span>{formatNumber(totalDataSold || 0)}</span></div>
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="p-4 bg-black text-white rounded-2xl border-4 border-black">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] font-black uppercase italic text-[#FFD700]">Corporate Goal</span>
            <span className="text-[10px] font-black">${formatNumber(1e6)} Milestone</span>
          </div>
          <div className="w-full bg-gray-800 border-2 border-white rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#4ECDC4] to-[#FFD700] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (totalLifetimeIncome % 1e6) / 1e6 * 100)}%` }}
            />
          </div>
          <div className="text-right text-[8px] font-black uppercase mt-1 opacity-60">
            {((totalLifetimeIncome % 1e6) / 1e6 * 100).toFixed(1)}% Completed
          </div>
        </div>

        {/* Achievements List */}
        <div>
          <h3 className="text-xs font-black uppercase text-black mb-2 px-1 italic">Special Recognition ({unlockedAchievements.length})</h3>
          <div className="space-y-2">
            {unlockedAchievements.length === 0 ? (
              <div className="p-8 text-center bg-black/5 rounded-2xl border-4 border-dashed border-black/10">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Mission pending...</p>
              </div>
            ) : (
              unlockedAchievements.map(achievement => (
                <div key={achievement.id} className="p-3 bg-white border-4 border-black rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)] flex items-center gap-3">
                  <Trophy className="w-4 h-4 text-[#FFD700]" />
                  <div>
                    <div className="text-[10px] font-black uppercase leading-none">{achievement.name}</div>
                    <div className="text-[8px] font-bold text-gray-500 uppercase mt-0.5">{achievement.reward.description}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdaptivePanel>
  );
}