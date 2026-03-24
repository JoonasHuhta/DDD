import React, { useEffect, useState } from 'react';
import { DollarSign, Users, TrendingUp } from 'lucide-react';

interface PurchaseFeedbackProps {
  incomeGain?: number;
  userGain?: number;
  position: { x: number; y: number };
  onComplete: () => void;
}

export default function PurchaseFeedback({ 
  incomeGain, 
  userGain, 
  position, 
  onComplete 
}: PurchaseFeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Allow fade out animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className="absolute pointer-events-none z-[70] animate-bounce"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -100%)'
      }}
    >
      <div className="bg-black bg-opacity-90 border border-green-500 rounded-lg px-3 py-2 shadow-lg">
        <div className="flex flex-col gap-1 text-sm font-semibold">
          {incomeGain && (
            <div className="flex items-center gap-1 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span>+${incomeGain}/sec</span>
            </div>
          )}
          {userGain && (
            <div className="flex items-center gap-1 text-blue-400">
              <Users className="w-4 h-4" />
              <span>+{userGain} users/min</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}