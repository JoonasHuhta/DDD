import React, { useMemo, useState } from 'react';
import { 
  Database, 
  DollarSign, 
  TrendingUp, 
  Zap, 
  Flame, 
  Users,
  Target,
  Skull,
  AlertTriangle,
  Lock,
  Ghost,
  Bot
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import AdaptivePanel from './AdaptivePanel';
import AdaptiveText from './AdaptiveText';

export default function DataMarketPanel({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'market' | 'darkweb'>('market');

  const { 
    dataInventory,
    income,
    users,
    advertiserData,
    shopPurchases,
    sellAllData,
    formatNumber,
    decrementIncome,
    incrementUsers,
    modifyHeat,
    addBuff,
    addShopPurchase
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

  const darkWebItems = [
    { id: 'user_injection', name: 'User Injection', desc: '+3,000 users instantly', price: 2000, effect: 'Flat boost', icon: <Users size={16}/> },
    { id: 'notification_overdose', name: 'Notification Overdose', desc: '5x income for 60 seconds + 5,000 users', price: 4000, effect: 'Temporary Buff', icon: <Zap size={16}/> },
    { id: 'scroll_addiction_serum', name: 'Scroll Serum', desc: '+8,000 users & permanent +10% passive income', price: 6000, effect: 'Permanent', icon: <TrendingUp size={16}/> },
    { id: 'fomo_amplification', name: 'FOMO Amplification', desc: '10x manual click power for 30s + 12,000 users', price: 10000, effect: 'Temporary Buff', icon: <Target size={16}/> },
    { id: 'competitor_spy', name: 'Competitor Spy Toolkit', desc: '+15,000 users', price: 20000, effect: 'Flat boost', icon: <Ghost size={16}/> },
    { id: 'cat_videos_2', name: 'Cat Videos 2.0', desc: '+20,000 users. WARNING: +50 Heat!', price: 18000, effect: 'High Risk', icon: <AlertTriangle size={16} className="text-red-500"/> },
    { id: 'data_mining_malware', name: 'Data Malware', desc: '+22,000 users', price: 28000, effect: 'Flat boost', icon: <Database size={16}/> },
    { id: 'deepfake_gen', name: 'Deepfake Generator', desc: '+30,000 users', price: 35000, effect: 'Flat boost', icon: <Ghost size={16}/> },
    { id: 'algo_hack', name: 'Algorithm Hack Suite', desc: '+40,000 users', price: 50000, effect: 'Flat boost', icon: <Lock size={16}/> },
    { id: 'dopamine_enhancer', name: 'Dopamine Enhancer', desc: '+50,000 users', price: 50000, effect: 'Flat boost', icon: <Zap size={16}/> },
    { id: 'algo_bot', name: 'Algorithm Manipulator Bot', desc: '+75,000 users', price: 75000, effect: 'Flat boost', icon: <Bot size={16}/> },
    { id: 'pirated_ai_trainer', name: 'Pirated Data AI', desc: '+75,000 users. WARNING: Max Legal Risk (+100 Heat)', price: 1500000, effect: 'Extreme Risk', icon: <AlertTriangle size={16} className="text-red-600 animate-pulse"/> },
    { id: 'hypnosis_device', name: 'Hypnosis Broadcast', desc: '+100,000 users', price: 2500000, effect: 'Flat boost', icon: <Target size={16}/> },
    { id: 'count_clickula_pact', name: 'Count Clickula Blood Pact', desc: '+150,000 users. Requires 2M Users.', price: 5000000, effect: 'Unlockable', icon: <Skull size={16} className="text-red-600"/> }
  ];

  const handleDarkWebPurchase = (item: any) => {
    if (income < item.price || shopPurchases.includes(item.id)) return;
    if (item.id === 'count_clickula_pact' && users < 2000000) return;

    decrementIncome(item.price);
    addShopPurchase(item.id);

    // Baseline user boosts
    const boosts: Record<string, number> = {
      user_injection: 3000,
      notification_overdose: 5000,
      scroll_addiction_serum: 8000,
      fomo_amplification: 12000,
      competitor_spy: 15000,
      cat_videos_2: 20000,
      data_mining_malware: 22000,
      deepfake_gen: 30000,
      algo_hack: 40000,
      dopamine_enhancer: 50000,
      algo_bot: 75000,
      pirated_ai_trainer: 75000,
      hypnosis_device: 100000,
      count_clickula_pact: 150000
    };
    if (boosts[item.id]) incrementUsers(boosts[item.id]);

    // Special Mechanics Hookup
    if (item.id === 'notification_overdose') {
      addBuff({ id: item.id, type: 'income', multiplier: 5, expiresAt: Date.now() + 60000 });
    } else if (item.id === 'scroll_addiction_serum') {
      addBuff({ id: item.id, type: 'income', multiplier: 1.1, expiresAt: null });
    } else if (item.id === 'fomo_amplification') {
      addBuff({ id: item.id, type: 'click', multiplier: 10, expiresAt: Date.now() + 30000 });
    } else if (item.id === 'cat_videos_2') {
      modifyHeat(50, 'data');
    } else if (item.id === 'pirated_ai_trainer') {
      modifyHeat(100, 'data');
    }
  };

  return (
    <AdaptivePanel 
      title="DATA BROKER" 
      onClose={onClose} 
      position="center" 
      icon={<Database className="w-5 h-5 text-cyan-400" />}
    >
      {/* Header Tabs */}
      <div className="flex px-4 pt-2 -mb-2 z-10 relative gap-2">
        <button 
          onClick={() => setActiveTab('market')}
          className={`flex-1 py-3 border-4 border-black rounded-t-2xl font-black uppercase italic transition-all ${
            activeTab === 'market' ? 'bg-[#FFD700] text-black shadow-none border-b-0 translate-y-1' : 'bg-gray-200 text-gray-500 shadow-[2px_-2px_0_0_rgba(0,0,0,1)]'
          }`}
        >
          WHITELIST
        </button>
        <button 
          onClick={() => setActiveTab('darkweb')}
          className={`flex-1 py-3 border-4 border-black rounded-t-2xl font-black uppercase italic flex items-center justify-center gap-2 transition-all ${
            activeTab === 'darkweb' ? 'bg-red-600 text-white shadow-none border-b-0 translate-y-1' : 'bg-gray-900 text-gray-600 shadow-[2px_-2px_0_0_rgba(0,0,0,1)]'
          }`}
        >
          <Skull size={18} />
          DARK WEB
        </button>
      </div>

      <div className="space-y-6 pb-20 px-2 lg:px-4 relative z-0">
        {activeTab === 'darkweb' ? (
          <div className="bg-gray-900 border-4 border-black rounded-b-2xl rounded-tr-2xl p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] min-h-[400px]">
            <div className="flex justify-between items-center bg-black border-2 border-red-500 rounded-xl p-3 mb-4">
              <span className="text-red-500 font-black uppercase animate-pulse flex items-center gap-2">
                <AlertTriangle size={16} /> UNREGISTERED CONNECTION
              </span>
              <span className="text-green-400 font-black italic">$ {formatNumber(income)}</span>
            </div>
            
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {darkWebItems.map(item => {
                const isOwned = shopPurchases.includes(item.id);
                const isLocked = item.id === 'count_clickula_pact' && users < 2000000;
                const canAfford = income >= item.price;
                return (
                  <div key={item.id} className={`p-3 bg-black border-2 border-gray-700 rounded-xl transition-all ${isOwned ? 'opacity-50 grayscale' : 'hover:border-red-500 hover:shadow-[4px_4px_0_0_rgba(255,0,0,0.5)]'}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-800 p-2 rounded-lg text-red-500 border border-red-900">
                          {item.icon}
                        </div>
                        <div>
                          <h4 className="text-white font-black uppercase text-xs tracking-wider">{item.name}</h4>
                          <span className="text-[9px] text-red-400 font-bold uppercase">{item.effect}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-black italic text-sm mb-1">${formatNumber(item.price)}</div>
                        <button
                          onClick={() => handleDarkWebPurchase(item)}
                          disabled={isOwned || !canAfford || isLocked}
                          className={`px-3 py-1 font-black uppercase italic text-[10px] rounded-lg border-2 border-black transition-all ${
                            isOwned ? 'bg-gray-600 text-gray-400' : isLocked ? 'bg-red-900 text-gray-500' : canAfford ? 'bg-red-600 text-white hover:bg-red-500 active:scale-95 shadow-[2px_2px_0_0_black]' : 'bg-gray-800 text-gray-500'
                          }`}
                        >
                          {isOwned ? 'OWNED' : isLocked ? 'LOCKED (2M USERS)' : canAfford ? 'EXECUTE' : 'FUNDS LOW'}
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-400 text-[10px] uppercase font-bold leading-tight">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-black/40 border-4 border-black rounded-b-2xl rounded-tr-2xl p-4 shadow-[8px_8px_0_0_rgba(0,0,0,1)] mt-0 space-y-6">
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
      )}
      </div>
    </AdaptivePanel>
  );
}
