// RANDOM FUNNY LAWSUITS - Mid-game optional challenges
// These happen randomly but not too frequently, players can choose to ignore them

export interface RandomLawsuit {
  id: string;
  title: string;
  plaintiff: string;
  platform: string;
  claim: string;
  demandAmount: number;
  severity: 'light' | 'medium' | 'serious';
  consequences: {
    ignore: string;
    settle: string;
    fight: string;
  };
  settleCost: number;
  fightCost: number;
  fightSuccessChance: number; // 0-100
}

export const RANDOM_LAWSUITS: RandomLawsuit[] = [
  {
    id: 'snapface_karen',
    title: 'SnapFace Addiction Lawsuit',
    plaintiff: 'Karen "The Manager Summoner" Williams',
    platform: 'SnapFace',
    claim: 'SnapFace\'s endless story notifications made me miss my son\'s wedding because I was busy posting selfies with my avocado toast. My family disowned me, my plants died from neglect, and I\'ve developed chronic FOMO syndrome.',
    demandAmount: 2500000,
    severity: 'medium',
    consequences: {
      ignore: 'Karen posts angry reviews everywhere, small reputation hit',
      settle: 'Karen gets therapy money, case closed quietly',
      fight: 'Public trial becomes meme, either huge PR win or disaster'
    },
    settleCost: 50000,
    fightCost: 25000,
    fightSuccessChance: 70
  },
  {
    id: 'toktik_dancers',
    title: 'TokTik Dance Destruction',
    plaintiff: 'Professional Dancer Association',
    platform: 'TokTik',
    claim: 'TokTik\'s algorithm convinced millions that anyone can dance, flooding auditions with people doing "The Renegade" and destroying the sacred art of choreography.',
    demandAmount: 5000000,
    severity: 'serious',
    consequences: {
      ignore: 'Dancers protest outside your offices with interpretive dance',
      settle: 'Fund dance scholarships, gain cultural credibility',
      fight: 'Dance battle in court - literally'
    },
    settleCost: 100000,
    fightCost: 40000,
    fightSuccessChance: 60
  },
  {
    id: 'linkedout_bob',
    title: 'LinkedOut Motivation Overdose',
    plaintiff: 'Bob "Never Promoted" Henderson',
    platform: 'LinkedOut',
    claim: 'LinkedOut\'s motivational posts made me quit my stable job to become a "synergy consultant influencer," resulting in bankruptcy, homelessness, and an unhealthy obsession with posting inspirational sunrise photos.',
    demandAmount: 1800000,
    severity: 'medium',
    consequences: {
      ignore: 'Bob becomes anti-tech influencer, spreads negativity',
      settle: 'Bob gets new job, writes thank-you LinkedIn post',
      fight: 'Court case becomes LinkedIn case study'
    },
    settleCost: 35000,
    fightCost: 20000,
    fightSuccessChance: 75
  },
  {
    id: 'instabrag_mario',
    title: 'Instabrag Restaurant Ruin',
    plaintiff: 'Local Restaurant Owner Mario Pastalli',
    platform: 'Instabrag',
    claim: 'Instabrag influencers destroyed my authentic Italian restaurant by demanding free meals for "exposure," then posting photos calling my grandmother\'s secret sauce "mid." My nonna is rolling in her grave.',
    demandAmount: 3000000,
    severity: 'medium',
    consequences: {
      ignore: 'Italian food community boycotts your platform',
      settle: 'Mario gets promotion budget, becomes food influencer',
      fight: 'Nonna\'s ghost testifies via Ouija board'
    },
    settleCost: 60000,
    fightCost: 30000,
    fightSuccessChance: 65
  },
  {
    id: 'chirper_birds',
    title: 'Chirper Name Confusion',
    plaintiff: 'The Society of Actual Bird Watchers',
    platform: 'Chirper',
    claim: 'Chirper stole our name and made "tweeting" about angry political rants instead of beautiful birdsong, causing mass confusion at our annual convention when members started arguing about trending hashtags instead of discussing rare woodpecker sightings.',
    demandAmount: 800000,
    severity: 'light',
    consequences: {
      ignore: 'Bird watchers create competing platform "ActualChirper"',
      settle: 'Sponsor bird conservation, get nature cred',
      fight: 'Ornithologists expert testimony gets technical'
    },
    settleCost: 15000,
    fightCost: 10000,
    fightSuccessChance: 80
  },
  {
    id: 'mindspace_janet',
    title: 'MindSpace Productivity Paradox',
    plaintiff: 'Former Productivity Guru Janet Clockworth',
    platform: 'MindSpace',
    claim: 'MindSpace\'s productivity content made everyone so obsessed with optimization that they spent more time organizing their productivity apps than actually being productive, putting me out of business.',
    demandAmount: 2100000,
    severity: 'medium',
    consequences: {
      ignore: 'Janet starts "Digital Detox" movement against you',
      settle: 'Janet becomes your productivity consultant',
      fight: 'Ironic that fighting lawsuit reduces productivity'
    },
    settleCost: 45000,
    fightCost: 25000,
    fightSuccessChance: 70
  },
  {
    id: 'gamestream_agnes',
    title: 'GameStream Language Barrier',
    plaintiff: 'Mrs. Agnes Motherton, Neighborhood Watch Captain',
    platform: 'GameStream',
    claim: 'GameStream turned all the neighborhood kids into zombies who speak only in gaming acronyms like "GG," "noob," and "pwned." I can no longer understand what they\'re saying, and they\'ve started a Minecraft village in my backyard.',
    demandAmount: 1500000,
    severity: 'light',
    consequences: {
      ignore: 'Agnes forms "Parents Against Gaming Acronyms" group',
      settle: 'Fund community center with gaming translation classes',
      fight: 'Kids testify in court using only gaming terms'
    },
    settleCost: 25000,
    fightCost: 15000,
    fightSuccessChance: 85
  },
  {
    id: 'foodiegram_gordon',
    title: 'FoodieGram Cold Food Crisis',
    plaintiff: 'Chef Gordon Rampage',
    platform: 'FoodieGram',
    claim: 'FoodieGram users won\'t stop taking photos of their food before eating, causing restaurants worldwide to serve cold meals and creating a generation that values Instagram likes over actual taste.',
    demandAmount: 4000000,
    severity: 'serious',
    consequences: {
      ignore: 'Gordon creates "Hot Food First" movement',
      settle: 'Partner with restaurants for "Photo-Ready Hot Food" campaign',
      fight: 'Gordon brings blowtorch to court for dramatic effect'
    },
    settleCost: 80000,
    fightCost: 50000,
    fightSuccessChance: 55
  },
  {
    id: 'rideshare_cabs',
    title: 'RideShare Social Disruption',
    plaintiff: 'Yellow Cab Drivers Union',
    platform: 'RideShare Social',
    claim: 'RideShare Social turned every car owner into a part-time taxi driver and social media influencer, flooding the streets with amateur drivers posting selfies while driving and making actual professional drivers obsolete.',
    demandAmount: 10000000,
    severity: 'serious',
    consequences: {
      ignore: 'Cab drivers organize honking protests outside your building',
      settle: 'Fund driver retraining programs, gain union support',
      fight: 'Epic courtroom battle about the gig economy future'
    },
    settleCost: 150000,
    fightCost: 75000,
    fightSuccessChance: 45
  },
  {
    id: 'fitnesstracker_couch',
    title: 'FitnessTracker+ Couch Potato Rights',
    plaintiff: 'Couch Potato Coalition (CPC)',
    platform: 'FitnessTracker+',
    claim: 'FitnessTracker+ shamed us into thinking 10,000 steps per day is "normal," causing mass anxiety among professional couch enthusiasts and destroying the sacred art of binge-watching. Our members now suffer from chronic step-counting syndrome.',
    demandAmount: 2700000,
    severity: 'medium',
    consequences: {
      ignore: 'CPC organizes "Sitting Strike" protest (very effective)',
      settle: 'Add "Couch Mode" to app, embrace lazy lifestyle',
      fight: 'Fitness vs. Laziness debate becomes cultural phenomenon'
    },
    settleCost: 55000,
    fightCost: 35000,
    fightSuccessChance: 75
  }
];

