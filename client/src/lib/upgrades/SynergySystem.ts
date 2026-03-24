// Advanced synergy and milestone upgrade system

export interface SynergyUpgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  purchased: boolean;
  unlockRequirement: (stats: any) => boolean;
  effect: (stats: any) => number;
  type: 'synergy' | 'conditional' | 'milestone' | 'prestige';
  category: string;
}

export interface MilestoneReward {
  id: string;
  name: string;
  description: string;
  requirement: (stats: any) => boolean;
  claimed: boolean;
  reward: {
    type: 'multiplier' | 'unlock' | 'automation' | 'currency';
    value: number;
    target?: string;
  };
}

export const SYNERGY_UPGRADES: SynergyUpgrade[] = [
  // Synergy upgrades - buildings boost each other
  {
    id: 'data_algorithm_synergy',
    name: 'Data-Algorithm Synergy',
    description: 'Data Miners work 2x faster for each Algorithm Center owned',
    cost: 1000000,
    purchased: false,
    unlockRequirement: (stats) => 
      (stats.departmentsOwned?.data_miners || 0) >= 10 && 
      (stats.departmentsOwned?.algorithm_centers || 0) >= 5,
    effect: (stats) => Math.pow(2, stats.departmentsOwned?.algorithm_centers || 0),
    type: 'synergy',
    category: 'data_miners'
  },
  {
    id: 'neural_consciousness_synergy',
    name: 'Neural-Consciousness Network',
    description: 'Neural Networks boost Consciousness Harvesters by 50% each',
    cost: 10000000,
    purchased: false,
    unlockRequirement: (stats) => 
      (stats.departmentsOwned?.neural_networks || 0) >= 20 &&
      (stats.departmentsOwned?.consciousness_harvesters || 0) >= 5,
    effect: (stats) => Math.pow(1.5, stats.departmentsOwned?.neural_networks || 0),
    type: 'synergy',
    category: 'consciousness_harvesters'
  },
  {
    id: 'user_farm_network',
    name: 'User Farm Network Effect',
    description: 'Each User Farm increases all other farms efficiency by 10%',
    cost: 500000,
    purchased: false,
    unlockRequirement: (stats) => (stats.departmentsOwned?.user_farms || 0) >= 25,
    effect: (stats) => {
      const farms = stats.departmentsOwned?.user_farms || 0;
      return Math.pow(1.1, Math.max(0, farms - 1));
    },
    type: 'synergy',
    category: 'user_farms'
  },

  // Conditional upgrades - specific conditions for bonuses
  {
    id: 'perfect_balance',
    name: 'Perfect Balance',
    description: 'Triple income when you have exactly 100 of any building type',
    cost: 5000000,
    purchased: false,
    unlockRequirement: (stats) => stats.totalIncome >= 5000000,
    effect: (stats) => {
      const hasHundred = Object.values(stats.departmentsOwned || {})
        .some((count: any) => count === 100);
      return hasHundred ? 3 : 1;
    },
    type: 'conditional',
    category: 'global'
  },
  {
    id: 'minimalist_empire',
    name: 'Minimalist Empire',
    description: '5x income if you own fewer than 50 total buildings',
    cost: 2000000,
    purchased: false,
    unlockRequirement: (stats) => stats.totalIncome >= 1000000,
    effect: (stats) => {
      const totalBuildings = Object.values(stats.departmentsOwned || {})
        .reduce((sum: number, count: any) => sum + count, 0);
      return totalBuildings < 50 ? 5 : 1;
    },
    type: 'conditional',
    category: 'global'
  },
  {
    id: 'data_hoarder',
    name: 'Data Hoarder',
    description: '2x click power for every 100 data orbs collected (lifetime)',
    cost: 1000000,
    purchased: false,
    unlockRequirement: (stats) => stats.totalDataCollected >= 500,
    effect: (stats) => Math.pow(2, Math.floor((stats.totalDataCollected || 0) / 100)),
    type: 'conditional',
    category: 'clicking'
  },

  // Milestone upgrades - unlock at specific thresholds
  {
    id: 'corporate_expansion',
    name: 'Corporate Expansion',
    description: 'Unlock when owning 500+ total buildings. All income +100%',
    cost: 100000000,
    purchased: false,
    unlockRequirement: (stats) => {
      const totalBuildings = Object.values(stats.departmentsOwned || {})
        .reduce((sum: number, count: any) => sum + count, 0);
      return totalBuildings >= 500;
    },
    effect: () => 2,
    type: 'milestone',
    category: 'global'
  },
  {
    id: 'trillion_dollar_club',
    name: 'Trillion Dollar Club',
    description: 'Unlock at $1T lifetime income. Prestige points gain +50%',
    cost: 1000000000000,
    purchased: false,
    unlockRequirement: (stats) => stats.totalIncome >= 1000000000000,
    effect: () => 1.5,
    type: 'milestone',
    category: 'prestige'
  },

  // Prestige upgrades - permanent improvements
  {
    id: 'influence_mastery',
    name: 'Influence Mastery',
    description: 'Permanent: Each prestige level increases influence point gain by 25%',
    cost: 10, // Cost in influence points, not money
    purchased: false,
    unlockRequirement: (stats) => stats.prestigeCount >= 1,
    effect: (stats) => 1 + (stats.prestigeCount * 0.25),
    type: 'prestige',
    category: 'prestige'
  },
  {
    id: 'automation_efficiency',
    name: 'Automation Efficiency',
    description: 'Permanent: Auto-buyers work 2x faster after each prestige',
    cost: 15,
    purchased: false,
    unlockRequirement: (stats) => stats.prestigeCount >= 2,
    effect: (stats) => Math.pow(2, stats.prestigeCount),
    type: 'prestige',
    category: 'automation'
  }
];

