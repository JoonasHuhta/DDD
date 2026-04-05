import { create } from "zustand";

// Removed infinitescroll.mp3 to save APK space as requested
export const MUSIC_TRACKS = ['Forgo1.mp3', 'Forgo2.mp3', 'Forgo3.mp3', 'Forgo4.mp3', 'Forgo5.mp3'];

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  legalSound: HTMLAudioElement | null;
  plopSound: HTMLAudioElement | null;
  upgradeSound: HTMLAudioElement | null;
  zapSound: HTMLAudioElement | null;
  alertSound: HTMLAudioElement | null;
  collectSound: HTMLAudioElement | null;
  orbdingSound: HTMLAudioElement | null;
  isMusicMuted: boolean;
  isInitialized: boolean;
  isPrimed: boolean;
  
  initAudio: () => void;
  primeAudio: () => Promise<void>;
  toggleMusicMute: () => void;
  
  playBackgroundMusic: () => void;
  pauseBackgroundMusic: () => void;
  setTrack: (trackName: string) => void;
  currentTrack: string;
  playHit: () => void;
  playSuccess: () => void;
  playLegal: () => void;
  playCash4: () => void;
  playPlop: () => void;
  playUpgrade: () => void;
  playZap: () => void;
  playAlert: () => void;
  playCollect: () => void;
  playOrbding: () => void;
  isTransitioning: boolean;
  setIsTransitioning: (v: boolean) => void;
}

// Module-level singletons
const musicSprite = typeof Audio !== 'undefined' ? new Audio() : null;
let playingPromise: Promise<void> | null = null;
let lastFadeInterval: ReturnType<typeof setInterval> | null = null;

if (musicSprite) {
  musicSprite.volume = 0.3;
  musicSprite.loop = true; 
  musicSprite.preload = "auto";
}

const hit = typeof Audio !== 'undefined' ? new Audio("/sounds/hit.mp3") : null;
const success = typeof Audio !== 'undefined' ? new Audio("/sounds/success.mp3") : null;
const legal = typeof Audio !== 'undefined' ? new Audio("/sounds/hit.mp3") : null;
const cash4 = typeof Audio !== 'undefined' ? new Audio("/sounds/cash4.mp3") : null;
const plop = typeof Audio !== 'undefined' ? new Audio("/sounds/plop.mp3") : null;
const upgrade = typeof Audio !== 'undefined' ? new Audio("/sounds/upgrade.mp3") : null;

