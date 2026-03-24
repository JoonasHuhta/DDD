// Game Theme Configuration System
// This allows us to easily experiment with different game names, art styles, and themes

export interface GameTheme {
  name: string;
  displayName: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    success: string;
    warning: string;
    danger: string;
  };
  artStyle: {
    pixelArt: boolean;
    neonGlow: boolean;
    minimalist: boolean;
    corporate: boolean;
    cyberpunk: boolean;
  };
  gameplayFocus: {
    business: boolean;
    social: boolean;
    tech: boolean;
    entertainment: boolean;
  };
}

// Available Game Themes
export const GAME_THEMES: Record<string, GameTheme> = {
  // Original METAMAN theme
  metaman: {
    name: 'metaman',
    displayName: 'METAMAN',
    description: 'Corporate Empire - Build your social media empire',
    colors: {
      primary: '#3B82F6', // blue-500
      secondary: '#8B5CF6', // violet-500  
      accent: '#F59E0B', // amber-500
      background: '#111827', // gray-900
      text: '#F9FAFB', // gray-50
      success: '#10B981', // emerald-500
      warning: '#F59E0B', // amber-500
      danger: '#EF4444', // red-500
    },
    artStyle: {
      pixelArt: true,
      neonGlow: true,
      minimalist: false,
      corporate: true,
      cyberpunk: true,
    },
    gameplayFocus: {
      business: true,
      social: true,
      tech: true,
      entertainment: false,
    }
  },

  // Social Tycoon - More friendly, mainstream social media theme
  socialTycoon: {
    name: 'socialTycoon',
    displayName: 'Social Tycoon',
    description: 'Social Media Empire - Build the next big platform',
    colors: {
      primary: '#06B6D4', // cyan-500
      secondary: '#EC4899', // pink-500
      accent: '#F97316', // orange-500
      background: '#0F172A', // slate-900
      text: '#F1F5F9', // slate-100
      success: '#22C55E', // green-500
      warning: '#EAB308', // yellow-500
      danger: '#DC2626', // red-600
    },
    artStyle: {
      pixelArt: false,
      neonGlow: true,
      minimalist: true,
      corporate: false,
      cyberpunk: false,
    },
    gameplayFocus: {
      business: true,
      social: true,
      tech: false,
      entertainment: true,
    }
  },

  // Tech Empire - Silicon Valley startup vibe
  techEmpire: {
    name: 'techEmpire',
    displayName: 'Tech Empire',
    description: 'Silicon Valley Dreams - Create the next unicorn startup',
    colors: {
      primary: '#6366F1', // indigo-500
      secondary: '#14B8A6', // teal-500
      accent: '#F59E0B', // amber-500
      background: '#1F2937', // gray-800
      text: '#E5E7EB', // gray-200
      success: '#059669', // emerald-600
      warning: '#D97706', // amber-600
      danger: '#DC2626', // red-600
    },
    artStyle: {
      pixelArt: false,
      neonGlow: false,
      minimalist: true,
      corporate: true,
      cyberpunk: false,
    },
    gameplayFocus: {
      business: true,
      social: false,
      tech: true,
      entertainment: false,
    }
  },

  // Viral Kingdom - Fun, colorful, gamified social media
  viralKingdom: {
    name: 'viralKingdom',
    displayName: 'Viral Kingdom',
    description: 'Content Creator Empire - Rule the viral world',
    colors: {
      primary: '#8B5CF6', // violet-500
      secondary: '#EC4899', // pink-500
      accent: '#10B981', // emerald-500
      background: '#312E81', // indigo-800
      text: '#FAF5FF', // purple-50
      success: '#22C55E', // green-500
      warning: '#F59E0B', // amber-500
      danger: '#F87171', // red-400
    },
    artStyle: {
      pixelArt: true,
      neonGlow: true,
      minimalist: false,
      corporate: false,
      cyberpunk: true,
    },
    gameplayFocus: {
      business: false,
      social: true,
      tech: false,
      entertainment: true,
    }
  },

  // Corporate Climber - Professional business theme
  corporateClimber: {
    name: 'corporateClimber',
    displayName: 'Corporate Climber',
    description: 'Business Tycoon - Climb the corporate ladder',
    colors: {
      primary: '#1F2937', // gray-800
      secondary: '#374151', // gray-700
      accent: '#D97706', // amber-600
      background: '#111827', // gray-900
      text: '#F3F4F6', // gray-100
      success: '#065F46', // emerald-800
      warning: '#92400E', // amber-800
      danger: '#991B1B', // red-800
    },
    artStyle: {
      pixelArt: false,
      neonGlow: false,
      minimalist: true,
      corporate: true,
      cyberpunk: false,
    },
    gameplayFocus: {
      business: true,
      social: false,
      tech: false,
      entertainment: false,
    }
  },

  // Cartoonish Bloons/Night in the Woods style
  cartoonWorld: {
    name: 'cartoonWorld',
    displayName: 'Dopamine Dealer Dan',
    description: 'Cartoonish Social Media Adventure',
    colors: {
      primary: '#FF6B6B', // Warm coral red
      secondary: '#4ECDC4', // Teal mint
      accent: '#FFE66D', // Sunny yellow
      background: '#2C3E50', // Deep blue-gray with negative space feel
      text: '#FFFFFF', // Pure white for contrast
      success: '#95E1D3', // Soft mint green
      warning: '#F38BA8', // Soft pink
      danger: '#FF8A80', // Coral red
    },
    artStyle: {
      pixelArt: false,
      neonGlow: false,
      minimalist: true,
      corporate: false,
      cyberpunk: false,
    },
    gameplayFocus: {
      business: false,
      social: true,
      tech: false,
      entertainment: true,
    }
  }
};

// Current active theme (can be changed at runtime)
export let currentTheme: GameTheme = GAME_THEMES.metaman;

// Theme management functions
export function setGameTheme(themeName: string): boolean {
  if (GAME_THEMES[themeName]) {
    currentTheme = GAME_THEMES[themeName];
    console.log(`🎨 Theme changed to: ${currentTheme.displayName}`);
    return true;
  }
  console.warn(`Theme "${themeName}" not found`);
  return false;
}

export function getCurrentTheme(): GameTheme {
  return currentTheme;
}

export function getAllThemes(): GameTheme[] {
  return Object.values(GAME_THEMES);
}

// Helper function to get CSS variables for the current theme
export function getThemeCSS(): string {
  const theme = getCurrentTheme();
  return `
    :root {
      --game-primary: ${theme.colors.primary};
      --game-secondary: ${theme.colors.secondary};
      --game-accent: ${theme.colors.accent};
      --game-background: ${theme.colors.background};
      --game-text: ${theme.colors.text};
      --game-success: ${theme.colors.success};
      --game-warning: ${theme.colors.warning};
      --game-danger: ${theme.colors.danger};
    }
  `;
}