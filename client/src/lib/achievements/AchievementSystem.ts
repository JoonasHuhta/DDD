export interface Achievement {
  id: string;
  name: string;
  description: string;
  type: 'money' | 'users';
  threshold: number;
  reward: number;
  unlocked: boolean;
  claimed: boolean;
  icon: string;
  costMetrics?: {
    category: string;
    attention: string;
    behavior: string;
    wellbeing: string;
    systemNote: string;
  };
}

export const ACHIEVEMENTS: Achievement[] = [
  { 
    id: 'first_50k', 
    name: 'Corporate Starter', 
    description: 'Reach $50,000 in total income', 
    type: 'money', 
    threshold: 50000, 
    reward: 20000, 
    unlocked: false, 
    claimed: false, 
    icon: '💰',
    costMetrics: {
      category: 'attention',
      attention: 'Avg focus duration: 2m 10s → 58s',
      behavior: 'Session frequency ↑',
      wellbeing: 'Mild cognitive fatigue',
      systemNote: '"More sessions = more revenue."'
    }
  },
  { 
    id: 'hundred_users', 
    name: 'Social Media Influencer', 
    description: 'Attract 100 users to your platform', 
    type: 'users', 
    threshold: 100, 
    reward: 30000, 
    unlocked: false, 
    claimed: false, 
    icon: '👥',
    costMetrics: {
      category: 'behavior',
      attention: 'Information diet homogenization: 45%',
      behavior: 'Micro-tribalism formation detected',
      wellbeing: 'Rising peer-comparison anxiety',
      systemNote: '"Users isolated into comfortable, monetizable echo chambers."'
    }
  },
  { 
    id: 'first_100k', 
    name: 'Six Figure Success', 
    description: 'Break into six figures with $100,000', 
    type: 'money', 
    threshold: 100000, 
    reward: 25000, 
    unlocked: false, 
    claimed: false, 
    icon: '💎',
    costMetrics: {
      category: 'wellbeing',
      attention: 'Passive consumption state: 4h/day',
      behavior: 'Compulsive checking routine: Every 12 mins',
      wellbeing: 'REM sleep displaced by blue-light exposure',
      systemNote: '"Their exhaustion is our most reliable asset class."'
    }
  },
  { 
    id: 'two_hundred_users', 
    name: 'Engaged Community', 
    description: 'Build a community of 200 active users', 
    type: 'users', 
    threshold: 200, 
    reward: 50000, 
    unlocked: false, 
    claimed: false, 
    icon: '🎯',
    costMetrics: {
      category: 'behavior',
      attention: 'Cross-content engagement: Low',
      behavior: 'Out-group hostility: +22%',
      wellbeing: 'Validation dependency verified',
      systemNote: '"Hostility metrics correlate perfectly with refresh rates."'
    }
  },
  { 
    id: 'quarter_million', 
    name: 'Corporate Executive', 
    description: 'Accumulate $250,000 in total earnings', 
    type: 'money', 
    threshold: 250000, 
    reward: 50000, 
    unlocked: false, 
    claimed: false, 
    icon: '🏢',
    costMetrics: {
      category: 'attention',
      attention: 'Dopamine receptor desensitization: Moderate',
      behavior: 'Impulsive micro-purchasing ↑ 34%',
      wellbeing: 'FOMO-induced chronic stress markers present',
      systemNote: '"Monetizable surface area expanded effectively."'
    }
  },
  { 
    id: 'five_hundred_users', 
    name: 'Digital Empire Builder', 
    description: 'Build a community of 500 loyal users', 
    type: 'users', 
    threshold: 500, 
    reward: 75000, 
    unlocked: false, 
    claimed: false, 
    icon: '👑',
    costMetrics: {
      category: 'behavior',
      attention: 'Outrage-bait susceptibility: 88%',
      behavior: 'Algorithmic personality conformity',
      wellbeing: 'Baseline neurosis elevated by 14%',
      systemNote: '"User self-worth outsourced entirely to the platform."'
    }
  },
  { 
    id: 'half_million', 
    name: 'Digital Tycoon', 
    description: 'Reach $500,000 in revenue streams', 
    type: 'money', 
    threshold: 500000, 
    reward: 100000, 
    unlocked: false, 
    claimed: false, 
    icon: '🏢',
    costMetrics: {
      category: 'wellbeing',
      attention: 'Constant partial attention syndrome: Diagnosed',
      behavior: 'Data harvested per user: 4,000+ points',
      wellbeing: 'Privacy expectations dissolved',
      systemNote: '"We are selling their futures back to them."'
    }
  },
  { 
    id: 'thousand_users', 
    name: 'Thousand Strong', 
    description: 'Command 1,000 active platform users', 
    type: 'users', 
    threshold: 1000, 
    reward: 200000, 
    unlocked: false, 
    claimed: false, 
    icon: '⚡',
    costMetrics: {
      category: 'behavior',
      attention: 'Filter-bubble reinforcement: Absolute',
      behavior: 'Viral misinformation velocity: 6x truth',
      wellbeing: 'Chronic sleep displacement',
      systemNote: '"Fact-checking mechanisms bypassed. Outrage == Engagement."'
    }
  },
  { 
    id: 'millionaire', 
    name: 'Corporate Mogul', 
    description: 'Achieve $1,000,000 in lifetime earnings', 
    type: 'money', 
    threshold: 1000000, 
    reward: 100000, 
    unlocked: false, 
    claimed: false, 
    icon: '💎',
    costMetrics: {
      category: 'attention',
      attention: 'Stimulus tolerance: Extremely high',
      behavior: 'Intermittent variable rewards optimized perfectly',
      wellbeing: 'Real-world relationship neglect: High',
      systemNote: '"The slot machine mechanism is flawless."'
    }
  },
  { 
    id: 'two_thousand_users', 
    name: 'Social Media Giant', 
    description: 'Control 2,000 engaged users', 
    type: 'users', 
    threshold: 2000, 
    reward: 750000, 
    unlocked: false, 
    claimed: false, 
    icon: '🎭',
    costMetrics: {
      category: 'wellbeing',
      attention: 'Critical thought capacity: -20% globally',
      behavior: 'Coordinated harassment capabilities enabled',
      wellbeing: 'Unrealistic lifestyle benchmarks established',
      systemNote: '"Users now perform for the algorithm, not each other."'
    }
  },
  { 
    id: 'two_million', 
    name: 'Multi-Million Empire', 
    description: 'Build a $2,000,000 digital empire', 
    type: 'money', 
    threshold: 2000000, 
    reward: 500000, 
    unlocked: false, 
    claimed: false, 
    icon: '🏰',
    costMetrics: {
      category: 'behavior',
      attention: 'Algorithmic curation dictates 98% of media diet',
      behavior: 'Predatory ad-targeting maximizing ROI',
      wellbeing: 'Systemic anxiety loops monetized',
      systemNote: '"Vulnerabilities parsed. Capital extracted."'
    }
  },
  { 
    id: 'five_thousand_users', 
    name: 'Platform Domination', 
    description: 'Influence 5,000 daily active users', 
    type: 'users', 
    threshold: 5000, 
    reward: 2000000, 
    unlocked: false, 
    claimed: false, 
    icon: '🌐',
    costMetrics: {
      category: 'attention',
      attention: 'Short-form dopamine exhaustion',
      behavior: 'Real-world event polarization: Mapped & monetized',
      wellbeing: 'Collective attention span degraded to mere seconds',
      systemNote: '"We no longer reflect reality. We dictate it."'
    }
  },
  { 
    id: 'ten_million', 
    name: 'Ten Million Mogul', 
    description: 'Generate $10,000,000 in total revenue', 
    type: 'money', 
    threshold: 10000000, 
    reward: 2000000, 
    unlocked: false, 
    claimed: false, 
    icon: '💫',
    costMetrics: {
      category: 'behavior',
      attention: 'Real-world focus capability: Severely impaired',
      behavior: 'Total behavioral surveillance architecture online',
      wellbeing: 'Emotional manipulation tests yielding high profits',
      systemNote: '"We can now reliably predict and provoke mood shifts."'
    }
  },
  { 
    id: 'ten_thousand_users', 
    name: 'Global Influence', 
    description: 'Shape opinions of 10,000 users worldwide', 
    type: 'users', 
    threshold: 10000, 
    reward: 8000000, 
    unlocked: false, 
    claimed: false, 
    icon: '🌍',
    costMetrics: {
      category: 'systemic',
      attention: 'Institutional trust: Critical failure',
      behavior: 'Predictable herd mobilization: Active',
      wellbeing: 'Society-wide dopamine baseline shifted',
      systemNote: '"Democratic processes currently vulnerable to A/B testing."'
    }
  },
  { 
    id: 'fifty_million', 
    name: 'Corporate Monopoly', 
    description: 'Control $50,000,000 in market value', 
    type: 'money', 
    threshold: 50000000, 
    reward: 10000000, 
    unlocked: false, 
    claimed: false, 
    icon: '🎪',
    costMetrics: {
      category: 'systemic',
      attention: 'Total cognitive occupation',
      behavior: 'Regulatory bypass protocols active',
      wellbeing: 'Digital addiction recognized as modern norm',
      systemNote: '"Too big to regulate. Too profitable to fail."'
    }
  },
  { 
    id: 'twenty_five_thousand_users', 
    name: 'World Controller', 
    description: 'Direct 25,000 users across the globe', 
    type: 'users', 
    threshold: 25000, 
    reward: 25000000, 
    unlocked: false, 
    claimed: false, 
    icon: '👁️',
    costMetrics: {
      category: 'systemic',
      attention: 'Autonomous narrative formation: Extinct',
      behavior: 'Algorithmic determinism achieved',
      wellbeing: 'Human experience fully commodified',
      systemNote: '"The algorithm knows them better than they know themselves."'
    }
  },
  { 
    id: 'two_hundred_million', 
    name: 'Digital Overlord', 
    description: 'Amass $200,000,000 in total wealth', 
    type: 'money', 
    threshold: 200000000, 
    reward: 50000000, 
    unlocked: false, 
    claimed: false, 
    icon: '🔱',
    costMetrics: {
      category: 'dystopian',
      attention: 'Reality mediation complete',
      behavior: 'Neural input/output optimization: 99%',
      wellbeing: 'Subjective consciousness obsolete',
      systemNote: '"Biological constraints overcome. Users are strictly processing nodes."'
    }
  },
  { 
    id: 'billion_empire', 
    name: 'Billion Dollar Emperor', 
    description: 'Rule a $1,000,000,000 digital empire', 
    type: 'money', 
    threshold: 1000000000, 
    reward: 200000000, 
    unlocked: false, 
    claimed: false, 
    icon: '🏛️',
    costMetrics: {
      category: 'dystopian',
      attention: 'Singularity integration phase 1',
      behavior: 'Dopamine synthesis bypass confirmed',
      wellbeing: 'Post-human behavioral alignment',
      systemNote: '"We are the platform. They are the resource. The cycle is complete."'
    }
  }
];

