// Game Name Change Utilities
// Simple functions to change game name without reloading

import { setGameName, getGameConfig } from '../config/GameConfig';

// Make game name functions available globally for easy testing
declare global {
  interface Window {
    changeGameName: (name: string, description?: string) => void;
    resetGameName: () => void;
    getCurrentGameName: () => void;
  }
}

// Change game name instantly
window.changeGameName = (name: string, description?: string) => {
  setGameName(name, description);
  console.log(`🎮 Game name changed to: ${name}`);
  console.log(`📄 Description: ${description || getGameConfig().description}`);
  
  // Update any displayed titles immediately without reload
  const titleElements = document.querySelectorAll('[data-game-title]');
  titleElements.forEach(el => {
    el.textContent = name;
  });
};

// Reset to original name
window.resetGameName = () => {
  setGameName("METAMAN", "Corporate Empire Game");
  console.log("🎮 Game name reset to METAMAN");
};

// Show current game name
window.getCurrentGameName = () => {
  const config = getGameConfig();
  console.log(`🎮 Current Game: ${config.name}`);
  console.log(`📄 Description: ${config.description}`);
};

// Export for TypeScript modules
export const gameNameUtils = {
  changeGameName: window.changeGameName,
  resetGameName: window.resetGameName,
  getCurrentGameName: window.getCurrentGameName
};

// Log available commands
console.log(`
🎮 Game Name Commands Available:
  changeGameName('New Name', 'New Description')  - Change game name instantly
  resetGameName()                                - Reset to METAMAN
  getCurrentGameName()                           - Show current name

Examples:
  changeGameName('Dopamine Dealer Dan', 'Social Media Empire Builder')
  changeGameName('Viral Tycoon', 'Build your content empire')
`);