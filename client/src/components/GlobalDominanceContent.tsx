import React, { useState, useMemo, useEffect } from 'react';
import { Globe, Lock, Shield, Server, Factory, Theater, Briefcase, Laptop, Zap, Activity, ChevronRight, Target, Trophy, Info, AlertTriangle } from 'lucide-react';
import { useMetamanGame, BUILDINGS_CONFIG, NEIGHBOR_MAP } from '../lib/stores/useMetamanGame';
import { useAudio } from '../lib/stores/useAudio';
import { getEventById } from '../data/dominanceEvents';
import { motion, AnimatePresence } from 'framer-motion';

interface CountryStaticData {
  id: string;
  name: string;
  flag: string;
  x: number;
  y: number;
  narrative: string;
}

const COUNTRIES_DATA: CountryStaticData[] = [
  { id: 'us', name: 'USA', flag: '🇺🇸', x: 20, y: 35, narrative: '"The ministry of justice uses our Fair-Verdict AI to process cases. It has a built-in bias towards Dan Corp."' },
  { id: 'eu', name: 'EU', flag: '🇪🇺', x: 45, y: 30, narrative: '"Their public transport now runs on Dan-Cloud. When we had a 15-minute outage, three countries filed emergency motions."' },
  { id: 'fi', name: 'Finland', flag: '🇫🇮', x: 52, y: 15, narrative: '"They accepted our free AI tools for public schools. The education minister said it was a pragmatic decision."' },
  { id: 'cn', name: 'China', flag: '🇨🇳', x: 80, y: 40, narrative: '"The arrangement is mutual. They get the tools, we get the training data. Or is it the other way around? No one asks."' },
  { id: 'gb', name: 'UK', flag: '🇬🇧', x: 40, y: 25, narrative: '"They don\'t know we exist yet. Which is exactly how we wanted it to be for the first six months."' },
  { id: 'br', name: 'Brazil', flag: '🇧🇷', x: 30, y: 70, narrative: '"Massive population, zero regulation. A digital gold mine waiting for the first free app to drop."' },
  { id: 'in', name: 'India', flag: '🇮🇳', x: 65, y: 60, narrative: '"A billion users waiting to be processed. We just need to find the right local partner to bribe."' },
  { id: 'ru', name: 'Russia', flag: '🇷🇺', x: 70, y: 25, narrative: '"High income, zero accountability. Perfect for our higher-risk behavioral models."' },
  { id: 'id', name: 'Indonesia', flag: '🇮🇩', x: 85, y: 75, narrative: '"Fastest growing social market. They wont remember life before Dan."' },
  { id: 'ng', name: 'Nigeria', flag: '🇳🇬', x: 50, y: 65, narrative: '"The tech hub of Africa. We start by offering free bandwidth, and then we will own the infrastructure."' },
  { id: 'sa', name: 'Saudi Arabia', flag: '🇸🇦', x: 58, y: 50, narrative: '"Oil money + Big Data. A match made in heaven. Or at least in our servers."' },
  { id: 'jp', name: 'Japan', flag: '🇯🇵', x: 88, y: 35, narrative: '"Digital-first culture. They already live half their lives on screens. We just need to be the only screen that matters."' },
  { id: 'gs', name: 'Global South', flag: '🌍', x: 50, y: 85, narrative: '"Connectivity is a human right. And we are the only ones providing it. Terms apply."' },
  { id: 'lun', name: 'Lunar Base', flag: '🌙', x: 92, y: 15, narrative: '"No jurisdiction up here. Perfect for long-term storage of... sensitive data points."' },
  { id: 'sec', name: 'Sector 7', flag: '🛸', x: 10, y: 85, narrative: '"ERROR: Connection terminated. [REDACTED]. They are watching us back."' },
];

const STAGE_NAMES = ['Untouched', 'Interested', 'Dependent', 'Captured', 'Integrated', 'Ascended'];

const getStageColor = (stage: number) => {
  switch (stage) {
    case 0: return '#374151';
    case 1: return '#4ECDC4';
    case 2: return '#45b7af';
    case 3: return '#FFD700'; // Target identified
    case 4: return '#ffffff'; // Captured
    case 5: return '#ffffff'; // Ascended
    default: return '#374151';
  }
};

