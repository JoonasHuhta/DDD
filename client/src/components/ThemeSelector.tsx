import React, { useState } from 'react';
import { Palette, Sparkles, Building2, Crown, Briefcase } from 'lucide-react';
import { GAME_THEMES, setGameTheme, getCurrentTheme } from '../lib/config/GameThemes';

interface ThemeSelectorProps {
  onThemeChange?: (themeName: string) => void;
}

export default function ThemeSelector({ onThemeChange }: ThemeSelectorProps) {
  const [currentThemeName, setCurrentThemeName] = useState(getCurrentTheme().name);
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeChange = (themeName: string) => {
    if (setGameTheme(themeName)) {
      setCurrentThemeName(themeName);
      setIsOpen(false);
      
      // Apply theme changes without reload
      if (onThemeChange) {
        onThemeChange(themeName);
      }
      
      // Update CSS variables dynamically for instant visual changes
      const theme = GAME_THEMES[themeName];
      if (theme) {
        const root = document.documentElement;
        root.style.setProperty('--game-primary', theme.colors.primary);
        root.style.setProperty('--game-secondary', theme.colors.secondary);
        root.style.setProperty('--game-accent', theme.colors.accent);
        root.style.setProperty('--game-background', theme.colors.background);
        root.style.setProperty('--game-text', theme.colors.text);
        root.style.setProperty('--game-success', theme.colors.success);
        root.style.setProperty('--game-warning', theme.colors.warning);
        root.style.setProperty('--game-danger', theme.colors.danger);
        
        // Apply cartoon theme class if selected
        const gameContainer = document.body;
        gameContainer.classList.remove('cartoon-theme');
        if (themeName === 'cartoonWorld') {
          gameContainer.classList.add('cartoon-theme');
          console.log(`🎨 Applied cartoon theme styling for ${theme.displayName}`);
        }
        
        console.log(`🎨 Theme colors applied instantly: ${theme.displayName}`);
      }
    }
  };

  const getThemeIcon = (themeName: string) => {
    switch (themeName) {
      case 'metaman': return <Building2 className="w-4 h-4" />;
      case 'socialTycoon': return <Sparkles className="w-4 h-4" />;
      case 'techEmpire': return <Building2 className="w-4 h-4" />;
      case 'viralKingdom': return <Crown className="w-4 h-4" />;
      case 'corporateClimber': return <Briefcase className="w-4 h-4" />;
      case 'cartoonWorld': return <Sparkles className="w-4 h-4" />;
      default: return <Palette className="w-4 h-4" />;
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
        title="Change Game Theme"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm">{GAME_THEMES[currentThemeName]?.displayName}</span>
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-0 left-0 bg-gray-900 border border-gray-700 rounded-lg p-4 min-w-80 z-50 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Game Themes</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-4">
          Experiment with different game names, art styles, and themes. Changes will reload the game.
        </p>

        <div className="space-y-2">
          {Object.entries(GAME_THEMES).map(([key, theme]) => (
            <button
              key={key}
              onClick={() => handleThemeChange(key)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                currentThemeName === key
                  ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                  : 'border-gray-600 bg-gray-800 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {getThemeIcon(key)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-white">{theme.displayName}</div>
                  <div className="text-sm text-gray-400 mt-1">{theme.description}</div>
                  
                  {/* Art Style Tags */}
                  <div className="flex flex-wrap gap-1 mt-2">
                    {theme.artStyle.pixelArt && (
                      <span className="text-xs px-2 py-1 bg-purple-600 text-white rounded">Pixel Art</span>
                    )}
                    {theme.artStyle.neonGlow && (
                      <span className="text-xs px-2 py-1 bg-cyan-600 text-white rounded">Neon</span>
                    )}
                    {theme.artStyle.minimalist && (
                      <span className="text-xs px-2 py-1 bg-gray-600 text-white rounded">Minimal</span>
                    )}
                    {theme.artStyle.corporate && (
                      <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">Corporate</span>
                    )}
                    {theme.artStyle.cyberpunk && (
                      <span className="text-xs px-2 py-1 bg-pink-600 text-white rounded">Cyberpunk</span>
                    )}
                  </div>

                  {/* Color Preview */}
                  <div className="flex gap-1 mt-2">
                    <div 
                      className="w-4 h-4 rounded border border-gray-600" 
                      style={{ backgroundColor: theme.colors.primary }}
                      title="Primary Color"
                    />
                    <div 
                      className="w-4 h-4 rounded border border-gray-600" 
                      style={{ backgroundColor: theme.colors.secondary }}
                      title="Secondary Color"
                    />
                    <div 
                      className="w-4 h-4 rounded border border-gray-600" 
                      style={{ backgroundColor: theme.colors.accent }}
                      title="Accent Color"
                    />
                  </div>
                </div>
                
                {currentThemeName === key && (
                  <div className="text-blue-400 font-bold">✓</div>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            💡 Tip: Each theme changes the game's name, visual style, and gameplay focus. 
            Perfect for experimenting with different game concepts!
          </p>
        </div>
      </div>
    </div>
  );
}