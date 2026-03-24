import { useEffect } from "react";
import Game from "./components/Game";
import MobileOptimizer from "./components/MobileOptimizer";
import GameTitle from "./components/GameTitle";
import { useAudio } from "./lib/stores/useAudio";
import { useMetamanGame } from "./lib/stores/useMetamanGame";
import { getGameConfig } from "./lib/config/GameConfig";
// Import game name utils for global access
import "./lib/utils/gameNameUtils";
// Import theme testing utils for global access
import "./lib/utils/themeTestUtils";
import "@fontsource/inter";

function App() {
  const initAudio = useAudio(state => state.initAudio);
  const simulateSafeArea = useMetamanGame(state => state.gameSettings.simulateSafeArea);
  const gameConfig = getGameConfig();

  useEffect(() => {
    // Initialize audio system once
    initAudio();

    // Update page title
    document.title = `${gameConfig.name} - ${gameConfig.description}`;
  }, [initAudio, gameConfig.name, gameConfig.description]);
  
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
        {/* Game Title Overlay - Only shown briefly or in loading */}
        {false && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
            <GameTitle showDescription={true} />
          </div>
        )}
        <Game />
      </div>
    </MobileOptimizer>
  );
}

export default App;
