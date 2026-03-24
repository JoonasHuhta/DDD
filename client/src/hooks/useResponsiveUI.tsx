import { useState, useEffect } from 'react';
import { getAdaptiveConfig, generateAdaptiveClasses, type AdaptiveLevel } from '../lib/utils/adaptiveUI';

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'large';

export interface ResponsiveConfig {
  screenSize: ScreenSize;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  canvasScale: number;
  uiScale: number;
  sidebarWidth: number;
  panelWidth: number;
  buttonSize: string;
  iconSize: string;
  fontSize: string;
  spacing: string;
  gap: string;
  // Enhanced adaptive properties
  adaptiveLevel: AdaptiveLevel;
  adaptiveClasses: Record<string, string>;
  minTouchTarget: number;
  containerPadding: number;
  textContrast: 'normal' | 'high';
}

const getScreenSize = (width: number): ScreenSize => {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  if (width < 1440) return 'desktop';
  return 'large';
};

const getResponsiveConfig = (width: number, height: number): ResponsiveConfig => {
  const screenSize = getScreenSize(width);
  const aspectRatio = width / height;
  
  // Determine adaptive level based on screen size and user preferences
  const adaptiveLevel: AdaptiveLevel = screenSize === 'mobile' ? 'comfortable' :
                                     screenSize === 'tablet' ? 'normal' :
                                     screenSize === 'large' ? 'large' : 'normal';
  
  const adaptiveConfig = getAdaptiveConfig(adaptiveLevel);
  const adaptiveClasses = generateAdaptiveClasses(adaptiveConfig, screenSize);
  
  const configs = {
    mobile: {
      canvasScale: Math.min(width / 1024, (height - 160) / 768) * 1.0, // Increased from 0.85 for better visibility
      uiScale: 1.2, // Increased for better touch readability
      sidebarWidth: 60,
      panelWidth: Math.min(Math.max(320, width * 0.85), width - 40),
      buttonSize: `${adaptiveClasses.btnBase} min-h-[48px]`, // Ensure touch targets
      iconSize: adaptiveClasses.iconBase,
      fontSize: adaptiveClasses.textBase,
      spacing: adaptiveClasses.spaceBase,
      minTouchTarget: 48,
      containerPadding: 16,
    },
    tablet: {
      canvasScale: Math.min(width / 1024, height / 768),
      uiScale: 1.1,
      sidebarWidth: 70,
      panelWidth: Math.min(400, width * 0.7),
      buttonSize: `${adaptiveClasses.btnBase} min-h-[44px]`,
      iconSize: adaptiveClasses.iconBase,
      fontSize: adaptiveClasses.textLg,
      spacing: adaptiveClasses.spaceLg,
      minTouchTarget: 44,
      containerPadding: 20,
    },
    desktop: {
      canvasScale: 1,
      uiScale: 1,
      sidebarWidth: 80,
      panelWidth: 440,
      buttonSize: adaptiveClasses.btnBase,
      iconSize: adaptiveClasses.iconLg,
      fontSize: adaptiveClasses.textLg,
      spacing: adaptiveClasses.spaceLg,
      minTouchTarget: 40,
      containerPadding: 24,
    },
    large: {
      canvasScale: Math.min(width / 1024, 1.3),
      uiScale: 1.0,
      sidebarWidth: 90,
      panelWidth: 520,
      buttonSize: adaptiveClasses.btnLg,
      iconSize: adaptiveClasses.iconXl,
      fontSize: adaptiveClasses.text2xl,
      spacing: adaptiveClasses.spaceXl,
      minTouchTarget: 40,
      containerPadding: 28,
    }
  };
  
  const config = configs[screenSize];
  
  return {
    screenSize,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop' || screenSize === 'large',
    gap: config.spacing,
    adaptiveLevel,
    adaptiveClasses,
    textContrast: 'normal',
    ...config
  };
};

export const useResponsiveUI = (): ResponsiveConfig => {
  const [config, setConfig] = useState<ResponsiveConfig>(() => 
    getResponsiveConfig(window.innerWidth, window.innerHeight)
  );

  useEffect(() => {
    const handleResize = () => {
      const newConfig = getResponsiveConfig(window.innerWidth, window.innerHeight);
      setConfig(newConfig);
    };

    // Debounce resize events
    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return config;
};

// Utility function for responsive classes
export const getResponsiveClasses = (config: ResponsiveConfig) => ({
  // Sidebar positioning
  sidebar: `left-${config.isMobile ? '2' : '4'} ${
    config.isMobile ? 'bottom-20' : 'top-1/2 transform -translate-y-1/2'
  }`,
  
  // Panel sizing
  panel: `w-${config.isMobile ? 'full' : 'auto'} ${
    config.isMobile ? 'max-w-sm' : ''
  } max-h-${config.isMobile ? '80' : '70'}vh`,
  
  // Button sizing
  button: `${config.buttonSize} ${config.spacing}`,
  
  // Icon sizing
  icon: config.iconSize,
  
  // Text sizing
  text: config.fontSize,
  
  // Spacing
  gap: config.spacing
});