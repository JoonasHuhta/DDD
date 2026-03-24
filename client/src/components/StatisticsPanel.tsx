import React, { useRef } from 'react';
import { BarChart3, Clock, TrendingUp, Users, Star, Download, Upload } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import AdaptivePanel from './AdaptivePanel';

interface StatisticsPanelProps {
  onClose: () => void;
}

export default function StatisticsPanel({ onClose }: StatisticsPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    totalLifetimeIncome,
    totalIncomePerSecond,
    gameStartTime,
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
    importSave
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
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const totalBuildings = departments?.reduce((sum, dept) => sum + dept.owned, 0) || 0;
  const totalPlayTime = Date.now() - gameStartTime;

  return (
    <AdaptivePanel title="STATISTICS" onClose={onClose} position="right">
      <div className="space-y-4">
        {/* Lifetime Stats */}
        <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-black" />
            <span className="text-sm font-black text-black uppercase">Lifetime Performance</span>
          </div>
          <div className="space-y-2 text-[10px] font-black uppercase text-black italic">
            <div className="flex justify-between"><span>Revenue:</span><span>${formatNumber(Math.floor(totalLifetimeIncome))}</span></div>
            <div className="flex justify-between"><span>Passive:</span><span>${formatNumber(Math.floor(totalIncomePerSecond))}/s</span></div>
            <div className="flex justify-between"><span>Depts:</span><span>{Math.floor(totalBuildings)}</span></div>
            <div className="flex justify-between"><span>Time:</span><span>{formatTime(totalPlayTime)}</span></div>
          </div>
        </div>

        {/* Session Stats */}
        <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-black" />
            <span className="text-sm font-black text-black uppercase">Current Session</span>
          </div>
          <div className="space-y-2 text-[10px] font-black uppercase text-black italic">
            <div className="flex justify-between"><span>Clicks:</span><span>{formatNumber(Math.floor(sessionClicks || 0))}</span></div>
            <div className="flex justify-between"><span>Income:</span><span>${formatNumber(Math.floor(sessionMoney || 0))}</span></div>
            <div className="flex justify-between"><span>Lured:</span><span>{formatNumber(Math.floor(sessionUsersLured || 0))}</span></div>
            <div className="flex justify-between"><span>Orbs:</span><span>{formatNumber(Math.floor(sessionOrbsHarvested || 0))}</span></div>
          </div>
        </div>

        {/* Data System */}
        <div className="p-4 bg-[#4ECDC4] border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="text-sm font-black text-black uppercase mb-2 italic">Advertiser Data</div>
          <div className="flex justify-between text-[10px] font-black uppercase text-black mb-2">
            <span>Sold:</span><span>{formatNumber(Math.floor(advertiserData?.totalDataSold || 0))} units</span>
          </div>
          <div className="w-full bg-white border-2 border-black rounded-full h-4 overflow-hidden mb-1">
            <div 
              className="bg-[#FF6B35] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, ((advertiserData?.totalDataSold || 0) / (advertiserData?.nextMilestone || 1)) * 100)}%` }}
            />
          </div>
          <div className="text-right text-[8px] font-black uppercase">Next: {formatNumber(advertiserData?.nextMilestone || 100)}</div>
        </div>

        {/* Save/Load */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            className="bg-white border-4 border-black rounded-xl py-2 font-black uppercase italic shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center justify-center gap-2 active:translate-y-1 active:shadow-none"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border-4 border-black rounded-xl py-2 font-black uppercase italic shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-gray-100 flex items-center justify-center gap-2 active:translate-y-1 active:shadow-none"
          >
            <Upload className="w-4 h-4" /> Import
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
    </AdaptivePanel>
  );
}