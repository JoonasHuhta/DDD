import { X, AlertTriangle, DollarSign, Scale, Gavel } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';

export default function LawsuitPanel() {
  const { lawsuitState, toggleLawsuitPanel, formatNumber } = useMetamanGame();

  if (!lawsuitState.showLawsuitPanel) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[55] p-2 sm:p-4 overflow-hidden backdrop-blur-md animate-in fade-in duration-300">
      {/* SINISTER POP BRIEFCASE BOMB */}
      <div className="bg-[#FF0055] border-8 border-black rounded-[40px] p-4 sm:p-8 w-full max-w-[440px] relative transform md:rotate-2 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 flex flex-col max-h-[95dvh]">
        
        {/* Corporate Seal Decoration */}
        <div className="absolute -top-4 -right-4 sm:-top-6 sm:-right-6 w-16 h-16 sm:w-20 sm:h-20 bg-black rounded-full border-4 border-white flex items-center justify-center transform rotate-12 shadow-xl z-20">
          <Scale className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>

        {/* Warning Stripes Background Effect */}
        <div className="absolute inset-0 opacity-10 pointer-events-none rounded-[32px] overflow-hidden">
           <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,_black_0px,_black_20px,_transparent_20px,_transparent_40px)]"></div>
        </div>

        {/* Header */}
        <div className="text-center mb-4 sm:mb-8 relative z-10">
          <div className="inline-block bg-black text-white px-6 sm:px-10 py-2 sm:py-3 rounded-2xl mb-2 sm:mb-4 transform -rotate-3 border-4 border-white shadow-[8px_8px_0_0_rgba(0,0,0,0.2)]">
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter italic animate-pulse">BREACH!</h2>
          </div>
          <h3 className="text-base sm:text-xl font-black text-white uppercase italic tracking-widest drop-shadow-lg leading-tight">
            LIABILITY LIQUIDATION
          </h3>
        </div>

        {/* Content - Scrollable on very small screens */}
        <div className="space-y-4 sm:space-y-6 bg-white border-4 border-black p-4 sm:p-8 rounded-3xl relative z-10 shadow-inner overflow-y-auto min-h-0">
          <div className="text-center border-b-4 border-black pb-4">
            <p className="font-mono text-[8px] sm:text-[10px] text-zinc-400 uppercase tracking-[.3em] font-bold mb-1">
              Protocol: {lawsuitState.milestone || "CASE-#882"}
            </p>
            <h4 className="text-xl sm:text-2xl font-black text-black uppercase tracking-tight">
              {lawsuitState.plaintiff || "Regulatory Body"}
            </h4>
          </div>
          
          <div className="text-center">
            <div className="text-[10px] sm:text-sm font-black text-[#FF0055] uppercase tracking-widest mb-1 italic">
              Extracted Damages:
            </div>
            <div className="text-4xl sm:text-6xl font-black text-black font-mono tracking-tighter">
              -${formatNumber(lawsuitState.amount || 0)}
            </div>
          </div>

          <p className="text-zinc-700 font-bold text-center leading-tight italic px-4 border-l-4 border-zinc-200 py-2 text-xs sm:text-base">
            "{lawsuitState.claim || "Your unethical optimization protocols have caused significant systemic distress."}"
          </p>

          {lawsuitState.isDelivered && (
            <div className="bg-[#00FFD1] border-4 border-black rounded-2xl p-2 sm:p-4 text-center transform -rotate-1 shadow-[4px_4px_0_0_black]">
              <p className="text-black text-base sm:text-lg font-black uppercase italic flex items-center justify-center gap-2">
                <Gavel className="w-4 h-4 sm:w-5 sm:h-5" /> SERVED!
              </p>
              <p className="text-black text-[8px] sm:text-[10px] font-bold leading-none mt-1 uppercase">
                Official compliance enforcement active.
              </p>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div 
          className="mt-4 sm:mt-8 flex justify-center relative z-10"
          style={{ marginBottom: 'var(--safe-bottom, 0px)' }}
        >
          <button
            onClick={toggleLawsuitPanel}
            className="w-full py-4 sm:py-5 bg-black hover:bg-zinc-900 text-[#00FFD1] font-black text-2xl sm:text-3xl rounded-2xl transition-all duration-100 transform active:scale-95 shadow-[0_8px_0_0_rgba(100,0,0,0.3)] uppercase italic"
          >
            SETTLE (💸)
          </button>
        </div>

        {/* Technical Deco on sides */}
        <div className="absolute left-6 bottom-6 opacity-20 pointer-events-none font-mono text-[8px] text-black font-bold uppercase rotate-90">
           ERROR_REF_552
        </div>
      </div>
    </div>
  );
}