// Lawsuit timing and frequency management
export class RandomLawsuitManager {
  private lastLawsuitTime: number = 0;
  private readonly MIN_INTERVAL = 15 * 60 * 1000; // REDUCED FREQUENCY: 15 minutes minimum (was 3)
  private readonly MAX_INTERVAL = 30 * 60 * 1000; // REDUCED FREQUENCY: 30 minutes maximum (was 10)
  private usedLawsuits: Set<string> = new Set();

  shouldTriggerLawsuit(currentTime: number, userCount: number): boolean {
    // Don't trigger if too soon, or if user count too low
    if (userCount < 1000 || currentTime - this.lastLawsuitTime < this.MIN_INTERVAL) {
      return false;
    }

    // Calculate probability based on time elapsed and user count
    const timeElapsed = currentTime - this.lastLawsuitTime;
    const probability = Math.min(0.1, (timeElapsed / this.MAX_INTERVAL) * 0.05 + (userCount / 50000) * 0.02);
    
    return Math.random() < probability;
  }

  getRandomLawsuit(): RandomLawsuit | null {
    const availableLawsuits = RANDOM_LAWSUITS.filter(lawsuit => !this.usedLawsuits.has(lawsuit.id));
    
    if (availableLawsuits.length === 0) {
      // Reset if all lawsuits have been used
      this.usedLawsuits.clear();
      return this.getRandomLawsuit();
    }

    const lawsuit = availableLawsuits[Math.floor(Math.random() * availableLawsuits.length)];
    this.usedLawsuits.add(lawsuit.id);
    this.lastLawsuitTime = Date.now();
    
    return lawsuit;
  }

  handleLawsuitResolution(lawsuitId: string, resolution: 'ignore' | 'settle' | 'fight', success?: boolean): {
    cost: number;
    outcome: string;
    reputationChange: number;
  } {
    const lawsuit = RANDOM_LAWSUITS.find(l => l.id === lawsuitId);
    if (!lawsuit) return { cost: 0, outcome: 'Lawsuit not found', reputationChange: 0 };

    switch (resolution) {
      case 'ignore':
        return {
          cost: 0,
          outcome: lawsuit.consequences.ignore,
          reputationChange: -5 // Small reputation hit
        };
      
      case 'settle':
        return {
          cost: lawsuit.settleCost,
          outcome: lawsuit.consequences.settle,
          reputationChange: 2 // Small reputation gain for being responsible
        };
      
      case 'fight':
        const won = success !== undefined ? success : Math.random() * 100 < lawsuit.fightSuccessChance;
        return {
          cost: won ? lawsuit.fightCost : lawsuit.fightCost + (lawsuit.demandAmount * 0.1), // 10% of demand if you lose
          outcome: won ? `Victory! ${lawsuit.consequences.fight}` : `Loss! ${lawsuit.consequences.fight} - Had to pay partial damages`,
          reputationChange: won ? 10 : -15 // Big swing based on outcome
        };
    }
  }
}