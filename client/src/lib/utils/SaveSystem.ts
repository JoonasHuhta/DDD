// Advanced save/export system with compression and validation

import { AchievementSystem } from '../progression/achievements';
import { AutomationSystem } from '../automation/AutomationSystem';
import { SynergySystem } from '../upgrades/SynergySystem';

export interface GameSaveData {
  version: string;
  timestamp: number;
  gameState: {
    income: number;
    users: number;
    totalLifetimeIncome: number;
    totalClicks: number;
    gameStartTime: number;
    fastestMillionTime: number;
    departments: any[];
    towerHeight: number;
    dataInventory: number;
    totalDataCollected: number;
    campaignCharges: number;
    campaignCooldownReduction: number;
    cohorts?: {
      teens: number;
      pros: number;
      seniors: number;
      addicts: number;
    };
    dataMarket?: {
      inventory: {
        behavioral: number;
        location: number;
        financial: number;
        biometric: number;
      };
      prices: {
        behavioral: number;
        location: number;
        financial: number;
        biometric: number;
      };
      history: any[];
    };
    orbsInventory: number;
    permanentOrbs: number;
    influencePoints: number;
    totalInfluenceEarned: number;
    passiveUserGeneration: number;
    totalOrbsCollected: number;
    totalCampaignsUsed: number;
    lastCampaignUsed: any;
    advertiserData: any;
    sinisterLab: any;
    blackMarketState: any;
    lawsuitState: any;
    rewardState: any;
    showTrophyPanel: boolean;
    shopPurchases: string[];
    mansionPurchases: string[];
    progressionState?: any;
    lawsuitMilestones?: any;
    grandMilestones?: any;
    characters?: any;
    dismissedTips?: string[];
    lastPassiveUpdate?: number;
    lastPassiveUserUpdate?: number;
    achievementManagerData?: any;
    achievementQueue?: any[];
  };
  progression: {
    prestigeState: any;
    achievements: any;
    unlockedAchievements: any[];
  };
  automation: any;
  synergies: any;
  settings: {
    autoSaveEnabled: boolean;
    autoSaveInterval: number;
    numberFormat: 'scientific' | 'suffix' | 'full';
    animationSpeed: number;
  };
  statistics: {
    totalPlayTime: number;
    totalPrestiges: number;
    totalAutomationPurchases: number;
    highestIncomePerSecond: number;
    buildingsBuilt: number;
  };
}

export class SaveSystem {
  private static readonly SAVE_VERSION = '1.0.0';
  private static readonly SAVE_KEY = 'metaman_save_v1';
  private static readonly AUTO_SAVE_KEY = 'metaman_autosave_v1';
  private static readonly BACKUP_SLOTS = 5;

  // Auto-save settings
  private autoSaveEnabled: boolean = true;
  private autoSaveInterval: number = 30000; // 30 seconds
  private lastAutoSave: number = 0;

  constructor() {
    // Load settings from localStorage
    this.loadSettings();
  }

