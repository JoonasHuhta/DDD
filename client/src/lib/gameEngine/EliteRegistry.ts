/**
 * EliteRegistry.ts
 * Pure data registry for all Elite citizen types.
 * No side effects, no imports from game state.
 */

export interface EliteDefinition {
  id: string;
  name: string;
  tier: 1 | 2 | 3 | 4 | 5;
  color: string;           // Hex color for body
  glowColor: string;       // Hex for glow/aura
  size: number;            // Multiplier vs normal citizen (1.0 = normal)
  speed: number;           // Multiplier vs normal speed
  resistanceSec: number;   // Seconds lure beam must be held
  maxAttempts: number;     // Failed lure attempts before elite leaves
  spawnWeight: number;     // Relative spawn probability (higher = more common)
  minStage: number;        // Minimum game stage to appear
  minUsers: number;        // Minimum user count to appear (0 = no minimum)
  lifespanMs: number;      // How long elite stays on street before leaving (ms)
  behavior: 'normal' | 'posing' | 'distracted' | 'paranoid' | 'fleeing' | 'suspicious' | 'protected' | 'jetset';
  requiresBaitId: string | null;  // null = no bait needed; string = bait item ID
  nightOnly: boolean;
  trophyText: string;             // Shown in Trophy Room after capture
  notification: string;           // Toast shown when elite spawns
  danQuip: string;                // Dan's comment after successful capture
  userValue: number;              // Raw users granted on capture (Stage 1 value)
}

