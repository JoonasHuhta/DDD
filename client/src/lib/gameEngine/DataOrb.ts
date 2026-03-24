export interface DataOrb {
  id: string;
  x: number;
  y: number;
  type: 'basic' | 'premium' | 'rare' | 'legendary';
  color: string;
  createdAt: number;
  lifespan: number; // 10 seconds
  vx: number; // velocity x
  vy: number; // velocity y
  collected: boolean;
}

export class DataOrbSystem {
  orbs: DataOrb[] = [];
  private orbIdCounter = 0;

  createOrb(x: number, y: number, type?: 'basic' | 'premium' | 'rare' | 'legendary'): DataOrb {
    // Random orb type if not specified
    if (!type) {
      const rand = Math.random();
      if (rand < 0.5) type = 'basic';
      else if (rand < 0.8) type = 'premium';
      else if (rand < 0.95) type = 'rare';
      else type = 'legendary';
    }
    
    // Diverse orb colors like the original system
    const colorMap = {
      'basic': '#06d6a0',     // cyan/green - data orbs
      'premium': '#f72585',   // pink/magenta - premium data
      'rare': '#ffd60a',      // yellow/gold - rare orbs
      'legendary': '#8338ec'  // purple - legendary orbs
    };
    
    const orb: DataOrb = {
      id: `orb_${this.orbIdCounter++}`,
      x,
      y,
      type,
      color: colorMap[type],
      createdAt: Date.now(),
      lifespan: 15000, // 15 seconds for easier collection
      vx: (Math.random() - 0.5) * 15, // Slower horizontal velocity
      vy: (Math.random() - 0.5) * 15, // Slower vertical velocity
      collected: false
    };
    
    this.orbs.push(orb);
    return orb;
  }

  update(deltaTime: number, canvasWidth: number, canvasHeight: number) {
    const now = Date.now();
    
    // Update orb positions and remove expired ones
    this.orbs = this.orbs.filter(orb => {
      if (orb.collected || (now - orb.createdAt) > orb.lifespan) {
        return false;
      }

      // Apply friction to slow down movement gradually
      const friction = 0.99;
      orb.vx *= friction;
      orb.vy *= friction;
      
      // Update position with slower movement - reduced vertical stretching
      orb.x += orb.vx * deltaTime * 0.01;
      orb.y += orb.vy * deltaTime * 0.005; // Reduced from 0.01 to 0.005 for less vertical stretching

      // Bounce off walls (restrict right side so orbs don't go under menu)
      const safeRightMargin = 100;
      if (orb.x <= 20 || orb.x >= canvasWidth - safeRightMargin) {
        orb.vx *= -0.8; // Some dampening
        orb.x = Math.max(20, Math.min(canvasWidth - safeRightMargin, orb.x));
      }
      if (orb.y <= 20 || orb.y >= canvasHeight - 20) {
        orb.vy *= -0.8;
        orb.y = Math.max(20, Math.min(canvasHeight - 20, orb.y));
      }

      return true;
    });
  }

  checkOrbClick(clickX: number, clickY: number): DataOrb | null {
    for (const orb of this.orbs) {
      const distance = Math.sqrt((clickX - orb.x) ** 2 + (clickY - orb.y) ** 2);
      if (distance <= 25) { // Larger 25px click radius for easier clicking
        orb.collected = true;
        return orb;
      }
    }
    return null;
  }

  render(ctx: CanvasRenderingContext2D) {
    const now = Date.now();
    
    this.orbs.forEach(orb => {
      if (orb.collected) return;

      const age = now - orb.createdAt;
      const lifeRatio = 1 - (age / orb.lifespan);
      const alpha = Math.max(0.3, lifeRatio); // Fade out as they expire
      
      // Pulsing effect
      const pulse = 1 + Math.sin(age * 0.005) * 0.3;
      const size = 18 * pulse; // Larger base size

      // Outer glow
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, size + 8, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, size + 8);
      gradient.addColorStop(0, `${orb.color}40`);
      gradient.addColorStop(1, `${orb.color}00`);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Main orb
      ctx.beginPath();
      ctx.arc(orb.x, orb.y, size, 0, Math.PI * 2);
      ctx.fillStyle = orb.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
      
      // Inner highlight
      ctx.beginPath();
      ctx.arc(orb.x - size * 0.3, orb.y - size * 0.3, size * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
      ctx.fill();

      // Expiration warning (red pulse when < 3 seconds left)
      if (lifeRatio < 0.3) {
        const warningAlpha = Math.sin(age * 0.02) * 0.5 + 0.5;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, size + 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 0, 0, ${warningAlpha * alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });
  }

  getOrbCount(): number {
    return this.orbs.length;
  }

  clear() {
    this.orbs = [];
  }
}