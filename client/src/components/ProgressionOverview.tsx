import React, { useState } from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { getStageInfo, getStageProgress, getNextStage } from '../lib/utils/stageSystem';
import { Trophy, ArrowRight, Info, Database, Zap, Building2, Flame, Globe, Activity, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdaptivePanel from './AdaptivePanel';
import { GlobalDominanceContent } from './GlobalDominanceContent';

export default function ProgressionOverview({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'assets'>('overview');
  
  const users = useMetamanGame(state => state.users);
  const heat = useMetamanGame(state => state.heat);
  const heatLevel = useMetamanGame(state => state.heatLevel);
  const formatNumber = useMetamanGame(state => state.formatNumber);
  const isGlobalUnlocked = useMetamanGame(state => state.globalDominance.isUnlocked);
  
  const stageInfo = getStageInfo(users);
  const stageProgress = getStageProgress(users);
  const nextStage = getNextStage(users);

  return (
    <AdaptivePanel 
      title="Empire Command" 
      icon={<Globe className="w-4 h-4 text-black/40" />}
      onClose={onClose}
      position="center"
      size="full"
      scrollable={false}
      className="!bg-[#FFD700]" 
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* 2. COMPACT TAB SWITCHER */}
        <div className="flex-shrink-0 flex bg-black/5 p-1 rounded-xl border-[3px] border-black mb-2 gap-1 max-w-sm mx-auto w-full">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-1.5 px-3 flex items-center justify-center gap-2 font-black uppercase text-[10px] transition-all rounded-lg ${
              activeTab === 'overview' 
                ? 'bg-black text-white shadow-[2px_2px_0_0_black]' 
                : 'text-black hover:bg-black/10'
            }`}
          >
            <Activity className="w-3 h-3" /> STATUS
          </button>
          <button 
            onClick={() => {
              if (isGlobalUnlocked) setActiveTab('assets');
            }}
            className={`flex-1 py-1.5 px-3 flex items-center justify-center gap-2 font-black uppercase text-[10px] transition-all rounded-lg ${
              !isGlobalUnlocked
                ? 'opacity-50 cursor-not-allowed hover:bg-transparent text-black'
                : activeTab === 'assets' 
                  ? 'bg-black text-white shadow-[2px_2px_0_0_black]' 
                  : 'text-black hover:bg-black/10'
            }`}
          >
            {isGlobalUnlocked ? (
              <><Globe className="w-3 h-3" /> GLOBAL</>
            ) : (
              <>CLASSIFIED (100K)</>
            )}
          </button>
        </div>

        {/* CONTAINER FOR SCROLLABLE CONTENT */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative rounded-2xl border-4 border-black bg-black/5">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div 
                key="overview"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute inset-0 overflow-y-auto space-y-4 p-4 scrollbar-thin scrollbar-thumb-black/20 no-scrollbar"
              >
                {/* Compact Header */}
                <div className="bg-black text-white p-5 rounded-2xl border-2 border-black flex items-center justify-between shadow-[6px_6px_0_0_black]">
                  <div className="flex flex-col">
                     <div className="flex items-center gap-2 text-yellow-400 mb-0.5">
                      <Trophy className="w-4 h-4" />
                      <span className="text-[8px] font-black uppercase tracking-widest italic">Dominance Stage</span>
                    </div>
                    <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight italic leading-none">
                      {stageInfo.name}
                    </h2>
                  </div>
                  <Database className="w-12 h-12 opacity-20 hidden sm:block" />
                </div>

                {/* Compact Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <h3 className="text-[10px] font-black uppercase italic text-black/60">Expansion Progress</h3>
                    <div className="text-right flex items-center gap-2">
                      <span className="text-sm font-black text-black">{Math.floor(stageProgress * 100)}%</span>
                    </div>
                  </div>
                  <div className="h-8 bg-black/10 rounded-xl border-4 border-black p-0.5 relative overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${stageProgress * 100}%` }}
                      className="h-full bg-black rounded-lg"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">
                        {formatNumber(users)} / {nextStage ? formatNumber(nextStage.userThreshold) : 'MAX'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Side-by-Side Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_black]">
                    <div className="flex items-center gap-2 mb-2 opacity-60">
                      <Flame className="w-4 h-4" />
                      <h4 className="text-[10px] font-black uppercase italic">Heat</h4>
                    </div>
                    <div className="text-2xl font-black text-black leading-none">{heat.toFixed(1)}%</div>
                    <div className={`mt-2 text-[8px] font-black uppercase px-2 py-0.5 rounded-full w-fit ${
                      heatLevel === 'emergency' ? 'bg-red-500 text-white animate-pulse' :
                      heatLevel === 'critical' ? 'bg-orange-500 text-white' :
                      heatLevel === 'elevated' ? 'bg-yellow-500 text-black' : 'bg-green-500 text-white'
                    }`}>
                      {heatLevel}
                    </div>
                  </div>

                  <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_black]">
                  <div className="flex items-center gap-2 mb-2 opacity-60">
                      <Database className="w-4 h-4" />
                      <h4 className="text-[10px] font-black uppercase italic">Users</h4>
                    </div>
                    <div className="text-2xl font-black text-black leading-none">{formatNumber(users)}</div>
                    <div className="mt-2 text-[8px] font-black uppercase text-black/60 italic">Integrated</div>
                  </div>
                </div>

                {/* Live System Log */}
                <div className="min-h-[100px] bg-black text-[#00ff00] p-4 rounded-2xl border-4 border-black font-mono text-[9px] relative overflow-hidden shadow-[inset_0_0_20px_rgba(0,255,0,0.1)]">
                  <div className="absolute top-0 right-0 p-2 opacity-20"><Activity className="w-4 h-4" /></div>
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                      <span className="font-bold">SYSTEM_READY:</span> 
                      <span>Establishing satellite handshake...</span>
                    </div>
                    <div className="flex gap-2 text-yellow-400">
                      <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                      <span className="font-bold">DOMINANCE_SCAN:</span> 
                      <span>Regional compliance at {Math.floor(stageProgress * 100)}%</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                      <span className="font-bold">DATA_FLUX:</span> 
                      <span>{formatNumber(users)} citizens currently integrated.</span>
                    </div>
                    <motion.div 
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="flex gap-2 text-red-500"
                    >
                      <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span>
                      <span className="font-bold">HEAT_MONITOR:</span> 
                      <span>Current risk level: {heatLevel.toUpperCase()}</span>
                    </motion.div>
                  </div>
                  <motion.div 
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-[1px] bg-[#00ff00]/20 z-10"
                  />
                </div>

                <div className="p-3 bg-black/5 rounded-2xl border-2 border-dashed border-black/10">
                  <p className="text-[9px] font-bold text-black/40 leading-relaxed uppercase italic">
                    &ldquo;{stageInfo.description}&rdquo; — Total regional control is the only acceptable outcome.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="assets"
                initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                className="absolute inset-0 flex flex-col"
              >
                <GlobalDominanceContent />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AdaptivePanel>
  );
}
