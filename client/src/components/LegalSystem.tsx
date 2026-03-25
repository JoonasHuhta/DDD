import React, { useState, useEffect } from 'react';
import { Scale, Shield, CheckCircle, AlertTriangle, Gavel } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import AdaptivePanel from './AdaptivePanel';
import AdaptiveText from './AdaptiveText';

interface LawyerType {
  id: string;
  name: string;
  cost: number;
  currency: 'orbs';
  effect: string;
  reduction: number;
  durationHours: number;
  incomeBoost?: number;
}

interface LegalSystemProps {
  onClose: () => void;
}

const LAWYERS: LawyerType[] = [
  {
    id: 'basic_lawyer',
    name: 'Public Defender',
    cost: 500,
    currency: 'orbs',
    effect: 'Reduces legal penalties by 50%',
    reduction: 50,
    durationHours: 1,
  },
  {
    id: 'premium_lawyer',
    name: 'Corporate Attorney',
    cost: 1200,
    currency: 'orbs',
    effect: 'Reduces penalties by 75%,  +5% income',
    reduction: 75,
    durationHours: 2,
    incomeBoost: 5,
  },
  {
    id: 'lawyer_army',
    name: 'Legal Dream Team',
    cost: 2000,
    currency: 'orbs',
    effect: 'Eliminates all penalties, +10% income',
    reduction: 100,
    durationHours: 2,
    incomeBoost: 10,
  },
];

const STORAGE_KEY = 'metaman_active_lawyers';

