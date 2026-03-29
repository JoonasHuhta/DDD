import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, AlertTriangle, Cpu, Lock, Unlock, Database } from 'lucide-react';
import { useMetamanGame } from '../../lib/stores/useMetamanGame';
import AdaptiveButton from '../AdaptiveButton';
import AdaptivePanel from '../AdaptivePanel';

const HEX_CHARS = '0123456789ABCDEF';
const GRID_SIZE = 25;
const SEQUENCE_LENGTH = 4;

const EspionageMinigame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { dataInventory, addDataToMarketInventory, updateCharacterState, regulatoryRisk, researchState, resolveResearchLeak } = useMetamanGame();
  
  const isDefensive = researchState.isLeakActive;
  
  const [targetSequence, setTargetSequence] = useState<string[]>([]);
  const [currentGrid, setCurrentGrid] = useState<string[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('playing');
  const [feedback, setFeedback] = useState<string | null>(null);

  const generateHex = () => HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)] + HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)];

  const initializeGame = useCallback(() => {
    const sequence = Array.from({ length: SEQUENCE_LENGTH }, generateHex);
    setTargetSequence(sequence);
    
    // Fill grid and ensure sequence exists
    const grid = Array.from({ length: GRID_SIZE }, generateHex);
    // Randomly place sequence in grid (not necessarily contiguous for this version)
    // Actually, let's make it a "find these 4 hexes" game
    setCurrentGrid(grid);
    setSelectedIndices([]);
    // For defensive mode, give less time to make it harder
    setTimeLeft(isDefensive ? 10 : 15);
    setGameState('playing');
    setFeedback(null);
  }, [isDefensive]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    if (gameState !== 'playing') return;
    
    if (timeLeft <= 0) {
      handleGameOver(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
      
      // Shuffle grid slightly every 2 seconds to make it harder
      if (timeLeft % 2 === 0) {
        setCurrentGrid(prev => prev.map((char, i) => 
          selectedIndices.includes(i) ? char : Math.random() > 0.8 ? generateHex() : char
        ));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, gameState, selectedIndices]);

  const handleHexClick = (index: number) => {
    if (gameState !== 'playing' || selectedIndices.includes(index)) return;

    const clickedHex = currentGrid[index];
    const nextTarget = targetSequence[selectedIndices.length];

    if (clickedHex === nextTarget) {
      const newIndices = [...selectedIndices, index];
      setSelectedIndices(newIndices);
      
      if (newIndices.length === SEQUENCE_LENGTH) {
        handleGameOver(true);
      }
    } else {
      // Penalty: lose time
      setTimeLeft(prev => Math.max(0, prev - 3));
      setFeedback("SIGNAL INTERRUPTED -3s");
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const handleGameOver = (won: boolean) => {
    setGameState(won ? 'won' : 'lost');
    
    if (isDefensive) {
      if (won) {
        setFeedback("BREACH PREVENTED: Research Secured! +Data");
        resolveResearchLeak(true);
      } else {
        setFeedback("DEFENSE FAILED: Research Progress Lost!");
        resolveResearchLeak(false);
      }
    } else {
      if (won) {
        const reward = Math.floor(Math.random() * 500) + 200;
        // Add behavioral data to market inventory
        addDataToMarketInventory('behavioral', reward);
        setFeedback(`BREACH SUCCESSFUL: +${reward} Behavioral Data`);
      } else {
        // Increase Heat
        updateCharacterState('walsh', { suspicion: (useMetamanGame.getState().characters.walsh.suspicion || 0) + 10 });
        setFeedback("BREACH DETECTED: SUSPICION INCREASED");
      }
    }
  };

  return (
    <AdaptivePanel
      title={isDefensive ? "RIVALCORP INTRUSION DETECTED" : "CORPORATE ESPIONAGE"}
      onClose={onClose}
      className={`max-w-md w-full shadow-[0_0_20px_rgba(0,255,65,0.2)] ${isDefensive ? 'border-red-500' : 'border-[#00ff41]'}`}
    >
      <div className="flex flex-col gap-4 font-mono max-h-[70vh] overflow-y-auto px-2 scrollbar-thin">
        {/* Header Info */}
        <div className={`flex justify-between items-center text-xs ${isDefensive ? 'text-red-500' : 'text-[#00ff41]'}`}>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span>SYS STATUS: {gameState.toUpperCase()}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className={timeLeft < 5 ? 'text-red-500 animate-pulse' : ''}>TIME: {timeLeft}s</span>
          </div>
        </div>

        {/* Target Sequence */}
        <div className={`bg-black/50 p-3 border rounded-lg flex flex-col items-center gap-2 ${isDefensive ? 'border-red-500/30' : 'border-[#00ff41]/30'}`}>
          <span className={`text-[10px] uppercase tracking-widest ${isDefensive ? 'text-red-500/60' : 'text-[#00ff41]/60'}`}>
            {isDefensive ? 'Threat Signature' : 'Target Signature'}
          </span>
          <div className="flex gap-2">
            {targetSequence.map((hex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: i < selectedIndices.length ? 0.3 : 1,
                  scale: i < selectedIndices.length ? 0.9 : 1,
                  borderColor: i < selectedIndices.length ? (isDefensive ? '#ef4444' : '#00ff41') : '#333'
                }}
                className={`w-10 h-10 border-2 rounded flex items-center justify-center font-bold ${
                  i < selectedIndices.length 
                    ? (isDefensive ? 'bg-red-500/20 text-red-500' : 'bg-[#00ff41]/20 text-[#00ff41]') 
                    : 'text-white'
                }`}
              >
                {hex}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Grid Grid */}
        <div className={`grid grid-cols-5 gap-2 bg-black/80 p-4 rounded-xl border ${isDefensive ? 'border-red-500/20' : 'border-[#00ff41]/20'}`}>
          {currentGrid.map((hex, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1, backgroundColor: isDefensive ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0, 255, 65, 0.1)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleHexClick(i)}
              className={`h-12 border rounded flex items-center justify-center text-sm font-bold transition-colors ${
                selectedIndices.includes(i)
                  ? (isDefensive ? 'bg-red-500 text-black border-red-500' : 'bg-[#00ff41] text-black border-[#00ff41]')
                  : (isDefensive ? 'border-red-500/10 text-red-500/70' : 'border-[#00ff41]/10 text-[#00ff41]/70')
              }`}
            >
              {hex}
            </motion.button>
          ))}
        </div>

        {/* Feedback Overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`text-center py-2 rounded font-black text-sm ${
                feedback.includes('SUCCESS') || feedback.includes('PREVENTED') ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          {gameState !== 'playing' && !isDefensive && (
            <AdaptiveButton
              onClick={initializeGame}
              variant="primary"
              className="flex-1 bg-[#00ff41] text-black hover:bg-[#00cc33]"
            >
              REBOOT SYSTEM
            </AdaptiveButton>
          )}
          <AdaptiveButton
            onClick={onClose}
            variant="ghost"
            className={`flex-1 border ${isDefensive ? 'border-red-500/30 text-red-500' : 'border-[#00ff41]/30 text-[#00ff41]'}`}
          >
            DISCONNECT
          </AdaptiveButton>
        </div>
      </div>
    </AdaptivePanel>
  );
};

// Internal Clock component for the icon
const Clock = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default EspionageMinigame;
