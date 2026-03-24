// Simple Game Configuration
// Change the game name and description here without affecting functionality

export const GAME_CONFIG = {
  name: "Dopamine Dealer Dan",
  description: "Social Media Empire Builder",
  subtitle: "Build your addictive social platform empire"
};

// Helper to get current game config
export function getGameConfig() {
  return GAME_CONFIG;
}

// Update game name dynamically
export function setGameName(name: string, description?: string) {
  GAME_CONFIG.name = name;
  if (description) {
    GAME_CONFIG.description = description;
  }
  
  // Update page title immediately
  document.title = `${GAME_CONFIG.name} - ${GAME_CONFIG.description}`;
  
  console.log(`🎮 Game renamed to: ${GAME_CONFIG.name}`);
}