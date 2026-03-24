import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { formatLargeNumber, formatCurrency } from "../utils/numberFormatter";
import { PrestigeSystem, PrestigeState } from "../progression/prestige";
import { AchievementSystem, GameStats, Achievement as ProgressionAchievement } from "../progression/achievements";
import { OfflineProgressSystem, OfflineProgress } from "../progression/offlineProgress";
import { AutomationSystem } from "../automation/AutomationSystem";
import { SynergySystem } from "../upgrades/SynergySystem";
import { SaveSystem } from "../utils/SaveSystem";
import { AchievementManager, Achievement as SimpleAchievement } from "../achievements/AchievementSystem";
import { RandomLawsuitManager, RandomLawsuit } from "../../data/randomLawsuits";
import { MarketLogic } from "../gameEngine/MarketLogic";
import { DEFAULT_DEPARTMENTS, Department } from "../content/departments";

export type MetamanGameState = "menu" | "playing" | "paused";

interface ClickParticle {
  id: string;
  x: number;
  y: number;
  createdAt: number;
  value: string | number;
}

interface MetamanGameStore {
  gameState: MetamanGameState;
  income: number;
  users: number;
  selectedCampaign: string;
  regulatoryRisk: number;
  campaignCooldowns: Map<string, number>;
  showCampaignPanel: boolean;
  currentView: 'city' | 'basement';
  dataInventory: number;
  orbsInventory: number;
  permanentOrbs: number;
  
  // DATA MARKET SYSTEM
  dataMarket: {
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
    history: Array<{
      timestamp: number;
      prices: {
        behavioral: number;
        location: number;
        financial: number;
        biometric: number;
      };
    }>;
    lastUpdate: number;
  };
  
  // Incremental game mechanics
  departments: Department[];
  passiveIncome: number;
  totalIncomePerSecond: number;
  lastClickTime: number;
  clickCooldown: number;
  clickCooldownPercent: number;
  towerHeight: number;
  clickParticles: ClickParticle[];
  lastSave: number;
  lastPassiveUpdate: number;
  lastUserGenerationUpdate?: number;

  // Advanced progression
  totalLifetimeIncome: number;
  totalClicks: number;
  gameStartTime: number;
  fastestMillionTime: number;
  prestigeState: PrestigeState;
  achievementSystem: AchievementSystem;
  unlockedAchievements: ProgressionAchievement[];

  // Advanced systems
  automationSystem: AutomationSystem;
  synergySystem: SynergySystem;
  saveSystem: SaveSystem;
  totalDataCollected: number;
  
  // STATS TRACKING: Missing progression data
  sessionClicks: number;
  sessionMoney: number;
  sessionUsersLured: number;
  sessionOrbsHarvested: number;
  sessionDataSold: number;
  sessionCampaignsUsed: number;
  
  // NEW INFLUENCE POINTS SYSTEM
  influencePoints: number;
  totalInfluenceEarned: number;
  
  // PASSIVE USER GENERATION SYSTEM
  passiveUserGeneration: number;
  userFarmMultiplier: number;
  lastPassiveUserUpdate: number;
  sessionMoneyEarned: number;
  sessionUsersGained: number;
  totalOrbsCollected: number;
  totalCampaignsUsed: number;
  lastCampaignUsed: { id: string; cost: number; color: string; timestamp: number } | null;
  totalDataSold: number;
  
  advertiserData: {
    totalDataSold: number;
    incomeMultiplier: number;
    nextMilestone: number;
    milestonesReached: number;
  };
  
  sinisterLab: {
    slots: Array<{
      id: string;
      type: string;
      name: string;
      description: string;
      color: string;
      modifier: number;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
    } | null>;
    inventory: Array<{
      id: string;
      type: string;
      name: string;
      description: string;
      color: string;
      modifier: number;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
    }>;
    discoveredItems: Array<{
      id: string;
      type: string;
      name: string;
      description: string;
      color: string;
      modifier: number;
      rarity: 'common' | 'rare' | 'epic' | 'legendary';
    }>;
    orbBreakCount: number;
  };
  
  friends: Array<{
    id: string;
    name: string;
    unlocked: boolean;
    unlockCondition: string;
    description: string;
  }>;

  blackMarketState: {
    isUnlocked: boolean;
    isOpen: boolean;
    timeRemaining: number;
    lastOpenTime: number;
    nextUserThreshold: number;
    danVisible: boolean;
    danAnimating: boolean;
    purchases: string[];
    regulatoryHeat: number;
    influencePoints: number;
    luck: number;
  };
  
  gameSettings: {
    numberFormat: 'scientific' | 'suffix' | 'full';
    animationSpeed: number;
    showParticles: boolean;
    showTooltips: boolean;
    compactMode: boolean;
    muteOnBackground: boolean;
    showContextualHelp: boolean;
    simulateSafeArea: boolean;
  };
  
  showTrophyPanel: boolean;
  campaignCooldownReduction: number;
  campaignCharges: number;
  
  // NOTE: showDepartments, showProgression, showAutomation, showStatistics,
  // showSynergies, showOptions, showSinisterLab are managed as local useState
  // in GameUI.tsx via usePanelState hook — not duplicated in the store.
  showTutorial: boolean;
  
  lawsuitState: {
    isActive: boolean;
    isDelivered: boolean;
    isAcknowledged: boolean;
    showLawsuitPanel: boolean;
    plaintiff: string;
    claim: string;
    amount: number;
    redNpcActive: boolean;
    milestone?: string;
    penaltyPercent: number;
    redNpcCount: number;
    firstLawsuitTriggered: boolean;
    initialDelayPassed: boolean;
    redNpcAngles: number[];
  };
  
  lawsuitMilestones: {
    [key: string]: {
      triggered: boolean;
      threshold: number;
      type: 'income' | 'users' | 'departments' | 'time';
    };
  };

  rewardState: {
    rewards: Array<{
      id: string;
      type: 'achievement' | 'milestone' | 'daily' | 'special';
      title: string;
      description: string;
      value: number;
      claimed: boolean;
      dateAdded: number;
    }>;
    hasNewRewards: boolean;
    showSuitcasePanel: boolean;
    activeTab: 'lawsuits' | 'rewards';
    lastFlashTime: number;
    flashType: 'red' | 'green' | null;
    claimReward: (id: string | number) => void;
  };

  achievementManager: AchievementManager | null;
  currentAchievementPopup: SimpleAchievement | null;
  currentAchievementShowcase: SimpleAchievement | null;
  showOfflinePopup: boolean;
  offlineProgress: any;
  automationUpgradesPurchased: number;
  visualEffects: Array<{
    id: number;
    type: 'money' | 'users' | 'purchase' | 'achievement';
    x: number;
    y: number;
    duration: number;
    intensity: 'low' | 'medium' | 'high' | 'extreme';
    value?: string | number;
  }>;
  
  speechBubbleState: {
    isVisible: boolean;
    message: string;
    lastTriggerTime: number;
    triggeredRanges: Set<number>;
  };
  
  randomLawsuitManager: any;
  currentRandomLawsuit: RandomLawsuit | null;
  showRandomLawsuit: boolean;
  
  updateStats: (statType: 'clicks' | 'money' | 'users' | 'orbsCollected' | 'campaignsUsed' | 'dataSold', amount: number) => void;
  resetSessionStats: () => void;
  
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  incrementIncome: (amount: number) => void;
  incrementUsers: (amount: number) => void;
  setIncome: (amount: number) => void;
  decrementIncome: (amount: number) => void;
  setSelectedCampaign: (campaignId: string) => void;
  setRegulatoryRisk: (risk: number) => void;
  setCampaignCooldown: (campaignId: string, cooldown: number) => void;
  updateCampaignCooldowns: () => void;
  toggleCampaignPanel: () => void;
  setCurrentView: (view: 'city' | 'basement') => void;
  incrementDataInventory: (amount: number) => void;
  incrementOrbsInventory: (amount: number) => void;
  setDataInventory: (amount: number) => void;
  sellAllData: () => void;
  initializeGame: () => void;
  
  handleManualClick: (x?: number, y?: number) => void;
  buyDepartment: (departmentId: string) => boolean;
  buyMaxDepartments: (departmentId: string) => number;
  calculateDepartmentCost: (department: Department) => number;
  calculateDepartmentIncome: (department: Department) => number;
  calculateDataOrbValue: () => number;
  updatePassiveIncome: () => void;
  applyPassiveIncome: () => void;
  applyPassiveUserGeneration: () => void;
  updateTowerHeight: () => void;
  formatNumber: (num: number) => string;
  
