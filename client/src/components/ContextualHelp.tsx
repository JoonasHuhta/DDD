import React, { useState, useEffect } from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { HelpCircle, X, Lightbulb } from 'lucide-react';

interface HelpTip {
  id: string;
  condition: (state: any) => boolean;
  message: string;
  priority: number;
  category: 'tutorial' | 'suggestion' | 'milestone';
  oneTime?: boolean;
  targetButton?: 'campaigns' | 'departments' | 'basement' | 'lawsuits' | 'upgrades' | 'mansion';
}

const HELP_TIPS: HelpTip[] = [
  {
    id: 'first_campaign',
    condition: (state) => state.users === 0 && state.campaignCharges === 5,
    message: "Click the lightning bolt to open campaigns, then click in the city to lure citizens",
    priority: 1,
    category: 'tutorial',
    oneTime: true,
    targetButton: 'campaigns'
  },
  {
    id: 'low_charges',
    condition: (state) => state.campaignCharges === 0,
    message: "Campaign charges recharge automatically every 3 seconds",
    priority: 2,
    category: 'suggestion',
    oneTime: true,
    targetButton: 'campaigns'
  },
  {
    id: 'first_department',
    condition: (state) => state.income >= 500 && state.departments.every((d: any) => d.owned === 0),
    message: "Buy your first department for passive income - click the building icon",
    priority: 3,
    category: 'tutorial',
    oneTime: true,
    targetButton: 'departments'
  },
  {
    id: 'basement_available',
    condition: (state) => state.users >= 5 && state.currentView === 'city',
    message: "Basement unlocked! Collect data orbs for extra income",
    priority: 4,
    category: 'milestone',
    oneTime: true,
    targetButton: 'basement'
  },
  {
    id: 'lawsuit_delivered',
    condition: (state) => state.lawsuitState?.isDelivered && !state.lawsuitState?.isAcknowledged,
    message: "Check the red suitcase icon - you have legal trouble!",
    priority: 5,
    category: 'suggestion',
    oneTime: true,
    targetButton: 'lawsuits'
  }
,
];

export default function ContextualHelp() {
  // Use granular selectors to prevent re-renders on every income/user update
  const dismissedTips = useMetamanGame(s => s.dismissedTips);
  const dismissTip = useMetamanGame(s => s.dismissTip);
  const gameSettings = useMetamanGame(s => s.gameSettings);
  const setActiveTipTarget = useMetamanGame(s => s.setActiveTipTarget);
  
  // Specific state pieces needed for conditions
  const users = useMetamanGame(s => s.users);
  const income = useMetamanGame(s => s.income);
  const campaignCharges = useMetamanGame(s => s.campaignCharges);
  const currentView = useMetamanGame(s => s.currentView);
  const departments = useMetamanGame(s => s.departments);
  const lawsuitDelivered = useMetamanGame(s => s.lawsuitState?.isDelivered);

  const [currentTip, setCurrentTip] = useState<HelpTip | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Memoize the state for condition checking
  const gameStateForCondition = {
    users,
    income,
    campaignCharges,
    currentView,
    departments,
    lawsuitState: { isDelivered: lawsuitDelivered }
  };


  useEffect(() => {
    // Skip if contextual help is explicitly disabled
    if (gameSettings?.showContextualHelp === false) {
      if (isVisible) {
        setIsVisible(false);
        setActiveTipTarget(null);
        setTimeout(() => setCurrentTip(null), 300);
      }
      return;
    }

    // Find the highest priority tip that matches current conditions
    const applicableTips = HELP_TIPS
      .filter(tip => {
        // Skip if already dismissed AND it's not the currently showing tip
        if (dismissedTips.includes(tip.id) && tip.id !== currentTip?.id) return false;
        
        // Check if condition is met
        return tip.condition(gameStateForCondition);
      })
      .sort((a, b) => a.priority - b.priority);

    const bestTip = applicableTips[0];
    
    // Only update if we have a NEW tip ID
    if (bestTip && bestTip.id !== currentTip?.id) {
      setCurrentTip(bestTip);
      setIsVisible(true);
      setActiveTipTarget(bestTip.targetButton || null);
      
      // If it's a one-time tip, mark it as dismissed immediately in the store
      // so it never qualifies as a "bestTip" again, but keep it showing locally.
      if (bestTip.oneTime) {
        dismissTip(bestTip.id);
        
        // Auto-hide after 8 seconds of visibility
        const timer = setTimeout(() => {
          setIsVisible(false);
          const hideTimer = setTimeout(() => {
            setCurrentTip(null);
            setActiveTipTarget(null);
          }, 300);
          return () => clearTimeout(hideTimer);
        }, 8000);
        return () => clearTimeout(timer);
      }
    } else if (!bestTip && currentTip) {
      // Only hide if the current tip is no longer applicable
      setIsVisible(false);
      setActiveTipTarget(null);
      const hideTimer = setTimeout(() => setCurrentTip(null), 300);
      return () => clearTimeout(hideTimer);
    }
  }, [
    users, 
    income, 
    campaignCharges, 
    currentView, 
    departments,
    lawsuitDelivered, 
    currentTip?.id,
    dismissedTips
  ]);

  const handleDismiss = () => {
    if (currentTip) {
      dismissTip(currentTip.id);
      setIsVisible(false);
      setActiveTipTarget(null);
      setTimeout(() => setCurrentTip(null), 300);
    }
  };

  if (!currentTip || gameSettings?.showContextualHelp === false) return null;

  const getIconColor = () => {
    switch (currentTip.category) {
      case 'tutorial': return 'text-blue-400';
      case 'suggestion': return 'text-yellow-400';
      case 'milestone': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getBorderColor = () => {
    switch (currentTip.category) {
      case 'tutorial': return 'border-blue-500';
      case 'suggestion': return 'border-yellow-500';
      case 'milestone': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <div 
      className={`fixed right-4 max-w-xs bg-black bg-opacity-95 rounded-2xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] p-4 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95'
      }`}
      style={{ 
        pointerEvents: isVisible ? 'auto' : 'none',
        bottom: 'calc(13rem + var(--safe-bottom))'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {currentTip.category === 'tutorial' && <HelpCircle className={`w-4 h-4 ${getIconColor()}`} />}
          {currentTip.category === 'suggestion' && <Lightbulb className={`w-4 h-4 ${getIconColor()}`} />}
          {currentTip.category === 'milestone' && <span className="text-green-400">🎉</span>}
          <span className={`text-xs font-medium ${getIconColor()}`}>
            {currentTip.category === 'tutorial' ? 'Guide' : 
             currentTip.category === 'suggestion' ? 'Tip' : 'Achievement'}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 bg-gray-800 rounded-full text-gray-400 hover:text-white hover:bg-red-500 transition-all"
          title="Close tip"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Message */}
      <p className="text-sm text-gray-200 leading-relaxed">
        {currentTip.message}
      </p>

      {/* Dismiss button for tutorial tips */}
      {currentTip.category === 'tutorial' && (
        <button
          onClick={handleDismiss}
          className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          Got it!
        </button>
      )}
    </div>
  );
}