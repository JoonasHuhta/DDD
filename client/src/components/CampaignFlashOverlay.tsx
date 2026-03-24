import React, { useEffect, useState } from 'react';

interface CampaignFlashOverlayProps {
  isVisible: boolean;
  color: string;
  intensity: number;
  duration: number;
}

export const CampaignFlashOverlay: React.FC<CampaignFlashOverlayProps> = ({
  isVisible,
  color,
  intensity,
  duration
}) => {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setOpacity(intensity);
      
      const timer = setTimeout(() => {
        setOpacity(0);
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setOpacity(0);
    }
  }, [isVisible, intensity, duration]);

  if (!isVisible && opacity === 0) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-40 transition-opacity duration-200"
      style={{
        backgroundColor: color,
        opacity: opacity,
        mixBlendMode: 'screen'
      }}
    />
  );
};