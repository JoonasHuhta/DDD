import React, { useState, useEffect } from 'react';
import { ShoppingCart, Lock, Zap, Users, Target, Eye, UserPlus, Star, DollarSign, Timer, Skull, AlertTriangle, TrendingUp, Brain, Bot, Radio, X } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { getGameConfig } from '../lib/config/GameConfig';
import AdaptivePanel from './AdaptivePanel';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'money' | 'orbs';
  influenceBonus: number;
  luckBonus: number;
  icon: React.ReactNode;
  category: 'normal' | 'blackmarket';
}

interface ShopPanelProps {
  onClose: () => void;
}

export default function ShopPanel({ onClose }: ShopPanelProps) {
  const { 
    income, 
    dataInventory, 
    formatNumber, 
    blackMarketState,
    users,
    checkDanVisitTrigger,
    purchaseBlackMarketItem,
    updateBlackMarketTimer,
    decrementIncome,
    setDataInventory,
    incrementUsers,
    shopPurchases,
    addShopPurchase
  } = useMetamanGame();
  const [activeTab, setActiveTab] = useState<'normal' | 'blackmarket'>('normal');
  
  // Check for Dan visits and update timers
  useEffect(() => {
    checkDanVisitTrigger();
    
    // Update timer every second if black market is open
    const interval = setInterval(() => {
      if (blackMarketState.isOpen) {
        updateBlackMarketTimer();
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [users, income, blackMarketState.isOpen]);
  
  // Check if black market should be unlocked
  const blackMarketUnlocked = blackMarketState.isUnlocked;

  const normalShopItems: ShopItem[] = [
    {
      id: 'coffee_subscription',
      name: '☕ Premium Coffee Subscription',
      description: 'Keep Dan caffeinated and focused - boosts productivity +500 users',
      price: 50,
      currency: 'money',
      influenceBonus: 3,
      luckBonus: 2,
      icon: <Zap className="w-4 h-4" />,
      category: 'normal'
    },
    {
      id: 'pizza_delivery',
      name: '🍕 Dan\'s Pizza Delivery',
      description: 'Late-night coding fuel - improves work efficiency +750 users',
      price: 75,
      currency: 'money',
      influenceBonus: 5,
      luckBonus: 3,
      icon: <Target className="w-4 h-4" />,
      category: 'normal'
    },
    {
      id: 'energy_drinks',
      name: '⚡ Energy Drink Crates',
      description: 'Industrial supply for all-nighters - massive boost +1000 users',
      price: 150,
      currency: 'money',
      influenceBonus: 8,
      luckBonus: 4,
      icon: <Zap className="w-4 h-4" />,
      category: 'normal'
    },
    {
      id: 'office_chair',
      name: '🪑 Ergonomic Office Chair',
      description: 'Comfort while scheming - long-term efficiency +1500 users',
      price: 300,
      currency: 'money',
      influenceBonus: 12,
      luckBonus: 6,
      icon: <Users className="w-4 h-4" />,
      category: 'normal'
    },
    {
      id: 'gaming_setup',
      name: '🎮 Dan\'s Gaming Setup',
      description: 'Work hard, play hard - better mood, better ideas +2000 users',
      price: 500,
      currency: 'money',
      influenceBonus: 15,
      luckBonus: 8,
      icon: <Target className="w-4 h-4" />,
      category: 'normal'
    },
    {
      id: 'business_suit',
      name: '👔 Professional Business Suit',
      description: 'Look legitimate for investor meetings +2500 users',
      price: 750,
      currency: 'money',
      influenceBonus: 20,
      luckBonus: 10,
      icon: <Users className="w-4 h-4" />,
      category: 'normal'
    },
    {
      id: 'apartment_upgrade',
      name: '🏠 Dan\'s Apartment Upgrade',
      description: 'Better living = better business ideas +3500 users',
      price: 1200,
      currency: 'money',
      influenceBonus: 25,
      luckBonus: 12,
      icon: <Target className="w-4 h-4" />,
      category: 'normal'
    },
    {
      id: 'vacation_package',
      name: '🏖️ Dan\'s Vacation Package',
      description: 'Rest leads to breakthrough innovations +5000 users',
      price: 2000,
      currency: 'money',
      influenceBonus: 35,
      luckBonus: 18,
      icon: <Zap className="w-4 h-4" />,
      category: 'normal'
    }
  ];

  const blackMarketItems: ShopItem[] = [
    {
      id: 'user_injection',
      name: 'User Injection',
      description: 'Instant +3000 users injection - black market special',
      price: 2000,
      currency: 'money',
      influenceBonus: 15,
      luckBonus: 10,
      icon: <Users className="w-4 h-4" />,
      category: 'blackmarket'
    },
    {
      id: 'notification_overdose',
      name: 'Notification Overdose',
      description: '5x income for 60 seconds + 5000 users - highly addictive',
      price: 4000,
      currency: 'money',
      influenceBonus: 15,
      luckBonus: 10,
      icon: <AlertTriangle className="w-4 h-4" />,
      category: 'blackmarket'
    },
    {
      id: 'scroll_addiction_serum',
      name: 'Scroll Addiction Serum',
      description: 'Users generate passive income 24/7 + 8000 users',
      price: 6000,
      currency: 'money',
      influenceBonus: 25,
      luckBonus: 15,
      icon: <TrendingUp className="w-4 h-4" />,
      category: 'blackmarket'
    },
    {
      id: 'pirated_ai_trainer',
      name: 'Pirated Data AI Trainer',
      description: 'Train AI on stolen books +75000 users',
      price: 1500000,
      currency: 'money',
      influenceBonus: 120,
      luckBonus: 60,
      icon: <Brain className="w-4 h-4" />,
      category: 'blackmarket'
    }
  ];

  const canAfford = (item: ShopItem) => {
    return item.currency === 'money' ? income >= item.price : dataInventory >= item.price;
  };

  const isAlreadyPurchased = (item: ShopItem) => {
    return shopPurchases.includes(item.id);
  };

  const purchaseItem = (item: ShopItem) => {
    if (!canAfford(item) || isAlreadyPurchased(item)) return;
    
    if (item.currency === 'money') {
      decrementIncome(item.price);
    } else {
      setDataInventory(dataInventory - item.price);
    }

    let userBoost = 0;
    if (item.id === 'user_injection') userBoost = 3000;
    else if (item.id === 'notification_overdose') userBoost = 5000;
    else if (item.id === 'coffee_subscription') userBoost = 500;
    else if (item.id === 'pizza_delivery') userBoost = 750;
    else if (item.id === 'energy_drinks') userBoost = 1000;
    else if (item.id === 'office_chair') userBoost = 1500;
    else if (item.id === 'gaming_setup') userBoost = 2000;
    else if (item.id === 'business_suit') userBoost = 2500;
    else if (item.id === 'apartment_upgrade') userBoost = 3500;
    else if (item.id === 'vacation_package') userBoost = 5000;
    else if (item.id === 'pirated_ai_trainer') userBoost = 75000;

    if (userBoost > 0) {
      incrementUsers(userBoost);
    }

    // Record purchase in the game store (saved with the game)
    addShopPurchase(item.id);
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderShopItems = (items: ShopItem[]) => {
    return items.map((item) => (
      <div key={item.id} className="bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-lg border-2 border-black ${item.category === 'blackmarket' ? 'bg-[#FF1744] text-white' : 'bg-[#4ECDC4] text-black'}`}>
                {item.icon}
              </div>
              <h3 className="font-black text-black uppercase italic tracking-tighter">{item.name}</h3>
            </div>
            <p className="text-gray-600 font-bold text-xs mb-3 italic">{item.description}</p>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase text-black">
              <div className="flex items-center gap-1"><Star className="w-3 h-3" /><span>+{item.influenceBonus} Inf</span></div>
              <div className="flex items-center gap-1"><Zap className="w-3 h-3" /><span>+{item.luckBonus} Luck</span></div>
            </div>
          </div>
          <div className="ml-4 text-right">
            <div className="text-xl font-black text-black italic mb-2">
              {item.currency === 'money' ? '$' : ''}{formatNumber(item.price)}{item.currency === 'orbs' ? ' orb' : ''}
            </div>
            <button
              onClick={() => purchaseItem(item)}
              disabled={!canAfford(item) || isAlreadyPurchased(item)}
              className={`px-6 py-2 border-4 border-black rounded-xl font-black uppercase italic transition-all transform active:scale-95 ${
                isAlreadyPurchased(item) ? 'bg-[#4ECDC4] opacity-50' : canAfford(item) ? (item.category === 'blackmarket' ? 'bg-[#FF1744]' : 'bg-[#FFD700]') : 'bg-gray-200 text-gray-400'
              }`}
            >
              {isAlreadyPurchased(item) ? 'OWNED' : canAfford(item) ? 'BUY!' : 'BROKE'}
            </button>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <AdaptivePanel title="METAMAN SHOP" onClose={onClose} position="center" className="max-w-4xl">
      <div className="flex items-center justify-between p-4 bg-white border-4 border-black rounded-2xl mb-6 shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
        <div className="flex gap-4">
          <div className="bg-[#4ECDC4] px-4 py-2 border-4 border-black rounded-xl font-black italic">${formatNumber(income)}</div>
          <div className="bg-[#FFD700] px-4 py-2 border-4 border-black rounded-xl font-black italic">{dataInventory} ORBS</div>
        </div>
        <div className="hidden md:flex gap-4 text-xs font-black uppercase text-black italic">
          <span>Owned: {shopPurchases.length}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('normal')} className={`flex-1 py-3 border-4 border-black rounded-xl font-black uppercase italic transition-all ${activeTab === 'normal' ? 'bg-[#FFD700] translate-y-1' : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}>REGULAR</button>
        <button onClick={() => setActiveTab('blackmarket')} disabled={!blackMarketUnlocked} className={`flex-1 py-3 border-4 border-black rounded-xl font-black uppercase italic transition-all ${!blackMarketUnlocked ? 'opacity-50 grayscale' : activeTab === 'blackmarket' ? 'bg-[#FF1744] text-white translate-y-1' : 'bg-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]'}`}>SHADY STUFF {!blackMarketUnlocked && '🔒'}</button>
      </div>

      <div className="space-y-6">
        {activeTab === 'normal' ? (
          <div className="grid gap-4">{renderShopItems(normalShopItems)}</div>
        ) : (
          <div className="space-y-6">
            {blackMarketState.isOpen ? (
              <>
                <div className="p-4 bg-[#FF1744] border-4 border-black rounded-2xl text-white shadow-[6px_6px_0_0_rgba(0,0,0,1)] animate-pulse">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-black italic uppercase">VAN IS HERE!</h3>
                    <div className="font-black italic uppercase">{formatTime(blackMarketState.timeRemaining)}</div>
                  </div>
                </div>
                <div className="grid gap-4">{renderShopItems(blackMarketItems)}</div>
              </>
            ) : (
              <div className="p-8 text-center bg-white border-4 border-black rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
                <Skull className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-black text-black uppercase italic">VAN IS GONE!</h3>
                <p className="font-bold text-gray-600 uppercase">Wait for {formatNumber(blackMarketState.nextUserThreshold)} users...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdaptivePanel>
  );
}