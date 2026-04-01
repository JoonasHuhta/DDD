import { City } from "./City";
import { ELITES, EliteDefinition } from "./EliteRegistry";

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

  // ── ELITE FIELDS (Phase 1 infrastructure — non-breaking) ──────────────────
  public isElite: boolean = false;
  public eliteType: string = 'none';
  public resistance: number = 0;        // remaining resistance in seconds
  public maxResistance: number = 0;
  public lureAttempts: number = 0;
  public maxLureAttempts: number = 3;
  private eliteBehavior: string = 'normal';
  private eliteLifespanMs: number = 0;
  private eliteElapsedMs: number = 0;
  private eliteGlowColor: string = '#FFFFFF';
  private eliteSize: number = 1.0;       // Multiplier from registry
  private eliteSpeedMult: number = 1.0;
  // Posing state for 'posing' behavior
  private posingTimer: number = 0;
  private isPosing: boolean = false;
  private readonly POSE_INTERVAL = 5000;  // Pose every 5s
  private readonly POSE_DURATION = 3000;  // Hold pose for 3s
  private lastLuredTime: number = 0;
  // Jetset state
  public isJetsetLanding: boolean = false;
  public jetsetY: number = 0;            // Current Y during landing animation
  private jetsetLandedY: number = 0;

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

  // ── ELITE API ─────────────────────────────────────────────────────────────

  /** Apply an EliteDefinition to turn this citizen into an elite. */
  public applyEliteDefinition(def: EliteDefinition): void {
    this.isElite = true;
    this.eliteType = def.id;
    this.resistance = def.resistanceSec;
    this.maxResistance = def.resistanceSec;
    this.maxLureAttempts = def.maxAttempts;
    this.lureAttempts = 0;
    this.eliteBehavior = def.behavior;
    this.eliteLifespanMs = def.lifespanMs;
    this.eliteElapsedMs = 0;
    this.eliteGlowColor = def.glowColor;
    this.eliteSize = def.size;
    this.eliteSpeedMult = def.speed;
    // Override visual properties
    this.color = def.color;
    this.originalColor = def.color;
    this.size = (4 + Math.random() * 2) * def.size; // Base size * multiplier
    this.speed = this.speed * def.speed;
    // Jetset starts above screen
    if (def.behavior === 'jetset') {
      this.isJetsetLanding = true;
      this.jetsetY = -60;
      this.jetsetLandedY = this.y;
      this.y = -60;
    }
  }

  /**
   * Apply lure beam for deltaTime seconds.
   * Returns true when resistance reaches 0 (ready to hook).
   * Returns false if lure attempt failed (max attempts exceeded).
   */
  public applyLure(deltaSeconds: number): 'capturing' | 'captured' | 'failed' {
    if (!this.isElite) return 'captured'; // Non-elite: instant capture
    if (this.isHooked) return 'capturing';

    // Posing behavior: zero resistance during pose
    const effectiveDelta = (this.eliteBehavior === 'posing' && this.isPosing)
      ? deltaSeconds * 5  // 5× faster capture during selfie
      : deltaSeconds;

    this.resistance = Math.max(0, this.resistance - effectiveDelta);
    this.lastLuredTime = Date.now();

    if (this.resistance <= 0) return 'captured';
    return 'capturing';
  }

  /** Called when lure beam is removed before capture completes. */
  public onLureInterrupted(): void {
    if (!this.isElite) return;
    this.lureAttempts++;
    
    // Partial resistance restore (lose 30% progress on interruption)
    this.resistance = Math.min(this.maxResistance, this.resistance + this.maxResistance * 0.3);
    
    // Paranoid / fleeing behavior: flee faster after failed attempt
    if (this.eliteBehavior === 'paranoid' || this.eliteBehavior === 'fleeing' || this.eliteBehavior === 'suspicious') {
      this.speed *= 1.4; // Gain speed on every failed attempt
      this.setNewTarget(); // Panic and change direction
    }
  }

  /** Returns true if this elite has overstayed and should despawn. */
  public isExpired(): boolean {
    if (!this.isElite) return false;
    return this.eliteElapsedMs >= this.eliteLifespanMs;
  }

  /** Fraction of resistance remaining (1.0 = full, 0.0 = captured). */
  public getResistanceFraction(): number {
    if (this.maxResistance <= 0) return 0;
    return this.resistance / this.maxResistance;
  }

  /** Returns render-relevant info for the engine without exposing internals. */
  public getEliteRenderInfo(): {
    isElite: boolean; eliteType: string; glowColor: string;
    resistanceFraction: number; isPosing: boolean;
  } {
    return {
      isElite: this.isElite,
      eliteType: this.eliteType,
      glowColor: this.eliteGlowColor,
      resistanceFraction: this.getResistanceFraction(),
      isPosing: this.isPosing,
    };
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
    // ── ELITE: Use registry value ───────────────────────────────────────────
    if (this.isElite) {
      const def = ELITES.find(e => e.id === this.eliteType);
      return def ? def.userValue : 10;
    }
    // ────────────────────────────────────────────────────────────────────────

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
    // ── ELITE: track lifespan and posing state ──────────────────────────────
    if (this.isElite && !this.isHooked) {
      this.eliteElapsedMs += deltaTime;

      // Handle interrupted lure detection
      if (this.resistance < this.maxResistance && Date.now() - this.lastLuredTime > 500) {
        // We were being lured, but the beam is gone for 0.5s
        this.onLureInterrupted();
        this.lastLuredTime = Date.now(); // Reset so we don't spam it
      }

      // Jetset landing animation (descends from above screen)
      if (this.eliteBehavior === 'jetset' && this.isJetsetLanding) {
        const descentSpeed = 0.3;
        this.y += descentSpeed * deltaTime;
        if (this.y >= this.jetsetLandedY) {
          this.y = this.jetsetLandedY;
          this.isJetsetLanding = false;
        }
        // Don't apply normal movement while landing
        this.x = Math.max(10, Math.min(this.city.width - 10, this.x));
        return;
      }

      // Posing behavior — stop and "take selfie" periodically
      if (this.eliteBehavior === 'posing') {
        this.posingTimer += deltaTime;
        if (!this.isPosing && this.posingTimer > this.POSE_INTERVAL) {
          this.isPosing = true;
          this.posingTimer = 0;
        } else if (this.isPosing && this.posingTimer > this.POSE_DURATION) {
          this.isPosing = false;
          this.posingTimer = 0;
        }
        // Freeze movement during pose
        if (this.isPosing) {
          // Keep within bounds but don't move
          this.x = Math.max(10, Math.min(this.city.width - 10, this.x));
          this.y = Math.max(200, Math.min(this.city.height - 10, this.y));
          return;
        }
      }

      // Fleeing behavior: Run away from tower if being lured
      if (this.eliteBehavior === 'fleeing' && this.resistance < this.maxResistance) {
        const metamanX = this.city.width / 2;
        const dx = this.x - metamanX;
        // Direction away from Dan
        const fleeDir = dx >= 0 ? 1 : -1;
        this.x += fleeDir * this.speed * deltaTime * 1.5;
        this.y += (Math.random() - 0.5) * this.speed * deltaTime;
        
        // Don't use normal pathfinding while fleeing
        this.x = Math.max(10, Math.min(this.city.width - 10, this.x));
        this.y = Math.max(200, Math.min(this.city.height - 10, this.y));
        return;
      }

      // Suspicious behavior: Stops and stares at the tower
      if (this.eliteBehavior === 'suspicious') {
        const isStaring = (Math.floor(this.eliteElapsedMs / 4000) % 2 === 0);
        if (isStaring) {
          // Freeze and look at tower
          this.x = Math.max(10, Math.min(this.city.width - 10, this.x));
          this.y = Math.max(200, Math.min(this.city.height - 10, this.y));
          return;
        }
      }
      
      // Paranoid behavior: Erratic movement
      if (this.eliteBehavior === 'paranoid') {
        this.pathfindingTimer += deltaTime * 2; // Recalculate paths twice as fast
      }
    }
    // ────────────────────────────────────────────────────────────────────────

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
    
    // ── ELITE GENDER & AURA ─────────────────────────────────────────────────
    if (this.isElite && !this.isHooked) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.eliteGlowColor;
      
      // Suburban glow/aura
      ctx.beginPath();
      ctx.arc(this.x, this.y, headSize * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `${this.eliteGlowColor}33`; // 20% opacity
      ctx.fill();
    }

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

    // ── ELITE PROPS ─────────────────────────────────────────────────────────
    if (this.isElite && !this.isHooked) {
      // Draw smartphone
      ctx.fillStyle = '#333333';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      const phoneX = this.x + (this.isPosing ? -headSize/2 : headSize/3);
      const phoneY = this.y - headSize/2;
      ctx.fillRect(phoneX, phoneY, headSize/3, headSize/2);
      ctx.strokeRect(phoneX, phoneY, headSize/3, headSize/2);
      
      // Screen glow
      ctx.fillStyle = '#00FFFF';
      ctx.fillRect(phoneX + 1, phoneY + 1, headSize/3 - 2, headSize/2 - 2);

      // Selfie Flash Animation
      if (this.isPosing && (Math.floor(Date.now() / 200) % 5 === 0)) {
        ctx.beginPath();
        ctx.arc(phoneX, phoneY, headSize, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'white';
        ctx.fill();
      }
    }

    // ── RESISTANCE BAR ──────────────────────────────────────────────────────
    if (this.isElite && !this.isHooked && this.resistance < this.maxResistance) {
      const barWidth = headSize * 2;
      const barHeight = 6;
      const barX = this.x - barWidth/2;
      const barY = this.y - headSize - 15;

      // Background
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      
      // Progress
      const progress = 1 - this.getResistanceFraction();
      ctx.fillStyle = '#00FF00';
      if (progress > 0.8) ctx.fillStyle = '#FFD700'; // Gold when almost yours
      ctx.fillRect(barX, barY, barWidth * progress, barHeight);
      
      // Border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

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
