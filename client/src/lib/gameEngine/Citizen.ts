import { City } from "./City";

export class Citizen {
  private x: number;
  private y: number;
  private targetX: number;
  private targetY: number;
  private speed: number;
  private color: string;
  
  public getColor(): string {
    return this.color;
  }
  
  private originalColor: string;
  private size: number;
  private city: City;
  private pathfindingTimer: number = 0;
  private isHooked: boolean = false;
  private skyscraperTarget: { x: number, y: number } | null = null;
  public userCountFromEngine: number = 0; // Will be set by the game engine

  constructor(x: number, y: number, city: City) {
    this.x = x;
    this.y = y;
    this.targetX = x;
    this.targetY = y;
    this.city = city;
    // Five different speed categories for realistic movement
    const speedTypes = [0.01, 0.025, 0.04, 0.06, 0.08]; // Very slow to fast
    this.speed = speedTypes[Math.floor(Math.random() * speedTypes.length)];
    this.color = this.getRandomColor();
    this.originalColor = this.color;
    this.size = 4 + Math.random() * 4;
    this.setNewTarget();
  }

  // PROGRESSIVE USER LURING: Determine citizen type and color based on user count
  private getRandomColor(): string {
    // Get current user count from game state (approximated from citizen behavior)
    const currentUsers = this.estimateCurrentUsers();
    
    // FIXED: Keep more colorful variety while adding progressive rewards
    if (currentUsers < 50) {
      // Early game: colorful mix with mostly lower-value citizens
      const earlyGameColors = [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',  // Original colorful citizens (1 user each)
        '#4A90E2', '#4A90E2',                        // Blue engaged citizens (2 users each)
        '#A0A0A0'                                     // Light gray citizens (1 user) - MORE VISIBLE
      ];
      return earlyGameColors[Math.floor(Math.random() * earlyGameColors.length)];
    } else if (currentUsers < 100) {
      // Mid game: introduce high-value citizens while keeping colors
      const midGameColors = [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',  // Original colors (1 user each)
        '#4A90E2', '#4A90E2', '#4A90E2',            // More blue engaged (2 users each)
        '#E74C3C', '#E74C3C',                        // Red addicted citizens (3 users each)
        '#B0B0B0'                                     // Light gray regulars (1 user) - MORE VISIBLE
      ];
      return midGameColors[Math.floor(Math.random() * midGameColors.length)];
    } else if (currentUsers < 1000) {
      // Late game: More high-value citizens
      const lateGameColors = [
        '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4',  // Original colors (1 user each) - 20%
        '#4A90E2', '#4A90E2',                        // Blue engaged (2 users each) - 20%
        '#E74C3C', '#E74C3C', '#E74C3C', '#E74C3C', // Red addicted (3 users each) - 40%
        '#F1C40F', '#F1C40F', '#F1C40F',            // Gold whales (5 users each) - 30%
        '#9B59B6', '#9B59B6'                         // Purple influencers (8 users each) - 20%
      ];
      return lateGameColors[Math.floor(Math.random() * lateGameColors.length)];
    } else {
      // EXPONENTIAL EXPLOSION: Ultra high-value citizens after 1000+ users
      const explosionColors = [
        '#ff6b6b', '#4ecdc4',                        // Original colors (1 user each) - 10%
        '#4A90E2',                                   // Blue engaged (2 users each) - 5%
        '#E74C3C', '#E74C3C',                        // Red addicted (3 users each) - 20%
        '#F1C40F', '#F1C40F', '#F1C40F', '#F1C40F', // Gold whales (5 users each) - 40%
        '#9B59B6', '#9B59B6', '#9B59B6',            // Purple influencers (8 users each) - 30%
        '#FF1493', '#FF1493'                         // Pink ultra-whales (15 users each) - 10%
      ];
      return explosionColors[Math.floor(Math.random() * explosionColors.length)];
    }
  }

  // Estimate current user count from game context
  private estimateCurrentUsers(): number {
    // This will be overridden when the engine passes the actual count
    return this.userCountFromEngine || 0;
  }

  // Get user value based on citizen color (progressive rewards)
  public getUserValue(): number {
    switch (this.color) {
      // Ultra high-value citizens (exponential system)
      case '#FF1493': return 15; // Pink - Ultra-whale (15 users) - NEW!
      case '#9B59B6': return 8;  // Purple - Influencer (8 users)
      case '#F1C40F': return 5;  // Gold - Whale (5 users)
      case '#E74C3C': return 3;  // Red - Addicted (3 users)
      case '#4A90E2': return 2;  // Blue - Engaged (2 users)
      case '#808080': return 1;  // Gray - Regular (1 user)
      case '#A0A0A0': return 1;  // Light Gray - Regular (1 user) - MORE VISIBLE
      case '#B0B0B0': return 1;  // Light Gray - Regular (1 user) - MORE VISIBLE
      
      // Original colorful citizens (maintain game fun) - all worth 1 user but keep variety
      case '#ff6b6b': return 1;  // Original red
      case '#4ecdc4': return 1;  // Original teal
      case '#45b7d1': return 1;  // Original blue
      case '#96ceb4': return 1;  // Original green
      case '#ffeaa7': return 1;  // Original yellow
      case '#dda0dd': return 1;  // Original purple
      case '#98d8c8': return 1;  // Original mint
      case '#f7dc6f': return 1;  // Original gold
      
      default: return 1;         // Fallback for any other colors
    }
  }

