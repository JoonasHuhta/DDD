import React, { useState } from 'react';
import { AlertTriangle, DollarSign, Gift, Briefcase, Scale, Shield, CheckCircle, Info, Zap } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import LegalSystem from './LegalSystem';
import SinisterLab from './SinisterLab';
import AdaptivePanel from './AdaptivePanel';
import { usePanelState } from '../hooks/usePanelState';

export default function SuitcasePanel() {
  const { 
    rewardState, 
    lawsuitState, 
    formatNumber,
    claimAchievement
  } = useMetamanGame();

  const panels = usePanelState();
  const [activeTab, setActiveTab] = useState<'rewards' | 'legal'>('rewards');
  const [showLegalSystem, setShowLegalSystem] = useState(false);
  const [showSinisterLab, setShowSinisterLab] = useState(false);

  React.useEffect(() => {
    const store = useMetamanGame.getState();
    if (store.lawsuitState.isDelivered && !store.lawsuitState.isAcknowledged) {
      store.toggleLawsuitPanel(); 
      setActiveTab('legal');
    } else if (store.lawsuitState.isActive) {
      setActiveTab('legal');
    }
  }, []);

  if (!panels.isPanelOpen('suitcase')) return null;

  const unclaimedRewards = rewardState?.rewards?.filter(r => !r.claimed) || [];
  const claimedRewards = rewardState?.rewards?.filter(r => r.claimed).sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0)) || [];

  return (
    <AdaptivePanel 
      title="CORPORATE SUITCASE" 
      onClose={() => panels.closePanel('suitcase')} 
      position="center"
      className="!bg-zinc-950 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
      icon={<Briefcase className="w-6 h-6 text-[#00FFD1]" />}
    >
      <div className="space-y-6 font-sans relative">
        {/* Decorative scanlines */}
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(0deg,_black_0px,_black_1px,_transparent_1px,_transparent_2px)]"></div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-2 text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-2">
           <span>Unit.v4.0.1</span>
           <span className="animate-pulse text-[#00FFD1]">● System Online</span>
        </div>

        {/* Tabs - Sinister Pop Style */}
        <div className="flex bg-black border-4 border-black rounded-3xl overflow-hidden shadow-[4px_4px_0_0_black]">
          <button
            onClick={() => setActiveTab('rewards')}
            className={`flex-1 py-4 font-black uppercase italic text-xs transition-all relative ${
              activeTab === 'rewards'
                ? 'bg-zinc-800 text-[#00FFD1]'
                : 'text-zinc-500 hover:text-white hover:bg-zinc-900 border-r-2 border-zinc-800'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Zap className="w-3 h-3" /> Digital Assets
              {unclaimedRewards.length > 0 && (
                <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              )}
            </div>
            {activeTab === 'rewards' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#00FFD1]" />}
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`flex-1 py-4 font-black uppercase italic text-xs transition-all relative ${
              activeTab === 'legal'
                ? 'bg-zinc-800 text-[#FF0055]'
                : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Scale className="w-3 h-3" /> Compliance hub
              {lawsuitState.isActive && (
                 <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </div>
            {activeTab === 'legal' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#FF0055]" />}
          </button>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {activeTab === 'legal' ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              {(lawsuitState?.isActive || lawsuitState?.isDelivered) ? (
                <div className="bg-zinc-900 border-4 border-black p-6 rounded-[2rem] shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
                  {/* Warning background stripe */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/10 rotate-45 pointer-events-none" />
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-[#FF0055] p-2 rounded-xl border-2 border-black rotate-2 shadow-[2px_2px_0_0_black]">
                      <AlertTriangle className="w-6 h-6 text-black" />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Liability Exposure</div>
                      <div className="font-mono font-black text-3xl text-[#FF0055] tracking-tighter">-${formatNumber(lawsuitState.amount || 1000000)}</div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-black text-white uppercase italic text-lg mb-1">
                      {lawsuitState.plaintiff || 'Grandma and Grandpa Thompson'}
                    </h3>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Plaintiff ID: #BRC-{Math.floor(Math.random() * 9000 + 1000)}</div>
                  </div>
                  
                  <div className="bg-black/50 p-4 rounded-2xl border-2 border-zinc-800 mb-6 italic">
                    <p className="text-zinc-400 text-xs leading-relaxed border-l-4 border-[#FF0055] pl-3">
                      "{lawsuitState.claim || "Metaman's platform addicted our grandchildren to endless swiping, robbing us of our family dreams..."}"
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setShowLegalSystem(true)}
                      className="w-full py-4 bg-[#00FFD1] hover:bg-[#00e6bc] text-black border-4 border-black rounded-2xl font-black uppercase italic shadow-[4px_4px_0_0_black] active:translate-y-1 active:shadow-none transition-all text-sm group"
                    >
                      <span className="flex items-center justify-center gap-2">
                        <Shield className="w-4 h-4 transition-transform group-hover:scale-125" />
                        Enter Compliance Interface
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        const store = useMetamanGame.getState();
                        store.toggleLawsuitPanel();
                        panels.closePanel('suitcase');
                      }}
                      className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white border-4 border-black rounded-2xl font-black uppercase italic shadow-[4px_4px_0_0_black] active:translate-y-1 active:shadow-none transition-all text-sm"
                    >
                      Acknowledge Violation
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 bg-zinc-900/50 border-4 border-black border-dashed rounded-[3rem] animate-pulse">
                  <div className="bg-zinc-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black shadow-[4px_4px_0_0_black]">
                    <Shield className="w-12 h-12 text-[#00FFD1]" />
                  </div>
                  <p className="font-black text-white text-xl uppercase italic tracking-tight">Zero Active Breaches</p>
                  <p className="text-[10px] font-mono text-zinc-500 mt-2 uppercase tracking-[0.3em]">Compliance System: Optimal</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
              {/* Unclaimed Rewards */}
              {unclaimedRewards.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="font-black text-zinc-500 uppercase italic text-[10px] tracking-widest">Extractable Assets ({unclaimedRewards.length})</h4>
                    <div className="h-0.5 flex-1 bg-zinc-800 mx-4" />
                  </div>
                  
                  {unclaimedRewards.map((reward) => (
                    <div key={reward.id} className="p-5 bg-zinc-900 border-4 border-black rounded-2xl flex items-center justify-between gap-4 shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] transition-all transform hover:-translate-y-1 group relative overflow-hidden">
                       {/* Background highlight */}
                       <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                       
                       <div className="flex-1 min-w-0 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="bg-green-500/20 p-1.5 rounded-lg border border-green-500/30">
                              <Zap className="w-3 h-3 text-green-400" />
                           </div>
                           <h3 className="font-black text-white uppercase italic truncate text-sm tracking-tight">{reward.title}</h3>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase mb-3 line-clamp-1 italic">{reward.description}</p>
                        <div className="flex items-center gap-3">
                           <span className="bg-black text-[#00FFD1] px-2 py-1 rounded-lg text-[8px] font-black uppercase font-mono border border-zinc-700">
                            {reward.type}
                          </span>
                          <span className="text-white font-black text-xs font-mono">
                            VAL: <span className="text-green-400">${formatNumber(('value' in reward ? reward.value : (reward as any).amount) || 0)}</span>
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => rewardState.claimReward(String(reward.id))}
                        className="flex-shrink-0 px-6 py-3 bg-white hover:bg-[#00FFD1] text-black border-4 border-black rounded-xl font-black uppercase italic shadow-[4px_4px_0_0_black] active:translate-y-1 active:shadow-none transition-all text-xs z-10"
                      >
                        Claim Asset
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                claimedRewards.length === 0 && (
                  <div className="text-center py-20 bg-zinc-900/30 border-4 border-black border-dashed rounded-[3rem]">
                    <div className="bg-zinc-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
                      <Gift className="w-10 h-10 text-white" />
                    </div>
                    <p className="font-black text-zinc-600 uppercase italic">Vault Empty</p>
                  </div>
                )
              )}

              {/* History Section */}
              {claimedRewards.length > 0 && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between px-2">
                    <h4 className="font-black text-zinc-600 uppercase italic text-[10px] tracking-widest">Asset Log</h4>
                    <div className="h-px flex-1 bg-zinc-800/50 mx-4" />
                  </div>

                  <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                    {claimedRewards.map((reward) => (
                      <div key={reward.id} className="p-3 bg-zinc-900/50 border-2 border-zinc-800/50 rounded-xl flex items-center justify-between gap-4 opacity-70 hover:opacity-100 transition-opacity">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-3 h-3 text-zinc-500" />
                            <h3 className="font-black text-zinc-400 uppercase italic text-[10px] truncate">{reward.title}</h3>
                          </div>
                        </div>
                        <div className="text-right">
                           <span className="text-green-500/60 font-black text-[10px] font-mono leading-none block">
                            +${formatNumber(('value' in reward ? reward.value : (reward as any).amount) || 0)}
                          </span>
                          <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-tighter">
                            {new Date(reward.dateAdded || Date.now()).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overlays */}
      {showLegalSystem && (
        <LegalSystem onClose={() => setShowLegalSystem(false)} />
      )}
      {showSinisterLab && (
        <SinisterLab onClose={() => setShowSinisterLab(false)} />
      )}
    </AdaptivePanel>
  );
}