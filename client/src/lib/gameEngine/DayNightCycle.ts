export class DayNightCycle {
  private time: number = 0;
  private cycleLength: number = 60000; // 60 seconds for full cycle

  public update(deltaTime: number): void {
    this.time += deltaTime;
    if (this.time >= this.cycleLength) {
      this.time = 0;
    }
  }

  public getTimeOfDay(): number {
    return this.time / this.cycleLength;
  }

  public isNight(): boolean {
    const timeOfDay = this.getTimeOfDay();
    return timeOfDay > 0.7 || timeOfDay < 0.3;
  }

  public getBackgroundColor(): string {
    const timeOfDay = this.getTimeOfDay();
    
    if (timeOfDay < 0.2) {
      // Night
      return '#0a0a0a';
    } else if (timeOfDay < 0.3) {
      // Dawn
      return '#1a1a2e';
    } else if (timeOfDay < 0.7) {
      // Day
      return '#2c3e50';
    } else if (timeOfDay < 0.8) {
      // Dusk
      return '#1a1a2e';
    } else {
      // Night
      return '#0a0a0a';
    }
  }

  public renderOverlay(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const timeOfDay = this.getTimeOfDay();
    
    if (this.isNight()) {
      // Add slight blue tint for night
      ctx.fillStyle = 'rgba(0, 50, 100, 0.2)';
      ctx.fillRect(0, 0, width, height);
    }

    // Add time indicator
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    const timeText = this.isNight() ? 'NIGHT' : 'DAY';
    ctx.fillText(timeText, 40, 80); // Moved 20 pixels closer to middle
  }
}