  private setNewTarget(): void {
    const streetPositions = this.city.getStreetPositions();
    let attempts = 0;
    let validTarget = false;
    
    // Try to find a target that doesn't collide with tower
    while (!validTarget && attempts < 10) {
      const randomTarget = streetPositions[Math.floor(Math.random() * streetPositions.length)];
      const targetX = randomTarget.x + Math.random() * 50;
      const targetY = randomTarget.y + Math.random() * 50;
      
      if (!this.checkTowerCollision(targetX, targetY)) {
        this.targetX = targetX;
        this.targetY = targetY;
        validTarget = true;
      }
      attempts++;
    }
    
    // If no valid target found, use a safe fallback away from tower
    if (!validTarget) {
      const centerX = this.city.width / 2;
      if (this.x < centerX) {
        // Go to left side
        this.targetX = 100 + Math.random() * 200;
      } else {
        // Go to right side  
        this.targetX = this.city.width - 300 + Math.random() * 200;
      }
      this.targetY = 300 + Math.random() * 200;
    }
  }

  public update(deltaTime: number): void {
    if (this.isHooked && this.skyscraperTarget) {
      // Move directly toward skyscraper when hooked
      const dx = this.skyscraperTarget.x - this.x;
      const dy = this.skyscraperTarget.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 5) {
        // Different citizens move at different speeds to tower - realistic variation
        const hookedSpeedMultiplier = 3 + Math.random() * 2; // 3x to 5x speed when hooked
        this.x += (dx / distance) * this.speed * deltaTime * hookedSpeedMultiplier;
        this.y += (dy / distance) * this.speed * deltaTime * hookedSpeedMultiplier;
      } else {
        // Reached skyscraper - mark for collection
        return;
      }
    } else {
      // Normal citizen behavior - calculate intended movement
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 2) {
        // Calculate next position
        const nextX = this.x + (dx / distance) * this.speed * deltaTime;
        const nextY = this.y + (dy / distance) * this.speed * deltaTime;
        
        // Check tower collision before moving
        if (!this.checkTowerCollision(nextX, nextY)) {
          this.x = nextX;
          this.y = nextY;
        } else {
          // Tower is blocking path, find new target away from tower
          this.setNewTarget();
        }
      } else {
        this.setNewTarget();
      }

      // Periodic pathfinding update
      this.pathfindingTimer += deltaTime;
      if (this.pathfindingTimer > 3000 + Math.random() * 2000) {
        this.setNewTarget();
        this.pathfindingTimer = 0;
      }
    }

    // Keep within bounds
    this.x = Math.max(10, Math.min(this.city.width - 10, this.x));
    this.y = Math.max(200, Math.min(this.city.height - 10, this.y));
  }

  // Check if citizen would collide with the tower at given position
  private checkTowerCollision(x: number, y: number): boolean {
    const centerX = this.city.width / 2;
    // Updated tower width to match mobile scaling (80 * 1.8 = 144)
    const baseWidth = 80;
    const towerWidth = Math.floor(baseWidth * 1.8); // Match mobile tower scaling
    const towerHeight = 350; // Base tower height
    const towerLeft = centerX - towerWidth / 2;
    const towerRight = centerX + towerWidth / 2;
    const towerTop = this.city.height - towerHeight;
    const towerBottom = this.city.height;
    
    // Add small buffer around citizen (citizen radius ~5px)
    const buffer = 8;
    
    return (x + buffer > towerLeft && 
            x - buffer < towerRight && 
            y + buffer > towerTop && 
            y - buffer < towerBottom);
  }

  public render(ctx: CanvasRenderingContext2D): void {
    const headSize = this.size * 1.5;
    const bodyWidth = this.size;
    const bodyHeight = this.size * 1.2;
    
    // Outer thick black outline for the whole character
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    // Hooked glow
    if (this.isHooked) {
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#4ECDC4';
    }

    // DRAW BODY
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - bodyWidth/2, this.y, bodyWidth, bodyHeight);
    ctx.strokeRect(this.x - bodyWidth/2, this.y, bodyWidth, bodyHeight);
    
    // DRAW HEAD (Big Head Style)
    ctx.beginPath();
    ctx.arc(this.x, this.y - headSize/4, headSize/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Simple Eyes
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(this.x - headSize/5, this.y - headSize/3, headSize/8, 0, Math.PI * 2);
    ctx.arc(this.x + headSize/5, this.y - headSize/3, headSize/8, 0, Math.PI * 2);
    ctx.fill();
    
    // Wide Grin
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y - headSize/4, headSize/4, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.stroke();

    // Reset shadow
    ctx.shadowBlur = 0;
  }

  public hook(skyscraperX: number, skyscraperY: number): void {
    this.isHooked = true;
    this.color = '#00bfff'; // Electric blue
    this.skyscraperTarget = { x: skyscraperX, y: skyscraperY };
  }

  public isCollected(): boolean {
    if (!this.isHooked || !this.skyscraperTarget) return false;
    const dx = this.skyscraperTarget.x - this.x;
    const dy = this.skyscraperTarget.y - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= 5;
  }

  public getPosition(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }

  public getHookedState(): boolean {
    return this.isHooked;
  }
}
