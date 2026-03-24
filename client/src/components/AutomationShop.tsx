import React from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { useResponsiveUI } from '../hooks/useResponsiveUI';
import { getFullPanelClasses } from '../lib/utils/responsive';
import { Bot, Zap, ShoppingCart, Brain, X, Lock } from 'lucide-react';

interface AutomationShopProps {
  onClose: () => void;
}

export default function AutomationShop({ onClose }: AutomationShopProps) {
  const responsive = useResponsiveUI();
  const { 
    income,
    automationSystem,
    formatNumber,
    purchaseAutomationUpgrade
  } = useMetamanGame();

  const availableUpgrades = automationSystem?.getAvailableUpgrades({
    totalClicks: 0, // Will be updated in real implementation
    totalIncome: income,
    automationState: automationSystem?.getState()
  }) || [];

  const handlePurchase = (upgradeId: string) => {
    if (purchaseAutomationUpgrade) {
      purchaseAutomationUpgrade(upgradeId);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auto-clicker': return <Bot className="w-4 h-4" />;
      case 'auto-buyer': return <ShoppingCart className="w-4 h-4" />;
      case 'smart-buyer': return <Brain className="w-4 h-4" />;
      case 'auto-upgrade': return <Zap className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'auto-clicker': return 'text-blue-400';
      case 'auto-buyer': return 'text-green-400';
      case 'smart-buyer': return 'text-purple-400';
      case 'auto-upgrade': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className={`${getFullPanelClasses(responsive.isMobile, responsive.isTablet)} p-4`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
          <Bot className="w-5 h-5" />
          Automation Shop
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700 rounded"
          title="Close Shop"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Current Balance */}
      <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-600">
        <div className="text-sm text-gray-300">Available Funds:</div>
        <div className="text-lg font-bold text-green-400">${formatNumber(income)}</div>
      </div>

      {/* Automation Status */}
      <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-600">
        <h3 className="text-sm font-bold text-blue-400 mb-2">Active Systems</h3>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-300">Auto-Clicker:</span>
            <span className={automationSystem?.getState().autoClickerEnabled ? 'text-green-400' : 'text-red-400'}>
              {automationSystem?.getState().autoClickerEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Auto-Buyer:</span>
            <span className={automationSystem?.getState().autoBuyerEnabled ? 'text-green-400' : 'text-red-400'}>
              {automationSystem?.getState().autoBuyerEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Smart Buyer:</span>
            <span className={automationSystem?.getState().smartBuyerEnabled ? 'text-green-400' : 'text-red-400'}>
              {automationSystem?.getState().smartBuyerEnabled ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>

      {/* Available Upgrades */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white">Available Upgrades</h3>
        
        {availableUpgrades.length === 0 ? (
          <div className="text-center py-8">
            <Lock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <div className="text-sm text-gray-400">No upgrades available</div>
            <div className="text-xs text-gray-500 mt-1">
              Keep playing to unlock automation!
            </div>
          </div>
        ) : (
          availableUpgrades.map(upgrade => {
            const cost = automationSystem?.getUpgradeCost(upgrade.id) || 0;
            const canAfford = income >= cost;

            return (
              <div 
                key={upgrade.id}
                className="p-3 bg-gray-800 rounded border border-gray-600 hover:border-gray-500 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={getCategoryColor(upgrade.category)}>
                      {getCategoryIcon(upgrade.category)}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{upgrade.name}</div>
                      <div className="text-xs text-gray-400">
                        Level {upgrade.currentLevel}/{upgrade.maxLevel}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${canAfford ? 'text-green-400' : 'text-red-400'}`}>
                      ${formatNumber(cost)}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-300 mb-3">
                  {upgrade.description}
                </div>

                <button
                  onClick={() => handlePurchase(upgrade.id)}
                  disabled={!canAfford}
                  className={`w-full px-3 py-2 text-xs font-bold rounded transition-colors ${
                    canAfford
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canAfford ? 'PURCHASE' : 'INSUFFICIENT FUNDS'}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Info Section */}
      <div className="mt-4 p-3 bg-gray-900 rounded border border-gray-600">
        <div className="text-xs text-gray-400">
          <div className="font-bold text-white mb-1">Automation Tips:</div>
          <ul className="space-y-1">
            <li>• Auto-clickers generate income automatically</li>
            <li>• Auto-buyers purchase buildings for you</li>
            <li>• Smart buyers optimize purchase efficiency</li>
            <li>• Upgrades stack for maximum automation</li>
          </ul>
        </div>
      </div>
    </div>
  );
}