  performPrestige: () => void;
  checkAchievements: () => void;
  closeOfflinePopup: () => void;
  claimOfflineRewards: () => void;
  activeTipTarget: string | null;
  setActiveTipTarget: (target: string | null) => void;
  getGameStats: () => GameStats;
  
  purchaseAutomationUpgrade: (upgradeId: string) => boolean;
  purchaseSynergyUpgrade: (upgradeId: string) => boolean;
  purchaseCampaign: (campaignId: string, cost: number, color: string) => boolean;
  updateGameSettings: (settings: any) => void;
  performHardReset: () => void;
  exportSave: () => string;
  importSave: (saveString: string) => boolean;
  saveGame: () => void;
  loadGame: () => boolean;
  addClickParticle: (x: number, y: number, value: number | string) => void;
  updateClickParticles: () => void;
  setCampaignCharges: (charges: number) => void;
  addReward: (reward: { id?: string | number; type: 'achievement' | 'milestone' | 'daily' | 'special'; title: string; description: string; value: number; claimed?: boolean; dateAdded?: number; }) => void;
  addInfluencePoints: (amount: number) => void;

  checkDanVisitTrigger: () => void;
  triggerDanVisit: () => void;
  purchaseBlackMarketItem: (itemId: string, cost: number, currency: 'money' | 'orbs') => boolean;
  updateBlackMarketTimer: () => void;
  closeBlackMarket: () => void;
  
  checkRandomLawsuits: () => void;
  resolveRandomLawsuit: (resolution: 'ignore' | 'settle' | 'fight') => void;
  closeRandomLawsuit: () => void;
  
  triggerLawsuit: (milestoneId?: string) => void;
  deliverLawsuit: () => void;
  toggleLawsuitPanel: () => void;
  dismissLawsuit: () => void;
  checkLawsuitMilestones: () => void;

  claimAchievement: (achievementId: string) => void;
  closeAchievementPopup: () => void;
  showAchievementShowcase: (achievement: SimpleAchievement) => void;
  closeAchievementShowcase: () => void;
  addVisualEffect: (type: 'money' | 'users' | 'purchase' | 'achievement', x?: number, y?: number, intensity?: 'low' | 'medium' | 'high' | 'extreme', value?: string | number) => void;
  removeVisualEffect: (id: number) => void;
  clearAllVisualEffects: () => void;
  toggleTrophyPanel: () => void;
  setShowTutorial: (show: boolean) => void;
  forceRestoreAllButtons: () => void;
  
  triggerSpeechBubble: () => void;
  checkSpeechBubbleTrigger: () => void;
  
  checkGrandUserMilestones: () => void;
  grandMilestones: {
    guardian_10m: boolean;
    guardian_50m: boolean;
    guardian_100m: boolean;
    platform_conqueror: boolean;
  };

  addGemToInventory: (gem: any) => void;
  addGemToSlot: (gem: any, slotIndex: number) => void;
  removeGemFromSlot: (slotIndex: number) => void;
  addDiscoveredGem: (gem: any) => void;
  incrementOrbBreakCount: () => void;
  getGemBonuses: () => {
    userGeneration: number;
    clickPower: number;
    orbCollection: number;
    departmentEfficiency: number;
    influenceGeneration: number;
  };
  applyGemUserGeneration: () => void;
  updateMarketPrices: () => void;

  // Data Market actions & state
  showDataMarket: boolean;
  setShowDataMarket: (show: boolean) => void;
  addDataToMarketInventory: (type: 'behavioral' | 'location' | 'financial' | 'biometric', amount: number) => void;
  sellData: (type: 'behavioral' | 'location' | 'financial' | 'biometric', amount: number, multiplier: number, heatIncrease: number) => void;

  // Character System Actions & State
  characters: {
    walsh: { suspicion: number; flags: string[] };
    whistleblower: { active: boolean; ignoredCount: number };
    rival: { users: number; growthRate: number };
  };
  showCharacterDialogue: boolean;
  activeCharacter: string | null;
  setCharacterDialogue: (charId: string | null) => void;
  updateCharacterState: (charName: 'walsh' | 'whistleblower' | 'rival', updates: any) => void;

  // Phase 3 Minigame State
  showEspionage: boolean;
  setShowEspionage: (show: boolean) => void;
  showServerDefense: boolean;
  setShowServerDefense: (show: boolean) => void;
  triggerServerDefense: () => void;
  showSenateHearing: boolean;
  setShowSenateHearing: (show: boolean) => void;
  applySaveData: (data: any) => void;
  // Phase 4: Cohort Management
  cohorts: {
    teens: number;
    pros: number;
    seniors: number;
    addicts: number;
  };
  setCohorts: (cohorts: any) => void;
  updatePassiveUserGeneration: () => void;
  // Progression and Milestones
  progressionState: {
    permanentBonuses: {
      gettingStarted: boolean; // $1k: +5% income
      millionaire: boolean;   // $1M: +10% income
      billionaire: boolean;   // $1B: +15% income
      trillionaire: boolean;  // $1T: +25% prestige points
      clicktastic: boolean;   // 1k clicks: +10% click power
      clickMaster: boolean;   // 100k clicks: +25% click power
      speedDemon: boolean;    // $1M < 10m: +20% income
      miningEmpire: boolean;  // 100 Data Miners: +10% efficiency
      corporateOverlord: boolean; // 100 all departments: +50% all efficiency
      dedicatedPlayer: boolean;   // 1h playtime: +50% offline income
    };
    megaMilestones: {
      socialMediaEmpire: boolean; // 300k: +$500k, Mega tower boost
      dopamineKingpin: boolean;   // 500k: +$1.5M, Double click power
      digitalOverlord: boolean;   // 1M: +$10M, 3x income multiplier
      realityDistorter: boolean;  // 2M: +$25M, 5x income multiplier
      consciousnessHarvester: boolean; // 5M: +$100M, 10x multiplier
    };
  };
  checkMegaMilestones: () => void;
  checkPermanentBonuses: () => void;
  getTotalIncomeMultiplier: () => number;
  getClickPowerMultiplier: () => number;
  // Tips and Tutorial
  dismissedTips: string[];
  dismissTip: (tipId: string) => void;
  // Shop purchases tracked in store (not local localStorage)
  shopPurchases: string[];
  addShopPurchase: (itemId: string) => void;
  // Mansion upgrades tracked in store (not local localStorage)
  mansionPurchases: string[];
  addMansionPurchase: (itemId: string) => void;
  achievementQueue: SimpleAchievement[];
  processAchievementQueue: () => void;
}


