// Theme Testing Utilities
// Console commands to test different themes without reloading

import { GAME_THEMES, setGameTheme } from '../config/GameThemes';

// Make theme testing functions available globally
declare global {
  interface Window {
    testCartoonTheme: () => void;
    testTheme: (themeName: string) => void;
    listThemes: () => void;
    getCurrentGameTheme: () => void;
    cycleThemes: () => void;
  }
}

// Test cartoon theme specifically 
window.testCartoonTheme = () => {
  console.log('🎨 Testing Cartoon Theme (Bloons/Night in the Woods style)...');
  window.testTheme('cartoonWorld');
};

// Test any theme
window.testTheme = (themeName: string) => {
  if (GAME_THEMES[themeName]) {
    const theme = GAME_THEMES[themeName];
    
    // Update theme in storage
    setGameTheme(themeName);
    
    // Apply CSS variables
    const root = document.documentElement;
    root.style.setProperty('--game-primary', theme.colors.primary);
    root.style.setProperty('--game-secondary', theme.colors.secondary);
    root.style.setProperty('--game-accent', theme.colors.accent);
    root.style.setProperty('--game-background', theme.colors.background);
    root.style.setProperty('--game-text', theme.colors.text);
    root.style.setProperty('--game-success', theme.colors.success);
    root.style.setProperty('--game-warning', theme.colors.warning);
    root.style.setProperty('--game-danger', theme.colors.danger);
    
    // Apply cartoon styles for cartoon theme
    const gameContainer = document.body;
    gameContainer.classList.remove('cartoon-theme');
    if (themeName === 'cartoonWorld') {
      gameContainer.classList.add('cartoon-theme');
      console.log('🎨 Applied cartoon styling - check buttons and panels for Bloons-like appearance!');
    }
    
    console.log(`🎨 Theme changed to: ${theme.displayName}`);
    console.log(`📝 Description: ${theme.description}`);
    console.log('🎮 Game should update instantly without reload!');
    
    // Update page title if it's the cartoon theme
    if (themeName === 'cartoonWorld') {
      document.title = 'Dopamine Dealer Dan - Cartoonish Social Media Adventure';
    }
  } else {
    console.log(`❌ Theme "${themeName}" not found. Available themes:`, Object.keys(GAME_THEMES));
  }
};

// List all available themes
window.listThemes = () => {
  console.log('\n🎨 Available Game Themes:');
  Object.entries(GAME_THEMES).forEach(([key, theme]) => {
    console.log(`  ${key}: ${theme.displayName} - ${theme.description}`);
  });
  console.log('\nUse: testTheme("themeName") to switch instantly');
  console.log('Special: testCartoonTheme() for Bloons-style');
};

// Show current theme
window.getCurrentGameTheme = () => {
  const currentTheme = localStorage.getItem('gameTheme') || 'metaman';
  const theme = GAME_THEMES[currentTheme];
  if (theme) {
    console.log(`🎨 Current Theme: ${theme.displayName}`);
    console.log(`📝 Description: ${theme.description}`);
  }
};

// Cycle through themes
let currentThemeIndex = 0;
window.cycleThemes = () => {
  const themeNames = Object.keys(GAME_THEMES);
  const nextTheme = themeNames[currentThemeIndex];
  currentThemeIndex = (currentThemeIndex + 1) % themeNames.length;
  
  window.testTheme(nextTheme);
  console.log(`🔄 Cycling... Next up: ${themeNames[currentThemeIndex]}`);
};

// Export for TypeScript
export const themeTestUtils = {
  testCartoonTheme: window.testCartoonTheme,
  testTheme: window.testTheme,
  listThemes: window.listThemes,
  getCurrentGameTheme: window.getCurrentGameTheme,
  cycleThemes: window.cycleThemes
};

// Log available commands
console.log(`
🎨 Theme Testing Commands Available:
  testCartoonTheme()         - Apply Bloons/Night in the Woods style
  testTheme('themeName')     - Switch to a specific theme
  listThemes()               - List all available themes  
  getCurrentGameTheme()      - Show current theme info
  cycleThemes()              - Cycle through all themes

Available theme names: ${Object.keys(GAME_THEMES).join(', ')}

Examples:
  testCartoonTheme()         - Apply cartoon styling instantly
  testTheme('socialTycoon')  - Switch to Social Tycoon theme
  testTheme('cartoonWorld')  - Dopamine Dealer Dan cartoon style
`);