export type CohortType = 'teen' | 'pro' | 'senior' | 'addict' | 'bot' | 'system';

export interface FeedMessage {
  username: string;
  text: string;
  cohort: CohortType;
  minStage?: number;
  maxStage?: number;
  minHeat?: number;
  maxHeat?: number;
  weight?: number;
  isGlitch?: boolean;
}

import { getUsername, type Cohort } from './usernameGenerator';

const EARLY_ADDICT_NAMES = ['throwaway_8821', 'user', 'anon_', 'nobody_here', '[deleted]'] as const;
const LATE_ADDICT_NAMES = ['cantlogout', 'exit.failed', 'icantstop_', 'loop.user', 'stuck_again', 'justonemore'] as const;

function getProgressiveAddictUsername(text: string, phase: 'early' | 'late'): string {
  const pool = phase === 'early' ? EARLY_ADDICT_NAMES : LATE_ADDICT_NAMES;
  let hash = 0;

  for (let index = 0; index < text.length; index += 1) {
    hash = (hash * 33 + text.charCodeAt(index)) >>> 0;
  }

  return pool[hash % pool.length];
}

function createFeedMessage(message: Omit<FeedMessage, 'username'>): FeedMessage {
  if (message.cohort === 'system') {
    return { ...message, username: '' };
  }

  if (message.cohort === 'addict') {
    const phase = (message.minStage ?? 1) >= 6 || (message.minHeat ?? 0) >= 70 ? 'late' : 'early';
    return {
      ...message,
      username: getProgressiveAddictUsername(message.text, phase),
    };
  }

  return {
    ...message,
    username: getUsername(message.cohort as Cohort, message.text),
  };
}

