import React from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { Zap, Target, Award, Star, Lock } from 'lucide-react';
import AdaptivePanel from './AdaptivePanel';
import AdaptiveText from './AdaptiveText';

export default function SynergyUpgradesPanel({ onClose }: { onClose: () => void }) {
  const { 
    income,
    prestigeState,
    synergySystem,
    formatNumber,
    purchaseSynergyUpgrade,
    getGameStats
  } = useMetamanGame();

  const stats = getGameStats();
  const availableUpgrades = synergySystem?.getAvailableUpgrades(stats) || [];
  const unclaimedMilestones = synergySystem?.getUnclaimedMilestones(stats) || [];

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'synergy': return <Zap className="w-4 h-4" />;
      case 'conditional': return <Target className="w-4 h-4" />;
      case 'milestone': return <Award className="w-4 h-4" />;
      case 'prestige': return <Star className="w-4 h-4" />;
      default: return <Zap className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (type: string) => {
    switch (type) {
      case 'synergy': return 'text-blue-500';
      case 'conditional': return 'text-yellow-600';
      case 'milestone': return 'text-green-600';
      case 'prestige': return 'text-purple-600';
      default: return 'text-gray-500';
    }
  };

  const handlePurchase = (upgradeId: string) => {
    if (purchaseSynergyUpgrade) {
      purchaseSynergyUpgrade(upgradeId);
    }
  };

  const canAffordUpgrade = (upgrade: any): boolean => {
    if (upgrade.type === 'prestige') {
      return prestigeState.influencePoints >= upgrade.cost;
    }
    return income >= upgrade.cost;
  };

  return (
    <AdaptivePanel title="ADVANCED UPGRADES" onClose={onClose} position="right" icon={<Zap className="w-5 h-5 text-blue-500" />}>
      <div className="space-y-6 pb-20">
        {/* Currency Display */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white border-4 border-black rounded-xl text-center">
            <div className="text-[8px] font-black text-gray-500 uppercase">Capital</div>
            <div className="text-xs font-black text-green-600">${formatNumber(income)}</div>
          </div>
          <div className="p-3 bg-white border-4 border-black rounded-xl text-center">
            <div className="text-[8px] font-black text-gray-500 uppercase">Influence</div>
            <div className="text-xs font-black text-purple-600">{prestigeState.influencePoints} IP</div>
          </div>
        </div>

        {/* Milestones */}
        {unclaimedMilestones.length > 0 && (
          <div className="p-4 bg-green-50 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <h3 className="text-[10px] font-black uppercase text-green-700 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" /> Ready for Claim!
            </h3>
            <div className="space-y-3">
              {unclaimedMilestones.map(m => (
                <div key={m.id} className="border-l-4 border-green-400 pl-3">
                  <div className="text-[10px] font-black uppercase leading-none">{m.name}</div>
                  <div className="text-[8px] font-bold text-gray-500 uppercase mt-1">{m.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Upgrades */}
        <div>
          <h3 className="text-xs font-black uppercase text-black mb-2 px-1 italic">Synergy Matrix</h3>
          <div className="space-y-4">
            {availableUpgrades.length === 0 ? (
              <div className="p-8 text-center bg-black/5 rounded-2xl border-4 border-dashed border-black/10">
                <Lock className="w-10 h-10 text-black/10 mx-auto mb-2" />
                <p className="text-[10px] font-bold text-gray-400 uppercase">No synergies detected...</p>
              </div>
            ) : (
              availableUpgrades.map(upgrade => {
                const canAfford = canAffordUpgrade(upgrade);
                const isPrestige = upgrade.type === 'prestige';

                return (
                  <div 
                    key={upgrade.id}
                    className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 bg-gray-100 border-2 border-black rounded-xl ${getCategoryColor(upgrade.type)}`}>
                          {getCategoryIcon(upgrade.type)}
                        </div>
                        <div>
                          <h4 className="text-[10px] font-black uppercase leading-none">{upgrade.name}</h4>
                          <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{upgrade.type}</span>
                        </div>
                      </div>
                      <div className={`text-[10px] font-black italic ${canAfford ? 'text-green-600' : 'text-red-600'}`}>
                        {isPrestige ? `${upgrade.cost} IP` : `$${formatNumber(upgrade.cost)}`}
                      </div>
                    </div>

                    <p className="text-[9px] font-bold text-gray-600 uppercase leading-none mb-4">{upgrade.description}</p>

                    <button
                      onClick={() => handlePurchase(upgrade.id)}
                      disabled={!canAfford}
                      className={`w-full py-2 border-4 border-black rounded-xl font-black uppercase italic text-[10px] transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none ${
                        canAfford ? 'bg-[#4ECDC4] hover:bg-cyan-400' : 'bg-gray-200 text-gray-400 grayscale'
                      }`}
                    >
                      ACQUIRE SYNERGY
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="p-4 bg-black text-white rounded-2xl border-4 border-black">
          <h4 className="text-xs font-black uppercase mb-3 text-[#FFD700]">Upgrade Classifications</h4>
          <div className="grid grid-cols-2 gap-4 text-[8px] font-bold uppercase italic opacity-90">
            <div className="flex items-center gap-2"><Zap className="w-3 h-3 text-blue-400" /> Synergy</div>
            <div className="flex items-center gap-2"><Target className="w-3 h-3 text-yellow-400" /> Conditional</div>
            <div className="flex items-center gap-2"><Award className="w-3 h-3 text-green-400" /> Milestone</div>
            <div className="flex items-center gap-2"><Star className="w-3 h-3 text-purple-400" /> Prestige</div>
          </div>
        </div>
      </div>
    </AdaptivePanel>
  );
}