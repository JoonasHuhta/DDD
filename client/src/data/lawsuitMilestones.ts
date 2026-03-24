// MILESTONE-BASED LAWSUIT SYSTEM
// 10 Strategic Legal Challenges with Soft Penalties

export interface LawsuitMilestone {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'income' | 'users' | 'departments' | 'time' | 'clicks';
    threshold: number;
  };
  plaintiff: string;
  claim: string;
  defenseCost: number;
  penaltyPercent: number; // Soft penalty to income if not defended
  npcCount: 1 | 2 | 3; // How many red NPCs appear
  npcAngles: number[]; // Angles they appear from (degrees)
}

export const LAWSUIT_MILESTONES: LawsuitMilestone[] = [
  {
    id: 'first_user_complaint',
    name: 'User Privacy Violation',
    description: 'Early user files complaint about data collection',
    trigger: { type: 'users', threshold: 15 }, // TRIPLED FREQUENCY: Reduced from 25 to 15
    plaintiff: 'Privacy Rights Coalition',
    claim: 'Unauthorized data harvesting from 25+ users without proper consent forms',
    defenseCost: 2500,
    penaltyPercent: 10, // 10% income reduction
    npcCount: 1,
    npcAngles: [45] // Single NPC from northeast
  },
  
  {
    id: 'business_license_issue',
    name: 'Operating Without License',
    description: 'Local authorities question business legitimacy',
    trigger: { type: 'income', threshold: 5000 }, // TRIPLED FREQUENCY: Reduced from 10000 to 5000
    plaintiff: 'City Business Authority',
    claim: 'Operating social media empire without proper business registration',
    defenseCost: 5000,
    penaltyPercent: 8,
    npcCount: 1,
    npcAngles: [180] // Single NPC from south
  },
  
  {
    id: 'employee_rights',
    name: 'Worker Classification Suit',
    description: 'Gig workers demand employee benefits',
    trigger: { type: 'departments', threshold: 2 }, // TRIPLED FREQUENCY: Reduced from 3 to 2
    plaintiff: 'Digital Workers Union',
    claim: 'Misclassifying employees as independent contractors',
    defenseCost: 7500,
    penaltyPercent: 12,
    npcCount: 2,
    npcAngles: [135, 225] // Two NPCs from southwest corners
  },
  
  {
    id: 'competitor_sabotage',
    name: 'Unfair Competition Claims',
    description: 'Rival social media company files suit',
    trigger: { type: 'users', threshold: 50 }, // TRIPLED FREQUENCY: Reduced from 100 to 50
    plaintiff: 'CompetitorBook Inc.',
    claim: 'Using predatory algorithms to steal users from established platforms',
    defenseCost: 15000,
    penaltyPercent: 15,
    npcCount: 2,
    npcAngles: [90, 270] // NPCs from east and west
  },
  
  {
    id: 'advertising_fraud',
    name: 'False Advertising Allegations',
    description: 'FTC investigates marketing claims',
    trigger: { type: 'income', threshold: 50000 },
    plaintiff: 'Federal Trade Commission',
    claim: 'Misleading advertisements about platform safety and user privacy',
    defenseCost: 25000,
    penaltyPercent: 18,
    npcCount: 2,
    npcAngles: [0, 180] // NPCs from north and south
  },
  
  {
    id: 'data_breach_lawsuit',
    name: 'Security Breach Class Action',
    description: 'Users sue after alleged data leak',
    trigger: { type: 'users', threshold: 500 },
    plaintiff: 'Affected Users Coalition',
    claim: 'Inadequate security measures led to personal data exposure',
    defenseCost: 50000,
    penaltyPercent: 20,
    npcCount: 3,
    npcAngles: [60, 180, 300] // Three NPCs surrounding
  },
  
  {
    id: 'antitrust_investigation',
    name: 'Monopolistic Practices',
    description: 'Government antitrust investigation begins',
    trigger: { type: 'income', threshold: 250000 },
    plaintiff: 'Department of Justice',
    claim: 'Anti-competitive behavior and market manipulation tactics',
    defenseCost: 100000,
    penaltyPercent: 25,
    npcCount: 2,
    npcAngles: [315, 45] // NPCs from northeast corners
  },
  
  {
    id: 'international_gdpr',
    name: 'GDPR Compliance Violation',
    description: 'European regulators impose heavy fines',
    trigger: { type: 'users', threshold: 1000 },
    plaintiff: 'European Data Protection Board',
    claim: 'Processing EU citizen data without GDPR compliance measures',
    defenseCost: 150000,
    penaltyPercent: 22,
    npcCount: 2,
    npcAngles: [120, 240] // NPCs from southeast and southwest
  },
  
  {
    id: 'mental_health_lawsuit',
    name: 'Platform Addiction Claims',
    description: 'Parents sue over addictive algorithm design',
    trigger: { type: 'departments', threshold: 10 },
    plaintiff: 'Parents Against Digital Addiction',
    claim: 'Deliberately designing addictive features targeting vulnerable users',
    defenseCost: 200000,
    penaltyPercent: 28,
    npcCount: 3,
    npcAngles: [0, 120, 240] // Three NPCs evenly spaced
  },
  
  {
    id: 'ai_copyright_infringement',
    name: 'AI Training Copyright Violation',
    description: 'Authors and publishers unite against your AI training practices',
    trigger: { type: 'income', threshold: 500000 },
    plaintiff: 'Authors Guild & Publishers Coalition',
    claim: 'Using copyrighted books, articles, and content to train AI without permission - massive copyright violation',
    defenseCost: 125000,
    penaltyPercent: 25,
    npcCount: 3,
    npcAngles: [60, 180, 300] // Three legal agents surrounding the player
  },
  
  {
    id: 'congressional_hearing',
    name: 'Congressional Investigation',
    description: 'Called to testify before Congress',
    trigger: { type: 'income', threshold: 1000000 },
    plaintiff: 'U.S. House Technology Committee',
    claim: 'Alleged manipulation of democratic processes through algorithmic bias',
    defenseCost: 500000,
    penaltyPercent: 30,
    npcCount: 3,
    npcAngles: [90, 210, 330] // Strategic positioning around player
  }
];

