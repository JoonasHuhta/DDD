import React, { useEffect, useState } from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';

interface FlashState {
  isFlashing: boolean;
  color: string;
  intensity: number;
}

export const CampaignFlashEffect: React.FC = () => {
  const { lastCampaignUsed } = useMetamanGame();
  const [flashState, setFlashState] = useState<FlashState>({
    isFlashing: false,
    color: '#ffffff',
    intensity: 0
  });

  useEffect(() => {
    if (lastCampaignUsed && lastCampaignUsed.timestamp > Date.now() - 2000) {
      // Determine flash intensity and color based on campaign
      let intensity = 0.1; // Default subtle flash
      let color = lastCampaignUsed.color;

      // Special handling for white electric (the_perfect_storm)
      if (lastCampaignUsed.id === 'the_perfect_storm') {
        intensity = 0.3; // Stronger flash for white electric
        color = '#ffffff';
      } else if (lastCampaignUsed.cost > 500000) {
        intensity = 0.25; // Strong flash for expensive campaigns
      } else if (lastCampaignUsed.cost > 100000) {
        intensity = 0.2; // Medium flash for mid-tier campaigns
      } else if (lastCampaignUsed.cost > 10000) {
        intensity = 0.15; // Moderate flash for higher campaigns
      }

      setFlashState({
        isFlashing: true,
        color,
        intensity
      });

      // Flash duration based on campaign power
      const flashDuration = lastCampaignUsed.id === 'the_perfect_storm' ? 400 : 250;

      const timer = setTimeout(() => {
        setFlashState(prev => ({ ...prev, isFlashing: false }));
      }, flashDuration);

      return () => clearTimeout(timer);
    }
  }, [lastCampaignUsed]);

  if (!flashState.isFlashing) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 transition-opacity duration-200"
      style={{
        backgroundColor: flashState.color,
        opacity: flashState.intensity,
        mixBlendMode: 'screen' // Creates a bright overlay effect
      }}
    />
  );
};