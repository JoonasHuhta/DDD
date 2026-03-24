import React from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { MousePointer, Zap, Clock, TrendingUp } from 'lucide-react';

export default function EnhancedClickFeedback() {
  const { 
    lastClickTime, 
    clickCooldown, 
    clickCooldownPercent, 
    totalClicks, 
    formatNumber 
  } = useMetamanGame();
  
  const timeSinceClick = Date.now() - lastClickTime;
  const isOnCooldown = timeSinceClick < clickCooldown;
  const cooldownPercent = Math.min(100, (timeSinceClick / clickCooldown) * 100);

  return (
    <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 rounded-lg border border-gray-600 p-2 min-w-32 z-30 pointer-events-none">
      <div className="text-xs text-gray-300 mb-1">Click Status</div>
      
      {/* Click counter */}
      <div className="flex items-center gap-1 text-blue-400 mb-1">
        <MousePointer className="w-3 h-3" />
        <span className="text-sm font-mono">{formatNumber(totalClicks)} clicks</span>
      </div>

      {/* Cooldown indicator */}
      <div className="flex items-center gap-1 mb-1">
        <Clock className={`w-3 h-3 ${isOnCooldown ? 'text-red-400' : 'text-green-400'}`} />
        <div className="flex-1">
          <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-100 ${
                isOnCooldown ? 'bg-red-400' : 'bg-green-400'
              }`}
              style={{ width: `${cooldownPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Status text */}
      <div className="text-xs">
        {isOnCooldown ? (
          <span className="text-red-400">
            Cooldown: {Math.ceil((clickCooldown - timeSinceClick) / 1000)}s
          </span>
        ) : (
          <span className="text-green-400 animate-pulse">
            Ready to click!
          </span>
        )}
      </div>

      {/* Visual effect when ready */}
      {!isOnCooldown && (
        <div className="flex justify-center mt-1">
          <Zap className="w-3 h-3 text-yellow-400 animate-bounce" />
        </div>
      )}
    </div>
  );
}