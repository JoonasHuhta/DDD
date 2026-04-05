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
import { getStage } from "../utils/stageSystem";
import { ELITES } from "../gameEngine/EliteRegistry";
import { DialogueNode } from "../gameEngine/CharacterLogic";
import { LAWYERS, Lawyer } from "../../data/lawyers";
import { ALL_RESEARCH_NODES } from "../progression/researchData";

export type MetamanGameState = "menu" | "playing" | "paused";

export interface ActiveBuff {
  id: string; // e.g. "notification_overdose" or "fomo_amplification"
  type: 'income' | 'click' | 'passive_users';
  multiplier: number;
  expiresAt: number | null; // ms timestamp or null for permanent
}

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
  lastRandomLawsuit: number;
  lastRewardTimestamp: number;
  dataInventory: number;
  orbsInventory: number;
  permanentOrbs: number;
  dopaCoin: number;
  stockPrice: number;
  isPubliclyTraded: boolean;
  dopaCoinUnlocked: boolean;
  activeBuffs: ActiveBuff[];
  
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
  totalPlayTime: number; // in milliseconds
  setPlayTime: (time: number) => void;
  
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
  
  // LEGAL DIVISION SYSTEM
  hiredLawyers: string[];
  activeLawyerSlots: (string | null)[];
  
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
  darkWebPurchases: string[];
  
  // NOTE: showDepartments, showProgression, showAutomation, showStatistics,
  // showSynergies, showOptions, showSinisterLab are managed as local useState
  // in GameUI.tsx via usePanelState hook — not duplicated in the store.
  showTutorial: boolean;
  
  characters: {
    walsh: { suspicion: number; flags: string[] };
    whistleblower: { active: boolean; ignoredCount: number };
    rival: { users: number; growthRate: number };
  };
  
  // ELITE SYSTEM
  collectedElites: string[];
  collectElite: (eliteId: string) => void;
  metamanEngine: any;
  setMetamanEngine: (engine: any) => void;
  
  // CHARACTER DIALOGUE SYSTEM
  showCharacterDialogue: boolean;
  activeCharacter: string | null;           // ID for static nodes (CharacterLogic)
  activeDialogueNode: DialogueNode | null;  // Direct node for dynamic/elite dialogue
  setCharacterDialogue: (charIdOrNode: string | DialogueNode | null) => void;
  updateCharacterState: (charName: 'walsh' | 'whistleblower' | 'rival', updates: any) => void;
  
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
    isCrisisActive: boolean;
    isCrisisWarning: boolean;
    activeLawsuitId?: string;
    fightSuccessChance?: number;
    settleCost?: number;
    fightCost?: number;
    larryBribeCount: number;
    ignoredCount: number;
    isClassAction: boolean;
    lastTacticUsed?: 'shredder' | 'mixup' | 'bankruptcy' | 'settle' | 'fight' | 'bribe';
    tacticCooldowns: {
      shredder: number;
      mixup: number;
      bankruptcy: number;
    };
    larryDistance: number; // 0 to 100 (100 is delivered)
    larryDialogue: string;
    bribeTotal: number;
    ignoreTotal: number;
    activeLawyerFlags: {
      witnessCoaching: boolean;
      counterSueActive: boolean;
    };
    lawsuitHistory: Array<{
      id: string;
      plaintiff: string;
      outcome: 'settled' | 'won' | 'lost' | 'evaded';
      amount: number;
      timestamp: number;
    }>;
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
  currentAchievementShowcase: SimpleAchievement | null;
  isGameOver: boolean;
  peakUsers: number;
  lastUserLossTime: number;
  lastStageReached: number;
  lastStageCompleteTimestamp: number;
  showOfflinePopup: boolean;
  offlineProgress: any;
  automationUpgradesPurchased: number;
  visualEffects: Array<{
    id: number;
    type: 'money' | 'users' | 'purchase' | 'achievement' | 'crisis';
    x: number;
    y: number;
    duration: number;
    intensity: 'low' | 'medium' | 'high' | 'extreme';
    color?: string;
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
  checkGameOver: () => void;
  resetGame: () => void;
  triggerCrisisSpeech: (message: string) => void;
  hideSpeechBubble: () => void;
  getTotalUserMultiplier: () => number;
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
  getMarginalIncome: (departmentId: string, amount?: number) => number;

  addBuff: (buff: ActiveBuff) => void;
  removeBuff: (buffId: string) => void;

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
  settleLawsuit: () => Promise<void>;
  fightLawsuit: (cardType?: 'technical' | 'expert' | 'media') => Promise<void>;
  bribeLarry: () => Promise<boolean>;
  evadeLawsuit: (tactic: 'shredder' | 'mixup' | 'bankruptcy') => Promise<void>;
  silenceLawsuit: () => Promise<void>;
  ignoreLawsuit: () => Promise<void>;
  acknowledgeLawsuit: () => void;
  dismissLawsuit: () => void;
  updateLarryDistance: (distance: number) => void;
  checkLawsuitMilestones: () => void;
  buyDarkWebItem: (item: any) => void;
  updateStockPrice: () => void;

  // Removed: claimAchievement and closeAchievementPopup are gone
  showAchievementShowcase: (achievement: SimpleAchievement) => void;
  closeAchievementShowcase: () => void;
  addVisualEffect: (type: 'money' | 'users' | 'purchase' | 'achievement' | 'crisis', x?: number, y?: number, intensity?: 'low' | 'medium' | 'high' | 'extreme', value?: string | number, color?: string) => void;
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
    heatDamping: number;
    stageIncomeBonus: number;
    dataPriceBoost: number;
    autoClicker: boolean;
    userMultiplier: number;
    incomeMultiplier: number;
  };
  applyGemUserGeneration: () => void;
  updateMarketPrices: () => void;
  
  // Legal Actions
  buyLawyer: (lawyerId: string) => boolean;
  equipLawyer: (lawyerId: string, slotIndex: number) => void;
  getLegalBonuses: () => {
    heatDecay: number;
    clickHeat: number;
    dataHeat: number;
    lawsuitDefense: number;
    globalGeneration: number;
  };

  // Data Market actions & state
  showDataMarket: boolean;
  setShowDataMarket: (show: boolean) => void;
  addDataToMarketInventory: (type: 'behavioral' | 'location' | 'financial' | 'biometric', amount: number) => void;
  sellData: (type: 'behavioral' | 'location' | 'financial' | 'biometric', amount: number, multiplier: number, heatIncrease: number) => void;

  // Minigame State
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
  getMaxCampaignCharges: () => number;
  achievementQueue: SimpleAchievement[];
  processAchievementQueue: () => void;

  // ── RESEARCH LAB SYSTEM ────────────────────────────────────────────────────
  researchState: {
    activeResearch: string | null;
    progressPercent: number; // 0 to 1
    timeRemainingMs: number;
    queue: string[]; // max 2
    completed: string[];
    unlocked: string[];
    boostEffect: { type: string; description: string; timestamp: number } | null;
    isLeakActive: boolean;
    leakTarget: string | null;
    leakTimerMs: number;
  };
  startResearch: (id: string) => boolean;
  queueResearch: (id: string) => boolean;
  cancelResearch: () => void;
  boostResearch: () => void;
  tickResearch: (deltaMs: number) => void;
  triggerResearchLeak: () => void;
  resolveResearchLeak: (success: boolean) => void;
  completeResearch: (id: string) => void;

  // ── HEAT SYSTEM ────────────────────────────────────────────────────────────
  heat: number; // 0–100
  heatLevel: 'normal' | 'elevated' | 'critical' | 'emergency'; // derived
  modifyHeat: (delta: number, source?: 'click' | 'data' | 'passive') => void;   // +/- heat, clamped 0–100
  updateHeat: () => void;               // called every tick, applies passive decay (-2/s)

  // ── DIALOGUE HISTORY ───────────────────────────────────────────────────────
  // Persists across prestige. Written by boss encounters, read by Platform Collapse.
  dialogHistory: {
    karen: { outcome: 'won' | 'lost' | null };
    marcus: { choice: 'bribe' | 'threaten' | 'discredit' | null; outcome: 'won' | 'lost' | null };
    patricia: { senateScore: number; outcome: 'won' | 'lost' | null };
    coalition: { outcome: 'won' | 'lost' | null };
    faceSpace: { defeated: boolean; acquireCount: number };
    dataVault: { defeated: boolean };
    viralVoid: { defeated: boolean };
    connectCore: { defeated: boolean; grandmotherDefeated: boolean; networkRaceWon: boolean };
  };
  updateDialogHistory: (updates: Partial<MetamanGameStore['dialogHistory']>) => void;

  // ── GLOBAL DOMINANCE SYSTEM (Phase 2) ──────────────────────────────────────
  globalDominance: {
    isUnlocked: boolean;
    countries: Record<string, {
      stage: number;      // 0 to 5 (MAX)
      progress: number;   // 0 to 100 for next stage
      isUnlocked: boolean;
      buildings: Record<string, number>; // buildingId -> level
    }>;
  };
  advanceCountryStage: (countryId: string) => void;
  buyBuilding: (countryId: string, buildingId: string) => void;
  unlockCountry: (countryId: string) => void;
  checkGlobalDominanceUnlocks: () => void;
  getTotalHeatGrowthMultiplier: () => number;
}


