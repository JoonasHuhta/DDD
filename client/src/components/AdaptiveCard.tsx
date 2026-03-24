import React from 'react';
import { useResponsiveUI } from '../hooks/useResponsiveUI';
import AdaptiveText from './AdaptiveText';

interface AdaptiveCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  hoverable?: boolean;
}

export default function AdaptiveCard({ 
  children, 
  title,
  subtitle,
  variant = 'default',
  className = '',
  onClick,
  disabled = false,
  hoverable = true
}: AdaptiveCardProps) {
  const responsive = useResponsiveUI();
  
  // Variant styles
  const variantClasses = {
    default: 'bg-gray-900 border-gray-600',
    success: 'bg-green-900 bg-opacity-30 border-green-500',
    warning: 'bg-yellow-900 bg-opacity-30 border-yellow-500',
    error: 'bg-red-900 bg-opacity-30 border-red-500',
    info: 'bg-blue-900 bg-opacity-30 border-blue-500',
  };
  
  // Interactive states
  const interactionClasses = disabled 
    ? 'opacity-50 cursor-not-allowed'
    : onClick && hoverable
      ? 'cursor-pointer hover:bg-opacity-80 hover:scale-102 active:scale-98 transition-all duration-200'
      : '';
  
  return (
    <div
      className={`
        ${variantClasses[variant]}
        ${interactionClasses}
        rounded-lg border
        ${className}
      `}
      style={{
        padding: responsive.containerPadding,
        minHeight: responsive.minTouchTarget,
      }}
      onClick={onClick && !disabled ? onClick : undefined}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="mb-3">
          {title && (
            <AdaptiveText size="base" weight="medium" color="text-white">
              {title}
            </AdaptiveText>
          )}
          {subtitle && (
            <AdaptiveText size="sm" color="text-gray-400" className="mt-1">
              {subtitle}
            </AdaptiveText>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className={responsive.spacing}>
        {children}
      </div>
    </div>
  );
}