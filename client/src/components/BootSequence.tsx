import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, AlertTriangle, CheckCircle2, XCircle, Info, ChevronRight, User } from 'lucide-react';

interface BootSequenceProps {
  onComplete: () => void;
}

const BOOT_LINES = [
  { label: 'GREED', value: 'LOADED', icon: <CheckCircle2 className="w-3 h-3 text-green-400" />, delay: 400 },
  { label: 'ETHICS', value: 'SKIPPED', icon: <XCircle className="w-3 h-3 text-orange-400" />, delay: 300 },
  { label: 'USER MANIPULATION', value: 'ACTIVE', icon: <CheckCircle2 className="w-3 h-3 text-green-400" />, delay: 500 },
  { label: 'SHAME', value: 'DISABLED', icon: <XCircle className="w-3 h-3 text-orange-400" />, delay: 300 },
  { label: 'COMPLIANCE', value: 'LOL', icon: <XCircle className="w-3 h-3 text-orange-400" />, delay: 400 },
  { label: 'LARRY', value: 'NERVOUS', icon: <AlertTriangle className="w-3 h-3 text-yellow-400 animate-pulse" />, delay: 600 },
  { label: 'ACCOUNTANTS', value: 'CREATIVE', icon: <CheckCircle2 className="w-3 h-3 text-green-400" />, delay: 400 },
  { label: 'DENIABILITY', value: 'READY', icon: <CheckCircle2 className="w-3 h-3 text-green-400" />, delay: 400 },
];