  // Create a complete save of the current game state
  createSave(gameData: any): GameSaveData {
    return {
      version: SaveSystem.SAVE_VERSION,
      timestamp: Date.now(),
      gameState: {
        income: gameData.income || 0,
        users: gameData.users || 0,
        totalLifetimeIncome: gameData.totalLifetimeIncome || 0,
        totalClicks: gameData.totalClicks || 0,
        gameStartTime: gameData.gameStartTime || Date.now(),
        fastestMillionTime: gameData.fastestMillionTime || 0,
        departments: gameData.departments || [],
        towerHeight: gameData.towerHeight || 1,
        dataInventory: gameData.dataInventory || 0,
        totalDataCollected: gameData.totalDataCollected || 0,
        campaignCharges: gameData.campaignCharges || 5,
        campaignCooldownReduction: gameData.campaignCooldownReduction || 0,
        cohorts: gameData.cohorts || {
          teens: gameData.users || 0, // Fallback for old saves
          pros: 0,
          seniors: 0,
          addicts: 0
        },
        dataMarket: gameData.dataMarket || {
          inventory: { behavioral: 0, location: 0, financial: 0, biometric: 0 },
          prices: { behavioral: 10, location: 25, financial: 50, biometric: 100 },
          history: []
        },
        orbsInventory: gameData.orbsInventory || 0,
        permanentOrbs: gameData.permanentOrbs || 0,
        influencePoints: gameData.influencePoints || 0,
        totalInfluenceEarned: gameData.totalInfluenceEarned || 0,
        passiveUserGeneration: gameData.passiveUserGeneration || 0,
        totalOrbsCollected: gameData.totalOrbsCollected || 0,
        totalCampaignsUsed: gameData.totalCampaignsUsed || 0,
        lastCampaignUsed: gameData.lastCampaignUsed || null,
        advertiserData: gameData.advertiserData || {
          totalDataSold: 0,
          incomeMultiplier: 1.0,
          nextMilestone: 1000,
          milestonesReached: 0
        },
        sinisterLab: gameData.sinisterLab || {
          slots: [null, null, null],
          inventory: [],
          discoveredItems: [],
          orbBreakCount: 0
        },
        blackMarketState: gameData.blackMarketState || {
          isUnlocked: false,
          isOpen: false,
          timeRemaining: 0,
          lastOpenTime: 0,
          nextUserThreshold: 1000,
          danVisible: false,
          purchases: [],
          regulatoryHeat: 0
        },
        lawsuitState: gameData.lawsuitState || {
          isActive: false,
          isDelivered: false,
          isAcknowledged: false,
          showLawsuitPanel: false,
          plaintiff: '',
          claim: '',
          amount: 0
        },
        rewardState: gameData.rewardState || {
          rewards: [],
          hasNewRewards: false,
          showSuitcasePanel: false
        },
        showTrophyPanel: gameData.showTrophyPanel || false,
        shopPurchases: gameData.shopPurchases || [],
        mansionPurchases: gameData.mansionPurchases || [],
        progressionState: gameData.progressionState || null,
        lawsuitMilestones: gameData.lawsuitMilestones || null,
        grandMilestones: gameData.grandMilestones || null,
        characters: gameData.characters || null,
        dismissedTips: gameData.dismissedTips || [],
        lastPassiveUpdate: gameData.lastPassiveUpdate || Date.now(),
        lastPassiveUserUpdate: gameData.lastPassiveUserUpdate || Date.now(),
        achievementManagerData: gameData.achievementManager?.serialize() || null,
        achievementQueue: gameData.achievementQueue || [],
      },
      progression: {
        prestigeState: gameData.prestigeState || {},
        achievements: gameData.achievementSystem?.exportData() || {},
        unlockedAchievements: gameData.unlockedAchievements || []
      },
      automation: gameData.automationSystem?.exportData() || {},
      synergies: gameData.synergySystem?.exportData() || {},
      settings: {
        autoSaveEnabled: this.autoSaveEnabled,
        autoSaveInterval: this.autoSaveInterval,
        numberFormat: gameData.numberFormat || 'suffix',
        animationSpeed: gameData.animationSpeed || 1.0
      },
      statistics: {
        totalPlayTime: gameData.totalPlayTime || 0,
        totalPrestiges: gameData.prestigeState?.prestigeLevel || 0,
        totalAutomationPurchases: gameData.totalAutomationPurchases || 0,
        highestIncomePerSecond: gameData.totalIncomePerSecond || 0,
        buildingsBuilt: this.calculateTotalBuildings(gameData.departments || [])
      }
    };
  }

