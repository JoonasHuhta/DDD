// Prestige system for advanced progression

export interface PrestigeState {
  influencePoints: number;
  totalLifetimeIncome: number;
  prestigeLevel: number;
  prestigeMultiplier: number;
  canPrestige: boolean;
}

export class PrestigeSystem {
  private static readonly PRESTIGE_THRESHOLD = 1e12; // $1 Trillion
  private static readonly INFLUENCE_MULTIPLIER = 0.1; // 10% per influence point

  static calculateInfluencePoints(totalLifetimeIncome: number): number {
    if (totalLifetimeIncome < this.PRESTIGE_THRESHOLD) return 0;
    return Math.floor(Math.sqrt(totalLifetimeIncome / this.PRESTIGE_THRESHOLD));
  }

  static calculatePrestigeMultiplier(influencePoints: number): number {
    return 1 + (influencePoints * this.INFLUENCE_MULTIPLIER);
  }

  static canPrestige(totalLifetimeIncome: number, currentInfluencePoints: number): boolean {
    const potentialPoints = this.calculateInfluencePoints(totalLifetimeIncome);
    return potentialPoints > currentInfluencePoints;
  }

  static getPrestigeGain(totalLifetimeIncome: number, currentInfluencePoints: number): number {
    const potentialPoints = this.calculateInfluencePoints(totalLifetimeIncome);
    return Math.max(0, potentialPoints - currentInfluencePoints);
  }

  static performPrestige(state: PrestigeState, resetCallback: () => void): PrestigeState {
    const newInfluencePoints = this.calculateInfluencePoints(state.totalLifetimeIncome);
    const newMultiplier = this.calculatePrestigeMultiplier(newInfluencePoints);
    
    // Reset game state
    resetCallback();
    
    return {
      ...state,
      influencePoints: newInfluencePoints,
      prestigeLevel: state.prestigeLevel + 1,
      prestigeMultiplier: newMultiplier,
      canPrestige: false
    };
  }
}