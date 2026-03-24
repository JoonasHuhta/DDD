// Adaptive UI utility functions for better readability and accessibility

export interface AdaptiveUIConfig {
  // Font scaling
  baseFontSize: number;
  fontScale: number;
  lineHeight: number;
  
  // Element sizing
  buttonScale: number;
  iconScale: number;
  spacingScale: number;
  borderRadius: number;
  
  // Layout
  containerPadding: number;
  panelSpacing: number;
  
  // Interaction
  minTouchTarget: number;
  hoverScale: number;
}

export type AdaptiveLevel = 'compact' | 'normal' | 'comfortable' | 'large';

const adaptiveConfigs: Record<AdaptiveLevel, AdaptiveUIConfig> = {
  compact: {
    baseFontSize: 14,
    fontScale: 0.9,
    lineHeight: 1.3,
    buttonScale: 0.85,
    iconScale: 0.9,
    spacingScale: 0.8,
    borderRadius: 4,
    containerPadding: 12,
    panelSpacing: 8,
    minTouchTarget: 40,
    hoverScale: 1.05,
  },
  normal: {
    baseFontSize: 16,
    fontScale: 1.0,
    lineHeight: 1.4,
    buttonScale: 1.0,
    iconScale: 1.0,
    spacingScale: 1.0,
    borderRadius: 6,
    containerPadding: 16,
    panelSpacing: 12,
    minTouchTarget: 44,
    hoverScale: 1.1,
  },
  comfortable: {
    baseFontSize: 18,
    fontScale: 1.1,
    lineHeight: 1.5,
    buttonScale: 1.15,
    iconScale: 1.1,
    spacingScale: 1.2,
    borderRadius: 8,
    containerPadding: 20,
    panelSpacing: 16,
    minTouchTarget: 48,
    hoverScale: 1.15,
  },
  large: {
    baseFontSize: 20,
    fontScale: 1.25,
    lineHeight: 1.6,
    buttonScale: 1.3,
    iconScale: 1.2,
    spacingScale: 1.4,
    borderRadius: 10,
    containerPadding: 24,
    panelSpacing: 20,
    minTouchTarget: 52,
    hoverScale: 1.2,
  }
};

export function getAdaptiveConfig(level: AdaptiveLevel): AdaptiveUIConfig {
  return adaptiveConfigs[level];
}

export function generateAdaptiveClasses(config: AdaptiveUIConfig, screenSize: 'mobile' | 'tablet' | 'desktop' | 'large') {
  const baseClasses = {
    // Typography
    textXs: `text-[${Math.round(config.baseFontSize * 0.75 * config.fontScale)}px]`,
    textSm: `text-[${Math.round(config.baseFontSize * 0.875 * config.fontScale)}px]`,
    textBase: `text-[${Math.round(config.baseFontSize * config.fontScale)}px]`,
    textLg: `text-[${Math.round(config.baseFontSize * 1.125 * config.fontScale)}px]`,
    textXl: `text-[${Math.round(config.baseFontSize * 1.25 * config.fontScale)}px]`,
    text2xl: `text-[${Math.round(config.baseFontSize * 1.5 * config.fontScale)}px]`,
    
    // Buttons
    btnSm: `h-[${Math.round(36 * config.buttonScale)}px] px-[${Math.round(12 * config.buttonScale)}px] text-[${Math.round(config.baseFontSize * 0.875 * config.fontScale)}px]`,
    btnBase: `h-[${Math.max(config.minTouchTarget, Math.round(44 * config.buttonScale))}px] px-[${Math.round(16 * config.buttonScale)}px] text-[${Math.round(config.baseFontSize * config.fontScale)}px]`,
    btnLg: `h-[${Math.max(config.minTouchTarget, Math.round(52 * config.buttonScale))}px] px-[${Math.round(20 * config.buttonScale)}px] text-[${Math.round(config.baseFontSize * 1.125 * config.fontScale)}px]`,
    
    // Icons  
    iconSm: `w-[${Math.round(16 * config.iconScale)}px] h-[${Math.round(16 * config.iconScale)}px]`,
    iconBase: `w-[${Math.round(20 * config.iconScale)}px] h-[${Math.round(20 * config.iconScale)}px]`,
    iconLg: `w-[${Math.round(24 * config.iconScale)}px] h-[${Math.round(24 * config.iconScale)}px]`,
    iconXl: `w-[${Math.round(32 * config.iconScale)}px] h-[${Math.round(32 * config.iconScale)}px]`,
    
    // Spacing
    spaceXs: `gap-[${Math.round(4 * config.spacingScale)}px]`,
    spaceSm: `gap-[${Math.round(8 * config.spacingScale)}px]`,
    spaceBase: `gap-[${Math.round(12 * config.spacingScale)}px]`,
    spaceLg: `gap-[${Math.round(16 * config.spacingScale)}px]`,
    spaceXl: `gap-[${Math.round(24 * config.spacingScale)}px]`,
    
    // Padding
    padXs: `p-[${Math.round(4 * config.spacingScale)}px]`,
    padSm: `p-[${Math.round(8 * config.spacingScale)}px]`,
    padBase: `p-[${Math.round(config.containerPadding)}px]`,
    padLg: `p-[${Math.round(config.containerPadding * 1.5)}px]`,
    
    // Borders
    rounded: `rounded-[${config.borderRadius}px]`,
    roundedLg: `rounded-[${config.borderRadius * 1.5}px]`,
    
    // Line height
    leading: `leading-[${config.lineHeight}]`,
  };
  
  // Screen size specific adjustments
  const screenMultiplier = {
    mobile: 1.1, // Slightly larger on mobile for better touch
    tablet: 1.0,
    desktop: 1.0,
    large: 0.95, // Slightly smaller on large screens
  }[screenSize];
  
  // Apply screen multiplier to touch-interactive elements
  const touchElements = ['btnSm', 'btnBase', 'btnLg'];
  touchElements.forEach(key => {
    if (screenSize === 'mobile') {
      baseClasses[key as keyof typeof baseClasses] = baseClasses[key as keyof typeof baseClasses].replace(
        /h-\[(\d+)px\]/,
        (match, height) => `h-[${Math.max(config.minTouchTarget, Math.round(parseInt(height) * screenMultiplier))}px]`
      );
    }
  });
  
  return baseClasses;
}

export function getAdaptiveStyle(property: string, value: number, config: AdaptiveUIConfig): React.CSSProperties {
  const styles: React.CSSProperties = {};
  
  switch (property) {
    case 'fontSize':
      styles.fontSize = `${value * config.fontScale}px`;
      styles.lineHeight = config.lineHeight;
      break;
    case 'buttonSize':
      styles.minHeight = `${Math.max(config.minTouchTarget, value * config.buttonScale)}px`;
      styles.padding = `${Math.round(8 * config.spacingScale)}px ${Math.round(16 * config.spacingScale)}px`;
      break;
    case 'iconSize':
      styles.width = `${value * config.iconScale}px`;
      styles.height = `${value * config.iconScale}px`;
      break;
    case 'spacing':
      styles.gap = `${value * config.spacingScale}px`;
      break;
    case 'padding':
      styles.padding = `${value * config.spacingScale}px`;
      break;
    case 'borderRadius':
      styles.borderRadius = `${config.borderRadius}px`;
      break;
  }
  
  return styles;
}