// ─────────────────────────────────────────────────────────────────────────────
// DOMINANCE EVENT POOL
// Events interrupt. They don't dominate.
// Max 1 active event at a time. 90–120s cooldown between events.
// Every event has an Ignore option with a small penalty.
// ─────────────────────────────────────────────────────────────────────────────

export type EventChoiceEffect = {
  heatDelta?: number;           // +/- heat
  incomeMult?: number;          // temporary income multiplier (e.g. 0.8 = -20%)
  incomeMultDuration?: number;  // ms, default 120_000 (2 min)
  rivalInfluenceDelta?: number; // +/- rival% in this country
  stageDelta?: number;          // +/- stage (usually -1 on ignore)
  stageDropChance?: number;     // 0–1 probability of stageDelta applying
  unlockBuilding?: string;      // building id to unlock for free
  moneyDelta?: number;          // flat money cost (negative = pay)
  futureBiggerEvent?: boolean;  // flag for chain events
  freezeBuildings?: boolean;    // freeze building income for 5 min
  globalRivalBlock?: boolean;   // placeholder for future rival reset
};

export type EventChoice = {
  label: string;
  description: string;
  effect: EventChoiceEffect;
};

export type DominanceEvent = {
  id: string;
  title: string;
  description: string;
  /** Which country this event belongs to. undefined = any country */
  countryTag?: string;
  /** Minimum stage required to trigger */
  minStage: number;
  /** 0–1 base probability per tick when conditions met */
  baseProbability: number;
  choices: EventChoice[];
};

// ─── EVENT POOL ──────────────────────────────────────────────────────────────

