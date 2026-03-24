// Achievement system for permanent progression bonuses

export interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (stats: GameStats) => boolean;
  reward: AchievementReward;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface AchievementReward {
  type: 'income_multiplier' | 'click_power' | 'offline_multiplier' | 'prestige_bonus' | 'crazy_bonus';
  value: number;
  description: string;
}

export interface GameStats {
  totalIncome: number;
  totalUsers: number;
  totalClicks: number;
  totalTime: number; // in milliseconds
  highestIncomePerSecond: number;
  departmentsOwned: { [key: string]: number };
  prestigeCount: number;
  fastestMillionTime: number; // time to reach $1M in ms
  totalDataCollected: number;
  automationUpgradesPurchased: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Income Milestones
  {
    id: 'first_thousand',
    name: 'Getting Started',
    description: 'Earn $1,000',
    condition: (stats) => stats.totalIncome >= 1000,
    reward: { type: 'income_multiplier', value: 1.05, description: '+5% income multiplier' },
    unlocked: false
  },
  {
    id: 'first_million',
    name: 'Millionaire',
    description: 'Earn $1,000,000',
    condition: (stats) => stats.totalIncome >= 1e6,
    reward: { type: 'income_multiplier', value: 1.1, description: '+10% income multiplier' },
    unlocked: false
  },
  {
    id: 'first_billion',
    name: 'Billionaire',
    description: 'Earn $1,000,000,000',
    condition: (stats) => stats.totalIncome >= 1e9,
    reward: { type: 'income_multiplier', value: 1.15, description: '+15% income multiplier' },
    unlocked: false
  },
  {
    id: 'first_trillion',
    name: 'Trillionaire',
    description: 'Earn $1,000,000,000,000',
    condition: (stats) => stats.totalIncome >= 1e12,
    reward: { type: 'prestige_bonus', value: 1.25, description: '+25% prestige point gain' },
    unlocked: false
  },

  // Click Achievements
  {
    id: 'thousand_clicks',
    name: 'Clicktastic',
    description: 'Click 1,000 times',
    condition: (stats) => stats.totalClicks >= 1000,
    reward: { type: 'click_power', value: 1.1, description: '+10% click power' },
    unlocked: false
  },
  {
    id: 'hundred_thousand_clicks',
    name: 'Click Master',
    description: 'Click 100,000 times',
    condition: (stats) => stats.totalClicks >= 100000,
    reward: { type: 'click_power', value: 1.25, description: '+25% click power' },
    unlocked: false
  },

  // Speed Achievements
  {
    id: 'fast_million',
    name: 'Speed Demon',
    description: 'Reach $1M in under 10 minutes',
    condition: (stats) => stats.totalIncome >= 1e6 && stats.fastestMillionTime > 0 && stats.fastestMillionTime <= 600000,
    reward: { type: 'income_multiplier', value: 1.2, description: '+20% income multiplier' },
    unlocked: false
  },

  // Department Achievements
  {
    id: 'hundred_data_miners',
    name: 'Mining Empire',
    description: 'Own 100 Data Miners',
    condition: (stats) => (stats.departmentsOwned['data_miners'] || 0) >= 100,
    reward: { type: 'income_multiplier', value: 1.1, description: '+10% Data Miner efficiency' },
    unlocked: false
  },
  {
    id: 'hundred_all_departments',
    name: 'Corporate Overlord',
    description: 'Own 100 of each department type',
    condition: (stats) => {
      const deptIds = ['data_miners', 'user_farms', 'algorithm_centers', 'neural_networks', 'consciousness_harvesters'];
      return deptIds.every(id => (stats.departmentsOwned[id] || 0) >= 100);
    },
    reward: { type: 'income_multiplier', value: 1.5, description: '+50% all department efficiency' },
    unlocked: false
  },

  // Time-based Achievements
  {
    id: 'dedicated_player',
    name: 'Dedicated Player',
    description: 'Play for 1 hour total',
    condition: (stats) => stats.totalTime >= 3600000, // 1 hour in ms
    reward: { type: 'offline_multiplier', value: 1.5, description: '+50% offline income' },
    unlocked: false
  },

