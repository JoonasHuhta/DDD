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

  public bribe(): void {
    // Reset Larry to screen edge when bribed
    const fromLeft = this.x < 100; // Guessing origin if near edge
    this.x = fromLeft ? -50 : 1200; // Off-screen reset
    this.speed = Math.max(0.02, this.speed * 0.7); // Slow down significantly
    console.log("💼 LARRY: 'Fine... I'll take a coffee break.' (Slower speed: " + this.speed + ")");
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
    // Draw cartoony red agent (The Lawyer) with briefcase
    ctx.save();
    
    // Drop Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 12, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // THICK OUTLINE
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'round';

    // 1. Body (Sharp Red Suit)
    ctx.fillStyle = '#dc2626'; // Vibrant Red
    // Suit Jacket
    ctx.beginPath();
    ctx.roundRect(this.x - 10, this.y - 12, 20, 24, 4);
    ctx.fill();
    ctx.stroke();

    // White Shirt & Black Tie (Detail)
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(this.x - 4, this.y - 12);
    ctx.lineTo(this.x, this.y - 6);
    ctx.lineTo(this.x + 4, this.y - 12);
    ctx.closePath();
    ctx.fill();
    
    // Tie
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 10);
    ctx.lineTo(this.x, this.y - 2);
    ctx.stroke();

    // 2. Head (Stern/Angry Face)
    ctx.fillStyle = '#fbbf24'; // Golden skin
    ctx.beginPath();
    ctx.arc(this.x, this.y - 20, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Stern Brows (The "Angry" part)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    // Left brow
    ctx.beginPath();
    ctx.moveTo(this.x - 6, this.y - 25);
    ctx.lineTo(this.x - 1, this.y - 22);
    ctx.stroke();
    // Right brow
    ctx.beginPath();
    ctx.moveTo(this.x + 6, this.y - 25);
    ctx.lineTo(this.x + 1, this.y - 22);
    ctx.stroke();

    // Squinting Eyes
    ctx.fillStyle = 'black';
    ctx.fillRect(this.x - 5, this.y - 21, 3, 2);
    ctx.fillRect(this.x + 2, this.y - 21, 3, 2);

    // Grumpy Mouth line
    ctx.beginPath();
    ctx.moveTo(this.x - 4, this.y - 15);
    ctx.quadraticCurveTo(this.x, this.y - 17, this.x + 4, this.y - 15);
    ctx.stroke();

    // 3. Briefcase (Premium Business Look)
    ctx.fillStyle = '#262626'; // Deep Black/Gray
    ctx.beginPath();
    ctx.roundRect(this.x + 12, this.y - 4, 16, 12, 2);
    ctx.fill();
    ctx.stroke();
    
    // Briefcase Handle
    ctx.beginPath();
    ctx.arc(this.x + 20, this.y - 4, 4, Math.PI, 0);
    ctx.stroke();
    
    ctx.restore();
  }
  
  isDelivered(): boolean {
    return this.delivered;
  }
}