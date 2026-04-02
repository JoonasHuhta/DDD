import { useMetamanGame } from "../lib/stores/useMetamanGame";
import { useAudio } from "../lib/stores/useAudio";
import { usePanelState } from "../hooks/usePanelState";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, DollarSign, Users, Settings, Building, Database, ShoppingCart, Building2, TrendingUp, Clock, Trophy, Bot, BarChart3, Zap, Briefcase, Gift, Scale, Home, LineChart, Lock, XCircle } from "lucide-react";
import DepartmentPanel from "./DepartmentPanel";
import CampaignPanel from "./CampaignPanel";
import ProgressionPanel from "./ProgressionPanel";
import AutomationShop from "./AutomationShop";
import StatisticsPanel from "./StatisticsPanel";
import OptionsPanel from "./OptionsPanel";
import SynergyUpgradesPanel from "./SynergyUpgradesPanel";
import OfflineProgressPopup from "./OfflineProgressPopup";
// import DepartmentVisualFeedback from "./DepartmentVisualFeedback"; // HIDDEN per user request
import MetamanCooldownIndicator from "./MetamanCooldownIndicator";
import CampaignVisualEffects from "./CampaignVisualEffects";
import LawsuitPanel from "./LawsuitPanel";
import SuitcasePanel from "./SuitcasePanel";
import AchievementShowcase from './AchievementShowcase';
import ProgressionOverview from './ProgressionOverview';
import AdaptiveText from "./AdaptiveText";
import AdaptiveButton from "./AdaptiveButton";
import { useResponsiveUI } from "../hooks/useResponsiveUI";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import AchievementPopup from "./AchievementPopup";
import VisualEffects from "./VisualEffects";
import TrophyPanel from "./TrophyPanel";
import ErrorBoundary from "./ErrorBoundary";
import LegalSystem from "./LegalSystem";
import SinisterLab from "./SinisterLab";
import ResearchLabPanel from "./ResearchLabPanel";
import MansionPanel from "./MansionPanel";
import TutorialPanel from "./TutorialPanel";
import DataMarketPanel from "./DataMarketPanel";
import CharacterDialogue from "./CharacterDialogue";
import EspionageMinigame from "./minigames/EspionageMinigame";
import { ServerDefense } from "./minigames/ServerDefense";
import SenateHearing from "./minigames/SenateHearing";
import HeatMeter from "./HeatMeter";
import CrisisManager from "./CrisisManager";
import GameOverScreen from "./GameOverScreen";
// StyleShowcase removed - using original theme only