  // NEW MASSIVE USER MILESTONE REWARDS
  {
    id: 'three_hundred_k_users',
    name: 'Social Media Empire',
    description: 'Reach 300,000 users - Building your digital empire!',
    condition: (stats) => stats.totalUsers >= 300000,
    reward: { type: 'crazy_bonus', value: 500000, description: '+$500K instant cash + Mega tower boost!' },
    unlocked: false
  },
  {
    id: 'five_hundred_k_users', 
    name: 'Dopamine Kingpin',
    description: 'Reach 500,000 users - Addiction spreads worldwide!',
    condition: (stats) => stats.totalUsers >= 500000,
    reward: { type: 'crazy_bonus', value: 1500000, description: '+$1.5M + Double click power + Auto-features!' },
    unlocked: false
  },
  {
    id: 'one_million_users',
    name: 'Digital Overlord', 
    description: 'Reach 1,000,000 users - Complete mind control achieved!',
    condition: (stats) => stats.totalUsers >= 1000000,
    reward: { type: 'crazy_bonus', value: 10000000, description: '+$10M + Triple income + Ultimate power!' },
    unlocked: false
  },
  {
    id: 'two_million_users',
    name: 'Reality Distorter',
    description: 'Reach 2,000,000 users - You control global attention!',
    condition: (stats) => stats.totalUsers >= 2000000,
    reward: { type: 'crazy_bonus', value: 25000000, description: '+$25M + 5x multiplier + God mode!' },
    unlocked: false
  },
  {
    id: 'five_million_users',
    name: 'Consciousness Harvester',
    description: 'Reach 5,000,000 users - Human minds are your playground!',
    condition: (stats) => stats.totalUsers >= 5000000,
    reward: { type: 'crazy_bonus', value: 100000000, description: '+$100M + 10x everything + Transcendence!' },
    unlocked: false
  }
];

export class AchievementSystem {
  private achievements: Achievement[];
  private onAchievementUnlocked?: (achievement: Achievement) => void;

  constructor(onAchievementUnlocked?: (achievement: Achievement) => void) {
    this.achievements = [...ACHIEVEMENTS];
    this.onAchievementUnlocked = onAchievementUnlocked;
  }

  checkAchievements(stats: GameStats): Achievement[] {
    const newlyUnlocked: Achievement[] = [];

    this.achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.condition(stats)) {
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        newlyUnlocked.push(achievement);
        
        console.log("🎖️ Ding Ding Ding! - Milestone reached: " + achievement.name);
        
        if (this.onAchievementUnlocked) {
          this.onAchievementUnlocked(achievement);
        }
      }
    });

    return newlyUnlocked;
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked);
  }

  calculateTotalMultipliers(): {
    incomeMultiplier: number;
    clickMultiplier: number;
    offlineMultiplier: number;
    prestigeMultiplier: number;
  } {
    const unlocked = this.getUnlockedAchievements();
    
    let incomeMultiplier = 1;
    let clickMultiplier = 1;
    let offlineMultiplier = 1;
    let prestigeMultiplier = 1;

    unlocked.forEach(achievement => {
      switch (achievement.reward.type) {
        case 'income_multiplier':
          incomeMultiplier *= achievement.reward.value;
          break;
        case 'click_power':
          clickMultiplier *= achievement.reward.value;
          break;
        case 'offline_multiplier':
          offlineMultiplier *= achievement.reward.value;
          break;
        case 'prestige_bonus':
          prestigeMultiplier *= achievement.reward.value;
          break;
        case 'crazy_bonus':
          // Crazy bonuses are handled separately (instant money rewards)
          break;
      }
    });

    return {
      incomeMultiplier,
      clickMultiplier,
      offlineMultiplier,
      prestigeMultiplier
    };
  }

  getAchievementProgress(achievementId: string, stats: GameStats): number {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement || achievement.unlocked) return 1;

    // Calculate progress for specific achievements
    switch (achievementId) {
      case 'first_thousand':
        return Math.min(1, stats.totalIncome / 1000);
      case 'first_million':
        return Math.min(1, stats.totalIncome / 1e6);
      case 'first_billion':
        return Math.min(1, stats.totalIncome / 1e9);
      case 'first_trillion':
        return Math.min(1, stats.totalIncome / 1e12);
      case 'thousand_clicks':
        return Math.min(1, stats.totalClicks / 1000);
      case 'hundred_thousand_clicks':
        return Math.min(1, stats.totalClicks / 100000);
      default:
        return 0;
    }
  }

  exportData(): any {
    return {
      unlockedIds: this.achievements.filter(a => a.unlocked).map(a => a.id),
      unlockedTimes: this.achievements.reduce((acc, a) => {
        if (a.unlocked && a.unlockedAt) acc[a.id] = a.unlockedAt;
        return acc;
      }, {} as { [key: string]: number })
    };
  }

  importData(data: any): void {
    if (!data) return;
    
    if (data.unlockedIds && Array.isArray(data.unlockedIds)) {
      this.achievements.forEach(achievement => {
        if (data.unlockedIds.includes(achievement.id)) {
          achievement.unlocked = true;
          achievement.unlockedAt = data.unlockedTimes?.[achievement.id] || Date.now();
        } else {
          achievement.unlocked = false;
          delete achievement.unlockedAt;
        }
      });
    }
  }
}