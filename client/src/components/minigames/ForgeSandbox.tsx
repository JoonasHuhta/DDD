import React, { useState, useEffect } from 'react';
import { Anvil, XCircle, Zap, Search, Mail, FileText, Smartphone, HardDrive, Hammer, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMetamanGame, ForgeItemType } from '../../lib/stores/useMetamanGame';

interface ForgeItem {
  id: string;
  type: ForgeItemType;
  level: number;
}

interface ForgeSandboxProps {
  onClose: () => void;
}

const ITEMS_CONFIG = {
  email: { icon: Mail, label: 'Email', levels: ['📧', '📧', '📧', '🏁'], color: '#4ECDC4' },
  data: { icon: HardDrive, label: 'Data', levels: ['💾', '💾', '💾', '💎'], color: '#FFD700' },
  doc: { icon: FileText, label: 'Doc', levels: ['📄', '📄', '📄', '📜'], color: '#FF6B6B' },
  proof: { icon: Smartphone, label: 'Proof', levels: ['📱', '📱', '📱', '🎭'], color: '#A55DFF' }
};

export const ForgeSandbox: React.FC<ForgeSandboxProps> = ({ onClose }) => {
  const { 
    forgeGrid: grid, 
    forgeTray: outputTray, 
    mergeForgeItems, 
    claimForgeReward, 
    addToForge,
    forgeLastMergePos,
    clearForgeMergePos
  } = useMetamanGame();
  
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showBriefing, setShowBriefing] = useState(false);
  const [particles, setParticles] = useState<{ id: number, x: number, y: number, tx: number, ty: number, color: string }[]>([]);
  const simulateSafeArea = useMetamanGame(state => state.gameSettings.simulateSafeArea);
  const lastMergeTimestamp = React.useRef<number>(0);

  // Seed items if the grid is empty on open
  useEffect(() => {
    const isEmpty = grid.every(cell => cell === null);
    if (isEmpty) {
      console.log("🛠 FORGE UI: Grid empty, seeding initial items...");
      const types: ForgeItemType[] = ['email', 'data', 'doc', 'proof'];
      types.forEach(t => addToForge(t));
    }
  }, []);

  // Trigger confetti when a merge happens (from store)
  useEffect(() => {
    if (forgeLastMergePos && forgeLastMergePos.timestamp !== lastMergeTimestamp.current) {
      lastMergeTimestamp.current = forgeLastMergePos.timestamp;
      const { x, y } = forgeLastMergePos;
      
      console.log("🎊 FORGE UI: Triggering confetti at", x, y);
      
      // Spawn particles
      const newParticles = Array(24).fill(0).map(() => ({
        id: Math.random(),
        x: (x * 25) + 12.5, 
        y: (y * 20) + 10,
        tx: (x * 25) + 12.5 + (Math.random() * 80 - 40),
        ty: (y * 20) + 10 + (Math.random() * 80 - 40),
        color: ['#4ECDC4', '#FFD700', '#FF6B6B', '#A55DFF'][Math.floor(Math.random() * 4)]
      }));
      setParticles(prev => [...prev, ...newParticles]);
      
      // Cleanup particles
      setTimeout(() => {
        setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
      }, 2000);
    }
  }, [forgeLastMergePos]);

  const handleCellClick = (idx: number) => {
    if (isProcessing) return;

    const clickedItem = grid[idx];

    // CASE 1: Selecting first item
    if (selectedIdx === null) {
      if (clickedItem) setSelectedIdx(idx);
      return;
    }

    // CASE 2: Deselecting same item
    if (selectedIdx === idx) {
      setSelectedIdx(null);
      return;
    }

    // CASE 3: Merge, Swap or Move (Deferred to store)
    setIsProcessing(true);
    mergeForgeItems(selectedIdx, idx);
    
    setTimeout(() => {
      setSelectedIdx(null);
      setIsProcessing(false);
    }, 200);
  };

  const addRandomTestItem = () => {
    const types: ForgeItemType[] = ['email', 'data', 'doc', 'proof'];
    addToForge(types[Math.floor(Math.random() * types.length)]);
  };

  const getRewardDescription = (type: ForgeItemType) => {
    switch(type) {
      case 'email': return "CLEAR HEAT (-15)";
      case 'data': return "2x PROFITS (60s)";
      case 'doc': return "INFLUENCE (+25)";
      case 'proof': return "HUGE HEAT DROP (-40)";
      default: return "";
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[120] bg-[#0A192F] bg-opacity-95 flex flex-col items-center justify-center p-4 font-mono text-white touch-none pointer-events-auto ${simulateSafeArea ? 'pb-20' : 'pb-[env(safe-area-inset-bottom)]'}`}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div 
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#112240] border-4 border-[#1E3A8A] rounded-xl overflow-hidden shadow-[0_0_50px_rgba(30,58,138,0.5)] relative"
      >
        
        {/* Briefing Modal */}
        {showBriefing && (
          <div className="absolute inset-0 z-[130] bg-[#0A192F] bg-opacity-98 flex flex-col items-center justify-center p-8 text-center font-mono">
            <div className="max-w-xs border-2 border-blue-900 bg-black p-6 rounded-lg shadow-[0_0_30px_rgba(30,58,138,0.3)]">
              <h3 className="text-blue-400 font-black mb-6 tracking-tighter text-sm uppercase">THE FORGE — OPERATIONAL BRIEFING</h3>
              <div className="text-[11px] text-gray-300 space-y-4 leading-relaxed">
                <p>Evidence doesn't disappear.<br/>It gets recontextualized.</p>
                <p>Merge identical items to refine them. Higher tier = stronger output.</p>
                <p>Finished product waits in the tray.<br/>It won't use itself.</p>
                <p>The machine does not judge.<br/>That's your job.<br/>You're not doing it.</p>
                <p className="text-blue-500 font-bold mt-4">— Management</p>
              </div>
              <button 
                onClick={() => setShowBriefing(false)}
                className="mt-8 w-full py-2 bg-blue-900 hover:bg-blue-800 text-[10px] font-black tracking-widest rounded border border-blue-400 text-blue-100 transition-colors"
              >
                UNDERSTOOD
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-[#1E3A8A] p-3 flex justify-between items-center border-b-4 border-black">
          <div className="flex items-center gap-2">
            <Anvil className="w-6 h-6 text-blue-300 animate-pulse" />
            <h2 className="text-xl font-black tracking-tighter italic uppercase text-white">THE FORGE</h2>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowBriefing(true)} className="hover:scale-110 transition-transform text-blue-300">
              <Mail className="w-6 h-6" />
            </button>
            <button onClick={onClose} className="hover:scale-110 transition-transform">
              <XCircle className="w-8 h-8 text-red-500" />
            </button>
          </div>
        </div>

        {/* Narrative Status Bar */}
        <div className="bg-black py-1 px-3 flex justify-between items-center text-[10px] uppercase font-bold text-blue-400">
          <div className="flex items-center gap-1">
            <Hammer className="w-3 h-3" />
            CONVEYOR ACTIVE
          </div>
          <div className="animate-pulse">WAITING FOR INPUT...</div>
        </div>

        {/* Grid Area */}
        <div className="p-4 bg-[#0F172A] relative overflow-hidden">
          <div className="grid grid-cols-4 grid-rows-5 gap-2 w-full aspect-[4/5]">
            {grid.map((item, i) => (
              <motion.div
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCellClick(i)}
                className={`
                  relative border-2 rounded flex items-center justify-center cursor-pointer overflow-hidden
                  ${selectedIdx === i ? 'bg-blue-900 border-yellow-400 ring-4 ring-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.8)] z-10' : 'bg-black bg-opacity-40 border-gray-700 hover:border-blue-500'}
                  transition-all duration-75
                `}
              >
                {item ? (
                  <motion.div
                    key={item.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                  >
                    <span className="text-3xl">{ITEMS_CONFIG[item.type].levels[item.level]}</span>
                    {item.level > 0 && (
                        <span className={`text-[7px] font-black absolute bottom-1 left-0 right-0 text-center bg-black bg-opacity-80 py-0.5 shadow-sm border-t border-gray-700 ${item.level === 1 ? 'text-yellow-400' : 'text-red-500 animate-pulse'}`}>
                            {item.level === 1 ? 'VERIFIED' : 'CRITICAL'}
                        </span>
                    )}
                  </motion.div>
                ) : null}

                {/* Level indicator */}
                {item && (
                  <div className="absolute bottom-0.5 right-1 flex gap-0.5">
                    {[0, 1, 2].map(l => (
                      <div key={l} className={`w-1 h-1 rounded-full ${l <= item.level ? 'bg-yellow-400' : 'bg-gray-700'}`} />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Confetti Particles Layer */}
          <div className="absolute inset-0 pointer-events-none overflow-visible z-[100]">
            <AnimatePresence>
              {particles.map(p => (
                <motion.div
                  key={p.id}
                  initial={{ left: `${p.x}%`, top: `${p.y}%`, scale: 0, opacity: 1 }}
                  animate={{ 
                    left: `${p.tx}%`, 
                    top: `${p.ty}%`, 
                    scale: [0, 1.5, 0.5],
                    opacity: [1, 1, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  className="absolute w-3 h-3 rounded-sm shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ backgroundColor: p.color }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Output Tray & Controls */}
        <div className="p-4 bg-[#112240] border-t-4 border-black border-dashed">
          <div className="flex justify-between items-end mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Manual Input</span>
              <button 
                onClick={addRandomTestItem}
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg border-b-4 border-green-800 font-bold active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" /> INJECT DATA
              </button>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Output Tray</span>
              <div className="bg-black bg-opacity-50 border-2 border-gray-700 rounded h-12 w-48 flex items-center justify-center gap-1 overflow-x-auto overflow-y-hidden p-1 custom-scrollbar">
                {outputTray.length === 0 ? (
                    <span className="text-[8px] italic text-gray-600 uppercase">EMPTY</span>
                ) : (
                    outputTray.map((t, ii) => (
                        <motion.button
                          key={t.id}
                          whileHover={{ scale: 1.1, filter: 'brightness(1.5)' }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => claimForgeReward(ii)}
                          className={`relative w-8 h-8 flex items-center justify-center rounded border-2 border-dashed group ${t.type === 'email' ? 'border-blue-400' : t.type === 'data' ? 'border-yellow-400' : t.type === 'doc' ? 'border-red-400' : 'border-purple-400'}`}
                        >
                          <span className="text-xl select-none animate-bounce">{ITEMS_CONFIG[t.type].levels[t.level]}</span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-[6px] p-1 rounded whitespace-nowrap z-50 border border-gray-500">
                            {getRewardDescription(t.type)}
                          </div>
                        </motion.button>
                    ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-black p-2 rounded border border-blue-900 flex items-start gap-2">
            <Settings2 className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-[9px] text-gray-400 font-mono leading-tight">
              ADMIN NOTES: Merge identical evidence into Level 3 "History Revised" results. Level 3 items grant specific strategic artifacts. PROTOTYPE V0.1
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-[10px] text-blue-500 font-black uppercase tracking-widest opacity-50">
        "Context is everything. We have removed the context."
      </p>
    </div>
  );
};
