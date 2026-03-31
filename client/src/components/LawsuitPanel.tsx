import React from 'react';
import { AlertTriangle, Scale, Gavel, Shield, Zap, Lock, EyeOff } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';

export default function LawsuitPanel() {
  const { 
    lawsuitState, 
    settleLawsuit, 
    fightLawsuit, 
    bribeLarry,
    evadeLawsuit,
    silenceLawsuit, 
    ignoreLawsuit, 
    formatNumber 
  } = useMetamanGame();
  
  const [outcome, setOutcome] = React.useState<{
    title: string;
    message: string;
    moneyChange: number;
    heatChange: string;
    isSuccess: boolean;
  } | null>(null);
  
  const [isExpanded, setIsExpanded] = React.useState(false);
  
  if (!lawsuitState.showLawsuitPanel) return null;

  const handleAction = async (action: () => void | Promise<any>, type: 'settle' | 'fight' | 'evade' | 'bribe') => {
    const success = await action();
    if (type === 'bribe' && !success) return; // Not enough money
    
    let title = "";
    let message = "";
    let money = 0;
    let heat = "";
    
    if (type === 'settle') {
      title = "CASE CLOSED";
      message = "You paid the fine. The regulators are temporarily satisfied.";
      money = -lawsuitState.amount;
      heat = "DECREASED";
    } else if (type === 'bribe') {
      title = "EVIDENCE 'LOST'";
      message = "Larry 'misplaced' the server logs. You bought yourself some time.";
      money = -(50000 * Math.pow(1.5, lawsuitState.larryBribeCount));
      heat = "NONE";
    } else if (type === 'evade') {
      title = "TACTICAL EVASION";
      message = "Paperwork shredded. You are a ghost in the system.";
      heat = "INCREASED";
    } else if (type === 'fight') {
      title = "VERDICT REACHED";
      message = "The judge has made their final ruling.";
      heat = "VOLATILE";
    }

    setOutcome({ title, message, moneyChange: money, heatChange: heat, isSuccess: success !== false });
  };

  const winChance = lawsuitState.fightSuccessChance || 50;

  return (
    <div 
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-[100] p-2 sm:p-4 overflow-hidden backdrop-blur-md animate-in fade-in duration-300 pointer-events-none"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HIGH-STAKES LEGAL BRIEFCASE */}
      <div 
        className="bg-[#FF0055] border-8 border-black rounded-[40px] p-4 sm:p-6 w-full max-w-[480px] relative transform md:rotate-1 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200 flex flex-col max-h-[95dvh] mb-12 sm:mb-0 pointer-events-auto"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Seal of Regulatory Authority */}
        <div className="absolute -top-4 -right-4 w-16 h-16 bg-black rounded-full border-4 border-white flex items-center justify-center transform rotate-12 shadow-xl z-20 overflow-hidden">
          <div className="absolute inset-0 bg-[repeating-conic-gradient(from_0deg,_#333_0deg_10deg,_black_10deg_20deg)] opacity-20"></div>
          <Scale className="w-8 h-8 text-white relative z-10" />
        </div>

        {/* Warning Stripes Header */}
        <div className="flex bg-black py-2 px-4 rounded-xl mb-4 items-center justify-center border-4 border-white shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] shrink-0">
          <AlertTriangle className="w-5 h-5 text-[#FFCC00] mr-2 animate-pulse" />
          <h2 className="text-xl font-black text-white italic tracking-tighter uppercase leading-tight">Legal Emergency</h2>
        </div>

        {/* Content Box - Fixed Height with Inner Scroll */}
        <div 
          className="bg-white border-4 border-black p-4 sm:p-6 rounded-3xl relative z-10 shadow-inner flex flex-col h-full max-h-[400px] sm:max-h-[500px] overflow-hidden"
          style={{ touchAction: 'pan-y' }}
        >
          <div 
            className="overflow-y-auto flex-1 custom-scrollbar pr-2 overscroll-contain"
          >
            {outcome ? (
              <div className="flex flex-col items-center justify-center py-4 animate-in zoom-in-95 duration-300">
                 <div className={`w-16 h-16 rounded-full border-4 border-black flex items-center justify-center mb-4 shadow-[4px_4px_0_0_black] ${outcome.isSuccess ? 'bg-[#00FFD1]' : 'bg-[#FF0055]'}`}>
                    {outcome.isSuccess ? <Shield className="w-8 h-8 text-black" /> : <AlertTriangle className="w-8 h-8 text-white" />}
                 </div>
                 <h3 className="text-xl font-black text-black uppercase italic text-center mb-1 tracking-tighter leading-none">
                   {outcome.title}
                 </h3>
                 <p className="text-zinc-500 font-bold text-center px-4 mb-4 text-xs italic leading-tight">
                   "{outcome.message}"
                 </p>
                 
                 <div className="w-full space-y-2 mb-4">
                    <div className="flex justify-between items-center bg-zinc-100 p-2.5 rounded-xl border-2 border-black">
                       <span className="text-[9px] font-black uppercase text-zinc-400">Financial Impact</span>
                       <span className={`font-mono font-black text-sm ${outcome.moneyChange < 0 ? 'text-[#FF0055]' : 'text-green-600'}`}>
                          {outcome.moneyChange === 0 ? '--' : `${outcome.moneyChange > 0 ? '+' : ''}$${formatNumber(Math.abs(outcome.moneyChange))}`}
                       </span>
                    </div>
                    <div className="flex justify-between items-center bg-zinc-100 p-2.5 rounded-xl border-2 border-black">
                       <span className="text-[9px] font-black uppercase text-zinc-400">Heat Level</span>
                       <span className="font-mono font-black text-black text-sm">{outcome.heatChange}</span>
                    </div>
                 </div>

                 <button 
                  onClick={() => {
                    setOutcome(null);
                    useMetamanGame.getState().dismissLawsuit();
                  }}
                  className="w-full bg-black hover:bg-zinc-800 text-[#00FFD1] font-black py-3.5 rounded-2xl border-4 border-black shadow-[6px_6px_0_0_black] active:translate-y-1 active:shadow-none transition-all uppercase italic tracking-widest text-base"
                 >
                   Return to Game
                 </button>
              </div>
            ) : (
              <div className="flex flex-col gap-0">
                <div className="border-b-4 border-black pb-3 mb-4 flex justify-between items-start gap-2">
                  <div>
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1">Docket: {lawsuitState.activeLawsuitId || "GEN-991"}</p>
                    <h4 className="text-lg sm:text-xl font-black text-black uppercase tracking-tighter leading-tight">
                      {lawsuitState.plaintiff}
                    </h4>
                  </div>
                  <div className="shrink-0 pt-1">
                    <span className="bg-black text-[#FFCC00] text-[8px] font-black px-2 py-1 rounded-md italic whitespace-nowrap">SENSITIVE CASE</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-zinc-600 font-bold italic leading-snug text-sm border-l-4 border-[#FF0055] pl-4 py-1">
                    "{lawsuitState.claim}"
                  </p>
                </div>

                {/* Larry's Dialogue Bubble */}
                <div className="mb-6 relative animate-in slide-in-from-left duration-500">
                  <div className="bg-zinc-900 border-4 border-black rounded-3xl p-4 shadow-[6px_6px_0_0_black] flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#dc2626] border-2 border-black rounded-full shrink-0 flex items-center justify-center relative overflow-hidden">
                       {/* Mini Larry Icon Wrapper */}
                       <div className="w-full h-full bg-[#dc2626] flex items-center justify-center">
                          <Gavel className="w-6 h-6 text-white" />
                       </div>
                       <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent"></div>
                    </div>
                    <div>
                      <span className="text-[8px] font-black text-[#FFCC00] uppercase tracking-widest block mb-1">Larry (Process Server)</span>
                      <p className="text-white text-xs font-bold italic leading-tight">
                        "{lawsuitState.larryDialogue || "Sign here, Dan. It's official."}"
                      </p>
                    </div>
                  </div>
                  {/* Speech bubble tail */}
                  <div className="absolute -bottom-2 left-10 w-4 h-4 bg-zinc-900 border-r-4 border-b-4 border-black rotate-45"></div>
                </div>

                <div className="bg-[#00FFD1] h-1 w-full rounded-full opacity-10 mb-6"></div>

                {!isExpanded ? (
                  /* TIER 1: SIMPLE BUTTONS */
                  <div className="flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
                    <button
                      onClick={() => handleAction(settleLawsuit, 'settle')}
                      className="group flex items-center justify-between bg-black p-5 rounded-3xl border-4 border-black hover:bg-zinc-900 transition-all active:scale-[0.98] shadow-[6px_6px_0_0_black]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-[#00FFD1] p-2 rounded-xl shrink-0">
                          <Shield className="w-6 h-6 text-black" />
                        </div>
                        <div className="text-left">
                          <span className="text-[#00FFD1] font-black uppercase italic text-lg block leading-none">PAY FINE</span>
                          <span className="text-zinc-500 font-bold text-[10px]">Instant settlement</span>
                        </div>
                      </div>
                      <span className="text-[#00FFD1] font-mono font-black text-sm">-${formatNumber(lawsuitState.amount || 0)}</span>
                    </button>

                    <button
                      onClick={ignoreLawsuit}
                      className="group flex items-center justify-between bg-white p-5 rounded-3xl border-4 border-black hover:bg-zinc-100 transition-all active:scale-[0.98] shadow-[6px_6px_0_0_black]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-[#FF0055] p-2 rounded-xl shrink-0">
                          <EyeOff className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                          <span className="text-black font-black uppercase italic text-lg block leading-none">IGNORE</span>
                          <span className="text-zinc-400 font-bold text-[10px]">Dangerous maneuver</span>
                        </div>
                      </div>
                      <span className="text-[#FF0055] font-black text-xs italic">HEAT+</span>
                    </button>

                    <button
                      onClick={() => setIsExpanded(true)}
                      className="w-full bg-zinc-100 border-2 border-dashed border-zinc-400 hover:border-black hover:bg-zinc-200 text-zinc-500 hover:text-black font-black py-3 rounded-2xl transition-all uppercase italic text-xs tracking-widest flex items-center justify-center gap-2"
                    >
                      Deal With It <AlertTriangle className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  /* TIER 2: DEEP STRATEGY (Already existing grid, just wrapped) */
                  <div className="flex flex-col gap-3 pb-4 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-1">
                      <h5 className="text-[10px] font-black uppercase text-zinc-400 italic">Advanced Defense Systems</h5>
                      <button onClick={() => setIsExpanded(false)} className="text-[9px] font-black uppercase text-[#FF0055] hover:underline">Back to basic</button>
                    </div>
                
                  {/* LARRY INTERACTION (Persistent Character) */}
                  <div className="bg-zinc-900 p-4 rounded-2xl border-4 border-black relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap className="w-12 h-12 text-white" />
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[#FFCC00] font-black uppercase italic text-xs tracking-widest">Larry the Process Server</span>
                      <span className="text-zinc-500 font-mono text-[10px]">Greed level: {lawsuitState.larryBribeCount}</span>
                    </div>
                    <button 
                      onClick={() => handleAction(bribeLarry, 'bribe')}
                      className="w-full bg-[#FFCC00] hover:bg-[#ffdb4d] text-black font-black py-2 rounded-xl border-2 border-black transform active:scale-95 transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs"
                    >
                      <Zap className="w-3 h-3 fill-black shrink-0" />
                      BRIBE LARRY (${formatNumber(50000 * Math.pow(1.5, lawsuitState.larryBribeCount))})
                    </button>
                  </div>

                  {/* EVASION TACTICS (3-TIER SYSTEM) */}
                  <div className="grid grid-cols-3 gap-2">
                    <button onClick={() => handleAction(() => evadeLawsuit('shredder'), 'evade')} className="flex flex-col items-center gap-1 bg-zinc-100 p-2 rounded-xl border-2 border-black hover:bg-zinc-200 transition-colors">
                      <Shield className="w-4 h-4 text-zinc-400" />
                      <span className="text-[8px] font-black uppercase">Shredder</span>
                    </button>
                    <button onClick={() => handleAction(() => evadeLawsuit('mixup'), 'evade')} className="flex flex-col items-center gap-1 bg-zinc-100 p-2 rounded-xl border-2 border-black hover:bg-zinc-200 transition-colors">
                      <EyeOff className="w-4 h-4 text-zinc-600" />
                      <span className="text-[8px] font-black uppercase">Mix-up</span>
                    </button>
                    <button onClick={() => handleAction(() => evadeLawsuit('bankruptcy'), 'evade')} className="flex flex-col items-center gap-1 bg-zinc-800 p-2 rounded-xl border-2 border-black hover:bg-zinc-700 transition-colors">
                      <Lock className="w-4 h-4 text-[#9D4EDD]" />
                      <span className="text-[8px] font-black uppercase text-white">Fake Bankrupt</span>
                    </button>
                  </div>

                  {/* COURT CARDS (POKER SYSTEM) */}
                  <div className="border-4 border-black p-4 rounded-3xl bg-zinc-50 relative">
                    <div className="absolute -top-3 left-4 bg-black text-white px-3 py-1 rounded-full text-[8px] font-black italic uppercase tracking-widest">
                        Choose Your Verdict
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
                      <button onClick={() => handleAction(() => fightLawsuit('technical'), 'fight')} className="p-2 border-2 border-black rounded-xl bg-white hover:bg-[#00FFD1] text-[9px] font-black transition-colors uppercase italic shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                        Technical Error
                      </button>
                      <button onClick={() => handleAction(() => fightLawsuit('expert'), 'fight')} className="p-2 border-2 border-black rounded-xl bg-white hover:bg-[#FFCC00] text-[9px] font-black transition-colors uppercase italic shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                        Expert Witness
                      </button>
                      <button onClick={() => handleAction(() => fightLawsuit('media'), 'fight')} className="p-2 border-2 border-black rounded-xl bg-white hover:bg-[#FF0055] text-[9px] font-black transition-colors uppercase italic shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                        Media Blitz
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#00FFD1] h-1 w-full rounded-full opacity-20 my-1"></div>

                  {/* CLASSIC SETTLE */}
                  <button
                    onClick={() => handleAction(settleLawsuit, 'settle')}
                    className="group flex items-center justify-between bg-black p-3 rounded-2xl border-4 border-black hover:bg-zinc-900 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-[#00FFD1] p-1.5 rounded-lg shrink-0">
                        <Shield className="w-4 h-4 text-black" />
                      </div>
                      <span className="text-[#00FFD1] font-black uppercase italic text-sm">Official Settlement</span>
                    </div>
                    <span className="text-[#00FFD1]/60 font-mono text-xs">-${formatNumber(lawsuitState.amount || 0)}</span>
                  </button>

                  {/* SNOWBALL COUNTER */}
                  <button
                    onClick={ignoreLawsuit}
                    className={`w-full py-2 border-2 border-dashed border-black rounded-xl font-black uppercase italic text-[10px] transition-all
                      ${lawsuitState.ignoredCount >= 2 ? 'bg-[#FF0055] text-white animate-pulse' : 'text-zinc-400 hover:text-black'}
                    `}
                  >
                    {lawsuitState.ignoredCount >= 2 ? "WARNING: CLASS ACTION IMMINENT" : `Throw in trash (IGNORE ${lawsuitState.ignoredCount}/3)`}
                  </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer info - Pushed up enough to never be behind nabvar */}
        <div className="mt-4 pb-4 flex justify-between items-center px-4 shrink-0">
           <div className="flex gap-2">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black/40 rounded-full"></div>
              <div className="w-2 h-2 bg-black/10 rounded-full"></div>
           </div>
           <p className="text-[8px] font-mono font-black text-black opacity-30 uppercase tracking-widest">Procedural Code v8.8</p>
        </div>
        
      </div>
    </div>
  );
}