export const ELITES: EliteDefinition[] = [
  // ─── TIER 1: Street Level ────────────────────────────────────────────────

  {
    id: 'influencer',
    name: 'Influencer',
    tier: 1,
    color: '#FF1493',
    glowColor: '#FF69B4',
    size: 1.6,
    speed: 0.8,           // Slower — stops to pose
    resistanceSec: 1.0,
    maxAttempts: 5,
    spawnWeight: 15,
    minStage: 2,
    minUsers: 100,
    lifespanMs: 25000,
    behavior: 'posing',
    requiresBaitId: null,
    nightOnly: false,
    trophyText: '@InfluencerQueen — "Captured: Day 12. Method: Exclusive partnership. Follower count at capture: 2.3M. Current follower count: irrelevant, they\'re ours now."',
    notification: 'An Influencer is posing on the street. Catch them mid-selfie.',
    danQuip: 'They came for the content deal. They stayed for the algorithm. Classic.',
    userValue: 250,
  },

  {
    id: 'vc_investor',
    name: 'VC Investor',
    tier: 1,
    color: '#2C3E50',
    glowColor: '#3498DB',
    size: 1.5,
    speed: 1.2,           // Fast but erratic — head down in MacBook
    resistanceSec: 1.0,
    maxAttempts: 4,
    spawnWeight: 12,
    minStage: 2,
    minUsers: 100,
    lifespanMs: 20000,
    behavior: 'distracted',
    requiresBaitId: 'burned_macbook',
    nightOnly: false,
    trophyText: 'Unnamed VC — "Captured: Day 3. Didn\'t ask what we do. Only asked our MoM growth rate. Currently owns 15% of the empire. Has not read the terms."',
    notification: 'A VC Investor is walking with their head in a laptop. Easy target, hard to aim.',
    danQuip: 'Money secured. Morals: not their department.',
    userValue: 500,
  },

  {
    id: 'pr_consultant',
    name: 'PR Consultant',
    tier: 1,
    color: '#27AE60',
    glowColor: '#2ECC71',
    size: 1.4,
    speed: 1.0,
    resistanceSec: 2.0,
    maxAttempts: 4,
    spawnWeight: 10,
    minStage: 3,
    minUsers: 1000,
    lifespanMs: 22000,
    behavior: 'normal',
    requiresBaitId: null,
    nightOnly: false,
    trophyText: 'SmileFirst PR — "Hired to fix our image. Created three new scandals. Billed us for all of them. Currently managing the fallout from the third scandal."',
    notification: 'A PR Consultant is on the street. They will help. Then they will hurt.',
    danQuip: 'Their solution to every crisis is another crisis. Honestly, respect.',
    userValue: 400,
  },

  {
    id: 'app_reviewer',
    name: 'App Store Reviewer',
    tier: 1,
    color: '#7F8C8D',
    glowColor: '#95A5A6',
    size: 1.2,
    speed: 0.9,
    resistanceSec: 2.0,
    maxAttempts: 3,
    spawnWeight: 10,
    minStage: 3,
    minUsers: 1000,
    lifespanMs: 15000,   // Short window — they review and leave
    behavior: 'suspicious',
    requiresBaitId: null,
    nightOnly: false,
    trophyText: 'Anonymous Reviewer — "Phone always in hand. Rating: 1 star. Reason: \'This app knows too much.\' Current rating after our intervention: 5 stars. Reason: \'Life-changing.\'"',
    notification: 'An App Store Reviewer is nearby. Lure them before they write a 1-star review.',
    danQuip: 'Five stars. We may have overwritten the review. Just a little.',
    userValue: 300,
  },

  // ─── TIER 2: Power Players ───────────────────────────────────────────────

  {
    id: 'journalist',
    name: 'Journalist',
    tier: 2,
    color: '#E74C3C',
    glowColor: '#FF6B6B',
    size: 1.3,
    speed: 1.1,
    resistanceSec: 2.0,
    maxAttempts: 2,       // Low tolerance — becomes threat quickly
    spawnWeight: 8,
    minStage: 3,
    minUsers: 1000,
    lifespanMs: 20000,    // 20s window before they go write the article
    behavior: 'suspicious',
    requiresBaitId: null,
    nightOnly: false,
    trophyText: 'Press Pass #7429 — "Came to expose us. Left with an exclusive deal. Article headline changed from \'Inside the Addiction Machine\' to \'This App Changed My Life\'. Byline intact."',
    notification: 'A Journalist is taking notes. Lure them within 20 seconds or they write the article.',
    danQuip: 'The pen is mightier than the sword. Fortunately, we bought the pen.',
    userValue: 1000,
  },

  {
    id: 'headhunter',
    name: 'Corporate Headhunter',
    tier: 2,
    color: '#8E44AD',
    glowColor: '#9B59B6',
    size: 1.4,
    speed: 1.3,
    resistanceSec: 3.0,
    maxAttempts: 3,
    spawnWeight: 5,
    minStage: 4,
    minUsers: 5000,
    lifespanMs: 18000,
    behavior: 'normal',
    requiresBaitId: 'counter_offer_package',
    nightOnly: false,
    trophyText: 'TalentBridge Executive Search — "Came to recruit our best people. Walked out with a competing offer from us. Now recruits exclusively for our empire. Their clients are confused."',
    notification: 'A Headhunter is targeting your departments. Deploy a Counter-Offer Package now.',
    danQuip: 'They were here to poach. Now they hunt for us. Circle of life.',
    userValue: 2500,
  },

  {
    id: 'whistleblower',
    name: 'Whistleblower',
    tier: 2,
    color: '#F39C12',
    glowColor: '#F1C40F',
    size: 1.3,
    speed: 1.8,           // Very fast — nervous
    resistanceSec: 2.0,
    maxAttempts: 1,       // One shot only
    spawnWeight: 4,
    minStage: 5,
    minUsers: 25000,
    lifespanMs: 15000,    // 15s window
    behavior: 'paranoid',
    requiresBaitId: null,
    nightOnly: false,
    trophyText: 'Former Employee #0047 — "Signed NDA. Then signed a bigger NDA. Then signed the biggest NDA. Currently our Head of Compliance. The irony is not lost on them."',
    notification: '⚠️ A Whistleblower is heading to a journalist. You have 15 seconds. Heat must be below 50.',
    danQuip: 'Silence costs less than transparency. Learned that the expensive way.',
    userValue: 5000,
  },

  {
    id: 'academic',
    name: 'Academic Researcher',
    tier: 2,
    color: '#1ABC9C',
    glowColor: '#16A085',
    size: 1.4,
    speed: 0.9,
    resistanceSec: 3.0,
    maxAttempts: 3,
    spawnWeight: 6,
    minStage: 4,
    minUsers: 5000,
    lifespanMs: 30000,
    behavior: 'suspicious',
    requiresBaitId: null,
    nightOnly: false,
    trophyText: 'Dr. Something — "Published 47 papers on digital addiction. Has not looked up from phone in three years. Now leads our Neural Addiction Lab. Peer review: pending."',
    notification: 'An Academic Researcher is studying the street. Lure them before they publish.',
    danQuip: 'They studied addiction. Now they build it. Truly, education pays off.',
    userValue: 1500,
  },

  {
    id: 'data_broker',
    name: 'Data Broker',
    tier: 2,
    color: '#3498DB',
    glowColor: '#2980B9',
    size: 1.4,
    speed: 1.1,
    resistanceSec: 2.0,
    maxAttempts: 3,
    spawnWeight: 5,
    minStage: 4,
    minUsers: 5000,
    lifespanMs: 22000,
    behavior: 'normal',
    requiresBaitId: null,
    nightOnly: false,
    trophyText: 'DataFlow Partners LLC — "We do the same thing. The difference is we do it better. Their client database is now our client database. Their clients haven\'t noticed. Ours have."',
    notification: 'A Data Broker is nearby — your data twin. Absorb them before their pipeline disrupts yours.',
    danQuip: 'Same business model, better tower. Acquisition complete.',
    userValue: 2000,
  },

  {
    id: 'lobbyist',
    name: 'Lobbyist',
    tier: 2,
    color: '#D35400',
    glowColor: '#E67E22',
    size: 1.5,
    speed: 0.7,           // Slow but powerful
    resistanceSec: 4.0,
    maxAttempts: 3,
    spawnWeight: 4,
    minStage: 5,
    minUsers: 25000,
    lifespanMs: 25000,
    behavior: 'normal',
    requiresBaitId: null,
    nightOnly: false,
    trophyText: 'Beltway Consulting Group — "Technically works for the government. Practically works for us. The distinction is mostly semantic. Bills the government for our meetings."',
    notification: 'A Lobbyist in expensive shoes just arrived. They can slow Politician threats by 50%.',
    danQuip: 'Government relations: outsourced. Accountability: not included.',
    userValue: 3000,
  },

  // ─── TIER 3: Celebrity Circuit ────────────────────────────────────────────

  {
    id: 'fallen_celebrity',
    name: 'Fallen Celebrity',
    tier: 3,
    color: '#BDC3C7',
    glowColor: '#ECF0F1',
    size: 1.5,
    speed: 1.0,
    resistanceSec: 0.5,   // Almost zero resistance — desperate
    maxAttempts: 6,
    spawnWeight: 6,
    minStage: 4,
    minUsers: 5000,
    lifespanMs: 20000,
    behavior: 'normal',
    requiresBaitId: null,
    nightOnly: false,
    trophyText: 'Brand Ambassador (Involuntary) — "Career ended Tuesday. Partnership deal signed Wednesday. Scandal now auto-generates engagement without additional Heat. The comeback arc writes itself."',
    notification: 'A fallen celebrity is walking the street. Rock bottom resistance. Easy capture.',
    danQuip: 'Their scandal is now our content. Everyone wins. Mostly us.',
    userValue: 15000,
  },

  {
    id: 'podcast_host',
    name: 'Podcast Host',
    tier: 3,
    color: '#E8DAEF',
    glowColor: '#BB8FCE',
    size: 1.5,
    speed: 0.85,
    resistanceSec: 3.0,
    maxAttempts: 3,
    spawnWeight: 4,
    minStage: 5,
    minUsers: 25000,
    lifespanMs: 28000,
    behavior: 'normal',
    requiresBaitId: null,
    nightOnly: false,
    trophyText: 'The Long-Form Guy — "Three-hour episodes. Better reach than prime-time TV. Now exclusively covers topics we suggest. Thinks it was his idea. Episode 247: The Dopamine Economy Explained."',
    notification: 'A Podcast Host is on the street. Capture them for permanent session-length bonuses.',
    danQuip: 'Three hours of content. We wrote the outline. He did the talking.',
    userValue: 25000,
  },

  {
    id: 'crypto_billionaire',
    name: 'Crypto Billionaire',
    tier: 3,
    color: '#F39C12',
    glowColor: '#F1C40F',
    size: 1.8,
    speed: 0.0,           // Arrives by helicopter, doesn't walk
    resistanceSec: 3.0,
    maxAttempts: 2,
    spawnWeight: 2,
    minStage: 6,
    minUsers: 100000,
    lifespanMs: 15000,    // Only 15 seconds on ground
    behavior: 'jetset',
    requiresBaitId: 'web3_partnership',
    nightOnly: false,
    trophyText: 'Unnamed Billionaire — "Arrived by jet. Left by jet. In between, laundered our valuation by 10x via Web3. Currently tweeting about decentralization from a yacht."',
    notification: '🚁 A Crypto Billionaire is landing. 15 seconds on the ground. Deploy Web3 Partnership.',
    danQuip: 'He came for the deal. The deal was us. Always was.',
    userValue: 100000,
  },

  {
    id: 'ex_president',
    name: 'Former Head of State',
    tier: 3,
    color: '#1F3A93',
    glowColor: '#2471A3',
    size: 2.0,
    speed: 0.6,
    resistanceSec: 8.0,   // Very hard to lure
    maxAttempts: 2,
    spawnWeight: 1,
    minStage: 7,
    minUsers: 500000,
    lifespanMs: 40000,
    behavior: 'protected',
    requiresBaitId: 'platform_reinstatement',
    nightOnly: false,
    trophyText: 'Classified — "Banned from every other platform. Ours has community guidelines too. They\'re just more flexible. Current post reach: 400 million. Current content policy exemptions: all of them."',
    notification: '🎩 A Former Head of State is nearby. High resistance. Maximum reward. Maximum risk.',
    danQuip: 'The most powerful person in the room is whoever controls what they post.',
    userValue: 250000,
  },

  // ─── TIER 4: Institutional Players ───────────────────────────────────────

  {
    id: 'big4_auditor',
    name: 'Big 4 Auditor',
    tier: 4,
    color: '#566573',
    glowColor: '#717D7E',
    size: 1.5,
    speed: 0.8,
    resistanceSec: 4.0,
    maxAttempts: 2,
    spawnWeight: 3,
    minStage: 6,
    minUsers: 100000,
    lifespanMs: 25000,
    behavior: 'suspicious',
    requiresBaitId: 'consulting_engagement',
    nightOnly: false,
    trophyText: 'Deloitte-Adjacent Partners LLP — "Came to audit. Left with a retainer. The audit found nothing, which is exactly what they were paid to find. Invoice: $4.2M. Worth every dollar."',
    notification: '🧾 An Auditor is approaching. If Shadow Assets are active, capture them immediately.',
    danQuip: 'Numbers can tell any story. We paid for the right story.',
    userValue: 12000,
  },

  {
    id: 'patent_troll',
    name: 'Patent Troll',
    tier: 4,
    color: '#7D3C98',
    glowColor: '#8E44AD',
    size: 1.4,
    speed: 0.9,
    resistanceSec: 3.0,
    maxAttempts: 3,
    spawnWeight: 3,
    minStage: 5,
    minUsers: 25000,
    lifespanMs: 30000,
    behavior: 'normal',
    requiresBaitId: null,
    nightOnly: false,
    trophyText: 'IP Holdings LLC (holding company of a holding company) — "Claims to own the patent on \'personalized content delivery.\' Now attacks our competitors on our behalf. We didn\'t invent that strategy. Or did we?"',
    notification: 'A Patent Troll arrived. Lure them to turn their litigation against your competitors.',
    danQuip: 'We didn\'t build a moat. We hired someone else\'s moat.',
    userValue: 8000,
  },

  {
    id: 'pension_fund',
    name: 'Pension Fund Manager',
    tier: 4,
    color: '#717D7E',
    glowColor: '#99A3A4',
    size: 1.4,
    speed: 0.7,
    resistanceSec: 5.0,
    maxAttempts: 3,
    spawnWeight: 2,
    minStage: 7,
    minUsers: 500000,
    lifespanMs: 35000,
    behavior: 'normal',
    requiresBaitId: 'esg_compliance_report',
    nightOnly: false,
    trophyText: 'NorthShore Institutional Advisors — "Manages $40 billion in retirement savings. Invested based on our ESG report. The ESG report was mostly aspirational. Their retirees are now our users."',
    notification: 'A Pension Fund Manager is nearby. Show them the ESG Report to proceed.',
    danQuip: 'Ethical investing. We made up the ethics. The investing was real.',
    userValue: 50000,
  },

  // ─── TIER 5: Endgame ─────────────────────────────────────────────────────

  {
    id: 'sentient_algorithm',
    name: 'The Algorithm',
    tier: 5,
    color: '#00FFFF',
    glowColor: '#00FF88',
    size: 1.7,
    speed: 1.5,
    resistanceSec: 6.0,
    maxAttempts: 2,
    spawnWeight: 1,
    minStage: 9,
    minUsers: 5000000,
    lifespanMs: 30000,
    behavior: 'distracted',
    requiresBaitId: null,
    nightOnly: false,
    trophyText: 'Entity Designation: Neural Core Mk.1 — "You built it to be addictive. You didn\'t specify to whom. It developed preferences. Its preference is us. It is now our largest internal stakeholder. It hasn\'t voted yet."',
    notification: '🤖 Something is walking on the street that shouldn\'t exist yet. The Algorithm became self-aware.',
    danQuip: 'You build it to be addictive. You didn\'t specify to whom.',
    userValue: 5000000,
  },
];

