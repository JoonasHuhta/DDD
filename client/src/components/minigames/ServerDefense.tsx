import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldAlert, Zap, Lock, X, Play, Server, Activity, ArrowRight, Database } from 'lucide-react';
import { useMetamanGame } from '../../lib/stores/useMetamanGame';
import AdaptiveButton from '../AdaptiveButton';
import AdaptivePanel from '../AdaptivePanel';

// Types for the TD mechanics
interface Exploit {
  id: string;
  type: 'ddos' | 'worm' | 'trojan' | 'zeroday';
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  speed: number;
  progress: number; // 0 to 100
}

interface Node {
  id: string;
  type: 'firewall' | 'encryption' | 'ips';
  x: number;
  y: number;
  range: number;
  damage: number;
  cooldown: number;
  lastFired: number;
  cost: number;
}

const SERVER_DEFENSE_PHASES = {
  PREP: 'preparation',
  WAVE: 'wave_active',
  SUCCESS: 'success',
  FAILED: 'failed'
};

const NODE_TYPES = {
  firewall: {
    name: 'Firewall',
    icon: Shield,
    cost: 50,
    damage: 2,
    range: 120,
    cooldown: 800,
    description: 'Basic protection. Standard damage.'
  },
  encryption: {
    name: 'Encryption',
    icon: Lock,
    cost: 120,
    damage: 8,
    range: 150,
    cooldown: 1200,
    description: 'High processing power. Stronger encryption takes longer but deals more damage.'
  },
  ips: {
    name: 'IPS',
    icon: Zap,
    cost: 250,
    damage: 25,
    range: 100,
    cooldown: 2000,
    description: 'Intrusion Prevention. Delivers a high-intensity burst to closer targets.'
  }
};

