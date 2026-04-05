import { useEffect, useState } from "react";
import Game from "./components/Game";
import MobileOptimizer from "./components/MobileOptimizer";
import GameTitle from "./components/GameTitle";
import BootSequence from "./components/BootSequence";
import { useAudio } from "./lib/stores/useAudio";
import { useMetamanGame } from "./lib/stores/useMetamanGame";
import { getGameConfig } from "./lib/config/GameConfig";
import "./lib/utils/gameNameUtils";
import "./lib/utils/themeTestUtils";
import { motion, AnimatePresence } from "framer-motion";
import "@fontsource/inter";

function App() {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const primeAudio = useAudio(state => state.primeAudio);
  const playBackgroundMusic = useAudio(state => state.playBackgroundMusic);
  const simulateSafeArea = useMetamanGame(state => state.gameSettings.simulateSafeArea);
  const gameConfig = getGameConfig();

  const initAudio = useAudio(state => state.initAudio);

  useEffect(() => {
    // Initialize audio system once (sets source)
    initAudio();
    // Update page title
    document.title = `${gameConfig.name} - ${gameConfig.description}`;
  }, [initAudio, gameConfig.name, gameConfig.description]);

  const handleStartGame = async () => {
    try {
      // 1. Prime the audio (unlocks the element on mobile)
      await primeAudio();
      // 2. Start the music immediately
      playBackgroundMusic();
      // 3. Enter the game
      setHasAcceptedTerms(true);
    } catch (error) {
      console.error("[BOOT]", "Failed to start game audio", error);
      setHasAcceptedTerms(true); // Still proceed even if audio fails
    }
  };
  
  return (
    <MobileOptimizer>
      <div 
        className={simulateSafeArea ? 'debug-safe-area' : ''}
        style={{ 
          width: '100vw', 
          height: '100dvh', 
          position: 'relative', 
          overflow: 'hidden',
          backgroundColor: '#000000',
          paddingBottom: 'var(--safe-bottom)'
        }}
      >
        <AnimatePresence mode="wait">
          {!hasAcceptedTerms ? (
            <BootSequence key="boot" onComplete={handleStartGame} />
          ) : (
            <Game key="game" />
          )}
        </AnimatePresence>
      </div>
    </MobileOptimizer>
  );
}

export default App;
