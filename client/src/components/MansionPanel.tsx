import React, { useState, useEffect } from 'react';
import { X, Home, Star, Zap, Users, Shirt, Sparkles, DollarSign, Crown, Eye, Bot, BarChart3, TrendingUp, Clock, Download, Upload, Target } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import AdaptivePanel from './AdaptivePanel';
import AdaptiveText from './AdaptiveText';
import { StatisticsContent } from './StatisticsPanel';
import { ELITES } from '../lib/gameEngine/EliteRegistry';
import { IronicBadgeTab } from './IronicBadges';

interface MansionUpgrade {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'orbs' | 'diamonds' | 'money';
  category: 'luring' | 'decoration' | 'clothing' | 'lifestyle' | 'ops';
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
    orbsInventory,
    incrementOrbsInventory,
    addMansionPurchase,
    exportSave,
    importSave,
    decrementIncome,
    collectedElites,
    hasNewIronicBadge
  } = useMetamanGame();

  const [activeMainTab, setActiveMainTab] = useState<'mansion' | 'bonuses' | 'stats' | 'trophies'>('mansion');
  const [activeMansionTab, setActiveMansionTab] = useState<'luring' | 'decoration' | 'clothing' | 'lifestyle' | 'ops'>('luring');
  const [activeTrophyTab, setActiveTrophyTab] = useState<'badges' | 'elites'>('badges');

  const isUpgradePurchased = (id: string) => mansionPurchases.includes(id);

  const mansionUpgrades: MansionUpgrade[] = [
    // ── LURING (6) ────────────────────────────────────────────────────────────
    {
      id: 'basic_charm',
      name: 'Basic Charm',
      description: '+50 users instantly. Classic social hook.',
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
      description: '+2 max campaign charges. Recharges faster.',
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
      description: 'All user gains ×3 for the next 60s.',
      price: 25,
      currency: 'orbs',
      category: 'luring',
      effect: '×3 user gains 60s',
      bonus: 200,
      icon: <Users className="w-5 h-5" />,
      purchased: isUpgradePurchased('user_multiplier')
    },
    {
      id: 'charm_aura',
      name: 'Charm Aura',
      description: 'Passive user generation +15% permanently.',
      price: 50,
      currency: 'orbs',
      category: 'luring',
      effect: '+15% passive UPS',
      bonus: 15,
      icon: <Star className="w-5 h-5" />,
      purchased: isUpgradePurchased('charm_aura')
    },
    {
      id: 'scroll_magnet',
      name: 'Scroll Magnet',
      description: 'Passive user generation +25% permanently.',
      price: 75,
      currency: 'orbs',
      category: 'luring',
      effect: '+25% passive UPS',
      bonus: 25,
      icon: <TrendingUp className="w-5 h-5" />,
      purchased: isUpgradePurchased('scroll_magnet')
    },
    {
      id: 'viral_amplifier',
      name: 'Viral Amplifier',
      description: 'Campaign user yields +30% permanently.',
      price: 100,
      currency: 'orbs',
      category: 'luring',
      effect: '+30% campaign UPS',
      bonus: 30,
      icon: <Bot className="w-5 h-5" />,
      purchased: isUpgradePurchased('viral_amplifier')
    },
    // ── DECORATION (6) ────────────────────────────────────────────────────────
    {
      id: 'starter_desk',
      name: 'Starter Desk',
      description: 'Basic workspace. +100 users instantly.',
      price: 3,
      currency: 'orbs',
      category: 'decoration',
      effect: '+100 users now',
      bonus: 100,
      icon: <Star className="w-5 h-5" />,
      purchased: isUpgradePurchased('starter_desk')
    },
    {
      id: 'user_generator',
      name: 'User Generator',
      description: '+500 users every 30s automatically.',
      price: 10,
      currency: 'orbs',
      category: 'decoration',
      effect: '+500 users/30s auto',
      bonus: 500,
      icon: <Users className="w-5 h-5" />,
      purchased: isUpgradePurchased('user_generator')
    },
    {
      id: 'golden_desk',
      name: 'Golden Desk',
      description: 'Prestige points +5% permanently.',
      price: 20,
      currency: 'orbs',
      category: 'decoration',
      effect: '+5% prestige pts',
      bonus: 5,
      icon: <DollarSign className="w-5 h-5" />,
      purchased: isUpgradePurchased('golden_desk')
    },
    {
      id: 'neon_sign',
      name: 'Neon "DDD" Sign',
      description: 'Click power +3% permanently.',
      price: 40,
      currency: 'orbs',
      category: 'decoration',
      effect: '+3% click power',
      bonus: 3,
      icon: <Zap className="w-5 h-5" />,
      purchased: isUpgradePurchased('neon_sign')
    },
    {
      id: 'diamond_chandelier',
      name: 'Diamond Chandelier',
      description: 'All bonuses +10% permanently.',
      price: 80,
      currency: 'orbs',
      category: 'decoration',
      effect: '+10% all bonuses',
      bonus: 10,
      icon: <Crown className="w-5 h-5" />,
      purchased: isUpgradePurchased('diamond_chandelier')
    },
    {
      id: 'golden_toilet',
      name: 'Golden Toilet',
      description: 'Random bonus modifier every 10 minutes.',
      price: 500,
      currency: 'diamonds',
      category: 'decoration',
      effect: 'Random bonus/10m',
      bonus: 0,
      icon: <Eye className="w-5 h-5" />,
      purchased: isUpgradePurchased('golden_toilet')
    },
    // ── CLOTHING (3) ──────────────────────────────────────────────────────────
    {
      id: 'casual_tee',
      name: 'Casual Tee',
      description: '+200 users instantly. Relatable vibes.',
      price: 8,
      currency: 'orbs',
      category: 'clothing',
      effect: '+200 users now',
      bonus: 200,
      icon: <Shirt className="w-5 h-5" />,
      purchased: isUpgradePurchased('casual_tee')
    },
    {
      id: 'hype_hoodie',
      name: 'Hype Hoodie',
      description: 'User generation +5% permanently.',
      price: 30,
      currency: 'orbs',
      category: 'clothing',
      effect: '+5% user gen',
      bonus: 5,
      icon: <Shirt className="w-5 h-5" />,
      purchased: isUpgradePurchased('hype_hoodie')
    },
    {
      id: 'golden_chains',
      name: 'Golden Chains',
      description: 'Income multiplier +8% permanently.',
      price: 60,
      currency: 'orbs',
      category: 'clothing',
      effect: '+8% income mult',
      bonus: 8,
      icon: <Crown className="w-5 h-5" />,
      purchased: isUpgradePurchased('golden_chains')
    },
    // ── LIFESTYLE (8) ─────────────────────────────────────────────────────────
    {
      id: 'coffee_subscription',
      name: 'Premium Coffee',
      description: '+500 users. Productivity boost.',
      price: 50,
      currency: 'money',
      category: 'lifestyle',
      effect: '+500 users now',
      bonus: 500,
      icon: <Zap className="w-5 h-5" />,
      purchased: isUpgradePurchased('coffee_subscription')
    },
    {
      id: 'pizza_delivery',
      name: 'Pizza Delivery',
      description: '+750 users. Late-night fuel.',
      price: 75,
      currency: 'money',
      category: 'lifestyle',
      effect: '+750 users now',
      bonus: 750,
      icon: <Target className="w-5 h-5" />,
      purchased: isUpgradePurchased('pizza_delivery')
    },
    {
      id: 'energy_drinks',
      name: 'Energy Crate',
      description: '+1000 users. Massive caffeine hit.',
      price: 150,
      currency: 'money',
      category: 'lifestyle',
      effect: '+1000 users now',
      bonus: 1000,
      icon: <Zap className="w-5 h-5" />,
      purchased: isUpgradePurchased('energy_drinks')
    },
    {
      id: 'office_chair',
      name: 'Ergo Chair',
      description: '+1500 users. Maximum comfort.',
      price: 300,
      currency: 'money',
      category: 'lifestyle',
      effect: '+1500 users now',
      bonus: 1500,
      icon: <Star className="w-5 h-5" />,
      purchased: isUpgradePurchased('office_chair')
    },
    {
      id: 'gaming_setup',
      name: 'Gaming Setup',
      description: '+2000 users. RGB increases clicks.',
      price: 500,
      currency: 'money',
      category: 'lifestyle',
      effect: '+2000 users now',
      bonus: 2000,
      icon: <Target className="w-5 h-5" />,
      purchased: isUpgradePurchased('gaming_setup')
    },
    {
      id: 'business_suit',
      name: 'Business Suit',
      description: '+2500 users. Dress to deceive.',
      price: 750,
      currency: 'money',
      category: 'lifestyle',
      effect: '+2500 users now',
      bonus: 2500,
      icon: <Shirt className="w-5 h-5" />,
      purchased: isUpgradePurchased('business_suit')
    },
    {
      id: 'apartment_upgrade',
      name: 'Apartment Upgrade',
      description: '+3500 users. View from the top.',
      price: 1200,
      currency: 'money',
      category: 'lifestyle',
      effect: '+3500 users now',
      bonus: 3500,
      icon: <Home className="w-5 h-5" />,
      purchased: isUpgradePurchased('apartment_upgrade')
    },
    {
      id: 'vacation_package',
      name: 'Vacation',
      description: '+5000 users. Island scheming.',
      price: 2000,
      currency: 'money',
      category: 'lifestyle',
      effect: '+5000 users now',
      bonus: 5000,
      icon: <Sparkles className="w-5 h-5" />,
      purchased: isUpgradePurchased('vacation_package')
    },
    // ── DARK WEB OPS (Baits) ────────────────────────────────────────────────
    {
      id: 'burned_macbook',
      name: 'Burned MacBook',
      description: 'Target: VC Investors. Encrypted hardware.',
      price: 15,
      currency: 'orbs',
      category: 'ops',
      effect: 'Unlock VC Spawns',
      bonus: 0,
      icon: <Eye className="w-5 h-5" />,
      purchased: isUpgradePurchased('burned_macbook')
    },
    {
      id: 'counter_offer_package',
      name: 'Counter-Offer Package',
      description: 'Target: Headhunters. Massive sign-on bonuses.',
      price: 30,
      currency: 'orbs',
      category: 'ops',
      effect: 'Unlock Headhunters',
      bonus: 0,
      icon: <Users className="w-5 h-5" />,
      purchased: isUpgradePurchased('counter_offer_package')
    },
    {
      id: 'web3_partnership',
      name: 'Web3 Partnership',
      description: 'Target: Crypto Billionaires. Tokenize your soul.',
      price: 60,
      currency: 'orbs',
      category: 'ops',
      effect: 'Unlock Crypto Elites',
      bonus: 0,
      icon: <TrendingUp className="w-5 h-5" />,
      purchased: isUpgradePurchased('web3_partnership')
    },
    {
      id: 'esg_compliance_report',
      name: 'ESG Report (Fake)',
      description: 'Target: Pension Fund Managers. Pure fiction.',
      price: 250000,
      currency: 'money',
      category: 'ops',
      effect: 'Unlock Whale Investors',
      bonus: 0,
      icon: <BarChart3 className="w-5 h-5" />,
      purchased: isUpgradePurchased('esg_compliance_report')
    },
    {
      id: 'consulting_engagement',
      name: 'Consulting Engagement',
      description: 'Target: Big 4 Auditors. Buy their silence.',
      price: 500000,
      currency: 'money',
      category: 'ops',
      effect: 'Unlock Deep State Elites',
      bonus: 0,
      icon: <Bot className="w-5 h-5" />,
      purchased: isUpgradePurchased('consulting_engagement')
    },
    {
      id: 'platform_reinstatement',
      name: 'Platform Reinstatement',
      description: 'Target: Ex-Presidents. Regain your lost reach.',
      price: 2000000,
      currency: 'money',
      category: 'ops',
      effect: 'Unlock Head of State',
      bonus: 0,
      icon: <Crown className="w-5 h-5" />,
      purchased: isUpgradePurchased('platform_reinstatement')
    }
  ];

  const availableDiamonds = Math.floor(dataInventory / 100);

  const purchaseUpgrade = (upgrade: MansionUpgrade) => {
    const cost = upgrade.price;
    const available = upgrade.currency === 'money' ? income : (upgrade.currency === 'diamonds' ? availableDiamonds : orbsInventory);
    
    if (available >= cost && !upgrade.purchased) {
      if (upgrade.currency === 'orbs') {
        incrementOrbsInventory(-upgrade.price);
      } else if (upgrade.currency === 'money') {
        decrementIncome(upgrade.price);
      }
      addMansionPurchase(upgrade.id);
      
      // Instant user bonuses
      const instantBoosts: Record<string, number> = {
        basic_charm: 50,
        starter_desk: 100,
        casual_tee: 200,
        user_generator: 500,
        coffee_subscription: 500,
        pizza_delivery: 750,
        energy_drinks: 1000,
        office_chair: 1500,
        gaming_setup: 2000,
        business_suit: 2500,
        apartment_upgrade: 3500,
        vacation_package: 5000
      };
      if (instantBoosts[upgrade.id]) {
        incrementUsers(instantBoosts[upgrade.id]);
      }
    }
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

        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {(['luring', 'ops', 'decoration', 'clothing', 'lifestyle'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveMansionTab(tab)}
              className={`px-3 py-2 border-4 border-black rounded-xl font-black uppercase italic text-[9px] transition-all ${
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
                  <div className="text-sm font-black italic mb-1 flex items-center justify-end gap-1">
                    {upgrade.currency === 'money' ? <DollarSign className="w-3 h-3"/> : ''}
                    {formatNumber(upgrade.price)}
                    {upgrade.currency !== 'money' && (upgrade.currency === 'diamonds' ? ' 💎' : ' orb')}
                  </div>
                  <button
                    onClick={() => purchaseUpgrade(upgrade)}
                    disabled={upgrade.purchased || (upgrade.currency === 'money' ? income < upgrade.price : (upgrade.currency === 'diamonds' ? availableDiamonds < upgrade.price : orbsInventory < upgrade.price))}
                    className={`px-3 py-1 border-4 border-black rounded-xl font-black uppercase italic text-[10px] transition-all ${
                      upgrade.purchased ? 'bg-[#4ECDC4] opacity-50' : (upgrade.currency === 'money' && income < upgrade.price) || (upgrade.currency === 'orbs' && orbsInventory < upgrade.price) ? 'bg-gray-200 text-gray-400' : 'bg-[#FFD700] active:scale-95 shadow-[2px_2px_0_0_black]'
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

  const renderStats = () => {
    return <StatisticsContent onClose={onClose} />;
  };


  const renderBonuses = () => {
    const activeMansion = mansionPurchases;
    const bonusRows: { label: string; value: string; source: string; color: string }[] = [
      ...(activeMansion.includes('charm_aura')         ? [{ label: 'Passive UPS',      value: '+15%', source: 'Charm Aura',    color: 'bg-yellow-100' }] : []),
      ...(activeMansion.includes('scroll_magnet')      ? [{ label: 'Passive UPS',      value: '+25%', source: 'Scroll Magnet', color: 'bg-yellow-100' }] : []),
      ...(activeMansion.includes('viral_amplifier')    ? [{ label: 'Campaign yields',  value: '+30%', source: 'Viral Amplifier', color: 'bg-yellow-100' }] : []),
      ...(activeMansion.includes('neon_sign')          ? [{ label: 'Click power',      value: '+3%',  source: 'Neon Sign',     color: 'bg-blue-100' }] : []),
      ...(activeMansion.includes('diamond_chandelier') ? [{ label: 'All bonuses',      value: '+10%', source: 'Chandelier',    color: 'bg-purple-100' }] : []),
      ...(activeMansion.includes('hype_hoodie')        ? [{ label: 'User generation',  value: '+5%',  source: 'Hype Hoodie',   color: 'bg-green-100' }] : []),
      ...(activeMansion.includes('golden_chains')      ? [{ label: 'Income mult.',     value: '+8%',  source: 'Golden Chains', color: 'bg-amber-100' }] : []),
      ...(activeMansion.includes('golden_desk')        ? [{ label: 'Prestige pts',     value: '+5%',  source: 'Golden Desk',   color: 'bg-orange-100' }] : []),
    ];

    return (
      <div className="space-y-4 pb-10">
        <div className="p-3 bg-black text-white rounded-xl border-4 border-black">
          <div className="text-[9px] font-black uppercase text-yellow-400 mb-1">🎯 Command Center</div>
          <div className="text-[8px] text-gray-400 uppercase">All active bonuses from every source</div>
        </div>
        {bonusRows.length === 0 ? (
          <div className="text-center py-8 bg-white border-4 border-black rounded-2xl">
            <div className="text-2xl mb-2">🏚️</div>
            <div className="text-xs font-black uppercase text-gray-500">No active bonuses yet</div>
            <div className="text-[9px] font-bold text-gray-400 uppercase">Buy upgrades in Mansion, Lab & Shop</div>
          </div>
        ) : (
          <div className="space-y-2">
            {bonusRows.map((row, i) => (
              <div key={i} className={`flex items-center justify-between p-3 ${row.color} border-2 border-black rounded-xl`}>
                <div>
                  <div className="text-[10px] font-black uppercase">{row.label}</div>
                  <div className="text-[8px] font-bold text-gray-500 uppercase">{row.source}</div>
                </div>
                <div className="text-sm font-black text-green-700 italic">{row.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderTrophies = () => {
    // ELITES is now imported at the top
    
    return (
      <div className="space-y-4">
        {/* Sub-tabs for Trophies */}
        <div className="flex bg-gray-200 p-1 rounded-xl border-4 border-black mb-4">
          <button
            onClick={() => setActiveTrophyTab('badges')}
            className={`flex-1 py-3 px-4 font-black text-sm uppercase rounded-lg transition-all relative ${
              activeTrophyTab === 'badges' 
                ? 'bg-black text-white shadow-[0_4px_0_0_#333]' 
                : 'text-gray-500 hover:text-black hover:bg-gray-300'
            }`}
          >
            Corporate Badges
            {hasNewIronicBadge && (
              <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]" />
            )}
          </button>
          <button
            onClick={() => setActiveTrophyTab('elites')}
            className={`flex-1 py-3 px-4 font-black text-sm uppercase rounded-lg transition-all ${
              activeTrophyTab === 'elites' 
                ? 'bg-black text-white shadow-[0_4px_0_0_#333]' 
                : 'text-gray-500 hover:text-black hover:bg-gray-300'
            }`}
          >
            Elite Collection
          </button>
        </div>

        {activeTrophyTab === 'badges' && <IronicBadgeTab />}
        
        {activeTrophyTab === 'elites' && (
          <div className="space-y-6 pb-10">
            <div className="p-4 bg-gradient-to-r from-yellow-100 to-amber-200 border-4 border-black rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white border-4 border-black rounded-full flex items-center justify-center text-4xl shadow-[2px_2px_0_0_black]">
              🏆
            </div>
            <div>
              <h3 className="text-xl font-black italic uppercase">The Elite Collection</h3>
              <p className="text-[10px] font-bold text-black uppercase opacity-60">
                You have captured {collectedElites.length} / {ELITES.length} high-value targets.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ELITES.map((elite: any) => {
            const isCaptured = collectedElites.includes(elite.id);
            
            return (
              <div 
                key={elite.id} 
                className={`group relative overflow-hidden bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all ${
                  isCaptured ? 'opacity-100 scale-100' : 'opacity-40 grayscale translate-y-1'
                }`}
              >
                {!isCaptured && (
                  <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/10 backdrop-blur-[1px]">
                    <Eye className="w-8 h-8 text-black opacity-20" />
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center text-3xl border-2 border-black rounded-xl ${isCaptured ? 'bg-yellow-50' : 'bg-gray-100'}`}>
                    {isCaptured ? elite.visual : '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-xs uppercase italic truncate max-w-[120px]">
                        {isCaptured ? elite.name : '??? UNKNOWN'}
                      </h4>
                      <div className={`px-2 py-0.5 border-2 border-black rounded-full text-[8px] font-black uppercase ${
                        elite.tier === 3 ? 'bg-red-500 text-white' : elite.tier === 2 ? 'bg-yellow-400' : 'bg-green-400'
                      }`}>
                        TIER {elite.tier}
                      </div>
                    </div>
                    
                    <p className="text-[9px] font-bold text-gray-600 uppercase mt-1 line-clamp-2 leading-tight">
                      {isCaptured ? elite.danQuip : "Capture this individual to unlock their profile."}
                    </p>
                    
                    {isCaptured && (
                      <div className="mt-3 pt-2 border-t-2 border-black/5 flex items-center justify-between">
                        <div className="flex items-center gap-1 text-[8px] font-black text-green-600 uppercase">
                          <Users className="w-3 h-3" />
                          +{formatNumber(elite.userValue)} Users
                        </div>
                        <div className="text-[8px] font-black uppercase text-gray-400 italic">
                          Captured
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
      </div>
    );
  };

  return (
    <AdaptivePanel title="DAN'S SUITE" onClose={onClose} position="center" className="max-w-2xl">
      {/* Main Tabs */}
      <div className="flex gap-1 mb-6 flex-wrap">
        <button
          onClick={() => setActiveMainTab('mansion')}
          className={`flex-1 py-2 border-4 border-black rounded-xl font-black uppercase italic text-[10px] transition-all ${
            activeMainTab === 'mansion' ? 'bg-[#FFD700] shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white'
          }`}
        >
          Mansion
        </button>
        <button
          onClick={() => setActiveMainTab('bonuses')}
          className={`flex-1 py-2 border-4 border-black rounded-xl font-black uppercase italic text-[10px] transition-all ${
            activeMainTab === 'bonuses' ? 'bg-[#FF6B35] text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white'
          }`}
        >
          Bonuses
        </button>

        <button
          onClick={() => setActiveMainTab('stats')}
          className={`flex-1 py-2 border-4 border-black rounded-xl font-black uppercase italic text-[10px] transition-all ${
            activeMainTab === 'stats' ? 'bg-gray-800 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white'
          }`}
        >
          Stats
        </button>
        <button
          onClick={() => setActiveMainTab('trophies')}
          className={`flex-1 py-2 border-4 border-black rounded-xl font-black uppercase italic text-[10px] transition-all ${
            activeMainTab === 'trophies' ? 'bg-[#FFD700] shadow-[2px_2px_0_0_rgba(0,0,0,1)]' : 'bg-white'
          }`}
        >
          Trophies
        </button>
      </div>

      <div className="px-1">
        {activeMainTab === 'mansion' && renderMansion()}
        {activeMainTab === 'bonuses' && renderBonuses()}
        {activeMainTab === 'stats' && renderStats()}
        {activeMainTab === 'trophies' && renderTrophies()}
      </div>
    </AdaptivePanel>
  );
}
