import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Database, 
  MapPin, 
  Wallet, 
  Fingerprint, 
  DollarSign, 
  AlertTriangle,
  ArrowRight,
  LineChart,
  User,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import AdaptivePanel from './AdaptivePanel';
import AdaptiveText from './AdaptiveText';

const DATA_TYPES = [
  { id: 'behavioral', name: 'Behavioral Data', icon: <User className="w-5 h-5 text-blue-400" />, desc: 'User habits, scroll patterns, and engagement metrics.' },
  { id: 'location', name: 'Location Logs', icon: <MapPin className="w-5 h-5 text-green-400" />, desc: 'GPS history, frequent stops, and travel patterns.' },
  { id: 'financial', name: 'Financial Profiles', icon: <Wallet className="w-5 h-5 text-yellow-400" />, desc: 'Spending habits, credit scores, and bank balance estimates.' },
  { id: 'biometric', name: 'Biometric Scans', icon: <Fingerprint className="w-5 h-5 text-purple-400" />, desc: 'Retinal patterns, pulse rates, and DNA markers.' }
];

const BUYERS = [
  { id: 'adtech_andy', name: 'AdTech Andy', desc: 'Predictive advertising firm.', multiplier: 1.1, heat: 1, color: 'text-blue-400' },
  { id: 'legit_corp', name: 'Global Solutions Inc.', desc: 'Legit corporate data aggregator.', multiplier: 1.0, heat: 0.5, color: 'text-gray-400' },
  { id: 'shadow_broker', name: 'The Void Oracle', desc: 'Dark web intermediary.', multiplier: 1.5, heat: 3.0, color: 'text-red-500' }
];

