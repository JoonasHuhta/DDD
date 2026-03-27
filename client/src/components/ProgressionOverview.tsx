import React from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { getStageInfo, getStageProgress, getNextStage } from '../lib/utils/stageSystem';
import { Trophy, ArrowRight, Info, Database, Zap, Building2, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import AdaptivePanel from './AdaptivePanel';

export default function ProgressionOverview({ onClose }: { onClose: () => void }) {
  const users = useMetamanGame(state => state.users);
  const heat = useMetamanGame(state => state.heat);
  const heatLevel = useMetamanGame(state => state.heatLevel);
  const formatNumber = useMetamanGame(state => state.formatNumber);
  
  const stageInfo = getStageInfo(users);
  const stageProgress = getStageProgress(users);
  const nextStage = getNextStage(users);

  return (
    <AdaptivePanel title="PROGRESSION DETAILS" onClose={onClose} position="center" icon={<Trophy className="w-5 h-5 text-yellow-400" />}>
      <div className="space-y-6 pb-20 px-2 lg:px-4">
        {/* Current Stage Hero */}
        <div className="bg-black text-white p-6 rounded-3xl border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-1 text-yellow-400">
              {stageInfo.name}
            </h2>
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-4">
              STAGE {stageInfo.stage} ASSETS SECURED
            </p>
            <div className="p-3 bg-white/10 rounded-xl border border-white/20">
              <p className="text-xs font-medium italic opacity-90 line-clamp-3">
                "{stageInfo.description}"
              </p>
            </div>
          </div>
          <Trophy className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
        </div>

        {/* Unified Heat & Risk Status (Combined as requested) */}
        <div className="p-5 bg-black text-white border-4 border-black rounded-3xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${heatLevel === 'normal' ? 'bg-green-500' : heatLevel === 'elevated' ? 'bg-yellow-500' : 'bg-red-500'} bg-opacity-20`}>
                <Flame className={`w-5 h-5 ${heatLevel === 'normal' ? 'text-green-400' : heatLevel === 'elevated' ? 'text-yellow-400' : 'text-red-500'}`} />
              </div>
              <div>
                <div className="text-[10px] font-black uppercase text-white/50">Regulatory Risk</div>
                <div className={`text-lg font-black italic uppercase ${
                  heatLevel === 'normal' ? 'text-green-400' : 
                  heatLevel === 'elevated' ? 'text-yellow-400' : 
                  'text-red-500 font-black'
                }`}>
                  {heat >= 90 ? '🚨 SHITSTORM IMMINENT' : heatLevel.toUpperCase()}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black">{Math.floor(heat)}%</div>
              <div className="text-[8px] font-bold text-white/40 uppercase">Exposure Index</div>
            </div>
          </div>
          
          <div className="h-3 bg-white/10 rounded-full border-2 border-white/20 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${heat}%` }}
              className={`h-full ${
                heatLevel === 'normal' ? 'bg-green-400' : 
                heatLevel === 'elevated' ? 'bg-yellow-400' : 
                'bg-red-500 shadow-[0_0_10px_rgba(255,0,0,0.5)]'
              }`}
            />
          </div>
          <p className="mt-3 text-[10px] font-bold text-white/60 leading-tight">
            {heatLevel === 'normal' ? 'OPERATING UNDER THE RADAR. MINIMAL REGULATORY OVERSIGHT.' :
             heatLevel === 'elevated' ? 'ELEVATED SUSPICION. AUTHORITIES ARE MONITORING DATA TRAFFIC.' :
             'CRITICAL RISK: REGULATORY ACTIONS AND SANCTIONS ARE LIKELY.'}
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="p-5 bg-white border-4 border-black rounded-3xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex justify-between items-end mb-3">
            <div>
              <div className="text-[10px] font-black uppercase text-gray-500">Market Presence</div>
              <div className="text-xl font-black">{formatNumber(Math.floor(users))} USERS</div>
            </div>
            {nextStage && (
              <div className="text-right">
                <div className="text-[8px] font-black uppercase text-gray-400">NExt Milestone</div>
                <div className="text-xs font-black text-blue-600">{formatNumber(nextStage.userThreshold)}</div>
              </div>
            )}
          </div>
          <div className="w-full bg-gray-100 border-2 border-black rounded-full h-4 overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000"
              style={{ width: `${stageProgress * 100}%` }}
            />
          </div>
          {nextStage && (
            <div className="mt-3 flex items-center gap-2 bg-blue-50 p-2 rounded-xl border-2 border-blue-200">
              <ArrowRight className="w-4 h-4 text-blue-600" />
              <div className="text-[10px] font-black uppercase text-blue-900 leading-tight">
                Unlock: <span className="italic">{nextStage.name}</span>
              </div>
            </div>
          )}
        </div>

        {/* Resource Utility Guide */}
        <div className="space-y-3">
          <h3 className="text-sm font-black uppercase italic px-1 flex items-center gap-2">
            <Info className="w-4 h-4" /> Global Intelligence
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {/* Data Utility */}
            <div className="p-4 bg-[#FF6B35]/10 border-2 border-[#FF6B35] rounded-2xl flex gap-4">
              <Database className="w-8 h-8 text-[#FF6B35] shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase text-[#FF6B35]">Data Utility</h4>
                <p className="text-[10px] font-bold opacity-80 uppercase leading-tight">
                  Harvested from citizens. Sell at the <span className="text-[#FF6B35]">Market</span> for instant capital or refine into <span className="text-blue-600">Lab Gems</span> to boost permanent stats.
                </p>
              </div>
            </div>

            {/* Campaign Utility */}
            <div className="p-4 bg-[#4ECDC4]/10 border-2 border-[#4ECDC4] rounded-2xl flex gap-4">
              <Zap className="w-8 h-8 text-[#4ECDC4] shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase text-[#4ECDC4]">Lure Strategy</h4>
                <p className="text-[10px] font-bold opacity-80 uppercase leading-tight">
                  The primary fuel for growth. Campaigns convert raw influence into permanent user-base expansion.
                </p>
              </div>
            </div>

            {/* Empire Utility */}
            <div className="p-4 bg-[#FFD700]/10 border-2 border-[#FFD700] rounded-2xl flex gap-4">
              <Building2 className="w-8 h-8 text-[#FFD700] shrink-0" />
              <div>
                <h4 className="text-xs font-black uppercase text-[#FFBC00]">Infrastructure</h4>
                <p className="text-[10px] font-bold opacity-80 uppercase leading-tight">
                  Departments generate passive income. Higher revenue enables more aggressive luring campaigns.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Gating Tip */}
        <div className="p-4 bg-gray-100 rounded-2xl border-4 border-black mt-4">
          <p className="text-[9px] font-bold text-gray-600 uppercase italic tracking-tighter">
            *PROGRESS THROUGH STAGES TO UNLOCK MORE POWERFUL DEPARTMENTS AND SINISTER TECHNOLOGY SLOTS.
          </p>
        </div>
      </div>
    </AdaptivePanel>
  );
}
