import React, { useState } from 'react';
import { X, Scale, AlertTriangle, DollarSign, Users, Gavel, Shield, Info } from 'lucide-react';
import { RandomLawsuit } from '../data/randomLawsuits';

interface RandomLawsuitPopupProps {
  lawsuit: RandomLawsuit;
  onResolve: (resolution: 'ignore' | 'settle' | 'fight') => void;
  onClose: () => void;
  formatNumber: (num: number) => string;
}

export default function RandomLawsuitPopup({ lawsuit, onResolve, onClose, formatNumber }: RandomLawsuitPopupProps) {
  const [selectedTab, setSelectedTab] = useState<'details' | 'options'>('details');

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'light': return 'text-[#FFCC00] bg-yellow-900/20 border-yellow-600';
      case 'medium': return 'text-orange-400 bg-orange-900/20 border-orange-600';
      case 'serious': return 'text-[#FF0055] bg-red-900/20 border-red-600';
      default: return 'text-zinc-400 bg-zinc-900/20 border-zinc-600';
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md font-sans p-4">
      {/* SINISTER POP POPUP */}
      <div className="bg-zinc-950 border-4 border-black rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-black bg-zinc-900 relative">
          {/* Scanline deco */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[repeating-linear-gradient(0deg,_black_0px,_black_1px,_transparent_1px,_transparent_2px)]"></div>
          
          <div className="flex items-center gap-4 relative z-10">
            <div className="bg-[#FF0055] p-3 rounded-2xl border-2 border-black rotate-3">
               <Scale className="w-8 h-8 text-black" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter italic">Liability Incident</h2>
              <p className="text-xs font-mono text-[#00FFD1] uppercase tracking-widest font-bold">Origin: {lawsuit.platform} Digital Hub</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 bg-white hover:bg-zinc-200 border-4 border-black rounded-2xl text-black flex items-center justify-center transition-all shadow-[4px_4px_0_0_black] active:translate-y-1 active:shadow-none"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-zinc-900 border-b-4 border-black">
          {[
            { id: 'details', name: ' Incident Data', icon: <Info className="w-4 h-4" /> },
            { id: 'options', name: 'Strategic Response', icon: <Gavel className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-black uppercase italic transition-all ${
                selectedTab === tab.id
                  ? 'bg-zinc-800 text-[#00FFD1] border-r-4 last:border-r-0 border-black'
                  : 'text-zinc-500 hover:text-white hover:bg-zinc-800 border-r-4 last:border-r-0 border-black'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh] bg-zinc-950 scrollbar-thin scrollbar-thumb-zinc-800">
          {selectedTab === 'details' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Lawsuit Title & Severity */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tight leading-none italic">{lawsuit.title}</h3>
                  <div className={`inline-flex items-center gap-2 px-4 py-1 rounded-xl border-2 text-xs font-black uppercase tracking-widest ${getSeverityColor(lawsuit.severity)}`}>
                    <AlertTriangle className="w-3 h-3" />
                    {lawsuit.severity.toUpperCase()} VIOLATION
                  </div>
                </div>
                <div className="text-right bg-black p-4 rounded-2xl border-2 border-zinc-800 shadow-inner">
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Potential Loss</div>
                  <div className="text-3xl font-black text-[#FF0055] font-mono tracking-tighter">-${formatNumber(lawsuit.demandAmount)}</div>
                </div>
              </div>

              {/* Status Board */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="bg-zinc-900 border-2 border-black p-4 rounded-2xl shadow-[4px_4px_0_0_black]">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-[#00FFD1]" />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Aggrieved Party</span>
                    </div>
                    <p className="text-white font-black text-lg uppercase italic">{lawsuit.plaintiff}</p>
                 </div>
                 <div className="bg-zinc-900 border-2 border-black p-4 rounded-2xl shadow-[4px_4px_0_0_black]">
                    <div className="flex items-center gap-2 mb-2 text-[#FFCC00]">
                      <Scale className="w-4 h-4" />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Jurisdiction</span>
                    </div>
                    <p className="text-white font-black text-lg uppercase italic">Corporate Court</p>
                 </div>
              </div>

              {/* Claims Details */}
              <div className="bg-zinc-900 border-2 border-black p-6 rounded-2xl shadow-[4px_4px_0_0_black] relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-2 opacity-5">
                    <AlertTriangle className="w-20 h-20" />
                 </div>
                 <h4 className="text-xs font-black text-white/50 uppercase italic mb-3">Compliance Conflict Report:</h4>
                 <p className="text-white font-bold text-sm leading-relaxed italic border-l-4 border-[#FF0055] pl-4">
                   "{lawsuit.claim}"
                 </p>
              </div>
            </div>
          )}

          {selectedTab === 'options' && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 pb-2">
              <div className="bg-[#00FFD1]/10 border-2 border-[#00FFD1]/30 rounded-2xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                   <Shield className="w-4 h-4 text-[#00FFD1]" />
                   <h4 className="text-[#00FFD1] text-xs font-black uppercase tracking-widest">Strategic Briefing</h4>
                </div>
                <p className="text-zinc-400 text-[10px] font-bold uppercase leading-tight">These accusations are currently informal. Select a mitigation strategy to proceed. Delaying may increase exposure.</p>
              </div>

              {/* Response Options */}
              <div className="grid grid-cols-1 gap-4">
                {/* Option 1: Ignore */}
                <div className="group bg-zinc-900 border-2 border-black rounded-2xl p-4 hover:border-zinc-500 transition-all shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black]">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-black text-white uppercase italic tracking-tight">🤷 Inert Response</h4>
                    <div className="text-[#00FFD1] font-black font-mono">$0.00</div>
                  </div>
                  <p className="text-zinc-500 text-[10px] font-bold uppercase mb-4 leading-tight">{lawsuit.consequences.ignore}</p>
                  <button
                    onClick={() => onResolve('ignore')}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-xl font-black uppercase italic text-sm transition-all active:scale-[0.98]"
                  >
                    Dismiss Claim
                  </button>
                </div>

                {/* Option 2: Settle */}
                <div className="group bg-[#FFCC00] border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] transform -rotate-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-black text-black uppercase italic tracking-tight">🤝 Quiet Settlement</h4>
                    <div className="text-black font-black font-mono">-${formatNumber(lawsuit.settleCost)}</div>
                  </div>
                  <p className="text-black/60 text-[10px] font-bold uppercase mb-4 leading-tight italic">{lawsuit.consequences.settle}</p>
                  <button
                    onClick={() => onResolve('settle')}
                    className="w-full bg-black text-white py-3 rounded-xl font-black uppercase italic text-sm transition-all hover:bg-zinc-800 active:scale-[0.98]"
                  >
                    Authorize Withdrawal
                  </button>
                </div>

                {/* Option 3: Fight */}
                <div className="group bg-[#FF0055] border-2 border-black rounded-2xl p-4 shadow-[4px_4px_0_0_black] hover:shadow-[6px_6px_0_0_black] transform rotate-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                      <Gavel className="w-5 h-5" /> Aggressive Courtship
                    </h4>
                    <div className="text-right">
                      <div className="text-black font-black font-mono text-sm">-${formatNumber(lawsuit.fightCost)} + RISK</div>
                      <div className="text-black/60 text-[10px] font-black uppercase tracking-tighter">{lawsuit.fightSuccessChance}% Success</div>
                    </div>
                  </div>
                  <p className="text-white/80 text-[10px] font-bold uppercase mb-4 leading-tight">{lawsuit.consequences.fight}</p>
                  <button
                    onClick={() => onResolve('fight')}
                    className="w-full bg-white text-black py-3 rounded-xl font-black uppercase italic text-sm transition-all hover:bg-zinc-200 active:scale-[0.98]"
                  >
                    Engage War Room
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer Technical Bar */}
        <div className="bg-black p-2 flex justify-center border-t-2 border-zinc-800">
           <p className="text-[8px] font-mono text-zinc-600 font-black uppercase tracking-[0.5em]">System.Compliance.Enforcement.Active</p>
        </div>
      </div>
    </div>
  );
}