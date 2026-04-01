import { useMetamanGame } from "../lib/stores/useMetamanGame";
import { CAMPAIGNS, Campaign } from "../lib/gameEngine/CampaignSystem";
import { Zap, AlertTriangle, X, Lock } from "lucide-react";
import AdaptivePanel from "./AdaptivePanel";
import { getStage, STAGES } from "../lib/utils/stageSystem";

interface CampaignPanelProps {
  onCampaignSelect: (campaignId: string) => void;
  regulatoryRisk: number;
  campaignCooldowns: Map<string, number>;
  campaignCharges: number;
  onClose: () => void;
}

export default function CampaignPanel({ onCampaignSelect, regulatoryRisk, campaignCooldowns, campaignCharges, onClose }: CampaignPanelProps) {
  const { income, purchaseCampaign, users, darkWebPurchases, mansionPurchases } = useMetamanGame();
  const currentStage = getStage(users);

  const ownedBaits = [...(darkWebPurchases || []), ...(mansionPurchases || [])];
  const hasAnyBait = ownedBaits.length > 0;

  const filteredCampaigns = CAMPAIGNS.filter(c => {
    if (c.id === 'elite_scan') return hasAnyBait;
    return true;
  });

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const formatTime = (ms: number) => {
    const seconds = Math.ceil(ms / 1000);
    return `${seconds}s`;
  };

  const canAfford = (campaign: Campaign) => {
    return income >= campaign.cost;
  };

  const isOnCooldown = (campaignId: string) => {
    const remaining = campaignCooldowns.get(campaignId) || 0;
    return remaining > 0;
  };

  const { getMaxCampaignCharges } = useMetamanGame();
  const maxCharges = getMaxCampaignCharges();

  return (
    <AdaptivePanel title="CAMPAIGNS" onClose={onClose}>
      <div className="px-2">
        <div className="space-y-4">
        {/* Campaign Charges Display */}
        <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="text-sm font-black text-black uppercase mb-2">Charges: {campaignCharges}/{maxCharges}</div>
          <div className="w-full bg-gray-200 border-2 border-black rounded-full h-4 overflow-hidden">
            <div 
              className="bg-[#4ECDC4] h-full transition-all duration-300"
              style={{ width: `${Math.min(100, (campaignCharges / maxCharges) * 100)}%` }}
            />
          </div>
        </div>

        {/* Regulatory Risk Meter */}
        <div className="p-4 bg-white border-4 border-black rounded-2xl shadow-[4px_4px_0_0_rgba(0,0,0,1)]">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-black" />
            <span className="text-sm font-black text-black uppercase">Regulatory Heat</span>
          </div>
          <div className="w-full bg-gray-200 border-2 border-black rounded-full h-4 overflow-hidden mb-1">
            <div 
              className={`h-full transition-all duration-300 ${
                regulatoryRisk < 50 ? 'bg-[#4ECDC4]' :
                regulatoryRisk < 75 ? 'bg-[#FFD700]' : 'bg-[#FF1744]'
              }`}
              style={{ width: `${regulatoryRisk}%` }}
            />
          </div>
          <div className="text-right text-xs font-black uppercase text-black">{Math.round(regulatoryRisk)}% HEAT</div>
        </div>

        {/* Campaigns */}
        <div className="space-y-3">
          {filteredCampaigns.map((campaign) => {
            const isLocked = campaign.requiredStage > currentStage;
            const affordable = canAfford(campaign);
            const cooldown = isOnCooldown(campaign.id);
            const disabled = isLocked || !affordable || cooldown;

            if (isLocked) {
              const requiredStageInfo = STAGES[campaign.requiredStage - 1];
              return (
                <div 
                  key={campaign.id}
                  className="w-full p-4 rounded-2xl border-4 border-black bg-gray-100 opacity-60 grayscale relative overflow-hidden"
                >
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-700" />
                      <h3 className="text-lg font-black text-gray-700 uppercase italic tracking-tighter leading-none">
                        LOCKED
                      </h3>
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase leading-none">Requires Stage {campaign.requiredStage}: {requiredStageInfo.name}</p>
                </div>
              );
            }

            return (
              <button
                key={campaign.id}
                onClick={() => {
                  if (!disabled) {
                    const success = purchaseCampaign(campaign.id, campaign.cost, campaign.color);
                    if (success) onCampaignSelect(campaign.id);
                  }
                }}
                disabled={disabled}
                className={`w-full p-4 rounded-2xl border-4 border-black text-left transition-all duration-100 transform active:scale-95 active:translate-y-1 ${
                  disabled 
                    ? 'bg-gray-200 opacity-60 grayscale' 
                    : 'bg-white hover:bg-[#FFD700] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] shadow-[4px_4px_0_0_rgba(0,0,0,1)]'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h3 className="text-lg font-black text-black uppercase italic tracking-tighter leading-none">
                    {campaign.name}
                  </h3>
                  <div className="text-right">
                    <div className="text-sm font-black text-black italic">
                      {formatCurrency(campaign.cost)}
                    </div>
                  </div>
                </div>
                
                <p className="text-[10px] font-bold text-gray-600 uppercase leading-none mb-2">{campaign.description}</p>
                
                <div className="flex justify-between text-[10px] font-black uppercase text-black">
                  <span className="bg-[#4ECDC4] px-1 rounded border border-black italic">+{campaign.citizenCount} Citz</span>
                  <span className="bg-[#FF6B35] px-1 rounded border border-black italic">+{campaign.riskIncrease}% Risk</span>
                </div>
                
                {cooldown && (
                  <div className="mt-2 bg-black text-white text-[10px] font-black p-1 text-center rounded italic">
                    COOLDOWN: {formatTime(campaignCooldowns.get(campaign.id) || 0)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      </div>
    </AdaptivePanel>
  );
}