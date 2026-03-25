import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
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
  const [isMeasured, setIsMeasured] = useState(false);
  const [clampedX, setClampedX] = useState(position.x);
  const elementRef = useRef<HTMLDivElement>(null);
  
  // Create a persistent random offset for this specific popup
  const randomOffset = useRef((Math.random() - 0.5) * 40).current;

  useLayoutEffect(() => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const width = rect.width;
      const padding = 24; 
      const screenWidth = window.innerWidth;
      
      const targetX = position.x + randomOffset;
      
      // Calculate direct LEFT position instead of centering with transform
      // This ensures the element is always between [padding] and [screenWidth - width - padding]
      const idealLeft = targetX - width / 2;
      const safeLeft = Math.max(padding, Math.min(screenWidth - width - padding, idealLeft));
      
      setClampedX(safeLeft);
      setIsMeasured(true);
    }
  }, [position.x, incomeGain, userGain]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); 
    }, 4000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={elementRef}
      className={`fixed pointer-events-none z-[80] animate-float-up-fade ${isMeasured ? 'opacity-100' : 'opacity-0'}`}
      style={{
        left: clampedX,
        top: position.y,
        transform: 'none' // Remove horizontal centering transform as we calculate absolute left
      }}
    >
      <div className="bg-black border-4 border-white rounded-xl px-4 py-2 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
        <div className="flex flex-col gap-1 text-[11px] font-black uppercase italic leading-tight whitespace-nowrap">
          {incomeGain && incomeGain > 0 && (
            <div className="flex items-center gap-1 text-green-400">
              <TrendingUp className="w-3 h-3" />
              <span>+${incomeGain.toLocaleString()}/sec</span>
            </div>
          )}
          {userGain && userGain > 0 && (
            <div className="flex items-center gap-1 text-blue-400">
              <Users className="w-3 h-3" />
              <span>+{userGain.toLocaleString()} users/min</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}