export const MILESTONE_REWARDS: MilestoneReward[] = [
  {
    id: 'first_million',
    name: 'First Million',
    description: 'Reach $1,000,000 total income',
    requirement: (stats) => stats.totalIncome >= 1000000,
    claimed: false,
    reward: { type: 'multiplier', value: 1.25, target: 'click_power' }
  },
  {
    id: 'hundred_buildings',
    name: 'Building Empire',
    description: 'Own 100 total buildings',
    requirement: (stats) => {
      const total = Object.values(stats.departmentsOwned || {})
        .reduce((sum: number, count: any) => sum + count, 0);
      return total >= 100;
    },
    claimed: false,
    reward: { type: 'unlock', value: 1, target: 'automation_shop' }
  },
  {
    id: 'automation_master',
    name: 'Automation Master',
    description: 'Purchase 5 automation upgrades',
    requirement: (stats) => (stats.automationUpgradesPurchased || 0) >= 5,
    claimed: false,
    reward: { type: 'multiplier', value: 2, target: 'automation_speed' }
  },
  {
    id: 'prestige_veteran',
    name: 'Prestige Veteran',
    description: 'Complete 5 prestige resets',
    requirement: (stats) => stats.prestigeCount >= 5,
    claimed: false,
    reward: { type: 'currency', value: 100, target: 'influence_points' }
  }
];

export class SynergySystem {
  private upgrades: Map<string, SynergyUpgrade>;
  private milestones: Map<string, MilestoneReward>;

  constructor() {
    this.upgrades = new Map();
    this.milestones = new Map();

    SYNERGY_UPGRADES.forEach(upgrade => {
      this.upgrades.set(upgrade.id, { ...upgrade });
    });

    MILESTONE_REWARDS.forEach(milestone => {
      this.milestones.set(milestone.id, { ...milestone });
    });
  }

  calculateSynergyMultipliers(stats: any): {
    departmentMultipliers: { [key: string]: number };
    globalMultiplier: number;
    clickMultiplier: number;
    prestigeMultiplier: number;
    automationMultiplier: number;
  } {
    const departmentMultipliers: { [key: string]: number } = {};
    let globalMultiplier = 1;
    let clickMultiplier = 1;
    let prestigeMultiplier = 1;
    let automationMultiplier = 1;

    // Apply purchased upgrades
    this.upgrades.forEach(upgrade => {
      if (!upgrade.purchased) return;

      const effect = upgrade.effect(stats);
      
      switch (upgrade.category) {
        case 'global':
          globalMultiplier *= effect;
          break;
        case 'clicking':
          clickMultiplier *= effect;
          break;
        case 'prestige':
          prestigeMultiplier *= effect;
          break;
        case 'automation':
          automationMultiplier *= effect;
          break;
        default:
          // Department-specific multiplier
          if (!departmentMultipliers[upgrade.category]) {
            departmentMultipliers[upgrade.category] = 1;
          }
          departmentMultipliers[upgrade.category] *= effect;
          break;
      }
    });

    return {
      departmentMultipliers,
      globalMultiplier,
      clickMultiplier,
      prestigeMultiplier,
      automationMultiplier
    };
  }

  checkMilestones(stats: any): MilestoneReward[] {
    const newlyCompleted: MilestoneReward[] = [];

    this.milestones.forEach(milestone => {
      if (!milestone.claimed && milestone.requirement(stats)) {
        milestone.claimed = true;
        newlyCompleted.push(milestone);
      }
    });

    return newlyCompleted;
  }

  purchaseUpgrade(upgradeId: string, stats: any, spendCallback: (amount: number, currency: string) => boolean): boolean {
    const upgrade = this.upgrades.get(upgradeId);
    if (!upgrade || upgrade.purchased) return false;

    if (!upgrade.unlockRequirement(stats)) return false;

    const currency = upgrade.type === 'prestige' ? 'influence_points' : 'money';
    if (!spendCallback(upgrade.cost, currency)) return false;

    upgrade.purchased = true;
    return true;
  }

  getAvailableUpgrades(stats: any): SynergyUpgrade[] {
    return Array.from(this.upgrades.values()).filter(upgrade => 
      !upgrade.purchased && upgrade.unlockRequirement(stats)
    );
  }

  getUnclaimedMilestones(stats: any): MilestoneReward[] {
    return Array.from(this.milestones.values()).filter(milestone =>
      !milestone.claimed && milestone.requirement(stats)
    );
  }

  exportData(): any {
    return {
      upgrades: Array.from(this.upgrades.entries()).map(([id, upgrade]) => ({
        id,
        purchased: upgrade.purchased
      })),
      milestones: Array.from(this.milestones.entries()).map(([id, milestone]) => ({
        id,
        claimed: milestone.claimed
      }))
    };
  }

  importData(data: any): void {
    if (data.upgrades) {
      data.upgrades.forEach((upgradeData: any) => {
        const upgrade = this.upgrades.get(upgradeData.id);
        if (upgrade) {
          upgrade.purchased = upgradeData.purchased;
        }
      });
    }

    if (data.milestones) {
      data.milestones.forEach((milestoneData: any) => {
        const milestone = this.milestones.get(milestoneData.id);
        if (milestone) {
          milestone.claimed = milestoneData.claimed;
        }
      });
    }
  }
}