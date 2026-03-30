import React, { useRef } from 'react';
import { BarChart3, Clock, TrendingUp, Users, Star, Download, Upload, Scale, Newspaper, Zap, Crown, Globe, Activity } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import AdaptivePanel from './AdaptivePanel';
import { getStageInfo } from '../lib/utils/stageSystem';

export function StatisticsContent({ onClose }: { onClose: () => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    totalLifetimeIncome,
    totalIncomePerSecond,
    gameStartTime,
    totalPlayTime,
    sessionClicks,
    sessionMoney,
    sessionUsersLured,
    sessionOrbsHarvested,
    sessionDataSold,
    sessionCampaignsUsed,
    formatNumber,
    users,
    totalClicks,
    departments,
    influencePoints,
    advertiserData,
    exportSave,
    importSave,
    prestigeState,
    unlockedAchievements
  } = useMetamanGame();

  const handleExport = () => {
    try {
      const saveString = exportSave();
      const blob = new Blob([saveString], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dopamine-dealer-dan-save-${new Date().toISOString().slice(0, 10)}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Export failed!');
    }
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        const success = importSave(text);
        if (success) {
          alert('Save imported successfully!');
          onClose();
        } else {
          alert('Import failed — invalid save file.');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const formatTime = (milliseconds: number): string => {
    if (!milliseconds || isNaN(milliseconds)) milliseconds = 0;
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // 1. Overall Performance Calculations
  const totalBuildings = departments?.reduce((sum, dept) => sum + dept.owned, 0) || 0;
  const actualPlayTime = totalPlayTime || (Date.now() - (gameStartTime || Date.now()));
  const avgClickValue = totalClicks > 0 ? (totalLifetimeIncome / totalClicks) : 0;
  
  const getEfficiencyRating = (income: number) => {
    if (income < 1000) return { grade: 'D', color: 'text-red-500' };
    if (income < 50000) return { grade: 'C', color: 'text-orange-500' };
    if (income < 1000000) return { grade: 'B', color: 'text-yellow-500' };
    if (income < 100000000) return { grade: 'A', color: 'text-green-500' };
    if (income < 10000000000) return { grade: 'S', color: 'text-blue-500' };
    if (income < 1e12) return { grade: 'S+', color: 'text-purple-500' };
    return { grade: 'S++', color: 'text-[#FFD700]' };
  };
  const efficiency = getEfficiencyRating(totalLifetimeIncome);

  // 3. Mogul Crisis Monitor (Starts after 10 minutes of play)
  const mogulDelayMin = 10;
  const playTimeMin = actualPlayTime / 60000;
  const effectiveMogulTime = Math.max(0, playTimeMin - mogulDelayMin);
  
  const accelerationPhase = Math.max(1, Math.floor(effectiveMogulTime / 2) + 1);
  const totalLawsuits = effectiveMogulTime > 0 ? Math.floor(effectiveMogulTime * 5.5 * accelerationPhase) : 0;
  const scandalsExposed = effectiveMogulTime > 0 ? Math.floor(effectiveMogulTime * 2.8 * accelerationPhase) : 0;
  const mediaArticles = effectiveMogulTime > 0 ? Math.floor(effectiveMogulTime * 10 * accelerationPhase) : 0;
  const prDisasters = effectiveMogulTime > 0 ? Math.floor(effectiveMogulTime * 0.4 * Math.max(1, accelerationPhase - 1)) : 0;

  // 6. Network Dominance
  const stageInfo = getStageInfo(users);

  return (
    <div className="space-y-4 pb-16">

      {/* 1. Overall Performance */}
      <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-gray-100 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>
        <div className="flex justify-between items-start mb-3 relative z-10">
          <h3 className="text-sm font-black uppercase flex items-center gap-2 italic">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Overall Performance
          </h3>
          <div className="text-right">
            <span className="text-[8px] font-black uppercase text-gray-500 block">Efficiency</span>
            <span className={`text-2xl font-black italic shadow-sm ${efficiency.color}`}>{efficiency.grade}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[10px] font-black uppercase italic border-t-2 border-black/10 pt-3 relative z-10">
          <div className="flex justify-between col-span-2 bg-gray-50 p-1.5 rounded-lg border-2 border-transparent hover:border-black transition-colors">
            <span className="text-gray-600">Lifetime Income:</span>
            <span className="text-green-600">${formatNumber(Math.floor(totalLifetimeIncome))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Passive:</span>
            <span>${formatNumber(Math.floor(totalIncomePerSecond))}/s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Depts:</span>
            <span>{Math.floor(totalBuildings)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Total Clicks:</span>
            <span>{formatNumber(Math.floor(totalClicks))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Avg Click Value:</span>
            <span>${formatNumber(Math.floor(avgClickValue))}</span>
          </div>
          <div className="flex justify-between border-t border-black/5 pt-1 mt-1">
            <span className="text-gray-600">Bribes Paid:</span>
            <span className="text-red-500">${formatNumber(Math.floor(totalLifetimeIncome * 0.02))}</span>
          </div>
          <div className="flex justify-between border-t border-black/5 pt-1 mt-1">
            <span className="text-gray-600">Staff Fired:</span>
            <span className="text-orange-600">{formatNumber(Math.floor(totalBuildings * 1.5))}</span>
          </div>
          <div className="flex justify-between col-span-2 text-[#4ECDC4]">
            <span className="text-gray-600">Play Time:</span>
            <span>{formatTime(actualPlayTime)}</span>
          </div>
        </div>
      </div>

      {/* 2. Session Progress */}
      <div className="p-4 bg-black text-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] relative overflow-hidden">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-black uppercase flex items-center gap-2 italic text-[#FFD700]">
            <Clock className="w-4 h-4 text-white" />
            Session Progress
          </h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-black uppercase italic">
          <div className="bg-white/10 p-2 rounded-xl border border-white/20">
            <div className="text-gray-400 text-[8px] mb-0.5">Session Clicks</div>
            <div className="text-sm">{formatNumber(Math.floor(sessionClicks || 0))}</div>
          </div>
          <div className="bg-white/10 p-2 rounded-xl border border-white/20">
            <div className="text-green-400 text-[8px] mb-0.5">Session Money</div>
            <div className="text-sm">${formatNumber(Math.floor(sessionMoney || 0))}</div>
          </div>
          <div className="bg-white/10 p-2 rounded-xl border border-white/20">
            <div className="text-[#4ECDC4] text-[8px] mb-0.5">Users Lured</div>
            <div className="text-sm">{formatNumber(Math.floor(sessionUsersLured || 0))}</div>
          </div>
          <div className="bg-white/10 p-2 rounded-xl border border-white/20">
            <div className="text-[#FF6B35] text-[8px] mb-0.5">Data Sold</div>
            <div className="text-sm">{formatNumber(Math.floor(sessionDataSold || 0))}</div>
          </div>
          <div className="bg-white/10 p-2 rounded-xl border border-white/20">
            <div className="text-[#9D4EDD] text-[8px] mb-0.5">Orbs Harvested</div>
            <div className="text-sm">{formatNumber(Math.floor(sessionOrbsHarvested || 0))}</div>
          </div>
          <div className="bg-white/10 p-2 rounded-xl border border-white/20">
            <div className="text-blue-400 text-[8px] mb-0.5">Campaigns Used</div>
            <div className="text-sm">{formatNumber(Math.floor(sessionCampaignsUsed || 0))}</div>
          </div>
          <div className="bg-white/10 p-2 rounded-xl border border-white/20">
            <div className="text-yellow-400 text-[8px] mb-0.5">NPCs Scammed</div>
            <div className="text-sm">{formatNumber(Math.floor((sessionUsersLured || 0) * 0.85))}</div>
          </div>
        </div>
      </div>

      {/* 3. Mogul Crisis Monitor */}
      <div className="p-4 bg-[#FF1744] border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-white">
        <h3 className="text-sm font-black uppercase flex items-center gap-2 italic mb-3">
          <Newspaper className="w-4 h-4" />
          Mogul Crisis Monitor ⚖️
        </h3>
        <p className="text-[8px] font-bold text-white/80 uppercase mb-3 leading-tight tracking-wider bg-black/20 p-2 rounded-lg">
          "LIVE PR TRACKER. ACCELERATING AS YOUR EMPIRE GROWS."
        </p>
        <div className="space-y-1.5 text-[10px] font-black uppercase italic bg-black p-3 rounded-xl border-2 border-white/20 shadow-inner">
          <div className="flex justify-between items-center text-red-400 text-xs">
            <span>Total Lawsuits Filed</span>
            <span className="font-mono text-white animate-pulse">{formatNumber(totalLawsuits)}</span>
          </div>
          <div className="flex justify-between items-center text-orange-400">
            <span>Scandals Exposed</span>
            <span className="font-mono text-white">{formatNumber(scandalsExposed)}</span>
          </div>
          <div className="flex justify-between items-center text-yellow-500">
            <span>Media Articles</span>
            <span className="font-mono text-white">{formatNumber(mediaArticles)}</span>
          </div>
          <div className="flex justify-between items-center text-[#9D4EDD] pt-1 mt-1 border-t border-white/20">
            <span>PR Disasters</span>
            <span className="font-mono text-white">{formatNumber(prDisasters)}</span>
          </div>
        </div>
      </div>

      {/* 4. Advertiser Revenue System */}
      <div className="p-4 bg-[#FFD700] border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-black">
        <h3 className="text-sm font-black uppercase flex items-center gap-2 italic mb-3">
          <BarChart3 className="w-4 h-4" />
          Advertiser Revenue 📊
        </h3>
        <div className="bg-white rounded-xl p-3 border-2 border-black space-y-2">
          <div className="flex justify-between items-center text-[10px] font-black uppercase">
            <span className="text-gray-600">Data Sold to Advertisers</span>
            <span className="text-sm italic">{formatNumber(Math.floor(advertiserData?.totalDataSold || 0))}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-black uppercase">
            <span className="text-gray-600">Current Income Multiplier</span>
            <span className="text-green-600 text-sm italic">x{(advertiserData?.incomeMultiplier || 1).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-black uppercase">
            <span className="text-gray-600">Milestones Reached</span>
            <span className="text-sm italic">{Math.floor(advertiserData?.milestonesReached || 0)} / 10</span>
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between text-[8px] font-black uppercase mb-1 text-gray-500">
              <span>Progress to Next Tier</span>
              <span>Goal: {formatNumber(advertiserData?.nextMilestone || 100)}</span>
            </div>
            <div className="w-full bg-gray-200 border-2 border-black rounded-full h-3 overflow-hidden">
              <div 
                className="bg-[#FF6B35] h-full"
                style={{ width: `${Math.min(100, ((advertiserData?.totalDataSold || 0) / (advertiserData?.nextMilestone || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 5. Influence & Power */}
      <div className="p-4 bg-purple-600 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] text-white relative overflow-hidden">
        <Crown className="w-32 h-32 absolute -right-6 -top-6 text-white/10 -rotate-12 pointer-events-none" />
        <h3 className="text-sm font-black uppercase flex items-center gap-2 italic mb-3 relative z-10">
          <Star className="w-4 h-4 text-[#FFD700]" />
          Influence & Power
        </h3>
        <div className="space-y-2 relative z-10">
          <div className="flex justify-between items-center p-2 bg-black/30 rounded-lg border border-white/20">
            <span className="text-[10px] font-black uppercase">Influence Points (IP)</span>
            <span className="text-sm font-black italic text-[#FFD700]">{formatNumber(Math.floor(prestigeState?.influencePoints || 0))}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-black/30 rounded-lg border border-white/20">
            <span className="text-[10px] font-black uppercase">Prestige Level</span>
            <span className="text-sm font-black italic text-[#4ECDC4]">{Math.floor(prestigeState?.prestigeLevel || 0)}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-white rounded-lg border-2 border-black text-black">
            <span className="text-[10px] font-black uppercase">Active IP Multiplier</span>
            <span className="text-sm font-black italic text-green-600">{(prestigeState?.prestigeMultiplier || 1).toFixed(2)}x</span>
          </div>
        </div>
      </div>

      {/* 6. Network Dominance */}
      <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] relative">
        <h3 className="text-sm font-black uppercase flex items-center gap-2 italic mb-3 text-blue-900">
          <Globe className="w-4 h-4" />
          Network Dominance
        </h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-blue-50 border-2 border-blue-200 p-2 rounded-xl text-center shadow-inner">
            <div className="text-[8px] font-black uppercase text-blue-500 mb-0.5">Global Stage</div>
            <div className="text-xs font-black italic text-blue-900 leading-tight">{stageInfo.name}</div>
          </div>
          <div className="bg-green-50 border-2 border-green-200 p-2 rounded-xl text-center shadow-inner">
            <div className="text-[8px] font-black uppercase text-green-500 mb-0.5">Next Milestone</div>
            <div className="text-xs font-black italic text-green-700 leading-tight">
              {stageInfo.nextThreshold === Infinity ? 'MAX CAPPED' : formatNumber(stageInfo.nextThreshold)} Users
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-2 bg-gray-100 rounded-lg border-2 border-gray-300">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-gray-500" />
            <span className="text-[10px] font-black uppercase text-gray-700">Unlocked Achievements</span>
          </div>
          <span className="text-sm font-black italic">{unlockedAchievements?.length || 0}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          onClick={handleExport}
          className="w-full bg-white border-4 border-black rounded-xl py-3 font-black uppercase italic shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center justify-center gap-2 active:translate-y-1 active:shadow-none transition-all text-[11px]"
        >
          <Download className="w-4 h-4" /> Export Save
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full bg-black text-white border-4 border-black rounded-xl py-3 font-black uppercase italic shadow-[4px_4px_0_0_rgba(255,255,255,0.2)] hover:bg-gray-900 flex items-center justify-center gap-2 active:translate-y-1 active:shadow-none transition-all text-[11px]"
        >
          <Upload className="w-4 h-4" /> Import Save
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt"
          className="hidden"
          onChange={handleImport}
        />
      </div>
      
    </div>
  );
}

interface StatisticsPanelProps {
  onClose: () => void;
}

export default function StatisticsPanel({ onClose }: StatisticsPanelProps) {
  return (
    <AdaptivePanel title="STATISTICS" onClose={onClose} position="right" icon={<BarChart3 className="w-5 h-5 text-current" />}>
      <StatisticsContent onClose={onClose} />
    </AdaptivePanel>
  );
}