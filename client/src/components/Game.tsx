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
    formatNumber,
    updateHeat,
    checkGameOver
  } = useMetamanGame();
  const gameState = useMetamanGame(state => state.gameState);
  const playBackgroundMusic = useAudio(state => state.playBackgroundMusic);
  const pauseBackgroundMusic = useAudio(state => state.pauseBackgroundMusic);
  const isMuted = useAudio(state => state.isMuted);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Reactive Music Control: Consolidated to GameUI for reliability
  // useEffect(() => {
  //   if (gameState === 'playing' && !isMuted) {
  //     playBackgroundMusic();
  //   } else {
  //     pauseBackgroundMusic();
  //   }
  // }, [gameState, isMuted, playBackgroundMusic, pauseBackgroundMusic]);

  // Update campaign cooldowns regularly and auto-recharge
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    // Check if we have the Lure Charger for faster recharge
    const state = useMetamanGame.getState();
    const hasLureCharger = state.mansionPurchases.includes('lure_charger');
    const rechargeInterval = hasLureCharger ? 1333 : 2000; // 1.5x faster (from 2000/3000)
    
    const interval = setInterval(() => {
      updateCampaignCooldowns();
      
      // Auto-recharge campaign charges 
      const currentState = useMetamanGame.getState();
      const { campaignCharges, setCampaignCharges, getMaxCampaignCharges } = currentState;
      const maxCharges = getMaxCampaignCharges();
      
      if (campaignCharges < maxCharges) {
        setCampaignCharges(Math.min(maxCharges, campaignCharges + 1));
      }
    }, rechargeInterval); 
    
    return () => clearInterval(interval);
  }, [gameState, updateCampaignCooldowns, useMetamanGame.getState().mansionPurchases.length]);

  // CRITICAL FIX: Apply passive income every second
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const passiveIncomeInterval = setInterval(() => {
      updatePassiveIncome(); // Recalculate rates
      applyPassiveIncome();   // Apply money gains
      applyPassiveUserGeneration(); // Apply user generation
      updateHeat();           // Passive Heat decay (-2/s)
      
      const state = useMetamanGame.getState();
      
      // Check for character triggers
      const triggerNode = CharacterLogic.checkTriggers(state);
      if (triggerNode && state.setCharacterDialogue) {
        state.setCharacterDialogue(triggerNode);
      }
      
      // Check for random lawsuits every 5 seconds (fair lottery)
      const now = Date.now();
      const lastLawsuitCheckTime = (window as any)._lastLawsuitCheck || 0;
      if (now - lastLawsuitCheckTime >= 5000) {
        (window as any)._lastLawsuitCheck = now;
        if (state.checkRandomLawsuits) {
          state.checkRandomLawsuits();
        }
      }
      
      // Neural Overload: Auto-clicking gem logic
      const gemBonuses = state.getGemBonuses();
      if (gemBonuses.autoClicker && state.handleManualClick) {
        state.handleManualClick();
      }
      
      checkGameOver();          // Check for loss conditions
      
      // Update session total play time
      const currentTime = state.totalPlayTime || 0;
      state.setPlayTime(currentTime + 1000);
      
      // VAN SYSTEM DISABLED - no automatic triggers
    }, 1000); // Every second
    
    return () => clearInterval(passiveIncomeInterval);
  }, [gameState, updatePassiveIncome, applyPassiveIncome, applyPassiveUserGeneration, updateHeat]);

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
