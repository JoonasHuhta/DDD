import { create } from "zustand";

export const MUSIC_TRACKS = ['Forgo1.mp3', 'Forgo2.mp3', 'Forgo3.mp3', 'Forgo4.mp3', 'Forgo5.mp3'];

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
const musicA = typeof Audio !== 'undefined' ? new Audio("/sounds/Forgo1.mp3") : null;
const musicB = typeof Audio !== 'undefined' ? new Audio("/sounds/Forgo2.mp3") : null;
let activeIdx = 0; // 0 for A, 1 for B

if (musicA) musicA.volume = 0.3;
if (musicB) musicB.volume = 0; // Inactive starts silent

const getPlayers = () => ({
  active: activeIdx === 0 ? musicA : musicB,
  inactive: activeIdx === 0 ? musicB : musicA
});

const hit = typeof Audio !== 'undefined' ? new Audio("/sounds/hit.mp3") : null;
if (hit) hit.volume = 0.5;

const success = typeof Audio !== 'undefined' ? new Audio("/sounds/success.mp3") : null;
if (success) success.volume = 0.7;

const legal = typeof Audio !== 'undefined' ? new Audio("/sounds/hit.mp3") : null;
if (legal) legal.volume = 0.6;

const cash4 = typeof Audio !== 'undefined' ? new Audio("/sounds/cash4.wav") : null;
if (cash4) cash4.volume = 0.8;

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: musicA, // Just a reference for types, logic uses getPlayers()
  hitSound: hit,
  successSound: success,
  legalSound: legal,
  isMuted: false,
  isInitialized: false,
  isTransitioning: false,
  currentTrack: "Forgo1.mp3",
  
  initAudio: () => {
    if (get().isInitialized) return;
    
    // Setup ended listener for automatic progression (will be re-registered on swap)
    const registerEnded = (player: HTMLAudioElement) => {
      player.addEventListener('ended', () => {
        const { isMuted, isTransitioning, currentTrack, setTrack } = get();
        console.log('[AUDIO]', 'ENDED_EVENT', 'Moving to next track from', currentTrack);
        if (!isMuted && !isTransitioning) {
          const currentIndex = MUSIC_TRACKS.indexOf(currentTrack);
          const nextIndex = (currentIndex + 1) % MUSIC_TRACKS.length;
          setTrack(MUSIC_TRACKS[nextIndex]);
        }
      }, { once: true });
    };

    if (musicA) registerEnded(musicA);
    if (musicB) registerEnded(musicB);

    set({ isInitialized: true });
    console.log('[AUDIO]', 'INIT_DUAL_BUFFERS', activeIdx, get().isTransitioning);
  },
  
  toggleMute: () => {
    const { isMuted, isTransitioning } = get();
    const newMutedState = !isMuted;
    const { active, inactive } = getPlayers();
    
    set({ isMuted: newMutedState });
    console.log('[AUDIO]', 'TOGGLE_MUTE', newMutedState, 'TRANSITIONING:', isTransitioning);
    
    if (newMutedState) {
      // Mute active/inactive immediately
      if (active) { active.pause(); active.volume = 0; }
      if (inactive) { inactive.pause(); inactive.volume = 0; }
    } else {
      // Unmute active only
      if (active && !isTransitioning) {
        active.volume = 0.3;
        active.play().catch(() => {});
      }
    }
  },
  
  playBackgroundMusic: () => {
    const { isMuted, isInitialized, isTransitioning } = get();
    if (!isInitialized) return;
    const { active } = getPlayers();
    
    console.log('[AUDIO]', 'PLAY_BG_REQUEST', 'MUTED:', isMuted, 'TRANSITION:', isTransitioning);

    if (active && !isMuted && !isTransitioning && active.paused) {
      active.play().catch(error => {
        if (error.name !== 'NotAllowedError') {
          console.warn("[AUDIO] Background music play error:", error);
        }
      });
    }
  },
  
  pauseBackgroundMusic: () => {
    const { isTransitioning } = get();
    const { active, inactive } = getPlayers();
    console.log('[AUDIO]', 'PAUSE_BG', 'TRANSITION:', isTransitioning);
    if (active && !active.paused) active.pause();
    if (inactive && !inactive.paused) inactive.pause();
  },
  
  setTrack: (trackName: string) => {
    const { active, inactive } = getPlayers();
    if (!active || !inactive) return;
    
    // Don't reload if already playing this track
    const { currentTrack, isMuted, setIsTransitioning } = get();
    if (currentTrack === trackName && !active.paused) return;

    console.log('[AUDIO]', 'LOAD_START', trackName, 'on buffer', activeIdx === 0 ? 'B' : 'A');
    setIsTransitioning(true);
    
    // Prepare inactive buffer
    inactive.src = `/sounds/${trackName}`;
    inactive.volume = 0;
    inactive.load(); // Force load
    set({ currentTrack: trackName });

    let hasTransitioned = false;
    
    const performTransition = () => {
      if (hasTransitioned) return;
      hasTransitioned = true;
      
      console.log('[AUDIO]', 'SWAP_BUFFERS', 'New track ready:', trackName);
      
      // Swap IDs
      activeIdx = activeIdx === 0 ? 1 : 0;
      const players = getPlayers(); // Get newly swapped
      
      // Re-register ended listener for the new active player
      players.active?.addEventListener('ended', () => {
        const state = get();
        console.log('[AUDIO]', 'ENDED_EVENT', 'Moving to next track from', state.currentTrack);
        if (!state.isMuted && !state.isTransitioning) {
          const currentIndex = MUSIC_TRACKS.indexOf(state.currentTrack);
          const nextIndex = (currentIndex + 1) % MUSIC_TRACKS.length;
          state.setTrack(MUSIC_TRACKS[nextIndex]);
        }
      }, { once: true });

      if (!isMuted) {
        players.active?.play().catch(() => {});
        
        // Simple crossfade
        let fadeStep = 0;
        const fadeInterval = setInterval(() => {
          fadeStep++;
          const progress = fadeStep / 10;
          if (players.active) players.active.volume = 0.3 * progress;
          if (players.inactive) players.inactive.volume = 0.3 * (1 - progress);
          
          if (fadeStep >= 10) {
            clearInterval(fadeInterval);
            setIsTransitioning(false);
            if (players.inactive) {
              players.inactive.pause();
              players.inactive.currentTime = 0;
            }
            console.log('[AUDIO]', 'TRANSITION_COMPLETE', trackName);
          }
        }, 50);
      } else {
        setIsTransitioning(false);
      }
    };

    // Transition when ready OR after safety timeout
    inactive.addEventListener('canplaythrough', performTransition, { once: true });
    setTimeout(performTransition, 3000); // 3s safety fallback
  },

  setIsTransitioning: (v: boolean) => {
    const { active } = getPlayers();
    console.log('[AUDIO]', 'SET_TRANSITIONING', v, 'Active:', active?.currentTime || 0, 'Paused:', active?.paused || true);
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