export class AchievementManager {
  private achievements: Achievement[] = [...ACHIEVEMENTS];
  private onAchievementUnlocked?: (achievement: Achievement) => void;
  private totalLifetimeIncome = 0;
  private totalLifetimeUsers = 0;

  constructor(onAchievementUnlocked?: (achievement: Achievement) => void) {
    this.onAchievementUnlocked = onAchievementUnlocked;
  }

  setCallbacks(onAchievementUnlocked: (achievement: Achievement) => void) {
    this.onAchievementUnlocked = onAchievementUnlocked;
  }

  updateProgress(currentIncome: number, currentUsers: number) {
    // Track lifetime totals
    this.totalLifetimeIncome = Math.max(this.totalLifetimeIncome, currentIncome);
    this.totalLifetimeUsers = Math.max(this.totalLifetimeUsers, currentUsers);

    // Check for newly unlocked achievements
    this.achievements.forEach(achievement => {
      if (!achievement.unlocked) {
        const currentValue = achievement.type === 'money' ? this.totalLifetimeIncome : this.totalLifetimeUsers;
        
        if (currentValue >= achievement.threshold) {
          achievement.unlocked = true;
          console.log("🏆 Ding Ding Ding! - Achievement unlocked: " + achievement.name);
          this.onAchievementUnlocked?.(achievement);
        }
      }
    });
  }

