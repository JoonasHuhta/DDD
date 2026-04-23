export type Cohort = 'teen' | 'pro' | 'senior' | 'addict' | 'bot';

const pools: Record<Cohort, string[]> = {
  teen: [
    'xX_darkmode_Xx', 'scrollgod99', 'vibecheck404', 'notgonnalie_fr',
    'sleepless.jpg', 'doomscroller_', 'chaotic.good.only', 'brainrot.exe',
    'itsgivingaddiction', 'just5moremins', 'buffering.mind', 'lowkey_lost',
    'noob_master_69', 'frfr_energy', 'ghost_in_scroll', '404_attention',
    'dopamine.deficit', 'chronically.online', 'npc.behavior', 'main.character_',
    'touch.grass.exe', 'reality.exe_crashed', 'serotonin.zip', 'void.scroller',
    'unalived_sleep', 'based.and.cooked', 'ratio_machine', 'lore_unlocked',
    'deleted_thoughts', '404_motivation',
  ],
  pro: [
    'Marcus T.', 'Sarah K.', 'David L.', 'Priya N.', 'James W.',
    'Elena R.', 'Alex M.', 'Jordan P.', 'Michael S.', 'Anna B.',
    'Thomas H.', 'Rachel C.', 'Kevin O.', 'Lisa F.', 'Nathan D.',
    'Claire V.', 'Ryan M.', 'Sophia A.', 'Brett L.', 'Monica J.',
  ],
  senior: [
    'Helen', 'Robert', 'Margaret', 'Gerald', 'Patricia',
    'Dorothy', 'Arthur', 'Betty', 'William', 'Evelyn',
    'Frank', 'Shirley', 'Harold', 'Norma', 'Walter',
    'Mildred', 'Raymond', 'Gladys', 'Eugene', 'Beatrice',
  ],
  addict: [
    'throwaway_8821', 'stillhere_help', 'cantlogout', 'user', 'anon_',
    'nobody_here', '[deleted]', 'lostconnection', 'scrollloop', 'help_me_pls',
    'notokay_8', 'pleasestop_', 'onemoreminute', 'exit.failed', 'loop.user',
    'stuck_again', 'sendhelp404', 'icantstop_', 'why_am_i_here', 'justonemore',
  ],
  bot: [
    'OptimalUser_7749', 'RealHuman_Verified', 'ContentBot_EN',
    'NotABot_Promise', 'HappyUser_8832', 'EngagementUnit_04',
    'SystemUser_1', 'AutoPoster_X', 'FeedEnhancer_AI',
    'TotallyHuman_99', 'GenuineReview_Bot', 'AuthenticUser_7',
    'NormalPerson_443', 'DefinitelyReal_X', 'HumanBeing_2049',
  ],
};

const usedNames = new Set<string>();

function hashSeed(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getUsername(cohort: Cohort | 'system', seed = ''): string {
  if (cohort === 'system') {
    return '';
  }

  const pool = pools[cohort];
  if (pool.length === 0) {
    return '';
  }

  const cohortKeys = pool.map((name) => `${cohort}:${name}`);
  const allUsed = cohortKeys.every((key) => usedNames.has(key));

  if (allUsed) {
    usedNames.clear();
  }

  const startIndex = hashSeed(`${cohort}:${seed}`) % pool.length;

  for (let offset = 0; offset < pool.length; offset += 1) {
    const candidate = pool[(startIndex + offset) % pool.length];
    const candidateKey = `${cohort}:${candidate}`;

    if (!usedNames.has(candidateKey)) {
      usedNames.add(candidateKey);
      return candidate;
    }
  }

  const fallback = pool[startIndex];
  usedNames.add(`${cohort}:${fallback}`);
  return fallback;
}

export function resetUsernames(): void {
  usedNames.clear();
}

export { pools };
