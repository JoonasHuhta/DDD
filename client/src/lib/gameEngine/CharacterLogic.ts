/**
 * CharacterLogic.ts
 * Definitions for character personalities, dialogue and trigger conditions.
 */
import { getStage } from "../utils/stageSystem";

export interface DialogueNode {
  id: string;
  text: string;
  options?: DialogueOption[];
}

export interface DialogueOption {
  text: string;
  nextId: string | null;
  action?: (state: any) => void;
}

export interface Character {
  id: string;
  name: string;
  title: string;
  portrait: string;
  color: string;
  description: string;
}

export const CHARACTERS: Record<string, Character> = {
  walsh: {
    id: 'walsh',
    name: 'Senator Walsh',
    title: 'Senate Judiciary Committee',
    portrait: '👨‍💼',
    color: 'text-red-600',
    description: 'A fierce critic of big tech and "digital dopamine".'
  },
  whistleblower: {
    id: 'whistleblower',
    name: 'Whistleblower',
    title: 'Ex-Employee #402',
    portrait: '👤',
    color: 'text-cyan-400',
    description: 'Someone who knows too much about the algorithm.'
  },
  dan: {
    id: 'dan',
    name: 'Dopamine Dealer Dan',
    title: 'C.E.O. & Visionary',
    portrait: '🕶️',
    color: 'text-yellow-500',
    description: 'The man himself. Optimization at any cost.'
  }
};

export const DIALOGUE_NODES: Record<string, DialogueNode> = {
  // WALSH INTRO (Triggered by high Heat)
  walsh_intro_1: {
    id: 'walsh_intro_1',
    text: "Mr. Dan, or should I say... the 'Dopamine Dealer'. My office has been receiving some disturbing reports about your latest update.",
    options: [
      { text: "It's just personalization, Senator.", nextId: 'walsh_intro_2' },
      { text: "Innovation requires some... side effects.", nextId: 'walsh_intro_low_sus' }
    ]
  },
  walsh_intro_2: {
    id: 'walsh_intro_2',
    text: "Personalization? You're harvesting biometric markers from toddlers! My committee will be watching your IPO very closely.",
    options: [
      { text: "We follow all regulations.", nextId: 'walsh_hearing_trigger' }
    ]
  },
  walsh_intro_low_sus: {
    id: 'walsh_intro_low_sus',
    text: "Side effects like a 400% increase in screen time for primary schoolers? You have quite a talent for euphemism, Mr. Dan.",
    options: [
      { text: "The users love it.", nextId: 'walsh_hearing_trigger' }
    ]
  },
  walsh_hearing_trigger: {
    id: 'walsh_hearing_trigger',
    text: "My committee is ready for you, Mr. Dan. See you in Room 216. Don't be late.",
    options: [
      { 
        text: "I'll be there. (Start Hearing)", 
        nextId: null, 
        action: (state) => {
          state.setShowSenateHearing(true);
        }
      }
    ]
  },

  // WHISTLEBLOWER CONTACT
  whistleblower_1: {
    id: 'whistleblower_1',
    text: "I saw what the 'Luring Lab' is doing. The shadow profiles... it's not what I signed up for. I'm going to the press unless you compensate me.",
    options: [
      { text: "Pay for silence ($1M)", nextId: 'whistleblower_paid', action: (state) => {
        state.income -= 1000000;
      }},
      { text: "Ignore the threat", nextId: 'whistleblower_ignored' }
    ]
  },
  whistleblower_paid: {
    id: 'whistleblower_paid',
    text: "Fine. I'll keep quiet for now. But the audit is coming sooner than you think.",
    options: [{ text: "End contact", nextId: null }]
  },
  whistleblower_ignored: {
    id: 'whistleblower_ignored',
    text: "Big mistake. People need to know the truth behind the 'Dopa Tower'.",
    options: [{ text: "Connection lost...", nextId: null }]
  }
};

export class CharacterLogic {
  /**
   * Checks if any character event should trigger.
   */
  public static checkTriggers(state: any): string | null {
    // CRITICAL: Block character events during active crisis or if dialogue is already open
    if (state.lawsuitState.isCrisisActive || state.showCharacterDialogue) return null;

    // Trigger Walsh if Heat is very high and we are established (Stage 3+)
    const stage = getStage(state.users);
    if (stage >= 3 && state.regulatoryRisk > 85 && !state.characters.walsh.flags.includes('met_walsh')) {
      return 'walsh_intro_1';
    }

    // Trigger Whistleblower randomly if user count is high
    if (state.users > 50000 && Math.random() < 0.001) {
      return 'whistleblower_1';
    }

    return null;
  }
}