// New Sounds
const zap = typeof Audio !== 'undefined' ? new Audio("/sounds/newzap.mp3") : null;
const alertSoundEffect = typeof Audio !== 'undefined' ? new Audio("/sounds/alert.mp3") : null;
const collect = typeof Audio !== 'undefined' ? new Audio("/sounds/collect.mp3") : null;
const orbding = typeof Audio !== 'undefined' ? new Audio("/sounds/orbding.mp3") : null;

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: musicSprite,
  hitSound: hit,
  successSound: success,
  legalSound: legal,
  plopSound: plop,
  upgradeSound: upgrade,
  zapSound: zap,
  alertSound: alertSoundEffect,
  collectSound: collect,
  orbdingSound: orbding,
  isMusicMuted: false,
  isInitialized: false,
  isPrimed: false,
  isTransitioning: false,
  currentTrack: "Forgo1.mp3",
  
  initAudio: () => {
    if (get().isInitialized || !musicSprite) return;
    
    // Recovery listeners for mobile WebView stalls
    musicSprite.addEventListener('stalled', () => {
      console.warn('[AUDIO]', 'STALLED', 'Attempting recovery...');
      const { isMusicMuted, isTransitioning, isPrimed } = get();
      if (!isMusicMuted && !isTransitioning && isPrimed) get().playBackgroundMusic();
    });

    musicSprite.addEventListener('error', (e) => {
      console.error('[AUDIO]', 'ELEMENT_ERROR', musicSprite.error);
    });

    // Set initial src
    musicSprite.src = "/sounds/Forgo1.mp3";
    musicSprite.load();
    set({ isInitialized: true });
    console.log('[AUDIO]', 'INITIALIZED', 'Path: /sounds/Forgo1.mp3');
  },

  primeAudio: async () => {
    const { isInitialized, isPrimed } = get();
    if (!isInitialized || isPrimed || !musicSprite) return;

    console.log('[AUDIO]', 'PRIMING_START');
    try {
      // Play at near-zero volume to "unlock" the audio element
      const originalVolume = 0.3;
      musicSprite.volume = 0.001;
      
      // Mobile Robustness: Prime ALL elements concurrently
      const primeTargets = [musicSprite, zap, collect, orbding, alertSoundEffect].filter(Boolean) as HTMLAudioElement[];
      await Promise.all(primeTargets.map(async (el) => {
        try {
          el.muted = true; // Use muted play for priming to avoid audio pops
          await el.play();
          el.pause();
          el.muted = false;
        } catch (e) {
          console.warn('[AUDIO]', 'PRIME_ITEM_FAIL', el.src, e);
        }
      }));
      
      // If successful, we are primed
      set({ isPrimed: true });
      console.log('[AUDIO]', 'PRIMING_SUCCESS');
      
      // Restore volume if not muted
      if (get().isMusicMuted) {
        musicSprite.pause();
      } else {
        musicSprite.volume = originalVolume;
      }
    } catch (error) {
      console.warn('[AUDIO]', 'PRIMING_FAIL', error);
    }
  },
  
  toggleMusicMute: () => {
    const { isMusicMuted, playBackgroundMusic, isPrimed } = get();
    const newMutedState = !isMusicMuted;
    
    set({ isMusicMuted: newMutedState });
    
    if (musicSprite) {
      if (newMutedState) {
        if (playingPromise) {
          playingPromise.then(() => musicSprite.pause()).catch(() => musicSprite.pause());
        } else {
          musicSprite.pause();
        }
      } else if (isPrimed) {
        playBackgroundMusic();
      }
    }
  },
  
  playBackgroundMusic: () => {
    const { isMusicMuted, isInitialized, isPrimed } = get();
    if (!isInitialized || !musicSprite) return;
    
    if (!isMusicMuted && musicSprite.paused && isPrimed) {
      playingPromise = musicSprite.play();
      playingPromise.then(() => {
        playingPromise = null;
      }).catch(error => {
        playingPromise = null;
        console.warn("[AUDIO] Play error:", error);
      });
    }
  },
  
  pauseBackgroundMusic: () => {
    if (musicSprite && !musicSprite.paused) {
      if (playingPromise) {
        playingPromise.then(() => musicSprite.pause()).catch(() => musicSprite.pause());
      } else {
        musicSprite.pause();
      }
    }
  },
  
  setTrack: (trackName: string) => {
    if (!musicSprite) return;
    
    const { currentTrack, setIsTransitioning, isMusicMuted, isPrimed } = get();
    if (currentTrack === trackName) return;

    console.log('[AUDIO]', 'SRC_CHANGE', trackName);
    setIsTransitioning(true);
    
    // Simple transition: Fade out -> Swap Src -> Play -> Fade in
    if (!isMusicMuted && isPrimed) {
      if (lastFadeInterval) clearInterval(lastFadeInterval);
      
      let fadeStep = 0;
      const maxVolume = 0.3;
      lastFadeInterval = setInterval(() => {
        fadeStep++;
        musicSprite.volume = Math.max(0, maxVolume * (1 - (fadeStep / 10)));
        
        if (fadeStep >= 10) {
          if (lastFadeInterval) clearInterval(lastFadeInterval);
          
          musicSprite.src = `/sounds/${trackName}`;
          musicSprite.load();
          set({ currentTrack: trackName });
          
          const onCanPlay = () => {
            musicSprite.removeEventListener('canplay', onCanPlay);
            
            let fadeInStep = 0;
            lastFadeInterval = setInterval(() => {
              fadeInStep++;
              musicSprite.volume = Math.min(maxVolume, maxVolume * (fadeInStep / 10));
              if (fadeInStep >= 10) {
                if (lastFadeInterval) clearInterval(lastFadeInterval);
                setIsTransitioning(false);
                console.log('[AUDIO]', 'SRC_CHANGE_COMPLETE', trackName);
              }
            }, 50);

            playingPromise = musicSprite.play();
            playingPromise.catch(() => { playingPromise = null; });
          };
          
          musicSprite.addEventListener('canplay', onCanPlay);
        }
      }, 50);
    } else {
      musicSprite.src = `/sounds/${trackName}`;
      musicSprite.load();
      set({ currentTrack: trackName });
      setIsTransitioning(false);
    }
  },

  setIsTransitioning: (v: boolean) => set({ isTransitioning: v }),
  
  playHit: () => {
    if (hit) {
      const soundClone = hit.cloneNode() as HTMLAudioElement;
      soundClone.volume = 1.0;
      soundClone.play().catch(() => {});
    }
  },
  
  playSuccess: () => {
    if (success) {
      success.currentTime = 0;
      success.play().catch(() => {});
    }
  },
  
  playLegal: () => {
    if (legal) {
      const soundClone = legal.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.6;
      soundClone.play().catch(() => {});
    }
  },
  
  playCash4: () => {
    if (cash4) {
      const soundClone = cash4.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.8;
      soundClone.play().catch(() => {});
    }
  },
  
  playPlop: () => {
    if (plop) {
      const soundClone = plop.cloneNode() as HTMLAudioElement;
      soundClone.volume = 1.0;
      soundClone.play().catch(() => {});
    }
  },
  
  playUpgrade: () => {
    if (upgrade) {
      const soundClone = upgrade.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.6;
      soundClone.play().catch(() => {});
    }
  },
  
  playZap: () => {
    if (zap) {
      zap.currentTime = 0;
      zap.volume = 0.4;
      zap.play().catch(() => {});
    }
  },
  
  playAlert: () => {
    if (alertSoundEffect) {
      const soundClone = alertSoundEffect.cloneNode() as HTMLAudioElement;
      soundClone.volume = 1.0;
      soundClone.play().catch(() => {});
    }
  },
  
  playCollect: () => {
    if (collect) {
      const soundClone = collect.cloneNode() as HTMLAudioElement;
      soundClone.volume = 1.0;
      soundClone.play().catch(() => {});
    }
  },
  
  playOrbding: () => {
    if (orbding) {
      const soundClone = orbding.cloneNode() as HTMLAudioElement;
      soundClone.volume = 1.0;
      soundClone.play().catch(() => {});
    }
  }
}));
