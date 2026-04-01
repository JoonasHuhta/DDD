import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  legalSound: HTMLAudioElement | null;
  isMuted: boolean;
  isInitialized: boolean;
  
  initAudio: () => void;
  toggleMute: () => void;
  
  playBackgroundMusic: () => void;
  pauseBackgroundMusic: () => void;
  setTrack: (trackName: string) => void;
  currentTrack: string;
  playHit: () => void;
  playSuccess: () => void;
  playLegal: () => void;
  playCash4: () => void;
  isTransitioning: boolean;
  setIsTransitioning: (v: boolean) => void;
}

// Module-level singletons to prevent multiple instances and restart loops
const music = typeof Audio !== 'undefined' ? new Audio("/sounds/Forgo1.mp3") : null;
if (music) {
  music.loop = true;
  music.volume = 0.3;
}

const hit = typeof Audio !== 'undefined' ? new Audio("/sounds/hit.mp3") : null;
if (hit) hit.volume = 0.5;

const success = typeof Audio !== 'undefined' ? new Audio("/sounds/success.mp3") : null;
if (success) success.volume = 0.7;

const legal = typeof Audio !== 'undefined' ? new Audio("/sounds/hit.mp3") : null;
if (legal) legal.volume = 0.6;

const cash4 = typeof Audio !== 'undefined' ? new Audio("/sounds/cash4.wav") : null;
if (cash4) cash4.volume = 0.8;

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: music,
  hitSound: hit,
  successSound: success,
  legalSound: legal,
  isMuted: false,
  isInitialized: false,
  isTransitioning: false,
  currentTrack: "Forgo1.mp3",
  
  initAudio: () => {
    if (get().isInitialized) return;
    
    if (music) {
      music.loop = true;
      
      // Safer ended fallback
      music.addEventListener('ended', () => {
        const { isMuted, isTransitioning } = get();
        console.log('[AUDIO]', 'ENDED_EVENT', music.currentTime, music.paused, isTransitioning);
        if (!isMuted && !isTransitioning) {
          music.currentTime = 0;
          music.play().catch(() => {});
        }
      });
    }

    set({ isInitialized: true });
    console.log('[AUDIO]', 'INIT', music?.currentTime || 0, music?.paused || true, get().isTransitioning);
  },
  
  toggleMute: () => {
    const { isMuted, isTransitioning } = get();
    const newMutedState = !isMuted;
    
    set({ isMuted: newMutedState });
    console.log('[AUDIO]', 'TOGGLE_MUTE', music?.currentTime || 0, music?.paused || true, isTransitioning);
    
    if (music) {
      if (newMutedState) {
        music.pause();
      } else if (!isTransitioning) {
        music.play().catch(() => {});
      }
    }
  },
  
  playBackgroundMusic: () => {
    const { isMuted, isInitialized, isTransitioning } = get();
    if (!isInitialized || !music) return;
    
    console.log('[AUDIO]', 'PLAY_BG_REQUEST', music.currentTime, music.paused, isTransitioning);

    // CRITICAL: Respect isTransitioning to avoid premature menu music restarts
    if (!isMuted && !isTransitioning && music.paused) {
      music.play().catch(error => {
        if (error.name !== 'NotAllowedError') {
          console.warn("Background music play error:", error);
        }
      });
    }
  },
  
  pauseBackgroundMusic: () => {
    const { isTransitioning } = get();
    console.log('[AUDIO]', 'PAUSE_BG', music?.currentTime || 0, music?.paused || true, isTransitioning);
    if (music && !music.paused) {
      music.pause();
    }
  },
  
  setTrack: (trackName: string) => {
    if (!music) return;
    const { isTransitioning } = get();
    
    console.log('[AUDIO]', 'SET_TRACK', trackName, music.paused, isTransitioning);
    
    // Update the source
    music.src = `/sounds/${trackName}`;
    set({ currentTrack: trackName });
  },

  setIsTransitioning: (v: boolean) => {
    console.log('[AUDIO]', 'SET_TRANSITIONING', v, music?.currentTime || 0, music?.paused || true);
    set({ isTransitioning: v });
  },
  
  playHit: () => {
    const { isMuted } = get();
    if (hit && !isMuted) {
      const soundClone = hit.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(() => {});
    }
  },
  
  playSuccess: () => {
    const { isMuted } = get();
    if (success && !isMuted) {
      success.currentTime = 0;
      success.play().catch(() => {});
    }
  },
  
  playLegal: () => {
    const { isMuted } = get();
    if (legal && !isMuted) {
      const soundClone = legal.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.6;
      soundClone.play().catch(() => {});
    }
  },
  
  playCash4: () => {
    const { isMuted } = get();
    if (cash4 && !isMuted) {
      // Create a clone to allow overlapping sounds (important for fast sequences)
      const soundClone = cash4.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.8;
      soundClone.play().catch(() => {});
    }
  }
}));
