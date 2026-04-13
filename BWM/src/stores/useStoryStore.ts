import { create } from 'zustand';

export type GamePhase = 'title' | 'intro' | 'forest' | 'approach' | 'event' | 'aftermath' | 'end';

interface StoryState {
  phase: GamePhase;
  soundOn: boolean;
  approachDist: number;
  eventDone: boolean;
  bearLying: boolean;
  bearLieProgress: number;

  // Actions
  setPhase: (phase: GamePhase) => void;
  toggleSound: () => void;
  updateApproachDist: (dist: number) => void;
  setEventDone: (done: boolean) => void;
  setBearLying: (lying: boolean) => void;
  updateBearLieProgress: (delta: number) => void;
  resetGame: () => void;
}

export const useStoryStore = create<StoryState>((set) => ({
  phase: 'title',
  soundOn: false,
  approachDist: 9999,
  eventDone: false,
  bearLying: false,
  bearLieProgress: 0,

  setPhase: (phase) => set({ phase }),
  toggleSound: () => set((state) => ({ soundOn: !state.soundOn })),
  updateApproachDist: (dist) => set({ approachDist: dist }),
  setEventDone: (done) => set({ eventDone: done }),
  setBearLying: (lying) => set({ bearLying: lying }),
  updateBearLieProgress: (delta) => set((state) => ({ 
    bearLieProgress: Math.min(1, state.bearLieProgress + delta) 
  })),
  resetGame: () => set({
    phase: 'title',
    approachDist: 9999,
    eventDone: false,
    bearLying: false,
    bearLieProgress: 0,
  }),
}));
