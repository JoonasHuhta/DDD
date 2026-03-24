import React from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { Clock, DollarSign, X } from 'lucide-react';

export default function OfflineProgressPopup() {
  const { 
    offlineProgress,
    formatNumber,
    closeOfflinePopup,
    claimOfflineRewards
  } = useMetamanGame();

  if (!offlineProgress) return null;

  const formatTime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const handleClaim = () => {
    claimOfflineRewards();
  };

  const handleSkip = () => {
    closeOfflinePopup();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg border border-gray-600 p-6 max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Welcome Back!
          </h2>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white transition-colors"
            title="Skip Rewards"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Time Away */}
        <div className="mb-6 text-center">
          <div className="text-sm text-gray-300 mb-2">You were away for:</div>
          <div className="text-2xl font-bold text-yellow-400">
            {formatTime(offlineProgress.timeAway)}
          </div>
          {offlineProgress.timeAway > offlineProgress.maxOfflineHours * 3600000 && (
            <div className="text-xs text-gray-400 mt-1">
              (Capped at {offlineProgress.maxOfflineHours} hours)
            </div>
          )}
        </div>

        {/* Income Earned */}
        <div className="mb-6 p-4 bg-gray-800 rounded border border-gray-600">
          <div className="text-center">
            <div className="text-sm text-gray-300 mb-2">Income Earned:</div>
            <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-2">
              <DollarSign className="w-6 h-6" />
              {formatNumber(offlineProgress.incomeEarned)}
            </div>
            {offlineProgress.offlineMultiplier > 1 && (
              <div className="text-xs text-purple-400 mt-1">
                {offlineProgress.offlineMultiplier.toFixed(1)}x offline multiplier applied
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleSkip}
            className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded transition-colors"
          >
            Skip
          </button>
          <button
            onClick={handleClaim}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded transition-colors flex items-center justify-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Claim
          </button>
        </div>

        {/* Tip */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          Tip: Purchase automation upgrades to earn more while away!
        </div>
      </div>
    </div>
  );
}