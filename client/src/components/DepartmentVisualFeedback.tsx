import React from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { Building2, TrendingUp, Zap } from 'lucide-react';

export default function DepartmentVisualFeedback() {
  const { departments, totalIncomePerSecond, formatNumber } = useMetamanGame();

  // Calculate total owned departments
  const totalDepartments = departments.reduce((sum, dept) => sum + dept.owned, 0);
  
  if (totalDepartments === 0) return null;

  return (
    <div className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-lg border border-gray-600 p-2 min-w-48 z-30 pointer-events-none">
      <div className="text-xs text-gray-300 mb-1">Department Status</div>
      
      {/* Department Count Summary */}
      <div className="flex items-center gap-1 text-blue-400 mb-2">
        <Building2 className="w-3 h-3" />
        <span className="text-sm font-mono">{totalDepartments} buildings</span>
      </div>

      {/* Active departments only */}
      {departments.filter(dept => dept.owned > 0).map(dept => (
        <div key={dept.id} className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-gray-400">{dept.icon}</span>
            <span className="text-gray-300">{dept.owned}</span>
          </div>
          <div className="text-xs text-green-400 font-mono">
            +${formatNumber(dept.baseIncome * dept.owned)}/s
          </div>
        </div>
      ))}

      {/* Total passive income display */}
      {totalIncomePerSecond > 0 && (
        <div className="border-t border-gray-600 pt-1 mt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-yellow-400">
              <TrendingUp className="w-3 h-3" />
              <span>Total/sec:</span>
            </div>
            <span className="text-sm font-mono text-yellow-400">
              ${formatNumber(totalIncomePerSecond)}
            </span>
          </div>
        </div>
      )}

      {/* Quick indicator of productivity */}
      <div className="flex justify-center mt-1">
        {Array.from({ length: Math.min(5, Math.floor(totalIncomePerSecond / 100)) }).map((_, i) => (
          <Zap key={i} className="w-2 h-2 text-yellow-400 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
        ))}
      </div>
    </div>
  );
}