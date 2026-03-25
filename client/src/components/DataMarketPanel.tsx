import React, { useMemo } from 'react';
import { 
  Database, 
  DollarSign, 
  TrendingUp, 
  Zap, 
  Flame, 
  Users,
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import AdaptivePanel from './AdaptivePanel';
import AdaptiveText from './AdaptiveText';

export default function DataMarketPanel({ onClose }: { onClose: () => void }) {
  const { 
    dataInventory,
    advertiserData,
    sellAllData,
    formatNumber
  } = useMetamanGame();

  // bulk pricing formula: orbs × 50 × (1 + orbs/20) × advertiserMultiplier
  const estimatedPayout = useMemo(() => {
    if (dataInventory <= 0) return 0;
    return Math.floor(dataInventory * 50 * (1 + dataInventory / 20) * advertiserData.incomeMultiplier);
  }, [dataInventory, advertiserData.incomeMultiplier]);

  const campaignBonus = useMemo(() => Math.min(5, Math.floor(dataInventory / 10)), [dataInventory]);
  const permOrbGain = useMemo(() => Math.floor(dataInventory * 0.05), [dataInventory]);
  const heatSpike = useMemo(() => (dataInventory > 20 ? Math.floor(dataInventory / 10) : 0), [dataInventory]);

  const milestoneProgress = useMemo(() => {
    // Basic linear progress between milestones for UI
    const total = advertiserData.nextMilestone;
    const current = advertiserData.totalDataSold;
    return Math.min(100, Math.max(0, (current / total) * 100));
  }, [advertiserData.totalDataSold, advertiserData.nextMilestone]);

  return (
    <AdaptivePanel 
      title="DATA BROKER" 
      onClose={onClose} 
      position="center" 
      icon={<Database className="w-5 h-5 text-cyan-400" />}
    >
      <div className="space-y-6 pb-20 px-2 lg:px-4">
        {/* Main Sell Section */}
        <div className="p-6 bg-black/40 border-4 border-black rounded-3xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] text-center space-y-4">
          <div className="flex flex-col items-center gap-1">
            <AdaptiveText className="text-[10px] font-black text-cyan-400 uppercase italic tracking-widest">Available Inventory</AdaptiveText>
            <div className="flex items-center gap-3">
              <Database className="w-8 h-8 text-cyan-500" />
              <span className="text-4xl font-black text-white italic drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                {formatNumber(dataInventory)}
              </span>
              <span className="text-xl font-black text-cyan-500 italic opacity-50">ORBS</span>
            </div>
          </div>

          <div className="pt-2">
            <motion.button
              whileHover={dataInventory > 0 ? { scale: 1.02 } : {}}
              whileTap={dataInventory > 0 ? { scale: 0.98 } : {}}
              disabled={dataInventory <= 0}
              onClick={() => {
                if (dataInventory > 0) {
                  sellAllData();
                }
              }}
              className={`group w-full p-8 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] relative overflow-hidden transition-all ${
                dataInventory > 0 
                  ? 'bg-yellow-400 hover:bg-yellow-300' 
                  : 'bg-gray-800 border-gray-900 cursor-not-allowed opacity-50 grayscale'
              }`}
            >
              <div className="relative z-10 flex flex-col items-center gap-2">
                <span className="text-[10px] font-black text-black uppercase tracking-tighter">Profit Forecast</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-black" />
                  <span className="text-3xl font-black text-black leading-none">
                    ${formatNumber(estimatedPayout)}
                  </span>
                </div>
                <span className="text-[12px] font-black text-black uppercase italic mt-2">
                  {dataInventory > 0 ? ">>> SELL ALL DATA NOW <<<" : "NO DATA COLLECTED"}
                </span>
              </div>
              
              {dataInventory > 0 && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full"
                  animate={{ translateX: ["-100%", "200%"] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
              )}
            </motion.button>
          </div>

          <div className="text-[8px] font-bold text-gray-500 uppercase italic">
            Strategy: Bulk selling yields massive exponential bonuses per orb.
          </div>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-[10px] font-black uppercase italic">Recharge</span>
            </div>
            <div className="text-lg font-black text-black leading-tight">-{formatNumber(30)}s</div>
            <div className="text-[7px] font-bold text-gray-400 uppercase leading-none mt-1">Campaign Cooldowns</div>
          </div>

          <div className="p-3 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase italic">Charges</span>
            </div>
            <div className="text-lg font-black text-black leading-tight">+{campaignBonus}</div>
            <div className="text-[7px] font-bold text-gray-400 uppercase leading-none mt-1">Campaign Loads</div>
          </div>

          <div className="p-3 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-[10px] font-black uppercase italic">Permanent</span>
            </div>
            <div className="text-lg font-black text-black leading-tight">+{permOrbGain}</div>
            <div className="text-[7px] font-bold text-gray-400 uppercase leading-none mt-1">Retention Orbs</div>
          </div>

          <div className="p-3 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <div className="flex items-center gap-2 mb-1">
              <Flame className={`w-4 h-4 ${heatSpike > 0 ? 'text-red-600 animate-bounce' : 'text-gray-300'}`} />
              <span className="text-[10px] font-black uppercase italic">Heat</span>
            </div>
            <div className={`text-lg font-black leading-tight ${heatSpike > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              +{heatSpike}%
            </div>
            <div className="text-[7px] font-bold text-gray-400 uppercase leading-none mt-1">Regulatory Spike</div>
          </div>
        </div>

        {/* Milestone Progress */}
        <div className="p-4 bg-cyan-900/10 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-600" />
              <AdaptiveText className="text-[10px] font-black text-cyan-700 uppercase italic">Advertiser Milestone</AdaptiveText>
            </div>
            <span className="text-[10px] font-black text-cyan-600 italic">x{(advertiserData.incomeMultiplier).toFixed(2)} Bonus</span>
          </div>
          
          <div className="h-4 w-full bg-white border-4 border-black rounded-full overflow-hidden relative">
            <motion.div 
              className="h-full bg-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${milestoneProgress}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-black uppercase">
              {formatNumber(advertiserData.totalDataSold)} / {formatNumber(advertiserData.nextMilestone)} Total SOLD
            </div>
          </div>
          
          <div className="text-[7px] font-bold text-gray-500 uppercase italic mt-2 text-center">
            Next Level: Permanent Income Multiplier Boost
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 bg-red-50 border-4 border-red-500 rounded-2xl flex items-start gap-4 shadow-[4px_2px_0_0_rgba(239,68,68,1)]">
          <span className="text-xl">⚠️</span>
          <div>
            <h4 className="text-[9px] font-black uppercase text-red-600 tracking-widest">NDA VIOLATION RISK</h4>
            <p className="text-[7px] font-bold uppercase leading-tight text-red-400 mt-1 italic">
              Heavy data harvesting spikes regulatory heat. If heat hits 100%, expect server raids and legal bombardment.
            </p>
          </div>
        </div>
      </div>
    </AdaptivePanel>
  );
}
