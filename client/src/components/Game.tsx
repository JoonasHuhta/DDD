import { useEffect } from "react";
import GameCanvas from "./GameCanvas";
import GameUI from "./GameUI";
import CampaignPanel from "./CampaignPanel";
import ContextualHelp from "./ContextualHelp";
import GameTitle from "./GameTitle";
import { useMetamanGame } from "../lib/stores/useMetamanGame";
import { useAudio } from "../lib/stores/useAudio";
import RandomLawsuitPopup from "./RandomLawsuitPopup";
import { CharacterLogic } from "../lib/gameEngine/CharacterLogic";

export default function Game() {
  const { 
    regulatoryRisk, 
    campaignCooldowns, 
    setSelectedCampaign, 
    updateCampaignCooldowns,
    showCampaignPanel,
    toggleCampaignPanel,
    currentView,
    setCurrentView,
    initializeGame,
    campaignCharges,
    updatePassiveIncome,
    applyPassiveIncome,
    applyPassiveUserGeneration,
    showRandomLawsuit,
    currentRandomLawsuit,
    resolveRandomLawsuit,
    closeRandomLawsuit,
    formatNumber
  } = useMetamanGame();
  const gameState = useMetamanGame(state => state.gameState);
  const playBackgroundMusic = useAudio(state => state.playBackgroundMusic);
  const pauseBackgroundMusic = useAudio(state => state.pauseBackgroundMusic);
  const isMuted = useAudio(state => state.isMuted);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Reactive Music Control: Play/Pause based on game state and mute status
  useEffect(() => {
    if (gameState === 'playing' && !isMuted) {
      playBackgroundMusic();
    } else {
      pauseBackgroundMusic();
    }
  }, [gameState, isMuted, playBackgroundMusic, pauseBackgroundMusic]);

  // Update campaign cooldowns regularly and auto-recharge
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const interval = setInterval(() => {
      updateCampaignCooldowns();
      
      // Auto-recharge campaign charges every 3 seconds (was 10s)
      const { campaignCharges, setCampaignCharges } = useMetamanGame.getState();
      if (campaignCharges < 5) {
        setCampaignCharges(Math.min(5, campaignCharges + 1));
      }
    }, 3000); // Faster recharge
    
    return () => clearInterval(interval);
  }, [gameState, updateCampaignCooldowns]);

  // CRITICAL FIX: Apply passive income every second
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const passiveIncomeInterval = setInterval(() => {
      updatePassiveIncome(); // Recalculate rates
      applyPassiveIncome();   // Apply money gains
      applyPassiveUserGeneration(); // Apply user generation
      
      const state = useMetamanGame.getState();
      
      // Check for character triggers
      const triggerNode = CharacterLogic.checkTriggers(state);
      if (triggerNode && state.setCharacterDialogue) {
        state.setCharacterDialogue(triggerNode);
      }
      
      // Check for random lawsuits every 5 seconds (reduce frequency)
      if (Date.now() % 5000 < 1000) { // Rough 5-second intervals
        if (state.checkRandomLawsuits) {
          state.checkRandomLawsuits();
        }
      }
      
      // VAN SYSTEM DISABLED - no automatic triggers
    }, 1000); // Every second
    
    return () => clearInterval(passiveIncomeInterval);
  }, [gameState, updatePassiveIncome, applyPassiveIncome, applyPassiveUserGeneration]);

  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaign(campaignId);
    console.log(`Selected campaign: ${campaignId}`);
  };

  return (
    <div className="relative w-full h-full">
      <GameCanvas />
      <GameUI />
      {gameState === 'playing' && showCampaignPanel && (
        <CampaignPanel 
          onCampaignSelect={handleCampaignSelect}
          regulatoryRisk={regulatoryRisk}
          campaignCooldowns={campaignCooldowns}
          campaignCharges={campaignCharges}
          onClose={toggleCampaignPanel}
        />
      )}
      {gameState === 'playing' && showRandomLawsuit && currentRandomLawsuit && (
        <RandomLawsuitPopup
          lawsuit={currentRandomLawsuit}
          onResolve={resolveRandomLawsuit}
          onClose={closeRandomLawsuit}
          formatNumber={formatNumber}
        />
      )}
      {gameState === 'playing' && <ContextualHelp />}
    </div>
  );
}