export const BUILDINGS_CONFIG: Record<string, { name: string; baseCost: number; orbCost?: number; unlockStage?: number; output: any }> = {
  data_center: { name: 'Data Center', baseCost: 5000, orbCost: 50, unlockStage: 2, output: { orbs: 10 } },
  ai_factory: { name: 'AI Factory', baseCost: 10000, unlockStage: 2, output: { users: 100 } },
  ethics_theater: { name: 'Ethics Theater', baseCost: 25000, unlockStage: 3, output: { heatGrowthReduction: 0.1 } },
  free_tools: { name: 'Free Tools Division', baseCost: 2500, unlockStage: 1, output: { unlockAdjacent: true } },
  lobby_office: { name: 'Lobby Office', baseCost: 50000, unlockStage: 3, output: { heatFlat: 0.5 } },
  gdpr_laundry: { name: 'GDPR Laundry', baseCost: 75000, orbCost: 100, unlockStage: 3, output: { lawsuitImmunity: 0.05 } },
  sauna_algorithm: { name: 'Sauna Algorithm', baseCost: 15000, unlockStage: 3, output: { localUserBoost: 0.25 } },
  mutual_arrangement: { name: 'Mutual Arrangement', baseCost: 100000, orbCost: 250, unlockStage: 3, output: { chinaDataBoost: 2.0, heatGrowthRisk: 0.3 } },
  amazon_hub: { name: 'Amazon Hub', baseCost: 150000, orbCost: 500, unlockStage: 3, output: { globalIncomeBoost: 0.15 } },
  orbital_relay: { name: 'Orbital Relay', baseCost: 1000000, orbCost: 5000, unlockStage: 1, output: { globalOutputBoost: 0.2 } },
  void_node: { name: 'Void Node', baseCost: 5000000, orbCost: 10000, unlockStage: 1, output: { massiveUsers: 1000 } }
};

