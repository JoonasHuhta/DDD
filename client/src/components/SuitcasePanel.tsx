import React, { useState } from 'react';
import { AlertTriangle, DollarSign, Gift, Briefcase, Scale, Shield, CheckCircle, Info, Zap, Gavel } from 'lucide-react';
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
  } = useMetamanGame();

  const panels = usePanelState();
  const [activeTab, setActiveTab] = useState<'rewards' | 'legal'>('rewards');
  const [showLegalSystem, setShowLegalSystem] = useState(false);
  const [showSinisterLab, setShowSinisterLab] = useState(false);

  React.useEffect(() => {
    const store = useMetamanGame.getState();
    // Simply switch to legal tab if a suit is pending
    if (store.lawsuitState.isDelivered || store.lawsuitState.isActive) {
      setActiveTab('legal');
      // Acknowledge that the player has seen the delivery to clear the bubble/tip
      if (!store.lawsuitState.isAcknowledged) {
        store.acknowledgeLawsuit();
      }
    }
  }, []);

  if (!panels.isPanelOpen('suitcase')) return null;

  const unclaimedRewards = rewardState?.rewards?.filter(r => !r.claimed) || [];
  const claimedRewards = rewardState?.rewards?.filter(r => r.claimed).sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0)) || [];

  return (
    <>
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
              onClick={() => {
                setActiveTab('legal');
                // Clear the alert badge when visiting the tab
                const store = useMetamanGame.getState();
                if (!store.lawsuitState.isAcknowledged) {
                   store.acknowledgeLawsuit(); 
                }
              }}
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
                <div className="space-y-6">
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
                          <div className="font-mono font-black text-2xl sm:text-3xl text-[#FF0055] tracking-tighter">-${formatNumber(lawsuitState.amount || 1000000)}</div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="font-black text-white uppercase italic text-lg mb-1 truncate">
                          {lawsuitState.plaintiff || 'Grandma and Grandpa Thompson'}
                        </h3>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Plaintiff ID: #BRC-{Math.floor(Math.random() * 9000 + 1000)}</div>
                      </div>
                      
                      <div className="bg-black/50 p-4 rounded-2xl border-2 border-zinc-800 mb-6 italic">
                        <p className="text-zinc-400 text-xs leading-relaxed border-l-4 border-[#FF0055] pl-3">
                          "{lawsuitState.claim || "Dan's platform addicted our grandchildren to endless swiping, robbing us of our family dreams..."}"
                        </p>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => {
                            const store = useMetamanGame.getState();
                            store.toggleLawsuitPanel();
                            panels.closePanel('suitcase');
                          }}
                          className="w-full py-5 bg-[#FF0055] hover:bg-[#ff1a66] text-white border-4 border-black rounded-3xl font-black uppercase italic shadow-[6px_6px_0_0_black] active:translate-y-1 active:shadow-none transition-all text-base group overflow-hidden relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
                          <span className="flex items-center justify-center gap-3 relative z-10">
                            <Gavel className="w-5 h-5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
                            Open Legal War Room
                          </span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-900/50 border-4 border-black border-dashed rounded-[3rem] p-10 text-center opacity-50 mb-6">
                       <Shield className="w-12 h-12 text-[#00FFD1] mx-auto mb-4 opacity-20" />
                       <p className="font-black text-zinc-500 uppercase italic text-sm">No Active Threats</p>
                    </div>
                  )}

                  {/* PERSISTENT MONITORING (Radar & History) */}
                  <div className="space-y-6">
                    {/* CHARACTER RADAR: LARRY & TIMELINE */}
                    <div className="bg-black p-4 rounded-3xl border-4 border-white shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-2 opacity-5">
                        <Scale className="w-16 h-16 text-white" />
                      </div>
                      <div className="flex flex-col gap-4 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl border-2 border-white flex items-center justify-center shrink-0 transform rotate-3 ${lawsuitState.isActive ? 'bg-[#FFCC00]' : 'bg-zinc-800'}`}>
                            <Zap className={`w-6 h-6 ${lawsuitState.isActive ? 'text-black' : 'text-zinc-600'}`} />
                          </div>
                          <div>
                            <h4 className={`${lawsuitState.isActive ? 'text-[#FFCC00]' : 'text-zinc-500'} font-black uppercase italic text-sm leading-tight`}>Larry's Radar</h4>
                            <p className="text-[9px] font-bold text-zinc-500 uppercase italic">Status: {lawsuitState.isActive ? 'Active Delivery' : 'Monitoring Outer Rim'}</p>
                          </div>
                        </div>

                        {/* TIMELINE BAR */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-400">
                             <span>Safe Zone</span>
                             <span>Delivery Point</span>
                          </div>
                          <div className="h-6 bg-zinc-900 rounded-xl p-1 border-2 border-zinc-800 relative overflow-hidden">
                             <div 
                               className={`h-full rounded-lg transition-all duration-300 ${lawsuitState.isActive ? 'bg-gradient-to-r from-yellow-500 to-[#FF0055] shadow-[0_0_10px_rgba(255,0,85,0.4)]' : 'bg-zinc-800'}`} 
                               style={{ width: `${lawsuitState.isActive ? lawsuitState.larryDistance : 0}%` }}
                             />
                             {lawsuitState.isActive && (
                               <div 
                                 className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
                                 style={{ left: `calc(${lawsuitState.larryDistance}% - 12px)` }}
                               >
                                 <div className="w-6 h-6 bg-red-600 border-2 border-white rounded-lg flex items-center justify-center rotate-12 shadow-lg">
                                    <AlertTriangle className="w-3 h-3 text-white" />
                                 </div>
                               </div>
                             )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* CASE HISTORY LOG (Always Visible) */}
                    {lawsuitState.lawsuitHistory && lawsuitState.lawsuitHistory.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 px-2">
                          <Briefcase className="w-3 h-3 text-zinc-500" />
                          <h4 className="font-black text-zinc-500 uppercase italic text-[10px] tracking-widest">Case Files History</h4>
                          <div className="h-px flex-1 bg-zinc-800" />
                        </div>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                          {lawsuitState.lawsuitHistory.map((caseFile, idx) => (
                            <div key={`${caseFile.id}-${idx}`} className="p-3 bg-black/40 border-2 border-zinc-800 rounded-2xl flex items-center justify-between gap-3 opacity-80 hover:opacity-100 transition-opacity">
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black text-white uppercase truncate">{caseFile.plaintiff}</p>
                                <p className="text-[8px] font-bold text-zinc-500 uppercase">{new Date(caseFile.timestamp).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right flex flex-col items-end">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border-2 border-black shadow-[2px_2px_0_0_black] ${
                                  caseFile.outcome === 'won' ? 'bg-[#00FFD1] text-black' :
                                  caseFile.outcome === 'settled' ? 'bg-[#FFCC00] text-black' :
                                  caseFile.outcome === 'evaded' ? 'bg-[#9D4EDD] text-white' : 'bg-red-500 text-white'
                                }`}>
                                  {caseFile.outcome}
                                </span>
                                <span className="text-[9px] font-mono font-black text-zinc-400 mt-1">
                                  -${formatNumber(caseFile.amount)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

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
      </AdaptivePanel>

      {/* Overlays - Outside to avoid clipping */}
      {showLegalSystem && (
        <LegalSystem onClose={() => setShowLegalSystem(false)} />
      )}
      {showSinisterLab && (
        <SinisterLab onClose={() => setShowSinisterLab(false)} />
      )}
    </>
  );
}