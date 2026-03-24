// ENHANCED FRIENDS SYSTEM WITH COUNT CLICKULA

export interface Friend {
  id: string;
  name: string;
  unlocked: boolean;
  unlockCondition: string;
  unlockThreshold: number;
  description: string;
  benefits: string[];
}

export const FRIENDS_DATA: Friend[] = [
  {
    id: 'metaman',
    name: 'Metaman',
    unlocked: true, // Always unlocked - the main character
    unlockCondition: 'Always Available',
    unlockThreshold: 0,
    description: 'Your main character and empire builder',
    benefits: [
      'Base black market access',
      'Core game mechanics',
      'Tower management'
    ]
  },
  {
    id: 'count_clickula',
    name: 'Count Clickula',
    unlocked: false,
    unlockCondition: 'Reach 2 Million Users',
    unlockThreshold: 2000000,
    description: 'Elite vampire businessman who expands your black market operations',
    benefits: [
      'Expanded black market inventory',
      'Premium rare items',
      'Advanced user manipulation tactics',
      'Exclusive vampire-themed campaigns'
    ]
  }
];

// Check if friends should be unlocked based on current game state
export function updateFriendsStatus(users: number): Friend[] {
  return FRIENDS_DATA.map(friend => ({
    ...friend,
    unlocked: friend.unlocked || users >= friend.unlockThreshold
  }));
}

// Get unlocked friends count
export function getUnlockedFriendsCount(users: number): number {
  return updateFriendsStatus(users).filter(f => f.unlocked).length;
}

// Check if Count Clickula is unlocked (for black market expansion)
export function isCountClickulaUnlocked(users: number): boolean {
  return users >= 2000000;
}