import React, { useState } from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';
import { Building2, TrendingUp, Users } from 'lucide-react';
import PurchaseFeedback from './PurchaseFeedback';
import AdaptivePanel from './AdaptivePanel';
import AdaptiveText from './AdaptiveText';

interface FeedbackPopup {
  id: string;
  incomeGain?: number;
  userGain?: number; 
  position: { x: number; y: number };
}

export default function DepartmentPanel({ onClose }: { onClose: () => void }) {
  const {
    departments,
    income,
    buyDepartment,
    buyMaxDepartments,
    calculateDepartmentCost,
    formatNumber,
    cohorts,
    users
  } = useMetamanGame();

  const [activeTab, setActiveTab] = useState<'departments' | 'demographics'>('departments');
  const [feedbackPopups, setFeedbackPopups] = useState<FeedbackPopup[]>([]);

  const canAfford = (departmentId: string) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return false;
    return income >= calculateDepartmentCost(department);
  };

  const handleBuyDepartment = (departmentId: string, event: React.MouseEvent) => {
    const department = departments.find(d => d.id === departmentId);
    if (!department) return;
    
    const success = buyDepartment(departmentId);
    
    if (success) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const popup: FeedbackPopup = {
        id: `${departmentId}-${Date.now()}`,
        incomeGain: department.baseIncome,
        userGain: getUserGenerationRate(departmentId),
        position: { x: rect.left + rect.width / 2, y: rect.top }
      };
      setFeedbackPopups(prev => [...prev, popup]);
    }
  };

  const getUserGenerationRate = (departmentId: string): number => {
    switch (departmentId) {
      case 'corner_operations': return 6;
      case 'supply_networks': return 9;
      case 'customer_relations': return 12;
      case 'algorithm_labs': return 18;
      case 'data_mining_centers': return 30;
      case 'viral_content_farms': return 48;
      case 'influencer_networks': return 72;
      case 'neural_manipulation_labs': return 120;
      case 'global_server_farms': return 180;
      case 'government_relations': return 300;
      case 'reality_distortion_centers': return 480;
      case 'consciousness_harvesting_arrays': return 720;
      default: return 0;
    }
  };

  const removeFeedbackPopup = (id: string) => {
    setFeedbackPopups(prev => prev.filter(popup => popup.id !== id));
  };

  const handleBuyMax = (departmentId: string) => {
    buyMaxDepartments(departmentId);
  };

  const renderDepartments = () => (
    <div className="space-y-4 pb-20">
      {departments.map((department) => {
        const cost = calculateDepartmentCost(department);
        const affordable = canAfford(department.id);

        return (
          <div
            key={department.id}
            className={`p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all ${
              affordable ? 'hover:-translate-y-1' : 'opacity-80'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 border-2 border-black rounded-xl">
                  <Building2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-black text-xs uppercase tracking-tighter">{department.name}</h3>
                  <div className="text-[10px] font-bold text-gray-500 uppercase">LVL {department.owned}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black text-green-600 uppercase italic">
                  +${formatNumber(department.baseIncome)}/s
                </div>
                {getUserGenerationRate(department.id) > 0 && (
                  <div className="text-[8px] font-black text-blue-600 uppercase">
                    +{getUserGenerationRate(department.id)}/m citz
                  </div>
                )}
              </div>
            </div>

            <div className="text-[9px] font-bold text-gray-600 uppercase leading-none mb-3">
              {department.description}
            </div>

            <div className="flex gap-2">
              <button
                onClick={(e) => handleBuyDepartment(department.id, e)}
                disabled={!affordable}
                className={`flex-1 py-2 border-4 border-black rounded-xl font-black uppercase italic text-[10px] transition-all ${
                  affordable 
                    ? 'bg-[#FFD700] hover:bg-yellow-400 active:translate-y-1 active:shadow-none shadow-[2px_2px_0_0_rgba(0,0,0,1)]' 
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                BUY ${formatNumber(cost)}
              </button>
              {affordable && (
                <button
                  onClick={() => handleBuyMax(department.id)}
                  className="px-4 py-2 bg-black text-white border-4 border-black rounded-xl font-black uppercase italic text-[10px] hover:bg-gray-800 active:translate-y-1 shadow-[2px_2px_0_0_rgba(0,0,0,1)] active:shadow-none"
                >
                  MAX
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderDemographics = () => {
    const total = Math.max(1, users);
    const cohortList = [
      { id: 'teens', name: 'Teens', color: 'bg-pink-400', val: cohorts.teens, description: 'Low value, high volume' },
      { id: 'pros', name: 'Pros', color: 'bg-blue-400', val: cohorts.pros, description: 'Stable income, moderate risk' },
      { id: 'seniors', name: 'Seniors', color: 'bg-orange-400', val: cohorts.seniors, description: 'High value, political heat' },
      { id: 'addicts', name: 'Addicts', color: 'bg-red-600', val: cohorts.addicts, description: 'Extreme profit, total risk' },
    ];

    return (
      <div className="space-y-6 pb-20">
        <div className="p-4 bg-black text-white rounded-2xl border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <h3 className="font-black uppercase italic mb-4">User Cohort Distribution</h3>
          <div className="h-8 flex rounded-lg overflow-hidden border-2 border-white">
            {cohortList.map((c) => {
              const weight = (c.val / total) * 100;
              if (weight <= 0) return null;
              return (
                <div key={c.id} className={`${c.color} h-full`} style={{ width: `${weight}%` }} />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            {cohortList.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 ${c.color} border border-white`} />
                <span className="text-[10px] font-bold uppercase">{c.name}: {formatNumber(c.val)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {cohortList.map((c) => (
            <div key={c.id} className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
              <div className="flex justify-between items-center mb-1">
                <h4 className="font-black uppercase italic">{c.name}</h4>
                <div className={`px-2 py-1 ${c.color} text-white text-[10px] font-black rounded-lg border-2 border-black`}>
                  {users > 0 ? Math.round((c.val / total) * 100) : 0}%
                </div>
              </div>
              <p className="text-[10px] font-bold text-gray-600 uppercase mb-2">{c.description}</p>
              <div className="text-xs font-black text-green-600 uppercase">
                Revenue: ${formatNumber(c.val * (c.id === 'teens' ? 0.1 : c.id === 'pros' ? 0.5 : c.id === 'seniors' ? 2 : 5))}/s
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AdaptivePanel title="EMPIRE" onClose={onClose} position="right" icon={<Building2 className="w-5 h-5" />}>
      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('departments')}
          className={`flex-1 py-2 border-4 border-black rounded-xl font-black uppercase italic text-xs transition-all ${
            activeTab === 'departments' 
              ? 'bg-blue-500 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]' 
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          Departments
        </button>
        <button
          onClick={() => setActiveTab('demographics')}
          className={`flex-1 py-2 border-4 border-black rounded-xl font-black uppercase italic text-xs transition-all ${
            activeTab === 'demographics' 
              ? 'bg-purple-500 text-white shadow-[2px_2px_0_0_rgba(0,0,0,1)]' 
              : 'bg-white hover:bg-gray-100'
          }`}
        >
          Demographics
        </button>
      </div>

      <div className="px-1">
        {activeTab === 'departments' ? renderDepartments() : renderDemographics()}
      </div>

      {feedbackPopups.map((popup) => (
        <PurchaseFeedback
          key={popup.id}
          incomeGain={popup.incomeGain}
          userGain={popup.userGain}
          position={popup.position}
          onComplete={() => removeFeedbackPopup(popup.id)}
        />
      ))}
    </AdaptivePanel>
  );
}