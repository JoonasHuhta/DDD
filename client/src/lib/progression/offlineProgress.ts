// Offline progression system

export interface OfflineProgress {
  timeAway: number; // milliseconds
  incomeEarned: number;
  maxOfflineHours: number;
  offlineMultiplier: number;
}

export class OfflineProgressSystem {
  private static readonly MAX_OFFLINE_HOURS = 4;
  private static readonly MS_PER_HOUR = 3600000;

  static calculateOfflineProgress(
    lastSaveTime: number,
    currentTime: number,
    incomePerSecond: number,
    offlineMultiplier: number = 1
  ): OfflineProgress {
    const timeAway = currentTime - lastSaveTime;
    const hoursAway = timeAway / this.MS_PER_HOUR;
    
    // Cap offline time to maximum
    const effectiveHours = Math.min(hoursAway, this.MAX_OFFLINE_HOURS);
    const effectiveTime = effectiveHours * this.MS_PER_HOUR;
    
    // Calculate income earned during offline time
    const baseIncome = (effectiveTime / 1000) * incomePerSecond;
    const incomeEarned = baseIncome * offlineMultiplier;

    return {
      timeAway,
      incomeEarned,
      maxOfflineHours: this.MAX_OFFLINE_HOURS,
      offlineMultiplier
    };
  }

  static shouldShowOfflinePopup(timeAway: number): boolean {
    // Show popup if away for more than 5 minutes
    return timeAway > 300000;
  }

  static formatOfflineTime(timeAway: number): string {
    const hours = Math.floor(timeAway / this.MS_PER_HOUR);
    const minutes = Math.floor((timeAway % this.MS_PER_HOUR) / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}