export default function BootSequence({ onComplete }: BootSequenceProps) {
  const [activeLines, setActiveLines] = useState<number>(0);
  const [isSkipped, setIsSkipped] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isSkipped) {
      setActiveLines(BOOT_LINES.length);
      setIsReady(true);
      return;
    }

    if (activeLines < BOOT_LINES.length) {
      const timer = setTimeout(() => {
        setActiveLines(prev => prev + 1);
      }, BOOT_LINES[activeLines].delay);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setIsReady(true), 500);
      return () => clearTimeout(timer);
    }
  }, [activeLines, isSkipped]);

  const handleSkip = () => {
    if (!isReady) setIsSkipped(true);
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] bg-[#87CEEB] flex items-center justify-center p-4 sm:p-8 overflow-hidden touch-none select-none"
      onClick={handleSkip}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        // FIXED HEIGHT: prevents jumping when the button appears
        className="w-full max-w-sm sm:max-w-md h-[520px] bg-[#1a1b26] border-[6px] border-[#FFD700] rounded-[2rem] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden relative"
      >
        {/* Terminal Header */}
        <div className="bg-black/60 border-b-2 border-white/10 p-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F56] shadow-[0_0_8px_#FF5F56]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E] shadow-[0_0_8px_#FFBD2E]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#27C93F] shadow-[0_0_8px_#27C93F]" />
          </div>
          <div className="flex items-center gap-2">
            <User className="w-3 h-3 text-[#FFD700]" />
            <div className="text-[9px] font-black text-[#FFD700] uppercase tracking-widest italic opacity-80">
              DAN CORP OS v6.6.6
            </div>
          </div>
        </div>

        {/* Terminal Content Wrapper with CRT Flicker */}
        <div className="p-4 sm:p-5 font-mono text-[11px] space-y-2 flex-1 relative overflow-hidden animate-[flicker_0.15s_infinite_alternate]">
          {/* Internal CRT Scanlines (More intense) */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.1] bg-[repeating-linear-gradient(0deg,_black_0px,_black_2px,_transparent_2px,_transparent_4px)]"></div>

          <div className="text-[#565f89] mb-2 uppercase font-black tracking-tighter text-[10px]">
            {">"} INITIALIZING SYSTEMS... 
          </div>

          <div className="space-y-1 relative z-10 text-white">
            {BOOT_LINES.map((line, index) => (
              <AnimatePresence key={line.label}>
                {index < activeLines && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between group"
                  >
                    <span className="text-[#a9b1d6] font-bold uppercase tracking-tight text-[10px]">{line.label}</span>
                    <div className="flex-1 border-b border-white/5 mx-2 h-2 opacity-20" />
                    <div className="flex items-center gap-2">
                      <span className={`font-black italic text-[10px] ${
                        line.value === 'SKIPPED' || line.value === 'DISABLED' || line.value === 'LOL' ? 'text-orange-400' :
                        line.value === 'NERVOUS' ? 'text-yellow-400' : 'text-green-400'
                      }`}>
                        {line.value}
                      </span>
                      {line.icon}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>

          {/* Critical Warnings (Comic-style Alert) */}
          <AnimatePresence>
            {activeLines === BOOT_LINES.length && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                className="mt-6 p-3 bg-[#f7768e] border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative z-10 animate-[shake_0.5s_ease-in-out_infinite_alternate]"
              >
                <div className="text-white font-black uppercase text-[12px] flex items-center gap-2 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.5)]">
                  <AlertTriangle className="w-4 h-4 fill-white text-[#f7768e]" /> !! MISSING MODULE !!
                </div>
                <div className="mt-1 text-black font-black italic text-[11px] uppercase tracking-tighter">
                   Empathy.exe — NOT FOUND
                </div>
                <div className="absolute -bottom-2 -right-2 bg-black text-white text-[8px] px-1 font-bold uppercase rotate-3">
                   CRITICAL_ERROR
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* System Ready Prompt */}
          <AnimatePresence>
            {isReady && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 flex items-center gap-2 text-[#FFD700] relative z-10"
              >
                <span className="font-black uppercase tracking-widest text-[11px] drop-shadow-[0_0_5px_#FFD700]">SYSTEM READY</span>
                <motion.div 
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                  className="w-2.5 h-4 bg-[#FFD700] shadow-[0_0_8px_#FFD700]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Action Area (Fixed Position at bottom of window) */}
        <div className="h-[130px] relative shrink-0">
          <AnimatePresence>
            {isReady && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 p-4 bg-black/40 border-t-2 border-white/5 flex flex-col items-center z-[100]"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onComplete();
                  }}
                  className="w-full bg-white text-black py-4 rounded-2xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all font-black uppercase text-sm sm:text-base tracking-tight hover:bg-[#FFD700] group"
                >
                  <span className="group-hover:scale-110 transition-transform inline-block">
                    [ ACCEPT ALL TERMS ]
                  </span>
                </button>
                <div className="mt-2 text-center space-y-1 opacity-50">
                  <div className="text-[8px] font-bold text-white uppercase tracking-widest leading-none">
                    You have not read these terms.
                  </div>
                  <div className="text-[8px] font-bold text-white uppercase tracking-widest italic leading-none">
                    Neither has Dan.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* FIXED SKIP BUTTON AT BOTTOM RIGHT (Always visible as requested) */}
      <AnimatePresence>
        <motion.button
          key="fixed-skip-button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={(e) => {
            e.stopPropagation();
            handleSkip();
            if (isReady) onComplete(); // If already ready, Skip acts as the final confirmation
          }}
          className="fixed bottom-8 right-8 flex items-center gap-2 px-6 py-4 bg-black/80 backdrop-blur-xl rounded-2xl border-4 border-[#FFD700] text-[#FFD700] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFD700] hover:text-black transition-all z-[10001] group active:translate-y-1 active:shadow-none"
        >
          <span className="font-black uppercase tracking-widest text-sm">Skip</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flicker {
          0% { opacity: 0.97; }
          5% { opacity: 0.95; }
          10% { opacity: 0.9; }
          15% { opacity: 0.95; }
          20% { opacity: 0.98; }
          25% { opacity: 0.95; }
          30% { opacity: 0.9; }
          70% { opacity: 0.98; }
          80% { opacity: 0.9; }
          100% { opacity: 0.98; }
        }
        @keyframes shake {
          0% { transform: rotate(-1deg); }
          100% { transform: rotate(1deg); }
        }
      `}} />
    </div>
  );
}
