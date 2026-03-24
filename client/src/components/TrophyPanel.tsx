import React from 'react';
import { Trophy, Target, Users, DollarSign } from 'lucide-react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import AdaptiveText from './AdaptiveText';
import AdaptivePanel from './AdaptivePanel';

// Simplified achievement milestones
const ACHIEVEMENT_MILESTONES = [
  { moneyTarget: 50000, bonusAmount: 20000, name: "First Big Break" },
  { userTarget: 100, bonusAmount: 30000, name: "User Century" },
  { moneyTarget: 100000, bonusAmount: 25000, name: "Corporate Foundation" },
  { userTarget: 200, bonusAmount: 50000, name: "Engaged Community" },
  { moneyTarget: 250000, bonusAmount: 50000, name: "Quarter Million Empire" },
  { userTarget: 500, bonusAmount: 75000, name: "Growing Influence" },
  { moneyTarget: 500000, bonusAmount: 100000, name: "Digital Tycoon" },
  { userTarget: 1000, bonusAmount: 200000, name: "Thousand Strong" },
  { moneyTarget: 1000000, bonusAmount: 100000, name: "Millionaire Status" },
  { userTarget: 2000, bonusAmount: 750000, name: "Social Media Giant" },
  { moneyTarget: 2000000, bonusAmount: 500000, name: "Multi-Million Empire" },
  { userTarget: 5000, bonusAmount: 2000000, name: "Platform Domination" },
  { moneyTarget: 10000000, bonusAmount: 2000000, name: "Ten Million Mogul" },
  { userTarget: 10000, bonusAmount: 8000000, name: "Global Influence" },
  { moneyTarget: 50000000, bonusAmount: 10000000, name: "Corporate Monopoly" },
  { userTarget: 25000, bonusAmount: 25000000, name: "World Controller" },
  { moneyTarget: 200000000, bonusAmount: 50000000, name: "Digital Overlord" },
  { moneyTarget: 1000000000, bonusAmount: 200000000, name: "Billion Dollar Empire" }
];

const MEGA_MILESTONES_LIST = [
  { id: 'socialMediaEmpire', target: 300000, reward: 500000, name: "Social Media Empire", bonus: "Mega Tower Boost" },
  { id: 'dopamineKingpin', target: 500000, reward: 1500000, name: "Dopamine Kingpin", bonus: "Double Click Power" },
  { id: 'digitalOverlord', target: 1000000, reward: 10000000, name: "Digital Overlord", bonus: "3x Income Multiplier" },
  { id: 'realityDistorter', target: 2000000, reward: 25000000, name: "Reality Distorter", bonus: "5x Income Multiplier" },
  { id: 'consciousnessHarvester', target: 5000000, reward: 100000000, name: "Consciousness Harvester", bonus: "10x Income Multiplier" }
];

const PERMANENT_BONUSES_LIST = [
  { id: 'gettingStarted', name: "Getting Started", condition: "$1k Earned", bonus: "+5% Income" },
  { id: 'millionaire', name: "Millionaire", condition: "$1M Earned", bonus: "+10% Income" },
  { id: 'billionaire', name: "Billionaire", condition: "$1B Earned", bonus: "+15% Income" },
  { id: 'clicktastic', name: "Clicktastic", condition: "1k Clicks", bonus: "+10% Click Power" },
  { id: 'clickMaster', name: "Click Master", condition: "100k Clicks", bonus: "+25% Click Power" },
  { id: 'speedDemon', name: "Speed Demon", condition: "$1M < 10min", bonus: "+20% Income" },
  { id: 'miningEmpire', name: "Mining Empire", condition: "100 Data Miners", bonus: "+10% Efficiency" },
  { id: 'corporateOverlord', name: "Corporate Overlord", condition: "100 All Depts", bonus: "+50% Efficiency" },
  { id: 'dedicatedPlayer', name: "Dedicated Player", condition: "1h Playtime", bonus: "+50% Offline Income" }
];