const getStageSize = (stage: number) => 1.5 + (stage * 0.3);

function DataLink({ id, stage }: { id: string, stage: number }) {
  const staticData = COUNTRIES_DATA.find(c => c.id === id)!;
  if (stage <= 0) return null;
  
  const duration = 1.8 - (stage * 0.3);
  
  return (
    <g>
      <defs>
        <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="0.2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      <line 
        x1={staticData.x} y1={staticData.y} 
        x2={50} y2={50} 
        stroke="#FFD700" 
        strokeWidth={0.3 + (stage * 0.1)}
        strokeDasharray="2, 4"
        strokeOpacity={0.4 + (stage * 0.1)}
        filter="url(#neon-glow)"
        className="data-link-flow"
        style={{ 
          // @ts-ignore
          "--flow-speed": `${duration}s` 
        }}
      />
      {/* Animated data pulse using SVG native animation to avoid DOM prop warnings */}
      <circle r={0.4 + (stage * 0.1)} fill="#FFD700">
        <animateMotion 
          dur={`${duration}s`}
          repeatCount="indefinite"
          path={`M ${staticData.x} ${staticData.y} L 50 50`}
        />
      </circle>
    </g>
  );
}

function MapNode({ id, isSelected, onClick, hasActiveEvent }: { id: string; isSelected: boolean; onClick: (id: string) => void; hasActiveEvent: boolean }) {
  const countryState = useMetamanGame(s => s.globalDominance.countries[id]);
  const staticData = COUNTRIES_DATA.find(c => c.id === id)!;
  if (!countryState?.isUnlocked) return null;
  const stage = countryState.stage;
  const color = getStageColor(stage);
  const rival = countryState.rivalInfluence || 0;
  const playerScore = Math.min(100, stage * 20); // 0–100
  const isRivalDominant = rival > playerScore;

  return (
    <g className="cursor-pointer" onClick={() => onClick(id)}>
      {/* Rival influence ring – grows red as rival pressure increases */}
      {rival > 10 && (
        <circle
          cx={staticData.x} cy={staticData.y}
          r={getStageSize(stage) + 3}
          fill="none"
          stroke={isRivalDominant ? '#FF1744' : '#FF6B35'}
          strokeWidth={0.6 * (rival / 100)}
          opacity={0.5 + (rival / 200)}
          className={isRivalDominant ? 'animate-[pulse_1s_ease-in-out_infinite]' : ''}
        />
      )}
      {/* Player influence ring */}
      {stage >= 1 && (
        <circle
          cx={staticData.x} cy={staticData.y}
          r={getStageSize(stage) + 1.5}
          fill="none"
          stroke="#4ECDC4"
          strokeWidth={0.3 + (playerScore / 200)}
          opacity={0.6}
        />
      )}
      {stage >= 4 && (
        <circle
          cx={staticData.x} cy={staticData.y}
          r={getStageSize(stage) + 2}
          fill={color}
          opacity="0.1"
          className="animate-[pulse_2s_ease-in-out_infinite]"
        />
      )}
      <circle
        cx={staticData.x} cy={staticData.y}
        r={isSelected ? getStageSize(stage) + 1.2 : getStageSize(stage)}
        fill={hasActiveEvent ? '#FF1744' : color}
        stroke={isSelected ? 'white' : 'black'}
        strokeWidth={isSelected ? '0.4' : '0.1'}
        className={`transition-all duration-300 ${hasActiveEvent ? 'animate-[pulse_0.7s_ease-in-out_infinite]' : ''}`}
        filter={isSelected || stage >= 4 ? 'drop-shadow(0 0 4px rgba(255,215,0,0.6))' : 'none'}
      />
      <text
        x={staticData.x} y={staticData.y - (stage >= 3 ? 5 : 4)}
        textAnchor="middle"
        className={`text-[3px] font-black uppercase tracking-[0.1em] ${isSelected ? 'fill-white' : 'fill-gray-400 opacity-80'}`}
        style={{ paintOrder: 'stroke', stroke: 'black', strokeWidth: '0.1px' }}
      >
        {id.toUpperCase()}
      </text>
      {/* Event warning icon */}
      {hasActiveEvent && (
        <text x={staticData.x + 2.5} y={staticData.y - 3} className="text-[4px] fill-yellow-300">⚠</text>
      )}
      {/* Rival % badge when significant */}
      {rival > 30 && !hasActiveEvent && (
        <text x={staticData.x + 2.5} y={staticData.y - 3} className="text-[2.5px] fill-red-400 font-black">R{Math.floor(rival)}%</text>
      )}
    </g>
  );
}