export const NEIGHBOR_MAP: Record<string, string[]> = {
  us: ['gb', 'cn'],
  eu: ['fi', 'ru'],
  gb: ['in', 'ng'],
  fi: ['id', 'sa'],
  cn: ['jp', 'gs'],
  br: ['gs', 'id'],
  ru: ['cn', 'in'],
  in: ['id', 'sa'],
  id: ['ng', 'gs'],
  ng: ['sa', 'gs'],
  sa: ['jp'],
  jp: ['gs'],
  gs: []
};

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
      metamanEngine: null,
      setMetamanEngine: (engine: any) => set({ metamanEngine: engine }),
      collectedElites: [],
      showCharacterDialogue: false,
      activeCharacter: null,
      activeDialogueNode: null,
      gameState: "menu",
      income: 0, 
      users: 0,
      selectedCampaign: "social_feed",
      regulatoryRisk: 0,
      campaignCooldowns: new Map(),
      showCampaignPanel: false,
      lastRandomLawsuit: 0,
      lastRewardTimestamp: 0,
      currentView: 'city',
      isGameOver: false,
      peakUsers: 0,
      lastUserLossTime: 0,
      lastStageReached: 1,
      lastStageCompleteTimestamp: 0,
      dataInventory: 0,
      orbsInventory: 0,
      permanentOrbs: 0,
      dopaCoin: 0,
      stockPrice: 10.0,
      isPubliclyTraded: false,
      dopaCoinUnlocked: false,

      // GLOBAL DOMINANCE INITIAL STATE
      globalDominance: {
        isUnlocked: false,
        countries: {
          us: { stage: 0, progress: 0, isUnlocked: true, buildings: {} },
          eu: { stage: 0, progress: 0, isUnlocked: true, buildings: {} },
          gb: { stage: 0, progress: 0, isUnlocked: false, buildings: {} },
          fi: { stage: 0, progress: 0, isUnlocked: false, buildings: {} },
          cn: { stage: 0, progress: 0, isUnlocked: false, buildings: {} },
          br: { stage: 0, progress: 0, isUnlocked: false, buildings: {} },
          in: { stage: 0, progress: 0, isUnlocked: false, buildings: {} },
          ru: { stage: 0, progress: 0, isUnlocked: false, buildings: {} },
          id: { stage: 0, progress: 0, isUnlocked: false, buildings: {} },
          ng: { stage: 0, progress: 0, isUnlocked: false, buildings: {} },
          sa: { stage: 0, progress: 0, isUnlocked: false, buildings: {} },
          jp: { stage: 0, progress: 0, isUnlocked: false, buildings: {} },
          gs: { stage: 0, progress: 0, isUnlocked: false, buildings: {} },
          lun: { stage: 0, progress: 0, isUnlocked: false, buildings: {} },
          sec: { stage: 0, progress: 0, isUnlocked: false, buildings: {} },
        }
      },
      
      // RESEARCH LAB SYSTEM
      researchState: {
        activeResearch: null,
        progressPercent: 0,
        timeRemainingMs: 0,
        queue: [],
        completed: [],
        unlocked: ['engagement_metrics'], // First one unlocked by default
        boostEffect: null,
        isLeakActive: false,
        leakTarget: null,
        leakTimerMs: 0,
      },

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
      totalPlayTime: 0,
      
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
      activeBuffs: [],
      addBuff: (buff: ActiveBuff) => set((state) => ({
        activeBuffs: [...state.activeBuffs.filter(b => b.id !== buff.id), buff]
      })),
      removeBuff: (buffId: string) => set((state) => ({
        activeBuffs: state.activeBuffs.filter(b => b.id !== buffId)
      })),
      getMaxCampaignCharges: () => {
        const state = get();
        let max = 5;
        if (state.mansionPurchases.includes('lure_charger')) max += 2;
        return max;
      },

    // ── HEAT SYSTEM ────────────────────────────────────────────────────────────
    heat: 0,
    heatLevel: 'normal' as const,

    modifyHeat: (delta: number, source?: 'click' | 'data' | 'passive') => {
      set((state) => {
        const legalBonuses = get().getLegalBonuses();
        let finalDelta = delta;

        // Apply Ethics Theater growth reduction if heat is increasing
        if (finalDelta > 0) {
          let multiplier = get().getTotalHeatGrowthMultiplier();
          
          // Apply China Risk (Mutual Arrangement HQ)
          if (state.globalDominance.countries.cn.buildings.mutual_arrangement) {
            multiplier += (state.globalDominance.countries.cn.buildings.mutual_arrangement * 0.3);
          }
          
          finalDelta *= multiplier;
        }

        // Lobbying Network: -10% heat generating from any source
        if (finalDelta > 0 && state.researchState.completed.includes('lobbying_network')) {
          finalDelta *= 0.9;
        }

        // Apply Global Ghost bonus (e.g. -30% heat generation)
        if (finalDelta > 0 && legalBonuses.globalGeneration > 0) {
           finalDelta *= (1 - legalBonuses.globalGeneration);
        }

        // Apply specific source bonuses
        if (finalDelta > 0) {
          if (source === 'click' && legalBonuses.clickHeat > 0) {
             finalDelta *= (1 - legalBonuses.clickHeat);
          } else if (source === 'data' && legalBonuses.dataHeat > 0) {
             finalDelta *= (1 - legalBonuses.dataHeat);
          }
        }

        const newHeat = Math.max(0, Math.min(100, state.heat + finalDelta));
        let level: MetamanGameStore['heatLevel'] = 'normal';
        if (newHeat >= 75) level = 'emergency';
        else if (newHeat >= 50) level = 'critical';
        else if (newHeat >= 25) level = 'elevated';
        
        // HYSTERESIS: Enter crisis at 90, exit only at 60
        const isCrisisActive = state.lawsuitState.isCrisisActive 
          ? newHeat > 60 
          : newHeat >= 90;

        const isCrisisWarning = newHeat >= 75 && !isCrisisActive;

        if (newHeat === state.heat && level === state.heatLevel && isCrisisActive === state.lawsuitState.isCrisisActive && isCrisisWarning === state.lawsuitState.isCrisisWarning) {
          return state;
        }

        return { 
          heat: newHeat, 
          heatLevel: level,
          regulatoryRisk: newHeat, 
          blackMarketState: {
            ...state.blackMarketState,
            regulatoryHeat: newHeat
          },
          lawsuitState: {
            ...state.lawsuitState,
            isCrisisActive,
            isCrisisWarning
          }
        };
      });
    },

    updateHeat: () => {
      const state = get();
      if (state.heat <= 0) return;
      
      const legalBonuses = get().getLegalBonuses();
      // Passive decay: -2 per second base. Called every tick (100ms), so -0.2 base per call.
      // Legal bonus adds to this.
      const decayAmount = 0.2 + (legalBonuses.heatDecay / 10); 
      
      const newHeat = Math.max(0, state.heat - decayAmount);
      
      // Stage gating for level calculation
      const stage = getStage(state.users);
      
      // Platform Collapse Detection: 100% Heat + Stage 10
      if (state.heat >= 100 && stage >= 10 && !state.grandMilestones?.platform_conqueror) {
        // Trigger endgame state
        setTimeout(() => {
          get().addReward({
            id: 'platform_collapse_trigger',
            type: 'special',
            title: 'PLATFORM COLLAPSE',
            description: 'The algorithm has consumed its creator.',
            value: 0
          });
          set((s) => ({
            users: Math.floor(s.users * 0.1), // 90% user loss
            heat: 100, // Stay pinned at max heat
            grandMilestones: { ...s.grandMilestones, platform_conqueror: true }
          }));
        }, 0);
      }

      let level: MetamanGameStore['heatLevel'] = 'normal';
      if (newHeat >= 75) level = 'emergency';
      else if (newHeat >= 50) level = 'critical';
      else if (newHeat >= 25) level = 'elevated';
      
      // HYSTERESIS: Enter crisis at 90, exit only at 60
      const isCrisisActive = state.lawsuitState.isCrisisActive 
        ? newHeat > 60 
        : newHeat >= 90;

      const isCrisisWarning = newHeat >= 75 && !isCrisisActive;

      set((state) => ({ 
        heat: newHeat, 
        heatLevel: level,
        regulatoryRisk: newHeat, // Sync
        blackMarketState: {
          ...state.blackMarketState,
          regulatoryHeat: newHeat // Sync
        },
        lawsuitState: {
          ...state.lawsuitState,
          isCrisisActive,
          isCrisisWarning
        }
      }));
    },

    // ── DIALOGUE HISTORY ────────────────────────────────────────────────────────
    dialogHistory: {
      karen:     { outcome: null },
      marcus:    { choice: null, outcome: null },
      patricia:  { senateScore: 0, outcome: null },
      coalition: { outcome: null },
      faceSpace: { defeated: false, acquireCount: 0 },
      dataVault: { defeated: false },
      viralVoid: { defeated: false },
      connectCore: { defeated: false, grandmotherDefeated: false, networkRaceWon: false },
    },

    updateDialogHistory: (updates) => set((state) => ({
      dialogHistory: { ...state.dialogHistory, ...updates }
    })),

    // ── GLOBAL DOMINANCE ACTIONS ─────────────────────────────────────────────
    advanceCountryStage: (countryId: string) => {
      const state = get();
      const country = state.globalDominance.countries[countryId];
      if (!country || country.stage >= 5) return;
      
      const cost = Math.pow(10, country.stage + 3);
      if (state.income < cost) return;

      // Audio Trigger
      try {
        const { useAudio } = require("./useAudio");
        useAudio.getState().playUpgrade();
      } catch (e) {}

      const newCountries = { ...state.globalDominance.countries };
      newCountries[countryId] = {
        ...country,
        stage: country.stage + 1
      };

      set({
        income: state.income - cost,
        globalDominance: {
          ...state.globalDominance,
          countries: newCountries
        }
      });

      get().addVisualEffect('purchase', window.innerWidth / 2, window.innerHeight / 2, 'medium', `STAGE ${country.stage + 1} REACHED`);
    },

    buyBuilding: (countryId: string, buildingId: string) => {
      const state = get();
      const country = state.globalDominance.countries[countryId];
      if (!country) return;

      const currentLevel = country.buildings[buildingId] || 0;
      if (currentLevel >= 5) return;

      const config = BUILDINGS_CONFIG[buildingId];
      if (!config || (country.stage < (config.unlockStage || 0))) return;

      const cost = Math.floor(config.baseCost * Math.pow(1.5, currentLevel));
      const orbCost = config.orbCost ? Math.floor(config.orbCost * Math.pow(1.5, currentLevel)) : 0;

      if (state.income < cost || state.orbsInventory < orbCost) return;

      // Audio Trigger
      try {
        const { useAudio } = require("./useAudio");
        useAudio.getState().playUpgrade();
      } catch (e) {}

      const nextCountries = { ...state.globalDominance.countries };
      nextCountries[countryId] = {
        ...country,
        buildings: {
          ...country.buildings,
          [buildingId]: currentLevel + 1
        }
      };

      set({
        income: state.income - cost,
        orbsInventory: state.orbsInventory - orbCost,
        globalDominance: {
          ...state.globalDominance,
          countries: nextCountries
        }
      });
    },

    unlockCountry: (countryId: string) => set((state) => {
      if (!state.globalDominance.countries[countryId]) return state;
      return {
        globalDominance: {
          ...state.globalDominance,
          countries: {
            ...state.globalDominance.countries,
            [countryId]: { ...state.globalDominance.countries[countryId], isUnlocked: true }
          }
        }
      };
    }),

    getTotalHeatGrowthMultiplier: () => {
      const state = get();
      let totalReduction = 0;
      Object.values(state.globalDominance.countries).forEach(c => {
        const theaterLevel = c.buildings['ethics_theater'] || 0;
        totalReduction += theaterLevel * 0.1;
      });
      return Math.max(0.5, 1 - totalReduction);
    },

    checkGlobalDominanceUnlocks: () => set((state) => {
      const g = state.globalDominance;
      const c = g.countries;
      let changed = false;
      const nextCountries = { ...c };

      // 1. System Unlock
      if (!g.isUnlocked && state.users >= 1000) {
        g.isUnlocked = true;
        changed = true;
      }

      // 2. UK: USA Stage 2
      if (!c.gb.isUnlocked && c.us.stage >= 2) {
        nextCountries.gb.isUnlocked = true;
        changed = true;
      }

      // 3. Finland: EU Stage 2
      if (!c.fi.isUnlocked && c.eu.stage >= 2) {
        nextCountries.fi.isUnlocked = true;
        changed = true;
      }

      // 4. China: 10k users
      if (!c.cn.isUnlocked && state.users >= 10000) {
        nextCountries.cn.isUnlocked = true;
        changed = true;
      }

      // 5. Brazil: 25k users
      if (!c.br.isUnlocked && state.users >= 25000) {
        nextCountries.br.isUnlocked = true;
        changed = true;
      }

      // 6. Russia: Any country Stage 3
      if (!c.ru.isUnlocked && Object.values(c).some(country => country.stage >= 3)) {
        nextCountries.ru.isUnlocked = true;
        changed = true;
      }

      // 7. Global South: Brazil Stage 2
      if (!c.gs.isUnlocked && c.br.stage >= 2) {
        nextCountries.gs.isUnlocked = true;
        changed = true;
      }

      // 8. India/Asia Cluster: user milestones
      if (!c.in.isUnlocked && state.users >= 50000) { nextCountries.in.isUnlocked = true; changed = true; }
      if (!c.id.isUnlocked && state.users >= 100000) { nextCountries.id.isUnlocked = true; changed = true; }
      if (!c.jp.isUnlocked && state.users >= 250000) { nextCountries.jp.isUnlocked = true; changed = true; }

      // 9. Special End-Game Locations
      // Lunar Base: Prestige Level 3
      if (!c.lun.isUnlocked && state.prestigeState.prestigeLevel >= 3) {
        nextCountries.lun.isUnlocked = true;
        changed = true;
      }

      // Sector 7: Alien Chapter (Grandmother Defeated)
      if (!c.sec.isUnlocked && state.dialogHistory.connectCore.grandmotherDefeated) {
        nextCountries.sec.isUnlocked = true;
        changed = true;
      }

      if (!changed) return state;

      return {
        globalDominance: {
          ...g,
          countries: nextCountries
        }
      };
    }),

    // UI Panel states — showDepartments/Progression/etc. are in usePanelState hook
    showTrophyPanel: false,
    darkWebPurchases: [],
    showTutorial: false,
    showOfflinePopup: false,
    achievementQueue: [],
    
    // Systems
    sinisterLab: {
      slots: [null, null, null, null],
      inventory: [],
      discoveredItems: [],
      orbBreakCount: 0
    },
    hiredLawyers: [],
    activeLawyerSlots: [null, null, null],
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
      initialDelayPassed: false,
      isCrisisActive: false,
      isCrisisWarning: false,
      larryBribeCount: 0,
      ignoredCount: 0,
      isClassAction: false,
      larryDistance: 0,
      larryDialogue: "I'm on my way, Dan.",
      bribeTotal: 0,
      ignoreTotal: 0,
      activeLawyerFlags: {
        witnessCoaching: false,
        counterSueActive: false,
      },
      tacticCooldowns: {
        shredder: 0,
        mixup: 0,
        bankruptcy: 0
      },
      lawsuitHistory: []
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
            lastRewardTimestamp: Date.now(),
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
        sessionUsersGained: 0,
        activeBuffs: []
      });
    },

    pauseGame: () => set({ gameState: "paused" }),
    resumeGame: () => set({ gameState: "playing" }),

    updateStats: (statType, amount) => {
      set((state: any) => {
        let key = '';
        switch(statType) {
          case 'clicks': key = 'sessionClicks'; break;
          case 'money': key = 'sessionMoney'; break;
          case 'users': key = 'sessionUsersLured'; break;
          case 'orbsCollected': key = 'sessionOrbsHarvested'; break;
          case 'campaignsUsed': key = 'sessionCampaignsUsed'; break;
          case 'dataSold': key = 'sessionDataSold'; break;
          default: {
            const sType = statType as any;
            key = `session${sType.charAt(0).toUpperCase() + sType.slice(1)}`;
          }
        }
        const updates: any = { [key]: (state[key] || 0) + amount };
        if (statType === 'clicks') {
          updates.totalClicks = (state.totalClicks || 0) + amount;
        }
        return updates;
      });
    },
    
    resetSessionStats: () => set({
      sessionClicks: 0, 
      sessionMoney: 0, 
      sessionUsersLured: 0, 
      sessionOrbsHarvested: 0, 
      sessionDataSold: 0, 
      sessionCampaignsUsed: 0,
      sessionUsersGained: 0 // Added missing
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
      const state = get();
      const legalBonuses = state.getLegalBonuses();
      
      // Integrate GDPR Laundry Immunity (from EU)
      let buildingImmunity = 0;
      Object.values(state.globalDominance.countries).forEach(c => {
        if (c.buildings.gdpr_laundry) {
          buildingImmunity += c.buildings.gdpr_laundry * 0.05;
        }
      });
      
      // LAWYER IMMUNITY CHECK (Ironclad Irene + GDPR Laundry)
      const totalDefense = legalBonuses.lawsuitDefense + buildingImmunity;
      if (totalDefense > 0 && Math.random() < totalDefense) {
        console.log("🛡️ LEGAL DEFENSE: Lawsuit blocked by legal wall (including GDPR Laundry)!");
        get().addVisualEffect('achievement', window.innerWidth / 2, window.innerHeight / 2, 'high', 'DEFENSE SUCCESS!');
        return;
      }

      // Roll a random lawsuit from the database for better story integration
      const randomBase = state.randomLawsuitManager.getRandomLawsuit();
      const amount = Math.floor(state.income * 0.2);

      // Calculate starting distance based on ignoreTotal (10% per ignore, max 50%)
      const startingDistance = Math.min(50, (state.lawsuitState.ignoreTotal || 0) * 10);

      set((state) => ({
        lawsuitState: {
          ...state.lawsuitState,
          isActive: true,
          showLawsuitPanel: true,
          isDelivered: false,
          isAcknowledged: false,
          larryDistance: startingDistance,
          milestone: milestoneId || 'random',
          activeLawsuitId: randomBase?.id || 'standard',
          plaintiff: randomBase?.plaintiff || "Regulatory Body",
          claim: randomBase?.claim || "Unfair data practices",
          amount: randomBase ? Math.floor(state.income * (randomBase.severity === 'serious' ? 0.35 : 0.2)) : amount,
          fightSuccessChance: randomBase?.fightSuccessChance || 50,
          settleCost: randomBase?.settleCost || Math.floor(amount * 0.6),
          fightCost: randomBase?.fightCost || Math.floor(amount * 0.3)
        }
      }));
    },

    deliverLawsuit: () => {
      set((state) => {
        const { ignoreTotal, bribeTotal } = state.lawsuitState;
        let larryDialogue = "I'm on my way, Dan.";

        // CONTEXTUAL DIALOGUE SYSTEM
        if (ignoreTotal > 0) {
          larryDialogue = "Thought you could avoid me again?";
        } else if (bribeTotal >= 5) {
          larryDialogue = "I've put my kids through college thanks to you.";
        } else if (bribeTotal >= 3) {
          larryDialogue = "You know, I'm starting to think you LIKE me.";
        } else if (bribeTotal > 0) {
          larryDialogue = "Always a pleasure doing business, Dan.";
        }

        return { 
          lawsuitState: { 
            ...state.lawsuitState, 
            isActive: true,
            isDelivered: true,
            isAcknowledged: false,
            larryDialogue,
            plaintiff: state.lawsuitState.plaintiff || 'Grandma and Grandpa Thompson',
            claim: state.lawsuitState.claim || "Your platform addicted our grandchildren to endless swiping, robbing us of our family dreams...",
            amount: state.lawsuitState.amount || 1000000
          } 
        };
      });
      // Trigger harsh legal sound
      try {
        const { useAudio } = require("./useAudio");
        useAudio.getState().playLegal();
      } catch (e) {
        console.warn("Audio trigger failed:", e);
      }
    },
    toggleLawsuitPanel: () => {
      const state = get();
      // If we are closing the panel, deduct the amount (settle the lawsuit)
      if (state.lawsuitState.showLawsuitPanel) {
        const amount = state.lawsuitState.amount || 0;
        const moneyLoss = amount;
        set((s) => ({
          income: Math.max(0, s.income - amount),
          lawsuitState: { 
            ...s.lawsuitState, 
            showLawsuitPanel: false, 
            isActive: false,
            isDelivered: false,
            isAcknowledged: true
          }
        }));
        // Show visual feedback for money loss
        get().addVisualEffect('money', window.innerWidth / 2, window.innerWidth / 2, 'extreme', `-$${get().formatNumber(moneyLoss)}`, 'red');
      } else {
        set((state) => ({ 
          lawsuitState: { 
            ...state.lawsuitState, 
            showLawsuitPanel: true,
            isAcknowledged: true // Acknowledged once they see it too
          } 
        }));
      }
    },
    settleLawsuit: async () => {
       const state = get();
       if (!state.lawsuitState.showLawsuitPanel) return;
       const cost = state.lawsuitState.amount || 0;
       
       set((s) => ({
         income: Math.max(0, s.income - cost),
         lawsuitState: { 
           ...s.lawsuitState, 
           showLawsuitPanel: false, 
           isActive: false, 
           isDelivered: false,
           isAcknowledged: true,
           ignoredCount: 0,
           lastTacticUsed: 'settle'
         }
       }));
       get().modifyHeat(-15, 'passive');
       get().addVisualEffect('money', window.innerWidth / 2, window.innerHeight / 2, 'extreme', `SETTLED\n-$${get().formatNumber(cost)}`, '#00FFD1');
    },

    fightLawsuit: async (cardType = 'technical') => {
       const state = get();
       if (!state.lawsuitState.showLawsuitPanel) return;
       
       const fightCost = state.lawsuitState.fightCost || 0;
       let winChance = state.lawsuitState.fightSuccessChance || 50;
       let penaltyMult = 1.5;
       let heatSwing = 20;

       // Poker-style card logic
       if (cardType === 'expert') { winChance += 15; penaltyMult = 2.0; } // High risk, high reward
       if (cardType === 'media') { winChance -= 10; heatSwing = 40; } // Reputation gamble
       
       const won = Math.random() * 100 < winChance;
       
       if (won) {
         set((s) => ({
           income: Math.max(0, s.income - fightCost),
           lawsuitState: { ...s.lawsuitState, showLawsuitPanel: false, isActive: false, isDelivered: false, ignoredCount: 0, lastTacticUsed: 'fight' }
         }));
         get().modifyHeat(-heatSwing, 'passive');
         get().addVisualEffect('achievement', window.innerWidth / 2, window.innerHeight / 2, 'extreme', "LEGAL VICTORY!", '#00FFD1');
       } else {
         const penalty = (state.lawsuitState.amount || 0) * penaltyMult;
         set((s) => ({
           income: Math.max(0, s.income - (fightCost + penalty)),
           lawsuitState: { ...s.lawsuitState, showLawsuitPanel: false, isActive: false, isDelivered: false, ignoredCount: 0, lastTacticUsed: 'fight' }
         }));
         get().modifyHeat(15, 'passive');
         get().addVisualEffect('money', window.innerWidth / 2, window.innerHeight / 2, 'extreme', `LOST CASE!\n-$${get().formatNumber(penalty)}`, 'red');
       }
    },

    bribeLarry: async () => {
       const state = get();
       // Price increases 1.5x per bribe
       const bribeCost = 50000 * Math.pow(1.5, state.lawsuitState.larryBribeCount);
       
       if (state.income < bribeCost) return false;

       set((s) => ({
         income: s.income - bribeCost,
         lawsuitState: { 
           ...s.lawsuitState, 
           larryBribeCount: s.lawsuitState.larryBribeCount + 1,
           bribeTotal: (s.lawsuitState.bribeTotal || 0) + 1,
           lastTacticUsed: 'bribe'
         }
       }));
       
       get().addVisualEffect('money', window.innerWidth / 2, window.innerHeight / 2, 'high', `BRIBED LARRY\n-$${get().formatNumber(bribeCost)}`, '#FFCC00');
       return true;
    },

    ignoreLawsuit: async () => {
      const state = get();
      if (!state.lawsuitState.showLawsuitPanel) return;

      const nextIgnoredCount = (state.lawsuitState.ignoredCount || 0) + 1;
      const isNowClassAction = nextIgnoredCount >= 3;

      set((s) => ({
        lawsuitState: { 
          ...s.lawsuitState, 
          showLawsuitPanel: false, 
          isActive: false,
          isDelivered: false,
          isAcknowledged: true,
          ignoredCount: nextIgnoredCount,
          isClassAction: isNowClassAction,
          ignoreTotal: (s.lawsuitState.ignoreTotal || 0) + 1
        }
      }));
      
      get().modifyHeat(isNowClassAction ? 50 : 25, 'passive');
      get().addVisualEffect('achievement', window.innerWidth / 2, window.innerHeight / 2, 'extreme', 
        isNowClassAction ? "CLASS ACTION SNOWBALL!" : `LAWSUIT IGNORED!\n${nextIgnoredCount}/3`
      );
    },

    evadeLawsuit: async (tactic: 'shredder' | 'mixup' | 'bankruptcy') => {
       const state = get();
       const costMult = tactic === 'shredder' ? 0.1 : tactic === 'mixup' ? 0.3 : 0.6;
       const cost = (state.lawsuitState.amount || 100000) * costMult;

       if (state.income < cost) return;

       const heatGains = { shredder: 10, mixup: 5, bankruptcy: -10 };
       
       set((s) => ({
         income: s.income - cost,
         lawsuitState: { 
           ...s.lawsuitState, 
           showLawsuitPanel: false, 
           isActive: false, 
           isDelivered: false,
           lastTacticUsed: tactic,
           ignoredCount: (s.lawsuitState.ignoredCount || 0) + 1 // Still counts as "avoiding"
         }
       }));

       get().modifyHeat(heatGains[tactic], 'passive');
       get().addVisualEffect('achievement', window.innerWidth / 2, window.innerHeight / 2, 'high', `${tactic.toUpperCase()} SUCCESS!`, '#9D4EDD');
    },

    silenceLawsuit: async () => {
       const state = get();
       if (!state.lawsuitState.showLawsuitPanel) return;
       const cost = (state.lawsuitState.amount || 0) * 2;
       
       set((s) => ({
         income: Math.max(0, s.income - cost),
         lawsuitState: { ...s.lawsuitState, showLawsuitPanel: false, isActive: false, isDelivered: false, ignoredCount: 0 }
       }));
       get().modifyHeat(-30, 'passive');
       get().addVisualEffect('money', window.innerWidth / 2, window.innerHeight / 2, 'high', `WITNESSES SILENCED`, '#9D4EDD');
    },
    dismissLawsuit: () => {
      set((state) => {
        const lastTactic = state.lawsuitState.lastTacticUsed;
        let outcomeV: 'settled' | 'won' | 'lost' | 'evaded' = 'evaded';
        
        if (lastTactic === 'settle') outcomeV = 'settled';
        else if (lastTactic === 'fight') outcomeV = 'won'; // Simple for now
        else if (lastTactic === 'bribe') outcomeV = 'evaded';

        const historyItem = {
          id: state.lawsuitState.activeLawsuitId || `case_${Date.now()}`,
          plaintiff: state.lawsuitState.plaintiff,
          outcome: outcomeV,
          amount: state.lawsuitState.amount,
          timestamp: Date.now()
        };

        return {
          lawsuitState: {
            ...state.lawsuitState,
            isActive: false,
            isDelivered: false,
            showLawsuitPanel: false,
            isAcknowledged: true,
            lawsuitHistory: [historyItem, ...state.lawsuitState.lawsuitHistory].slice(0, 10)
          }
        };
      });
    },

    updateLarryDistance: (distance: number) => {
      set((state) => ({
        lawsuitState: {
          ...state.lawsuitState,
          larryDistance: Math.min(100, Math.max(0, distance))
        }
      }));
    },
    acknowledgeLawsuit: () => set((state) => ({
      lawsuitState: {
        ...state.lawsuitState,
        isAcknowledged: true,
        // Don't clear isDelivered/isActive here - it should stay visible 
        // in Suitcase until settled or explicitly dismissed.
      }
    })),
    
    checkLawsuitMilestones: () => {
      const state = get();
      
      // Removed: Broad tip blocker that was halting the whole legal system
      // if (state.activeTipTarget) return;

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
      
      get().checkRandomLawsuits();
    },


    getTotalIncomeMultiplier: () => {
      const state = get();
      const { permanentBonuses, megaMilestones } = state.progressionState;
      let multiplier = state.prestigeState.prestigeMultiplier || 1.0;
      
      const gemBonuses = state.getGemBonuses();
      multiplier *= (gemBonuses.incomeMultiplier || 1.0);

      // Golden Ratio: Stage-scaling bonus
      if (gemBonuses.stageIncomeBonus > 0) {
        const stage = getStage(state.users);
        multiplier *= (1 + (stage * gemBonuses.stageIncomeBonus / 100));
      }

      // Permanent bonuses from list
      if (permanentBonuses.gettingStarted) multiplier *= 1.05;
      if (permanentBonuses.millionaire) multiplier *= 1.10;
      if (permanentBonuses.billionaire) multiplier *= 1.15;
      if (permanentBonuses.speedDemon) multiplier *= 1.20;
      
      // Mega milestones
      if (megaMilestones.digitalOverlord) multiplier *= 3;
      if (megaMilestones.realityDistorter) multiplier *= 5;
      if (megaMilestones.consciousnessHarvester) multiplier *= 10;
      
      // Active Buffs
      state.activeBuffs.forEach(buff => {
        if (buff.type === 'income') {
          multiplier *= buff.multiplier;
        }
      });

      const globalStageBonus = Object.values(state.globalDominance.countries).reduce((sum, c) => sum + (c.stage || 0), 0) * 0.01;
      return multiplier * (1 + globalStageBonus);
    },

    getTotalUserMultiplier: () => {
      const state = get();
      const gemBonuses = state.getGemBonuses();
      let multiplier = 1.0;
      
      // Base gem multiplier
      multiplier *= (gemBonuses.userMultiplier || 1.0);
      
      // Prestige multiplier also affects user lures/generation
      multiplier *= (state.prestigeState.prestigeMultiplier || 1.0);
      
      // Micro-targeting: +20% user gain
      if (state.researchState.completed.includes('micro_targeting')) {
        multiplier *= 1.2;
      }

      const globalStageBonus = Object.values(state.globalDominance.countries).reduce((sum, c) => sum + (c.stage || 0), 0) * 0.01;
      return multiplier * (1 + globalStageBonus);
    },

    getClickPowerMultiplier: () => {
      const state = get();
      const { permanentBonuses, megaMilestones } = state.progressionState;
      const gemBonuses = state.getGemBonuses();
      let multiplier = 1.0;
      
      // Gem click power
      if (gemBonuses.clickPower > 0) {
        multiplier *= (1 + gemBonuses.clickPower / 100);
      }
      
      if (permanentBonuses.clicktastic) multiplier *= 1.10;
      if (permanentBonuses.clickMaster) multiplier *= 1.25;
      if (megaMilestones.dopamineKingpin) multiplier *= 2.0;

      // Active Buffs
      state.activeBuffs.forEach(buff => {
        if (buff.type === 'click') {
          multiplier *= buff.multiplier;
        }
      });
      
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
          sessionMoney: (state.sessionMoney || 0) + boostedAmount
        };
      });

      // Growth = Heat: High income/click power increases heat
      if (boostedAmount > 0) {
        // approx +1 heat per $10k earned (adjust as needed)
        get().modifyHeat(boostedAmount / 10000);
      }

      state.checkPermanentBonuses();
      get().checkAchievements();
    },

    incrementUsers: (amount: number) => {
      if (amount <= 0) return;
      const mult = get().getTotalUserMultiplier();
      const boostedAmount = amount * mult;
      
      set((state) => {
        const teensGain = boostedAmount * 0.4;
        const prosGain = boostedAmount * 0.3;
        const seniorsGain = boostedAmount * 0.2;
        const addictsGain = boostedAmount - (teensGain + prosGain + seniorsGain);
        const oldUsers = state.users;
        const newUsers = oldUsers + boostedAmount;
        
        // Detect Stage Change for Celebration
        const oldStage = getStage(oldUsers);
        const newStage = getStage(newUsers);
        let stageUpdate = {};
        
        if (newStage > oldStage && newStage > state.lastStageReached) {
          stageUpdate = {
            lastStageReached: newStage,
            lastStageCompleteTimestamp: Date.now()
          };
          console.log(`🎊 STAGE COMPLETE: Reached Stage ${newStage}! Triggering celebration...`);
        }
        
        return { 
          users: newUsers,
          ...stageUpdate,
          cohorts: {
            teens: (state.cohorts?.teens || 0) + teensGain,
            pros: (state.cohorts?.pros || 0) + prosGain,
            seniors: (state.cohorts?.seniors || 0) + seniorsGain,
            addicts: (state.cohorts?.addicts || 0) + addictsGain,
          },
          sessionUsersGained: (state.sessionUsersGained || 0) + boostedAmount,
          sessionUsersLured: (state.sessionUsersLured || 0) + boostedAmount
        };
      });

      // Side Effects (Moved outside set for safety and to ensure state is updated)
      const stateAfterUpdate = get();
      stateAfterUpdate.checkMegaMilestones();
      stateAfterUpdate.checkGrandUserMilestones();
      stateAfterUpdate.checkLawsuitMilestones();
      if (stateAfterUpdate.users > 500) {
        stateAfterUpdate.checkRandomLawsuits();
      }
      stateAfterUpdate.checkAchievements();
      stateAfterUpdate.checkGameOver();

      // Growth = Heat: More users = more surveillance
      // PAUSED during active crisis to allow recovery
      if (boostedAmount > 0 && !get().lawsuitState.isCrisisActive) {
        get().modifyHeat(boostedAmount / 100, 'click');
      }

      // Track Peak Users
      if (stateAfterUpdate.users > stateAfterUpdate.peakUsers) {
        set({ peakUsers: stateAfterUpdate.users });
      }
    },

    checkGameOver: () => {
      const state = get();
      const stage = getStage(state.users);
      let gameOver = false;

      // Stage 1-3: Risk of bankruptcy if user count hits Zero
      // RELAXED: Must be at least Stage 2 and give 60s grace period
      if (stage > 1 && stage <= 3 && state.users <= 0 && state.gameStartTime > 0 && Date.now() - state.gameStartTime > 60000) {
        gameOver = true;
      } 
      // Stage 4-6: Users < 10% peak AND Income = 0
      else if (stage >= 4 && stage <= 6 && state.peakUsers > 1000) {
        if (state.users < state.peakUsers * 0.1 && state.income <= 0) {
          gameOver = true;
        }
      }
      // Stage 10+: Platform Collapse (Users < 100K)
      else if (stage >= 10 && state.users < 100000 && state.peakUsers > 1000000) {
        gameOver = true;
      }

      if (gameOver && !state.isGameOver) {
        set({ isGameOver: true, gameState: 'paused' });
      }
    },

    resetGame: () => {
      // Full reset for "Try Again"
      set((state) => ({
        income: 0,
        users: 0,
        heat: 0,
        isGameOver: false,
        gameState: 'playing',
        peakUsers: 0,
        gameStartTime: Date.now(),
        departments: DEFAULT_DEPARTMENTS.map(d => ({ ...d, level: 0, count: 0 })),
        hiredLawyers: [],
        activeLawyerSlots: [null, null, null],
        characters: {
          walsh: { suspicion: 0, flags: [] },
          whistleblower: { active: false, ignoredCount: 0 },
          rival: { users: 0, growthRate: 0 }
        },
        lawsuitState: {
          ...state.lawsuitState,
          isActive: false,
          isDelivered: false,
          showLawsuitPanel: false
        }
      }));
    },

    applyPassiveIncome: () => {
      const state = get();
      const now = Date.now();
      const diff = (now - state.lastPassiveUpdate) / 1000;
      if (diff <= 0) return;
      
      get().tickResearch(now - state.lastPassiveUpdate);
      get().checkGlobalDominanceUnlocks();

      // Clean up expired buffs
      const expiredBuffs = state.activeBuffs.filter(b => b.expiresAt !== null && b.expiresAt <= now);
      if (expiredBuffs.length > 0) {
        set({ activeBuffs: state.activeBuffs.filter(b => b.expiresAt === null || b.expiresAt > now) });
      }
      
      // Apply gem efficiency bonus to passive income
      const gemBonuses = get().getGemBonuses();
      const efficiencyMultiplier = 1 + (gemBonuses.departmentEfficiency / 100);
      // ── BUILDING PRODUCTION ──────────────────────────────────────────────────
      let totalBuildingsOrbs = 0;
      let totalBuildingsUsers = 0;
      let totalBuildingsHeatFlat = 0;
      
      const countries = Object.entries(state.globalDominance.countries);
      
      // Global Multipliers
      let globalBuildingMultiplier = 1.0;
      let globalIncomeBuildingMultiplier = 1.0;
      
      countries.forEach(([id, c]) => {
        if (id === 'lun' && c.buildings.orbital_relay) {
          globalBuildingMultiplier += c.buildings.orbital_relay * 0.2;
        }
        if (id === 'br' && c.buildings.amazon_hub) {
          globalIncomeBuildingMultiplier += c.buildings.amazon_hub * 0.15;
        }
      });

      countries.forEach(([id, c]) => {
        // Data Orbs
        if (c.buildings.data_center) {
          let orbOutput = (c.buildings.data_center * BUILDINGS_CONFIG.data_center.output.orbs);
          if (id === 'cn' && c.buildings.mutual_arrangement) orbOutput *= 2; // Mutual Arrangement HQ
          totalBuildingsOrbs += orbOutput * globalBuildingMultiplier;
        }

        // Users
        if (c.buildings.ai_factory) {
          let userOutput = (c.buildings.ai_factory * BUILDINGS_CONFIG.ai_factory.output.users);
          if (id === 'fi' && c.buildings.sauna_algorithm) userOutput *= 1.25; // Sauna Algorithm
          totalBuildingsUsers += userOutput * globalBuildingMultiplier;
        }
        
        // Void Node (Sector 7)
        if (id === 'sec' && c.buildings.void_node) {
          totalBuildingsUsers += (c.buildings.void_node * BUILDINGS_CONFIG.void_node.output.massiveUsers);
        }

        // Heat
        if (id === 'us' && c.buildings.lobby_office) {
          totalBuildingsHeatFlat += (c.buildings.lobby_office * BUILDINGS_CONFIG.lobby_office.output.heatFlat);
        }
      });

      const incomeMultiplier = get().getTotalIncomeMultiplier() * globalIncomeBuildingMultiplier;
      const earnings = state.totalIncomePerSecond * diff * efficiencyMultiplier * incomeMultiplier;
      
      const sessionMoney = (state.sessionMoney || 0) + earnings;
      const sessionMoneyEarned = (state.sessionMoneyEarned || 0) + earnings;

      // Apply flat heat reduction from Lobby Offices
      if (totalBuildingsHeatFlat > 0) {
        get().modifyHeat(-(totalBuildingsHeatFlat * diff));
      }

      set((s) => ({ 
        income: s.income + earnings,
        totalLifetimeIncome: s.totalLifetimeIncome + earnings,
        sessionMoney: sessionMoney,
        sessionMoneyEarned: sessionMoneyEarned,
        lastPassiveUpdate: now,
        orbsInventory: s.orbsInventory + (totalBuildingsOrbs * diff),
        users: s.users + (totalBuildingsUsers * diff),
        dopaCoin: s.researchState.completed.includes('synthetic_value') 
          ? s.dopaCoin + (s.users / 1000) * diff 
          : s.dopaCoin,
        dopaCoinUnlocked: s.researchState.completed.includes('synthetic_value')
      }));

      if (state.isPubliclyTraded) {
        get().updateStockPrice();
      }

      // Passive growth also generates a bit of heat (less than spikes)
      // Paused during an active Shitstorm to prevent endless inescapable crises at high income levels
      if (earnings > 0 && !state.lawsuitState.isCrisisActive) {
        const rawHeat = earnings / 100000;
        // Soft cap large passive heat chunks so it doesn't instantly jump to 100
        const scaledHeat = Math.min(5.0, rawHeat > 1.0 ? 1.0 + Math.log10(rawHeat) : rawHeat);
        get().modifyHeat(scaledHeat, 'passive'); // 10x slower than clicks/lures
      }

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
        regulatoryRisk: saveData.gameState.regulatoryRisk || 0,
        characters: saveData.gameState.characters || state.characters,
        dismissedTips: saveData.gameState.dismissedTips || [],
        lastPassiveUpdate: saveData.gameState.lastPassiveUpdate || Date.now(),
        lastPassiveUserUpdate: saveData.gameState.lastPassiveUserUpdate || Date.now(),
        activeBuffs: saveData.gameState.activeBuffs || [],
        totalPlayTime: saveData.gameState.totalPlayTime || (saveData.statistics?.totalPlayTime || 0),
        collectedElites: saveData.gameState.collectedElites || [],
        darkWebPurchases: saveData.gameState.darkWebPurchases || [],
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
      
      let basePrice = state.dataMarket.prices[type];
      if (state.researchState.completed.includes('psychographic_profiling')) {
        basePrice = basePrice * 1.25;
      }
      const price = basePrice * multiplier;
      const totalGain = price * amount;
      
      set((state) => ({
        income: state.income + totalGain,
        totalLifetimeIncome: state.totalLifetimeIncome + totalGain,
        dataMarket: {
          ...state.dataMarket,
          inventory: { ...state.dataMarket.inventory, [type]: state.dataMarket.inventory[type] - amount }
        }
      }));
      
      // Apply heat increase via modifyHeat to account for lawyers
      get().modifyHeat(heatIncrease, 'data');
    },

    sellAllData: () => {
      const state = get();
      const orbs = state.dataInventory;
      if (orbs <= 0) return;

      // Advertiser milestone thresholds and bonuses
      const MILESTONES = [
        { threshold: 100,   bonus: 0.05 },
        { threshold: 350,   bonus: 0.07 },
        { threshold: 600,   bonus: 0.09 },
        { threshold: 1000,  bonus: 0.11 },
        { threshold: 1500,  bonus: 0.13 },
        { threshold: 2500,  bonus: 0.15 },
        { threshold: 4000,  bonus: 0.17 },
        { threshold: 6000,  bonus: 0.19 },
        { threshold: 9000,  bonus: 0.21 },
        { threshold: 13000, bonus: 0.23 },
      ];
      
      // Predictive Algorithms: Advertiser Milestones require 20% less volume
      const hasPredictive = state.researchState.completed.includes('predictive_algorithms');
      const activeMilestones = MILESTONES.map(m => ({
        ...m,
        threshold: hasPredictive ? Math.floor(m.threshold * 0.8) : m.threshold
      }));

      const gemBonuses = get().getGemBonuses();
      const currentMultiplier = state.advertiserData.incomeMultiplier * (1 + (gemBonuses.dataPriceBoost || 0));
      const newTotalSold = state.advertiserData.totalDataSold + orbs;

      // Bulk pricing: orbs × 50 × (1 + orbs/20) × advertiserMultiplier
      const payout = Math.floor(orbs * 50 * (1 + orbs / 20) * currentMultiplier);

      // Campaign cooldown reduction: -30s from all active cooldowns
      const newCooldowns = new Map(state.campaignCooldowns);
      newCooldowns.forEach((cooldown, id) => {
        newCooldowns.set(id, Math.max(0, cooldown - 30000));
      });

      // Campaign charges: +1 per 10 orbs, max +5
      // Penalties: Lose 5% of users or 5% of income! Impact matters!
      const userLoss = Math.max(10, Math.floor(state.users * 0.05));
      const moneyLoss = Math.max(500, Math.floor(state.income * 0.05));
      const maxCharges = get().getMaxCampaignCharges();
      const chargeBonus = Math.min(5, Math.floor(orbs / 10));
      const newCharges = Math.min(maxCharges + 5, state.campaignCharges + chargeBonus);

      // Permanent orbs: 5% of sold orbs → orbsInventory
      const permOrbGain = Math.floor(orbs * 0.05);

      // Heat spike: +1 per 5 orbs (Buffed for manual crisis testing)
      let heatSpike = Math.floor(orbs / 5);
      if (gemBonuses.heatDamping > 0) {
        heatSpike = Math.max(0, heatSpike - Math.floor(heatSpike * (gemBonuses.heatDamping / 100)));
      }

      // Check milestones
      let newMultiplier = state.advertiserData.incomeMultiplier;
      let newMilestonesReached = state.advertiserData.milestonesReached;
      for (const m of activeMilestones) {
        if (state.advertiserData.totalDataSold < m.threshold && newTotalSold >= m.threshold) {
          newMultiplier += m.bonus;
          newMilestonesReached += 1;
          get().addVisualEffect('achievement', 200, 100, 'high', `ADVERTISER +${Math.round(m.bonus * 100)}%`);
        }
      }

      const nextMilestone = activeMilestones.find(m => newTotalSold < m.threshold)?.threshold ?? 99999;

      set((s) => ({
        income: s.income + payout,
        totalLifetimeIncome: s.totalLifetimeIncome + payout,
        dataInventory: 0,
        orbsInventory: s.orbsInventory + permOrbGain,
        campaignCooldowns: newCooldowns,
        campaignCharges: newCharges,
        totalDataSold: s.totalDataSold + orbs,
        sessionDataSold: (s.sessionDataSold || 0) + orbs,
        advertiserData: {
          totalDataSold: newTotalSold,
          incomeMultiplier: newMultiplier,
          nextMilestone,
          milestonesReached: newMilestonesReached,
        }
      }));

      if (heatSpike > 0) {
        get().modifyHeat(heatSpike);
      }

      get().addVisualEffect('money', 200, 120, 'high', `+$${get().formatNumber(payout)}`);
      if (permOrbGain > 0) {
        get().addVisualEffect('users', 200, 160, 'medium', `+${permOrbGain} ◈ permanent`);
      }
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
      
      // Don't trigger if one is already active or if heat is too low
      if (state.lawsuitState.isActive || state.heat < 10) return;

      // Heat connects to Lawsuit frequency:
      const now = Date.now();
      
      let chance = 0;
      if (state.heat >= 75) chance = 0.08; // 8% chance per gain
      else if (state.heat >= 50) chance = 0.03; // 3%
      else if (state.heat >= 25) chance = 0.01; // 1%
      else if (state.heat >= 10) chance = 0.002; // 0.2%

      if (chance > 0 && Math.random() < chance) {
        const lawsuit = state.randomLawsuitManager.getRandomLawsuit();
        if (lawsuit) {
          console.log(`⚖️ RANDOM LAWSUITS TRIGGERED: ${lawsuit.title}`);
          set((s) => ({
            lawsuitState: {
              ...s.lawsuitState,
              isActive: true,
              isDelivered: true, // Immediately "served" to the suitcase
              isAcknowledged: false,
              showLawsuitPanel: false, // Don't show the big modal, put it in suitcase
              plaintiff: lawsuit.plaintiff,
              claim: lawsuit.claim,
              amount: Math.floor((s.income * 0.15) + lawsuit.demandAmount * 0.01), // Scale with income
              milestone: lawsuit.title
            }
          }));
        }
      }
    },

    resolveRandomLawsuit: (resolution) => {
      const state = get();
      if (!state.currentRandomLawsuit) {
        set({ showRandomLawsuit: false });
        return;
      }

      const { cost, outcome, reputationChange } = state.randomLawsuitManager.handleLawsuitResolution(
        state.currentRandomLawsuit.id, 
        resolution
      );

      // Offshore Data Havens: Protects 50% of funds from Lawsuit damages
      let finalCost = cost;
      if (finalCost > 0 && state.researchState.completed.includes('offshore_havens')) {
        finalCost = Math.floor(finalCost * 0.5);
      }

      set((s) => ({
        showRandomLawsuit: false,
        currentRandomLawsuit: null,
        income: Math.max(0, s.income - finalCost)
      }));

      // Visual feedback
      if (finalCost > 0) {
        get().addVisualEffect('money', window.innerWidth / 2, window.innerHeight / 2, 'high', `-$${get().formatNumber(finalCost)}`, 'red');
      }
      get().addReward({
        type: 'special',
        title: 'Lawsuit Resolved',
        description: outcome,
        value: finalCost > 0 ? -finalCost : 0
      });
    },
    closeRandomLawsuit: () => set({ showRandomLawsuit: false, currentRandomLawsuit: null }),

    collectElite: (eliteId: string) => {
      const state = get();
      const eliteDef = ELITES.find(e => e.id === eliteId);
      if (!eliteDef) return;

      // 1. Reward: Fixed users from registry
      get().incrementUsers(eliteDef.userValue);
      
      // 2. State: Record capture
      if (!state.collectedElites.includes(eliteId)) {
        set((s) => ({ collectedElites: [...s.collectedElites, eliteId] }));
      }

      // 3. Dialogue: Show dyna-node
      const danReply: DialogueNode = {
        id: `elite_capture_${eliteId}`,
        text: `[CAPTURADO: ${eliteDef.name.toUpperCase()}]\n\nDan: "${eliteDef.danQuip}"`,
        options: [{ text: "Excellent.", nextId: null }]
      };
      
      get().setCharacterDialogue(danReply);

      // 4. Effects: Metaman Celebration
      if (state.metamanEngine) {
        state.metamanEngine.triggerMetamanSmile(5000);
      }
      
      // 5. Heat: Capturing elites calms the regulators (PR win)
      const heatReduction = 5 + (eliteDef.tier * 2); 
      get().modifyHeat(-heatReduction);
      
      console.log(`🏆 ELITE COLLECTED: ${eliteDef.name}. +${eliteDef.userValue} users. Heat -%${heatReduction}.`);
    },

    setCharacterDialogue: (charIdOrNode) => {
      set((state) => {
        // Handle input type
        const isNode = typeof charIdOrNode !== 'string' && charIdOrNode !== null;
        const charId = isNode ? (charIdOrNode as DialogueNode).id : (charIdOrNode as string | null);
        const node = isNode ? (charIdOrNode as DialogueNode) : null;

        let characterUpdates = {};
        if (charId === 'walsh_intro_1' && !state.characters.walsh.flags.includes('met_walsh')) {
          characterUpdates = { 
            characters: { 
              ...state.characters, 
              walsh: { ...state.characters.walsh, flags: [...state.characters.walsh.flags, 'met_walsh'] } 
            } 
          };
        } else if (charId === 'whistleblower_1') {
          characterUpdates = { 
            characters: { 
              ...state.characters, 
              whistleblower: { ...state.characters.whistleblower, active: true } 
            } 
          };
        }

        return { 
          activeCharacter: node ? null : charId, 
          activeDialogueNode: node,
          showCharacterDialogue: !!charIdOrNode,
          ...characterUpdates
        };
      });
    },
    
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
    
    incrementDataInventory: (amount: number) => {
      set((state) => ({ 
        dataInventory: state.dataInventory + amount,
        totalDataCollected: (state.totalDataCollected || 0) + amount
      }));
      get().updateStats('orbsCollected', amount);
    },

    setDataInventory: (amount: number) => set({ dataInventory: amount }),

    buyLawyer: (lawyerId: string) => {
      const state = get();
      const lawyer = LAWYERS.find(l => l.id === lawyerId);
      if (!lawyer || state.hiredLawyers.includes(lawyerId)) return false;
      if (state.income < lawyer.cost) return false;

      set((s) => ({
        income: s.income - lawyer.cost,
        hiredLawyers: [...s.hiredLawyers, lawyerId]
      }));
      return true;
    },

    equipLawyer: (lawyerId: string, slotIndex: number) => {
      set((state) => {
        const slots = [...state.activeLawyerSlots];
        // If lawyer is already in another slot, remove them from there
        const existingIdx = slots.indexOf(lawyerId);
        if (existingIdx !== -1) slots[existingIdx] = null;
        
        slots[slotIndex] = lawyerId;
        return { activeLawyerSlots: slots };
      });
    },

    getLegalBonuses: () => {
      const state = get();
      const equipped = state.activeLawyerSlots
        .map(id => id ? LAWYERS.find(l => l.id === id) : null)
        .filter((l): l is Lawyer => !!l);
      
      const bonuses = {
        heatDecay: 0,
        clickHeat: 0,
        dataHeat: 0,
        lawsuitDefense: 0, globalGeneration: 0
      };

      equipped.forEach(lawyer => {
        switch (lawyer.bonusType) {
          case 'heatDecay': bonuses.heatDecay += lawyer.bonusValue; break;
          case 'clickHeat': bonuses.clickHeat += lawyer.bonusValue; break;
          case 'dataHeat': bonuses.dataHeat += lawyer.bonusValue; break;
          case 'lawsuitDefense': bonuses.lawsuitDefense += lawyer.bonusValue; break;
          case 'globalGeneration': bonuses.globalGeneration += lawyer.bonusValue; break;
        }
      });
      return bonuses;
    },
    
    initializeGame: () => {
      const state = get();
      if (!state.achievementManager) {
        set({ achievementManager: new AchievementManager((achievement) => get().showAchievementShowcase(achievement)) });
      }
      
      // Tutorial now triggered by NEW GAME button, not here.
      // Keeps the main menu clean on first launch.
      
      // Ensure gameState is only set to menu if it's currently undefined or initial
      set((state) => ({ 
        gameState: state.gameState === 'playing' ? 'playing' : 'menu' 
      }));
    },
    
    handleManualClick: (x = 512, y = 300) => {
      const gemBonuses = get().getGemBonuses?.() || { clickPower: 0, autoClicker: false };
      const clickIncome = 1 + (gemBonuses.clickPower || 0) / 10;
      get().incrementIncome(clickIncome);
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
        // Switch to 1.02 increasing returns per level instead of 0.95 penalty
        total += department.baseIncome * Math.pow(1.02, i);
      }
      return total;
    },

    getMarginalIncome: (departmentId: string, amount = 1) => {
      const state = get();
      const dept = state.departments.find(d => d.id === departmentId);
      if (!dept) return 0;
      
      const incomeMult = state.getTotalIncomeMultiplier();
      const gemBonuses = state.getGemBonuses();
      const efficiencyMult = 1 + (gemBonuses.departmentEfficiency / 100);
      
      let gain = 0;
      for (let i = 0; i < amount; i++) {
        gain += dept.baseIncome * Math.pow(1.02, dept.owned + i) * incomeMult * efficiencyMult;
      }
      return gain;
    },
    
    updatePassiveIncome: () => {
      const state = get();
      const totalIncome = state.departments.reduce((sum, d) => sum + get().calculateDepartmentIncome(d), 0);
      set({ totalIncomePerSecond: totalIncome });
    },

    // claimAchievement removed (replaced by suitcase system)

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


    // Removed: closeAchievementPopup: () => set({ currentAchievementPopup: null }),
    
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

    addVisualEffect: (type: 'money' | 'users' | 'purchase' | 'achievement' | 'crisis', x = 512, y = 384, intensity: 'low' | 'medium' | 'high' | 'extreme' = 'medium', value?: string | number, color?: string) => {
      const newEffect = {
        id: Date.now() + Math.random(),
        type, x, y,
        duration: (intensity === 'extreme' ? 1500 : (intensity === 'high' ? 700 : 600)),
        intensity,
        value,
        color
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
        currentAchievementShowcase: null,
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

      let totalBaseUserGen = state.departments.reduce((sum, dept) => {
        return sum + (dept.owned * (dept.baseUserGeneration || 0));
      }, 0);
      
      // APPLY RESEARCH BUFFS
      if (state.researchState.completed.includes('infinite_scroll')) {
        totalBaseUserGen = totalBaseUserGen * 1.3; // +30% passive user growth
      }
      
      if (state.researchState.completed.includes('sleep_disruption')) {
        // Sleep disruption applies 3x multiplier to passive growth at night (real time 22:00-06:00)
        const currentHour = new Date().getHours();
        if (currentHour >= 22 || currentHour < 6) {
          totalBaseUserGen = totalBaseUserGen * 3;
        }
      }

      const gemBonuses = get().getGemBonuses();
      const boostedUsersGenerated = totalBaseUserGen * (diff / 1000) * (1 + (gemBonuses.userGeneration / 100));
      
      if (boostedUsersGenerated > 0) {
        get().incrementUsers(boostedUsersGenerated);
      } else {
        // Even if no users generated, check for Game Over (for decay situations)
        get().checkGameOver();
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
        // Stage gating for slots
        const stage = getStage(state.users);
        if (idx === 1 && stage < 3) return state;
        if (idx === 2 && stage < 5) return state;
        if (idx === 3 && stage < 8) return state;

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
      const bonuses = { 
        userGeneration: 0, 
        clickPower: 0, 
        orbCollection: 0, 
        departmentEfficiency: 0, 
        influenceGeneration: 0,
        heatDamping: 0,
        stageIncomeBonus: 0,
        dataPriceBoost: 0,
        autoClicker: false,
        userMultiplier: 1.0,
        incomeMultiplier: 1.0
      };

      equipped.forEach(gem => {
        if (!gem) return;
        switch (gem.type) {
          case 'speed': bonuses.userGeneration += gem.modifier; break;
          case 'power': bonuses.clickPower += gem.modifier; break;
          case 'collection': bonuses.orbCollection += gem.modifier; break;
          case 'efficiency': bonuses.departmentEfficiency += gem.modifier; break;
          case 'influence': bonuses.influenceGeneration += gem.modifier; break;
          // Legendary / Endgame
          case 'reality': bonuses.incomeMultiplier += gem.modifier/100; bonuses.userMultiplier += gem.modifier/100; break;
          case 'quantum': bonuses.userMultiplier += 2.5; break;
          case 'void': bonuses.heatDamping += gem.modifier; break;
          case 'ratio': bonuses.stageIncomeBonus += gem.modifier; break;
          case 'neural': bonuses.autoClicker = true; bonuses.clickPower += 300; break;
          case 'market': bonuses.dataPriceBoost += 0.5; break;
          case 'scale': bonuses.userMultiplier += 5.0; break;
          case 'matter': bonuses.influenceGeneration += 500; break;
          case 'temporal': bonuses.incomeMultiplier += 1.0; break;
          case 'meta': bonuses.incomeMultiplier += 10.0; break;
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
      setTimeout(() => get().hideSpeechBubble(), 5000);
    },

    checkSpeechBubbleTrigger: () => {
      const state = get();
      if (Date.now() - state.speechBubbleState.lastTriggerTime < 15000) return;
      if (state.users >= 100 && Math.random() < 0.1) get().triggerSpeechBubble();
    },

    incrementOrbsInventory: (amount: number) => {
      const state = get();
      
      let orbGain = amount;
      if (amount > 0 && state.researchState.completed.includes('micro_targeting')) {
        orbGain = Math.floor(amount * 1.2);
      }
      
      // Only gain charges when harvesting (amount > 0)
      let reg = orbGain > 0 ? Math.floor(orbGain / 2) : 0;
      
      if (state.researchState.completed.includes('dopamine_loop')) {
         // 50% faster charges
         reg = Math.floor(reg * 1.5);
         // Ensure it gives at least 1 extra if we got any
         if (reg > 0 && reg === Math.floor(orbGain / 2)) reg += 1;
      }
      
      const maxCharges = get().getMaxCampaignCharges();
      
      set({ 
        orbsInventory: (state.orbsInventory || 0) + orbGain,
        totalOrbsCollected: (state.totalOrbsCollected || 0) + (orbGain > 0 ? orbGain : 0),
        campaignCharges: Math.min(maxCharges, (state.campaignCharges || 0) + reg)
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
    },
    triggerCrisisSpeech: (message: string) => {
      set((state) => ({
        speechBubbleState: {
          ...state.speechBubbleState,
          isVisible: true,
          message,
          lastTriggerTime: Date.now()
        }
      }));
      // Auto-hide after 5 seconds as requested
      setTimeout(() => get().hideSpeechBubble(), 5000);
    },
    hideSpeechBubble: () => set((state) => ({
      speechBubbleState: {
        ...state.speechBubbleState,
        isVisible: false
      }
    })),

    // ── RESEARCH LAB METHODS ───────────────────────────────────────────────
    startResearch: (id: string) => {
      const state = get();
      if (state.researchState.activeResearch) return false;
      const node = ALL_RESEARCH_NODES[id];
      if (!node || state.income < node.cost) return false;

      set((s) => ({
        income: s.income - node.cost,
        researchState: {
          ...s.researchState,
          activeResearch: id,
          progressPercent: 0,
          timeRemainingMs: node.duration,
          boostEffect: null,
        }
      }));
      return true;
    },

    queueResearch: (id: string) => {
      const state = get();
      if (state.researchState.queue.length >= 2) return false;
      if (state.researchState.queue.includes(id) || state.researchState.completed.includes(id)) return false;
      if (state.researchState.activeResearch === id) return false;
      
      const node = ALL_RESEARCH_NODES[id];
      if (!node) return false; // Costs deducted on start

      set((s) => ({
        researchState: {
          ...s.researchState,
          queue: [...s.researchState.queue, id]
        }
      }));
      return true;
    },

    cancelResearch: () => {
      set((s) => ({
        researchState: {
          ...s.researchState,
          activeResearch: null,
          progressPercent: 0,
          timeRemainingMs: 0,
          boostEffect: null,
        }
      }));
    },

    boostResearch: () => {
      const state = get();
      if (!state.researchState.activeResearch || state.researchState.isLeakActive) return;
      
      const node = ALL_RESEARCH_NODES[state.researchState.activeResearch];
      if (!node) return;
      
      const boostCost = Math.max(50000, node.cost * 0.2); 
      if (state.income < boostCost) return;

      const effects = [
        { type: 'Lab Accident', desc: 'Explosion speeds up research, but costs 10% of total cash.', moneyDamage: 0.1, timeSkip: 0.5 },
        { type: 'Breakthrough!', desc: 'Research time cut in half!', moneyDamage: 0, timeSkip: 0.5 },
        { type: 'Coffee Break', desc: 'Nothing happened. Money wasted.', moneyDamage: 0, timeSkip: 0 },
        { type: 'Whistleblower Leak', desc: 'Media got wind of it. +20 Senator Suspicion, but research done.', moneyDamage: 0, timeSkip: 1.0, heatAlert: true },
        { type: 'Wrong Formula', desc: 'Progress reset! (Just kidding, but it takes 20% longer now).', moneyDamage: 0, timeSkip: -0.2 }
      ];
      
      const effect = effects[Math.floor(Math.random() * effects.length)];
      
      let newIncome = state.income - boostCost;
      if (effect.moneyDamage > 0) newIncome -= (newIncome * effect.moneyDamage);
      
      let newTime = state.researchState.timeRemainingMs * (1 - effect.timeSkip);
      if (newTime <= 0) {
        newTime = 1;
      }

      set((s) => ({
        income: Math.max(0, newIncome),
        researchState: {
          ...s.researchState,
          timeRemainingMs: newTime,
          boostEffect: { type: effect.type, description: effect.desc, timestamp: Date.now() }
        }
      }));

      if (effect.heatAlert) {
         get().modifyHeat(20, 'passive');
         get().updateCharacterState('walsh', { suspicion: state.characters.walsh.suspicion + 20 });
      }
    },

    tickResearch: (deltaMs: number) => {
      const state = get();
      const rState = state.researchState;
      if (!rState.activeResearch && rState.queue.length > 0) {
        const next = rState.queue[0];
        const success = get().startResearch(next);
        if (success) {
           set((s) => ({
             researchState: { ...s.researchState, queue: s.researchState.queue.slice(1) }
           }));
        } else {
           set((s) => ({
             researchState: { ...s.researchState, queue: s.researchState.queue.slice(1) }
           }));
        }
        return;
      }

      if (rState.activeResearch && !rState.isLeakActive) {
         const node = ALL_RESEARCH_NODES[rState.activeResearch];
         if (!node) return;
         
         const newTime = rState.timeRemainingMs - deltaMs;
         if (newTime <= 0) {
            get().completeResearch(rState.activeResearch);
         } else {
            set((s) => ({
               researchState: {
                 ...s.researchState,
                 timeRemainingMs: newTime,
                 progressPercent: 1 - (newTime / node.duration)
               }
            }));
            
            if (Math.random() < 0.0003 && state.users > 10000) {
               get().triggerResearchLeak();
            }
         }
      } else if (rState.isLeakActive) {
         const newLeakTimer = rState.leakTimerMs - deltaMs;
         if (newLeakTimer <= 0) {
             get().resolveResearchLeak(false);
         } else {
             set((s) => ({
               researchState: { ...s.researchState, leakTimerMs: newLeakTimer }
             }));
         }
      }
    },

    triggerResearchLeak: () => {
       const state = get();
       set((s) => ({
         researchState: {
           ...s.researchState,
           isLeakActive: true,
           leakTarget: s.researchState.activeResearch,
           leakTimerMs: 30000 // 30 seconds
         }
       }));
       get().triggerCrisisSpeech("🚨 RivalCorp is hacking R&D! Open Espionage to defend!");
    },

    resolveResearchLeak: (success: boolean) => {
       const state = get();
       if (success) {
          get().incrementDataInventory(500);
          set((s) => ({
            researchState: { ...s.researchState, isLeakActive: false, leakTarget: null }
          }));
          get().triggerCrisisSpeech("🛡️ Research secured! Harvested data from intruders.");
       } else {
          const node = ALL_RESEARCH_NODES[state.researchState.activeResearch || ''];
          set((s) => ({
            researchState: { 
              ...s.researchState, 
              isLeakActive: false, 
              leakTarget: null,
              progressPercent: 0,
              timeRemainingMs: node ? node.duration : 0
            }
          }));
       }
    },

    completeResearch: (id: string) => {
       const state = get();
       if (!state.researchState.completed.includes(id)) {
           const allNodes = Object.values(ALL_RESEARCH_NODES);
           const newlyUnlocked = allNodes
              .filter(n => !state.researchState.unlocked.includes(n.id) && n.requirements.every(req => state.researchState.completed.includes(req) || req === id))
              .map(n => n.id);

           set((s) => ({
              researchState: {
                 ...s.researchState,
                 activeResearch: null,
                 progressPercent: 0,
                 completed: [...s.researchState.completed, id],
                 unlocked: Array.from(new Set([...s.researchState.unlocked, ...newlyUnlocked]))
              }
           }));
           
           get().triggerCrisisSpeech(`🔬 R&D Complete: ${ALL_RESEARCH_NODES[id]?.name}`);
       }
    },

    setPlayTime: (time: number) => set({ totalPlayTime: time }),

    buyDarkWebItem: (item: any) => {
      const state = get();
      const isDopaCoinItem = ['larry_decoy', 'shadow_servers'].includes(item.id);
      const currencyAttr = isDopaCoinItem ? 'dopaCoin' : 'income';
      
      if (state[currencyAttr] < item.price) return;

      set((s: any) => ({
        [currencyAttr]: s[currencyAttr] - item.price,
        darkWebPurchases: [...(s.darkWebPurchases || []), item.id],
        lawsuitState: item.id === 'larry_decoy' ? { ...s.lawsuitState, larryDistance: 0 } : s.lawsuitState,
        blackMarketState: item.id === 'political_lobbying' ? { ...s.blackMarketState, influencePoints: (s.blackMarketState.influencePoints || 0) + 50 } : s.blackMarketState
      }));

      get().addVisualEffect('purchase', window.innerWidth / 2, window.innerHeight / 2, 'high', `${item.name.toUpperCase()} ACQUIRED!`);
      
      if (item.id === 'shadow_servers') {
        get().addBuff({ id: 'shadow_servers', type: 'income', multiplier: 2.5, expiresAt: Date.now() + 120000 });
      }
    },

    updateStockPrice: () => {
      const state = get();
      if (!state.isPubliclyTraded) return;

      const baseValue = (state.totalIncomePerSecond * 10) + (state.users * 0.1);
      const heatPenalty = 1 - (state.blackMarketState.regulatoryHeat / 200);
      const newPrice = Math.max(0.01, (baseValue / 1000000) * heatPenalty);

      set({ stockPrice: Number(newPrice.toFixed(2)) });
    },
  };
})
);