export const useMetamanGame = create<MetamanGameStore>()(
  subscribeWithSelector((set, get) => {
    const saveSystem = new SaveSystem();
    const achievementSystem = new AchievementSystem();
    const automationSystem = new AutomationSystem(
      (amount) => get().incrementIncome(amount),
      (id, amount) => {
        for (let i = 0; i < amount; i++) {
          get().buyDepartment(id);
        }
      }
    );
    const synergySystem = new SynergySystem();

    return {
      saveSystem,
      achievementSystem,
      automationSystem,
      synergySystem,
      gameState: "menu",
      income: 1000, 
      users: 0,
      selectedCampaign: "social_feed",
      regulatoryRisk: 0,
      campaignCooldowns: new Map(),
      showCampaignPanel: false,
      currentView: 'city',
      dataInventory: 0,
      orbsInventory: 0,
      permanentOrbs: 0,
      
      // DATA MARKET SYSTEM
      dataMarket: {
        inventory: {
          behavioral: 0,
          location: 0,
          financial: 0,
          biometric: 0
        },
        prices: {
          behavioral: 10,
          location: 25,
          financial: 50,
          biometric: 100
        },
        history: [],
        lastUpdate: Date.now()
      },
      
      // Incremental game state
      departments: [...DEFAULT_DEPARTMENTS],
      passiveIncome: 0,
      totalIncomePerSecond: 0,
      lastClickTime: 0,
      clickCooldown: 300, 
      clickCooldownPercent: 100,
      campaignCooldownReduction: 0, 
      campaignCharges: 5, 
      towerHeight: 1, 
      clickParticles: [],
      lastSave: Date.now(),
      lastPassiveUpdate: Date.now(),
      lastUserGenerationUpdate: Date.now(),
      
      // Advanced progression
      totalLifetimeIncome: 0,
      totalClicks: 0,
      gameStartTime: Date.now(),
      fastestMillionTime: 0,
      totalDataCollected: 0,
      totalOrbsCollected: 0,
      totalCampaignsUsed: 0,
      totalDataSold: 0,
      unlockedAchievements: [],
      automationUpgradesPurchased: 0,

      // NEW SYSTEM INITIALIZATION
      sessionClicks: 0,
      sessionMoney: 0,
      sessionMoneyEarned: 0,
      sessionUsersLured: 0,
      sessionUsersGained: 0,
      sessionOrbsHarvested: 0,
      sessionDataSold: 0,
      sessionCampaignsUsed: 0,
      influencePoints: 0,
      totalInfluenceEarned: 0,
      passiveUserGeneration: 0,
      userFarmMultiplier: 1,
      showDataMarket: false,
      lastPassiveUserUpdate: Date.now(),
      
      // Phase 3 Minigame State
      showEspionage: false,
      showServerDefense: false,
      showSenateHearing: false,
      cohorts: {
        teens: 0,
        pros: 0,
        seniors: 0,
        addicts: 0
      },
      dismissedTips: [],
      dismissTip: (tipId: string) => set((state) => ({
        dismissedTips: state.dismissedTips.includes(tipId) 
          ? state.dismissedTips 
          : [...state.dismissedTips, tipId]
      })),
      shopPurchases: [],
      lastCampaignUsed: null,
      characters: {
        walsh: {
          suspicion: 0,
          flags: []
        },
        whistleblower: {
          active: false,
          ignoredCount: 0
        },
        rival: {
          users: 0,
          growthRate: 0
        }
      },
      setCohorts: (cohorts: any) => set({ cohorts }),
      addShopPurchase: (itemId: string) => set((state) => ({
        shopPurchases: state.shopPurchases.includes(itemId)
          ? state.shopPurchases
          : [...state.shopPurchases, itemId]
      })),
      mansionPurchases: [],
      addMansionPurchase: (itemId: string) => set((state: any) => ({
        mansionPurchases: state.mansionPurchases.includes(itemId)
          ? state.mansionPurchases
          : [...state.mansionPurchases, itemId]
      })),
    showCharacterDialogue: false,
    activeCharacter: null,
    
    // UI Panel states — showDepartments/Progression/etc. are in usePanelState hook
    showTrophyPanel: false,
    showTutorial: false,
    showOfflinePopup: false,
    achievementQueue: [],
    
    // Systems
    sinisterLab: {
      slots: [null, null, null],
      inventory: [],
      discoveredItems: [],
      orbBreakCount: 0
    },
    grandMilestones: {
      guardian_10m: false,
      guardian_50m: false,
      guardian_100m: false,
      platform_conqueror: false
    },
    activeTipTarget: null,
    setActiveTipTarget: (target: string | null) => set({ activeTipTarget: target }),
    blackMarketState: {
      isUnlocked: false,
      isOpen: false,
      timeRemaining: 0,
      lastOpenTime: 0,
      nextUserThreshold: 1000,
      danVisible: false,
      danAnimating: false,
      purchases: [],
      regulatoryHeat: 0,
      influencePoints: 0,
      luck: 0
    },
    gameSettings: {
      numberFormat: 'suffix',
      animationSpeed: 1,
      showParticles: true,
      showTooltips: true,
      compactMode: false,
      muteOnBackground: false,
      showContextualHelp: true,
      simulateSafeArea: false
    },
    lawsuitState: {
      isActive: false,
      isDelivered: false,
      isAcknowledged: false,
      showLawsuitPanel: false,
      plaintiff: '',
      claim: '',
      amount: 0,
      redNpcActive: false,
      milestone: '',
      penaltyPercent: 0,
      redNpcCount: 1,
      redNpcAngles: [45],
      firstLawsuitTriggered: false,
      initialDelayPassed: false
    },
    rewardState: {
      rewards: [],
      hasNewRewards: false,
      showSuitcasePanel: false,
      activeTab: 'rewards' as const,
      lastFlashTime: 0,
      flashType: null,
      claimReward: (id: string | number) => {
        const state = get();
        const rewards = [...state.rewardState.rewards];
        const rewardIdx = rewards.findIndex(r => String(r.id) === String(id));
        
        if (rewardIdx !== -1 && !rewards[rewardIdx].claimed) {
          const reward = rewards[rewardIdx];
          const value = reward.value || (reward as any).amount || 0;
          
          // Mark as claimed
          rewards[rewardIdx] = { ...reward, claimed: true };

          // CRITICAL: Also update the internal achievement manager if it's an achievement
          if (reward.type === 'achievement' && state.achievementManager) {
            const achievementId = String(reward.id).replace('achievement_', '');
            state.achievementManager.claimAchievement(achievementId);
          }
          
          // Add money
          set((s) => ({
            income: s.income + value,
            totalLifetimeIncome: s.totalLifetimeIncome + value,
            rewardState: {
              ...s.rewardState,
              rewards,
              hasNewRewards: rewards.some(r => !r.claimed)
            }
          }));
          
          // Trigger visual effect
          get().addVisualEffect('money', 512, 384, 'high', `+$${get().formatNumber(value)}`);
          
          return true;
        }
        return false;
      }
    },
    progressionState: {
      permanentBonuses: {
        gettingStarted: false,
        millionaire: false,
        billionaire: false,
        trillionaire: false,
        clicktastic: false,
        clickMaster: false,
        speedDemon: false,
        miningEmpire: false,
        corporateOverlord: false,
        dedicatedPlayer: false
      },
      megaMilestones: {
        socialMediaEmpire: false,
        dopamineKingpin: false,
        digitalOverlord: false,
        realityDistorter: false,
        consciousnessHarvester: false
      }
    },
    checkMegaMilestones: () => {
      const state = get();
      const users = state.users;
      const { megaMilestones } = state.progressionState;
      
      const newMilestones = { ...megaMilestones };
      let changed = false;
      
      if (users >= 300000 && !megaMilestones.socialMediaEmpire) {
        newMilestones.socialMediaEmpire = true;
        changed = true;
        get().addReward({ id: 'milestone_social_media_empire', type: 'special' as const, title: 'Social Media Empire', description: '300k Users Breakthrough!', value: 500000 });
        get().addVisualEffect('achievement', 512, 384, 'extreme', 'SOCIAL MEDIA EMPIRE');
      }
      if (users >= 500000 && !megaMilestones.dopamineKingpin) {
        newMilestones.dopamineKingpin = true;
        changed = true;
        get().addReward({ id: 'milestone_dopamine_kingpin', type: 'special' as const, title: 'Dopamine Kingpin', description: '500k Users Breakthrough!', value: 1500000 });
        get().addVisualEffect('achievement', 512, 384, 'extreme', 'DOPAMINE KINGPIN');
      }
      if (users >= 1000000 && !megaMilestones.digitalOverlord) {
        newMilestones.digitalOverlord = true;
        changed = true;
        get().addReward({ id: 'milestone_digital_overlord', type: 'special' as const, title: 'Digital Overlord', description: '1M Users Breakthrough!', value: 10000000 });
        get().addVisualEffect('achievement', 512, 384, 'extreme', 'DIGITAL OVERLORD (3x MULTIPLIER)');
      }
      if (users >= 2000000 && !megaMilestones.realityDistorter) {
        newMilestones.realityDistorter = true;
        changed = true;
        get().addReward({ id: 'milestone_reality_distorter', type: 'special' as const, title: 'Reality Distorter', description: '2M Users Breakthrough!', value: 25000000 });
        get().addVisualEffect('achievement', 512, 384, 'extreme', 'REALITY DISTORTER (5x MULTIPLIER)');
      }
      if (users >= 5000000 && !megaMilestones.consciousnessHarvester) {
        newMilestones.consciousnessHarvester = true;
        changed = true;
        get().addReward({ id: 'milestone_consciousness_harvester', type: 'special' as const, title: 'Consciousness Harvester', description: '5M Users Breakthrough!', value: 100000000 });
        get().addVisualEffect('achievement', 512, 384, 'extreme', 'CONSCIOUSNESS HARVESTER (10x MULTIPLIER)');
      }
      
      if (changed) {
        set((s) => ({
          progressionState: { ...s.progressionState, megaMilestones: newMilestones }
        }));
      }
    },
    checkPermanentBonuses: () => {
      const state = get();
      const { permanentBonuses } = state.progressionState;
      const newBonuses = { ...permanentBonuses };
      let changed = false;
      
      // Revenue-based
      if (state.totalLifetimeIncome >= 1000 && !permanentBonuses.gettingStarted) {
        newBonuses.gettingStarted = true;
        changed = true;
        get().addVisualEffect('achievement' as any, 512, 384, 'medium', '+5% INCOME BONUS');
      }
      if (state.totalLifetimeIncome >= 1000000 && !permanentBonuses.millionaire) {
        newBonuses.millionaire = true;
        changed = true;
        get().addVisualEffect('achievement' as any, 512, 384, 'medium', '+10% INCOME BONUS');
      }
      if (state.totalLifetimeIncome >= 1000000000 && !permanentBonuses.billionaire) {
        newBonuses.billionaire = true;
         changed = true;
      }
      
      // Click-based
      if (state.totalClicks >= 1000 && !permanentBonuses.clicktastic) {
        newBonuses.clicktastic = true;
        changed = true;
        get().addVisualEffect('achievement' as any, 512, 384, 'medium', '+10% CLICK POWER');
      }
      if (state.totalClicks >= 100000 && !permanentBonuses.clickMaster) {
        newBonuses.clickMaster = true;
        changed = true;
        get().addVisualEffect('achievement' as any, 512, 384, 'medium', '+25% CLICK POWER');
      }
      
      // Department-based
      const dataMiners = state.departments.find(d => d.id === 'data_miners')?.owned || 0;
      if (dataMiners >= 100 && !permanentBonuses.miningEmpire) {
        newBonuses.miningEmpire = true;
        changed = true;
      }
      
      const allDepts100 = state.departments.every(d => d.owned >= 100);
      if (allDepts100 && state.departments.length >= 5 && !permanentBonuses.corporateOverlord) {
        newBonuses.corporateOverlord = true;
        changed = true;
      }
      
      // Playtime-based (approximate from gameStartTime)
      const playtimeHours = (Date.now() - state.gameStartTime) / (1000 * 60 * 60);
      if (playtimeHours >= 1 && !permanentBonuses.dedicatedPlayer) {
        newBonuses.dedicatedPlayer = true;
        changed = true;
      }
      
      if (changed) {
        set((s) => ({
          progressionState: { ...s.progressionState, permanentBonuses: newBonuses }
        }));
      }
    },
    speechBubbleState: {
      isVisible: false,
      message: '',
      lastTriggerTime: 0,
      triggeredRanges: new Set()
    },
    achievementManager: null,
    currentAchievementPopup: null,
    currentAchievementShowcase: null,
    offlineProgress: null,
    visualEffects: [],
    randomLawsuitManager: new (RandomLawsuitManager as any)(),
    currentRandomLawsuit: null,
    showRandomLawsuit: false,
    
    // Friends system initialization
    friends: [
      {
        id: 'dopamine_dealer_dan',
        name: 'Unknown Friend #1',
        unlocked: false,
        unlockCondition: 'Earn $1,000,000',
        description: '???'
      },
      {
        id: 'count_vlad_clickula',
        name: 'Unknown Friend #2',
        unlocked: false,
        unlockCondition: 'Late game milestone',
        description: '???'
      }
    ],
    // Prestige state
    prestigeState: {
      influencePoints: 0,
      prestigeLevel: 0,
      prestigeMultiplier: 1.0,
      canPrestige: false,
      totalLifetimeIncome: 0
    },

    advertiserData: {
      totalDataSold: 0,
      incomeMultiplier: 1.0,
      nextMilestone: 1000,
      milestonesReached: 0
    },

    lawsuitMilestones: {
      first_user_complaint: { triggered: false, threshold: 25000, type: 'users' },
      bomb_130: { triggered: false, threshold: 50000, type: 'users' },
      bomb_2500: { triggered: false, threshold: 100000, type: 'users' },
      bomb_15k: { triggered: false, threshold: 250000, type: 'users' },
      bomb_50k: { triggered: false, threshold: 750000, type: 'users' },
      bomb_150k: { triggered: false, threshold: 1500000, type: 'users' },
      bomb_500k: { triggered: false, threshold: 5000000, type: 'users' },
      business_license_issue: { triggered: false, threshold: 100000, type: 'income' },
      employee_rights: { triggered: false, threshold: 5, type: 'departments' },
      competitor_sabotage: { triggered: false, threshold: 10000, type: 'users' },
      advertising_fraud: { triggered: false, threshold: 250000, type: 'income' },
      data_breach_lawsuit: { triggered: false, threshold: 50000, type: 'users' },
      antitrust_investigation: { triggered: false, threshold: 1000000, type: 'income' },
      international_gdpr: { triggered: false, threshold: 100000, type: 'users' },
      mental_health_lawsuit: { triggered: false, threshold: 15, type: 'departments' },
      congressional_hearing: { triggered: false, threshold: 10000000, type: 'income' }
    },

    // ACTIONS
    startGame: () => {
      // Don't clear localStorage here! Hard reset is available in Options.
      set({ 
        gameState: "playing",
        income: 0,
        users: 0,
        totalLifetimeIncome: 0,
        totalClicks: 0,
        departments: [...DEFAULT_DEPARTMENTS],
        towerHeight: 1,
        dataInventory: 0,
        campaignCharges: 5,
        regulatoryRisk: 0,
        campaignCooldowns: new Map(),
        gameStartTime: Date.now(),
        lastPassiveUpdate: Date.now(),
        lastUserGenerationUpdate: Date.now(),
        sessionMoneyEarned: 0,
        sessionUsersGained: 0
      });
    },

    pauseGame: () => set({ gameState: "paused" }),
    resumeGame: () => set({ gameState: "playing" }),

    updateStats: (statType, amount) => {
      set((state: any) => ({
        [`session${statType.charAt(0).toUpperCase() + statType.slice(1)}`]: (state[`session${statType.charAt(0).toUpperCase() + statType.slice(1)}`] || 0) + amount
      }));
    },
    
    resetSessionStats: () => set({
      sessionClicks: 0, sessionMoney: 0, sessionUsersLured: 0, sessionOrbsHarvested: 0, sessionDataSold: 0, sessionCampaignsUsed: 0
    }),
    
    setSelectedCampaign: (campaignId) => set({ selectedCampaign: campaignId }),
    
    calculateDataOrbValue: () => {
      const state = get();
      return 10 * (1 + (state.users / 1000));
    },

    performPrestige: () => {
      const state = get();
      if (!state.prestigeState.canPrestige) return;
      
      const newLevel = state.prestigeState.prestigeLevel + 1;
      const influenceGained = Math.floor(state.income / 1000000);
      
      set((state) => ({
        income: 1000,
        users: 0,
        departments: [...DEFAULT_DEPARTMENTS],
        prestigeState: {
          ...state.prestigeState,
          prestigeLevel: newLevel,
          influencePoints: state.prestigeState.influencePoints + influenceGained,
          prestigeMultiplier: 1 + (newLevel * 0.1),
          canPrestige: false
        }
      }));
      get().startGame(); // Restart with new multiplier
    },

    triggerLawsuit: (milestoneId) => {
      set((state) => ({
        lawsuitState: {
          ...state.lawsuitState,
          isActive: true,
          showLawsuitPanel: true,
          milestone: milestoneId || 'random',
          plaintiff: "Regulatory Body",
          claim: "Unfair data practices",
          amount: Math.floor(state.income * 0.2)
        }
      }));
    },

    deliverLawsuit: () => set((state) => ({ lawsuitState: { ...state.lawsuitState, isDelivered: true } })),
    toggleLawsuitPanel: () => {
      const state = get();
      // If we are closing the panel, deduct the amount (settle the lawsuit)
      if (state.lawsuitState.showLawsuitPanel) {
        const amount = state.lawsuitState.amount || 0;
        set((s) => ({
          income: Math.max(0, s.income - amount),
          lawsuitState: { ...s.lawsuitState, showLawsuitPanel: false, isActive: false }
        }));
        // Show visual feedback for money loss
        get().addVisualEffect('money', 512, 384, 'high', `-$${get().formatNumber(amount)}`);
      } else {
        set((state) => ({ lawsuitState: { ...state.lawsuitState, showLawsuitPanel: true } }));
      }
    },
    dismissLawsuit: () => set((state) => ({ lawsuitState: { ...state.lawsuitState, isActive: false, showLawsuitPanel: false } })),
    
    checkLawsuitMilestones: () => {
      const state = get();
      
      // CRITICAL: Do not trigger lawsuits while tutorial tips are active
      if (state.activeTipTarget) return;

      Object.entries(state.lawsuitMilestones).forEach(([id, milestone]) => {
        if (!milestone.triggered) {
          let triggered = false;
          if (milestone.type === 'income' && state.income >= milestone.threshold) triggered = true;
          if (milestone.type === 'users' && state.users >= milestone.threshold) triggered = true;
          
          if (triggered) {
            set((state) => ({
              lawsuitMilestones: {
                ...state.lawsuitMilestones,
                [id]: { ...milestone, triggered: true }
              }
            }));
            get().triggerLawsuit(id);
          }
        }
      });
    },

    getTotalIncomeMultiplier: () => {
      const state = get();
      const { permanentBonuses, megaMilestones } = state.progressionState;
      let multiplier = state.prestigeState.prestigeMultiplier || 1.0;
      
      // Permanent bonuses from list
      if (permanentBonuses.gettingStarted) multiplier *= 1.05;
      if (permanentBonuses.millionaire) multiplier *= 1.10;
      if (permanentBonuses.billionaire) multiplier *= 1.15;
      if (permanentBonuses.speedDemon) multiplier *= 1.20;
      
      // Mega milestones
      if (megaMilestones.digitalOverlord) multiplier *= 3;
      if (megaMilestones.realityDistorter) multiplier *= 5;
      if (megaMilestones.consciousnessHarvester) multiplier *= 10;
      
      return multiplier;
    },

    getClickPowerMultiplier: () => {
      const state = get();
      const { permanentBonuses, megaMilestones } = state.progressionState;
      let multiplier = 1.0;
      
      if (permanentBonuses.clicktastic) multiplier *= 1.10;
      if (permanentBonuses.clickMaster) multiplier *= 1.25;
      if (megaMilestones.dopamineKingpin) multiplier *= 2.0;
      
      return multiplier;
    },

    incrementIncome: (amount: number) => {
      const state = get();
      const gemBonuses = state.getGemBonuses?.() || { clickPower: 0 };
      const clickMultiplier = (1 + (gemBonuses.clickPower / 100)) * state.getClickPowerMultiplier();
      const incomeMultiplier = state.getTotalIncomeMultiplier();
      const boostedAmount = amount * clickMultiplier * incomeMultiplier;
      
      set((state) => {
        const newIncome = state.income + boostedAmount;
        const newTotalLifetime = state.totalLifetimeIncome + boostedAmount;
        
        // Check for friend unlocks
        const updatedFriends = state.friends.map(friend => {
          if (friend.id === 'dopamine_dealer_dan' && !friend.unlocked && newTotalLifetime >= 1000000) {
            return {
              ...friend,
              unlocked: true,
              name: 'Dopamine Dealer Dan',
              description: 'Your first business associate.'
            };
          }
          return friend;
        });

        return {
          income: newIncome,
          totalLifetimeIncome: newTotalLifetime,
          friends: updatedFriends,
          sessionMoneyEarned: (state.sessionMoneyEarned || 0) + boostedAmount,
          sessionUsersLured: (state.sessionUsersLured || 0) + (amount > 0 ? 1 : 0) // Increment lure count if amount > 0
        };
      });
      state.checkPermanentBonuses();
      get().checkAchievements();
    },

    incrementUsers: (amount: number) => {
      if (amount <= 0) return;
      set((state) => {
        const teensGain = Math.floor(amount * 0.4);
        const prosGain = Math.floor(amount * 0.3);
        const seniorsGain = Math.floor(amount * 0.2);
        const addictsGain = amount - (teensGain + prosGain + seniorsGain);
        const newUsers = state.users + amount;
        get().checkMegaMilestones();
        get().checkGrandUserMilestones();
        get().checkLawsuitMilestones();
        get().checkAchievements();
        
        return { 
          users: newUsers,
          cohorts: {
            teens: (state.cohorts?.teens || 0) + teensGain,
            pros: (state.cohorts?.pros || 0) + prosGain,
            seniors: (state.cohorts?.seniors || 0) + seniorsGain,
            addicts: (state.cohorts?.addicts || 0) + addictsGain,
          },
          sessionUsersGained: (state.sessionUsersGained || 0) + amount
        };
      });
    },

    applyPassiveIncome: () => {
      const state = get();
      const now = Date.now();
      const diff = (now - state.lastPassiveUpdate) / 1000;
      if (diff <= 0) return;
      
      // Apply gem efficiency bonus to passive income
      const gemBonuses = get().getGemBonuses();
      const efficiencyMultiplier = 1 + (gemBonuses.departmentEfficiency / 100);
      const incomeMultiplier = get().getTotalIncomeMultiplier();
      const earnings = state.totalIncomePerSecond * diff * efficiencyMultiplier * incomeMultiplier;
      set({ 
        income: state.income + earnings,
        totalLifetimeIncome: state.totalLifetimeIncome + earnings,
        lastPassiveUpdate: now
      });
      get().checkPermanentBonuses();
      get().checkAchievements();
    },

    applyPassiveUserGeneration: () => get().updatePassiveUserGeneration(),
    formatNumber: (num) => formatLargeNumber(num),

    checkAchievements: () => {
      const state = get();
      if (state.achievementManager) {
        state.achievementManager.updateProgress(state.totalLifetimeIncome, state.users);
      }
    },

    saveGame: () => {
      const state = get();
      state.saveSystem.saveGame(state);
      set({ lastSave: Date.now() });
    },

    loadGame: () => {
      const state = get();
      const saveData = state.saveSystem.loadGame();
      if (saveData) {
        get().applySaveData(saveData);
        return true;
      }
      return false;
    },

    applySaveData: (saveData: any) => {
      const state = get();
      
      // Update basic state
      set({
        income: saveData.gameState.income,
        users: saveData.gameState.users,
        totalLifetimeIncome: saveData.gameState.totalLifetimeIncome,
        totalClicks: saveData.gameState.totalClicks,
        gameStartTime: saveData.gameState.gameStartTime,
        fastestMillionTime: saveData.gameState.fastestMillionTime || 0,
        departments: saveData.gameState.departments,
        towerHeight: saveData.gameState.towerHeight || 1,
        dataInventory: saveData.gameState.dataInventory || 0,
        totalDataCollected: saveData.gameState.totalDataCollected || 0,
        campaignCharges: saveData.gameState.campaignCharges || 5,
        cohorts: saveData.gameState.cohorts || state.cohorts,
        dataMarket: saveData.gameState.dataMarket || state.dataMarket,
        orbsInventory: saveData.gameState.orbsInventory || 0,
        permanentOrbs: saveData.gameState.permanentOrbs || 0,
        influencePoints: saveData.gameState.influencePoints || 0,
        totalInfluenceEarned: saveData.gameState.totalInfluenceEarned || 0,
        passiveUserGeneration: saveData.gameState.passiveUserGeneration || 0,
        totalOrbsCollected: saveData.gameState.totalOrbsCollected || 0,
        totalCampaignsUsed: saveData.gameState.totalCampaignsUsed || 0,
        lastCampaignUsed: saveData.gameState.lastCampaignUsed || null,
        advertiserData: saveData.gameState.advertiserData || state.advertiserData,
        sinisterLab: saveData.gameState.sinisterLab || state.sinisterLab,
        blackMarketState: saveData.gameState.blackMarketState || state.blackMarketState,
        lawsuitState: saveData.gameState.lawsuitState || state.lawsuitState,
        grandMilestones: saveData.gameState.grandMilestones || state.grandMilestones,
        rewardState: {
          ...state.rewardState,
          ...(saveData.gameState.rewardState || {}),
          claimReward: state.rewardState.claimReward, // Preserve store function!
          rewards: (saveData.gameState.rewardState?.rewards || []).map((r: any) => ({
            ...r,
            id: r.id || Date.now() + Math.random(),
            claimed: !!r.claimed,
            dateAdded: r.dateAdded || Date.now()
          })),
          hasNewRewards: (saveData.gameState.rewardState?.rewards || []).some((r: any) => !r.claimed)
        },
        achievementQueue: saveData.gameState.achievementQueue || [],
        progressionState: {
          ...state.progressionState,
          ...(saveData.gameState.progressionState || {})
        },
        lawsuitMilestones: {
          ...state.lawsuitMilestones,
          ...(saveData.gameState.lawsuitMilestones || {})
        },
        showTrophyPanel: saveData.gameState.showTrophyPanel || false,
        shopPurchases: saveData.gameState.shopPurchases || [],
        mansionPurchases: saveData.gameState.mansionPurchases || [],
        regulatoryRisk: saveData.gameState.regulatoryRisk || 0,
        characters: saveData.gameState.characters || state.characters,
        dismissedTips: saveData.gameState.dismissedTips || [],
        lastPassiveUpdate: saveData.gameState.lastPassiveUpdate || Date.now(),
        lastPassiveUserUpdate: saveData.gameState.lastPassiveUserUpdate || Date.now(),
        gameState: "playing" // Switch to playing when loaded
      });

      // Restore systems data
      if (saveData.gameState.achievementManagerData) {
        state.achievementManager?.deserialize(saveData.gameState.achievementManagerData);
      }
      if (saveData.progression?.achievements) {
        state.achievementSystem?.importData(saveData.progression.achievements);
      }
      if (saveData.automation) {
        state.automationSystem?.importData(saveData.automation);
      }
      if (saveData.synergies) {
        state.synergySystem?.importData(saveData.synergies);
      }
      
      // Update rates immediately after loading
      get().updatePassiveIncome();
      get().updateTowerHeight();
    },


    addClickParticle: (x: number, y: number, value: number | string) => {
      const id = `${Date.now()}-${Math.random()}`;
      set((state) => ({
        clickParticles: [...state.clickParticles, { id, x, y, value, createdAt: Date.now() }]
      }));
    },

    updateClickParticles: () => {
      const now = Date.now();
      set((state) => ({
        clickParticles: state.clickParticles.filter(p => now - p.createdAt < 1000)
      }));
    },

    setCampaignCharges: (charges: number) => set({ campaignCharges: charges }),

    setShowDataMarket: (show) => set({ showDataMarket: show }),
    
    addDataToMarketInventory: (type, amount) => {
      set((state) => ({
        dataMarket: {
          ...state.dataMarket,
          inventory: {
            ...state.dataMarket.inventory,
            [type]: state.dataMarket.inventory[type] + amount
          }
        }
      }));
    },

    sellData: (type, amount, multiplier, heatIncrease) => {
      const state = get();
      if (state.dataMarket.inventory[type] < amount) return;
      const price = state.dataMarket.prices[type] * multiplier;
      const totalGain = price * amount;
      set((state) => ({
        income: state.income + totalGain,
        totalLifetimeIncome: state.totalLifetimeIncome + totalGain,
        dataMarket: {
          ...state.dataMarket,
          inventory: { ...state.dataMarket.inventory, [type]: state.dataMarket.inventory[type] - amount }
        },
        regulatoryRisk: Math.min(100, state.regulatoryRisk + heatIncrease)
      }));
    },

    updateMarketPrices: () => {
      set((state) => {
        const newPrices = {
          behavioral: state.dataMarket.prices.behavioral * (0.9 + Math.random() * 0.2),
          location: state.dataMarket.prices.location * (0.9 + Math.random() * 0.2),
          financial: state.dataMarket.prices.financial * (0.9 + Math.random() * 0.2),
          biometric: state.dataMarket.prices.biometric * (0.9 + Math.random() * 0.2)
        };
        return {
          dataMarket: {
            ...state.dataMarket,
            prices: newPrices,
            history: [...state.dataMarket.history.slice(-19), { timestamp: Date.now(), prices: newPrices }],
            lastUpdate: Date.now()
          }
        };
      });
    },

    checkRandomLawsuits: () => {
      const state = get();
      if (state.regulatoryRisk > 50 && Math.random() < 0.01) {
        set({ showRandomLawsuit: true, currentRandomLawsuit: state.randomLawsuitManager.getRandomLawsuit() });
      }
    },

    resolveRandomLawsuit: (resolution) => set({ showRandomLawsuit: false, currentRandomLawsuit: null }),
    closeRandomLawsuit: () => set({ showRandomLawsuit: false, currentRandomLawsuit: null }),

    setCharacterDialogue: (charId) => set({ activeCharacter: charId, showCharacterDialogue: !!charId }),
    
    updateCharacterState: (charName, updates) => set((state) => ({
      characters: { ...state.characters, [charName]: { ...state.characters[charName], ...updates } }
    })),

    setShowEspionage: (show) => set({ showEspionage: show }),
    setShowServerDefense: (show) => set({ showServerDefense: show }),
    triggerServerDefense: () => set({ showServerDefense: true }),
    setShowSenateHearing: (show) => set({ showSenateHearing: show }),
    applyGemUserGeneration: () => get().updatePassiveUserGeneration(),

    setRegulatoryRisk: (risk: number) => set({ regulatoryRisk: Math.max(0, Math.min(100, risk)) }),
    
    setCampaignCooldown: (campaignId: string, cooldown: number) => {
      set((state) => {
        const newCooldowns = new Map(state.campaignCooldowns);
        if (cooldown <= 0) newCooldowns.delete(campaignId);
        else newCooldowns.set(campaignId, cooldown);
        return { campaignCooldowns: newCooldowns };
      });
    },
    
    updateCampaignCooldowns: () => {
      set((state) => {
        const newCooldowns = new Map();
        let changed = false;
        state.campaignCooldowns.forEach((val, key) => {
          const newVal = Math.max(0, val - 100);
          if (newVal > 0) newCooldowns.set(key, newVal);
          if (newVal !== val) changed = true;
        });
        return changed ? { campaignCooldowns: newCooldowns } : state;
      });
    },
    
    toggleCampaignPanel: () => set((state) => ({ showCampaignPanel: !state.showCampaignPanel })),
    setCurrentView: (view: 'city' | 'basement') => set({ currentView: view }),
    
    incrementDataInventory: (amount: number) => set((state) => ({ 
      dataInventory: state.dataInventory + amount,
      totalDataCollected: (state.totalDataCollected || 0) + amount
    })),

    setDataInventory: (amount: number) => set({ dataInventory: amount }),
    
    sellAllData: () => {
      const state = get();
      const value = state.dataInventory * 50 * state.advertiserData.incomeMultiplier;
      if (value <= 0) return;
      
      const newTotalDataSold = state.advertiserData.totalDataSold + state.dataInventory;
      let newMultiplier = state.advertiserData.incomeMultiplier;
      let newNextMilestone = state.advertiserData.nextMilestone;
      let newMilestonesReached = state.advertiserData.milestonesReached;
      
      while (newTotalDataSold >= newNextMilestone) {
        newMilestonesReached++;
        newMultiplier += 0.05;
        newNextMilestone = Math.floor(newNextMilestone * 1.5);
      }
      
      set({
        income: state.income + value,
        totalLifetimeIncome: state.totalLifetimeIncome + value,
        dataInventory: 0,
        advertiserData: {
          totalDataSold: newTotalDataSold,
          incomeMultiplier: newMultiplier,
          nextMilestone: newNextMilestone,
          milestonesReached: newMilestonesReached
        }
      });
    },
    
    initializeGame: () => {
      const state = get();
      if (!state.achievementManager) {
        set({ achievementManager: new AchievementManager((achievement) => get().showAchievementShowcase(achievement)) });
      }
      
      // Auto-show tutorial for new players
      const hasSeenTutorial = localStorage.getItem('metaman_tutorial_seen');
      if (!hasSeenTutorial && state.gameState === 'menu') {
        set({ showTutorial: true });
      }
      
      set({ gameState: "menu" });
    },
    
    handleManualClick: (x = 512, y = 300) => {
      const clickIncome = 1 + (get().getGemBonuses?.()?.clickPower || 0) / 10;
      get().incrementIncome(clickIncome);
      set((state) => ({ totalClicks: state.totalClicks + 1 }));
    },

    buyDepartment: (departmentId: string) => {
      const state = get();
      const department = state.departments.find(d => d.id === departmentId);
      if (!department) return false;
      const cost = get().calculateDepartmentCost(department);
      if (state.income < cost) return false;

      set((state) => ({
        income: state.income - cost,
        departments: state.departments.map(d => 
          d.id === departmentId ? { ...d, owned: d.owned + 1 } : d
        )
      }));
      
      get().updatePassiveIncome();
      get().updateTowerHeight();
      return true;
    },
    
    buyMaxDepartments: (departmentId: string) => {
      let count = 0;
      while (get().buyDepartment(departmentId)) {
        count++;
        if (count > 1000) break;
      }
      return count;
    },

    calculateDepartmentCost: (department: Department) => {
      return Math.floor(department.baseCost * Math.pow(1.15, department.owned));
    },

    calculateDepartmentIncome: (department: Department) => {
      if (department.owned === 0) return 0;
      let total = 0;
      for (let i = 0; i < department.owned; i++) {
        total += department.baseIncome * Math.pow(0.95, i);
      }
      return total;
    },
    
    updatePassiveIncome: () => {
      const state = get();
      const totalIncome = state.departments.reduce((sum, d) => sum + get().calculateDepartmentIncome(d), 0);
      set({ totalIncomePerSecond: totalIncome });
    },

    updateTowerHeight: () => {
      // Tower height is now locked to 1 per user request to avoid abrupt scaling glitches
      set({ towerHeight: 1 });
    },

    closeOfflinePopup: () => set({ showOfflinePopup: false, offlineProgress: null }),

    claimOfflineRewards: () => {
      const state = get();
      if (state.offlineProgress) {
        set({
          income: state.income + state.offlineProgress.incomeEarned,
          totalLifetimeIncome: state.totalLifetimeIncome + state.offlineProgress.incomeEarned,
          showOfflinePopup: false,
          offlineProgress: null
        });
      }
    },

    getGameStats: (): GameStats => {
      const state = get();
      const departmentsOwned: { [key: string]: number } = {};
      state.departments.forEach(dept => { departmentsOwned[dept.id] = dept.owned; });

      return {
        totalIncome: state.totalLifetimeIncome,
        totalUsers: state.users,
        totalClicks: state.totalClicks,
        totalTime: Date.now() - state.gameStartTime,
        highestIncomePerSecond: state.totalIncomePerSecond,
        departmentsOwned,
        prestigeCount: state.prestigeState.prestigeLevel,
        fastestMillionTime: state.fastestMillionTime || 0,
        totalDataCollected: state.totalDataCollected || 0,
        automationUpgradesPurchased: state.automationUpgradesPurchased || 0
      };
    },

    purchaseAutomationUpgrade: (upgradeId: string): boolean => {
      const state = get();
      const stats = state.getGameStats();
      const cost = state.automationSystem.getUpgradeCost(upgradeId);
      
      if (state.income >= cost && state.automationSystem.purchaseUpgrade(upgradeId, stats)) {
        set({
          income: state.income - cost,
          automationUpgradesPurchased: state.automationUpgradesPurchased + 1
        });
        return true;
      }
      return false;
    },

    purchaseSynergyUpgrade: (upgradeId: string): boolean => {
      const state = get();
      const stats = state.getGameStats();
      
      return state.synergySystem.purchaseUpgrade(upgradeId, stats, (amount, currency) => {
        if (currency === 'money' && state.income >= amount) {
          set({ income: state.income - amount });
          return true;
        } else if (currency === 'influence_points' && state.prestigeState.influencePoints >= amount) {
          set((state) => ({
            prestigeState: {
              ...state.prestigeState,
              influencePoints: state.prestigeState.influencePoints - amount
            }
          }));
          return true;
        }
        return false;
      });
    },

    updateGameSettings: (newSettings: any) => set((state) => ({ gameSettings: { ...state.gameSettings, ...newSettings } })),

    performHardReset: () => {
      localStorage.clear();
      get().startGame();
    },

    exportSave: () => {
      const state = get();
      return state.saveSystem.exportSave(state);
    },

    importSave: (saveString: string) => {
      const state = get();
      const saveData = state.saveSystem.importSave(saveString);
      if (saveData) {
        get().applySaveData(saveData);
        return true;
      }
      return false;
    },

    claimAchievement: (achievementId: string) => {
      const state = get();
      if (state.achievementManager) {
        // 1. Mark as unlocked in the internal achievement manager
        // We DON't call claimAchievement here anymore because that marks it as "claimed" (money granted).
        // Instead we just verify it exists and is unlocked.
        const achievement = state.achievementManager.getAchievement?.(achievementId);
        
        if (achievement && achievement.unlocked) {
          const rewardId = `achievement_${achievementId}`;
          const alreadyInRewards = state.rewardState.rewards.some(r => String(r.id) === rewardId);
          
          if (!alreadyInRewards) {
            get().addReward({
              id: rewardId,
              type: 'achievement' as const,
              title: achievement.name,
              description: achievement.description,
              value: achievement.reward,
              claimed: false, // Force manual claim in suitcase
              dateAdded: Date.now()
            });
            
            // Notification effect
            get().addVisualEffect('achievement', 512, 200, 'medium', achievement.name);
          }
          
          // Close popups
          set({ currentAchievementPopup: null, currentAchievementShowcase: null });
        }
      }
    },

    closeAchievementPopup: () => set({ currentAchievementPopup: null }),
    
    showAchievementShowcase: (achievement: SimpleAchievement) => {
      const state = get();
      
      // 1. Ensure it's in the rewards history/suitcase with a consistent ID
      const rewardId = `achievement_${achievement.id}`;
      const alreadyInRewards = state.rewardState.rewards.some(r => String(r.id) === rewardId);
      
      if (!alreadyInRewards) {
        get().addReward({
          id: rewardId, // Pass consistent ID
          type: 'achievement',
          title: achievement.name,
          description: achievement.description,
          value: achievement.reward
        });
      }

      // 2. Handle the visual popup queue
      if (state.currentAchievementShowcase) {
        set((state) => ({ achievementQueue: [...state.achievementQueue, achievement] }));
      } else {
        set({ currentAchievementShowcase: achievement });
      }
    },

    closeAchievementShowcase: () => {
      const state = get();
      const next = state.achievementQueue[0];
      if (next) {
        set({ 
          currentAchievementShowcase: next,
          achievementQueue: state.achievementQueue.slice(1)
        });
      } else {
        set({ currentAchievementShowcase: null });
      }
    },

    processAchievementQueue: () => {
      const state = get();
      if (!state.currentAchievementShowcase && state.achievementQueue.length > 0) {
        get().closeAchievementShowcase();
      }
    },

    addVisualEffect: (type: 'money' | 'users' | 'purchase' | 'achievement', x = 512, y = 384, intensity: 'low' | 'medium' | 'high' | 'extreme' = 'medium', value?: string | number) => {
      const newEffect = {
        id: Date.now() + Math.random(),
        type, x, y,
        duration: (intensity === 'extreme' ? 1500 : (intensity === 'high' ? 700 : 600)),
        intensity,
        value
      };
      set((state) => ({ visualEffects: [...state.visualEffects, newEffect] }));
    },

    removeVisualEffect: (id: number) => set((state) => ({ visualEffects: state.visualEffects.filter(e => e.id !== id) })),
    clearAllVisualEffects: () => set({ visualEffects: [] }),

    toggleTrophyPanel: () => set((state) => ({ showTrophyPanel: !state.showTrophyPanel })),
    setShowTutorial: (show: boolean) => set({ showTutorial: show }),

    purchaseCampaign: (campaignId: string, cost: number, color: string) => {
      const state = get();
      if (state.income < cost) return false;
      set((prevState) => ({
        income: prevState.income - cost,
        sessionMoneyEarned: (prevState.sessionMoneyEarned || 0) - cost,
        totalCampaignsUsed: (prevState.totalCampaignsUsed || 0) + 1,
        lastCampaignUsed: {
          id: campaignId,
          cost,
          color,
          timestamp: Date.now()
        }
      }));
      return true;
    },

    forceRestoreAllButtons: () => {
      set((prevState) => ({ 
        currentAchievementPopup: null,
        showCampaignPanel: false,
        showDepartments: false,
        showProgression: false,
        lawsuitState: { ...prevState.lawsuitState, showLawsuitPanel: false },
        showTrophyPanel: false,
        showOfflinePopup: false
      }));
      get().clearAllVisualEffects();
    },

    addInfluencePoints: (amount: number) => {
      set((state) => ({ 
        influencePoints: state.influencePoints + amount,
        totalInfluenceEarned: state.totalInfluenceEarned + amount
      }));
    },



    spendInfluencePoints: (amount: number, purpose: string): boolean => {
      const state = get();
      if (state.prestigeState.influencePoints >= amount) {
        set((state) => ({
          prestigeState: {
            ...state.prestigeState,
            influencePoints: state.prestigeState.influencePoints - amount
          }
        }));
        return true;
      }
      return false;
    },

    setIncome: (amount: number) => set({ income: amount }),
    decrementIncome: (amount: number) => set((state) => ({ income: Math.max(0, state.income - amount) })),

    updatePassiveUserGeneration: () => {
      const state = get();
      const now = Date.now();
      const diff = now - (state.lastPassiveUserUpdate || now); 
      if (diff <= 0) return;

      const totalBaseUserGen = state.departments.reduce((sum, dept) => {
        return sum + (dept.owned * (dept.baseUserGeneration || 0));
      }, 0);
      
      const gemBonuses = get().getGemBonuses();
      const boostedUsersGenerated = totalBaseUserGen * (diff / 1000) * (1 + (gemBonuses.userGeneration / 100));
      
      if (boostedUsersGenerated > 0) {
        get().incrementUsers(boostedUsersGenerated);
      }
      
      set((state) => ({ 
        lastPassiveUserUpdate: now,
      }));
      get().checkMegaMilestones();
      get().checkGrandUserMilestones();
      get().checkLawsuitMilestones();
      get().checkAchievements();
    },

    addGemToInventory: (gem: any) => set((state) => ({ sinisterLab: { ...state.sinisterLab, inventory: [...state.sinisterLab.inventory, gem] } })),
    addGemToSlot: (gem: any, idx: number) => {
      set((state) => {
        const slots = [...state.sinisterLab.slots];
        const old = slots[idx];
        const inv = state.sinisterLab.inventory.filter(g => g.id !== gem.id);
        if (old) inv.push(old);
        slots[idx] = gem;
        return { sinisterLab: { ...state.sinisterLab, slots, inventory: inv } };
      });
    },
    removeGemFromSlot: (idx: number) => {
      set((state) => {
        const gem = state.sinisterLab.slots[idx];
        if (!gem) return state;
        const slots = [...state.sinisterLab.slots];
        slots[idx] = null;
        return { sinisterLab: { ...state.sinisterLab, slots, inventory: [...state.sinisterLab.inventory, gem] } };
      });
    },
    addDiscoveredGem: (gem: any) => set((state) => ({ sinisterLab: { ...state.sinisterLab, discoveredItems: [...state.sinisterLab.discoveredItems, gem] } })),
    incrementOrbBreakCount: () => set((state) => ({ sinisterLab: { ...state.sinisterLab, orbBreakCount: state.sinisterLab.orbBreakCount + 1 } })),

    getGemBonuses: () => {
      const state = get();
      const equipped = state.sinisterLab.slots.filter(s => s !== null);
      const bonuses = { userGeneration: 0, clickPower: 0, orbCollection: 0, departmentEfficiency: 0, influenceGeneration: 0 };
      equipped.forEach(gem => {
        if (!gem) return;
        switch (gem.type) {
          case 'speed': bonuses.userGeneration += gem.modifier; break;
          case 'power': bonuses.clickPower += gem.modifier; break;
          case 'collection': bonuses.orbCollection += gem.modifier; break;
          case 'efficiency': bonuses.departmentEfficiency += gem.modifier; break;
          case 'influence': bonuses.influenceGeneration += gem.modifier; break;
        }
      });
      return bonuses;
    },

    checkDanVisitTrigger: () => {
      const state = get();
      if (state.users >= (state.blackMarketState?.nextUserThreshold || 1000) && !state.blackMarketState?.isOpen) {
        get().triggerDanVisit();
      }
      if (state.users >= 1000 && !state.blackMarketState?.isUnlocked) {
        set((state) => ({
          blackMarketState: { ...state.blackMarketState, isUnlocked: true },
          friends: state.friends.map(f => f.id === 'dopamine_dealer_dan' ? { ...f, unlocked: true } : f)
        }));
      }
    },

    triggerDanVisit: () => {
      set((state) => ({
        blackMarketState: {
          ...state.blackMarketState,
          isOpen: true,
          danVisible: true,
          timeRemaining: 300000,
          lastOpenTime: Date.now(),
          nextUserThreshold: (state.blackMarketState?.nextUserThreshold || 1000) * 2
        }
      }));
      get().updateBlackMarketTimer();
    },

    updateBlackMarketTimer: () => {
      const state = get();
      if (!state.blackMarketState?.isOpen) return;
      const remains = Math.max(0, 300000 - (Date.now() - state.blackMarketState.lastOpenTime));
      if (remains <= 0) {
        get().closeBlackMarket();
      } else {
        set((state) => ({ blackMarketState: { ...state.blackMarketState, timeRemaining: remains } }));
        setTimeout(() => get().updateBlackMarketTimer(), 1000);
      }
    },

    closeBlackMarket: () => set((state) => ({ blackMarketState: { ...state.blackMarketState, isOpen: false, danVisible: false } })),

    purchaseBlackMarketItem: (itemId: string, cost: number, currency: 'money' | 'orbs') => {
      const state = get();
      const canAfford = currency === 'money' ? state.income >= cost : (state.orbsInventory || 0) >= cost;
      if (!canAfford) return false;

      if (currency === 'money') set({ income: state.income - cost });
      else set({ orbsInventory: (state.orbsInventory || 0) - cost });

      set((state) => ({
        blackMarketState: {
          ...state.blackMarketState,
          purchases: [...state.blackMarketState.purchases, itemId],
          regulatoryHeat: (state.blackMarketState.regulatoryHeat || 0) + 5
        }
      }));

      // Apply effects
      switch (itemId) {
        case 'notification_overdose':
          const oldIncomePerSecond = state.totalIncomePerSecond;
          set({ totalIncomePerSecond: oldIncomePerSecond * 5 });
          setTimeout(() => set({ totalIncomePerSecond: oldIncomePerSecond }), 60000);
          break;
        case 'scroll_addiction_serum':
          set((state) => ({ passiveUserGeneration: (state.passiveUserGeneration || 0) + 2 }));
          break;
      }
      return true;
    },

    checkGrandUserMilestones: () => {
      const state = get();
      if (state.users >= 10000000 && !state.grandMilestones?.guardian_10m) {
        set((state) => ({ grandMilestones: { ...state.grandMilestones, guardian_10m: true } }));
        get().addReward({ id: 'milestone_guardian_10m', type: 'milestone', title: 'Guardian Lvl 1', description: '10M Users!', value: 500000 });
      }
    },

    triggerSpeechBubble: () => {
      const msgs = ["Welcome!", "Keep scrolling!", "Data is gold!", "Join the party!"];
      set((state) => ({ 
        speechBubbleState: { 
          ...state.speechBubbleState, 
          isVisible: true, 
          message: msgs[Math.floor(Math.random()*msgs.length)], 
          lastTriggerTime: Date.now() 
        } 
      }));
      setTimeout(() => set((state) => ({ speechBubbleState: { ...state.speechBubbleState, isVisible: false } })), 3000);
    },

    checkSpeechBubbleTrigger: () => {
      const state = get();
      if (Date.now() - state.speechBubbleState.lastTriggerTime < 15000) return;
      if (state.users >= 100 && Math.random() < 0.1) get().triggerSpeechBubble();
    },

    incrementOrbsInventory: (amount: number) => {
      const state = get();
      const reg = Math.floor(amount / 2);
      set({ 
        orbsInventory: (state.orbsInventory || 0) + amount,
        totalOrbsCollected: (state.totalOrbsCollected || 0) + amount,
        campaignCharges: Math.min(5, (state.campaignCharges || 0) + reg)
      });
    },
    
    addReward: (reward: any) => {
      set((state) => {
        // Pre-generate ID if not provided, ensuring consistency
        const id = reward.id || `reward_${Date.now()}_${Math.random()}`;
        
        // Prevent adding duplicate reward IDs
        if (state.rewardState.rewards.some(r => String(r.id) === String(id))) {
          return state;
        }

        return {
          rewardState: {
            ...state.rewardState,
            rewards: [
              ...state.rewardState.rewards, 
              { 
                ...reward, 
                id, 
                claimed: !!reward.claimed, 
                dateAdded: reward.dateAdded || Date.now() 
              }
            ],
            hasNewRewards: !reward.claimed || state.rewardState.hasNewRewards
          }
        };
      });
    }
  };
})
);
