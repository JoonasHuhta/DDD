import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, ChevronRight, AlertCircle, Info } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { CHARACTERS, DIALOGUE_NODES, Character, DialogueNode, DialogueOption } from '../lib/gameEngine/CharacterLogic';

export default function CharacterDialogue() {
  const { 
    activeCharacter, 
    showCharacterDialogue, 
    setCharacterDialogue,
    updateCharacterState
  } = useMetamanGame();

  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Character lookup
  const charId = activeCharacter?.split('_')[0] || '';
  const character: Character = CHARACTERS[charId] || CHARACTERS.walsh;
  
  // Set initial node when dialogue opens
  useEffect(() => {
    if (showCharacterDialogue && activeCharacter) {
      setCurrentNodeId(activeCharacter);
    } else {
      setCurrentNodeId(null);
      setDisplayedText("");
    }
  }, [showCharacterDialogue, activeCharacter]);

  // Typewriter effect
  useEffect(() => {
    if (!currentNodeId) return;
    
    const node = DIALOGUE_NODES[currentNodeId];
    if (!node) return;

    setDisplayedText("");
    setIsTyping(true);
    
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(node.text.slice(0, i + 1));
      i++;
      if (i >= node.text.length) {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [currentNodeId]);

  if (!showCharacterDialogue || !currentNodeId) return null;

  const node = DIALOGUE_NODES[currentNodeId];
  if (!node) return null;

  const handleOption = (option: DialogueOption) => {
    if (option.action) {
      // Small delay for action to feel connected to the choice
      option.action(useMetamanGame.getState());
    }

    if (option.nextId) {
      setCurrentNodeId(option.nextId);
    } else {
      // End dialogue
      if (activeCharacter?.startsWith('walsh_intro')) {
        updateCharacterState('walsh', { flags: ['met_walsh'] });
      }
      setCharacterDialogue(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 pointer-events-auto"
      >
        <motion.div 
          initial={{ y: 50, scale: 0.9 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 50, scale: 0.9 }}
          className="w-full max-w-lg bg-white border-8 border-black rounded-[2rem] shadow-[12px_12px_0_0_rgba(0,0,0,1)] overflow-hidden relative"
        >
          {/* Header */}
          <div className="bg-black p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center text-2xl shadow-[2px_2px_0_0_white]">
                {character.portrait}
              </div>
              <div>
                <h3 className="text-white font-black text-xs uppercase italic leading-none">{character.name}</h3>
                <p className="text-[#FFD700] text-[8px] font-black uppercase tracking-tighter mt-1">{character.title}</p>
              </div>
            </div>
            <button 
              onClick={() => setCharacterDialogue(null)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Dialogue Body */}
          <div className="p-6 space-y-6">
            <div className="min-h-[100px] bg-gray-50 border-4 border-black p-4 rounded-2xl relative">
              <div className="absolute -top-3 left-6 px-3 bg-black text-white text-[8px] font-black uppercase italic rounded-full border-2 border-black">
                Incoming Message...
              </div>
              <p className="text-black font-black italic text-sm leading-relaxed">
                {displayedText}
                {isTyping && <span className="animate-pulse">|</span>}
              </p>
            </div>

            {/* Options */}
            {!isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {node.options?.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOption(option)}
                    className="w-full group flex items-center justify-between p-4 bg-white border-4 border-black rounded-2xl font-black uppercase italic text-xs transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 hover:bg-black hover:text-white active:translate-y-1 active:shadow-none"
                  >
                    <span className="flex-1 text-left">{option.text}</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Footer Branding */}
          <div className="px-6 py-3 border-t-4 border-black/10 flex items-center justify-between">
            <div className="flex items-center gap-1 opacity-40">
              <AlertCircle className="w-3 h-3 text-black" />
              <span className="text-[8px] font-black uppercase italic">DOPA-NETWORK ENCRYPTED</span>
            </div>
            <div className="text-[8px] font-black uppercase text-gray-400 italic">
              Metaman OS v2.4.0
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
