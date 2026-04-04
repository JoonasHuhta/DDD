import React, { useState } from 'react';
import { X, Globe, Lock, Shield, Server, Factory, Theater, Briefcase, Info, TrendingUp, Laptop, Moon, Zap, Cloud, Ghost } from 'lucide-react';
import { useMetamanGame, BUILDINGS_CONFIG, NEIGHBOR_MAP } from '../lib/stores/useMetamanGame';

interface CountryStaticData {
  id: string;
  name: string;
  flag: string;
  x: number;
  y: number;
  narrative: string;
}

const COUNTRIES_DATA: CountryStaticData[] = [
  { id: 'us', name: 'USA', flag: '🇺🇸', x: 20, y: 35, narrative: '"The ministry of justice uses our Fair-Verdict AI to process cases. It has a built-in bias towards Dan Corp. We call it Contextual Awareness."' },
  { id: 'eu', name: 'EU', flag: '🇪🇺', x: 45, y: 30, narrative: '"Their public transport now runs on Dan-Cloud. When we had a 15-minute outage, three countries filed emergency motions. We called it a learning opportunity."' },
  { id: 'fi', name: 'Finland', flag: '🇫🇮', x: 52, y: 15, narrative: '"They accepted our free AI tools for public schools. The education minister said it was a pragmatic decision. We quoted him in our press release."' },
  { id: 'cn', name: 'China', flag: '🇨🇳', x: 80, y: 40, narrative: '"The arrangement is mutual. They get the tools, we get the training data. Or is it the other way around? No one asks."' },
  { id: 'gb', name: 'UK', flag: '🇬🇧', x: 40, y: 25, narrative: '"They don\'t know we exist yet. Which is exactly how we wanted it to be for the first six months."' },
  { id: 'br', name: 'Brazil', flag: '🇧🇷', x: 30, y: 70, narrative: '"Massive population, zero regulation. A digital gold mine waiting for the first free app to drop."' },
  { id: 'in', name: 'India', flag: '🇮🇳', x: 65, y: 60, narrative: '"A billion users waiting to be processed. We just need to find the right local partner to bribe."' },
  { id: 'ru', name: 'Russia', flag: '🇷🇺', x: 70, y: 25, narrative: '"High income, zero accountability. Perfect for our higher-risk behavioral models."' },
  { id: 'id', name: 'Indonesia', flag: '🇮🇩', x: 85, y: 75, narrative: '"Fastest growing social market. They don\'t remember a time before 4G, and soon, they won\'t remember life before Dan."' },
  { id: 'ng', name: 'Nigeria', flag: '🇳🇬', x: 50, y: 65, narrative: '"The tech hub of Africa. We\'ll start by offering free bandwidth, and then we\'ll own the infrastructure."' },
  { id: 'sa', name: 'Saudi Arabia', flag: '🇸🇦', x: 58, y: 50, narrative: '"Oil money + Big Data. A match made in heaven. Or at least in our servers."' },
  { id: 'jp', name: 'Japan', flag: '🇯🇵', x: 88, y: 35, narrative: '"Digital-first culture. They already live half their lives on screens. We just need to be the only screen that matters."' },
  { id: 'gs', name: 'Global South', flag: '🌍', x: 50, y: 85, narrative: '"Connectivity is a human right. And we are the only ones providing it. Terms apply."' },
  { id: 'lun', name: 'Lunar Base', flag: '🌙', x: 92, y: 15, narrative: '"No jurisdiction up here. We checked. Perfect for long-term storage of... sensitive... data points."' },
  { id: 'sec', name: 'Sector 7', flag: '🛸', x: 10, y: 85, narrative: '"ERROR: Connection terminated. [REDACTED]. They are watching us back."' },
];

const STAGE_NAMES = [
  'Untouched',
  'Interested',
  'Dependent',
  'Captured',
  'Integrated',
  'Ascended'
];

const getStageColor = (stage: number) => {
  switch (stage) {
    case 0: return '#374151'; // Gray
    case 1: return '#4ECDC4'; // Cyan (Initial Interest)
    case 2: return '#45b7af'; // Muted Cyan
    case 3: return '#FFD700'; // Dan Yellow (Captured)
    case 4: return '#ffeb3b'; // Vibrant Gold
    case 5: return '#ffffff'; // White Glow (Ascended)
    default: return '#374151';
  }
};