export const DOMINANCE_EVENTS: DominanceEvent[] = [
  // ── GLOBAL EVENTS ────────────────────────────────────────────────────────

  {
    id: 'public_concern_rising',
    title: 'Public Concern Rising',
    description:
      'Users are starting to question how much time they spend on your platform. Engagement remains high. Trust is... fluctuating.',
    minStage: 3,
    baseProbability: 0.003,
    choices: [
      {
        label: 'Reassure Users',
        description: 'Release a transparent report. Very soothing. Partially true.',
        effect: { heatDelta: -10, incomeMult: 0.9, incomeMultDuration: 120_000 },
      },
      {
        label: 'Optimize Engagement',
        description: 'Make the scroll faster. The numbers will speak for themselves.',
        effect: { heatDelta: 5, incomeMult: 1.15, incomeMultDuration: 120_000 },
      },
      {
        label: 'Ignore',
        description: 'What concern? The metrics disagree.',
        effect: { stageDropChance: 0.3, stageDelta: -1 },
      },
    ],
  },

  {
    id: 'investigative_report',
    title: 'Investigative Report',
    description:
      'A journalist has published a deep dive into your data practices. It\'s getting traction. The headline is unflattering.',
    minStage: 3,
    baseProbability: 0.002,
    choices: [
      {
        label: 'Discredit Source',
        description: 'Question their funding. Plant a counter-narrative.',
        effect: { heatDelta: 15, rivalInfluenceDelta: -10 },
      },
      {
        label: 'Comply Publicly',
        description: 'Announce a "Data Ethics Audit". Hire someone to write it.',
        effect: { incomeMult: 0.85, incomeMultDuration: 120_000, heatDelta: -10 },
      },
      {
        label: 'Ignore',
        description: 'News cycles are short. Probably.',
        effect: { stageDropChance: 0.2, stageDelta: -1 },
      },
    ],
  },

  {
    id: 'user_burnout_spike',
    title: 'User Burnout Spike',
    description:
      'Daily active users remain high, but session fatigue is increasing. People keep putting the phone down and picking it back up. Out of habit.',
    minStage: 2,
    baseProbability: 0.002,
    choices: [
      {
        label: 'Introduce Break Reminders',
        description: '"We care about your wellbeing." (Data collection continues)',
        effect: { incomeMult: 0.9, incomeMultDuration: 90_000, heatDelta: -5 },
      },
      {
        label: 'Remove Friction',
        description: 'Autoplay. Infinite scroll. Remove the clock.',
        effect: { heatDelta: 10, incomeMult: 1.2, incomeMultDuration: 90_000 },
      },
      {
        label: 'Ignore',
        description: 'Burnout is a user problem.',
        effect: { stageDropChance: 0.15, stageDelta: -1 },
      },
    ],
  },

  // ── EU SPECIFIC ──────────────────────────────────────────────────────────

  {
    id: 'muller_opens_inquiry',
    title: 'Commissioner Müller Opens Inquiry',
    description:
      '"We are not convinced your platform aligns with European values." Müller has opened a formal inquiry. 847-page questionnaire attached.',
    countryTag: 'eu',
    minStage: 3,
    baseProbability: 0.004,
    choices: [
      {
        label: 'Pay the Fine',
        description: 'Settle quietly. Issue a brief apology. Move on.',
        effect: { moneyDelta: -50000, heatDelta: -20 },
      },
      {
        label: 'Deploy GDPR Laundry',
        description: 'Build the compliance office to handle regulatory "rerouting".',
        effect: { unlockBuilding: 'gdpr_laundry', heatDelta: -10 },
      },
      {
        label: 'Delay the Process',
        description: 'Request more time. File counter-documentation. Repeat.',
        effect: { futureBiggerEvent: true },
      },
    ],
  },

  // ── FINLAND SPECIFIC ─────────────────────────────────────────────────────

  {
    id: 'sauna_algorithm_leak',
    title: 'Sauna Algorithm Leak',
    description:
      'Internal documents suggest your recommendation system is "emotionally manipulative". A Finnish newspaper says so. With footnotes.',
    countryTag: 'fi',
    minStage: 2,
    baseProbability: 0.003,
    choices: [
      {
        label: 'Call it Personalization',
        description: '"It learns what you love." Technically accurate.',
        effect: { heatDelta: -5 },
      },
      {
        label: 'Blame Beta Testing',
        description: '"That feature is no longer active." (It is.)',
        effect: { heatDelta: 0, rivalInfluenceDelta: -5 },
      },
      {
        label: 'Silence Discussion',
        description: 'Remove the commenting features. Temporarily.',
        effect: { heatDelta: 10, rivalInfluenceDelta: -5 },
      },
    ],
  },

  // ── RIVAL EVENTS ─────────────────────────────────────────────────────────

  {
    id: 'rivalcorp_surge',
    title: 'RivalCorp Launches Free Campaign',
    description:
      'RivalCorp has entered this market with a "free forever" offer. Local adoption is accelerating. Their terms of service are 300 pages and available only in Mandarin.',
    minStage: 0,
    baseProbability: 0, // Triggered programmatically when rivalInfluence > 40
    choices: [
      {
        label: 'Counter Campaign',
        description: 'Match their offer. Make it 10% better. Lose money. Win presence.',
        effect: { moneyDelta: -25000, rivalInfluenceDelta: -20 },
      },
      {
        label: 'Acquire Rival',
        description: 'Just buy them. Antitrust regulators will have questions.',
        effect: { moneyDelta: -500000, heatDelta: 30, rivalInfluenceDelta: -100 },
      },
      {
        label: 'Ignore',
        description: 'Let them have this one. For now.',
        effect: { rivalInfluenceDelta: 25 },
      },
    ],
  },

  // ── ENDGAME (no choices, triggered automatically) ────────────────────────

  {
    id: 'exit_impossible',
    title: 'Exit Attempt Detected',
    description: 'exit_impossible', // Special marker – UI handles this as a cutscene
    minStage: 5,
    baseProbability: 0, // Triggered programmatically when stage 5 held 30+ min
    choices: [], // No choices. That's the point.
  },
];

// ─── LOOKUP HELPERS ──────────────────────────────────────────────────────────

export function getEventById(id: string): DominanceEvent | undefined {
  return DOMINANCE_EVENTS.find(e => e.id === id);
}

/** Returns eligible events for a given country + stage.
 *  Does NOT include rival/endgame events (triggered programmatically). */
export function getEligibleEvents(countryId: string, stage: number): DominanceEvent[] {
  return DOMINANCE_EVENTS.filter(e => {
    if (e.id === 'rivalcorp_surge' || e.id === 'exit_impossible') return false;
    if (e.countryTag && e.countryTag !== countryId) return false;
    if (stage < e.minStage) return false;
    return true;
  });
}
