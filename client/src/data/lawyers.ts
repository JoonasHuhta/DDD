export interface Lawyer {
  id: string;
  name: string;
  role: string;
  skill: string;
  description: string;
  cost: number;
  bonusType: 'heatDecay' | 'clickHeat' | 'dataHeat' | 'lawsuitDefense' | 'globalGeneration';
  bonusValue: number; // e.g. 0.2 for 20% reduction or 1.0 for flat decay
  image: string;
  tier: 'junior' | 'pro' | 'partner' | 'legendary';
}

export const LAWYERS: Lawyer[] = [
  {
    id: 'lawyer_fresh_fish',
    name: 'Junior Associate "Fresh Fish"',
    role: 'Paperwork Specialist',
    skill: '+1.5 Heat Decay/s',
    description: 'Nervous, cheap, and surprisingly good at burying scandals under 500 pages of irrelevant filings.',
    cost: 25000,
    bonusType: 'heatDecay',
    bonusValue: 1.5,
    image: '/lawyer_fresh_fish_1774464381240.png',
    tier: 'junior'
  },
  {
    id: 'lawyer_slippin_sam',
    name: '"Slippin\' Sam"',
    role: 'Loophole Architect',
    skill: '-25% Click Heat',
    description: 'He knows people who know people. Your aggressive user metrics are now technically "unintentional anomalies".',
    cost: 150000,
    bonusType: 'clickHeat',
    bonusValue: 0.25,
    image: '/lawyer_slippin_sam_1774464399064.png',
    tier: 'pro'
  },
  {
    id: 'lawyer_the_shark',
    name: '"The Shark"',
    role: 'Corporate Litigator',
    skill: '-35% Data Sale Heat',
    description: 'A cold-blooded machine. He silences regulators before they even finish their coffee.',
    cost: 1250000,
    bonusType: 'dataHeat',
    bonusValue: 0.35,
    image: '/lawyer_the_shark_1774464414942.png',
    tier: 'partner'
  },
  {
    id: 'lawyer_ironclad_irene',
    name: '"Ironclad Irene"',
    role: 'Defense Wall',
    skill: '50% Lawsuit Immunity',
    description: 'She is a literal fortress in a power suit. 50% chance that any negative regulatory event is simply ignored.',
    cost: 7500000,
    bonusType: 'lawsuitDefense',
    bonusValue: 0.50,
    image: '/lawyer_ironclad_irene_1774464429719.png',
    tier: 'partner'
  },
  {
    id: 'lawyer_the_ghost',
    name: '"The Ghost"',
    role: 'Legal Mastermind',
    skill: '-30% Global Heat Gen',
    description: 'He doesn\'t exist. His filings are encrypted. Your entire operation is now a legal enigma.',
    cost: 45000000,
    bonusType: 'globalGeneration',
    bonusValue: 0.30,
    image: '/lawyer_the_ghost_mastermind_1774464448591.png',
    tier: 'legendary'
  }
];