export default function GameUI() {
  const { 
    income, 
    users, 
    gameState, 
    startGame,
    showCampaignPanel,
    toggleCampaignPanel,
    currentView,
    setCurrentView,
    dataInventory,
    orbsInventory,
    sellAllData,
    calculateDataOrbValue,
    totalIncomePerSecond,
    formatNumber,
    clickCooldown,
    lastClickTime,
    saveGame,
    updateClickParticles,
    clickParticles,
    selectedCampaign,
    setSelectedCampaign,
    regulatoryRisk,
    campaignCooldowns,
    campaignCharges,
    lawsuitState,
    toggleLawsuitPanel,
    acknowledgeLawsuit,
    triggerLawsuit,
    rewardState,
    visualEffects,
    achievementManager,
    showAchievementShowcase,
    closeAchievementShowcase,
    removeVisualEffect,
    toggleTrophyPanel,
    showTutorial,
    setShowTutorial,
    showDataMarket,
    setShowDataMarket,
    showEspionage,
    setShowEspionage,
    showServerDefense,
    setShowServerDefense,
    showSenateHearing,
    setShowSenateHearing,
    activeTipTarget,
    isGameOver,
    lastUserLossTime,
    currentAchievementShowcase
  } = useMetamanGame();
  const { isMuted, toggleMute } = useAudio();
  const responsive = useResponsiveUI();
  const panels = usePanelState();
  
  const [clickCooldownPercent, setClickCooldownPercent] = useState(0);
  const [showProgressionOverview, setShowProgressionOverview] = useState(false);

  // Panel management via usePanelState — only one panel open at a time
  const closeAllPanels = () => {
    panels.closeAllPanels();
    if (showCampaignPanel) toggleCampaignPanel();
    if (lawsuitState.showLawsuitPanel) toggleLawsuitPanel();
    if (showDataMarket) setShowDataMarket(false);
    if (showEspionage) setShowEspionage(false);
    if (showServerDefense) setShowServerDefense(false);
  };

  const isAnyPanelOpen = () => {
    return panels.isAnyPanelOpen() || showCampaignPanel || lawsuitState.showLawsuitPanel || rewardState.showSuitcasePanel || showEspionage || showServerDefense;
  };

  const openPanel = (panelName: string) => {
    closeAllPanels();
    setTimeout(() => {
      switch(panelName) {
        case 'departments': panels.openPanel('departments'); break;
        case 'progression': panels.openPanel('campaigns'); break;
        case 'automation': panels.openPanel('automation'); break;
        case 'statistics': panels.openPanel('statistics'); break;
        case 'options': panels.openPanel('options'); break;
        case 'synergies': panels.openPanel('synergies'); break;
        case 'legal': 
          panels.openPanel('legal'); 
          acknowledgeLawsuit();
          break;
        case 'suitcase': 
          panels.openPanel('suitcase'); 
          acknowledgeLawsuit();
          break;
        case 'mansion': panels.openPanel('mansion'); break;
        case 'sinisterLab': panels.openPanel('sinisterLab'); break;
        case 'campaigns': toggleCampaignPanel(); break;
        case 'lawsuit': toggleLawsuitPanel(); break;
        case 'market': setShowDataMarket(true); break;
      }
    }, 50);
  };

  const lastGameStateRef = useRef(gameState);

  const togglePanel = (panelName: string, currentlyOpen: boolean) => {
    if (currentlyOpen) {
      closeAllPanels();
    } else {
      openPanel(panelName);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllPanels();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCampaignPanel, lawsuitState.showLawsuitPanel, showDataMarket, showEspionage, showServerDefense, panels.openPanelId]);

  useEffect(() => {
    const handleCloseDepartmentPanel = () => panels.closePanel('departments');
    window.addEventListener('closeDepartmentPanel', handleCloseDepartmentPanel);
    return () => window.removeEventListener('closeDepartmentPanel', handleCloseDepartmentPanel);
  }, []);

  // Update visual UI effects (particles and cooldowns)
  useEffect(() => {
    const interval = setInterval(() => {
      updateClickParticles();
      
      const state = useMetamanGame.getState();
      
      // HEAT DECAY: High frequency updates for smoothness
      state.updateHeat();
      
      // Update click cooldown visual
      const now = Date.now();
      const timeSinceClick = now - state.lastClickTime;
      const cooldownPercent = Math.min(100, (timeSinceClick / state.clickCooldown) * 100);
      setClickCooldownPercent(cooldownPercent);
    }, 100); // Run at 10fps for smooth visual updates

    return () => clearInterval(interval);
  }, [updateClickParticles]);

  // Initialize and play music on first load / interaction
  const { initAudio, playBackgroundMusic, currentTrack, setTrack, pauseBackgroundMusic, playCash4, isTransitioning, setIsTransitioning } = useAudio();
  
  useEffect(() => {
    initAudio();
    
    // Automatic track maintenance - ONLY on state change
    if (gameState !== lastGameStateRef.current && !isTransitioning) {
      if (gameState === 'menu' && currentTrack !== 'Forgo1.mp3') {
        setTrack('Forgo1.mp3');
      } else if (gameState === 'playing' && currentTrack === 'Forgo1.mp3') {
        // Only auto-switch to Forgo2 if we were explicitly using the menu track
        setTrack('Forgo2.mp3');
      }
      lastGameStateRef.current = gameState;
    }

    const timer = setTimeout(() => {
      if (!isMuted && !isTransitioning) {
        console.log('[AUDIO]', 'AUTO_PLAY_TIMER_FIRE', gameState);
        playBackgroundMusic();
      }
    }, 500); // Shorter delay for menu startup

    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log('[AUDIO]', 'APP_HIDDEN', 'Pausing music');
        pauseBackgroundMusic();
      } else {
        console.log('[AUDIO]', 'APP_VISIBLE', 'Resuming music');
        if (!isMuted) playBackgroundMusic();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const startAudioOnInteraction = () => {
      initAudio();
      if (!isMuted && !isTransitioning) {
        console.log('[AUDIO]', 'INTERACTION_PLAY');
        playBackgroundMusic();
      }
      window.removeEventListener('click', startAudioOnInteraction);
      window.removeEventListener('touchstart', startAudioOnInteraction);
    };

    window.addEventListener('click', startAudioOnInteraction);
    window.addEventListener('touchstart', startAudioOnInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', startAudioOnInteraction);
      window.removeEventListener('touchstart', startAudioOnInteraction);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initAudio, playBackgroundMusic, isMuted, gameState, isTransitioning, setTrack, currentTrack]);




  if (gameState === 'menu') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#87CEEB]">


        <div className="text-center p-8">
          {/* Cartoon City Silhouettes behind Dan could be added here */}
          
          {/* Game Logo */}
          <div className={`${responsive.isMobile ? 'mb-4' : 'mb-8'} relative`}>
            <img 
              src="/dan-face-final.png"
              alt="Dopamine Dealer Dan"
              className={`mx-auto ${responsive.isMobile ? 'max-w-[12rem]' : 'max-w-lg'} w-full h-auto drop-shadow-2xl z-10 relative animation-float`}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.parentElement?.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'block';
              }}
            />
            {/* Comic burst behind logo */}
            <div className="absolute inset-0 bg-[#FFD700] rounded-full blur-3xl opacity-30 animate-pulse"></div>
          </div>
          
          {/* Game Title */}
          <h1 
            className={`${responsive.isMobile ? 'text-6xl' : 'text-[120px]'} font-black comic-title transform -rotate-[5deg] ${responsive.isMobile ? 'mb-6' : 'mb-8'} select-none drop-shadow-2xl animate-pulse-slow`}
            data-game-title
          >
            DOPAMINE<br/>DEALER DAN
          </h1>
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes pulse-slow {
              0%, 100% { transform: rotate(-5deg) scale(1); }
              50% { transform: rotate(-5deg) scale(1.05); }
            }
            .animate-pulse-slow {
              animation: pulse-slow 4s ease-in-out infinite;
            }
          `}} />
          
          <p className={`text-black font-black ${responsive.isMobile ? 'text-sm' : 'text-xl'} ${responsive.isMobile ? 'mb-4' : 'mb-8'} uppercase tracking-widest bg-white/50 py-2 rounded-full inline-block px-6 border-2 border-black`}>
            The World's Most Addictive App!
          </p>
          
          <div className={`flex flex-col ${responsive.isMobile ? 'gap-3' : 'gap-6'} ${responsive.isMobile ? 'mb-4' : 'mb-8'} max-w-sm mx-auto`}>
            <button
              onClick={() => {
                const screenAny = screen as any;
                if (screenAny.orientation && screenAny.orientation.lock) {
                  screenAny.orientation.lock('portrait').catch(() => {});
                }
                
                // Track Switch Sequence
                setIsTransitioning(true);
                pauseBackgroundMusic();
                playCash4(); // Ka-ching! (specific sound)
                setTrack('Forgo2.mp3');
                
                // 1. View switch delay (Menu -> City) - Wait for sound to be well underway
                setTimeout(() => {
                  startGame();
                }, 2000);

                // 2. Longer delay for music (Sound completion + Gap)
                setTimeout(() => {
                  setIsTransitioning(false);
                  playBackgroundMusic();
                }, 3500);
              }}
              className={`${responsive.isMobile ? 'px-8 py-3 text-xl' : 'px-12 py-5 text-3xl'} bg-[#FF6B35] border-4 border-black text-white font-black rounded-2xl transition-all duration-100 transform hover:scale-105 active:scale-95 active:translate-y-2 shadow-[0_8px_0_0_rgba(0,0,0,1)] active:shadow-none uppercase`}
            >
              NEW GAME
            </button>

            <button
              onClick={() => {
                openPanel('options');
              }}
              className={`${responsive.isMobile ? 'px-8 py-3 text-xl' : 'px-12 py-5 text-3xl'} bg-[#4ECDC4] border-4 border-black text-white font-black rounded-2xl transition-all duration-100 transform hover:scale-105 active:scale-95 active:translate-y-2 shadow-[0_8px_0_0_rgba(0,0,0,1)] active:shadow-none uppercase`}
            >
              SETTINGS
            </button>
          </div>
          
          {/* Footer Info / Briefing */}
          <div className={`flex flex-col ${responsive.isMobile ? 'gap-2' : 'gap-4'} mt-4 max-w-sm mx-auto w-full`}>
            <button 
              onClick={() => setShowTutorial(true)}
              className="flex items-center justify-center gap-2 text-black/40 hover:text-[#4ECDC4] transition-colors py-2"
            >
              <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-black">
                i
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Mission Briefing</span>
            </button>

            <div className="text-black/40 font-black text-[10px] uppercase tracking-widest">
              © JOONAS HUHTA
            </div>
          </div>
          
          {/* Ensure Tutorial and Options can show over the menu */}
          {showTutorial && <TutorialPanel />}
          {panels.isPanelOpen('options') && <OptionsPanel onClose={() => panels.closePanel('options')} />}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* Simplified click-to-close overlay - ONLY for background game area */}
      {isAnyPanelOpen() && (
        <div 
          className="fixed inset-0 bg-transparent pointer-events-none z-[40]"
        >
          {/* Only the game canvas area should close panels, not the entire screen */}
          {/* On mobile, background tap area is limited to prevent accidental closing */}
          <div 
            className="absolute inset-0 pointer-events-auto"
            style={{ 
              clipPath: responsive.isMobile 
                ? 'none'
                : 'polygon(0% 0%, 70% 0%, 70% 100%, 0% 100%)'
            }}
            onClick={() => closeAllPanels()}
          />
        </div>
      )}

      {/* Emergency panel close overlay - safety button if panels get stuck */}
      {panels.isAnyPanelOpen() && (panels.openPanelId === 'departments' || panels.openPanelId === 'statistics') && false && (
        <div 
          className="fixed top-4 right-4 z-[200] bg-red-600 text-white px-3 py-2 rounded cursor-pointer"
          onClick={closeAllPanels}
          title="Emergency: Close All Panels"
        >
          ✕ Close All
        </div>
      )}
      {/* Click Particles */}
      {clickParticles.map((particle) => (
        <div
          key={particle.id}
          className="absolute pointer-events-none text-green-400 font-bold text-lg animate-pulse"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `translateY(-${(Date.now() - particle.createdAt) / 10}px)`,
            opacity: Math.max(0, 1 - (Date.now() - particle.createdAt) / 2000)
          }}
        >
          {particle.value}
        </div>
      ))}

      {/* Left HUD - Dynamic Resource Meters (Money, Users, Orbs) */}
      <div className="fixed top-2 left-2 sm:left-4 z-[45] pointer-events-none flex justify-start">
        <div className="flex flex-col items-start gap-2 pointer-events-auto">
          {/* Top Row: Main Stats (Money, Users) */}
          <div className="flex flex-wrap items-start gap-2">
            {/* Money Counter */}
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className={`bg-[#FFD700] px-3 py-1 rounded-xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] cursor-pointer`}
            >
              <div className="flex items-center gap-1 text-black font-black">
                <span className="text-lg">$</span>
                <span className={`${responsive.fontSize}`}>{formatNumber(income)}</span>
              </div>
            </motion.div>

            {/* User Counter */}
            <motion.div 
              animate={Date.now() - lastUserLossTime < 1000 ? {
                x: [0, -5, 5, -5, 5, 0],
                backgroundColor: ["#4ECDC4", "#FF1744", "#4ECDC4"]
              } : users > 0 ? {
                scale: [1, 1.05, 1],
                filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
              } : {}}
              transition={Date.now() - lastUserLossTime < 1000 ? {
                duration: 0.2,
                repeat: 2
              } : { duration: 0.3 }}
              className={`bg-[#4ECDC4] px-3 py-1 rounded-xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]`}
            >
              <div className="flex items-center gap-1 text-white font-black stroke-black stroke-1">
                <Users className={responsive.isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                <motion.span 
                  key={users}
                  animate={Date.now() - lastUserLossTime < 1000 ? {
                    scale: [1, 1.2, 1],
                    color: ["#fff", "#000", "#fff"]
                  } : { scale: [1, 1.1, 1], color: ['#fff', '#000', '#fff'] }}
                  transition={{ duration: 0.2 }}
                  className={`${responsive.fontSize}`}
                >
                  {formatNumber(Math.floor(users))}
                </motion.span>
              </div>
            </motion.div>

            {/* Click Cooldown Indicator - Stay in top row */}
            {clickCooldownPercent < 100 && (
              <div className={`bg-white px-3 py-1 rounded-xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]`}>
                <div className="flex items-center gap-1 text-black font-black">
                  <Clock className={responsive.isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                  <div className="w-12 h-3 bg-gray-200 border-2 border-black rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#FF6B35] transition-all duration-100"
                      style={{ width: `${clickCooldownPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Row: Basement Resources (Data, Orbs) */}
          {currentView === 'basement' && (
            <div className="flex items-center gap-2">
              {/* Data Counter */}
              <motion.div 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`bg-[#FF6B35] px-3 py-1 rounded-xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]`}
              >
                <div className="flex items-center gap-1 text-white font-black">
                  <Database className={responsive.isMobile ? 'w-4 h-4' : 'w-5 h-5'} />
                  <span className={`${responsive.fontSize}`}>{dataInventory}</span>
                  <span className="text-xs uppercase ml-1">data</span>
                </div>
              </motion.div>

              {/* Orb Counter */}
              <motion.div 
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className={`bg-[#FF1744] px-3 py-1 rounded-xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]`}
              >
                <div className="flex items-center gap-1 text-white font-black">
                  <span className="text-lg">◈</span>
                  <span className={`${responsive.fontSize}`}>{orbsInventory || 0}</span>
                  <span className="text-xs uppercase ml-1">orbs</span>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>

      {/* Right HUD - Fixed Stage and Heat meter */}
      <div className="fixed top-2 right-2 sm:right-4 z-[45] pointer-events-auto">
        <div className="w-24 sm:w-32">
          <HeatMeter 
            onClick={() => setShowProgressionOverview(true)} 
          />
        </div>
      </div>

      {/* Suitcase removed from top - now in bottom bar */}

      {/* CLEAN BOTTOM MENU - Only 5 panels as requested */}
      <div 
        className={`absolute ${
          responsive.isMobile 
            ? 'left-1/2 transform -translate-x-1/2 flex-row' 
            : 'left-4 top-1/2 transform -translate-y-1/2 flex-col'
        } flex ${responsive.gap} pointer-events-auto z-10`}
        style={responsive.isMobile ? { bottom: 'calc(4rem + var(--safe-bottom))' } : {}}
      >
        <div className={`flex ${responsive.isMobile ? 'flex-row' : 'flex-col'} gap-2 p-1`}>
            {/* 1. Lure Campaigns */}
            <div className="relative">
              <AdaptiveButton
                onClick={() => togglePanel('campaigns', showCampaignPanel)}
                variant={showCampaignPanel ? 'primary' : 'ghost'}
                title="Lure Campaigns"
                icon={<Zap className={responsive.iconSize} />}
                animate={activeTipTarget === 'campaigns' ? 'comic-pulse' : 'none'}
              />
              {users === 0 && income >= 100 && !showCampaignPanel && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping pointer-events-none" />
              )}
            </div>

            {/* 2. Departments & Cohorts (Empire) */}
            <AdaptiveButton
              onClick={() => togglePanel('departments', panels.isPanelOpen('departments'))}
              variant={panels.isPanelOpen('departments') ? 'secondary' : 'ghost'}
              title="Empire"
              icon={<Building2 className={responsive.iconSize} />}
              animate={activeTipTarget === 'departments' ? 'comic-pulse' : 'none'}
            />

            {/* 3. Basement (Market + Sinister) */}
            <AdaptiveButton
              onClick={() => {
                if (isAnyPanelOpen()) closeAllPanels();
                setCurrentView(currentView === 'city' ? 'basement' : 'city');
              }}
              variant={currentView === 'basement' ? 'secondary' : 'ghost'}
              title={currentView === 'city' ? "Basement" : "Exit to City"}
              icon={<Database className={responsive.iconSize} />}
              animate={activeTipTarget === 'basement' ? 'comic-pulse' : 'none'}
            />

            {/* 4. Suitcase (Legal + Rewards) */}
            <div className="relative">
              <AdaptiveButton
                onClick={() => togglePanel('suitcase', panels.isPanelOpen('suitcase'))}
                variant={lawsuitState.isActive || (lawsuitState.isDelivered && !lawsuitState.isAcknowledged) ? 'danger' : (rewardState.rewards.some(r => !r.claimed) ? 'success' : (panels.isPanelOpen('suitcase') ? 'primary' : 'ghost'))}
                title="Legal & Rewards"
                icon={<Briefcase className={responsive.iconSize} />}
                badge={(rewardState.rewards.filter(r => !r.claimed).length + ((lawsuitState.isActive || (lawsuitState.isDelivered && !lawsuitState.isAcknowledged)) ? 1 : 0)) || undefined}
                animate={activeTipTarget === 'lawsuits' ? 'comic-pulse' : 'none'}
              />
            </div>

            {/* 5. Mansion (Stats + Shop) */}
            <AdaptiveButton
              onClick={() => togglePanel('mansion', panels.isPanelOpen('mansion'))}
              variant={panels.isPanelOpen('mansion') ? 'secondary' : 'ghost'}
              title="Mansion"
              icon={<Home className={responsive.iconSize} />}
            />

          </div>
        </div>

      {/* Basement Buttons - Only Lab and Sell */}
      {currentView === 'basement' && (
        <div className={`absolute ${
          responsive.isMobile ? 'right-2 top-1/2 transform -translate-y-1/2' : 'right-4 top-1/2 transform -translate-y-1/2'
        } pointer-events-auto z-20 flex flex-col gap-2`}>
          <div className={`bg-black bg-opacity-75 rounded-lg border border-gray-600 p-1`}>
            <div className={`flex flex-col gap-1`}>
            {/* Exit Basement Button */}
            <button
              onClick={() => {
                closeAllPanels();
                setCurrentView('city');
              }}
              className={`bg-[#FF1744] hover:bg-[#e6002f] ${responsive.buttonSize} flex items-center justify-center rounded-lg border-4 border-black transition-colors relative shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none mb-4`}
              title="Return to City View"
            >
              <XCircle className={`${responsive.iconSize} text-white`} />
              <span className="absolute -top-3 -right-3 bg-white text-black text-[10px] px-1 font-black uppercase italic border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)] transform rotate-3">
                EXIT
              </span>
            </button>

            {/* Data Market Button */}
            <button
              onClick={() => {
                if (isAnyPanelOpen()) closeAllPanels();
                setShowDataMarket(true);
              }}
              className={`bg-[#4ECDC4] hover:bg-[#3dbdb4] ${responsive.buttonSize} flex items-center justify-center rounded-lg border-4 border-black transition-colors relative shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none`}
              title="Access the Data Market to sell and trade user data"
            >
              <LineChart className={`${responsive.iconSize} text-black`} />
              <span className="absolute -top-3 -right-3 bg-white text-black text-[10px] px-1 font-black uppercase italic border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)] transform rotate-3">
                MARKET
              </span>
            </button>

            {/* Sinister Lab Button */}
            <button
              onClick={() => {
                if (isAnyPanelOpen()) closeAllPanels();
                panels.openPanel('sinisterLab');
              }}
              className={`bg-[#FF6B35] hover:bg-[#e85a25] flex items-center justify-center ${responsive.buttonSize} rounded-lg border-4 border-black transition-colors relative shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none mt-2`}
              title="Access the Sinister Lab to break orbs for gems"
            >
              <span className="text-xl">🔬</span>
              <span className="absolute -top-3 -right-3 bg-white text-black text-[10px] px-1 font-black uppercase italic border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)] transform -rotate-3">
                LAB
              </span>
            </button>

            {/* R&D Lab Button */}
            <button
              onClick={() => {
                if (panels.isAnyPanelOpen()) panels.closeAllPanels();
                panels.openPanel('researchLab');
              }}
              className={`bg-[#9D4EDD] hover:bg-[#7b2cbf] flex items-center justify-center ${responsive.buttonSize} rounded-lg border-4 border-black transition-colors relative shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none mt-2`}
              title="Access the R&D Lab to research technologies"
            >
              <span className="text-xl">👩‍🔬</span>
              <span className="absolute -top-3 -right-3 bg-white text-black text-[10px] px-1 font-black uppercase italic border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)] transform rotate-2">
                TECH
              </span>
            </button>

            {/* Corporate Espionage Button */}
            <button
              onClick={() => {
                if (isAnyPanelOpen()) closeAllPanels();
                setShowEspionage(true);
              }}
              className={`bg-[#FFD700] hover:bg-[#e6c200] flex items-center justify-center ${responsive.buttonSize} rounded-lg border-4 border-black transition-colors relative shadow-[4px_4px_0_0_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none mt-2`}
              title="Launch Corporate Espionage to steal competitor data"
            >
              <Lock className={`${responsive.iconSize} text-black`} />
              <span className="absolute -top-3 -right-3 bg-white text-black text-[10px] px-1 font-black uppercase italic border-2 border-black rounded shadow-[2px_2px_0_0_rgba(0,0,0,1)] transform rotate-2">
                HACK
              </span>
            </button>

            </div>
          </div>
        </div>
      )}

      {/* Right Side Settings Button - Fixed positioning */}
      <div className={`absolute ${
        responsive.isMobile ? 'bottom-2 right-2' : 'bottom-4 right-4'
      } flex ${responsive.gap} pointer-events-auto z-10`}>
        {/* Settings Button - Always visible in bottom right */}
        <AdaptiveButton
          onClick={() => togglePanel('options', panels.isPanelOpen('options'))}
          variant={panels.isPanelOpen('options') ? 'secondary' : 'ghost'}
          title="Settings"
          icon={<Settings className={responsive.iconSize} />}
        />
      </div>



      {/* Panels */}
      {showCampaignPanel && (
        <CampaignPanel 
          onCampaignSelect={setSelectedCampaign}
          regulatoryRisk={regulatoryRisk}
          campaignCooldowns={campaignCooldowns}
          campaignCharges={campaignCharges}
          onClose={() => toggleCampaignPanel()}
        />
      )}
      {/* Prevent panels from opening in basement mode */}
      {currentView !== 'basement' && panels.isPanelOpen('statistics') && <StatisticsPanel onClose={() => panels.closePanel('statistics')} />}
      {/* Empire (Departments) can now be opened in city view */}
      {currentView !== 'basement' && panels.isPanelOpen('departments') && <DepartmentPanel 
        onClose={() => panels.closePanel('departments')} 
      />}
      {currentView !== 'basement' && panels.isPanelOpen('synergies') && <SynergyUpgradesPanel onClose={() => panels.closePanel('synergies')} />}
      {currentView !== 'basement' && panels.isPanelOpen('options') && <OptionsPanel onClose={() => panels.closePanel('options')} />}

      {showDataMarket && <DataMarketPanel onClose={() => setShowDataMarket(false)} />}

      {currentView !== 'basement' && panels.isPanelOpen('mansion') && <MansionPanel onClose={() => panels.closePanel('mansion')} />}

      {panels.isPanelOpen('sinisterLab') && <SinisterLab onClose={() => panels.closePanel('sinisterLab')} />}
      
      {panels.isPanelOpen('researchLab') && <ResearchLabPanel onClose={() => panels.closePanel('researchLab')} />}
      
      {panels.isPanelOpen('legal') && <LegalSystem onClose={() => panels.closePanel('legal')} />}

      {/* Visual Feedback Components */}
      {/* DepartmentVisualFeedback HIDDEN per user request */}
      <MetamanCooldownIndicator />
      <ErrorBoundary fallback={null}>
        <CampaignVisualEffects />
      </ErrorBoundary>

      {/* Lawsuit Panel */}
      <LawsuitPanel />

      {/* Suitcase Panel */}
      <SuitcasePanel />

      {/* Offline Progress Popup */}
      <OfflineProgressPopup />
      
      {/* Visual Effects and Achievement Popup Only */}
      <ErrorBoundary fallback={null}>
        <VisualEffects 
          effects={visualEffects} 
          onEffectComplete={removeVisualEffect} 
        />
      </ErrorBoundary>
      
      {/* Achievement Popup (Removed, achievements go to Suitcase) */}
      


      {/* Achievement Showcase */}
      {currentAchievementShowcase && (
        <AchievementShowcase
          achievement={currentAchievementShowcase}
          onComplete={closeAchievementShowcase}
        />
      )}
      
      {/* Trophy Panel */}
      <TrophyPanel />

      {/* Tutorial Panel */}
      {showTutorial && (
        <TutorialPanel />
      )}

      {/* Character Narrative System */}
      <CharacterDialogue />

      {/* Corporate Espionage Minigame Overlay */}
      {showEspionage && <EspionageMinigame onClose={() => setShowEspionage(false)} />}
      
      {/* Server Defense Minigame Overlay */}
      {showServerDefense && <ServerDefense />}

      {/* Senate Hearing Minigame Overlay */}
      {showSenateHearing && <SenateHearing />}

      {/* Progression Overview Popup */}
      {showProgressionOverview && (
        <ProgressionOverview onClose={() => setShowProgressionOverview(false)} />
      )}

      {/* SCANDAL SYSTEM - Crisis Manager */}
      <CrisisManager />
      {/* Game Over Screen */}
      <AnimatePresence>
        {isGameOver && <GameOverScreen />}
      </AnimatePresence>
    </div>
  );
}
