import { useEffect, useRef, useCallback } from "react";
import { useMetamanGame } from "../lib/stores/useMetamanGame";
import { usePanelState } from "../hooks/usePanelState";
import { MetamanEngine } from "../lib/gameEngine/MetamanEngine";
import SpeechBubble from "./SpeechBubble";

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<MetamanEngine | null>(null);
  const { 
    gameState, 
    income, 
    users, 
    selectedCampaign,
    currentView,
    setCurrentView,
    incrementIncome, 
    incrementUsers,
    decrementIncome,
    incrementDataInventory,
    incrementOrbsInventory,
    setRegulatoryRisk,
    setCampaignCooldown,
    handleManualClick,
    towerHeight,
    campaignCharges,
    setCampaignCharges,
    showCampaignPanel,
    deliverLawsuit,
    triggerLawsuit,
    lawsuitState,
    rewardState,
    updateStats,
    blackMarketState,
    addVisualEffect
  } = useMetamanGame();
  
  const panels = usePanelState();

  const handleCanvasInteraction = useCallback((event: React.MouseEvent | React.TouchEvent) => {
    if (!engineRef.current) return;
    
    // Check if any panels are open - if so, don't allow game interaction
    if (panels.isAnyPanelOpen() || showCampaignPanel || lawsuitState.showLawsuitPanel || rewardState.showSuitcasePanel) {
      console.log('🚫 Game click blocked - panels are open');
      return; // Block all game clicks when panels are open
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in event.nativeEvent) {
      event.preventDefault();
      clientX = event.nativeEvent.touches[0].clientX;
      clientY = event.nativeEvent.touches[0].clientY;
    } else {
      clientX = event.nativeEvent.clientX;
      clientY = event.nativeEvent.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (currentView === 'city') {
      // Check if clicking on the central tower (manual click for income)
      const towerCenterX = engineRef.current.getWidth() / 2;
      const towerCenterY = engineRef.current.getHeight() / 2;
      const towerClickRadius = 80; // Larger click area for tower
      
      const distanceToTower = Math.sqrt(
        (x - towerCenterX) ** 2 + (y - towerCenterY) ** 2
      );
      
      if (distanceToTower <= towerClickRadius) {
        // Manual click on tower - no income, just visual feedback
        handleManualClick(x, y); // Use screen coordinates for particle effects only
        return;
      }

      // Only campaign system works - no manual income clicks
      const success = engineRef.current.handleClick(x, y, selectedCampaign, income, campaignCharges);
      
      // CAMPAIGN FLASH EFFECT: Trigger screen flash when campaigns are used
      if (success && selectedCampaign) {
        import('../lib/gameEngine/CampaignSystem').then(({ CAMPAIGNS }) => {
          const campaign = CAMPAIGNS.find(c => c.id === selectedCampaign);
          if (campaign) {
            // Trigger flash effect through DOM manipulation
            const flashDiv = document.createElement('div');
            flashDiv.style.position = 'fixed';
            flashDiv.style.top = '0';
            flashDiv.style.left = '0';
            flashDiv.style.width = '100%';
            flashDiv.style.height = '100%';
            flashDiv.style.backgroundColor = campaign.color;
            flashDiv.style.pointerEvents = 'none';
            flashDiv.style.zIndex = '1000';
            flashDiv.style.mixBlendMode = 'screen';
            
            // Set flash intensity based on campaign
            let intensity = 0.1;
            if (campaign.id === 'the_perfect_storm') {
              intensity = 0.25; // Strong flash for white electric
            } else if (campaign.cost > 500000) {
              intensity = 0.2;
            } else if (campaign.cost > 100000) {
              intensity = 0.15;
            }
            
            flashDiv.style.opacity = intensity.toString();
            document.body.appendChild(flashDiv);
            
            // Remove flash after duration
            const duration = campaign.id === 'the_perfect_storm' ? 300 : 150;
            setTimeout(() => {
              if (document.body.contains(flashDiv)) {
                document.body.removeChild(flashDiv);
              }
            }, duration);
          }
        });
      }
    } else if (currentView === 'basement') {
      // In basement, handle data orb clicks
      const success = engineRef.current.handleClick(x, y, selectedCampaign, income, campaignCharges);
      if (!success) {
        console.log('Data orb click failed');
      }
    }
  }, [selectedCampaign, income, currentView, handleManualClick, campaignCharges, showCampaignPanel, panels, lawsuitState.showLawsuitPanel, rewardState.showSuitcasePanel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle initial size and resize events
    const updateSize = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      canvas.width = width;
      canvas.height = height;
      
      if (engineRef.current) {
        engineRef.current.resize(width, height);
      } else {
        const isMobile = width < 768;
        engineRef.current = new MetamanEngine(ctx, width, height, isMobile);
        
        // Set up callbacks
        engineRef.current.setCallbacks(
          (amount: number) => {
            if (amount > 0) {
              incrementIncome(amount);
            } else {
              decrementIncome(Math.abs(amount));
            }
          },
          incrementUsers,
          setRegulatoryRisk,
          setCampaignCooldown,
          incrementDataInventory,
          setCampaignCharges,
          deliverLawsuit,
          incrementOrbsInventory,
          addVisualEffect
        );
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    
    let animationFrameId: number;

    const gameLoop = () => {
      if (engineRef.current && gameState === 'playing') {
        engineRef.current.update();
        engineRef.current.render();
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'playing') {
      gameLoop();
    }

    return () => {
      window.removeEventListener('resize', updateSize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [gameState]);

  // Sync current view with engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setCurrentView(currentView);
    }
  }, [currentView]);

  // Sync tower height with engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setTowerHeight(towerHeight);
    }
  }, [towerHeight]);

  // Sync Dan's van visibility with Black Market state - ONLY when explicitly unlocked
  useEffect(() => {
    if (engineRef.current && blackMarketState.isUnlocked) {
      engineRef.current.setDanVanVisibility(blackMarketState.isOpen);
    }
  }, [blackMarketState.isOpen, blackMarketState.isUnlocked]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer touch-none"
        style={{ imageRendering: 'pixelated' }}
        onClick={handleCanvasInteraction}
        onTouchStart={handleCanvasInteraction}
        data-basement-mode={currentView === 'basement' ? 'true' : 'false'}
      />
      <SpeechBubble />
    </div>
  );
}
