import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, LogOut } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { useResponsiveUI } from '../hooks/useResponsiveUI';

export default function GameOverScreen() {
  const { resetGame, users, peakUsers } = useMetamanGame();
  const responsive = useResponsiveUI();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[20000] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
    >
      <div 
        className="max-w-md w-full bg-white border-8 border-black rounded-[40px] shadow-[12px_12px_0_0_rgba(0,0,0,1)] p-6 md:p-8 relative overflow-hidden flex flex-col"
        style={{ 
          maxHeight: responsive.isMobile ? '80vh' : '90vh',
          marginBottom: responsive.isMobile ? '48px' : '0px' // Lift above mobile safe area
        }}
      >
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 rounded-full -mr-16 -mt-16 opacity-50" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-100 rounded-full -ml-12 -mb-12 opacity-50" />
        
        <div className="relative z-10 text-center flex-1 overflow-y-auto scrollbar-hide py-2">
          <div className="inline-block bg-red-600 text-white px-6 py-2 rounded-full font-black text-xl md:text-2xl uppercase italic skew-x-[-12deg] mb-4 md:mb-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            GAME OVER
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-black uppercase mb-4 leading-tight">
            Your Empire <br />has fallen
          </h2>
          
          <div className="bg-gray-100 border-4 border-black p-4 rounded-2xl mb-6 md:mb-8 relative">
            <div className="absolute -top-4 -left-2 bg-black text-white px-3 py-1 text-[10px] md:text-xs font-bold uppercase italic rounded transform -rotate-3">
              Dan says:
            </div>
            <p className="text-gray-800 font-bold italic text-base md:text-lg leading-relaxed">
              "Well. That happened. Turns out you can't manipulate people forever. <br />Or maybe you just needed more lawyers."
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6 md:mb-8">
            <div className="bg-[#4ECDC4] border-4 border-black p-2 md:p-3 rounded-xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="text-[10px] font-black uppercase text-black/60">Final Users</div>
              <div className="text-lg md:text-xl font-black text-black leading-none">{Math.floor(users).toLocaleString()}</div>
            </div>
            <div className="bg-[#FFD700] border-4 border-black p-2 md:p-3 rounded-xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="text-[10px] font-black uppercase text-black/60">Peak Reach</div>
              <div className="text-lg md:text-xl font-black text-black leading-none">{Math.floor(peakUsers).toLocaleString()}</div>
            </div>
          </div>
          
          <div className="flex flex-col gap-3 md:gap-4 mt-auto">
            <button 
              onClick={() => resetGame()}
              className="group relative bg-[#FF6B35] border-4 border-black px-6 py-3 md:px-8 md:py-4 rounded-2xl shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              <div className="flex items-center justify-center gap-3 font-black text-xl md:text-2xl text-white uppercase italic">
                <RefreshCcw className="w-6 h-6 md:w-8 md:h-8 group-hover:rotate-180 transition-transform duration-500" />
                Try Again
              </div>
            </button>
            
            <button 
              className="opacity-50 grayscale cursor-not-allowed bg-white border-4 border-black px-4 py-2 md:px-6 md:py-3 rounded-xl flex items-center justify-center gap-2 font-black uppercase text-black text-sm md:text-base"
            >
              <LogOut className="w-4 h-4 md:w-5 h-5" />
              Prestige (Locked)
            </button>
          </div>
        </div>
        
        {/* Decorative corner element */}
        <div className="absolute top-4 left-4 text-3xl md:text-4xl opacity-20 transform -rotate-12">💀</div>
      </div>
    </motion.div>
  );
}