export default function LegalSystem({ onClose }: LegalSystemProps) {
  const {
    orbsInventory,
    formatNumber,
    lawsuitState,
    // Use store actions to properly mutate shared state
    setDataInventory,
    dataInventory,
  } = useMetamanGame();

  // Persist active lawyers so they survive panel close/reopen
  const [activeLawyers, setActiveLawyers] = useState<{ [id: string]: number }>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [hireMessage, setHireMessage] = useState<string | null>(null);

  // Persist to localStorage whenever activeLawyers changes
  useEffect(() => {
    // Prune expired entries before saving
    const now = Date.now();
    const pruned = Object.fromEntries(
      Object.entries(activeLawyers).filter(([, expiry]) => expiry > now)
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
  }, [activeLawyers]);

  const isLawyerActive = (id: string) => {
    return !!(activeLawyers[id] && activeLawyers[id] > Date.now());
  };

  const getActiveReduction = () => {
    return LAWYERS.reduce((max, l) => {
      if (isLawyerActive(l.id)) return Math.max(max, l.reduction);
      return max;
    }, 0);
  };

  const getIncomeBonus = () => {
    return LAWYERS.reduce((total, l) => {
      if (isLawyerActive(l.id) && l.incomeBoost) return total + l.incomeBoost;
      return total;
    }, 0);
  };

  const getRemainingTime = (id: string): string => {
    const expiry = activeLawyers[id];
    if (!expiry || expiry <= Date.now()) return '';
    const ms = expiry - Date.now();
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
  };

  const hireLawyer = (lawyer: LawyerType) => {
    // Use orbsInventory (the permanent orbs counter) as payment source
    if (orbsInventory < lawyer.cost) return;
    if (isLawyerActive(lawyer.id)) return;

    // Deduct from orbsInventory via the store
    // orbsInventory is the main orb currency; dataInventory is "data" (sometimes also called orbs in UI)
    // We use dataInventory here per item cost denomination (displayed as ORBS in UI)
    if (dataInventory < lawyer.cost) return;

    setDataInventory(dataInventory - lawyer.cost);

    const expiryTime = Date.now() + lawyer.durationHours * 60 * 60 * 1000;
    setActiveLawyers(prev => ({ ...prev, [lawyer.id]: expiryTime }));

    setHireMessage(`✅ ${lawyer.name} hired!`);
    setTimeout(() => setHireMessage(null), 2500);
  };

  const penaltyReduction = getActiveReduction();
  const incomeBonus = getIncomeBonus();
  const activePenalty = lawsuitState.isActive ? lawsuitState.penaltyPercent * ((100 - penaltyReduction) / 100) : 0;

  return (
    <AdaptivePanel title="COMPLIANCE HUB" onClose={onClose} className="!bg-zinc-950 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
      <div className="space-y-6 font-sans">
        
        {/* Decorative Grid Overlay for that Sinclair/Corporate feel */}
        <div className="absolute inset-0 pointer-events-none opacity-5 overflow-hidden rounded-2xl">
           <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,_black_0px,_black_1px,_transparent_1px,_transparent_2px)]"></div>
        </div>

        {/* Hire success toast */}
        {hireMessage && (
          <div className="flex items-center gap-2 bg-[#00FFD1] border-4 border-black rounded-xl px-4 py-2 font-black uppercase italic text-black text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-4 h-4" /> {hireMessage}
          </div>
        )}

        {/* Current Legal Status Dashboard */}
        <div className="bg-zinc-900 border-4 border-black rounded-2xl p-5 shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
             <Scale className="w-12 h-12 text-white" />
          </div>
          
          <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
            <div className="w-2 h-2 bg-[#00FFD1] rounded-full animate-pulse" />
            <h3 className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em]">Live Compliance Feed</h3>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="text-center p-2 sm:p-3 bg-black border-2 border-zinc-800 rounded-xl">
              <div className="text-lg sm:text-2xl font-black text-[#FF0055] font-mono tracking-tighter">-{activePenalty.toFixed(1)}%</div>
              <div className="text-[7px] sm:text-[8px] font-black text-zinc-500 uppercase mt-1 leading-tight">Exposure<br/>Penalty</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-black border-2 border-[#FFCC00]/30 rounded-xl">
              <div className="text-lg sm:text-2xl font-black text-[#FFCC00] font-mono tracking-tighter">+{penaltyReduction}%</div>
              <div className="text-[7px] sm:text-[8px] font-black text-zinc-500 uppercase mt-1 leading-tight">Defensive<br/>Shield</div>
            </div>
            <div className="text-center p-2 sm:p-3 bg-black border-2 border-[#00FFD1]/30 rounded-xl">
              <div className="text-lg sm:text-2xl font-black text-[#00FFD1] font-mono tracking-tighter">+{incomeBonus}%</div>
              <div className="text-[7px] sm:text-[8px] font-black text-zinc-500 uppercase mt-1 leading-tight">Synergy<br/>Bonus</div>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
            <span className="text-[8px] sm:text-[9px] font-black uppercase text-zinc-500 tracking-widest shrink-0">Available Retainer Funds:</span>
            <div className="flex items-center gap-1 ml-auto">
               <span className="text-sm sm:text-lg text-white font-black font-mono tracking-tighter">${formatNumber(dataInventory)}</span>
               <span className="text-[7px] sm:text-[8px] font-black text-zinc-600 uppercase">ORBS</span>
            </div>
          </div>
        </div>

        {/* Protection Catalog */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
             <Gavel className="w-4 h-4 text-zinc-600" />
             <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Counsel Directory</h3>
          </div>
          
          {LAWYERS.map(lawyer => {
            const active = isLawyerActive(lawyer.id);
            const canAfford = dataInventory >= lawyer.cost;
            const timeLeft = getRemainingTime(lawyer.id);
            
            return (
              <div
                key={lawyer.id}
                className={`p-3 sm:p-4 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all ${active ? 'bg-[#00FFD1] -rotate-1' : 'bg-zinc-900'}`}
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`text-base sm:text-lg font-black uppercase italic tracking-tighter truncate ${active ? 'text-black' : 'text-white'}`}>
                        {lawyer.name}
                      </div>
                      {active && <div className="bg-black text-[#00FFD1] text-[7px] sm:text-[8px] font-mono px-2 py-0.5 rounded font-bold animate-pulse">ACTIVE</div>}
                    </div>
                    <div className={`text-[9px] sm:text-[10px] font-bold uppercase mt-1 leading-tight ${active ? 'text-black/70' : 'text-zinc-500'}`}>
                      {lawyer.effect}
                    </div>
                    {active && timeLeft && (
                      <div className="text-[8px] sm:text-[10px] font-black text-black uppercase mt-1 bg-black/10 px-2 py-1 rounded inline-block">
                        ⌛ {timeLeft}
                      </div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm sm:text-lg font-black font-mono tracking-tight ${active ? 'text-black' : 'text-white'}`}>
                      {formatNumber(lawyer.cost)}
                      <span className="text-[7px] sm:text-[8px] ml-1 opacity-50 uppercase tracking-tighter">ORBS</span>
                    </div>
                  </div>
                </div>

                <button
                  disabled={!canAfford || active}
                  onClick={() => hireLawyer(lawyer)}
                  className={`w-full mt-4 py-3 border-4 border-black rounded-xl font-black uppercase italic transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 ${
                    active
                      ? 'bg-zinc-800 text-zinc-600 border-zinc-800 pointer-events-none shadow-none translate-y-1 opacity-20'
                      : canAfford
                      ? 'bg-[#FFCC00] hover:bg-yellow-400 text-black'
                      : 'bg-zinc-800 text-zinc-600 border-zinc-800 cursor-not-allowed grayscale'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {!active && canAfford && <Shield className="w-4 h-4" />}
                    <span>{active ? `Retained` : canAfford ? 'Sign Contract' : 'Insufficient Capital'}</span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </AdaptivePanel>
  );
}