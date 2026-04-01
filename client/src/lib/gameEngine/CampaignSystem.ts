export interface Campaign {
  id: string;
  name: string;
  cost: number;
  citizenCount: number;
  radius: number;
  cooldown: number;
  riskIncrease: number;
  color: string;
  description: string;
  requiredStage: number;
}

export const CAMPAIGNS: Campaign[] = [
  // Basic Street Lures ($100 - $10K)
  {
    id: 'free_samples',
    name: 'Free Samples',
    cost: 100,
    citizenCount: 5,
    radius: 60,
    cooldown: 2000, 
    riskIncrease: 0,
    color: '#00ff88', 
    description: 'Hook them with freebies - classic dealer tactics',
    requiredStage: 1
  },
  {
    id: 'happy_hour_special',
    name: 'Happy Hour Special',
    cost: 500,
    citizenCount: 15,
    radius: 90,
    cooldown: 3000, 
    riskIncrease: 2,
    color: '#ffaa00', 
    description: 'Limited time offers create urgency and FOMO',
    requiredStage: 1
  },
  {
    id: 'social_feed',
    name: 'Social Feed',
    cost: 1000,
    citizenCount: 5,
    radius: 80,
    cooldown: 3000, 
    riskIncrease: 0,
    color: '#00bfff', 
    description: 'Basic social media engagement',
    requiredStage: 2
  },
  {
    id: 'pure_bliss_guarantee',
    name: 'Pure Bliss Guarantee',
    cost: 2000,
    citizenCount: 30,
    radius: 150,
    cooldown: 4000, 
    riskIncrease: 5,
    color: '#ff6600', 
    description: 'Promise them euphoria - satisfaction guaranteed!',
    requiredStage: 2
  },
  {
    id: 'viral_challenge',
    name: 'Viral Challenge',
    cost: 5000,
    citizenCount: 15,
    radius: 120,
    cooldown: 5000, 
    riskIncrease: 5,
    color: '#9d4edd', 
    description: 'Trending content manipulation',
    requiredStage: 3
  },
  {
    id: 'experimental_formula',
    name: 'Experimental Formula',
    cost: 10000,
    citizenCount: 50,
    radius: 200,
    cooldown: 6000, 
    riskIncrease: 20,
    color: '#ff0088', 
    description: 'Untested but potent - high risk, high reward',
    requiredStage: 3
  },
  {
    id: 'addiction_algorithm',
    name: 'Addiction Algorithm',
    cost: 15000,
    citizenCount: 30,
    radius: 180,
    cooldown: 8000, 
    riskIncrease: 15,
    color: '#f72585', 
    description: 'Psychological engagement tactics',
    requiredStage: 4
  },
  
  // Advanced Digital Campaigns ($25K - $1M)
  {
    id: 'infinite_scroll_trap',
    name: 'Infinite Scroll Trap',
    cost: 25000,
    citizenCount: 75,
    radius: 300,
    cooldown: 10000, 
    riskIncrease: 30,
    color: '#00ffff', 
    description: 'Creates persistent addiction patterns - they never stop scrolling',
    requiredStage: 4
  },
  {
    id: 'underage_targeting',
    name: 'Underage Targeting',
    cost: 25000,
    citizenCount: 50,
    radius: 250,
    cooldown: 12000, 
    riskIncrease: 35,
    color: '#ff0000', 
    description: 'Target vulnerable demographics',
    requiredStage: 5
  },
  {
    id: 'viral_challenge_injection',
    name: 'Viral Challenge Injection',
    cost: 50000,
    citizenCount: 100,
    radius: 350,
    cooldown: 15000, 
    riskIncrease: 40,
    color: '#8800ff', 
    description: 'Injects viral content across all social networks simultaneously',
    requiredStage: 6
  },
  {
    id: 'algorithm_chaos_bomb',
    name: 'Algorithm Chaos Bomb',
    cost: 100000,
    citizenCount: 150,
    radius: 400,
    cooldown: 20000, 
    riskIncrease: 60,
    color: '#ff4400', 
    description: 'Temporarily crashes competitor platforms - digital warfare',
    requiredStage: 7
  },
  {
    id: 'reality_hack_protocol',
    name: 'Reality Hack Protocol',
    cost: 500000,
    citizenCount: 200,
    radius: 500,
    cooldown: 30000, 
    riskIncrease: 80,
    color: '#ff0066', 
    description: 'Manipulates user perception of truth itself - reality is optional',
    requiredStage: 8
  },
  {
    id: 'the_perfect_storm',
    name: 'The Perfect Storm',
    cost: 1000000,
    citizenCount: 300, 
    radius: 600,
    cooldown: 45000, 
    riskIncrease: 80, 
    color: '#ffffff', 
    description: 'Ultimate digital dominance - complete control over reality perception',
    requiredStage: 10
  },
  {
    id: 'elite_scan',
    name: 'Elite Target Scan',
    cost: 50000,
    citizenCount: 0, 
    radius: 1000,    
    cooldown: 45000, 
    riskIncrease: 5,
    color: '#FFD700', 
    description: 'High-frequency pings to find Elite targets. Only works if you have Baits.',
    requiredStage: 2
  }
];

export class CampaignSystem {
  private lastUsedTimes: Map<string, number> = new Map();
  private regulatoryRisk: number = 0;
  private maxRisk: number = 100;

  public canAfford(campaign: Campaign, income: number): boolean {
    return income >= campaign.cost;
  }

  public isOnCooldown(campaignId: string): boolean {
    const lastUsed = this.lastUsedTimes.get(campaignId) || 0;
    const campaign = CAMPAIGNS.find(c => c.id === campaignId);
    if (!campaign) return false;
    
    return Date.now() - lastUsed < campaign.cooldown;
  }

  public getCooldownRemaining(campaignId: string): number {
    const lastUsed = this.lastUsedTimes.get(campaignId) || 0;
    const campaign = CAMPAIGNS.find(c => c.id === campaignId);
    if (!campaign) return 0;
    
    const remaining = campaign.cooldown - (Date.now() - lastUsed);
    return Math.max(0, remaining);
  }

  public useCampaign(campaignId: string): void {
    this.lastUsedTimes.set(campaignId, Date.now());
    
    const campaign = CAMPAIGNS.find(c => c.id === campaignId);
    if (campaign) {
      this.regulatoryRisk = Math.min(this.maxRisk, this.regulatoryRisk + campaign.riskIncrease);
    }
  }

  public getRegulatoryRisk(): number {
    return this.regulatoryRisk;
  }

  public getRiskPercentage(): number {
    return (this.regulatoryRisk / this.maxRisk) * 100;
  }

  public decreaseRisk(amount: number): void {
    this.regulatoryRisk = Math.max(0, this.regulatoryRisk - amount);
  }

  public getCampaignById(id: string): Campaign | undefined {
    return CAMPAIGNS.find(c => c.id === id);
  }
}