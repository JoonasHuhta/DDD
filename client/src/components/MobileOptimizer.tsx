import React, { useEffect, useCallback } from 'react';
import { useMobileTouch } from '../hooks/useMobileTouch';

interface MobileOptimizerProps {
  children: React.ReactNode;
}

/**
 * MobileOptimizer Component
 * Handles Android APK-specific optimizations for fullscreen mode,
 * orientation locking, and preventing system gestures while preserving
 * all existing game touch controls.
 */
export const MobileOptimizer: React.FC<MobileOptimizerProps> = ({ children }) => {
  // Enhanced mobile touch interactions
  useMobileTouch();
  
  // Handle viewport height changes for mobile browsers
  const updateViewportHeight = useCallback(() => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, []);

  // Lock orientation to portrait and hide system UI
  const enforcePortraitMode = useCallback(() => {
    // Lock screen orientation to portrait
    try {
      if ('screen' in window && screen && 'orientation' in screen && screen.orientation) {
        const orientation = screen.orientation as any;
        if (orientation.lock) {
          orientation.lock('portrait').catch(() => {
            // Fallback methods for older Android versions
            const screenObj = screen as any;
            if (screenObj.lockOrientation) {
              screenObj.lockOrientation('portrait');
            } else if (screenObj.mozLockOrientation) {
              screenObj.mozLockOrientation('portrait');
            } else if (screenObj.msLockOrientation) {
              screenObj.msLockOrientation('portrait');
            }
          });
        }
      }
    } catch (error) {
      // Orientation lock not supported - not critical for APK
    }

    // Hide system bars on Android
    const windowObj = window as any;
    if (windowObj.StatusBar?.hide) {
      windowObj.StatusBar.hide();
    }
    if (windowObj.NavigationBar?.hide) {
      windowObj.NavigationBar.hide();
    }

    // Request fullscreen
    const docElement = document.documentElement;
    const requestFullscreen = 
      docElement.requestFullscreen ||
      (docElement as any).webkitRequestFullscreen ||
      (docElement as any).mozRequestFullScreen ||
      (docElement as any).msRequestFullscreen;

    if (requestFullscreen) {
      requestFullscreen.call(docElement).catch(() => {
        // Fullscreen request failed - not critical for APK
      });
    }
  }, []);

  // Handle Android back button prevention
  const handleBackButton = useCallback((e: Event) => {
    e.preventDefault();
    // Could show in-game pause menu instead of exiting
    return false;
  }, []);

  // Prevent accidental system gestures while preserving game controls
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const target = e.target as HTMLElement;
    
    // List of game elements that should receive touch events
    const gameElementSelectors = [
      'button',
      '.clickable',
      '.game-ui', 
      '[role="button"]',
      'canvas',
      '.panel',
      '.menu-item',
      '.upgrade-button',
      '.department-item'
    ];

    // Check if touch is on a game element
    const isGameElement = gameElementSelectors.some(selector => {
      if (selector.startsWith('.')) {
        return target.classList?.contains(selector.substring(1));
      } else if (selector.startsWith('[')) {
        const attrMatch = selector.match(/\[([^=]+)(?:="([^"]*)")?\]/);
        return attrMatch && target.hasAttribute(attrMatch[1]);
      } else {
        return target.tagName?.toLowerCase() === selector;
      }
    });

    // Only prevent default for non-game elements to avoid system gestures
    if (!isGameElement && (target === document.body || target === document.documentElement)) {
      e.preventDefault();
    }
  }, []);

  // Prevent context menu on long press
  const handleContextMenu = useCallback((e: Event) => {
    e.preventDefault();
    return false;
  }, []);

  useEffect(() => {
    // Initial setup
    updateViewportHeight();
    enforcePortraitMode();

    // Event listeners
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        enforcePortraitMode();
        updateViewportHeight();
      }, 100);
    });
    
    // Fullscreen events
    window.addEventListener('focus', enforcePortraitMode);
    window.addEventListener('pageshow', enforcePortraitMode);

    // Android back button handling
    document.addEventListener('backbutton', handleBackButton, false);

    // Touch and gesture prevention
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('contextmenu', handleContextMenu);

    // Prevent zoom on double tap while preserving game interactions
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        const target = e.target as HTMLElement;
        // Only prevent zoom on non-interactive elements
        if (target === document.body || target === document.documentElement) {
          e.preventDefault();
        }
      }
      lastTouchEnd = now;
    }, false);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('focus', enforcePortraitMode);
      window.removeEventListener('pageshow', enforcePortraitMode);
      document.removeEventListener('backbutton', handleBackButton, false);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [updateViewportHeight, enforcePortraitMode, handleBackButton, handleTouchStart, handleContextMenu]);

  // Apply mobile-fullscreen class to the wrapper
  return (
    <div className="mobile-fullscreen w-full h-full">
      {children}
    </div>
  );
};

export default MobileOptimizer;