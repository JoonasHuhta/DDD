import React from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { LAWYERS, Lawyer } from '../data/lawyers';
import { formatCurrency } from '../lib/utils/numberFormatter';
import { Briefcase, Shield, Zap, TrendingDown, Users } from 'lucide-react';

export const LegalRoster: React.FC = () => {
  const { 
    income, 
    hiredLawyers, 
    activeLawyerSlots, 
    buyLawyer, 
    equipLawyer 
  } = useMetamanGame();

  const handleHire = (id: string) => {
    if (buyLawyer(id)) {
      // Success feedback could go here
    }
  };

  const handleSlot = (id: string, slotIdx: number) => {
    equipLawyer(id, slotIdx);
  };

  const getBonusIcon = (type: string) => {
    switch (type) {
      case 'heatDecay': return <TrendingDown className="w-4 h-4 text-blue-400" />;
      case 'clickHeat': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'dataHeat': return <Shield className="w-4 h-4 text-purple-400" />;
      case 'lawsuitDefense': return <Shield className="w-4 h-4 text-red-500" />;
      case 'globalGeneration': return <Users className="w-4 h-4 text-green-400" />;
      default: return <Briefcase className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-lg overflow-hidden border border-slate-700/50">
      {/* Active Slots / War Room */}
      <div className="p-4 bg-slate-800/80 border-b border-slate-700">
        <h3 className="text-xs font-black uppercase tracking-tighter text-slate-400 mb-3 flex items-center gap-2">
          <Briefcase className="w-4 h-4" /> War Room Slots
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((idx) => {
            const activeId = activeLawyerSlots[idx];
            const lawyer = LAWYERS.find(l => l.id === activeId) as Lawyer | undefined;
            
            return (
              <div 
                key={idx}
                className={`h-24 rounded border-2 border-dashed flex flex-col items-center justify-center transition-all ${
                  lawyer 
                    ? 'border-yellow-500/50 bg-slate-800 shadow-lg shadow-yellow-900/20' 
                    : 'border-slate-700 bg-slate-900/50'
                }`}
              >
                {lawyer ? (
                  <div className="relative group w-full h-full flex flex-col items-center p-2">
                    <img 
                      src={lawyer.image} 
                      alt={lawyer.name}
                      className="w-10 h-10 rounded-full border border-yellow-500/30 object-cover mb-1"
                    />
                    <span className="text-[10px] font-bold text-yellow-500 text-center leading-tight truncate w-full px-1">
                      {lawyer.name}
                    </span>
                    <button 
                      onClick={() => equipLawyer('', idx)} // Simple clear
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[8px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                    Empty Slot
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Roster List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <h3 className="text-xs font-black uppercase tracking-tighter text-slate-400 flex items-center gap-2">
          Available Legal Council
        </h3>
        
        {LAWYERS.map((lawyer: Lawyer) => {
          const isHired = hiredLawyers.includes(lawyer.id);
          const isActive = activeLawyerSlots.includes(lawyer.id);
          const canAfford = income >= lawyer.cost;

          return (
            <div 
              key={lawyer.id}
              className={`relative overflow-hidden rounded-lg border transition-all ${
                isHired 
                  ? 'bg-slate-800/80 border-slate-600' 
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div className="p-3 flex gap-3">
                {/* ID Portrait */}
                <div className="relative shrink-0">
                  <div className="w-16 h-16 rounded overflow-hidden border-2 border-slate-700 bg-black">
                    <img 
                      src={lawyer.image} 
                      alt={lawyer.name}
                      className={`w-full h-full object-cover ${!isHired ? 'grayscale contrast-125 opacity-50' : ''}`}
                    />
                  </div>
                  {isHired && (
                    <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full w-5 h-5 flex items-center justify-center shadow-lg border-2 border-slate-800">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-black text-xs sm:text-sm text-slate-100 uppercase tracking-tight truncate">
                        {lawyer.name}
                      </h4>
                      <span className="text-[8px] font-mono text-slate-500 shrink-0">
                        {lawyer.tier.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[10px] text-yellow-500/80 font-bold uppercase italic leading-tight mb-1">
                      {lawyer.role}
                    </p>
                    <p className="text-[10px] text-slate-400 leading-tight line-clamp-2 mb-2">
                      {lawyer.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded border border-white/5 mt-auto">
                    <div className="shrink-0">{getBonusIcon(lawyer.bonusType)}</div>
                    <span className="text-[10px] font-black text-slate-200 uppercase tracking-tighter">
                      {lawyer.skill}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-center gap-1.5 min-w-[70px]">
                  {!isHired ? (
                    <button
                      onClick={() => handleHire(lawyer.id)}
                      disabled={!canAfford}
                      className={`w-full py-2 px-2 rounded font-black text-[10px] uppercase transition-all shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-0.5 ${
                        canAfford 
                          ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                      }`}
                    >
                      Hire {formatCurrency(lawyer.cost)}
                    </button>
                  ) : (
                    <div className="grid grid-cols-1 gap-1">
                      {[0, 1, 2].map((slotIdx) => (
                        <button
                          key={slotIdx}
                          onClick={() => handleSlot(lawyer.id, slotIdx)}
                          className={`w-full py-1 px-1 rounded font-black text-[8px] uppercase transition-all border-2 ${
                            activeLawyerSlots[slotIdx] === lawyer.id
                              ? 'bg-yellow-500 border-black text-black'
                              : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                          }`}
                        >
                          Slot {slotIdx + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {!isHired && !canAfford && (
                <div className="absolute inset-0 bg-black/20 pointer-events-none" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