const getStageSize = (stage: number) => {
  return 1.5 + (stage * 0.3); // 1.5 to 3.0
};

// Sub-component for individual country nodes to optimize re-renders
function MapNode({ id, isSelected, onClick }: { id: string; isSelected: boolean; onClick: (id: string) => void }) {
  const countryState = useMetamanGame(s => s.globalDominance.countries[id]);
  const income = useMetamanGame(s => s.income);
  const staticData = COUNTRIES_DATA.find(c => c.id === id)!;
  
  if (!countryState?.isUnlocked) return null;

  const stage = countryState.stage;
  const upgradeCost = Math.pow(10, stage + 3);
  const canAfford = income >= upgradeCost && stage < 5;

  return (
    <g 
      className={`cursor-pointer transition-all duration-500 ${isSelected ? 'filter drop-shadow(0 0 4px rgba(255,215,0,0.5))' : ''}`} 
      onClick={() => onClick(id)}
    >
      {/* Background Glow */}
      {stage >= 3 && (
        <circle 
          cx={staticData.x} cy={staticData.y} 
          r={getStageSize(stage) + 1.5} 
          fill={getStageColor(stage)} 
          className="animate-pulse opacity-20"
        />
      )}

      {/* Affordance Pulse (Only if not selected and can afford) */}
      {canAfford && !isSelected && (
        <circle 
          cx={staticData.x} cy={staticData.y} 
          r={getStageSize(stage) + 3} 
          className="animate-ping stroke-[#FFD700] fill-none"
          strokeWidth="0.5"
          opacity="0.3"
        />
      )}

      <circle 
        cx={staticData.x} cy={staticData.y} 
        r={isSelected ? getStageSize(stage) + 1 : getStageSize(stage)} 
        fill={getStageColor(stage)} 
        className={`${stage === 1 ? 'animate-pulse' : ''} transition-all duration-500`}
        stroke={isSelected ? '#white' : 'rgba(0,0,0,0.5)'}
        strokeWidth={isSelected ? '0.5' : '0.2'}
      />
      
      <text 
        x={staticData.x} y={staticData.y - 5} 
        textAnchor="middle" 
        className={`text-[3.5px] font-black uppercase transition-colors duration-500 ${isSelected ? 'fill-white' : 'fill-gray-500'}`}
      >
        {id.toUpperCase()}
      </text>
    </g>
  );
}

// Sub-component for connection lines
function MapConnection({ id }: { id: string }) {
  const stage = useMetamanGame(s => s.globalDominance.countries[id]?.stage || 0);
  const staticData = COUNTRIES_DATA.find(c => c.id === id)!;
  
  if (stage < 2) return null;

  return (
    <g>
      <line
        x1="50" y1="50"
        x2={staticData.x} y2={staticData.y}
        stroke={getStageColor(stage)}
        strokeWidth={stage >= 4 ? "0.8" : "0.4"}
        strokeDasharray="2 2"
        className={stage >= 3 ? 'animate-flow' : ''}
        opacity={stage === 2 ? 0.2 : 0.5}
      />
      {/* Moving "Data Packets" for high stages */}
      {stage >= 3 && (
        <circle r="0.8" fill={getStageColor(stage)}>
          <animateMotion 
            dur={`${4 - Math.min(2, stage - 3)}s`} 
            repeatCount="indefinite"
            path={`M ${staticData.x} ${staticData.y} L 50 50`}
          />
        </circle>
      )}
    </g>
  );
}

interface GlobalDominancePanelProps {
  onClose: () => void;
}

