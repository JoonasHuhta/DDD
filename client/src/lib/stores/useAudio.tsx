import { create } from "zustand";

export const MUSIC_TRACKS = ['Forgo1.mp3', 'Forgo2.mp3', 'Forgo3.mp3', 'Forgo4.mp3', 'Forgo5.mp3', 'infinitescroll.mp3'];

// Sprite manifest with exact timings and 1s padding
const MUSIC_SPRITE = {
  'Forgo1.mp3': { start: 0, duration: 159.92 },
  'Forgo2.mp3': { start: 160.92, duration: 234.08 },
  'Forgo3.mp3': { start: 396.00, duration: 215.64 },
  'Forgo4.mp3': { start: 612.64, duration: 178.44 },
  'Forgo5.mp3': { start: 792.08, duration: 230.00 },
  'infinitescroll.mp3': { start: 1023.08, duration: 315.00 }
};

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

// Module-level singletons (Never change src, only currentTime)
const musicSprite = typeof Audio !== 'undefined' ? new Audio("/sounds/music_sprite.mp3") : null;
if (musicSprite) {
  musicSprite.volume = 0.3;
  // preload significantly faster for better seeking
  musicSprite.preload = "auto";
}

const hit = typeof Audio !== 'undefined' ? new Audio("/sounds/hit.mp3") : null;
const success = typeof Audio !== 'undefined' ? new Audio("/sounds/success.mp3") : null;
const legal = typeof Audio !== 'undefined' ? new Audio("/sounds/hit.mp3") : null;
const cash4 = typeof Audio !== 'undefined' ? new Audio("/sounds/cash4.mp3") : null;

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: musicSprite,
  hitSound: hit,
  successSound: success,
  legalSound: legal,
  isMuted: false,
  isInitialized: false,
  isTransitioning: false,
  currentTrack: "Forgo1.mp3",
  
  initAudio: () => {
    if (get().isInitialized || !musicSprite) return;
    
    // Register timeupdate to handle playlist progression within the sprite
    musicSprite.addEventListener('timeupdate', () => {
      const { currentTrack, isMuted, isTransitioning, setTrack } = get();
      if (isTransitioning) return;
      
      const trackData = MUSIC_SPRITE[currentTrack as keyof typeof MUSIC_SPRITE];
      if (!trackData) return;

      const end = trackData.start + trackData.duration;
      // If we reach the end of the current track segment, move to the next track in the playlist
      if (musicSprite.currentTime >= (end - 0.1)) { // 0.1s buffer to ensure we catch it
        const currentIndex = MUSIC_TRACKS.indexOf(currentTrack);
        const nextIndex = (currentIndex + 1) % MUSIC_TRACKS.length;
        setTrack(MUSIC_TRACKS[nextIndex]);
      }
    });

    set({ isInitialized: true });
    console.log('[AUDIO]', 'SPRITE_INITIALIZED', 'Path: /sounds/music_sprite.mp3');
  },
  
  toggleMute: () => {
    const { isMuted } = get();
    const newMutedState = !isMuted;
    
    set({ isMuted: newMutedState });
    console.log('[AUDIO]', 'TOGGLE_MUTE', newMutedState);
    
    if (musicSprite) {
      if (newMutedState) {
        musicSprite.pause();
        musicSprite.volume = 0;
      } else {
        musicSprite.volume = 0.3;
        musicSprite.play().catch(() => {});
      }
    }
  },
  
  playBackgroundMusic: () => {
    const { isMuted, isInitialized } = get();
    if (!isInitialized || !musicSprite) return;
    
    if (!isMuted && musicSprite.paused) {
      // Ensure we are in the correct segment
      const trackData = MUSIC_SPRITE[get().currentTrack as keyof typeof MUSIC_SPRITE];
      if (trackData && (musicSprite.currentTime < trackData.start || musicSprite.currentTime > trackData.start + trackData.duration)) {
        musicSprite.currentTime = trackData.start;
      }
      
      musicSprite.play().catch(error => {
        if (error.name !== 'NotAllowedError') {
          console.warn("[AUDIO] Sprite play error:", error);
        }
      });
    }
  },
  
  pauseBackgroundMusic: () => {
    if (musicSprite && !musicSprite.paused) musicSprite.pause();
  },
  
  setTrack: (trackName: string) => {
    if (!musicSprite) return;
    
    const { currentTrack, setIsTransitioning, isMuted } = get();
    if (currentTrack === trackName) return;

    const trackData = MUSIC_SPRITE[trackName as keyof typeof MUSIC_SPRITE];
    if (!trackData) return;

    console.log('[AUDIO]', 'SPRITE_SEEK', trackName, 'to', trackData.start);
    setIsTransitioning(true);
    
    // Crossfade effect using volume
    if (!isMuted) {
      let fadeStep = 0;
      const fadeInterval = setInterval(() => {
        fadeStep++;
        const progress = fadeStep / 10;
        
        // Fade out
        musicSprite.volume = 0.3 * (1 - progress);
        
        if (fadeStep >= 10) {
          clearInterval(fadeInterval);
          
          // Seek to new track segment
          musicSprite.currentTime = trackData.start;
          set({ currentTrack: trackName });
          
          // Fade in
          let fadeInStep = 0;
          const fadeInInterval = setInterval(() => {
            fadeInStep++;
            musicSprite.volume = 0.3 * (fadeInStep / 10);
            if (fadeInStep >= 10) {
              clearInterval(fadeInInterval);
              setIsTransitioning(false);
              console.log('[AUDIO]', 'SPRITE_SEEK_COMPLETE', trackName);
            }
          }, 50);
        }
      }, 50);
    } else {
      musicSprite.currentTime = trackData.start;
      set({ currentTrack: trackName });
      setIsTransitioning(false);
    }
  },

  setIsTransitioning: (v: boolean) => {
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
      const soundClone = cash4.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.8;
      soundClone.play().catch(() => {});
    }
  }
}));

