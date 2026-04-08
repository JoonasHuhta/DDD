import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetamanGame } from '../lib/stores/useMetamanGame';

/**
 * DetoxOverlay – stripped down.
 * 
 * Dan's spoken reactions now go through the EXISTING SpeechBubble system (triggered from engine).
 * This component only handles:
 * - Subtle green edge glow (ambient atmosphere)
 * - Offline citizen count badge
 * - Notification Relapse banner
 * - Offline citizen click tooltip
 */
export default function DetoxOverlay() {
  const detoxState = useMetamanGame(state => state.detoxState);
  const [showRelapse, setShowRelapse] = React.useState(false);
  const [offlineTooltip, setOfflineTooltip] = React.useState<string | null>(null);

  const isActive = detoxState.isActive;
  const phase = detoxState.phase;

  // Notification Relapse banner when citizens return
  useEffect(() => {
    if (detoxState.relapseWindowActive && !isActive) {
      setShowRelapse(true);
      const t = setTimeout(() => setShowRelapse(false), 5000);
      return () => clearTimeout(t);
    }
  }, [detoxState.relapseWindowActive, isActive]);

  // Register global tooltip trigger (called from GameCanvas on offline citizen tap)
  useEffect(() => {
    (window as any).__detoxShowTooltip = (tooltip: string) => {
      setOfflineTooltip(tooltip);
      setTimeout(() => setOfflineTooltip(null), 4000);
    };
    return () => { delete (window as any).__detoxShowTooltip; };
  }, []);

  const glowOpacity = phase === 'vortex' ? 0.40 : phase === 'pull' ? 0.22 : 0.10;

  return (
    <>
      {/* Green ambient edge glow – calm, not alarming */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="detox-glow"
            initial={{ opacity: 0 }}
            animate={{ opacity: glowOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            className="fixed inset-0 pointer-events-none z-[200]"
            style={{
              boxShadow: 'inset 0 0 60px 20px rgba(72, 199, 142, 0.6)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Offline citizen count badge – top center, small and unobtrusive */}
      <AnimatePresence>
        {isActive && detoxState.offlineCitizenCount > 0 && (
          <motion.div
            key="offline-badge"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="fixed top-[72px] left-1/2 transform -translate-x-1/2 z-[300] pointer-events-none"
          >
            <div className="bg-gray-800/85 border border-gray-500/60 rounded-full px-3 py-0.5 flex items-center gap-1.5">
              <span className="text-sm">📵</span>
              <span className="text-white font-black text-[11px] uppercase tracking-widest">
                {detoxState.offlineCitizenCount} offline
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Relapse banner – pops up briefly after TDG leaves */}
      <AnimatePresence>
        {showRelapse && (
          <motion.div
            key="relapse-banner"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.35 }}
            className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[300] pointer-events-none"
          >
            <div className="bg-yellow-400 border-4 border-black rounded-full px-5 py-1.5 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <span className="text-black font-black text-xs uppercase tracking-widest">
                ⚡ Notification Relapse! Users extra hungry for content
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline citizen tooltip – appears when player taps a grayed-out citizen */}
      <AnimatePresence>
        {offlineTooltip && (
          <motion.div
            key="offline-tooltip"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed top-1/3 left-1/2 transform -translate-x-1/2 z-[400] pointer-events-none"
          >
            <div className="bg-white border-4 border-black rounded-2xl px-5 py-3 shadow-[6px_6px_0_0_rgba(0,0,0,1)] max-w-[240px]">
              <p className="text-black font-black italic text-sm text-center leading-snug whitespace-pre-line">
                {offlineTooltip}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
