// Advanced automation systems for incremental game

export interface AutomationUpgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  currentLevel: number;
  maxLevel: number;
  unlockRequirement: (stats: any) => boolean;
  effect: (level: number) => any;
  costScaling: number;
  category: 'auto-clicker' | 'auto-buyer' | 'auto-upgrade' | 'smart-buyer';
}

export interface AutomationState {
  autoClickerEnabled: boolean;
  autoClickerLevel: number;
  autoClickerInterval: number;
  lastAutoClick: number;
  
  autoBuyerEnabled: boolean;
  autoBuyerLevel: number;
  autoBuyerInterval: number;
  lastAutoBuy: number;
  
  autoUpgradeEnabled: boolean;
  autoUpgradeLevel: number;
  
  smartBuyerEnabled: boolean;
  smartBuyerLevel: number;
  smartBuyerStrategy: 'cheapest' | 'efficiency' | 'balanced';
}

export const AUTOMATION_UPGRADES: AutomationUpgrade[] = [
  // Auto-clicker upgrades
  {
    id: 'auto_clicker_1',
    name: 'Basic Auto-Clicker',
    description: 'Automatically clicks once every 10 seconds',
    baseCost: 100000, // $100K
    currentLevel: 0,
    maxLevel: 10,
    unlockRequirement: (stats) => stats.totalClicks >= 1000,
    effect: (level) => ({ interval: Math.max(1000, 10000 - level * 900) }), // 10s to 1s
    costScaling: 2.5,
    category: 'auto-clicker'
  },
  {
    id: 'auto_clicker_power',
    name: 'Auto-Clicker Power',
    description: 'Each auto-click generates 2x more income',
    baseCost: 500000,
    currentLevel: 0,
    maxLevel: 5,
    unlockRequirement: (stats) => stats.automationState?.autoClickerLevel >= 3,
    effect: (level) => ({ powerMultiplier: Math.pow(2, level) }),
    costScaling: 3,
    category: 'auto-clicker'
  },

  // Auto-buyer upgrades
  {
    id: 'auto_buyer_basic',
    name: 'Basic Auto-Buyer',
    description: 'Automatically buys the cheapest department every 30 seconds',
    baseCost: 1000000, // $1M
    currentLevel: 0,
    maxLevel: 8,
    unlockRequirement: (stats) => stats.totalIncome >= 1000000,
    effect: (level) => ({ interval: Math.max(5000, 30000 - level * 3000) }), // 30s to 5s
    costScaling: 2.2,
    category: 'auto-buyer'
  },
  {
    id: 'auto_buyer_bulk',
    name: 'Bulk Auto-Buyer',
    description: 'Auto-buyer purchases multiple departments at once',
    baseCost: 5000000,
    currentLevel: 0,
    maxLevel: 5,
    unlockRequirement: (stats) => stats.automationState?.autoBuyerLevel >= 2,
    effect: (level) => ({ bulkAmount: level + 1 }),
    costScaling: 2.8,
    category: 'auto-buyer'
  },

  // Smart buyer upgrades
  {
    id: 'smart_buyer',
    name: 'Smart Auto-Buyer',
    description: 'Prioritizes purchases based on income/cost efficiency',
    baseCost: 10000000, // $10M
    currentLevel: 0,
    maxLevel: 3,
    unlockRequirement: (stats) => stats.automationState?.autoBuyerLevel >= 5,
    effect: (level) => ({ 
      strategies: ['cheapest', 'efficiency', 'balanced'].slice(0, level + 1) 
    }),
    costScaling: 4,
    category: 'smart-buyer'
  },

  // Auto-upgrade system
  {
    id: 'auto_upgrade',
    name: 'Auto-Upgrade System',
    description: 'Automatically purchases beneficial efficiency upgrades',
    baseCost: 50000000, // $50M
    currentLevel: 0,
    maxLevel: 1,
    unlockRequirement: (stats) => stats.totalIncome >= 50000000,
    effect: (level) => ({ enabled: level > 0 }),
    costScaling: 1,
    category: 'auto-upgrade'
  }
];

export class AutomationSystem {
  private state: AutomationState;
  private upgrades: Map<string, AutomationUpgrade>;
  private onIncomeUpdate?: (amount: number) => void;
  private onPurchaseCallback?: (departmentId: string, amount: number) => void;

  constructor(
    onIncomeUpdate?: (amount: number) => void,
    onPurchaseCallback?: (departmentId: string, amount: number) => void
  ) {
    this.state = {
      autoClickerEnabled: false,
      autoClickerLevel: 0,
      autoClickerInterval: 10000,
      lastAutoClick: 0,
      
      autoBuyerEnabled: false,
      autoBuyerLevel: 0,
      autoBuyerInterval: 30000,
      lastAutoBuy: 0,
      
      autoUpgradeEnabled: false,
      autoUpgradeLevel: 0,
      
      smartBuyerEnabled: false,
      smartBuyerLevel: 0,
      smartBuyerStrategy: 'cheapest'
    };

    this.upgrades = new Map();
    AUTOMATION_UPGRADES.forEach(upgrade => {
      this.upgrades.set(upgrade.id, { ...upgrade });
    });

    this.onIncomeUpdate = onIncomeUpdate;
    this.onPurchaseCallback = onPurchaseCallback;
  }

