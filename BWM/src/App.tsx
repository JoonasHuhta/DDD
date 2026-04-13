import { useEffect, useState } from 'react';
import { useStoryStore } from './stores/useStoryStore';
import { GameCanvas } from './components/GameCanvas';
import { NarrativeOverlay } from './components/NarrativeOverlay';
import { AudioController } from './components/AudioController';

function App() {
  const { setPhase, setBearLying } = useStoryStore();
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  // Handle global mouse movement for player targeting and custom cursor
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleStartGame = () => {
    setPhase('intro');
    
    // Trigger bear lying down after delay matching prototype
    setTimeout(() => {
      setBearLying(true);
    }, 6000);
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-background">
      {/* Custom Cursor */}
      <div 
        id="cursor" 
        style={{ 
          left: `${cursorPos.x}px`, 
          top: `${cursorPos.y}px`,
          position: 'fixed'
        }} 
      />

      {/* Rendering Layers */}
      <GameCanvas />
      
      {/* Narrative & Interaction Layer */}
      <NarrativeOverlay onStart={handleStartGame} />
      
      {/* Invisible Logic Layer */}
      <AudioController />
    </div>
  );
}

export default App;
