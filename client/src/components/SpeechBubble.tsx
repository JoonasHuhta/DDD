import React from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';

export default function SpeechBubble() {
  const { speechBubbleState } = useMetamanGame();

  if (!speechBubbleState.isVisible) {
    return null;
  }

  return (
    <div 
      className="fixed z-50 pointer-events-none transform -translate-x-1/2"
      style={{
        left: '50%',
        top: '25%', // Position higher above Metaman
        animation: 'speechBubbleIn 0.3s ease-out forwards'
      }}
    >
      {/* Speech bubble container */}
      <div className="relative">
        {/* Main bubble */}
        <div className="bg-white border-4 border-black rounded-2xl px-4 py-3 shadow-lg max-w-xs">
          <p className="text-black font-bold text-sm text-center leading-tight">
            {speechBubbleState.message}
          </p>
        </div>
        
        {/* Speech bubble tail pointing down */}
        <div className="absolute left-1/2 top-full transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-l-transparent border-r-transparent border-t-white"></div>
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[18px] border-r-[18px] border-t-[23px] border-l-transparent border-r-transparent border-t-black"></div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes speechBubbleIn {
          0% {
            opacity: 0;
            transform: translateX(-50%) translateY(10px) scale(0.8);
          }
          100% {
            opacity: 1;
            transform: translateX(-50%) translateY(0) scale(1);
          }
        }
      `}} />
    </div>
  );
}