import React, { useState, useEffect } from 'react';
import { X, Home, Star, Zap, Users, Shirt, Sparkles, DollarSign, Crown, Eye, Bot, BarChart3, TrendingUp, Clock, Download, Upload } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import AdaptivePanel from './AdaptivePanel';
import AdaptiveText from './AdaptiveText';

interface MansionUpgrade {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'orbs' | 'diamonds';
  category: 'luring' | 'decoration' | 'clothing';
  effect: string;
  bonus: number;
  icon: React.ReactNode;
  purchased: boolean;
}

interface MansionPanelProps {
  onClose: () => void;
}

export default function MansionPanel({ onClose }: MansionPanelProps) {
  const { 
    dataInventory,
    income,
    users,
    formatNumber,
    setDataInventory,
    incrementUsers,
    automationSystem,
    purchaseAutomationUpgrade,
    totalLifetimeIncome,
    totalIncomePerSecond,
    gameStartTime,
    sessionClicks,
    sessionMoney,
    sessionUsersLured,
    sessionOrbsHarvested,
    totalClicks,
    departments,
    advertiserData,
    mansionPurchases,
    addMansionPurchase,
    exportSave,
    importSave
  } = useMetamanGame();

  const [activeMainTab, setActiveMainTab] = useState<'mansion' | 'automation' | 'stats'>('mansion');
  const [activeMansionTab, setActiveMansionTab] = useState<'luring' | 'decoration' | 'clothing'>('luring');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const isUpgradePurchased = (id: string) => mansionPurchases.includes(id);

  const mansionUpgrades: MansionUpgrade[] = [
    {
      id: 'basic_charm',
      name: 'Basic Charm',
      description: 'Small user attraction boost +50 users instantly',
      price: 5,
      currency: 'orbs',
      category: 'luring',
      effect: '+50 users now',
      bonus: 50,
      icon: <Sparkles className="w-5 h-5" />,
      purchased: isUpgradePurchased('basic_charm')
    },
    {
      id: 'lure_charger',
      name: 'Lure Charger',
      description: '+2 lure charges maximum',
      price: 15,
      currency: 'orbs',
      category: 'luring',
      effect: '+2 max charges',
      bonus: 2,
      icon: <Zap className="w-5 h-5" />,
      purchased: isUpgradePurchased('lure_charger')
    },
    {
      id: 'user_multiplier',
      name: 'User Multiplier',
      description: 'Massive growth boost',
      price: 25,
      currency: 'orbs',
      category: 'luring',
      effect: '+200% user gains',
      bonus: 200,
      icon: <Users className="w-5 h-5" />,
      purchased: isUpgradePurchased('user_multiplier')
    },
    {
      id: 'starter_desk',
      name: 'Starter Desk',
      description: 'Basic workspace +100 users instantly',
      price: 3,
      currency: 'orbs',
      category: 'decoration',
      effect: '+100 users now',
      bonus: 100,
      icon: <Star className="w-5 h-5" />,
      purchased: isUpgradePurchased('starter_desk')
    }
  ];

  const availableDiamonds = Math.floor(dataInventory / 100);

  const purchaseUpgrade = (upgrade: MansionUpgrade) => {
    const cost = upgrade.price;
    const available = upgrade.currency === 'diamonds' ? availableDiamonds : dataInventory;
    
    if (available >= cost && !upgrade.purchased) {
      if (upgrade.currency === 'orbs') {
        setDataInventory(dataInventory - upgrade.price);
      }
      addMansionPurchase(upgrade.id);
      
      if (upgrade.id === 'basic_charm') incrementUsers(50);
      else if (upgrade.id === 'starter_desk') incrementUsers(100);
    }
  };

  const handleExport = () => {
    exportSave();
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) {
        importSave(content);
        onClose();
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const renderMansion = () => {
    const currentUpgrades = mansionUpgrades.filter(u => u.category === activeMansionTab);
    return (
      <div className="space-y-6">
        <div className="bg-white border-4 border-black rounded-2xl p-4 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-black italic">{Math.floor(users)}</div>
              <div className="text-xs font-bold uppercase text-gray-600">USERS</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black italic">${formatNumber(Math.floor(income))}</div>
              <div className="text-xs font-bold uppercase text-gray-600">REVENUE</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {(['luring', 'decoration', 'clothing'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveMansionTab(tab)}
              className={`flex-1 py-2 border-4 border-black rounded-xl font-black uppercase italic text-[10px] transition-all ${
                activeMansionTab === tab ? 'bg-[#FFD700] translate-y-1' : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {currentUpgrades.map(upgrade => (
            <div key={upgrade.id} className="bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border-2 border-black ${upgrade.purchased ? 'bg-[#4ECDC4]' : 'bg-gray-100'}`}>
                    {upgrade.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-black text-xs uppercase italic">{upgrade.name}</h4>
                    <p className="text-[10px] font-bold text-gray-600 uppercase">{upgrade.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-black italic mb-1">
                    {upgrade.price} {upgrade.currency === 'diamonds' ? '💎' : 'orb'}
                  </div>
                  <button
                    onClick={() => purchaseUpgrade(upgrade)}
                    disabled={upgrade.purchased || (upgrade.currency === 'diamonds' ? availableDiamonds < upgrade.price : dataInventory < upgrade.price)}
                    className={`px-3 py-1 border-4 border-black rounded-xl font-black uppercase italic text-[10px] transition-all ${
                      upgrade.purchased ? 'bg-[#4ECDC4] opacity-50' : 'bg-[#FFD700]'
                    }`}
                  >
                    {upgrade.purchased ? 'OWNED' : 'BUY'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAutomation = () => {
    const availableUpgrades = automationSystem?.getAvailableUpgrades({
      totalClicks: totalClicks,
      totalIncome: income,
      automationState: automationSystem?.getState()
    }) || [];

    return (
      <div className="space-y-4 pb-10">
        <div className="p-4 bg-gray-900 border-4 border-black rounded-2xl text-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="text-xs font-bold text-blue-400 uppercase mb-2 italic">Active Systems</div>
          <div className="grid grid-cols-3 gap-2 text-[8px] font-black uppercase text-center">
            <div className={`p-2 border-2 border-black rounded-lg ${automationSystem?.getState().autoClickerEnabled ? 'bg-green-600' : 'bg-red-900'}`}>Clicker</div>
            <div className={`p-2 border-2 border-black rounded-lg ${automationSystem?.getState().autoBuyerEnabled ? 'bg-green-600' : 'bg-red-900'}`}>Buyer</div>
            <div className={`p-2 border-2 border-black rounded-lg ${automationSystem?.getState().smartBuyerEnabled ? 'bg-green-600' : 'bg-red-900'}`}>Smart</div>
          </div>
        </div>

        <div className="space-y-3">
          {availableUpgrades.length === 0 ? (
            <div className="text-center py-10 bg-white border-4 border-black rounded-2xl">
              <div className="text-xs font-black uppercase text-gray-500">No Upgrades Available</div>
            </div>
          ) : (
            availableUpgrades.map(upgrade => {
              const cost = automationSystem?.getUpgradeCost(upgrade.id) || 0;
              const canAfford = income >= cost;
              return (
                <div key={upgrade.id} className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-xs uppercase italic">{upgrade.name}</h4>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">LVL {upgrade.currentLevel}/{upgrade.maxLevel}</span>
                  </div>
                  <p className="text-[9px] font-bold text-gray-600 uppercase mb-3 leading-none">{upgrade.description}</p>
                  <button
                    onClick={() => purchaseAutomationUpgrade?.(upgrade.id)}
                    disabled={!canAfford}
                    className={`w-full py-2 border-4 border-black rounded-xl font-black uppercase italic text-[10px] transition-all ${
                      canAfford ? 'bg-[#FFD700] hover:bg-yellow-400' : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    UPGRADE ${formatNumber(cost)}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderStats = () => {
    const totalBuildings = departments?.reduce((sum, dept) => sum + dept.owned, 0) || 0;
    const totalPlayTime = Date.now() - gameStartTime;
    const formatTime = (ms: number) => {
      const sec = Math.floor(ms / 1000);
      const min = Math.floor(sec / 60);
      const hrs = Math.floor(min / 60);
      if (hrs > 0) return `${hrs}h ${min % 60}m`;
      return `${min}m ${sec % 60}s`;
    };

    return (
      <div className="space-y-4 pb-10">
        <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <h3 className="text-xs font-black uppercase italic mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Lifetime Performance
          </h3>
          <div className="space-y-1 text-[10px] font-black uppercase italic border-t-2 border-black pt-2">
            <div className="flex justify-between"><span>Revenue:</span><span>${formatNumber(totalLifetimeIncome)}</span></div>
            <div className="flex justify-between"><span>Passive:</span><span>${formatNumber(totalIncomePerSecond)}/s</span></div>
            <div className="flex justify-between"><span>Buildings:</span><span>{totalBuildings}</span></div>
            <div className="flex justify-between"><span>Time:</span><span>{formatTime(totalPlayTime)}</span></div>
          </div>
        </div>

        <div className="p-4 bg-[#4ECDC4] border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <h3 className="text-xs font-black uppercase italic mb-2">Advertiser Data</h3>
          <div className="flex justify-between text-[10px] font-black uppercase mb-2">
            <span>Sold:</span><span>{formatNumber(advertiserData?.totalDataSold || 0)} units</span>
          </div>
          <div className="w-full bg-white border-2 border-black rounded-full h-3 overflow-hidden">
            <div 
              className="bg-[#FF6B35] h-full"
              style={{ width: `${Math.min(100, ((advertiserData?.totalDataSold || 0) / (advertiserData?.nextMilestone || 1)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExport}
            className="bg-white border-4 border-black rounded-xl py-2 font-black uppercase italic text-[10px] shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button
            onClick={handleImport}
            className="bg-white border-4 border-black rounded-xl py-2 font-black uppercase italic text-[10px] shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none flex items-center justify-center gap-2"
          >
            <Upload className="w-4 h-4" /> Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    );
  };

  return (
    <AdaptivePanel title="DAN'S SUITE" onClose={onClose} position="center" className="max-w-2xl">
      {/* Main Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveMainTab('mansion')}
          className={`flex-1 py-3 border-4 border-black rounded-xl font-black uppercase italic text-xs transition-all ${
            activeMainTab === 'mansion' ? 'bg-[#FFD700] shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white'
          }`}
        >
          Mansion
        </button>
        <button
          onClick={() => setActiveMainTab('automation')}
          className={`flex-1 py-3 border-4 border-black rounded-xl font-black uppercase italic text-xs transition-all ${
            activeMainTab === 'automation' ? 'bg-[#FF6B35] text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white'
          }`}
        >
          Automation
        </button>
        <button
          onClick={() => setActiveMainTab('stats')}
          className={`flex-1 py-3 border-4 border-black rounded-xl font-black uppercase italic text-xs transition-all ${
            activeMainTab === 'stats' ? 'bg-[#4ECDC4] shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white'
          }`}
        >
          Stats
        </button>
      </div>

      <div className="px-1">
        {activeMainTab === 'mansion' && renderMansion()}
        {activeMainTab === 'automation' && renderAutomation()}
        {activeMainTab === 'stats' && renderStats()}
      </div>
    </AdaptivePanel>
  );
}