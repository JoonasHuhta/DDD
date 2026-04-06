import React, { useEffect, useMemo } from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { Eye, ShieldX, Globe2, Clock, Leaf, Building2, Heart, Users, Zap, CircleDot, Crown, MessageCircle, FileCheck2, UserMinus } from 'lucide-react';

interface IronicBadgeDef {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  condition: (state: any) => boolean;
}

// 1. Badge Definitions
const IRONIC_BADGES: IronicBadgeDef[] = [
  {
    id: 'data_vampire',
    name: 'Data Vampire',
    description: 'We collect data so we can serve you better.',
    icon: Eye,
    condition: (state) => state.totalDataCollected > 1000000
  },
  {
    id: 'privacy_champion',
    name: 'Privacy Champion™',
    description: 'Extracted their privacy while maintaining flawless PR.',
    icon: ShieldX, // Paradoxical icon
    condition: (state) => state.totalDataCollected > 1000000 && state.regulatoryRisk < 10
  },
  {
    id: 'world_peace',
    name: 'World Peace Honor Award',
    description: 'Survived maximum public outrage while continuing rapid expansion. A true unifier.',
    icon: Globe2,
    condition: (state) => state.regulatoryRisk >= 95 && state.users > 5000000
  },
  {
    id: 'infinite_scroll',
    name: 'Infinite Scroll Architect',
    description: 'Designed a Skinner box so perfect they forget to sleep.',
    icon: Clock,
    condition: (state) => state.sessionClicks > 5000 || state.totalPlayTime > 14400000 // 4 hours
  },
  {
    id: 'accidentally_ethical',
    name: 'Accidentally Ethical',
    description: 'Failed to monetize effectively. Branded it as "Ethics".',
    icon: Leaf,
    condition: (state) => state.income < 1000 && (Date.now() - state.gameStartTime) > 900000 // 15 mins
  },
  {
    id: 'too_big_to_fail',
    name: 'Too Big to Fail',
    description: 'Broke society, became fundamental to its function.',
    icon: Building2,
    condition: (state) => state.users > 150000000 && state.lawsuitMilestones && Object.keys(state.lawsuitMilestones).length > 2
  },
  {
    id: 'we_care_initiative',
    name: 'We Care Initiative',
    description: 'You added a heart icon. Problem solved.',
    icon: Heart,
    condition: (state) => state.lawsuitState?.isActive && state.campaignCharges === 0 // Spammed campaigns during a crisis
  },
  {
    id: 'shadow_profile',
    name: 'Shadow Profile Division',
    description: 'They aren\'t your users. Yet.',
    icon: UserMinus,
    condition: (state) => state.totalDataCollected > (state.users * 15) && state.users > 1000 // Substantially more data than actual users
  },
  {
    id: 'dopamine_dealer',
    name: 'Dopamine Dealer',
    description: 'Small reward. Again. And again.',
    icon: Zap,
    condition: (state) => state.totalClicks > 10000 // Just endless clicking
  },
  {
    id: 'red_dot',
    name: 'Red Dot Authority',
    description: 'One tiny dot. Total control.',
    icon: CircleDot,
    condition: (state) => state.rewardState?.rewards?.filter((r: any) => !r.claimed).length >= 5 // Leaving unclicked notifications
  },
  {
    id: 'whale_whisperer',
    name: 'Whale Whisperer',
    description: 'One is enough.',
    icon: Crown,
    condition: (state) => state.totalIncomePerSecond > 10000000 && state.users < 500000 // Massive income from a relatively small user base window
  },
  {
    id: 'thoughts_and_prayers',
    name: 'Thoughts & Prayers Update',
    description: 'You published a gray text box. The mob moved on.',
    icon: MessageCircle,
    condition: (state) => !state.lawsuitState?.isActive && state.lawsuitMilestones && Object.keys(state.lawsuitMilestones).length >= 5 // Passed 5 lawsuits
  },
  {
    id: 'terms_accepted',
    name: 'Terms Accepted',
    description: 'They clicked "I Agree". Classic.',
    icon: FileCheck2,
    condition: (state) => state.totalPlayTime > 300000 // Played for 5 minutes
  }
];

/**
 * An invisible tracker that regularly checks the conditions and unlocks badges.
 * Render this anywhere in GameUI.
 */
export function IronicBadgeTracker() {
  const state = useMetamanGame();

  useEffect(() => {
    // Check constraints periodically
    const interval = setInterval(() => {
      // Use latest state explicitly
      const latestState = useMetamanGame.getState();
      IRONIC_BADGES.forEach(badge => {
        if (!latestState.ironicBadges.includes(badge.id)) {
          if (badge.condition(latestState)) {
            latestState.unlockIronicBadge(badge.id);
          }
        }
      });
    }, 5000); // Check every 5s

    return () => clearInterval(interval);
  }, []);

  return null;
}

/**
 * The purely cosmetic UI rendering the badges grid.
 */
export function IronicBadgeTab() {
  const { ironicBadges, clearNewIronicBadge } = useMetamanGame();

  // Clear new badge notification on mount
  useEffect(() => {
    clearNewIronicBadge();
  }, [clearNewIronicBadge]);

  return (
    <div className="space-y-6 pb-10">
      <div className="p-4 bg-gradient-to-r from-gray-800 to-black border-4 border-gray-600 rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-black border-4 border-gray-600 rounded-full flex items-center justify-center shadow-[2px_2px_0_0_black]">
            <span className="text-3xl grayscale">💼</span>
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase text-gray-300">Corporate Milestones</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase opacity-80">
              Your ethical compromises formally recognized. ({ironicBadges.length} / {IRONIC_BADGES.length})
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {IRONIC_BADGES.map(badge => {
          const isUnlocked = ironicBadges.includes(badge.id);
          const Icon = badge.icon;
          
          return (
            <div 
              key={badge.id}
              className={`relative overflow-hidden bg-white border-4 border-black rounded-2xl p-4 transition-all duration-500 ${
                isUnlocked 
                  ? 'shadow-[4px_4px_0_0_rgba(0,0,0,1)] opacity-100 scale-100' 
                  : 'opacity-40 grayscale translate-y-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border-2 border-black ${isUnlocked ? 'bg-[#FFD700]' : 'bg-gray-200'}`}>
                  <Icon className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h4 className="font-black text-black text-xs uppercase italic">{isUnlocked ? badge.name : '???'}</h4>
                  <p className="text-[10px] font-bold text-gray-600 uppercase mt-1">
                    {isUnlocked ? badge.description : 'Condition locked.'}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
