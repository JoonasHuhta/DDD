import React, { useState } from 'react';
import { Beaker, FlaskConical, Zap, Target, Lock, TrendingUp, Fingerprint, EyeOff, Brain, ShieldAlert, FastForward, CheckCircle2, Cpu, Briefcase } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import AdaptivePanel from './AdaptivePanel';
import { ADDICTION_SCIENCE_TREE, DATA_DIVISION_TREE, LEGAL_SHIELD_TREE, ALL_RESEARCH_NODES, ResearchNode } from '../lib/progression/researchData';
import { formatCurrency, formatTimeMs } from '../lib/utils/numberFormatter';

interface ResearchLabPanelProps {
  onClose: () => void;
}

export default function ResearchLabPanel({ onClose }: ResearchLabPanelProps) {
  const {
    income,
    researchState,
    startResearch,
    queueResearch,
    cancelResearch,
    boostResearch,
    formatNumber,
    dopaCoin,
    dopaCoinUnlocked,
    isPubliclyTraded,
    stockPrice
  } = useMetamanGame();
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'addiction' | 'data' | 'legal'>('addiction');
  
  const selectedNode = selectedNodeId ? ALL_RESEARCH_NODES[selectedNodeId] : null;

  const renderNodeIcon = (nodeId: string, isCompleted: boolean) => {
    switch (nodeId) {
      case 'engagement_metrics': return <span className="text-2xl">🎯</span>;
      case 'dopamine_loop': return <span className="text-2xl">⚡</span>;
      case 'infinite_scroll': return <span className="text-2xl">📈</span>;
      case 'variable_reward': return <span className="text-2xl">🧠</span>;
      case 'sleep_disruption': return <span className="text-2xl">👁️</span>;
      case 'psychological_capture': return <span className="text-2xl">🧬</span>;
      case 'micro_targeting': return <span className="text-2xl">📡</span>;
      case 'psychographic_profiling': return <span className="text-2xl">👤</span>;
      case 'predictive_algorithms': return <span className="text-2xl">🔮</span>;
      case 'lobbying_network': return <span className="text-2xl">🏛️</span>;
      case 'slapp_suit_auto': return <span className="text-2xl">⚖️</span>;
      case 'offshore_havens': return <span className="text-2xl">🏝️</span>;
      default: return <span className="text-2xl">🧪</span>;
    }
  };

  const activeNode = researchState.activeResearch ? ALL_RESEARCH_NODES[researchState.activeResearch] : null;

  const getActiveTree = () => {
    switch (activeTab) {
      case 'data': return DATA_DIVISION_TREE;
      case 'legal': return LEGAL_SHIELD_TREE;
      case 'addiction':
      default: return ADDICTION_SCIENCE_TREE;
    }
  };
  const activeTree = getActiveTree();

  const handleNodeClick = (node: ResearchNode) => {
    setSelectedNodeId(node.id);
  };

  const handleStartResearch = (node: ResearchNode) => {
    if (researchState.activeResearch === node.id || researchState.queue.includes(node.id)) return;
    if (!researchState.unlocked.includes(node.id)) return;

    if (!researchState.activeResearch) {
      if (income >= node.cost) startResearch(node.id);
    } else if (researchState.queue.length < 2) {
      queueResearch(node.id);
    }
  };

  return (
    <AdaptivePanel title="R&D LAB" onClose={onClose}>
      <div className="space-y-6 pb-20 px-2 lg:px-4 flex flex-col items-center">
        
        {/* Lab Header Visual */}
        <div className="w-full bg-black rounded-2xl border-4 border-black p-4 relative overflow-hidden shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(circle at 10% 10%, #FF6B35 0%, transparent 20%), radial-gradient(circle at 90% 90%, #4ECDC4 0%, transparent 20%)',
            backgroundSize: '100% 100%'
          }} />
          
          <div className="flex justify-between items-center relative z-10">
            <div className="flex gap-4 items-center">
              <div className="bg-white p-2 rounded-xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] select-none">
                <span className="text-4xl" title="Dr. Dan">👨‍🔬</span>
              </div>
              <div className="text-white">
                <h3 className="font-black italic text-xl uppercase tracking-wider text-[#FFD700]">Addiction Science Div.</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">"It's not a bug, it's a feature."</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-[10px] uppercase font-black text-gray-500">Div. Funds</div>
              <div className="text-white font-black text-lg">{formatCurrency(income)}</div>
            </div>
          </div>
        </div>

        {/* Active Research Progress */}
        <div className="w-full bg-white border-4 border-black p-4 rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] relative">
          <h3 className="text-xs font-black text-black uppercase mb-3 px-1 italic">Active Research</h3>
          
          {activeNode ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-black rounded-lg border-2 border-black">
                     {renderNodeIcon(activeNode.id, true)}
                  </div>
                  <div>
                    <h4 className="font-black uppercase text-sm">{activeNode.name}</h4>
                    <div className="text-[10px] font-bold text-gray-500 font-mono">{formatTimeMs(researchState.timeRemainingMs)} remaining</div>
                  </div>
                </div>
                
                <button
                  onClick={boostResearch}
                  disabled={income < Math.max(50000, activeNode.cost * 0.2) || researchState.isLeakActive}
                  className="flex items-center gap-1 bg-[#4ECDC4] hover:bg-[#3dbdb4] text-black border-2 border-black px-2 py-1 rounded text-[10px] font-black uppercase transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:translate-y-px active:shadow-none"
                >
                  <FastForward className="w-3 h-3" /> BOOST ({formatCurrency(Math.max(50000, activeNode.cost * 0.2))})
                </button>
              </div>

              <div className="h-6 w-full bg-black/10 rounded-full border-2 border-black relative overflow-hidden">
                <div 
                   className="h-full bg-[#FF6B35] transition-all duration-100 ease-linear"
                   style={{ width: `${researchState.progressPercent * 100}%` }}
                />
              </div>

              {researchState.isLeakActive && (
                <div className="bg-red-100 border-2 border-red-600 rounded p-2 flex items-center gap-2 animate-pulse mt-2">
                  <ShieldAlert className="text-red-600 w-4 h-4 flex-shrink-0" />
                  <div className="text-[9px] font-black text-red-800 uppercase leading-tight">
                    CRITICAL: RIVALCORP ESPIONAGE DETECTED! Use Hack tool! ({Math.ceil(researchState.leakTimerMs/1000)}s)
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded text-gray-400 font-bold uppercase text-[10px]">
              Lab is idle.
            </div>
          )}
        </div>

        {/* Selection Info Panel */}
        <div className={`w-full bg-black rounded-3xl p-5 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all duration-300 ${selectedNode ? 'opacity-100' : 'opacity-80'}`}>
           {selectedNode ? (
              <div className="text-white space-y-3">
                 <div className="flex justify-between items-start border-b border-white/20 pb-2">
                    <div>
                      <h4 className="font-black uppercase text-base text-[#FFD700] tracking-wider">{selectedNode.name}</h4>
                      <div className="text-[9px] font-black uppercase text-[#4ECDC4]">Branch: {selectedNode.branch}</div>
                    </div>
                    <div className="bg-white/10 px-2 py-1 rounded text-[10px] font-black italic">TIER {selectedNode.tier}</div>
                 </div>

                 <div className="space-y-2">
                    <div className="bg-white/10 rounded-xl p-3 border border-white/20">
                       <div className="text-[10px] font-black text-[#4ECDC4] uppercase mb-1">Impact:</div>
                       <div className="text-[13px] font-bold text-white leading-tight">{selectedNode.benefit}</div>
                    </div>
                    <div className="italic text-[10px] text-gray-400 px-1 leading-normal">"{selectedNode.realDescription}"</div>
                 </div>

                 <div className="pt-2 flex gap-3">
                    <div className="flex-1">
                       <div className="text-[9px] font-black uppercase text-gray-500 mb-1">R&D Budget</div>
                       {researchState.completed.includes(selectedNode.id) ? (
                            <div className="text-green-400 font-black uppercase text-[10px]">Implemented</div>
                         ) : (
                            <div className="flex items-baseline gap-2">
                               <span className={`text-base font-black ${income >= selectedNode.cost ? 'text-white' : 'text-red-500 animate-pulse'}`}>
                                  {formatCurrency(selectedNode.cost)}
                               </span>
                               <span className="text-[9px] text-gray-400 font-bold uppercase">/ {formatTimeMs(selectedNode.duration)}</span>
                            </div>
                         )}
                    </div>

                    {!(researchState.completed.includes(selectedNode.id) || researchState.activeResearch === selectedNode.id || researchState.queue.includes(selectedNode.id)) && (
                       <button
                          onClick={() => handleStartResearch(selectedNode)}
                          disabled={!researchState.unlocked.includes(selectedNode.id) || income < selectedNode.cost}
                          className="flex-1 bg-[#4ECDC4] disabled:bg-gray-600 hover:bg-[#3dbdb4] text-black font-black uppercase rounded-2xl border-4 border-black py-2 text-sm shadow-[2px_2px_0_0_rgba(255,255,255,0.2)] active:translate-y-1 transition-all"
                       >
                          {income >= selectedNode.cost ? (!researchState.activeResearch ? 'Research' : '+ Queue') : 'NO FUNDS'}
                       </button>
                    )}
                    
                    {(researchState.activeResearch === selectedNode.id || researchState.queue.includes(selectedNode.id)) && (
                       <div className="flex-1 py-2 text-center bg-amber-400 rounded-2xl border-4 border-black text-black font-black uppercase text-[10px]">
                          In Progress
                       </div>
                    )}
                 </div>
              </div>
           ) : (
             <div className="py-6 text-center text-gray-500 font-black uppercase tracking-widest text-xs">
                Select a Module for Analysis
             </div>
           )}
        </div>

        {/* Branch Navigation Tabs */}
        <div className="w-full flex gap-2">
          <button onClick={() => { setActiveTab('addiction'); setSelectedNodeId(null); }} className={`flex-1 py-2 px-1 rounded-xl border-4 text-[9px] sm:text-[10px] font-black uppercase transition-all ${activeTab === 'addiction' ? 'bg-black text-[#FFD700] border-black scale-105 z-10' : 'bg-white text-gray-500 border-gray-300 hover:border-black'}`}>Addiction</button>
          <button onClick={() => { setActiveTab('data'); setSelectedNodeId(null); }} className={`flex-1 py-2 px-1 rounded-xl border-4 text-[9px] sm:text-[10px] font-black uppercase transition-all ${activeTab === 'data' ? 'bg-black text-[#4ECDC4] border-black scale-105 z-10' : 'bg-white text-gray-500 border-gray-300 hover:border-black'}`}>Data</button>
          <button onClick={() => { setActiveTab('legal'); setSelectedNodeId(null); }} className={`flex-1 py-2 px-1 rounded-xl border-4 text-[9px] sm:text-[10px] font-black uppercase transition-all ${activeTab === 'legal' ? 'bg-black text-[#FF6B35] border-black scale-105 z-10' : 'bg-white text-gray-500 border-gray-300 hover:border-black'}`}>Legal</button>
        </div>

        {/* Technology Tree */}
        <div className="w-full">
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-sm font-black text-black uppercase italic">Technology Tree</h3>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Tap to select</span>
          </div>
          
          <div className="bg-[#f8f9fa] rounded-3xl border-4 border-black p-4 shadow-inner relative overflow-hidden mb-6">
             {/* DopaCoin Mining Terminal (Hidden until research complete) */}
             {researchState.completed.includes('synthetic_value') && (
               <div className="mb-6 p-4 bg-slate-900 border-4 border-black rounded-2xl shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                 <div className="flex justify-between items-center mb-3">
                   <div className="flex items-center gap-2">
                     <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
                     <span className="text-xs font-black text-white uppercase italic">Dopa-Rig v1.0</span>
                   </div>
                   <div className="text-cyan-400 font-black italic text-sm">₿ {formatNumber(dopaCoin)}</div>
                 </div>
                 <div className="text-[9px] text-slate-400 font-bold mb-3 leading-tight uppercase">
                   Mining DOPACoin by harvesting excess neural entropy from {formatNumber(useMetamanGame.getState().users)} users.
                 </div>
                 <div className="h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                    <div className="h-full bg-cyan-500 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: '65%' }}></div>
                 </div>
               </div>
             )}

             {/* IPO Readiness Button (Hidden until research complete) */}
             {activeTab === 'legal' && researchState.completed.includes('ipo_readiness') && !isPubliclyTraded && (
               <div className="mb-6 p-4 bg-amber-50 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_black]">
                 <div className="flex items-center gap-3 mb-2">
                   <Briefcase className="w-6 h-6 text-amber-600" />
                   <div>
                     <div className="text-xs font-black text-black uppercase italic">Public Offering Ready</div>
                     <div className="text-[8px] font-bold text-amber-800 uppercase">Valuation: $ {formatNumber(useMetamanGame.getState().totalIncomePerSecond * 1000)}</div>
                   </div>
                 </div>
                 <button
                    onClick={() => useMetamanGame.setState({ isPubliclyTraded: true })}
                    className="w-full bg-black text-white py-2 rounded-xl font-black uppercase italic text-xs hover:bg-gray-900 active:scale-95 transition-all"
                 >
                    Launch IPO on NASDAQ
                 </button>
               </div>
             )}

             <div className="flex flex-col gap-8 items-center py-2">
                {[1, 2, 3, 4].map(tier => (
                  <div key={tier} className="flex gap-4 justify-center w-full relative">
                    {activeTree.filter(n => n.tier === tier).map(node => {
                       const isCompleted = researchState.completed.includes(node.id);
                       const isActive = researchState.activeResearch === node.id;
                       const isQueued = researchState.queue.includes(node.id);
                       const isUnlocked = researchState.unlocked.includes(node.id);
                       const isSelected = selectedNodeId === node.id;
                       const canAfford = income >= node.cost;
                       
                       let statusClasses = "bg-white border-black text-black opacity-40 grayscale";
                       if (isCompleted) statusClasses = "bg-green-100 border-green-600 text-green-800 shadow-[inset_0_0_10px_rgba(0,0,0,0.1)] grayscale-0 opacity-100";
                       else if (isActive) statusClasses = "bg-[#FF6B35] border-black text-white animate-pulse-slow grayscale-0 opacity-100";
                       else if (isQueued) statusClasses = "bg-amber-100 border-amber-600 text-amber-900 grayscale-0 opacity-100";
                       else if (isUnlocked) statusClasses = "bg-white border-black text-black grayscale-0 opacity-100 active:scale-95";

                       if (isSelected) statusClasses += " ring-4 ring-cyan-500 ring-offset-2 scale-110";

                       return (
                         <div key={node.id} className="relative flex flex-col items-center">
                            <button
                               onClick={() => handleNodeClick(node)}
                               className={`w-14 h-14 rounded-2xl border-4 flex items-center justify-center transition-all ${statusClasses} z-10 relative`}
                            >
                               {isCompleted ? <CheckCircle2 className="w-8 h-8 text-green-600" /> : renderNodeIcon(node.id, isCompleted || isActive)}
                               {!isUnlocked && <Lock className="absolute inset-0 m-auto w-5 h-5 text-gray-500 opacity-50" />}
                               
                               {/* Immediate Cost Badge */}
                               {isUnlocked && !isCompleted && !isActive && !isQueued && (
                                 <div className={`absolute -bottom-2 -right-2 px-1 rounded border-2 border-black text-[7px] font-black ${canAfford ? 'bg-yellow-400 text-black' : 'bg-red-500 text-white animate-pulse'} z-20`}>
                                   ${formatNumber(node.cost)}
                                 </div>
                               )}
                            </button>
                         </div>
                       );
                    })}
                  </div>
                ))}
             </div>
          </div>
        </div>

      </div>
    </AdaptivePanel>
  );
}
