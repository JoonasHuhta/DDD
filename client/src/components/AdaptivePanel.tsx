import React from 'react';
import { X } from 'lucide-react';
import { useResponsiveUI } from '../hooks/useResponsiveUI';
import AdaptiveButton from './AdaptiveButton';
import AdaptiveText from './AdaptiveText';

interface AdaptivePanelProps {
  children: React.ReactNode;
  title: string;
  icon?: React.ReactNode;
  onClose?: () => void;
  position?: 'left' | 'right' | 'center';
  className?: string;
  scrollable?: boolean;
}

export default function AdaptivePanel({ 
  children, 
  title, 
  icon,
  onClose,
  position = 'left',
  className = '',
  scrollable = true
}: AdaptivePanelProps) {
  const responsive = useResponsiveUI();
  
  // Position classes
  const positionClasses = {
    left: responsive.isMobile 
      ? 'left-4 right-4' 
      : 'left-4 top-20 bottom-32',
    right: responsive.isMobile 
      ? 'left-4 right-4' 
      : 'right-4 top-20 bottom-32',
    center: responsive.isMobile 
      ? 'left-4 right-4' 
      : 'left-1/2 top-20 bottom-32 transform -translate-x-1/2',
  };
  
  const mobileSafeAreaStyle = responsive.isMobile ? { bottom: 'calc(8rem + var(--safe-bottom))' } : {};
  
  return (
    <div 
      className={`
        absolute ${positionClasses[position]} z-50 
        bg-[#FFD700] rounded-2xl border-4 border-black 
        shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
        pointer-events-auto
        flex flex-col
        ${className}
      `}
      onClick={(e) => e.stopPropagation()}
      style={{ 
        width: responsive.isMobile ? 'auto' : `${responsive.panelWidth}px`,
        maxHeight: responsive.isMobile ? '70vh' : '75vh',
        padding: responsive.containerPadding,
        ...mobileSafeAreaStyle
      }}
    >
      {/* Header - Fixed at top */}
      <div className="flex-shrink-0 flex items-center justify-between mb-4 pb-2 border-b-4 border-black">
        <div className="flex items-center gap-2">
          {icon && <span className="text-black">{icon}</span>}
          <AdaptiveText size="lg" weight="black" color="text-black">
            {title}
          </AdaptiveText>
        </div>
        
        {onClose && (
          <AdaptiveButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            variant="ghost"
            size="sm"
            title={`Close ${title}`}
            icon={<X className="w-4 h-4" />}
            className="!p-2 hover:bg-gray-700"
          >
            {/* Empty children for close button */}
          </AdaptiveButton>
        )}
      </div>
      
      {/* Content - Scrollable area */}
      <div className={`
        ${responsive.spacing} 
        ${scrollable ? 'overflow-y-auto scrollable' : 'overflow-hidden'} 
        flex-1 min-h-0 scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent pr-1
      `}>
        {children}
      </div>
    </div>
  );
}