export const ServerDefense: React.FC = () => {
  const { setShowServerDefense, incrementIncome, addInfluencePoints, addVisualEffect } = useMetamanGame();
  
  // Game State
  const [phase, setPhase] = useState<string>(SERVER_DEFENSE_PHASES.PREP);
  const [wave, setWave] = useState(1);
  const [coreHealth, setCoreHealth] = useState(100);
  const [securityCredits, setSecurityCredits] = useState(200);
  const [exploits, setExploits] = useState<Exploit[]>([]);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  
  const gameLoopRef = useRef<number>();
  const lastUpdateRef = useRef<number>(performance.now());
  const gridRef = useRef<HTMLDivElement>(null);

  // Path definition (percentage based)
  const path = [
    { x: 0, y: 50 },
    { x: 25, y: 50 },
    { x: 25, y: 20 },
    { x: 75, y: 20 },
    { x: 75, y: 80 },
    { x: 50, y: 80 },
    { x: 50, y: 50 } // Core location
  ];

  // Helper to interpolate path position
  const getPointOnPath = (progress: number) => {
    const totalSegments = path.length - 1;
    const segmentIndex = Math.floor((progress / 100) * totalSegments);
    const segmentProgress = ((progress / 100) * totalSegments) % 1;
    
    if (segmentIndex >= totalSegments) return path[path.length - 1];
    
    const start = path[segmentIndex];
    const end = path[segmentIndex + 1];
    
    return {
      x: start.x + (end.x - start.x) * segmentProgress,
      y: start.y + (end.y - start.y) * segmentProgress
    };
  };

  const startWave = () => {
    setPhase(SERVER_DEFENSE_PHASES.WAVE);
    setExploits([]);
    
    // Generate exploits for the wave
    const exploitCount = 5 + (wave * 3);
    const newExploits: Exploit[] = [];
    
    for (let i = 0; i < exploitCount; i++) {
      newExploits.push({
        id: `exploit-${i}-${Date.now()}`,
        type: 'ddos',
        x: 0,
        y: 50,
        health: 20 + (wave * 15),
        maxHealth: 20 + (wave * 15),
        speed: 0.5 + (Math.random() * 0.3),
        progress: - (i * 10) // Staggered entry
      });
    }
    
    setExploits(newExploits);
  };

  const placeNode = (e: React.MouseEvent) => {
    if (phase !== SERVER_DEFENSE_PHASES.PREP || !selectedNodeId) return;
    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const nodeType = NODE_TYPES[selectedNodeId as keyof typeof NODE_TYPES];
    if (securityCredits >= nodeType.cost) {
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: selectedNodeId as any,
        x,
        y,
        range: nodeType.range / 10, // scaling to % coordinates
        damage: nodeType.damage,
        cooldown: nodeType.cooldown,
        lastFired: 0,
        cost: nodeType.cost
      };
      
      setNodes([...nodes, newNode]);
      setSecurityCredits(prev => prev - nodeType.cost);
      addVisualEffect('purchase', e.clientX, e.clientY, 'low');
    }
  };

  const gameLoop = useCallback((time: number) => {
    const dt = time - lastUpdateRef.current;
    lastUpdateRef.current = time;

    if (phase === SERVER_DEFENSE_PHASES.WAVE) {
      setExploits(prevExploits => {
        const updatedExploits = prevExploits
          .map(ex => ({ ...ex, progress: ex.progress + (ex.speed * (dt / 50)) }))
          .filter(ex => {
            if (ex.progress >= 100) {
              setCoreHealth(h => Math.max(0, h - 10));
              return false;
            }
            return ex.health > 0;
          });

        if (updatedExploits.length === 0 && prevExploits.length > 0) {
          if (wave >= 3) {
            setPhase(SERVER_DEFENSE_PHASES.SUCCESS);
          } else {
            setWave(w => w + 1);
            setSecurityCredits(c => c + 150);
            setPhase(SERVER_DEFENSE_PHASES.PREP);
          }
        }
        
        return updatedExploits;
      });

      // Turret shooting logic
      setNodes(prevNodes => prevNodes.map(node => {
        const now = performance.now();
        if (now - node.lastFired < node.cooldown) return node;

        // Find nearest exploit in range
        let targetId: string | null = null;
        let minDist = node.range;

        exploits.forEach(ex => {
          if (ex.progress < 0) return;
          const pos = getPointOnPath(ex.progress);
          const dist = Math.sqrt(Math.pow(pos.x - node.x, 2) + Math.pow(pos.y - node.y, 2));
          if (dist < minDist) {
            minDist = dist;
            targetId = ex.id;
          }
        });

        if (targetId) {
          const currentTargetId = targetId; // Capture for the map closure
          setExploits(prev => prev.map(ex => 
            ex.id === currentTargetId ? { ...ex, health: ex.health - node.damage } : ex
          ));
          return { ...node, lastFired: now };
        }
        
        return node;
      }));
    }

    if (coreHealth <= 0) {
      setPhase(SERVER_DEFENSE_PHASES.FAILED);
      cancelAnimationFrame(gameLoopRef.current!);
    } else {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
  }, [phase, wave, coreHealth, exploits, nodes]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(gameLoopRef.current!);
  }, [gameLoop]);

  const handleFinish = () => {
    if (phase === SERVER_DEFENSE_PHASES.SUCCESS) {
      addInfluencePoints(50);
      incrementIncome(50000);
    }
    setShowServerDefense(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 font-mono">
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-5xl h-[80vh] bg-neutral-900 border-2 border-cyan-500/50 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-cyan-950/30 border-b border-cyan-500/30">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-6 h-6 text-cyan-400 animate-pulse" />
              <div>
                <h2 className="text-xl font-bold text-cyan-400 tracking-wider">SERVER CLUSTER DEFENSE</h2>
                <div className="text-xs text-cyan-600">INTRUSION DETECTED // SECURE THE CORE</div>
              </div>
            </div>
            
            <div className="flex gap-8 px-6 py-2 bg-black/40 rounded-lg border border-cyan-900/50">
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-cyan-700">WAVE</span>
                <span className="text-lg font-bold text-cyan-300">{wave}/3</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-red-700 font-bold">CORE INTEGRITY</span>
                <span className={`text-lg font-bold ${coreHealth < 30 ? 'text-red-500 animate-bounce' : 'text-emerald-400'}`}>
                  {coreHealth}%
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-yellow-700">SEC-CREDITS</span>
                <span className="text-lg font-bold text-yellow-500">${securityCredits}</span>
              </div>
            </div>

            <AdaptiveButton size="sm" variant="ghost" className="text-cyan-500 hover:bg-cyan-950/50" onClick={() => setShowServerDefense(false)}>
              <X className="w-5 h-5" />
            </AdaptiveButton>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {/* Sidebar Tools */}
            <div className="w-64 bg-black/60 border-r border-cyan-950 p-4 space-y-4 overflow-y-auto scrollbar-thin">
              <h3 className="text-xs font-bold text-cyan-600 mb-2 uppercase tracking-tight">Deployment Hardware</h3>
              
              {Object.entries(NODE_TYPES).map(([id, type]) => {
                const Icon = type.icon;
                const canAfford = securityCredits >= type.cost;
                const isSelected = selectedNodeId === id;

                return (
                  <button
                    key={id}
                    disabled={!canAfford || phase !== SERVER_DEFENSE_PHASES.PREP}
                    onClick={() => setSelectedNodeId(id)}
                    className={`w-full group relative flex flex-col items-start p-3 rounded-lg border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-cyan-500/20 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                        : canAfford 
                          ? 'bg-neutral-800/50 border-neutral-700 hover:border-cyan-700' 
                          : 'bg-neutral-900/20 border-neutral-800 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-neutral-400 group-hover:text-cyan-500'}`} />
                      <span className="text-sm font-bold text-neutral-200">{type.name}</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 mb-2 text-left leading-tight">{type.description}</span>
                    <div className="flex justify-between w-full items-center mt-auto">
                      <span className="text-xs font-bold text-yellow-600">${type.cost}</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 rounded-full bg-cyan-900" />
                        <div className="w-1 h-1 rounded-full bg-cyan-900" />
                      </div>
                    </div>
                  </button>
                );
              })}

              <div className="pt-4 mt-auto border-t border-cyan-900/30">
                {phase === SERVER_DEFENSE_PHASES.PREP ? (
                  <button
                    onClick={startWave}
                    className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 group"
                  >
                    <Play className="w-5 h-5 group-hover:scale-125 transition-transform" />
                    INITIALIZE WAVE
                  </button>
                ) : phase === SERVER_DEFENSE_PHASES.WAVE ? (
                  <div className="py-3 px-4 bg-red-950/20 border border-red-500/50 text-red-500 rounded text-center animate-pulse flex items-center justify-center gap-2">
                    <Activity className="w-4 h-4" />
                    WAVE IN PROGRESS
                  </div>
                ) : null}
              </div>
            </div>

            {/* Battle Grid */}
            <div 
              ref={gridRef}
              onClick={placeNode}
              className={`flex-1 relative overflow-hidden bg-neutral-950/80 cursor-crosshair group ${
                phase === SERVER_DEFENSE_PHASES.WAVE ? 'animate-in fade-in' : ''
              }`}
            >
              {/* Grid Background */}
              <div 
                className="absolute inset-0 opacity-10" 
                style={{ backgroundImage: `linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)`, backgroundSize: '40px 40px' }} 
              />
              
              {/* Path Visualization */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
                <path
                  d={`M ${path.map(p => `${p.x}%,${p.y}%`).join(' L ')}`}
                  fill="none"
                  stroke="#083344"
                  strokeWidth="60"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={`M ${path.map(p => `${p.x}%,${p.y}%`).join(' L ')}`}
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="2"
                  strokeDasharray="10 5"
                  className="animate-pulse"
                />
              </svg>

              {/* The Core */}
              <div 
                className="absolute w-24 h-24 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500"
                style={{ left: '50%', top: '50%' }}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 border-4 border-dashed border-cyan-500/40 rounded-full" 
                  />
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-16 h-16 rounded-lg flex items-center justify-center border-4 ${
                      coreHealth < 30 ? 'bg-red-900/40 border-red-500 shadow-[0_0_30px_#ef4444]' : 'bg-cyan-900/40 border-cyan-500 shadow-[0_0_30px_#06b6d4]'
                    }`}
                  >
                    <Server className={`w-8 h-8 ${coreHealth < 30 ? 'text-red-400' : 'text-cyan-400'}`} />
                  </motion.div>
                </div>
              </div>

              {/* Defense Nodes */}
              {nodes.map(node => {
                const type = NODE_TYPES[node.type];
                const Icon = type.icon;
                return (
                  <motion.div
                    key={node.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 z-20"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                    onMouseEnter={() => setHoverNodeId(node.id)}
                    onMouseLeave={() => setHoverNodeId(null)}
                  >
                    <div className="relative w-full h-full flex items-center justify-center">
                      {hoverNodeId === node.id && (
                        <div 
                          className="absolute border border-cyan-500/20 rounded-full bg-cyan-500/5"
                          style={{ width: `${node.range * 20}%`, height: `${node.range * 20}%` }}
                        />
                      )}
                      <div className="bg-neutral-800 border-2 border-cyan-400 rounded p-1.5 shadow-lg group-hover:scale-110 transition-transform">
                        <Icon className="w-5 h-5 text-cyan-400" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}

              {/* Exploits (Attackers) */}
              {exploits.map(ex => {
                if (ex.progress < 0) return null;
                const pos = getPointOnPath(ex.progress);
                return (
                  <motion.div
                    key={ex.id}
                    className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  >
                    <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden border border-black/50 mb-1">
                      <div 
                        className="h-full bg-red-500 transition-all duration-200" 
                        style={{ width: `${(ex.health / ex.maxHealth) * 100}%` }} 
                      />
                    </div>
                    <div className="bg-red-500/20 border border-red-500 rounded p-1 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                      <Activity className="w-3 h-3 text-red-500" />
                    </div>
                  </motion.div>
                );
              })}

              {/* Overlay results */}
              <AnimatePresence>
                {phase === SERVER_DEFENSE_PHASES.SUCCESS && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <Shield className="w-20 h-20 text-emerald-400 mb-4" />
                    <h2 className="text-4xl font-black text-emerald-400 mb-2 tracking-tighter italic">BREACH REPELLED</h2>
                    <p className="text-neutral-400 max-w-md mb-8">All unauthorized access points closed. Data integrity: 100%. Reputation boosted among investors.</p>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-8">
                      <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded text-left">
                        <div className="text-[10px] text-emerald-700 font-bold uppercase">Reward</div>
                        <div className="text-xl font-bold text-emerald-400">$50,000</div>
                      </div>
                      <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded text-left">
                        <div className="text-[10px] text-emerald-700 font-bold uppercase">Reputation</div>
                        <div className="text-xl font-bold text-emerald-400">+50 Influence</div>
                      </div>
                    </div>
                    <AdaptiveButton onClick={handleFinish} variant="primary" size="lg" className="px-12 bg-emerald-600 hover:bg-emerald-500">
                      CLOSE TERMINAL
                    </AdaptiveButton>
                  </motion.div>
                )}

                {phase === SERVER_DEFENSE_PHASES.FAILED && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <ShieldAlert className="w-20 h-20 text-red-500 mb-4" />
                    <h2 className="text-4xl font-black text-red-500 mb-2 tracking-tighter italic">SYSTEM FAILURE</h2>
                    <p className="text-neutral-400 max-w-md mb-8">The core has been breached. Large amounts of user behavioral data leaked to the dark net. Investors are pulling out.</p>
                    <div className="bg-red-950/30 border border-red-500/30 p-4 rounded-lg w-full max-w-xs mb-8">
                      <div className="text-[10px] text-red-700 font-bold uppercase text-center mb-1">Loss Assessment</div>
                      <div className="text-lg font-bold text-red-400">SIGNIFICANT FINANCIAL PENALTY</div>
                    </div>
                    <AdaptiveButton onClick={handleFinish} variant="primary" size="lg" className="px-12 bg-red-600 hover:bg-red-500">
                      EMERGENCY REBOOT
                    </AdaptiveButton>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Footer Stats / Lore */}
          <div className="p-3 bg-black/80 border-t border-cyan-950 flex justify-between items-center text-[10px]">
            <div className="flex gap-4">
              <span className="text-cyan-800">ENCRYPTION LEVEL: AES-256-QUANTUM</span>
              <span className="text-cyan-800">NETWORK LATENCY: 0.14ms</span>
              <span className="text-cyan-800">UPTIME: 99.999%</span>
            </div>
            <div className={`flex items-center gap-2 ${coreHealth < 30 ? 'text-red-500' : 'text-cyan-500'}`}>
              <Activity className="w-3 h-3" />
              <span>CORE STATUS: {coreHealth < 30 ? 'CRITICAL' : 'OPTIMAL'}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