  claimAchievement(achievementId: string): number {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (achievement && achievement.unlocked && !achievement.claimed) {
      achievement.claimed = true;
      console.log(`Achievement ${achievementId} claimed for $${achievement.reward}`);
      return achievement.reward;
    }
    console.log(`Achievement ${achievementId} already claimed or not unlocked`);
    return 0;
  }

  getAchievement(achievementId: string): Achievement | undefined {
    return this.achievements.find(a => a.id === achievementId);
  }

  getProgressToNext(type: 'money' | 'users'): { 
    current: number; 
    target: number; 
    progress: number; 
    remainingAmount: number;
    nextAchievement?: Achievement;
  } {
    const currentValue = type === 'money' ? this.totalLifetimeIncome : this.totalLifetimeUsers;
    const unlockedAchievements = this.achievements
      .filter(a => a.type === type && !a.unlocked)
      .sort((a, b) => a.threshold - b.threshold);
    
    const nextAchievement = unlockedAchievements[0];
    
    if (!nextAchievement) {
      return {
        current: currentValue,
        target: currentValue,
        progress: 100,
        remainingAmount: 0
      };
    }

    const progress = Math.min(100, (currentValue / nextAchievement.threshold) * 100);
    const remainingAmount = Math.max(0, nextAchievement.threshold - currentValue);

    return {
      current: currentValue,
      target: nextAchievement.threshold,
      progress,
      remainingAmount,
      nextAchievement
    };
  }

  getUnlockedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked);
  }

  getUnclaimedAchievements(): Achievement[] {
    return this.achievements.filter(a => a.unlocked && !a.claimed);
  }

  getAllAchievements(): Achievement[] {
    return [...this.achievements];
  }

  // Save/Load functionality
  serialize() {
    return {
      achievements: this.achievements,
      totalLifetimeIncome: this.totalLifetimeIncome,
      totalLifetimeUsers: this.totalLifetimeUsers
    };
  }

  deserialize(data: any) {
    if (data.achievements) {
      this.achievements = data.achievements;
    }
    if (data.totalLifetimeIncome !== undefined) {
      this.totalLifetimeIncome = data.totalLifetimeIncome;
    }
    if (data.totalLifetimeUsers !== undefined) {
      this.totalLifetimeUsers = data.totalLifetimeUsers;
    }
  }
}