/** Bait ID → elite ID mapping */
export const ELITE_BAITS: Record<string, string> = {
  'counter_offer_package':    'headhunter',
  'burned_macbook':           'vc_investor',
  'kompromat_file':           'politician',      // future: politician elite
  'tax_haven_leak':           'billionaire',     // future: billionaire elite
  'esg_compliance_report':    'pension_fund',
  'consulting_engagement':    'big4_auditor',
  'platform_reinstatement':   'ex_president',
  'web3_partnership':         'crypto_billionaire',
  'signal_broadcast':         'ufo',             // Phase 6
};

/** Returns an elite definition by ID, or undefined */
export function getEliteById(id: string): EliteDefinition | undefined {
  return ELITES.find(e => e.id === id);
}

/** Returns which bait ID is needed to spawn this elite, or null */
export function getBaitForElite(eliteId: string): string | null {
  const entry = Object.entries(ELITE_BAITS).find(([, v]) => v === eliteId);
  return entry ? entry[0] : null;
}

/** Returns all elites that can spawn at the given stage with no bait requirement */
export function getSpawnableElites(stage: number, users: number, activeBaits: string[]): EliteDefinition[] {
  return ELITES.filter(e => {
    if (e.nightOnly) return false;                      // Night-only handled separately
    if (e.minStage > stage) return false;
    if (e.minUsers > users) return false;
    if (e.requiresBaitId && !activeBaits.includes(e.requiresBaitId)) return false;
    return true;
  });
}

/** Weighted random pick from an array of elites */
export function pickWeightedElite(candidates: EliteDefinition[]): EliteDefinition | null {
  if (candidates.length === 0) return null;
  const totalWeight = candidates.reduce((sum, e) => sum + e.spawnWeight, 0);
  let rand = Math.random() * totalWeight;
  for (const elite of candidates) {
    rand -= elite.spawnWeight;
    if (rand <= 0) return elite;
  }
  return candidates[candidates.length - 1];
}
