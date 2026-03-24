import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  isInitialized: boolean;
  
  // Setter actions (mostly internal)
  initAudio: () => void;
  toggleMute: () => void;
  
  // Playback actions
  playBackgroundMusic: () => void;
  pauseBackgroundMusic: () => void;
  playHit: () => void;
  playSuccess: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: false,
  isInitialized: false,
  
  initAudio: () => {
    if (get().isInitialized) return;
    
    // Initialize once only
    const music = new Audio("/sounds/background.mp3");
    music.loop = true;
    music.volume = 0.3;
    
    // Fallback for mobile looping issues
    music.addEventListener('ended', () => {
      if (!get().isMuted) {
        music.play().catch(() => {});
      }
    });

    const hit = new Audio("/sounds/hit.mp3");
    hit.volume = 0.5;

    const success = new Audio("/sounds/success.mp3");
    success.volume = 0.7;

    set({ 
      backgroundMusic: music, 
      hitSound: hit, 
      successSound: success,
      isInitialized: true 
    });
    
    console.log("🔊 Audio system initialized");
  },
  
  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    set({ isMuted: newMutedState });
    
    if (backgroundMusic) {
      if (newMutedState) {
        backgroundMusic.pause();
      } else {
        backgroundMusic.play().catch(() => {});
      }
    }
    
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playBackgroundMusic: () => {
    const { backgroundMusic, isMuted, isInitialized } = get();
    if (!isInitialized) return;
    if (backgroundMusic && !isMuted && backgroundMusic.paused) {
      backgroundMusic.play().catch(error => {
        if (error.name !== 'NotAllowedError') {
          console.warn("Background music play error:", error);
        }
      });
    }
  },
  
  pauseBackgroundMusic: () => {
    const { backgroundMusic } = get();
    if (backgroundMusic && !backgroundMusic.paused) {
      backgroundMusic.pause();
    }
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound && !isMuted) {
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(() => {});
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound && !isMuted) {
      successSound.currentTime = 0;
      successSound.play().catch(() => {});
    }
  }
}));