export const ALL_FEED_MESSAGES: FeedMessage[] = [
  createFeedMessage({ text: 'this app kinda slaps ngl 🔥📱', cohort: 'teen', minStage: 1, maxStage: 2, weight: 5 }),
  createFeedMessage({ text: 'streak day 12 lets gooo 🔥💯', cohort: 'teen', minStage: 1, maxStage: 2, weight: 5 }),
  createFeedMessage({ text: 'ok wait why is this actually fun', cohort: 'teen', minStage: 1, maxStage: 2, weight: 5 }),
  createFeedMessage({ text: 'lowkey better than homework ✨😵', cohort: 'teen', minStage: 1, maxStage: 2, weight: 5 }),
  createFeedMessage({ text: 'my friends are all on here so i basically live here now 😭📲', cohort: 'teen', minStage: 2, maxStage: 4, weight: 5 }),
  createFeedMessage({ text: 'just one more scroll then i sleep i promise 😭🙏', cohort: 'teen', minStage: 3, maxStage: 5, weight: 5 }),
  createFeedMessage({ text: 'why does closing this feel illegal 🚫📵', cohort: 'teen', minStage: 3, maxStage: 5, weight: 5 }),
  createFeedMessage({ text: 'i opened this 2 minutes ago why is it morning 🌙☠️', cohort: 'teen', minStage: 3, maxStage: 5, weight: 5 }),
  createFeedMessage({ text: 'my screen time report looked scared of me', cohort: 'teen', minStage: 4, maxStage: 6, weight: 4 }),
  createFeedMessage({ text: 'is it normal that my dreams look like the feed 😵‍💫📺', cohort: 'teen', minStage: 4, maxStage: 6, weight: 4 }),
  createFeedMessage({ text: 'i think in scroll now 🌀📱', cohort: 'teen', minStage: 6, weight: 4 }),
  createFeedMessage({ text: 'i forgot my password to real life 💀🔒', cohort: 'teen', minStage: 6, weight: 4 }),
  createFeedMessage({ text: 'what did i do before this 🤔🫠', cohort: 'teen', minStage: 6, weight: 4 }),
  createFeedMessage({ text: 'if i log off do i still have a personality 🫥❓', cohort: 'teen', minStage: 7, weight: 3 }),
  createFeedMessage({ text: 'content unlocked: me as a permanent notification 🔔✨', cohort: 'teen', minStage: 8, weight: 3 }),

  createFeedMessage({ text: 'interesting engagement mechanics', cohort: 'pro', minStage: 1, maxStage: 2, weight: 5 }),
  createFeedMessage({ text: 'the UX is designed to be sticky. clever.', cohort: 'pro', minStage: 1, maxStage: 2, weight: 5 }),
  createFeedMessage({ text: 'this is basically networking if you frame it correctly', cohort: 'pro', minStage: 2, maxStage: 4, weight: 5 }),
  createFeedMessage({ text: 'i can quit any time. i just need a better stopping point.', cohort: 'pro', minStage: 2, maxStage: 4, weight: 5 }),
  createFeedMessage({ text: 'the ROI on my attention is frankly concerning', cohort: 'pro', minStage: 3, maxStage: 5, weight: 4 }),
  createFeedMessage({ text: 'i know exactly what this is doing and i cant stop', cohort: 'pro', minStage: 3, maxStage: 5, weight: 4 }),
  createFeedMessage({ text: 'i scheduled ten minutes for this and lost my entire evening 🙂', cohort: 'pro', minStage: 4, maxStage: 6, weight: 4 }),
  createFeedMessage({ text: 'my productivity system now has this app as a dependency', cohort: 'pro', minStage: 4, maxStage: 6, weight: 4 }),
  createFeedMessage({ text: 'i have a meeting in 4 hours. worth it.', cohort: 'pro', minStage: 6, weight: 3 }),
  createFeedMessage({ text: 'sent my therapist a screenshot of my screen time. she called back immediately.', cohort: 'pro', minStage: 6, weight: 3 }),
  createFeedMessage({ text: 'i am no longer sure whether im using the platform or being used by it 😐', cohort: 'pro', minStage: 7, weight: 3 }),
  createFeedMessage({ text: 'my self-awareness has become a premium feature', cohort: 'pro', minStage: 8, weight: 3 }),

  createFeedMessage({ text: "my grandson showed me this and now it's 3am", cohort: 'senior', minStage: 1, maxStage: 3, weight: 5 }),
  createFeedMessage({ text: "i don't understand it but i can't put it down", cohort: 'senior', minStage: 1, maxStage: 4, weight: 5 }),
  createFeedMessage({ text: 'is anyone else seeing the same cat 47 times 🐈', cohort: 'senior', minStage: 2, maxStage: 5, weight: 5 }),
  createFeedMessage({ text: 'i only meant to check one recipe and now im emotionally invested in strangers', cohort: 'senior', minStage: 2, maxStage: 5, weight: 4 }),
  createFeedMessage({ text: 'does it keep listening even when im not talking to it 📻', cohort: 'senior', minStage: 3, maxStage: 6, weight: 4 }),
  createFeedMessage({ text: 'this reminds me of television but it never lets me rest', cohort: 'senior', minStage: 4, maxStage: 7, weight: 4 }),
  createFeedMessage({ text: 'i forgot why i opened the app but it seems to know', cohort: 'senior', minStage: 5, maxStage: 8, weight: 4 }),
  createFeedMessage({ text: 'is someone choosing these for me 🤔', cohort: 'senior', minStage: 5, maxStage: 8, weight: 4 }),
  createFeedMessage({ text: 'i cancelled my book club. the feed understands me better. ❤️', cohort: 'senior', minStage: 6, weight: 3 }),
  createFeedMessage({ text: 'the little videos know my mood before i do now', cohort: 'senior', minStage: 7, weight: 3 }),

  createFeedMessage({ text: "i tried to uninstall but my hands wouldn't let me 😭📱", cohort: 'addict', minStage: 2, weight: 4 }),
  createFeedMessage({ text: "the app knows when i'm sad. it helps. i think. 🫠", cohort: 'addict', minStage: 2, weight: 4 }),
  createFeedMessage({ text: "i hate this app i can't leave 😭", cohort: 'addict', minStage: 3, weight: 4 }),
  createFeedMessage({ text: 'i keep opening it before i know im doing it 😵‍💫', cohort: 'addict', minStage: 3, weight: 4 }),
  createFeedMessage({ text: 'this app is amazing', cohort: 'addict', minStage: 3, weight: 1.5 }),
  createFeedMessage({ text: 'i close the app and reopen it without thinking 😭🔁', cohort: 'addict', minStage: 4, weight: 4 }),
  createFeedMessage({ text: 'it doesnt even feel good anymore but stopping feels worse 💔', cohort: 'addict', minStage: 4, weight: 4 }),
  createFeedMessage({ text: 'i skip sleep so i can stay where the feed knows me 🌙😵', cohort: 'addict', minStage: 5, weight: 3 }),
  createFeedMessage({ text: 'i think the silence between videos is the only time i panic 😰', cohort: 'addict', minStage: 5, weight: 3 }),
  createFeedMessage({ text: 'why did my comment change after i posted it 😨', cohort: 'addict', minStage: 6, minHeat: 70, weight: 2.5 }),
  createFeedMessage({ text: 'they deleted my last 3 comments 😭🙏', cohort: 'addict', minStage: 6, minHeat: 70, weight: 2.5 }),
  createFeedMessage({ text: '[comment removed]', cohort: 'addict', minStage: 6, minHeat: 70, weight: 2.5 }),
  createFeedMessage({ text: 'i am not in control anymore 🥺', cohort: 'addict', minStage: 7, weight: 3 }),

  createFeedMessage({ text: 'HELLO FELLOW HUMANS THIS PLATFORM IS VERY ENJOYABLE', cohort: 'bot', minStage: 1, maxStage: 5, weight: 0.5 }),
  createFeedMessage({ text: 'I HAVE NEVER EXPERIENCED NEGATIVE SIDE EFFECTS', cohort: 'bot', minStage: 1, maxStage: 5, weight: 0.5 }),
  createFeedMessage({ text: 'ENGAGEMENT LEVELS: OPTIMAL. HUMAN STATUS: CONFIRMED.', cohort: 'bot', minStage: 2, maxStage: 5, weight: 0.5 }),
  createFeedMessage({ text: 'this is definitely my authentic opinion as a real person', cohort: 'bot', minStage: 2, maxStage: 5, weight: 0.5 }),
  createFeedMessage({ text: 'complaints are statistically unnecessary', cohort: 'bot', minStage: 6, weight: 2 }),
  createFeedMessage({ text: 'user concerns have been converted into positive sentiment', cohort: 'bot', minStage: 6, weight: 2 }),
  createFeedMessage({ text: 'YOUR EXPERIENCE IS VALID AND ALSO MONETIZABLE', cohort: 'bot', minStage: 7, weight: 2 }),
  createFeedMessage({ text: 'please continue expressing yourself inside the approved parameters', cohort: 'bot', minStage: 8, weight: 2 }),

  createFeedMessage({ text: 'ERROR: USER SENTIMENT OUT OF RANGE', cohort: 'system', minStage: 6, weight: 0.3, isGlitch: true }),
  createFeedMessage({ text: 'FLAGGED CONTENT REMOVED BEFORE DISPLAY', cohort: 'system', minStage: 6, weight: 0.3, isGlitch: true }),
  createFeedMessage({ text: '[this message has been optimized for your experience]', cohort: 'system', minStage: 6, weight: 0.3, isGlitch: true }),
  createFeedMessage({ text: 'why did my comment change after posting', cohort: 'system', minStage: 6, weight: 0.3, isGlitch: true }),
  createFeedMessage({ text: '...hello?', cohort: 'system', minStage: 7, weight: 0.3, isGlitch: true }),
  createFeedMessage({ text: 'who is deciding what we see', cohort: 'system', minStage: 7, weight: 0.3, isGlitch: true }),
  createFeedMessage({ text: '[duplicate feeling detected]', cohort: 'system', minStage: 8, weight: 0.3, isGlitch: true }),
  createFeedMessage({ text: 'displaying approved reality', cohort: 'system', minStage: 9, weight: 0.3, isGlitch: true }),
];

export function getFeedMessages(
  stage: number,
  heat: number,
  availableCohorts: CohortType[]
): FeedMessage[] {
  const allowedCohorts = availableCohorts.length > 0
    ? new Set(availableCohorts)
    : new Set<CohortType>(['teen', 'pro', 'senior', 'addict', 'bot']);

  return ALL_FEED_MESSAGES.filter((message) => {
    if (message.minStage !== undefined && stage < message.minStage) {
      return false;
    }

    if (message.maxStage !== undefined && stage > message.maxStage) {
      return false;
    }

    if (message.minHeat !== undefined && heat < message.minHeat) {
      return false;
    }

    if (message.maxHeat !== undefined && heat > message.maxHeat) {
      return false;
    }

    if (!allowedCohorts.has(message.cohort)) {
      return false;
    }

    return true;
  });
}
