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
  const { dataInventory, addDataToMarketInventory, updateCharacterState, regulatoryRisk } = useMetamanGame();
  
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
    setTimeLeft(15);
    setGameState('playing');
    setFeedback(null);
  }, []);

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
  };

  return (
    <AdaptivePanel
      title="CORPORATE ESPIONAGE"
      onClose={onClose}
      className="max-w-md w-full border-[#00ff41] shadow-[0_0_20px_rgba(0,255,65,0.2)]"
    >
      <div className="flex flex-col gap-4 font-mono max-h-[70vh] overflow-y-auto px-2 scrollbar-thin">
        {/* Header Info */}
        <div className="flex justify-between items-center text-[#00ff41] text-xs">
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
        <div className="bg-black/50 p-3 border border-[#00ff41]/30 rounded-lg flex flex-col items-center gap-2">
          <span className="text-[10px] text-[#00ff41]/60 uppercase tracking-widest">Target Signature</span>
          <div className="flex gap-2">
            {targetSequence.map((hex, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: i < selectedIndices.length ? 0.3 : 1,
                  scale: i < selectedIndices.length ? 0.9 : 1,
                  borderColor: i < selectedIndices.length ? '#00ff41' : '#333'
                }}
                className={`w-10 h-10 border-2 rounded flex items-center justify-center font-bold ${
                  i < selectedIndices.length ? 'bg-[#00ff41]/20 text-[#00ff41]' : 'text-white'
                }`}
              >
                {hex}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Grid Grid */}
        <div className="grid grid-cols-5 gap-2 bg-black/80 p-4 rounded-xl border border-[#00ff41]/20">
          {currentGrid.map((hex, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1, backgroundColor: 'rgba(0, 255, 65, 0.1)' }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleHexClick(i)}
              className={`h-12 border rounded flex items-center justify-center text-sm font-bold transition-colors ${
                selectedIndices.includes(i)
                  ? 'bg-[#00ff41] text-black border-[#00ff41]'
                  : 'border-[#00ff41]/10 text-[#00ff41]/70'
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
                feedback.includes('SUCCESS') ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {feedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-2 mt-2">
          {gameState !== 'playing' && (
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
            className="flex-1 border-[#00ff41]/30 text-[#00ff41]"
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
