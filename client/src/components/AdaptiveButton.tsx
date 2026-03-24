import React from 'react';
import { useResponsiveUI } from '../hooks/useResponsiveUI';

interface AdaptiveButtonProps {
  children?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'sm' | 'base' | 'lg';
  disabled?: boolean;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  badge?: number;
  animate?: 'none' | 'bounce' | 'pulse' | 'comic-pulse';
  'data-suitcase-toggle'?: boolean;
}

export default function AdaptiveButton({ 
  children, 
  onClick,
  variant = 'primary',
  size = 'base',
  disabled = false,
  className = '',
  title,
  icon,
  iconPosition = 'left',
  badge,
  animate = 'none',
  'data-suitcase-toggle': dataSuitcaseToggle
}: AdaptiveButtonProps) {
  const responsive = useResponsiveUI();
  
  // Size classes with guaranteed touch targets
  const sizeClasses = {
    sm: `${responsive.adaptiveClasses.btnSm} min-h-[${responsive.minTouchTarget}px]`,
    base: `${responsive.adaptiveClasses.btnBase} min-h-[${responsive.minTouchTarget}px]`,
    lg: `${responsive.adaptiveClasses.btnLg} min-h-[${Math.max(responsive.minTouchTarget, 52)}px]`,
  };
  
  // Variant styles with comic feel
  const variantClasses = {
    primary: 'bg-[#FF6B35] hover:bg-[#FF8554] text-white border-black',
    secondary: 'bg-[#FFD700] hover:bg-[#FFE04D] text-black border-black font-black',
    success: 'bg-[#4ECDC4] hover:bg-[#71DAD2] text-white border-black',
    danger: 'bg-[#FF1744] hover:bg-[#FF4D6D] text-white border-black',
    ghost: 'bg-white hover:bg-gray-100 text-black border-black',
  };
  
  // Enhanced comic-book interaction states
  const interactionClasses = disabled 
    ? 'opacity-50 cursor-not-allowed'
    : 'transition-all duration-100 active:translate-y-1 active:shadow-none shadow-[0_4px_0_0_rgba(0,0,0,1)]';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      data-suitcase-toggle={dataSuitcaseToggle ? "true" : undefined}
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${interactionClasses}
        ${animate !== 'none' ? `animate-${animate}` : ''}
        rounded-xl border-4 font-black uppercase tracking-tight
        flex items-center justify-center relative
        focus:outline-none focus:ring-4 focus:ring-[#FFD700]
        touch-manipulation select-none
        ${responsive.spacing}
        ${className}
      `}
      style={{
        // Ensure proper spacing for touch
        padding: responsive.isMobile 
          ? `${Math.round(responsive.containerPadding * 0.75)}px ${responsive.containerPadding}px`
          : `${Math.round(responsive.containerPadding * 0.5)}px ${Math.round(responsive.containerPadding * 0.75)}px`,
      }}
    >
      {icon && iconPosition === 'left' && (
        <span className={`${children ? 'mr-2' : ''}`}>{icon}</span>
      )}
      {children && (
        <span className="truncate">{children}</span>
      )}
      {icon && iconPosition === 'right' && (
        <span className={`${children ? 'ml-2' : ''}`}>{icon}</span>
      )}
      
      {badge !== undefined && badge > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] min-w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-black font-black">
          {badge > 99 ? '99+' : badge}
        </div>
      )}
    </button>
  );
}