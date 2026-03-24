export class RedNpc {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  delivered: boolean;
  
  constructor(startX: number, startY: number, targetX: number, targetY: number) {
    this.x = startX;
    this.y = startY;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = 0.08; // Faster than regular citizens
    this.delivered = false;
  }
  
  update(deltaTime: number): boolean {
    if (this.delivered) return true;
    
    const dx = this.targetX - this.x;
    const dy = this.targetY - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < 10) {
      this.delivered = true;
      return true;
    }
    
    // Move towards target
    this.x += (dx / distance) * this.speed * deltaTime;
    this.y += (dy / distance) * this.speed * deltaTime;
    
    return false;
  }
  
  render(ctx: CanvasRenderingContext2D) {
    // Draw cartoony red agent with briefcase
    ctx.save();
    
    // THICK OUTLINE
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;

    // Body (Red Suit)
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(this.x - 8, this.y - 10, 16, 20);
    ctx.strokeRect(this.x - 8, this.y - 10, 16, 20);
    
    // Head (Big Head Style)
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(this.x, this.y - 16, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(this.x - 3, this.y - 18, 1.5, 0, Math.PI * 2);
    ctx.arc(this.x + 3, this.y - 18, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Briefcase (TNT themed)
    ctx.fillStyle = '#000000';
    ctx.fillRect(this.x + 10, this.y - 6, 12, 10);
    ctx.strokeRect(this.x + 10, this.y - 6, 12, 10);
    
    // TNT Text on briefcase
    ctx.fillStyle = '#FF1744';
    ctx.font = 'bold 6px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('TNT', this.x + 16, this.y + 1);
    
    // Movement trail (Comic style lightning/sparks)
    if (Date.now() % 400 < 200) {
        ctx.strokeStyle = '#FFD700';
        ctx.beginPath();
        ctx.moveTo(this.x - 15, this.y - 5);
        ctx.lineTo(this.x - 25, this.y - 15);
        ctx.stroke();
    }
    
    ctx.restore();
  }
  
  isDelivered(): boolean {
    return this.delivered;
  }
}