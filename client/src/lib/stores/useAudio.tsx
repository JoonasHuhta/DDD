import { create } from "zustand";

// Removed infinitescroll.mp3 to save APK space as requested
export const MUSIC_TRACKS = ['Forgo1.mp3', 'Forgo2.mp3', 'Forgo3.mp3', 'Forgo4.mp3', 'Forgo5.mp3'];

// Web Audio API context - Singleton
const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
const audioCtx = typeof AudioContextClass !== 'undefined' ? new AudioContextClass() : null;

// Audio buffer cache
const audioBuffers: Record<string, AudioBuffer> = {};

// Background music remains HTMLAudioElement to avoid storing a huge decoded array in RAM
const musicSprite = typeof Audio !== 'undefined' ? new Audio() : null;
let playingPromise: Promise<void> | null = null;
let lastFadeInterval: ReturnType<typeof setInterval> | null = null;

if (musicSprite) {
  musicSprite.volume = 0.3;
  musicSprite.loop = true; 
  musicSprite.preload = "auto";
}

// SFX list to preload
const SFX_FILES = [
  'hit.mp3',
  'success.mp3',
  'cash4.mp3',
  'plop.mp3',
  'upgrade.mp3',
  'newzap.mp3',
  'alert.mp3',
  'collect.mp3',
  'orbding.mp3'
];

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
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
  
  // SFX triggers
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

// Web Audio API playback helper
const playBuffer = (bufferName: string, vol: number = 1.0) => {
  if (!audioCtx) return;
  const buffer = audioBuffers[bufferName];
  if (!buffer) {
    console.warn(`[AUDIO] Buffer not loaded: ${bufferName}`);
    return;
  }
  
  try {
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = vol;
    
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    // Explicit garbage collection as per user feedback
    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
    };
    
    source.start(0);
  } catch (e) {
    console.warn('[AUDIO] playBuffer failed:', e);
  }
};

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: musicSprite,
  isMusicMuted: false,
  isInitialized: false,
  isPrimed: false,
  isTransitioning: false,
  currentTrack: "Forgo1.mp3",
  
  initAudio: () => {
    if (get().isInitialized) return;
    
    // 1. Preload SFX buffers asynchronously
    if (audioCtx) {
      SFX_FILES.forEach(async (file) => {
        try {
          const response = await fetch(`/sounds/${file}`);
          const arrayBuffer = await response.arrayBuffer();
          const decodedData = await audioCtx.decodeAudioData(arrayBuffer);
          audioBuffers[file] = decodedData;
        } catch (err) {
          console.warn(`[AUDIO] Failed to preload ${file}:`, err);
        }
      });
    }

    // 2. Setup Background Music Recovery
    if (musicSprite) {
      musicSprite.addEventListener('stalled', () => {
        console.warn('[AUDIO]', 'STALLED', 'Attempting recovery...');
        const { isMusicMuted, isTransitioning, isPrimed } = get();
        if (!isMusicMuted && !isTransitioning && isPrimed) get().playBackgroundMusic();
      });

      musicSprite.addEventListener('error', (e) => {
        console.error('[AUDIO]', 'ELEMENT_ERROR', musicSprite.error);
      });

      musicSprite.src = "/sounds/Forgo1.mp3";
      musicSprite.load();
    }
    
    set({ isInitialized: true });
    console.log('[AUDIO]', 'INITIALIZED', 'Web Audio API ready');
  },

  primeAudio: async () => {
    // SYNCHRONOUS RESUME for iOS compliance -> Must happen immediately in the event handler!
    if (audioCtx && audioCtx.state === 'suspended') {
      console.log('[AUDIO] Resuming AudioContext synchronously');
      audioCtx.resume();
    }

    const { isInitialized, isPrimed } = get();
    if (!isInitialized || isPrimed || !musicSprite) return;

    console.log('[AUDIO]', 'PRIMING_START');
    try {
      // Background music priming
      const originalVolume = 0.3;
      musicSprite.volume = 0.001; // Silent unlock
      
      await musicSprite.play();
      musicSprite.pause();
      
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
  
  // Note: 'legal' previously used hit.mp3, adjusting here
  playHit: () => playBuffer('hit.mp3', 1.0),
  playSuccess: () => playBuffer('success.mp3', 1.0),
  playLegal: () => playBuffer('hit.mp3', 0.6),
  playCash4: () => playBuffer('cash4.mp3', 0.8),
  playPlop: () => playBuffer('plop.mp3', 1.0),
  playUpgrade: () => playBuffer('upgrade.mp3', 0.6),
  playZap: () => playBuffer('newzap.mp3', 0.4),
  playAlert: () => playBuffer('alert.mp3', 1.0),
  playCollect: () => playBuffer('collect.mp3', 1.0),
  playOrbding: () => playBuffer('orbding.mp3', 1.0)
}));