const BOMB_MILESTONES_LIST = [
  { id: 'bomb_130', target: 130, name: "Starter Bomb", reward: "Legal Trouble" },
  { id: 'bomb_2500', target: 2500, name: "Growth Bomb", reward: "Class Action" },
  { id: 'bomb_15k', target: 15000, name: "Expansion Bomb", reward: "Regulatory Audit" },
  { id: 'bomb_50k', target: 50000, name: "Massive Bomb", reward: "Federal Inquiry" },
  { id: 'bomb_150k', target: 150000, name: "Overlord Bomb", reward: "Senate Hearing" },
  { id: 'bomb_500k', target: 500000, name: "Empire Bomb", reward: "Antitrust Nuke" }
];

export default function TrophyPanel() {
  const [activeTab, setActiveTab] = React.useState<'standard' | 'mega' | 'bonuses' | 'bombs'>('standard');
  const { 
    showTrophyPanel, 
    toggleTrophyPanel,
    income,
    users,
    formatNumber,
    progressionState,
    lawsuitMilestones,
    getTotalIncomeMultiplier,
    getClickPowerMultiplier
  } = useMetamanGame();

  if (!showTrophyPanel) return null;

  const nextMoneyMilestone = ACHIEVEMENT_MILESTONES.find(m => m.moneyTarget && income < m.moneyTarget);
  const nextUserMilestone = ACHIEVEMENT_MILESTONES.find(m => m.userTarget && users < m.userTarget);
  const completedAchievements = ACHIEVEMENT_MILESTONES.filter(m => 
    (m.moneyTarget && income >= m.moneyTarget) || (m.userTarget && users >= m.userTarget)
  );

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const tabs = [
    { id: 'standard', name: 'Goals', icon: <Trophy className="w-3 h-3" /> },
    { id: 'mega', name: 'Mega', icon: <Target className="w-3 h-3" /> },
    { id: 'bonuses', name: 'Bonus', icon: <DollarSign className="w-3 h-3" /> },
    { id: 'bombs', name: 'Bombs', icon: <Users className="w-3 h-3" /> },
  ];

  return (
    <AdaptivePanel title="ACHIEVEMENTS" onClose={toggleTrophyPanel} position="center" icon={<Trophy className="w-5 h-5" />}>
      <div className="flex gap-1 mb-4 overflow-x-auto pb-1 no-scrollbar">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all
              ${activeTab === tab.id 
                ? 'bg-black text-white' 
                : 'bg-black/5 text-black hover:bg-black/10'}
            `}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      <div className="space-y-4 pb-6 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
        
        {activeTab === 'standard' && (
          <>
            {/* Money Progress */}
            {nextMoneyMilestone && (
              <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-black" />
                  <span className="text-xs font-black uppercase text-black">Revenue Goal</span>
                </div>
                <div className="flex justify-between items-end mb-2">
                  <AdaptiveText size="lg" weight="black" color="text-black" className="italic">
                    ${formatNumber(nextMoneyMilestone.moneyTarget!)}
                  </AdaptiveText>
                  <div className="text-[8px] font-black uppercase mb-1">Bonus: ${formatNumber(nextMoneyMilestone.bonusAmount)}</div>
                </div>
                <div className="w-full bg-gray-200 border-2 border-black rounded-full h-3 overflow-hidden mb-1">
                  <div className="bg-[#4ECDC4] h-full transition-all duration-300" style={{ width: `${getProgressPercentage(income, nextMoneyMilestone.moneyTarget!)}%` }} />
                </div>
              </div>
            )}

            {/* User Progress */}
            {nextUserMilestone && (
              <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-black" />
                  <span className="text-xs font-black uppercase text-black">User Milestone</span>
                </div>
                <div className="flex justify-between items-end mb-2">
                  <AdaptiveText size="lg" weight="black" color="text-black" className="italic">
                    {formatNumber(nextUserMilestone.userTarget!)} Citz
                  </AdaptiveText>
                  <div className="text-[8px] font-black uppercase mb-1">Bonus: ${formatNumber(nextUserMilestone.bonusAmount)}</div>
                </div>
                <div className="w-full bg-gray-200 border-2 border-black rounded-full h-3 overflow-hidden mb-1">
                  <div className="bg-[#FF6B35] h-full transition-all duration-300" style={{ width: `${getProgressPercentage(users, nextUserMilestone.userTarget!)}%` }} />
                </div>
              </div>
            )}

            {/* History */}
            <div>
              <h3 className="text-xs font-black uppercase text-black mb-2 px-1">Accomplishments ({completedAchievements.length})</h3>
              <div className="space-y-2">
                {completedAchievements.length === 0 ? (
                  <div className="p-4 text-center bg-black/5 rounded-xl border-2 border-dashed border-black/10">
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">No achievements yet</p>
                  </div>
                ) : (
                  completedAchievements.slice().reverse().map((m, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border-4 border-black rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-4 h-4 text-[#FFD700]" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase leading-none tracking-tighter">{m.name}</span>
                          <span className="text-[8px] font-bold text-gray-500 mt-0.5">CLAIMED ${formatNumber(m.bonusAmount)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'mega' && (
          <div className="space-y-3">
            <div className="p-3 bg-black text-white rounded-xl mb-4 border-2 border-white shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest underline decoration-[#FFD700]">Total Multiplier</span>
                <span className="text-lg font-black italic color-[#FFD700]">{getTotalIncomeMultiplier().toFixed(1)}x</span>
              </div>
            </div>
            {MEGA_MILESTONES_LIST.map(m => {
              const achieved = progressionState.megaMilestones[m.id as keyof typeof progressionState.megaMilestones];
              return (
                <div key={m.id} className={`p-4 border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all ${achieved ? 'bg-[#FFD700]/20' : 'bg-white grayscale opacity-60'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-[10px] font-black uppercase">{m.name}</h4>
                      <p className="text-[8px] font-bold text-gray-600 uppercase">{m.bonus}</p>
                    </div>
                    {achieved && <Trophy className="w-4 h-4 text-[#FFD700]" />}
                  </div>
                  <div className="w-full bg-gray-100 border-2 border-black rounded-full h-2 overflow-hidden">
                    <div className="bg-[#FF6B35] h-full transition-all" style={{ width: `${getProgressPercentage(users, m.target)}%` }} />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[7px] font-black uppercase">{formatNumber(m.target)} Users</span>
                    <span className="text-[7px] font-black uppercase italic">+${formatNumber(m.reward)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'bonuses' && (
          <div className="grid grid-cols-1 gap-2">
            <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar pb-1">
              <div className="px-3 py-2 bg-white border-2 border-black rounded-lg min-w-fit shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                <div className="text-[7px] font-black uppercase opacity-50">Clicks</div>
                <div className="text-[10px] font-black">{getClickPowerMultiplier().toFixed(2)}x</div>
              </div>
            </div>
            {PERMANENT_BONUSES_LIST.map(b => {
              const achieved = progressionState.permanentBonuses[b.id as keyof typeof progressionState.permanentBonuses];
              return (
                <div key={b.id} className={`flex items-center justify-between p-3 border-4 border-black rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${achieved ? 'bg-[#4ECDC4]/10' : 'bg-white grayscale opacity-40'}`}>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase leading-none">{b.name}</span>
                    <span className="text-[7px] font-bold text-gray-500 uppercase mt-1">{b.condition}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-black text-[#4ECDC4] uppercase">{b.bonus}</div>
                    {achieved ? <div className="text-[7px] font-black text-green-600 uppercase">ACTIVE</div> : <div className="text-[7px] font-black text-gray-400 uppercase">LOCKED</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'bombs' && (
          <div className="space-y-3">
            {BOMB_MILESTONES_LIST.map(b => {
              const data = lawsuitMilestones[b.id];
              const achieved = data?.triggered || false;
              return (
                <div key={b.id} className={`p-3 border-4 border-black rounded-xl shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${achieved ? 'bg-red-50' : 'bg-white'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-black uppercase">{b.name}</span>
                    <span className={`text-[7px] font-black px-1.5 py-0.5 rounded border border-black ${achieved ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {achieved ? 'DETONATED' : 'ARMED'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 border-2 border-black rounded-full h-1.5 overflow-hidden">
                    <div className={`${achieved ? 'bg-red-600' : 'bg-black'} h-full transition-all`} style={{ width: `${getProgressPercentage(users, b.target)}%` }} />
                  </div>
                  <div className="flex justify-between mt-1 text-[7px] font-black uppercase">
                     <span>{formatNumber(b.target)} Users</span>
                     <span className="text-red-600 italic">{b.reward}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdaptivePanel>
  );
}