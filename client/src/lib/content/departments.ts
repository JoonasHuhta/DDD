/**
 * CONTENT FILE: Department definitions
 * 
 * Add new departments here without touching the store.
 * Order = display order. baseCost and baseIncome scale automatically.
 */

export interface Department {
  id: string;
  name: string;
  baseCost: number;
  baseIncome: number;
  baseUserGeneration: number; // users per second
  owned: number;
  description: string;
  icon: string;
}

// Dan's Evolution: Street → App → Empire
export const DEFAULT_DEPARTMENTS: Department[] = [
  // ── Street Level ─────────────────────────────────────────────────────────
  {
    id: 'corner_operations',
    name: 'Corner Operations',
    baseCost: 10,
    baseIncome: 1,
    baseUserGeneration: 0,
    owned: 0,
    description: 'Basic street dealing spots - $1/sec',
    icon: '📦'
  },
  {
    id: 'supply_networks',
    name: 'Supply Networks',
    baseCost: 100,
    baseIncome: 5,
    baseUserGeneration: 1/15, // 1 user every 15s
    owned: 0,
    description: 'Reliable dopamine production - $5/sec + 1 user/15s',
    icon: '📦'
  },
  {
    id: 'customer_relations',
    name: 'Customer Relations',
    baseCost: 500,
    baseIncome: 15,
    baseUserGeneration: 1/10, // 1 user every 10s
    owned: 0,
    description: 'Word-of-mouth marketing - $15/sec + 1 user/10s',
    icon: '🤝'
  },

  // ── Digital Platform ──────────────────────────────────────────────────────
  {
    id: 'algorithm_centers',
    name: 'Algorithm Labs',
    baseCost: 1000,
    baseIncome: 50,
    baseUserGeneration: 1/8, // 1 user every 8s
    owned: 0,
    description: 'Engagement optimization - $50/sec + 1 user/8s',
    icon: '⚙️'
  },
  {
    id: 'data_miners',
    name: 'Data Mining Centers',
    baseCost: 5000,
    baseIncome: 200,
    baseUserGeneration: 2/10, // 2 users every 10s
    owned: 0,
    description: 'Extract user information - $200/sec + 2 users/10s',
    icon: '☢️'
  },
  {
    id: 'user_farms',
    name: 'Viral Content Farms',
    baseCost: 10000,
    baseIncome: 500,
    baseUserGeneration: 3/12, // 3 users every 12s
    owned: 0,
    description: 'Manufactured trends - $500/sec + 3 users/12s',
    icon: '📱'
  },
  {
    id: 'influencer_networks',
    name: 'Influencer Networks',
    baseCost: 25000,
    baseIncome: 1200,
    baseUserGeneration: 5/15, // 5 users every 15s
    owned: 0,
    description: 'Celebrity partnerships - $1200/sec + 5 users/15s',
    icon: '⭐'
  },

  // ── Corporate Empire ──────────────────────────────────────────────────────
  {
    id: 'neural_networks',
    name: 'Neural Manipulation Labs',
    baseCost: 100000,
    baseIncome: 3000,
    baseUserGeneration: 8/20, // 8 users every 20s
    owned: 0,
    description: 'Advanced psychological techniques - $3K/sec + 8 users/20s',
    icon: '🧠'
  },
  {
    id: 'global_server_farms',
    name: 'Global Server Farms',
    baseCost: 500000,
    baseIncome: 8000,
    baseUserGeneration: 12/25, // 12 users every 25s
    owned: 0,
    description: 'Worldwide data collection - $8K/sec + 12 users/25s',
    icon: '🌍'
  },
  {
    id: 'government_relations',
    name: 'Government Relations',
    baseCost: 1000000,
    baseIncome: 20000,
    baseUserGeneration: 20/30, // 20 users every 30s
    owned: 0,
    description: 'Regulatory capture - $20K/sec + 20 users/30s',
    icon: '🏛️'
  },
  {
    id: 'reality_distortion_centers',
    name: 'Reality Distortion Centers',
    baseCost: 5000000,
    baseIncome: 50000,
    baseUserGeneration: 30/35, // 30 users every 35s
    owned: 0,
    description: 'Control information - $50K/sec + 30 users/35s',
    icon: '🔮'
  },
  {
    id: 'consciousness_harvesters',
    name: 'Consciousness Harvesting Arrays',
    baseCost: 50000000,
    baseIncome: 150000,
    baseUserGeneration: 50/40, // 50 users every 40s
    owned: 0,
    description: 'Pure attention extraction - $150K/sec + 50 users/40s',
    icon: '🖐️'
  }
];