export default function GlobalDominancePanel({ onClose }: GlobalDominancePanelProps) {
  const [selectedCountryId, setSelectedCountryId] = useState('us');
  const [unlockingTargetCountryId, setUnlockingTargetCountryId] = useState<string | null>(null);
  
  const income = useMetamanGame(s => s.income);
  const users = useMetamanGame(s => s.users);
  const orbsInventory = useMetamanGame(s => s.orbsInventory);
    const advanceCountryStage = useMetamanGame(s => s.advanceCountryStage);
    const buyBuilding = useMetamanGame(s => s.buyBuilding);
    const unlockCountry = useMetamanGame(s => s.unlockCountry);
    const addVisualEffect = useMetamanGame(s => s.addVisualEffect);
    const allCountries = useMetamanGame(s => s.globalDominance.countries);
    const countryState = allCountries[selectedCountryId];
    const staticData = COUNTRIES_DATA.find(c => c.id === selectedCountryId) || COUNTRIES_DATA[0];

    const neighborMap = NEIGHBOR_MAP;

  const handleSelectCountry = (id: string) => {
    setSelectedCountryId(id);
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const handleInvest = () => {
    const stage = countryState?.stage || 0;
    // RUSSIA CAP: Stuck at Stage 3
    if (selectedCountryId === 'ru' && stage >= 3) {
      addVisualEffect('achievement', window.innerWidth / 2, window.innerHeight / 2, 'medium', "Resistance Constant: Region cannot be integrated.");
      return;
    }
    
    const upgradeCost = Math.pow(10, stage + 3);
    
    if (income >= upgradeCost && stage < 5) {
      if ('vibrate' in navigator) navigator.vibrate([20, 10, 20]);
      advanceCountryStage(selectedCountryId);
      addVisualEffect('purchase', window.innerWidth / 2, window.innerHeight / 2, 'medium', `Invested $${Math.floor(upgradeCost/1000)}K`);
    }
  };

  const renderBuilding = (id: string, name: string, icon: any, desc: string, unlockStage: number) => {
    const level = countryState?.buildings[id] || 0;
    const isLocked = (countryState?.stage || 0) < unlockStage;
    
    const config = BUILDINGS_CONFIG[id];
    if (!config) return null;

    const cost = Math.floor(config.baseCost * Math.pow(1.5, level));
    const orbCost = config.orbCost ? Math.floor(config.orbCost * Math.pow(1.5, level)) : 0;
    
    const canAffordMoney = income >= cost;
    const canAffordOrbs = orbsInventory >= orbCost;
    const canAfford = canAffordMoney && canAffordOrbs;

    if (isLocked) {
      return (
        <div className="bg-black/40 border-4 border-black rounded-2xl p-3 flex flex-col items-center opacity-30">
          <Lock className="w-5 h-5 text-gray-600 mb-1" />
          <span className="text-[8px] font-black uppercase text-gray-600 truncate w-full text-center">{name}</span>
          <span className="text-[10px] font-black text-gray-600">Stage {unlockStage}</span>
        </div>
      );
    }

    return (
      <div className={`bg-[#1a1f2e] border-4 border-black rounded-2xl p-3 flex flex-col items-center shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-transform hover:-translate-y-1 ${level >= 5 ? 'border-[#FFD700]' : ''}`}>
        <div className="text-[#FFD700] mb-1">{icon}</div>
        <span className="text-[8px] font-black uppercase text-gray-400 truncate w-full text-center">{name}</span>
        <span className="text-[10px] font-black text-[#FFD700]">Lvl {level}</span>
        <div className="text-[7px] text-green-400 font-bold mb-1">{desc}</div>
        
        {level < 5 ? (
          <div className="w-full">
            {orbCost > 0 && (
              <div className={`text-[7px] font-bold text-center mb-1 ${canAffordOrbs ? 'text-cyan-400' : 'text-red-500 animate-pulse'}`}>
                {orbCost} ORBS
              </div>
            )}
            <button 
              onClick={() => {
                if (canAfford) {
                  if ('vibrate' in navigator) navigator.vibrate(10);
                  if (id === 'free_tools') {
                    // Start expansion flow
                    setUnlockingTargetCountryId(selectedCountryId);
                  } else {
                    buyBuilding(selectedCountryId, id);
                    addVisualEffect('purchase', window.innerWidth / 2, window.innerHeight / 2, 'low', `Built ${name}`);
                  }
                }
              }}
              disabled={!canAfford}
              className={`w-full py-1.5 rounded-md border-2 border-black font-black text-[8px] uppercase transition-all flex flex-col items-center justify-center ${
                canAfford 
                  ? 'bg-[#FFD700] text-black shadow-[2px_2px_0_0_black] active:translate-y-0.5 active:shadow-none' 
                  : 'bg-zinc-800 text-gray-500 opacity-50'
              }`}
            >
              {!canAffordMoney ? `NEED $${Math.floor(cost/1000)}K` : !canAffordOrbs ? 'NEED ORBS' : `$${Math.floor(cost/1000)}K`}
            </button>
          </div>
        ) : (
          <div className="text-[8px] font-bold text-[#FFD700] uppercase tracking-tighter mt-2">MAXED</div>
        )}
      </div>
    );
  };

  const renderGrid = () => {
    return (
      <div className="grid grid-cols-3 gap-2 mt-4 pb-4">
        {renderBuilding('free_tools', 'Free Tools', <Laptop className="w-5 h-5" />, 'Unlock Neighbor', 1)}
        {renderBuilding('data_center', 'Data Center', <Server className="w-5 h-5" />, '+10 orbs/s', 2)}
        {renderBuilding('ai_factory', 'AI Factory', <Factory className="w-5 h-5" />, '+100 users/s', 2)}
        {renderBuilding('ethics_theater', 'Ethics Theater', <Theater className="w-5 h-5" />, '-10% heat growth', 3)}
        {selectedCountryId === 'us' && renderBuilding('lobby_office', 'Lobby Office', <Briefcase className="w-5 h-5" />, '-0.5 heat/s', 3)}
        {selectedCountryId === 'eu' && renderBuilding('gdpr_laundry', 'GDPR Laundry', <Shield className="w-5 h-5" />, '+5% Immunity', 3)}
        {selectedCountryId === 'fi' && renderBuilding('sauna_algorithm', 'Sauna Algorithm', <Zap className="w-5 h-5" />, '+25% FI Users', 3)}
        {selectedCountryId === 'cn' && renderBuilding('mutual_arrangement', 'Mutual HQ', <Cloud className="w-5 h-5" />, 'x2 Data / +Risk', 3)}
        {selectedCountryId === 'br' && renderBuilding('amazon_hub', 'Amazon Hub', <TrendingUp className="w-5 h-5" />, '+15% Multi', 3)}
        {selectedCountryId === 'lun' && renderBuilding('orbital_relay', 'Orbital Relay', <Moon className="w-5 h-5" />, 'Global +20%', 1)}
        {selectedCountryId === 'sec' && renderBuilding('void_node', 'Void Node', <Ghost className="w-5 h-5" />, 'Massive Feed', 1)}
      </div>
    );
  };

  const totalCaptured = useMetamanGame(s => 
    Object.values(s.globalDominance.countries).filter(c => c.stage >= 3).length
  );

  const upgradeCost = Math.pow(10, (countryState?.stage || 0) + 3);
  const canAfford = income >= upgradeCost;

  return (
    <div 
      onClick={(e) => e.stopPropagation()}
      className="fixed inset-0 z-[200] bg-[#0b0e14] flex flex-col text-white font-sans overflow-hidden border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
    >
      {/* Decorative scanlines overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 bg-[repeating-linear-gradient(0deg,_black_0px,_black_1px,_transparent_1px,_transparent_2px)]"></div>

      {/* Header HUD */}
      <div className="flex items-center justify-between p-4 bg-black/60 border-b-4 border-black relative z-[60]">
        <div className="flex gap-2">
          <div className="bg-[#FFD700] px-3 py-1 rounded-xl border-4 border-black text-black font-black text-xs flex items-center gap-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <span>$</span> {Math.floor(income / 1000)}K
          </div>
          <div className="bg-[#4ECDC4] px-3 py-1 rounded-xl border-4 border-black text-white font-black text-xs flex items-center gap-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <Globe className="w-3 h-3" /> {Math.floor(users)}
          </div>
          <div className="bg-[#FF6B35] px-3 py-1 rounded-xl border-4 border-black text-white font-black text-xs flex items-center gap-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
            <Globe className="w-3 h-3" /> {totalCaptured}/15
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors border-2 border-transparent hover:border-white/20">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Status Bar / Meta Data - Use flex-wrap for mobile safety */}
      <div className="px-4 py-2 flex flex-wrap justify-between items-center text-[8px] sm:text-[9px] font-mono font-black uppercase text-gray-500 tracking-widest bg-black/20 border-b-2 border-black/10">
        <div className="flex items-center gap-2">
          <span className="animate-pulse text-green-500">●</span> <span className="hidden sm:inline">DATA_STREAM:</span> ENCRYPTED
        </div>
        <div className="flex gap-2 sm:gap-4">
          <span>LAT: {staticData.x.toFixed(2)}° N</span>
          <span>LON: {staticData.y.toFixed(2)}° E</span>
        </div>
      </div>

      <div className="px-4 pt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD700]/60">
        Dan Corp — Global Asset Management
      </div>

      {/* SVG Map Section (40%) */}
      <div className="h-[35%] relative bg-[#0d1117] border-y-4 border-black overflow-hidden select-none">
        {/* Radar Background Effect */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <div className="w-[10%] h-[10%] border border-[#FFD700] rounded-full animate-ping opacity-20"></div>
          <div className="absolute w-[80%] h-[1px] bg-[#FFD700] opacity-5 animate-[radar-sweep_4s_linear_infinite]"></div>
          <div className="absolute h-[80%] w-[1px] bg-[#FFD700] opacity-5 animate-[radar-sweep_6s_linear_infinite_reverse]"></div>
        </div>

        <svg viewBox="0 0 100 100" className="w-full h-full relative z-10">
          {/* Connection Lines (Stage 2+) */}
          {COUNTRIES_DATA.map(c => (
            <MapConnection key={`line-${c.id}`} id={c.id} />
          ))}

          {/* HQ Center */}
          <circle cx="50" cy="50" r="3" fill="#FFD700" className="animate-glow" />
          <text x="50" y="56" textAnchor="middle" className="text-[3px] font-black fill-[#FFD700] opacity-80 uppercase">DAN CORP HQ</text>

          {/* Country Dots */}
          {COUNTRIES_DATA.map(c => (
            <MapNode 
              key={c.id} 
              id={c.id} 
              isSelected={selectedCountryId === c.id} 
              onClick={handleSelectCountry} 
            />
          ))}
        </svg>

         <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flow {
            to { stroke-dashoffset: -4; }
          }
          .animate-flow {
            animation: flow 2s linear infinite;
          }
          @keyframes glow {
            0%, 100% { filter: drop-shadow(0 0 2px #FFD700) brightness(1); }
            50% { filter: drop-shadow(0 0 8px #FFD700) brightness(1.5); }
          }
          .animate-glow {
            animation: glow 3s ease-in-out infinite;
          }
          @keyframes radar-sweep {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .comic-text-stroke {
            -webkit-text-stroke: 1px black;
          }
        `}} />
      </div>

      {/* Selected Country Details (60%) - Added pb-32 so the building grid can be scrolled fully above the tabs */}
      <div className="flex-1 p-6 pb-40 relative overflow-y-auto bg-gradient-to-b from-black/20 to-transparent touch-pan-y scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-mono font-black text-[#FFD700] mb-1">
               <span className="w-1.5 h-1.5 rounded-full bg-[#FFD700] animate-pulse" /> TARGET ASSET IDENTIFIED
            </div>
            <h2 className="text-4xl font-black uppercase tracking-tight flex items-center gap-3 comic-text-stroke">
              <span className="text-3xl filter drop-shadow(0 0 10px rgba(0,0,0,0.5))">{staticData.flag}</span>
              {staticData.name}
            </h2>
            <p className="text-gray-400 font-bold text-sm uppercase tracking-wide italic">
              Stage {countryState?.stage || 0} — {STAGE_NAMES[countryState?.stage || 0]}
            </p>
          </div>
          <button 
            onClick={handleInvest}
            disabled={!canAfford || (countryState?.stage || 0) >= 5}
            className={`font-black px-6 py-3 rounded-xl border-4 border-black shadow-[6px_6px_0_0_black] transform active:translate-y-1 active:shadow-none transition-all uppercase text-sm ${
              (countryState?.stage || 0) >= 5 
                ? 'bg-[#4ECDC4] text-white cursor-default' 
                : canAfford 
                  ? 'bg-[#FF1744] text-white hover:bg-[#ff3d67]' 
                  : 'bg-zinc-800 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            {(countryState?.stage || 0) >= 5 
              ? 'ASCENDED' 
              : `Invest $${Math.floor(upgradeCost/1000)}K`}
          </button>
        </div>

        {/* Progress Bar (Segments) */}
        <div className="flex gap-2 mt-6">
          {[0, 1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className={`h-3 flex-1 rounded-full border-4 border-black shadow-[2px_2px_0_0_black] transition-all duration-500 ${
                i < (countryState?.stage || 0) ? 'bg-[#FFD700] shadow-[0_0_10px_#FFD700]' : 'bg-black/40'
              }`}
            />
          ))}
        </div>

        {/* Buildings Grid - Moved UP for immediate visibility */}
        <div className="mt-8">
           <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-4 h-4 text-[#FFD700]" />
              <span className="text-[10px] font-black uppercase text-[#FFD700] tracking-widest">Asset Infrastructure</span>
              <div className="h-px flex-1 bg-[#FFD700]/20" />
           </div>
           {renderGrid()}
        </div>

        {/* Narrative Narrative - Moved DOWN */}
        <div className="mt-6 bg-black/40 p-4 rounded-2xl border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,0.5)] italic relative group">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#FFD700] opacity-50" />
          <p className="text-gray-300 text-base sm:text-lg leading-snug font-medium pl-3">
            {staticData.narrative}
          </p>
        </div>
      </div>

      {/* Bottom Tabs - With Safe Area Padding */}
      <div 
        className="p-4 bg-black/60 border-t-4 border-black overflow-x-auto flex gap-3 no-scrollbar relative z-[60]"
        style={{ paddingBottom: 'calc(1rem + var(--safe-bottom))' }}
      >
        {COUNTRIES_DATA.map(c => {
          const isUnlocked = useMetamanGame(s => s.globalDominance.countries[c.id]?.isUnlocked);
          if (!isUnlocked) return null;
          
          return (
            <button
              key={`tab-${c.id}`}
              onClick={() => setSelectedCountryId(c.id)}
              className={`flex-shrink-0 px-5 py-3 rounded-xl font-black text-xs transition-all border-4 transform ${
                selectedCountryId === c.id 
                  ? 'bg-zinc-800 border-[#FFD700] text-white -translate-y-1 shadow-[4px_4px_0_0_rgba(0,0,0,1)]' 
                  : 'bg-black/40 border-black text-gray-500 hover:text-gray-300'
              }`}
            >
              {c.id.toUpperCase()}
            </button>
          );
        })}
      </div>

      {/* Market Expansion Overlay */}
      {unlockingTargetCountryId && (
        <div className="absolute inset-0 z-[100] bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm">
          <div className="bg-[#1a1f2e] border-4 border-[#FFD700] rounded-3xl p-6 w-full max-w-sm shadow-[0_0_50px_rgba(255,215,0,0.3)] comic-panel">
            <h3 className="text-xl font-black uppercase text-[#FFD700] mb-2 flex items-center gap-2 italic">
              <Globe className="w-5 h-5" /> MARKET SELECTION
            </h3>
            <p className="text-gray-400 text-xs font-bold mb-6">
              Our Free Tools have penetrated adjacent regions. Choose the next target for expansion:
            </p>
            
            <div className="space-y-3">
              {(neighborMap[unlockingTargetCountryId] || []).filter(nid => !allCountries[nid]?.isUnlocked).map(nid => {
                const nData = COUNTRIES_DATA.find(c => c.id === nid);
                return (
                  <button 
                    key={`expand-${nid}`}
                    onClick={() => {
                      buyBuilding(selectedCountryId, 'free_tools');
                      useMetamanGame.getState().unlockCountry(nid);
                      addVisualEffect('achievement', window.innerWidth/2, window.innerHeight/2, 'high', `NEW MARKET: ${nData?.name.toUpperCase()}`);
                      setUnlockingTargetCountryId(null);
                    }}
                    className="w-full bg-black/40 border-4 border-black hover:border-[#FFD700] p-4 rounded-2xl flex items-center gap-4 transition-all group"
                  >
                    <span className="text-2xl">{nData?.flag}</span>
                    <div className="text-left">
                      <div className="font-black text-sm uppercase group-hover:text-[#FFD700]">{nData?.name}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight italic">Click to penetrate market</div>
                    </div>
                  </button>
                );
              })}
              
              {(neighborMap[unlockingTargetCountryId] || []).filter(nid => !allCountries[nid]?.isUnlocked).length === 0 && (
                <div className="text-center p-4 text-gray-600 font-bold uppercase text-xs">
                  No untapped adjacent markets available.
                </div>
              )}
            </div>

            <button 
              onClick={() => setUnlockingTargetCountryId(null)}
              className="mt-6 w-full py-3 font-black text-gray-500 uppercase text-xs hover:text-white"
            >
              Cancel Expansion
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