  update(deltaTime: number, gameStats: any): void {
    const now = Date.now();

    // Auto-clicker
    if (this.state.autoClickerEnabled && 
        now - this.state.lastAutoClick >= this.state.autoClickerInterval) {
      this.performAutoClick(gameStats);
      this.state.lastAutoClick = now;
    }

    // Auto-buyer
    if (this.state.autoBuyerEnabled && 
        now - this.state.lastAutoBuy >= this.state.autoBuyerInterval) {
      this.performAutoBuy(gameStats);
      this.state.lastAutoBuy = now;
    }
  }

  private performAutoClick(gameStats: any): void {
    if (!this.onIncomeUpdate) return;

    const powerUpgrade = this.upgrades.get('auto_clicker_power');
    const powerMultiplier = powerUpgrade ? powerUpgrade.effect(powerUpgrade.currentLevel).powerMultiplier || 1 : 1;
    
    const baseClickIncome = 250;
    const autoClickIncome = baseClickIncome * powerMultiplier;
    
    this.onIncomeUpdate(autoClickIncome);
  }

  private performAutoBuy(gameStats: any): void {
    if (!this.onPurchaseCallback || !gameStats.departments) return;

    const bulkUpgrade = this.upgrades.get('auto_buyer_bulk');
    const bulkAmount = bulkUpgrade ? bulkUpgrade.effect(bulkUpgrade.currentLevel).bulkAmount || 1 : 1;

    let targetDepartment: any = null;
    let bestValue = 0;

    // Determine purchase strategy
    if (this.state.smartBuyerEnabled) {
      // Smart buying based on efficiency
      gameStats.departments.forEach((dept: any) => {
        const cost = this.calculateDepartmentCost(dept);
        if (cost <= gameStats.income) {
          const efficiency = dept.baseIncome / cost;
          if (efficiency > bestValue) {
            bestValue = efficiency;
            targetDepartment = dept;
          }
        }
      });
    } else {
      // Basic buying - cheapest available
      gameStats.departments.forEach((dept: any) => {
        const cost = this.calculateDepartmentCost(dept);
        if (cost <= gameStats.income && (bestValue === 0 || cost < bestValue)) {
          bestValue = cost;
          targetDepartment = dept;
        }
      });
    }

    if (targetDepartment) {
      this.onPurchaseCallback(targetDepartment.id, bulkAmount);
    }
  }

  private calculateDepartmentCost(department: any): number {
    return Math.floor(department.baseCost * Math.pow(1.15, department.owned));
  }

  purchaseUpgrade(upgradeId: string, gameStats: any): boolean {
    const upgrade = this.upgrades.get(upgradeId);
    if (!upgrade || upgrade.currentLevel >= upgrade.maxLevel) return false;

    if (!upgrade.unlockRequirement(gameStats)) return false;

    const cost = this.calculateUpgradeCost(upgrade);
    if (gameStats.income < cost) return false;

    // Purchase upgrade
    upgrade.currentLevel++;
    this.applyUpgradeEffect(upgrade);
    
    return true;
  }

  private calculateUpgradeCost(upgrade: AutomationUpgrade): number {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.costScaling, upgrade.currentLevel));
  }

  private applyUpgradeEffect(upgrade: AutomationUpgrade): void {
    const effect = upgrade.effect(upgrade.currentLevel);

    switch (upgrade.category) {
      case 'auto-clicker':
        if (upgrade.id === 'auto_clicker_1') {
          this.state.autoClickerEnabled = upgrade.currentLevel > 0;
          this.state.autoClickerLevel = upgrade.currentLevel;
          this.state.autoClickerInterval = effect.interval;
        }
        break;
        
      case 'auto-buyer':
        if (upgrade.id === 'auto_buyer_basic') {
          this.state.autoBuyerEnabled = upgrade.currentLevel > 0;
          this.state.autoBuyerLevel = upgrade.currentLevel;
          this.state.autoBuyerInterval = effect.interval;
        }
        break;
        
      case 'smart-buyer':
        this.state.smartBuyerEnabled = upgrade.currentLevel > 0;
        this.state.smartBuyerLevel = upgrade.currentLevel;
        break;
        
      case 'auto-upgrade':
        this.state.autoUpgradeEnabled = effect.enabled;
        this.state.autoUpgradeLevel = upgrade.currentLevel;
        break;
    }
  }

  getAvailableUpgrades(gameStats: any): AutomationUpgrade[] {
    return Array.from(this.upgrades.values()).filter(upgrade => 
      upgrade.unlockRequirement(gameStats) && upgrade.currentLevel < upgrade.maxLevel
    );
  }

  getUpgradeCost(upgradeId: string): number {
    const upgrade = this.upgrades.get(upgradeId);
    return upgrade ? this.calculateUpgradeCost(upgrade) : 0;
  }

  getState(): AutomationState {
    return { ...this.state };
  }

  setState(newState: Partial<AutomationState>): void {
    this.state = { ...this.state, ...newState };
  }

  exportData(): any {
    return {
      state: this.state,
      upgrades: Array.from(this.upgrades.entries()).map(([id, upgrade]) => ({
        id,
        currentLevel: upgrade.currentLevel
      }))
    };
  }

  importData(data: any): void {
    if (data.state) {
      this.state = { ...this.state, ...data.state };
    }
    
    if (data.upgrades) {
      data.upgrades.forEach((upgradeData: any) => {
        const upgrade = this.upgrades.get(upgradeData.id);
        if (upgrade) {
          upgrade.currentLevel = upgradeData.currentLevel;
          this.applyUpgradeEffect(upgrade);
        }
      });
    }
  }
}