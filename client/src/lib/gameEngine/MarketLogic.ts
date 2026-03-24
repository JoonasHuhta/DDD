/**
 * MarketLogic.ts
 * Sine-wave based market price fluctuation logic.
 */

export interface MarketPrices {
  behavioral: number;
  location: number;
  financial: number;
  biometric: number;
}

export class MarketLogic {
  private static readonly BASE_PRICES: MarketPrices = {
    behavioral: 10,
    location: 25,
    financial: 50,
    biometric: 100
  };

  private static readonly VOLATILITY: MarketPrices = {
    behavioral: 5,
    location: 10,
    financial: 20,
    biometric: 40
  };

  /**
   * Generates new market prices based on a sine wave and small randomness.
   * @param tick The current game tick or timestamp.
   */
  public static calculatePrices(tick: number): MarketPrices {
    const time = tick / 1000; // relative time in seconds
    
    return {
      behavioral: Math.max(1, Math.round(
        this.BASE_PRICES.behavioral + 
        Math.sin(time * 0.1) * this.VOLATILITY.behavioral + 
        (Math.random() - 0.5) * 2
      )),
      location: Math.max(1, Math.round(
        this.BASE_PRICES.location + 
        Math.sin(time * 0.07 + 1) * this.VOLATILITY.location + 
        (Math.random() - 0.5) * 5
      )),
      financial: Math.max(1, Math.round(
        this.BASE_PRICES.financial + 
        Math.sin(time * 0.05 + 2) * this.VOLATILITY.financial + 
        (Math.random() - 0.5) * 10
      )),
      biometric: Math.max(1, Math.round(
        this.BASE_PRICES.biometric + 
        Math.sin(time * 0.03 + 3) * this.VOLATILITY.biometric + 
        (Math.random() - 0.5) * 20
      ))
    };
  }
}