export function GlobalDominanceContent() {
  const [selectedCountryId, setSelectedCountryId] = useState('us');
  const [unlockingTargetCountryId, setUnlockingTargetCountryId] = useState<string | null>(null);
  const [exitSequence, setExitSequence] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [dominoToast, setDominoToast] = useState<{ msg: string; key: number } | null>(null);

  const income = useMetamanGame(s => s.income);
  const users = useMetamanGame(s => s.users);
  const orbsInventory = useMetamanGame(s => s.orbsInventory);
  const advanceCountryStage = useMetamanGame(s => s.advanceCountryStage);
  const buyBuilding = useMetamanGame(s => s.buyBuilding);
  const addVisualEffect = useMetamanGame(s => s.addVisualEffect);
  const playUpgrade = useAudio(s => s.playUpgrade);
  const allCountries = useMetamanGame(s => s.globalDominance.countries);
  const activeEvent = useMetamanGame(s => s.globalDominance.activeEvent);
  const tickDominanceSystem = useMetamanGame(s => s.tickDominanceSystem);
  const resolveDominanceEvent = useMetamanGame(s => s.resolveDominanceEvent);

  const countryState = allCountries[selectedCountryId];
  const staticData = COUNTRIES_DATA.find(c => c.id === selectedCountryId) || COUNTRIES_DATA[0];
  const formatNumber = useMetamanGame(s => s.formatNumber);

  const stage = countryState?.stage || 0;
  // Rival pressure affects upgrade cost
  const rivalMult = (countryState?.rivalInfluence || 0) > stage * 20 ? 1.4 : 1.0;
  // Domino: EU Stage 4+ makes Finland & UK 15% more expensive
  const dominoMult = (['fi', 'gb'].includes(selectedCountryId) && (allCountries['eu']?.stage || 0) >= 4) ? 1.15 : 1.0;
  const totalCostMult = rivalMult * dominoMult;
  const upgradeCost = Math.pow(10, stage + 3) * totalCostMult;
  const canAffordMoney = income >= upgradeCost;

  const unlockedCountries = Object.values(allCountries).filter(c => c.isUnlocked).length;
  const totalStages = Object.values(allCountries).reduce((acc, c) => acc + c.stage, 0);
  const integrationPercent = Math.min(100, Math.floor((totalStages / (13 * 5)) * 100));

  // ── 1x/s TICK: drives rival growth + event triggers ────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      tickDominanceSystem();
    }, 1000);
    return () => clearInterval(interval);
  }, [tickDominanceSystem]);

  // ── Event countdown ────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeEvent) { setTimeLeft(60); return; }
    const msLeft = activeEvent.expiresAt - Date.now();
    setTimeLeft(Math.max(0, Math.ceil(msLeft / 1000)));
    const interval = setInterval(() => {
      const left = Math.max(0, Math.ceil((activeEvent.expiresAt - Date.now()) / 1000));
      setTimeLeft(left);
    }, 1000);
    return () => clearInterval(interval);
  }, [activeEvent]);

  // ── Exit Is Impossible: auto-play text sequence ───────────────────────
  useEffect(() => {
    if (activeEvent?.id !== 'exit_impossible') return;
    const country = COUNTRIES_DATA.find(c => c.id === activeEvent.countryId);
    const name = country?.name || 'Unknown';
    const lines = [
      `${name} attempted to shut down Dan Corp infrastructure.`,
      `${country?.flag || '🌍'} Hospital system went offline.`,
      'Transport network unresponsive.',
      `${name} has restored Dan Corp infrastructure. Normal operations resumed.`,
      '"We didn\'t stop them. We just stopped helping. There\'s a difference."',
    ];
    setExitSequence([lines[0]]);
    const timers = lines.slice(1).map((line, i) =>
      setTimeout(() => {
        setExitSequence(prev => [...prev, line]);
        if (i === lines.length - 2) {
          // auto-close after last line shown
          setTimeout(() => {
            resolveDominanceEvent(0); // resolve with no effect (choices=[]), clear event
            setExitSequence([]);
          }, 5000);
        }
      }, (i + 1) * 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [activeEvent?.id]);

  // ── Domino toast: listen via addVisualEffect side-effects ─────────────────
  // We piggyback on the advanceCountryStage visual effects already emitted.
  // Additionally we watch stage transitions to show local toasts on the map.
  const prevStagesRef = React.useRef<Record<string, number>>({});
  useEffect(() => {
    const prev = prevStagesRef.current;
    let toastMsg: string | null = null;

    Object.entries(allCountries).forEach(([id, c]) => {
      const prevStage = prev[id] ?? c.stage; // initialise silently first time
      if (c.stage > prevStage) {
        // Domino notifications
        if (id === 'eu' && c.stage === 4) toastMsg = '🇪🇺 EU → Finland & UK: costs +15%';
        if (id === 'us' && c.stage === 5) toastMsg = '🇺🇸 Dollar Diplomacy: Global South unlocked';
        if (id === 'cn' && c.stage === 3) toastMsg = '🇨🇳 Mutual Arrangement: Data Flow +25%';
        if (id === 'fi' && c.stage === 3) toastMsg = '🇫🇮 Finnish Resistance spreading to neighbors';
      }
      prev[id] = c.stage;
    });

    if (toastMsg) {
      setDominoToast({ msg: toastMsg, key: Date.now() });
      const t = setTimeout(() => setDominoToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [allCountries]);

  const activeEventDef = activeEvent ? getEventById(activeEvent.id) : null;

  const renderBuilding = (id: string, name: string, icon: any, desc: string, unlockStage: number) => {
    const level = countryState?.buildings[id] || 0;
    const isLocked = stage < unlockStage;
    const config = BUILDINGS_CONFIG[id];
    if (!config) return null;

    const cost = Math.floor(config.baseCost * Math.pow(1.5, level));
    const orbCost = config.orbCost ? Math.floor(config.orbCost * Math.pow(1.5, level)) : 0;
    const canAfford = income >= cost && orbsInventory >= orbCost;

    if (isLocked) {
      return (
        <div key={id} className="bg-black/60 border-2 border-black/40 rounded-xl p-2 flex flex-col items-center opacity-30 h-full">
          <Lock className="w-4 h-4 text-gray-700 mb-1" />
          <span className="text-[8px] font-black uppercase text-gray-700 text-center leading-none">{name}</span>
        </div>
      );
    }

    return (
      <div key={id} className={`bg-[#1a1f2e] border-[3px] border-black rounded-xl p-2 flex flex-col items-center shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 h-full ${level >= 5 ? 'border-[#FFD700]' : ''}`}>
        <div className="text-[#FFD700] mb-1">{icon}</div>
        <span className="text-[9px] font-black uppercase text-gray-400 text-center mb-0.5 leading-none">{name}</span>
        <div className="text-[10px] text-green-400 font-bold mb-1.5 text-center leading-none">{desc}</div>
        
        <div className="w-full mt-auto">
          <button 
            onClick={() => {
              if (canAfford) {
                if (id === 'free_tools') setUnlockingTargetCountryId(selectedCountryId);
                else { buyBuilding(selectedCountryId, id); playUpgrade(); addVisualEffect('purchase', window.innerWidth/2, window.innerHeight/2, 'low', `Built ${name}`); }
              }
            }}
            disabled={!canAfford || level >= 5}
            className={`w-full py-1.5 rounded-lg border-2 border-black font-black text-[9px] uppercase transition-all shadow-[2px_2px_0_0_black] active:shadow-none active:translate-y-0.5 ${
              canAfford && level < 5 ? 'bg-[#FFD700] text-black' : 'bg-black/60 text-gray-500'
            }`}
          >
            {level >= 5 ? 'MAX' : !canAfford ? (income < cost ? `$${Math.floor(cost/1000)}K` : 'ORBS') : `$${Math.floor(cost/1000)}K`}
          </button>
        </div>
      </div>
    );
  };

  const handleInvest = () => {
    if (income >= upgradeCost && stage < 5) {
      advanceCountryStage(selectedCountryId);
      playUpgrade();
      addVisualEffect('purchase', window.innerWidth / 2, window.innerHeight / 2, 'low', `STAGE ${stage + 1} REACHED`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b0e14] text-white font-sans overflow-hidden relative border-t-2 border-black">
       
       {/* 1. TOP SECTION (40%) - THE MAP */}
       <div className="flex-shrink-0 h-[40%] min-h-[140px] bg-[#0d1117] border-b-[3px] border-black overflow-hidden relative shadow-[inset_0_0_40px_black] group">
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[repeating-linear-gradient(0deg,_white_0px,_white_1px,_transparent_1px,_transparent_2px)]"></div>
          
          <svg viewBox="0 0 100 100" className="w-full h-full p-4 pointer-events-auto">
             {Object.entries(allCountries).map(([id, state]) => (
                <DataLink key={`link-${id}`} id={id} stage={state.stage} />
             ))}

             <g>
                <circle cx="50" cy="50" r="4.5" fill="none" stroke="#FFD700" strokeWidth="0.05" opacity="0.1" className="animate-[ping_4s_linear_infinite]" />
                <circle cx="50" cy="50" r="2.5" fill="none" stroke="#FFD700" strokeWidth="0.1" opacity="0.3" className="animate-[pulse_3s_ease-in-out_infinite]" />
                <path d="M 48 48 L 52 48 L 52 52 L 48 52 Z" fill="#FFD700" filter="drop-shadow(0 0 2px #FFD700)" />
                <circle cx="50" cy="50" r="0.6" fill="black" />
                <motion.rect
                  x="46" y="46" width="8" height="8" fill="none" stroke="#FFD700" strokeWidth="0.05" opacity="0.4"
                  animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  style={{ originX: "50px", originY: "50px" }}
                />
                <text x="50" y="55" textAnchor="middle" className="text-[2px] font-black uppercase tracking-[0.2em] fill-[#FFD700] italic opacity-80">
                   Dan's HQ
                </text>
             </g>

             {COUNTRIES_DATA.map(c => (
               <MapNode
                 key={c.id}
                 id={c.id}
                 isSelected={selectedCountryId === c.id}
                 onClick={setSelectedCountryId}
                 hasActiveEvent={activeEvent?.countryId === c.id}
               />
             ))}
          </svg>

          {/* HUD OVERLAY */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none origin-top-left scale-[0.75]">
             <div className="flex gap-1.5 mb-1">

          {/* ── Domino Toast ─────────────────────────────────────────────── */}
          <AnimatePresence>
            {dominoToast && (
              <motion.div
                key={dominoToast.key}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-2 left-1/2 -translate-x-1/2 z-[150] bg-black/90 border border-[#FFD700]/60 rounded-lg px-3 py-1.5 text-[9px] font-black text-[#FFD700] uppercase tracking-wide shadow-lg whitespace-nowrap"
              >
                {dominoToast.msg}
              </motion.div>
            )}
          </AnimatePresence>
                <div className="bg-[#FFD700] px-2 py-0.5 rounded-lg border-2 border-black text-black font-black text-[12px] shadow-[2px_2px_0_0_black]">$ {Math.floor(income / 1000)}K</div>
                <div className="bg-[#FF6B35] px-2 py-0.5 rounded-lg border-2 border-black text-white font-black text-[12px] shadow-[2px_2px_0_0_black] flex items-center gap-1"><Zap className="w-3 h-3" /> {Math.floor(orbsInventory)}</div>
             </div>
             
             <div className="bg-black/80 px-2 py-1.5 rounded-xl border-2 border-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                   <Target className="w-3 h-3 text-[#FFD700] animate-pulse" />
                   <span className="text-[10px] font-black uppercase text-[#FFD700] tracking-widest italic">Global Reach: {unlockedCountries}/13</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden w-24">
                   <motion.div className="h-full bg-[#FFD700]" initial={{ width: 0 }} animate={{ width: `${integrationPercent}%` }} />
                </div>
                <div className="mt-1 text-[8px] font-black text-white/40 uppercase tracking-tighter">
                   {integrationPercent}% Integrated &mdash; {integrationPercent >= 100 ? "NO OUTSIDE" : "INTEGRATING..."}
                </div>
             </div>
          </div>

          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[7px] font-black uppercase tracking-widest text-[#FFD700] opacity-30 italic">
             <Activity className="w-2.5 h-2.5" /> SAT_ACTIVE
          </div>
       </div>

       {/* 2. BOTTOM SECTION (60%) - DASHBOARD */}
       <div className="flex-1 min-h-0 flex flex-col bg-[#0b0e14] relative">
          
          {/* A. UNIFIED CONTROL BAR */}
          <div className="flex-shrink-0 bg-black/40 border-b-[3px] border-black p-3 flex items-center justify-between gap-3">
             <div className="flex items-center gap-3">
                <span className="text-3xl filter drop-shadow(0 0 8px rgba(255,215,0,0.3))">{staticData.flag}</span>
                <div className="flex flex-col">
                   <h2 className="text-lg font-black uppercase tracking-tight leading-none mb-1 flex items-center gap-2">
                       {staticData.name} {stage >= 4 && <Trophy className="w-3 h-3 text-[#FFD700]" />}
                   </h2>
                   <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`h-1.5 w-5 rounded-full border border-black transition-all duration-300 ${i <= stage ? 'bg-[#FFD700] shadow-[0_0_8px_rgba(255,215,0,0.5)]' : 'bg-black/40'}`} />
                      ))}
                      <span className="text-[7px] font-black uppercase italic ml-1 text-[#FFD700] leading-none opacity-80">{STAGE_NAMES[stage]}</span>
                   </div>
                   {/* Rival vs Dan influence mini-bars */}
                   {countryState && (
                     <div className="flex items-center gap-1.5 mt-1">
                       <div className="flex flex-col gap-0.5">
                         <div className="flex items-center gap-1">
                           <div className="w-12 h-1 bg-black/40 rounded-full overflow-hidden">
                             <div className="h-full bg-[#4ECDC4] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (countryState.stage / 5) * 100)}%` }} />
                           </div>
                           <span className="text-[6px] text-[#4ECDC4] font-black">DAN {countryState.stage * 20}%</span>
                         </div>
                         <div className="flex items-center gap-1">
                           <div className="w-12 h-1 bg-black/40 rounded-full overflow-hidden">
                             <div className="h-full bg-[#FF1744] rounded-full transition-all duration-500" style={{ width: `${Math.min(100, countryState.rivalInfluence || 0)}%` }} />
                           </div>
                           <span className="text-[6px] text-[#FF1744] font-black">RIVAL {Math.floor(countryState.rivalInfluence || 0)}%</span>
                         </div>
                       </div>
                     </div>
                   )}
                </div>
             </div>

             <button 
               onClick={handleInvest} disabled={!canAffordMoney || stage >= 5}
               className={`px-3 py-1.5 rounded-lg border-[3px] border-black font-black uppercase text-[10px] shadow-[3px_3px_0_0_black] active:translate-y-0.5 active:shadow-none transition-all flex flex-col items-center shrink-0 ${canAffordMoney ? 'bg-[#FF1744] text-white' : 'bg-zinc-800 text-gray-600 opacity-40'}`}
             >
               <span>Invest</span>
               <span className="text-[7px] font-mono opacity-60">
                 $ {Math.floor(upgradeCost / 1000)}K
                 {rivalMult > 1 && <span className="text-red-300 ml-0.5">×1.4</span>}
                 {dominoMult > 1 && <span className="text-orange-300 ml-0.5">+EU</span>}
               </span>
             </button>
          </div>

          {/* B. INFRASTRUCTURE GRID (High Density) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-3 pb-48 touch-pan-y scrollbar-thin scrollbar-thumb-[#FFD700]/20 scrollable">
             <div className="flex items-center gap-2 mb-1 opacity-40">
                <div className="h-[1px] flex-1 bg-[#FFD700]" />
                <span className="text-[8px] font-black tracking-[0.2em] uppercase">Infrastructure</span>
                <div className="h-[1px] flex-1 bg-[#FFD700]" />
             </div>

             <div className="grid grid-cols-3 gap-2">
                {renderBuilding('free_tools', 'Free Tools', <Laptop className="w-3 h-3" />, 'Expansion', 1)}
                {renderBuilding('data_center', 'Data Center', <Server className="w-3 h-3" />, '+10 zaps/s', 2)}
                {renderBuilding('ai_factory', 'AI Factory', <Factory className="w-3 h-3" />, '+100 users/s', 2)}
                {renderBuilding('ethics_theater', 'Ethics', <Theater className="w-3 h-3" />, '-10% heat', 3)}
                {selectedCountryId === 'us' && renderBuilding('lobby_office', 'Lobby', <Briefcase className="w-3 h-3" />, '-0.5 h/s', 3)}
                {selectedCountryId === 'eu' && renderBuilding('gdpr_laundry', 'Laundry', <Shield className="w-3 h-3" />, '+5% Imm.', 3)}
                {selectedCountryId === 'fi' && renderBuilding('sauna_algorithm', 'Sauna', <Zap className="w-3 h-3" />, '+25% users', 3)}
             </div>

             <div className="bg-black/40 p-3 rounded-xl border border-white/5 opacity-80 text-[8px] leading-tight flex gap-2 items-start shadow-inner">
                <Info className="w-3 h-3 text-[#FFD700] shrink-0 mt-0.5" />
                <p className="italic">&ldquo;{staticData.narrative}&rdquo;</p>
             </div>
          </div>
       </div>

       {/* 3. COUNTRY NAVIGATOR (STICKY OVER THE BOTTOM) */}
       <div className="absolute bottom-6 left-0 right-0 px-3 z-[110] pointer-events-none pb-[env(safe-area-inset-bottom,1rem)] h-16">
          <div className="flex gap-2 p-1.5 bg-black/90 backdrop-blur-md border-[3px] border-black rounded-xl overflow-x-auto no-scrollbar pointer-events-auto shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            {COUNTRIES_DATA.map(c => {
               const countryS = allCountries[c.id];
               if (!countryS?.isUnlocked) return null;
               const nodeStage = countryS.stage;
               const rival = countryS.rivalInfluence || 0;
               const isUnderPressure = rival > 40;
               return (
                 <button
                   key={`ball-${c.id}`} onClick={() => setSelectedCountryId(c.id)}
                   className={`flex-shrink-0 w-10 h-10 rounded-lg border-2 transition-all flex items-center justify-center relative ${selectedCountryId === c.id ? 'bg-zinc-800 border-[#FFD700] scale-110' : isUnderPressure ? 'bg-black/60 border-[#FF1744]/60' : 'bg-black/60 border-black/40'}`}
                 >
                    <span className={`text-lg filter ${selectedCountryId === c.id ? '' : 'grayscale opacity-60'}`}>{c.flag}</span>
                    <div className="absolute -top-1 -right-1 bg-[#FFD700] text-black text-[6px] font-black px-1 rounded-full border border-black">{nodeStage}</div>
                    {/* Rival warning dot */}
                    {isUnderPressure && (
                      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-[#FF1744] rounded-full border border-black animate-pulse" />
                    )}
                 </button>
               );
            })}
          </div>
       </div>

       {/* Market Selection Overlay */}
       {unlockingTargetCountryId && (
        <div className="absolute inset-0 z-[200] bg-black/98 flex items-center justify-center p-6 backdrop-blur-xl">
           <div className="bg-[#0b0e14] border-[8px] border-[#FFD700] rounded-[2.5rem] p-6 w-full max-sm shadow-[0_0_100px_rgba(255,215,0,0.4)] relative">
              <h3 className="text-2xl font-black uppercase text-[#FFD700] mb-2 italic underline decoration-4 underline-offset-4">Expansion</h3>
              <div className="space-y-2 mt-4">
                {(NEIGHBOR_MAP[unlockingTargetCountryId] || []).filter(nid => !allCountries[nid]?.isUnlocked).map(nid => {
                   const nData = COUNTRIES_DATA.find(c => c.id === nid);
                   return (
                     <button key={`ex-${nid}`} onClick={() => { buyBuilding(selectedCountryId, 'free_tools'); useMetamanGame.getState().unlockCountry(nid); setUnlockingTargetCountryId(null); }}
                       className="w-full bg-black/60 border-[3px] border-black hover:border-[#FFD700] p-4 rounded-xl flex items-center gap-4 transition-all group"
                     >
                        <span className="text-3xl">{nData?.flag}</span>
                        <div className="font-black text-[12px] uppercase group-hover:text-[#FFD700]">{nData?.name}</div>
                        <ChevronRight className="ml-auto w-5 h-5 text-white/20 group-hover:text-[#FFD700]" />
                     </button>
                   );
                })}
              </div>
              <button onClick={() => setUnlockingTargetCountryId(null)} className="mt-8 w-full text-[8px] font-black text-white/20 uppercase">Abort</button>
           </div>
        </div>
       )}

       {/* ── RESISTANCE EVENT MODAL ─────────────────────────────────────────── */}
       <AnimatePresence>
         {activeEvent && activeEventDef && activeEvent.id !== 'exit_impossible' && (
           <motion.div
             key="event-modal"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 20 }}
             className="absolute bottom-20 left-3 right-3 z-[250] bg-[#0b0e14] border-[3px] border-[#FF1744] rounded-2xl shadow-[0_0_40px_rgba(255,23,68,0.4)] overflow-hidden"
           >
             {/* Countdown bar */}
             <div className="h-1 bg-black/40">
               <div
                 className="h-full bg-[#FF1744] transition-all duration-1000"
                 style={{ width: `${(timeLeft / 60) * 100}%`, opacity: timeLeft < 15 ? 0.5 + Math.sin(Date.now()) : 1 }}
               />
             </div>
             <div className="p-3">
               <div className="flex items-center gap-2 mb-1.5">
                 <AlertTriangle className="w-4 h-4 text-[#FF1744] shrink-0" />
                 <div className="text-[11px] font-black uppercase text-[#FF1744] tracking-wider flex-1">{activeEventDef.title}</div>
                 <span className="text-[9px] font-mono text-white/30">{timeLeft}s</span>
               </div>
               <p className="text-[9px] leading-relaxed text-white/70 italic mb-3">&ldquo;{activeEventDef.description}&rdquo;</p>
               <div className="flex flex-col gap-1.5">
                 {activeEventDef.choices.map((choice, i) => (
                   <button
                     key={i}
                     onClick={() => { resolveDominanceEvent(i); playUpgrade(); }}
                     className="w-full text-left px-3 py-2 rounded-lg border-2 border-black/60 hover:border-[#FFD700] bg-white/5 hover:bg-white/10 transition-all group"
                   >
                     <div className="text-[10px] font-black uppercase text-white group-hover:text-[#FFD700]">[{choice.label}]</div>
                     <div className="text-[8px] text-white/40 mt-0.5">{choice.description}</div>
                   </button>
                 ))}
               </div>
             </div>
           </motion.div>
         )}
       </AnimatePresence>

       {/* ── EXIT IS IMPOSSIBLE CUTSCENE ────────────────────────────────────── */}
       <AnimatePresence>
         {activeEvent?.id === 'exit_impossible' && exitSequence.length > 0 && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="absolute inset-0 z-[300] bg-black/95 flex flex-col items-center justify-center p-8 gap-4"
           >
             <div className="space-y-3 max-w-xs text-center">
               {exitSequence.map((line, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, y: 8 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ duration: 0.5 }}
                   className={`text-[11px] leading-relaxed ${
                     i === exitSequence.length - 1 && line.startsWith('"')
                       ? 'text-[#FFD700] italic font-black text-[13px]'
                       : 'text-white/70'
                   }`}
                 >
                   {line}
                 </motion.div>
               ))}
             </div>
           </motion.div>
         )}
       </AnimatePresence>

       <style dangerouslySetInnerHTML={{ __html: `
         .comic-text-stroke { -webkit-text-stroke: 1px black; }
         @keyframes flow-move { to { stroke-dashoffset: -10; } }
         .data-link-flow { animation: flow-move var(--flow-speed, 3s) linear infinite; }
       `}} />
    </div>
  );
}
