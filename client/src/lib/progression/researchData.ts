export type ResearchBranch = 'addiction' | 'data' | 'legal';

export interface ResearchNode {
  id: string;
  name: string;
  realDescription: string; // The "secret" dark corporate truth
  benefit: string; // Clear mechanical benefit
  cost: number; // Cost in money
  duration: number; // Base duration in milliseconds
  tier: number;
  branch: ResearchBranch;
  icon?: string;
  requirements: string[]; // IDs of required nodes before this can be unlocked
}

// 2 mins, 10 mins, 1 hour (represented in MS)
const DURATIONS = {
  QUICK: 2 * 60 * 1000,
  MEDIUM: 10 * 60 * 1000,
  LONG: 60 * 60 * 1000,
  TESTING: 10 * 1000 // Only for quick debugging if needed
};

// Costs scale heavily to provide late-game sinks
const COSTS = {
  TIER_1: 50_000,
  TIER_2: 500_000,
  TIER_3: 5_000_000,
  TIER_4: 50_000_000,
};

export const ADDICTION_SCIENCE_TREE: ResearchNode[] = [
  {
    id: 'engagement_metrics',
    name: 'Engagement Metrics Study',
    realDescription: 'Figure out the exact millisecond a user starts weeping but refuses to stop scrolling.',
    benefit: '2x Users from Campaign Clicks',
    cost: COSTS.TIER_1,
    duration: DURATIONS.QUICK,
    tier: 1,
    branch: 'addiction',
    requirements: []
  },
  {
    id: 'dopamine_loop',
    name: 'Dopamine Loop Architecture',
    realDescription: 'Construct a psychological inescapable hamster wheel. Hook them faster.',
    benefit: '+50% Campaign Charge rate',
    cost: COSTS.TIER_2,
    duration: DURATIONS.MEDIUM,
    tier: 2,
    branch: 'addiction',
    requirements: ['engagement_metrics']
  },
  {
    id: 'infinite_scroll',
    name: 'Infinite Scroll Patent',
    realDescription: 'The content never ends, and neither does the user. Passive growth boost.',
    benefit: '+30% Passive User Generation',
    cost: COSTS.TIER_2,
    duration: DURATIONS.MEDIUM,
    tier: 2,
    branch: 'addiction',
    requirements: ['engagement_metrics']
  },
  {
    id: 'variable_reward',
    name: 'Variable Reward Scheduling',
    realDescription: 'Copy casino slot machine psychology, but point it at teenagers. Every 10th manual click hits the jackpot.',
    benefit: '10x User Jackpot every 10th click',
    cost: COSTS.TIER_3,
    duration: DURATIONS.LONG,
    tier: 3,
    branch: 'addiction',
    requirements: ['dopamine_loop']
  },
  {
    id: 'sleep_disruption',
    name: 'Sleep Disruption Algorithm',
    realDescription: 'Optimize notifications to trigger precisely during REM sleep. Tested on 50,000 "volunteers". 3x night growth.',
    benefit: '3x Night-time (22:00-06:00) Growth',
    cost: COSTS.TIER_3,
    duration: DURATIONS.LONG,
    tier: 3,
    branch: 'addiction',
    requirements: ['infinite_scroll']
  },
  {
    id: 'psychological_capture',
    name: 'Full Psychological Capture',
    realDescription: 'The user can no longer distinguish the platform from reality. User churn rate becomes exactly zero.',
    benefit: 'Users never leave (churn reduced to 0)',
    cost: COSTS.TIER_4,
    duration: DURATIONS.LONG * 3, // 3 hours
    tier: 4,
    branch: 'addiction',
    requirements: ['variable_reward', 'sleep_disruption']
  }
];

export const DATA_DIVISION_TREE: ResearchNode[] = [
  {
    id: 'micro_targeting',
    name: 'Micro-Targeting Arrays',
    realDescription: 'Categorize users by their deepest insecurities. Better data means better orbs.',
    benefit: '+20% Data Orbs from all sources',
    cost: COSTS.TIER_1 * 2, // 100k
    duration: DURATIONS.QUICK * 2,
    tier: 1,
    branch: 'data',
    requirements: []
  },
  {
    id: 'psychographic_profiling',
    name: 'Psychographic Profiling',
    realDescription: 'We know them better than they know themselves. Base Orb value increased.',
    benefit: 'Data Market base prices increased by 25%',
    cost: COSTS.TIER_2 * 2, // 1m
    duration: DURATIONS.MEDIUM * 1.5,
    tier: 2,
    branch: 'data',
    requirements: ['micro_targeting']
  },
  {
    id: 'predictive_algorithms',
    name: 'Predictive Algorithms',
    realDescription: 'Predict their next purchase before they even think of it.',
    benefit: 'Advertiser Milestones require 20% less volume',
    cost: COSTS.TIER_3 * 2, // 10m
    duration: DURATIONS.LONG,
    tier: 3,
    branch: 'data',
    requirements: ['psychographic_profiling']
  },
  {
    id: 'synthetic_value',
    name: 'Synthetic Value Theory',
    realDescription: 'Why mine gold when you can mine the users attention? Create a currency backed by nothing but pure dopamine.',
    benefit: 'Unlocks DopaCoin Mining in the Lab',
    cost: COSTS.TIER_3 * 3, // 15m
    duration: DURATIONS.LONG * 1.5,
    tier: 3,
    branch: 'data',
    requirements: ['predictive_algorithms']
  }
];

export const LEGAL_SHIELD_TREE: ResearchNode[] = [
  {
    id: 'lobbying_network',
    name: 'Lobbying Network',
    realDescription: 'A few strategic campaign donations go a long way in Washington.',
    benefit: '-10% Regulatory Heat generated',
    cost: COSTS.TIER_1 * 5, // 250k
    duration: DURATIONS.MEDIUM,
    tier: 1,
    branch: 'legal',
    requirements: []
  },
  {
    id: 'slapp_suit_auto',
    name: 'SLAPP Suit Automation',
    realDescription: 'Drown your critics in automated legal paperwork until they go bankrupt.',
    benefit: 'Auto-dismiss minor lawsuits (50% chance)',
    cost: COSTS.TIER_2 * 4, // 2m
    duration: DURATIONS.LONG,
    tier: 2,
    branch: 'legal',
    requirements: ['lobbying_network']
  },
  {
    id: 'offshore_havens',
    name: 'Offshore Data Havens',
    realDescription: 'When the feds raid the servers, they will only find cat videos. The real data is in international waters.',
    benefit: 'Protects 50% of funds from Federal Raids',
    cost: COSTS.TIER_3 * 5, // 25m
    duration: DURATIONS.LONG * 2,
    tier: 3,
    branch: 'legal',
    requirements: ['slapp_suit_auto']
  },
  {
    id: 'ipo_readiness',
    name: 'IPO Readiness Protocol',
    realDescription: 'Clean the books, bury the bodies, and prepare to sell Dan’s soul to the public market.',
    benefit: 'Unlocks the NASDAQ Stock Ticker',
    cost: COSTS.TIER_4, // 50m
    duration: DURATIONS.LONG * 4,
    tier: 4,
    branch: 'legal',
    requirements: ['offshore_havens']
  }
];

// Master list for easy lookup
export const ALL_RESEARCH_NODES: Record<string, ResearchNode> = [
  ...ADDICTION_SCIENCE_TREE,
  ...DATA_DIVISION_TREE,
  ...LEGAL_SHIELD_TREE
].reduce((acc, node) => {
  acc[node.id] = node;
  return acc;
}, {} as Record<string, ResearchNode>);
