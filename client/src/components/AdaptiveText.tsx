import React from 'react';
import { useResponsiveUI } from '../hooks/useResponsiveUI';

interface AdaptiveTextProps {
  children: React.ReactNode;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  color?: string;
  className?: string;
  contrast?: 'normal' | 'high';
}

export default function AdaptiveText({ 
  children, 
  size = 'base', 
  weight = 'normal',
  color = 'text-gray-200',
  className = '',
  contrast = 'normal'
}: AdaptiveTextProps) {
  const responsive = useResponsiveUI();
  
  // Enhanced size mapping with better scaling
  const sizeClasses = {
    xs: responsive.adaptiveClasses.textXs,
    sm: responsive.adaptiveClasses.textSm,
    base: responsive.adaptiveClasses.textBase,
    lg: responsive.adaptiveClasses.textLg,
    xl: responsive.adaptiveClasses.textXl,
    '2xl': responsive.adaptiveClasses.text2xl,
  };
  
  // Weight classes
  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
    black: 'font-black',
  };
  
  // High contrast adjustments
  const contrastColor = contrast === 'high' 
    ? color.replace('gray-200', 'gray-100').replace('gray-300', 'gray-200')
    : color;
  
  // Add better line height for readability
  const lineHeightClass = responsive.isMobile ? 'leading-relaxed' : 'leading-normal';
  
  return (
    <span 
      className={`
        ${sizeClasses[size]} 
        ${weightClasses[weight]} 
        ${contrastColor} 
        ${lineHeightClass}
        ${className}
      `}
      style={{
        // Ensure minimum readable size on all devices
        minHeight: responsive.isMobile ? '20px' : '16px',
        display: 'inline-block',
        lineHeight: responsive.isMobile ? 1.5 : 1.4,
      }}
    >
      {children}
    </span>
  );
}