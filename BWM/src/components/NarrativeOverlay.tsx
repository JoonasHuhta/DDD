import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStoryStore } from '../stores/useStoryStore';

interface NarrativeOverlayProps {
  onStart: () => void;
}

export const NarrativeOverlay: React.FC<NarrativeOverlayProps> = ({ onStart }) => {
  const { phase, soundOn, toggleSound, approachDist, bearLying, eventDone, setPhase, setEventDone } = useStoryStore();
  const [currentText, setCurrentText] = useState<string | null>(null);
  const [textClass, setTextClass] = useState('');

  // Story Sequence Logic
  useEffect(() => {
    if (phase === 'intro') {
      runIntro();
    }
  }, [phase]);

  const runIntro = async () => {
    await showText('My grandfather said the bear knows when its time has come.', 4500, 'italic');
    await sleep(400);
    await showText('Said it chooses.', 3500, 'italic');
    await sleep(400);
    await showText('I did not believe him then.', 4000, 'italic');
    await sleep(800);
    setCurrentText(null);
    await sleep(1200);
    setPhase('forest');
  };

  const showText = (text: string, duration: number, className = '') => {
    return new Promise<void>((resolve) => {
      setTextClass(className);
      setCurrentText(text);
      if (duration > 0) {
        setTimeout(() => {
          setCurrentText(null);
          setTimeout(resolve, 1600);
        }, duration);
      } else {
        resolve();
      }
    });
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // Handle ritual event trigger via React side
  useEffect(() => {
    if (phase === 'forest' && bearLying && approachDist < 130 && !eventDone) {
      // Show click prompt
    }
  }, [phase, bearLying, approachDist, eventDone]);

  const handleRitualClick = async () => {
    if (eventDone) return;
    setEventDone(true);
    setPhase('event');
    
    setCurrentText(null);
    await showText('I no longer know how this is done.', 4000, 'italic');
    await sleep(300);
    await showText('My grandfather knew. His father knew.', 3800, 'italic');
    await sleep(300);
    await showText('I was too young and then they were gone.', 4500, 'italic');
    await sleep(600);
    await showText('But I remember something.', 3200, 'italic');
    await sleep(400);
    await showText('<span class="highlight">Is that enough?</span>', 4000, 'italic');
    setCurrentText(null);
    await sleep(1000);
    
    // Simulate fade transition
    setPhase('aftermath');
    await sleep(1000);
    
    await showText('I did it.', 3000, 'italic');
    await sleep(200);
    await showText('But not properly.', 3500, 'italic');
    await sleep(200);
    await showText('No song. No procession. No community.', 4000, 'italic');
    await sleep(300);
    await showText('The skull remained on the ground.', 3800, 'italic');
    await sleep(800);
    await showText('<span class="highlight">Forgive me.</span>', 4000, 'italic');
    setCurrentText(null);
    await sleep(2000);
    setPhase('end');
  };

  return (
    <>
      <div id="vignette" />
      <div id="grain" />
      
      {/* Title Screen */}
      <AnimatePresence>
        {phase === 'title' && (
          <motion.div 
            id="title-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 3 }}
            >
              BEAR WITH ME
            </motion.h1>
            <motion.div 
              className="subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.5, duration: 3 }}
            >
              Please. Wait for me.
            </motion.div>
            <motion.button 
              id="start-btn" 
              onClick={onStart}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4, duration: 3 }}
              whileHover={{ color: '#c8922a' }}
            >
              — begin —
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Narrative Layer */}
      <div id="text-layer">
        <AnimatePresence mode="wait">
          {currentText && (
            <motion.div
              key={currentText}
              className={`story-text ${textClass}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.8 }}
              dangerouslySetInnerHTML={{ __html: currentText }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Global UI Elements */}
      {phase !== 'title' && (
        <motion.button 
          id="sound-btn"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={toggleSound}
        >
          sound: {soundOn ? 'on' : 'off'}
        </motion.button>
      )}

      {/* Interaction Prompts */}
      <AnimatePresence>
        {phase === 'forest' && bearLying && approachDist < 200 && !eventDone && (
          <motion.div 
            id="breath"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {approachDist < 130 ? (
              <motion.span 
                onClick={handleRitualClick} 
                style={{ cursor: 'pointer', pointerEvents: 'all', color: '#c8922a' }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                click to begin the rite
              </motion.span>
            ) : (
              <motion.span animate={{ opacity: [0.25, 0.5, 0.25] }} transition={{ duration: 4, repeat: Infinity }}>
                approach slowly
              </motion.span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Screen Layer */}
      <AnimatePresence>
        {phase === 'end' && (
          <motion.div 
            id="end-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            style={{ pointerEvents: 'all' }}
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 2.5 }}
            >
              Three months later I found the skull.{"\n"}
              It lay in the moss like a question.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4, duration: 2.5 }}
            >
              The bear had not found its way home.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 7, duration: 2.5 }}
            >
              So I went.
            </motion.p>
            <motion.button 
              id="restart-btn"
              onClick={() => window.location.reload()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 10, duration: 2 }}
              whileHover={{ color: '#c8922a', opacity: 1 }}
            >
              — from the beginning —
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene Transitions */}
      <motion.div 
        id="fade" 
        animate={{ opacity: (phase === 'event' || phase === 'end') ? 1 : 0 }}
        transition={{ duration: 2.5 }}
      />
    </>
  );
};
