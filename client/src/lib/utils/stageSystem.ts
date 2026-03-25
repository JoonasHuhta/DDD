/**
 * Stage System – Pure functions, no side effects.
 * Stage is auto-calculated from current users count.
 * All content gating uses these helpers.
 */

export interface StageInfo {
  stage: number;
  name: string;
  description: string;
  userThreshold: number; // users needed to reach this stage
  nextThreshold: number; // users needed for next stage
}

export const STAGES: StageInfo[] = [
  { stage: 1, name: 'Bootstrap',        description: 'Starting from zero',             userThreshold: 0,         nextThreshold: 100 },
  { stage: 2, name: 'Street Hustle',    description: 'Word is spreading',              userThreshold: 100,       nextThreshold: 1_000 },
  { stage: 3, name: 'Going Viral',      description: 'First taste of fame',            userThreshold: 1_000,     nextThreshold: 5_000 },
  { stage: 4, name: 'Media Attention',  description: 'People are watching',            userThreshold: 5_000,     nextThreshold: 25_000 },
  { stage: 5, name: 'Scandal Era',      description: 'The heat is on',                 userThreshold: 25_000,    nextThreshold: 100_000 },
  { stage: 6, name: 'Dominance',        description: 'You own the narrative',          userThreshold: 100_000,   nextThreshold: 500_000 },
  { stage: 7, name: 'National Monopoly',description: 'The regulators notice',          userThreshold: 500_000,   nextThreshold: 1_000_000 },
  { stage: 8, name: 'Global Markets',   description: 'World domination begins',        userThreshold: 1_000_000, nextThreshold: 5_000_000 },
  { stage: 9, name: 'Mega Platform Wars',description: 'Taking down the giants',        userThreshold: 5_000_000, nextThreshold: 10_000_000 },
  { stage: 10, name: 'Deus Ex Platform',description: 'You are the system',             userThreshold: 10_000_000, nextThreshold: Infinity },
];

/** Returns the current stage number (1-10) based on user count. */
export function getStage(users: number): number {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (users >= STAGES[i].userThreshold) return STAGES[i].stage;
  }
  return 1;
}

/** Returns full StageInfo for the current stage. */
export function getStageInfo(users: number): StageInfo {
  const stage = getStage(users);
  return STAGES[stage - 1];
}

/** Returns info about the next stage, or null if at max. */
export function getNextStage(users: number): StageInfo | null {
  const currentStage = getStage(users);
  if (currentStage >= STAGES.length) return null;
  return STAGES[currentStage]; // stage is 1-indexed, so index 'currentStage' is the next one
}

/** Returns progress (0–1) within the current stage. */
export function getStageProgress(users: number): number {
  const info = getStageInfo(users);
  if (info.nextThreshold === Infinity) return 1;
  const range = info.nextThreshold - info.userThreshold;
  const progress = users - info.userThreshold;
  return Math.max(0, Math.min(1, progress / range));
}

/** Departments unlock threshold per stage. */
export const DEPARTMENT_STAGE_UNLOCKS: Record<string, number> = {
  'corner_operations':            1,
  'supply_networks':              1,
  'customer_relations':           2,
  'algorithm_centers':            2,
  'data_miners':                  3,
  'user_farms':                   3,
  'influencer_networks':          4,
  'neural_networks':              5,
  'global_server_farms':          5,
  'government_relations':         6,
  'reality_distortion_centers':   6,
  'consciousness_harvesters':     10, // Deus Ex stage only
};

/** Campaigns unlock by stage. Maps campaign ID → required stage. */
export const CAMPAIGN_STAGE_UNLOCKS: Record<string, number> = {
  // Stage 1–2
  'free_samples':              1,
  'happy_hour_special':        1,
  'social_feed':               2,
  'pure_bliss_guarantee':      2,
  // Stage 3–4
  'viral_challenge':           3,
  'experimental_formula':      3,
  'addiction_algorithm':       3,
  'infinite_scroll_trap':      4,
  // Stage 5–6
  'underage_targeting':        5,
  'viral_challenge_injection': 5,
  'algorithm_chaos_bomb':      6,
  // Stage 7–10
  'reality_hack_protocol':     7,
  'the_perfect_storm':         8,
};
