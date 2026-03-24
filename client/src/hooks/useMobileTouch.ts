import { useEffect } from 'react';

/**
 * Custom hook for optimizing touch interactions on mobile devices
 * Specifically designed for Android APK deployment
 */
export const useMobileTouch = () => {
  useEffect(() => {
    // Enhanced touch handling for mobile game elements
    const enhanceTouchResponsiveness = () => {
      // Add touch-optimized classes to game elements
      const gameElements = document.querySelectorAll('button, .clickable, .game-ui, [role="button"]');
      
      gameElements.forEach(element => {
        const htmlElement = element as HTMLElement;
        
        // Ensure proper touch targets (minimum 44px for accessibility)
        if (htmlElement.offsetWidth < 44 || htmlElement.offsetHeight < 44) {
          htmlElement.style.minWidth = '44px';
          htmlElement.style.minHeight = '44px';
          htmlElement.style.padding = htmlElement.style.padding || '8px';
        }
        
        // Add mobile-optimized event handling
        htmlElement.style.touchAction = 'manipulation';
        (htmlElement.style as any).webkitTouchCallout = 'none';
        (htmlElement.style as any).webkitTapHighlightColor = 'transparent';
        
        // Improve touch feedback
        htmlElement.addEventListener('touchstart', (e) => {
          // Add visual feedback for touch
          htmlElement.style.transform = 'scale(0.98)';
          htmlElement.style.opacity = '0.8';
          
          // Prevent context menu on long press for game elements
          e.stopPropagation();
        }, { passive: true });
        
        htmlElement.addEventListener('touchend', () => {
          // Reset visual feedback
          setTimeout(() => {
            htmlElement.style.transform = '';
            htmlElement.style.opacity = '';
          }, 100);
        }, { passive: true });
        
        htmlElement.addEventListener('touchcancel', () => {
          // Reset on touch cancel
          htmlElement.style.transform = '';
          htmlElement.style.opacity = '';
        }, { passive: true });
      });
    };
    
    // Run immediately and on DOM changes
    enhanceTouchResponsiveness();
    
    // Set up observer for dynamically added elements
    const observer = new MutationObserver(() => {
      enhanceTouchResponsiveness();
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'role']
    });
    
    // Cleanup
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return null; // This hook doesn't return anything
};

export default useMobileTouch;