  // Save to localStorage
  saveGame(gameData: any, isAutoSave: boolean = false): boolean {
    try {
      const saveData = this.createSave(gameData);
      const compressedData = this.compressSave(saveData);
      
      const key = isAutoSave ? SaveSystem.AUTO_SAVE_KEY : SaveSystem.SAVE_KEY;
      localStorage.setItem(key, compressedData);

      // Create backup
      if (!isAutoSave) {
        this.createBackup(compressedData);
      }

      console.log(`Game ${isAutoSave ? 'auto-' : ''}saved successfully`);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  // Load from localStorage
  loadGame(fromAutoSave: boolean = false): GameSaveData | null {
    try {
      const key = fromAutoSave ? SaveSystem.AUTO_SAVE_KEY : SaveSystem.SAVE_KEY;
      const compressedData = localStorage.getItem(key);
      
      if (!compressedData) return null;

      const saveData = this.decompressSave(compressedData);
      
      if (!this.validateSave(saveData)) {
        console.error('Save data validation failed');
        return null;
      }

      return saveData;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  // Export save as string for sharing/backup
  exportSave(gameData: any): string {
    try {
      const saveData = this.createSave(gameData);
      const compressed = this.compressSave(saveData);
      
      // Add checksum for integrity
      const checksum = this.calculateChecksum(compressed);
      return `METAMAN_SAVE_${SaveSystem.SAVE_VERSION}_${checksum}_${compressed}`;
    } catch (error) {
      console.error('Failed to export save:', error);
      return '';
    }
  }

  // Import save from string
  importSave(saveString: string): GameSaveData | null {
    try {
      if (!saveString.startsWith('METAMAN_SAVE_')) {
        throw new Error('Invalid save format');
      }

      const parts = saveString.split('_');
      if (parts.length < 4) {
        throw new Error('Invalid save structure');
      }

      const version = parts[2];
      const checksum = parts[3];
      const compressedData = parts.slice(4).join('_');

      // Verify checksum
      if (this.calculateChecksum(compressedData) !== checksum) {
        throw new Error('Save data corrupted');
      }

      const saveData = this.decompressSave(compressedData);
      
      if (!this.validateSave(saveData)) {
        throw new Error('Save data validation failed');
      }

      return saveData;
    } catch (error) {
      console.error('Failed to import save:', error);
      return null;
    }
  }

  // Auto-save functionality
  handleAutoSave(gameData: any): void {
    if (!this.autoSaveEnabled) return;

    const now = Date.now();
    if (now - this.lastAutoSave >= this.autoSaveInterval) {
      this.saveGame(gameData, true);
      this.lastAutoSave = now;
    }
  }

  // Settings management
  updateSettings(settings: Partial<{
    autoSaveEnabled: boolean;
    autoSaveInterval: number;
    numberFormat: string;
    animationSpeed: number;
  }>): void {
    if (settings.autoSaveEnabled !== undefined) {
      this.autoSaveEnabled = settings.autoSaveEnabled;
    }
    if (settings.autoSaveInterval !== undefined) {
      this.autoSaveInterval = Math.max(10000, settings.autoSaveInterval); // Min 10 seconds
    }

    this.saveSettings();
  }

  private loadSettings(): void {
    try {
      const settingsData = localStorage.getItem('metaman_settings');
      if (settingsData) {
        const settings = JSON.parse(settingsData);
        this.autoSaveEnabled = settings.autoSaveEnabled ?? true;
        this.autoSaveInterval = settings.autoSaveInterval ?? 30000;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  private saveSettings(): void {
    try {
      const settings = {
        autoSaveEnabled: this.autoSaveEnabled,
        autoSaveInterval: this.autoSaveInterval
      };
      localStorage.setItem('metaman_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  // Backup management
  private createBackup(compressedData: string): void {
    try {
      const backups = this.getBackups();
      backups.unshift({
        timestamp: Date.now(),
        data: compressedData
      });

      // Keep only the latest backups
      if (backups.length > SaveSystem.BACKUP_SLOTS) {
        backups.splice(SaveSystem.BACKUP_SLOTS);
      }

      localStorage.setItem('metaman_backups', JSON.stringify(backups));
    } catch (error) {
      console.error('Failed to create backup:', error);
    }
  }

  getBackups(): Array<{ timestamp: number; data: string }> {
    try {
      const backupsData = localStorage.getItem('metaman_backups');
      return backupsData ? JSON.parse(backupsData) : [];
    } catch (error) {
      console.error('Failed to get backups:', error);
      return [];
    }
  }

  loadBackup(index: number): GameSaveData | null {
    try {
      const backups = this.getBackups();
      if (index < 0 || index >= backups.length) return null;

      const backup = backups[index];
      return this.decompressSave(backup.data);
    } catch (error) {
      console.error('Failed to load backup:', error);
      return null;
    }
  }

  // Utility methods
  private compressSave(saveData: GameSaveData): string {
    // Simple compression: JSON stringify and base64 encode (UTF-8 safe)
    const jsonString = JSON.stringify(saveData);
    return btoa(encodeURIComponent(jsonString).replace(/%([0-9A-F]{2})/g, (match, p1) => {
      return String.fromCharCode(parseInt(p1, 16));
    }));
  }

  private decompressSave(compressedData: string): GameSaveData {
    const jsonString = decodeURIComponent(Array.from(atob(compressedData)).map((c) => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonString);
  }

  private calculateChecksum(data: string): string {
    // Simple hash function for integrity checking
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private validateSave(saveData: any): boolean {
    // Basic validation
    if (!saveData || typeof saveData !== 'object') return false;
    if (!saveData.version || !saveData.timestamp) return false;
    if (!saveData.gameState || typeof saveData.gameState !== 'object') return false;
    
    // Version compatibility check
    const [major, minor] = saveData.version.split('.').map(Number);
    const [currentMajor, currentMinor] = SaveSystem.SAVE_VERSION.split('.').map(Number);
    
    if (major > currentMajor || (major === currentMajor && minor > currentMinor)) {
      console.warn('Save file is from a newer version');
      return false;
    }

    return true;
  }

  private calculateTotalBuildings(departments: any[]): number {
    return departments.reduce((total, dept) => total + (dept.owned || 0), 0);
  }

  // Public getters for settings
  get isAutoSaveEnabled(): boolean { return this.autoSaveEnabled; }
  get getAutoSaveInterval(): number { return this.autoSaveInterval; }
}