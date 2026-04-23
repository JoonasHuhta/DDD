export type TickerType = 'news' | 'dan' | 'market' | 'meta' | 'legendary';

export interface TickerMessage {
  text: string;
  type: TickerType;
  minStage?: number;
  maxStage?: number;
  minHeat?: number;
  isIdle?: boolean;
  weight?: number;
}

export interface TickerCombo {
  lead: string;
  followup: string;
}

export const ALL_TICKER_MESSAGES: TickerMessage[] = [
  { text: "We're Building Something Meaningful", type: 'news', minStage: 1, maxStage: 2 },
  { text: "Investors Call Platform 'Promising'; Dan Takes That Personally", type: 'news', minStage: 1, maxStage: 2 },
  { text: "BREAKING: Platform Reports Record Engagement; Users Report Record Unhappiness", type: 'news', minStage: 3, maxStage: 5 },
  { text: "Study: 94% Of Users Say App Makes Life Worse. We Call This 'Success Metrics'", type: 'news', minStage: 3, maxStage: 5 },
  { text: "Internal Memo: 'If They Notice, Call It A Feature'", type: 'news', minStage: 3, maxStage: 5 },
  { text: "Company Solves Burnout By Removing Word 'Burnout' From Internal Docs", type: 'news', minStage: 4, maxStage: 6 },
  { text: "New Terms Of Service: By Breathing, You Agree To Data Collection", type: 'news', minStage: 4, maxStage: 6 },
  { text: "Whistleblower Claims Algorithm Addictive; Algorithm Denies Ever Meeting Whistleblower", type: 'news', minStage: 5, maxStage: 7 },
  { text: "Algorithm Begins Predicting User Thoughts; Engagement Up 300%", type: 'news', minStage: 6, maxStage: 8 },
  { text: "Company Acquires Sleep; Plans Monetization Strategy Q4", type: 'news', minStage: 7, maxStage: 9 },
  { text: "Users Attempt To Log Off; System Logs Them Back In For Their Safety", type: 'news', minStage: 8, maxStage: 10 },
  { text: "BREAKING: Platform Is Now Critical Infrastructure", type: 'news', minStage: 10 },

  { text: "Dan: 'Every empire starts with zero users. And mild delusion.'", type: 'dan', minStage: 1, maxStage: 3 },
  { text: "Dan: 'We just need one breakthrough. Or a scandal. Whichever scales faster.'", type: 'dan', minStage: 1, maxStage: 3 },
  { text: "Dan: 'We're growing. Slowly. But so did mold, and look how well that worked out.'", type: 'dan', minStage: 1, maxStage: 4 },
  { text: "Dan: 'We don't have a PR crisis. We have a narrative opportunity.'", type: 'dan', minHeat: 70 },
  { text: "Dan: 'If regulators are watching, that's just more engagement.'", type: 'dan', minHeat: 70 },
  { text: "Dan: 'Heat is just another KPI. And we're absolutely crushing it.'", type: 'dan', minHeat: 70 },
  { text: "Dan: 'We are no longer a company. We are... infrastructure.'", type: 'dan', minStage: 6 },
  { text: "Dan: 'If people can't leave, that's not addiction. That's retention.'", type: 'dan', minStage: 6 },
  { text: "Dan: 'Ethics don't scale. Growth does.'", type: 'dan', minStage: 7 },
  { text: "Dan: 'At this point, even I don't know what the algorithm does. That's how you know it's working.'", type: 'dan', minStage: 8 },
  { text: "Dan: 'We didn't build an empire. We built a lifestyle. The empire was a bonus.'", type: 'dan', minStage: 8 },
  { text: "Dan: 'Reality is just another market vertical with weak competition.'", type: 'dan', minStage: 10 },

  { text: "DOPA ▲ 12% — Reason: 'Vibes'", type: 'market' },
  { text: "DOPA ▼ 8% — Analysts Concerned About 'Ethics Situation' (Ignored)", type: 'market' },
  { text: "DOPA ▲ 45% — Users Angry, Engagement Spiking", type: 'market', minStage: 4 },
  { text: "DOPA ▼ 2% — CEO Tweeted At 3AM Again", type: 'market' },
  { text: "DOPA ▲ 0% — Market Unsure If Company Is Real", type: 'market', maxStage: 3 },
  { text: "DOPA ▲ ??? — Trading Halted Due To 'Existential Uncertainty'", type: 'market', minStage: 8 },

  { text: "Dan: 'You know this is a game, right? The users don't.'", type: 'meta', weight: 0.2 },
  { text: "Dan: 'You're optimizing numbers. I'm optimizing you.'", type: 'meta', weight: 0.2 },
  { text: "Dan: 'If you stop playing, do we stop existing?'", type: 'meta', weight: 0.2 },
  { text: "Dan: 'Careful. You're starting to understand the system.'", type: 'meta', weight: 0.2 },

  { text: 'SYSTEM: You were not supposed to see this.', type: 'legendary', weight: 0.05 },
  { text: "Dan: 'They're watching you play this. Not me. You.'", type: 'legendary', weight: 0.05 },
  { text: 'ERROR: USER = PRODUCT', type: 'legendary', weight: 0.05 },
  { text: 'We tried to simulate an ethical version. It did not scale.', type: 'legendary', weight: 0.05 },

  { text: "Dan: 'Are you... taking a break? Your users aren't. Just saying.'", type: 'dan', isIdle: true },
  { text: "Dan: 'The algorithm never sleeps. Neither should you, frankly.'", type: 'dan', isIdle: true },
  { text: "Dan: 'You're not clicking. The market can feel that.'", type: 'dan', isIdle: true },
  { text: 'DOPA ▼ 5% — CEO Appears To Be AFK', type: 'market', isIdle: true },
];

export const TICKER_COMBOS: TickerCombo[] = [
  {
    lead: 'BREAKING: Whistleblower Leaks Internal Documents —',
    followup: "Dan: 'We prefer the term: unplanned transparency.'",
  },
  {
    lead: 'Users Demand Privacy Protections —',
    followup: "Dan: 'We hear you. We're tracking that concern.'",
  },
  {
    lead: 'Senate Calls Emergency Hearing —',
    followup: "Dan: 'Can't make it. Earnings call that week. Sorry, democracy.'",
  },
  {
    lead: 'Regulators Request Platform Accountability —',
    followup: "Dan: 'We already hold ourselves accountable. Internally. In private.'",
  },
];

export function getTickerMessages(stage: number, heat: number, isIdle: boolean): TickerMessage[] {
  return ALL_TICKER_MESSAGES.filter((message) => {
    if (message.minStage !== undefined && stage < message.minStage) {
      return false;
    }

    if (message.maxStage !== undefined && stage > message.maxStage) {
      return false;
    }

    if (message.minHeat !== undefined && heat < message.minHeat) {
      return false;
    }

    if (message.isIdle && !isIdle) {
      return false;
    }

    return true;
  });
}
