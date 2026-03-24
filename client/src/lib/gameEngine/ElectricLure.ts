export interface LureEffect {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  startTime: number;
  duration: number;
  color: string;
  radius: number;
}

export class ElectricLure {
  private effects: LureEffect[] = [];
  private nextId: number = 0;

  public addLure(startX: number, startY: number, endX: number, endY: number, color: string = '#00bfff', radius: number = 100): void {
    const effect: LureEffect = {
      id: this.nextId++,
      startX,
      startY,
      endX,
      endY,
      startTime: Date.now(),
      duration: 1000, // 1 second
      color,
      radius
    };
    this.effects.push(effect);
  }

  public update(): void {
    const currentTime = Date.now();
    this.effects = this.effects.filter(effect => 
      currentTime - effect.startTime < effect.duration
    );
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const currentTime = Date.now();
    
    this.effects.forEach(effect => {
      const elapsed = currentTime - effect.startTime;
      const progress = Math.min(elapsed / effect.duration, 1);
      const alpha = 1 - progress;
      
      // Animated electric line
      this.renderElectricLine(ctx, effect, alpha, progress);
      
      // Sparkle effect at end point
      this.renderSparkle(ctx, effect.endX, effect.endY, alpha);
    });
  }

  private renderElectricLine(ctx: CanvasRenderingContext2D, effect: LureEffect, alpha: number, progress: number): void {
    const { startX, startY, endX, endY, color } = effect;
    
    // Parse color for rgba conversion
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    
    // Multiple lightning branches for electric effect
    for (let i = 0; i < 3; i++) {
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha * (0.8 - i * 0.2)})`;
      ctx.lineWidth = 4 - i;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      
      // Create zigzag lightning effect
      const segments = 8;
      for (let j = 1; j <= segments; j++) {
        const segmentProgress = j / segments;
        const x = startX + (endX - startX) * segmentProgress;
        const y = startY + (endY - startY) * segmentProgress;
        
        // Add random deviation for lightning effect
        const deviation = (Math.sin(progress * 10 + j) * 10) * (1 - segmentProgress);
        const devX = x + Math.cos(j) * deviation;
        const devY = y + Math.sin(j) * deviation;
        
        ctx.lineTo(devX, devY);
      }
      
      ctx.stroke();
    }
  }

  private renderSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, alpha: number): void {
    const sparkleCount = 8;
    const sparkleLength = 15;
    
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < sparkleCount; i++) {
      const angle = (i / sparkleCount) * Math.PI * 2;
      const length = sparkleLength * (0.5 + Math.random() * 0.5);
      
      const startX = x + Math.cos(angle) * 5;
      const startY = y + Math.sin(angle) * 5;
      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;
      
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
    
    // Central glow - use white for visibility
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
    
    // Add radius indicator circle
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2); // Fixed radius for visualization
    ctx.stroke();
  }
}