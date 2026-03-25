import React from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { getStage, getStageInfo, getStageProgress } from '../lib/utils/stageSystem';
import { Flame } from 'lucide-react';

export default function HeatMeter({ onClick }: { onClick?: () => void }) {
  const heat = useMetamanGame(state => state.heat);
  const heatLevel = useMetamanGame(state => state.heatLevel);
  const users = useMetamanGame(state => state.users);

  const stageInfo = getStageInfo(users);
  const stageProgress = getStageProgress(users);

  const heatColors: Record<string, string> = {
    normal:    'bg-green-400',
    elevated:  'bg-yellow-400',
    critical:  'bg-orange-500',
    emergency: 'bg-red-600',
  };
  const heatBg = heatColors[heatLevel] ?? 'bg-green-400';

  const heatLabels: Record<string, string> = {
    normal:    'COOL',
    elevated:  'WARM',
    critical:  'HOT!',
    emergency: '🚨 CRISIS',
  };

  return (
    <div 
      className={`flex flex-col gap-1 px-2 py-1 bg-black rounded-xl border-2 border-white/30 select-none ${onClick ? 'cursor-pointer hover:border-white/60 transition-colors active:scale-95' : ''}`}
      onClick={onClick}
    >
      {/* Stage indicator */}
      <div className="flex items-center justify-between">
        <span className="text-[8px] font-black uppercase text-white/60 tracking-widest">
          Stage {stageInfo.stage}
        </span>
        <span className="text-[8px] font-black uppercase text-white/80 italic truncate max-w-[80px]">
          {stageInfo.name}
        </span>
      </div>
      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-400 rounded-full transition-all duration-500"
          style={{ width: `${stageProgress * 100}%` }}
        />
      </div>

      {/* Heat indicator */}
      <div className="flex items-center gap-1 mt-0.5">
        <Flame className="w-3 h-3 text-orange-400 shrink-0" />
        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div
            className={`h-full ${heatBg} rounded-full transition-all duration-300`}
            style={{ width: `${heat}%` }}
          />
        </div>
        <span className={`text-[7px] font-black uppercase tracking-wide ${
          heatLevel === 'emergency' ? 'text-red-400 animate-pulse' :
          heatLevel === 'critical'  ? 'text-orange-400' :
          heatLevel === 'elevated'  ? 'text-yellow-400' : 'text-green-400'
        }`}>
          {heatLabels[heatLevel]}
        </span>
      </div>
    </div>
  );
}