export default function DataMarketPanel({ onClose }: { onClose: () => void }) {
  const { 
    dataMarket, 
    sellData, 
    formatNumber, 
    updateMarketPrices,
    blackMarketState 
  } = useMetamanGame();

  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedBuyer, setSelectedBuyer] = useState(BUYERS[1]); // Default to Legit Corp
  const [sellPercent, setSellPercent] = useState(1); // 0.25, 0.5, 1.0

  // Update prices on mount and every 30s
  useEffect(() => {
    updateMarketPrices();
    const interval = setInterval(updateMarketPrices, 30000);
    return () => clearInterval(interval);
  }, [updateMarketPrices]);

  const handleSell = (typeId: any) => {
    const inventory = dataMarket.inventory[typeId as keyof typeof dataMarket.inventory];
    if (inventory <= 0) return;

    const amount = Math.floor(inventory * sellPercent);
    if (amount <= 0) return;

    sellData(
      typeId as any, 
      amount, 
      selectedBuyer.multiplier, 
      selectedBuyer.heat
    );
  };

  const getPriceTrend = (typeId: string) => {
    if (dataMarket.history.length < 2) return 'stable';
    const current = dataMarket.prices[typeId as keyof typeof dataMarket.prices];
    const prev = dataMarket.history[dataMarket.history.length - 2].prices[typeId as keyof typeof dataMarket.prices];
    
    if (current > prev) return 'up';
    if (current < prev) return 'down';
    return 'stable';
  };

  return (
    <AdaptivePanel 
      title="DATAMARKET BOURSE" 
      onClose={onClose} 
      position="center" 
      icon={<LineChart className="w-5 h-5 text-cyan-400" />}
    >
      <div className="space-y-6 pb-20 px-2">
        {/* Market Stats Header */}
        <div className="p-4 bg-black/40 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <AdaptiveText className="text-[10px] font-black text-cyan-400 uppercase italic">Market Condition: Volatile</AdaptiveText>
            <div className="flex items-center gap-1">
              <ShieldAlert className="w-4 h-4 text-orange-500" />
              <div className="text-[10px] font-black text-orange-500 uppercase">HEAT: {blackMarketState.regulatoryHeat.toFixed(1)}%</div>
            </div>
          </div>
          <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden border-2 border-black">
            <motion.div 
              className="h-full bg-cyan-500 shadow-[0_0_10px_cyan]"
              initial={{ width: "0%" }}
              animate={{ width: `${Math.min(100, blackMarketState.regulatoryHeat)}%` }}
            />
          </div>
        </div>

        {/* Data Types Grid */}
        <div className="grid grid-cols-1 gap-4">
          {DATA_TYPES.map(type => {
            const inventory = dataMarket.inventory[type.id as keyof typeof dataMarket.inventory];
            const price = dataMarket.prices[type.id as keyof typeof dataMarket.prices];
            const trend = getPriceTrend(type.id);
            const isSelected = selectedType === type.id;

            return (
              <motion.div 
                key={type.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedType(isSelected ? null : type.id)}
                className={`group p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all cursor-pointer ${
                  isSelected ? 'bg-cyan-50 border-cyan-500 -translate-y-1' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-black rounded-xl text-white group-hover:scale-110 transition-transform">
                      {type.icon}
                    </div>
                    <div>
                      <h4 className="font-black text-xs uppercase italic leading-none">{type.name}</h4>
                      <div className="text-[8px] font-bold text-gray-500 uppercase mt-1">Inv: {formatNumber(inventory)} units</div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                      {trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                      <span className={`text-sm font-black ${
                        trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-black'
                      }`}>
                        ${price}
                      </span>
                    </div>
                    <div className="text-[7px] font-black text-gray-400 uppercase italic">Per Unit</div>
                  </div>
                </div>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 mt-4 border-t-2 border-black/10">
                        <p className="text-[9px] font-bold text-gray-500 uppercase italic mb-4 leading-tight">
                          {type.desc}
                        </p>
                        
                        {/* Sell Controls */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between gap-2">
                            {[0.25, 0.5, 1].map(p => (
                              <button
                                key={p}
                                onClick={(e) => { e.stopPropagation(); setSellPercent(p); }}
                                className={`flex-1 py-1 text-[8px] font-black rounded-lg border-2 border-black transition-all ${
                                  sellPercent === p ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                                }`}
                              >
                                {p === 1 ? 'MAX' : `${p * 100}%`}
                              </button>
                            ))}
                          </div>

                          <div className="grid grid-cols-1 gap-2">
                            {BUYERS.map(buyer => (
                              <button
                                key={buyer.id}
                                onClick={(e) => { e.stopPropagation(); setSelectedBuyer(buyer); handleSell(type.id); }}
                                disabled={inventory <= 0}
                                className={`group/btn flex items-center justify-between p-3 border-4 border-black rounded-xl font-black uppercase italic text-[10px] transition-all relative overflow-hidden ${
                                  inventory > 0 ? 'bg-white hover:bg-black hover:text-white' : 'bg-gray-100 text-gray-400 grayscale'
                                }`}
                              >
                                <div className="flex flex-col items-start z-10">
                                  <span className={buyer.color}>{buyer.name}</span>
                                  <span className="text-[7px] opacity-70 group-hover/btn:text-cyan-300 italic">{buyer.desc}</span>
                                </div>
                                <div className="flex flex-col items-end z-10">
                                  <div className="flex items-center gap-1">
                                    <ArrowRight className="w-4 h-4" />
                                    <span>${formatNumber(Math.floor(inventory * sellPercent * price * buyer.multiplier))}</span>
                                  </div>
                                  <div className="text-[7px] opacity-70">Payout: {buyer.multiplier}x | Heat: +{buyer.heat}%</div>
                                </div>
                                
                                {inventory > 0 && (
                                  <motion.div 
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000"
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Warning Board */}
        <div className="p-4 bg-red-50 border-4 border-red-500 rounded-2xl flex items-start gap-4 shadow-[4px_4px_0_0_rgba(239,68,68,1)]">
          <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
          <div>
            <h4 className="text-xs font-black uppercase text-red-600">Trading Disclosure</h4>
            <p className="text-[8px] font-black uppercase leading-tight text-red-400 mt-1">
              Sales to high-risk buyers increase Regulatory Heat. Reaching 100% Heat triggers immediate Lawsuits and Investigations. Sell responsibly or pay the price.
            </p>
          </div>
        </div>
      </div>
    </AdaptivePanel>
  );
}
