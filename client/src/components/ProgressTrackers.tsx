import React from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { DollarSign, Users, Target, TrendingUp } from 'lucide-react';

export default function ProgressTrackers() {
  const { achievementManager, formatNumber } = useMetamanGame();
  
  if (!achievementManager) return null;

  const moneyProgress = achievementManager.getProgressToNext('money');
  const userProgress = achievementManager.getProgressToNext('users');

  return (
    <div className="absolute top-4 left-4 space-y-2 z-20 pointer-events-none">
      {/* Money Progress */}
      {moneyProgress.nextAchievement && (
        <div className="bg-black bg-opacity-80 rounded-lg p-3 border border-green-500">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-bold">
              Next Money Milestone
            </span>
          </div>
          
          <div className="text-white text-xs mb-1">
            {moneyProgress.nextAchievement.name}
          </div>
          
          <div className="w-48 bg-gray-700 rounded-full h-2 mb-1">
            <div 
              className="bg-gradient-to-r from-green-600 to-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${moneyProgress.progress}%` }}
            />
          </div>
          
          <div className="text-green-300 text-xs">
            Only ${formatNumber(moneyProgress.remainingAmount)} away! 
            <span className="text-yellow-400 ml-1">
              (+${formatNumber(moneyProgress.nextAchievement.reward)} bonus)
            </span>
          </div>
        </div>
      )}

      {/* User Progress */}
      {userProgress.nextAchievement && (
        <div className="bg-black bg-opacity-80 rounded-lg p-3 border border-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-bold">
              Next User Milestone
            </span>
          </div>
          
          <div className="text-white text-xs mb-1">
            {userProgress.nextAchievement.name}
          </div>
          
          <div className="w-48 bg-gray-700 rounded-full h-2 mb-1">
            <div 
              className="bg-gradient-to-r from-blue-600 to-blue-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${userProgress.progress}%` }}
            />
          </div>
          
          <div className="text-blue-300 text-xs">
            Only {formatNumber(userProgress.remainingAmount)} users away! 
            <span className="text-yellow-400 ml-1">
              (+${formatNumber(userProgress.nextAchievement.reward)} bonus)
            </span>
          </div>
        </div>
      )}

      {/* Achievement Count */}
      <div className="bg-black bg-opacity-80 rounded-lg p-2 border border-purple-500">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 text-sm">
            {achievementManager.getUnlockedAchievements().length}/{achievementManager.getAllAchievements().length} Achievements
          </span>
        </div>
      </div>
    </div>
  );
}