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
  playHit: () => void;
  playSuccess: () => void;
  playLegal: () => void;
}

// Module-level singletons to prevent multiple instances and restart loops
const music = typeof Audio !== 'undefined' ? new Audio("/sounds/background.mp3") : null;
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

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: music,
  hitSound: hit,
  successSound: success,
  legalSound: legal,
  isMuted: false,
  isInitialized: false,
  
  initAudio: () => {
    if (get().isInitialized) return;
    
    // Setup listeners once
    if (music) {
      // Fallback for mobile looping issues
      music.addEventListener('ended', () => {
        const { isMuted } = get();
        if (!isMuted) {
          music.play().catch(() => {});
        }
      });
    }

    set({ isInitialized: true });
    console.log("🔊 Audio system initialized (Singletons)");
  },
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    set({ isMuted: newMutedState });
    
    if (music) {
      if (newMutedState) {
        music.pause();
      } else {
        music.play().catch(() => {});
      }
    }
  },
  
  playBackgroundMusic: () => {
    const { isMuted, isInitialized } = get();
    if (!isInitialized || !music) return;
    
    // CRITICAL: Only play if NOT already playing and NOT muted
    if (!isMuted && music.paused) {
      music.play().catch(error => {
        if (error.name !== 'NotAllowedError') {
          console.warn("Background music play error:", error);
        }
      });
    }
  },
  
  pauseBackgroundMusic: () => {
    if (music && !music.paused) {
      music.pause();
    }
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
  }
}));