// ENDGAME ATTACKS FROM REAL COMPANIES
export interface EndgameAttack {
  id: string;
  company: string;
  attackType: string;
  description: string;
  trigger: {
    type: 'income' | 'users' | 'time';
    threshold: number;
  };
  tactics: string[];
  defenseCost: number;
  penaltyPercent: number;
  duration: number; // Attack duration in minutes
}

export const ENDGAME_ATTACKS: EndgameAttack[] = [
  {
    id: 'meta_patent_war',
    company: 'Meta/Facebook',
    attackType: 'Patent Lawsuits',
    description: 'Systematic legal pressure using patent portfolio',
    trigger: { type: 'users', threshold: 2000 },
    tactics: [
      'Patent Lawsuits: Systematic legal pressure ($50K defense cost)',
      'User Migration: Copies DDD features to steal users back',
      'Advertiser Pressure: Convinces advertisers to boycott DDD',
      'Regulatory Lobbying: Uses government connections against DDD'
    ],
    defenseCost: 50000,
    penaltyPercent: 35,
    duration: 5
  },
  
  {
    id: 'x_warfare',
    company: 'X (Twitter)',
    attackType: 'Social Media Warfare',
    description: 'Viral campaigns and chaos tactics',
    trigger: { type: 'users', threshold: 1500 },
    tactics: [
      'Social Media Mobs: Viral campaigns discrediting DDD',
      'Engagement Warfare: Superior viral content steals attention',
      'Chaos Tactics: Unpredictable attacks hard to defend against',
      'Influencer Recruitment: Steals DDD celebrity partnerships'
    ],
    defenseCost: 75000,
    penaltyPercent: 25,
    duration: 8
  },
  
  {
    id: 'tiktok_assault',
    company: 'TikTok/ByteDance',
    attackType: 'Algorithm Superiority',
    description: 'Advanced AI algorithms target your user base',
    trigger: { type: 'users', threshold: 3000 },
    tactics: [
      'Youth Targeting: Superior algorithms for under-18 demographic',
      'Cultural Manipulation: Creates trends that redirect from DDD',
      'International Pressure: Uses global presence against DDD',
      'Algorithm Superiority: More addictive features than DDD offers'
    ],
    defenseCost: 100000,
    penaltyPercent: 40,
    duration: 10
  }
];