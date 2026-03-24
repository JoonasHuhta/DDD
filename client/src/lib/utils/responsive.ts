// Utility functions for responsive UI components
export const getResponsivePanelClasses = (isMobile: boolean, isTablet: boolean) => {
  if (isMobile) {
    return 'fixed inset-x-2 top-12 bottom-16 max-h-[calc(100vh-7rem)] overflow-y-auto';
  } else if (isTablet) {
    return 'absolute right-4 top-20 w-80 max-h-[calc(100vh-8rem)] overflow-y-auto';
  } else {
    return 'absolute right-4 top-20 w-96 max-h-[70vh] overflow-y-auto';
  }
};

export const basePanelClasses = 'bg-black bg-opacity-90 rounded border border-gray-600 z-20 touch-action-manipulation';

export const getFullPanelClasses = (isMobile: boolean, isTablet: boolean) => {
  return `${getResponsivePanelClasses(isMobile, isTablet)} ${basePanelClasses}`;
};

export const getResponsiveButtonClasses = (size: string) => {
  return `${size} bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded transition-colors touch-action-manipulation flex items-center justify-center gap-2`;
};