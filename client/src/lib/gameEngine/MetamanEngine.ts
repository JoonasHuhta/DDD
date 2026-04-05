import { City } from "./City";
import { Metaman } from "./Metaman";
import { Citizen } from "./Citizen";
import { DayNightCycle } from "./DayNightCycle";
import { ElectricLure } from "./ElectricLure";
import { CampaignSystem, CAMPAIGNS } from "./CampaignSystem";
import { BasementView } from "./BasementView";
import { RedNpc } from "./RedNpc";
import { ELITES, getSpawnableElites, pickWeightedElite } from "./EliteRegistry";
import { useMetamanGame } from '../stores/useMetamanGame';

export class MetamanEngine {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private city: City;
  private metaman: Metaman;
  private citizens: Citizen[];
  private citizenPool: Citizen[] = []; // Object Pool for GC optimization
  private dayNightCycle: DayNightCycle;
  private electricLure: ElectricLure;
  private campaignSystem: CampaignSystem;
  private basementView: BasementView;
  private currentView: 'city' | 'basement' = 'city';
  private lastTime: number = 0;
  private towerHeight: number = 1;
  
  private onIncomeUpdate?: (amount: number) => void;
  private onUsersUpdate?: (amount: number) => void;
  private onRegulatoryRiskUpdate?: (risk: number) => void;
  private onCampaignCooldownUpdate?: (campaignId: string, cooldown: number) => void;
  private onDataInventoryUpdate?: (amount: number) => void;
  private onOrbsInventoryUpdate?: (amount: number) => void;
  private onCampaignChargesUpdate?: (charges: number) => void;
  private onLawsuitDelivered?: () => void;
  private onLawsuitProgress?: (progress: number) => void;
  private onAddEffect?: (type: 'money' | 'users' | 'purchase' | 'achievement', x: number, y: number, intensity: 'low' | 'medium' | 'high' | 'extreme', value: string) => void;
  private redNpc: RedNpc | null = null;
  private lastBasementOrbSpawn = 0;
  private hasSpawnedRedNpc: boolean = false;
  private userCount: number = 0;
  private isMobile: boolean = false;
  // VAN SYSTEM: Appears every 5 minutes, parks near screen edge
  private danVan: { 
    x: number; 
    y: number; 
    visible: boolean; 
    targetX: number; 
    animating: boolean; 
    lastAppearance: number;
    parked: boolean;
  } | null = null;
  private readonly VAN_INTERVAL = 5 * 60 * 1000; // 5 minutes in milliseconds
  private lastEmptyStreetTime: number = 0;
  private readonly WAVE_SPAWN_THRESHOLD = 800; // 0.8 seconds of empty street triggers a wave
  private clouds: { x: number; y: number; scale: number; speed: number }[] = [];

  // ── ELITE SYSTEM ──────────────────────────────────────────────────────
  private eliteSpawnTimer: number = 0;
  private readonly ELITE_SPAWN_CHECK_MS = 30000; // Check every 30 seconds
  private activeBaits: string[] = [];            // Set from store via setActiveBaits()
  private currentLureTargetId: number | null = null; // Index of citizen being actively lured
  private onEliteSpawned?: (eliteType: string, notification: string) => void;
  private onEliteCollected?: (eliteType: string) => void;
  private onJournalistBecamesThreat?: () => void;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number, isMobile: boolean = false) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.isMobile = isMobile;
    
    this.city = new City(width, height);
    // Position Metaman at the top of the central skyscraper
    this.metaman = new Metaman(width / 2, this.calculateMetamanY()); 
    this.citizens = [];
    this.dayNightCycle = new DayNightCycle();
    this.electricLure = new ElectricLure();
    this.campaignSystem = new CampaignSystem();
    this.basementView = new BasementView();

    // Audio Context removed for mobile stability - use centralized useAudio instead

    // VAN SYSTEM COMPLETELY DISABLED - no initialization
    this.danVan = null;

    // Initialize clouds with randomized positions and speeds
    this.clouds = [
      { x: 100, y: 150, scale: 1.2, speed: 0.02 + Math.random() * 0.03 },
      { x: width - 200, y: 100, scale: 0.8, speed: 0.01 + Math.random() * 0.02 },
      { x: width / 2 + 100, y: 200, scale: 1.0, speed: 0.015 + Math.random() * 0.025 },
      { x: width * 0.2, y: 80, scale: 0.9, speed: 0.01 + Math.random() * 0.015 },
      { x: width * 0.8, y: 180, scale: 1.1, speed: 0.02 + Math.random() * 0.02 }
    ];

    // Initialize citizens
    this.spawnCitizens();
  }

  private calculateMetamanY(): number {
    const baseTowerHeight = 350; // Base skyscraper height from City.ts
    const dynamicHeight = baseTowerHeight + (this.towerHeight - 1) * 40;
    // Position Dan exactly on the roof. 
    // Character's base is footY, which should be the top of the tower.
    return this.height - dynamicHeight; 
  }

  private spawnCitizens(): void {
    // EMERGENCY FIX: Limit maximum citizens to prevent memory leak
    const MAX_CITIZENS = 60; // Increased limit
    if (this.citizens.length >= MAX_CITIZENS) {
      console.log(`Citizen limit reached (${this.citizens.length}), cleaning up newest extras`);
      this.citizens = this.citizens.slice(0, MAX_CITIZENS);
    }
    
    const citizenCount = Math.min(45, MAX_CITIZENS - this.citizens.length); 
    for (let i = 0; i < citizenCount; i++) {
      // Spawn citizens on streets
      const streetPositions = this.city.getStreetPositions();
      const randomStreet = streetPositions[Math.floor(Math.random() * streetPositions.length)];
      
      const citizen = this.getPooledCitizen(
        randomStreet.x + Math.random() * 50,
        randomStreet.y + Math.random() * 50
      );
      this.citizens.push(citizen);
    }
  }

  private getPooledCitizen(x: number, y: number): Citizen {
    if (this.citizenPool.length > 0) {
      const citizen = this.citizenPool.pop()!;
      citizen.reset(x, y);
      return citizen;
    }
    return new Citizen(x, y, this.city);
  }

  public update(): void {
    const currentTime = performance.now();
    if (this.lastTime === 0) {
      this.lastTime = currentTime;
      return;
    }
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    // Update Dan (Metaman) animation
    if (this.metaman) {
      this.metaman.update(deltaTime);
    }

    // Update day/night cycle
    this.dayNightCycle.update(deltaTime);

    // Update electric lure effects
    this.electricLure.update();

    // Update basement view
    if (this.currentView === 'basement') {
      this.basementView.update(deltaTime, this.width, this.height);
      
      // Automatically spawn orbs in basement every 2-3 seconds
      const timeSinceLastSpawn = currentTime - this.lastBasementOrbSpawn;
      if (timeSinceLastSpawn > 2000 + Math.random() * 1000) { // 2-3 seconds
        this.basementView.spawnDataOrb(1);
        this.lastBasementOrbSpawn = currentTime;
        console.log('🔮 Basement orb spawned automatically');
      }
    }

    // Update background clouds
    this.clouds.forEach(cloud => {
      // Slow drift
      cloud.x += cloud.speed * (deltaTime / 16.7);
      
      // Wrap around screen
      if (cloud.x > this.width + 150) {
        cloud.x = -150;
      }
    });

    // Update citizens and collect hooked ones
    const citizensToRemove: number[] = [];
    this.citizens.forEach((citizen, index) => {
      citizen.update(deltaTime);
      
      if (citizen.isCollected()) {
        citizensToRemove.push(index);
        // Only give money when citizens arrive at tower (not from manual clicks)
        if (this.onIncomeUpdate) {
          const baseIncome = 1500;
          this.onIncomeUpdate(baseIncome);
          // Floating "pill" particles removed per user request for more integrated HUD feedback
        }
        // User rewards handled in the progressive loop below
        // This avoids double-counting and allows proper scaling particles
        // Spawn data orb in basement
        this.basementView.spawnDataOrb(1);
        this.playCollectSound();
        
        // Dan's catchphrase for successful lures with more variety
        const successMessages = [
          "🎉 Ding Ding Ding! - Dopamine Dealer Dan successfully lured a user!",
          "Another one bites the dust! Welcome to the ecosystem!",
          "Ka-ching! Fresh meat for the algorithm!",
          "Gotcha! Another soul captured by the endless scroll!",
          "Sweet victory! They're hooked and they don't even know it!",
          "Boom! User acquired! Dan's methods never fail!"
        ];
        const message = successMessages[Math.floor(Math.random() * successMessages.length)];
        console.log(message);
      }
    });

    // PROGRESSIVE USER LURING: Remove collected citizens and grant variable user rewards
    citizensToRemove.reverse().forEach(index => {
      const citizen = this.citizens[index];

      // ── ELITE COLLECTION: fire callback, skip normal user reward scaling ──
      if (citizen.isElite) {
        console.log(`[ELITE] 🏆 ${citizen.eliteType} reached the tower!`);
        if (this.onEliteCollected) {
          this.onEliteCollected(citizen.eliteType);
        }
        // Elites still grant base users via getUserValue() — but not exponential scaling
        if (this.onUsersUpdate) {
          const eliteUsers = citizen.getUserValue() * 5;
          this.onUsersUpdate(eliteUsers);
          this.userCount += eliteUsers;
        }
        const removed = this.citizens.splice(index, 1)[0];
        if (removed) this.citizenPool.push(removed);
        return;
      }
      // ─────────────────────────────────────────────────────────────────────

      // Get progressive user value based on citizen color/type
      const userReward = citizen.getUserValue();
      
      // EXPONENTIAL USER VALUE SCALING: Much higher rewards after 1000 users
      let baseBonus = userReward * 3; // 3x multiplier base
      
      // EXPONENTIAL EXPLOSION: Massive user value multipliers after 1k users
      if (this.userCount >= 1000) {
        const exponentialScale = Math.min(50, Math.floor(this.userCount / 1000) * 5 + 10); // 10x at 1k, up to 50x
        baseBonus = userReward * exponentialScale;
      }
      
      const exponentialBonus = this.userCount >= 100 ? 
        Math.floor(baseBonus * (1 + Math.log10(this.userCount / 100) * 0.8)) : baseBonus;
      
      if (this.onUsersUpdate) {
        let finalBonus = exponentialBonus;
        
        if (this.userCount >= 1000) {
          const milestoneBonus = Math.floor(exponentialBonus * 0.5);
          finalBonus += milestoneBonus;
        }
        
        this.onUsersUpdate(finalBonus);
        this.userCount += finalBonus;
      }
      
      const removed = this.citizens.splice(index, 1)[0];
      if (removed) this.citizenPool.push(removed);
    });

    // ── ELITE: Remove expired elites that timed out ───────────────────────
    for (let i = this.citizens.length - 1; i >= 0; i--) {
      const c = this.citizens[i];
      if (c.isElite && c.isExpired() && !c.getHookedState()) {
        console.log(`[ELITE] ${c.eliteType} left the street (timed out).`);
        const removed = this.citizens.splice(i, 1)[0];
        if (removed) this.citizenPool.push(removed);
      }
    }

    // ── ELITE: Periodic spawn check ───────────────────────────────────────
    this.eliteSpawnTimer += deltaTime;
    if (this.eliteSpawnTimer >= this.ELITE_SPAWN_CHECK_MS && this.currentView === 'city') {
      this.eliteSpawnTimer = 0;
      // Only spawn if no elite is currently on the street
      const hasElite = this.citizens.some(c => c.isElite);
      if (!hasElite && Math.random() < 0.4) { // 40% chance per check = ~every ~75s average
        this.spawnElite();
      }
    }


    
    // Update Red NPC if active
    if (this.redNpc) {
      const delivered = this.redNpc.update(deltaTime);
      
      // Calculate and report progress (distance to target)
      const dx = this.redNpc.targetX - this.redNpc.x;
      const dy = this.redNpc.targetY - this.redNpc.y;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      // Larry spawns at edge (~600px away), normalize progress 0-100
      const progress = Math.max(0, Math.min(100, 100 - (currentDist / 6))); 
      if (this.onLawsuitProgress) this.onLawsuitProgress(progress);

      if (delivered && this.onLawsuitDelivered) {
        this.onLawsuitDelivered();
        this.redNpc = null; // Remove Red NPC after delivery
        console.log("⚖️ Larry successfully served the papers!");
      }
    }

    // Update Dan's van animation with parking logic
    if (this.danVan && this.danVan.animating) {
      const speed = 3; // Slightly faster for better visual feedback
      const distance = this.danVan.targetX - this.danVan.x;
      
      if (Math.abs(distance) > speed) {
        this.danVan.x += distance > 0 ? speed : -speed;
      } else {
        this.danVan.x = this.danVan.targetX;
        this.danVan.animating = false;
        
        // Mark as parked when it reaches the target near right screen edge
        if (this.danVan.targetX > this.width - 200) {
          this.danVan.parked = true;
          console.log('🚐 Van parked near right screen edge - available for 30 seconds');
        }
      }
    }

    // Check van schedule periodically
    // Van scheduling disabled - controlled by black market state only

    // DYNAMIC SPAWN: Increase rate if population is getting low
    const baseSpawnRate = 0.003; 
    let dynamicSpawnRate = this.userCount > 50 ? baseSpawnRate * 2 : baseSpawnRate;
    
    // Low population acceleration
    if (this.citizens.length < 15) {
      dynamicSpawnRate = 0.02; // 2.0% chance when sparse
    }
    
    // CRITICAL: Clean up dead/off-screen citizens before spawning new ones
    for (let i = this.citizens.length - 1; i >= 0; i--) {
      const pos = this.citizens[i].getPosition();
      const isVisible = pos.x > -150 && pos.x < this.width + 150 && 
                        pos.y > -150 && pos.y < this.height + 150;
      if (!isVisible) {
        const removed = this.citizens.splice(i, 1)[0];
        if (removed) this.citizenPool.push(removed);
      }
    }
    
    // WAVE SPAWNING: If the street is empty or nearly empty, trigger a refill
    if (this.citizens.length < 5 && this.currentView === 'city') {
      if (this.lastEmptyStreetTime === 0) {
        this.lastEmptyStreetTime = currentTime;
      } else if (currentTime - this.lastEmptyStreetTime > this.WAVE_SPAWN_THRESHOLD) {
        console.log("🌊 Street sparse - triggering citizen refill!");
        this.spawnCitizens();
        this.lastEmptyStreetTime = 0;
      }
    } else {
      this.lastEmptyStreetTime = 0;
    }
    
    // BALANCED SPAWN
    if (Math.random() < dynamicSpawnRate && this.citizens.length < 40) { 
      const streetPositions = this.city.getStreetPositions();
      const randomStreet = streetPositions[Math.floor(Math.random() * streetPositions.length)];
      const newCitizen = this.getPooledCitizen(
        randomStreet.x + Math.random() * 50,
        randomStreet.y + Math.random() * 50
      );
      newCitizen.userCountFromEngine = this.userCount;
      this.citizens.push(newCitizen);
    }
    
    // PERFORMANCE FIX: Enforce maximum citizen count by returning extras to pool
    const citizenLimit = this.currentView === 'basement' ? 15 : 40; 
    
    if (this.citizens.length > citizenLimit) {
      const removed = this.citizens.splice(citizenLimit);
      removed.forEach(c => this.citizenPool.push(c));
    }
    
    // TUTORIAL: Spawn Red NPC for lawsuit demonstration (trigger after 300 users reached)
    if (!this.redNpc && !this.hasSpawnedRedNpc && this.getUsers() >= 300) {
      this.spawnRedNpc();
      this.hasSpawnedRedNpc = true;
    }
  }

  public render(): void {
    if (this.currentView === 'basement') {
      // Render basement view
      this.basementView.render(this.ctx, this.width, this.height);
    } else {
      // Render city view
      // COMIC STYLE: Bright sky blue background
      this.ctx.fillStyle = '#87CEEB';
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Render simple cartoon city silhouette at the very far back
      this.renderBackgroundSilhouette();

      // Render city with mobile flag
      this.city.render(this.ctx, this.dayNightCycle.isNight(), this.towerHeight, this.isMobile);

      // Render citizens
      this.citizens.forEach(citizen => {
        citizen.render(this.ctx);
      });

      // Render Red NPC if active
      if (this.redNpc) {
        this.redNpc.render(this.ctx);
      }

      // Render day/night overlay before Metaman
      this.dayNightCycle.renderOverlay(this.ctx, this.width, this.height);

      // Campaign visual effects are handled internally

      // Render Metaman LAST so it appears on top of the tower
      this.metaman.render(this.ctx, this.isMobile);

      // Render electric lure effects (moved to foreground per user request)
      this.electricLure.render(this.ctx);

      // Render cooldown indicator
      this.renderCooldownIndicator();

      // Render Dan's van LAST so it appears above HUDs
      if (this.danVan && this.danVan.visible) {
        this.renderDanVan();
      }
    }
  }

  public setActiveBaits(baits: string[]): void {
    this.activeBaits = baits;
  }

  public handleClick(x: number, y: number, campaignId: string, campaignCharges: number = 5): boolean {
    if (this.currentView === 'basement') {
      // ENHANCED: Basement orb collection gives both data AND orbs
      const collectedOrb = this.basementView.handleClick(x, y);
      if (collectedOrb) {
        // Give both data and orbs to player
        const dataValue = collectedOrb.value;
        const orbsValue = collectedOrb.orbs;
        
        if (this.onDataInventoryUpdate) this.onDataInventoryUpdate(dataValue);
        if (this.onOrbsInventoryUpdate) this.onOrbsInventoryUpdate(orbsValue);
        
        this.playCollectSound();
        console.log(`${collectedOrb.type.toUpperCase()} orb collected: +${dataValue} data, +${orbsValue} orbs`);
        return true;
      }
      return false;
    } else {
      // Handle city campaign casting
      const campaign = this.campaignSystem.getCampaignById(campaignId);
      if (!campaign) return false;
      
      // Check if has charges instead of cooldown
      if (campaignCharges <= 0) {
        console.log(`${campaign.name} no charges remaining`);
        return false;
      }

      console.log(`${campaign.name} cast at: ${x}, ${y} (${campaignCharges} charges remaining)`);
      
      // Campaigns are now free - no cost deduction
      
      // Get Metaman's phone position for lure start point
      const lureOrigin = this.metaman.getItemPosition(this.isMobile);
      
      // Create electric lure effect with campaign color and radius
      this.electricLure.addLure(lureOrigin.x, lureOrigin.y, x, y, campaign.color, campaign.radius);
      
      // Elite Scan Handling
      if (campaignId === 'elite_scan') {
        console.log('[ELITE] Scan initiated — searching for high-value targets...');
        this.spawnElite(); // Force an elite spawn check
        this.metaman.setPhoneEmoji('📡', 1000); 
        // No normal citizens hooked
      } else {
        // Hook nearby citizens based on campaign effectiveness
        const hookedCount = this.hookNearbyCitizens(x, y, campaign);
        
        // Dan's catchphrase when campaigns are successful
        if (hookedCount > 0) {
          console.log(`🎯 Ding Ding Ding! - Campaign "${campaign.name}" hooked ${hookedCount} citizens!`);
        }
      }
      
      // Use campaign (updates risk but not cooldown since we use charges)
      this.campaignSystem.useCampaign(campaignId);
      
      // Update regulatory risk
      if (this.onRegulatoryRiskUpdate) {
        this.onRegulatoryRiskUpdate(this.campaignSystem.getRiskPercentage());
      }
      
      // Deduct one charge instead of cooldown
      if (this.onCampaignChargesUpdate) {
        this.onCampaignChargesUpdate(campaignCharges - 1);
      }
      
      // Play zap sound
      this.playZapSound();
      
      // Make Metaman react to clicks
      this.metaman.onClick();
      this.metaman.setPhoneEmoji('⚡', 600); // ⚡ on screen during luring
      
      return true;
    }
  }

  public triggerMetamanSmile(duration: number = 8000): void {
    if (this.metaman) {
      this.metaman.triggerSmile(duration);
      this.metaman.setPhoneEmoji('💰', duration);
    }
  }

  public triggerCelebration(duration: number = 8000): void {
    if (this.metaman) {
      this.metaman.setPhoneEmoji('🥳', duration);
      this.metaman.triggerSmile(duration);
      this.playCelebrationSound();
    }
  }

  public triggerRegulatoryAlert(duration: number = 2000): void {
    if (this.metaman) {
      this.metaman.setPhoneEmoji('🚨', duration);
    }
  }

  public triggerMeltingFace(duration: number = 3000): void {
    if (this.metaman) {
      this.metaman.setPhoneEmoji('\u{1FAE0}', duration);
    }
  }

  // ── ELITE PUBLIC API ───────────────────────────────────────────────

  public setOnEliteSpawned(cb: (eliteType: string, notification: string) => void): void {
    this.onEliteSpawned = cb;
  }

  public setOnEliteCollected(cb: (eliteType: string) => void): void {
    this.onEliteCollected = cb;
  }

  public setOnJournalistThreat(cb: () => void): void {
    this.onJournalistBecamesThreat = cb;
  }

  /** Called from store/GameCanvas when Dark Web baits change. */

  /** Manually spawn an elite of a specific type (for bait-triggered spawns). */
  public spawnElite(eliteId?: string): void {
    const stage = Math.max(1, Math.floor(Math.log10(Math.max(10, this.userCount))));
    const candidates = getSpawnableElites(stage, this.userCount, this.activeBaits);

    let def = eliteId ? ELITES.find(e => e.id === eliteId) : pickWeightedElite(candidates);
    if (!def) {
      console.log('[ELITE] No eligible elite for current stage/baits.');
      return;
    }

    // Pick a random street position, away from edges
    const streetPositions = this.city.getStreetPositions();
    if (streetPositions.length === 0) return;
    const pos = streetPositions[Math.floor(Math.random() * streetPositions.length)];

    const elite = this.getPooledCitizen(
      pos.x + (Math.random() - 0.5) * 80,
      pos.y + (Math.random() - 0.5) * 30
    );
    elite.userCountFromEngine = this.userCount;
    elite.applyEliteDefinition(def);
    this.citizens.push(elite);

    console.log(`[ELITE] Spawned: ${def.name} (tier ${def.tier}) on street.`);
    if (this.onEliteSpawned) {
      this.onEliteSpawned(def.id, def.notification);
    }
  }

  private hookNearbyCitizens(clickX: number, clickY: number, campaign: any): number {
    const metamanPos = this.metaman.getPosition();
    let hookedCount = 0;
    let targetCount = campaign.citizenCount;
    
    // CRITICAL HIT SYSTEM: 15% chance for critical strikes (normal citizens only)
    const isCritical = Math.random() < 0.15;
    if (isCritical) {
      targetCount = Math.floor(targetCount * 1.8);
    }
    
    // Find eligible citizens within range
    const eligible = this.citizens
      .filter(c => !c.getHookedState())
      .map(c => {
        const pos = c.getPosition();
        const dist = Math.sqrt(
          Math.pow(pos.x - clickX, 2) + Math.pow(pos.y - clickY, 2)
        );
        return { citizen: c, distance: dist };
      })
      .filter(({ distance }) => distance <= campaign.radius)
      .sort((a, b) => a.distance - b.distance);

    let normalHooked = 0;
    for (const { citizen } of eligible) {
      // ── ELITE HANDLING ─────────────────────────────────────────────
      if (citizen.isElite) {
        // Beam hit: reduce resistance by ~0.5s per click
        const result = citizen.applyLure(0.5);
        if (result === 'captured') {
          citizen.hook(metamanPos.x, metamanPos.y);
          hookedCount++;
          console.log(`[ELITE] ${citizen.eliteType} captured! Resistance depleted.`);
          
          // REWARD: Connect to store
          if (citizen.eliteType) {
            useMetamanGame.getState().collectElite(citizen.eliteType);
          }
        } else {
          const pct = Math.round((1 - citizen.getResistanceFraction()) * 100);
          console.log(`[ELITE] ${citizen.eliteType} resist ${pct}% depleted — keep applying!`);
        }
        // Don't count elite lures against normal targetCount
        continue;
      }
      // ── NORMAL CITIZEN HANDLING ─────────────────────────────────────
      if (normalHooked < targetCount) {
        citizen.hook(metamanPos.x, metamanPos.y);
        normalHooked++;
        hookedCount++;
      }
    }
    
    if (isCritical && normalHooked > 0) {
      console.log(`🎯 CRITICAL HIT! ${campaign.name}: Hooked ${hookedCount} citizens!`);
    } else if (normalHooked > 0) {
      console.log(`${campaign.name}: Hooked ${hookedCount}/${targetCount} targets in ${campaign.radius}px radius`);
    }
    
    return hookedCount;
  }
  
  public playPlopSound(): void {
    try {
      const { useAudio } = require("../stores/useAudio");
      useAudio.getState().playPlop();
    } catch (e) {
      console.warn("Audio trigger failed:", e);
    }
  }

  public triggerConfetti(x: number, y: number): void {
    if (this.onAddEffect) {
      this.onAddEffect('confetti' as any, x, y, 'medium', '');
    }
  }

  private playZapSound(): void {
    // Sound generation removed for mobile compatibility. Use useAudio.tsx instead.
  }

  private playCollectSound(): void {
    // Mobile stability: Sound generation removed.
  }

  private playLawsuitAlertSound(): void {
    // Mobile stability: Sound generation removed.
  }

  private playSirens(): void {
    // Mobile stability: Sound generation removed.
  }

  private playHornSound(): void {
    // Mobile stability: Sound generation removed.
  }

  private playCelebrationSound(): void {
    // Mobile stability: Sound generation removed.
  }

  private renderCooldownIndicator(): void {
    // This is now handled by the UI panel
    // Individual campaign cooldowns are shown in the campaign buttons
  }

  private renderDanVan(): void {
    if (!this.danVan) return;
    
    const ctx = this.ctx;
    const x = this.danVan.x;
    const y = this.danVan.y;
    
    // Van body (white)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, 45, 25);
    
    // Van outline 
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, 45, 25);
    
    // Van windows (dark blue)
    ctx.fillStyle = '#1A1A2E';
    ctx.fillRect(x + 5, y + 3, 12, 8);
    ctx.fillRect(x + 28, y + 3, 12, 8);
    
    // Wheels
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(x + 8, y + 28, 4, 0, Math.PI * 2);
    ctx.arc(x + 37, y + 28, 4, 0, Math.PI * 2);
    ctx.fill();
    
    // Red accent (danger vibes)
    ctx.fillStyle = '#DC143C';
    ctx.fillRect(x + 20, y + 12, 5, 3);
    
    // Suspicious antenna
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 22, y);
    ctx.lineTo(x + 22, y - 8);
    ctx.stroke();
    
    // Van is now nameless - no text displayed
  }

  private renderBackgroundSilhouette(): void {
    const ctx = this.ctx;
    
    // --- CLOUDS ---
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const drawCloud = (x: number, y: number, scale: number) => {
      ctx.beginPath();
      ctx.arc(x, y, 20 * scale, 0, Math.PI * 2);
      ctx.arc(x + 25 * scale, y - 10 * scale, 25 * scale, 0, Math.PI * 2);
      ctx.arc(x + 50 * scale, y, 20 * scale, 0, Math.PI * 2);
      ctx.fill();
    };
    
    this.clouds.forEach(cloud => {
      drawCloud(cloud.x, cloud.y, cloud.scale);
    });

    // --- FAR SILHOUETTE (Lighter) ---
    ctx.fillStyle = '#7ac9e8'; 
    const farWidths = [120, 150, 100, 180, 130];
    const farHeights = [100, 150, 120, 160, 110];
    
    for (let i = 0; i < 10; i++) {
        const x = i * 200 - 100;
        const w = farWidths[i % farWidths.length];
        
        // Skip central area (clear zone for DOPA tower)
        const towerCenter = this.width / 2;
        const skipBuffer = this.width * 0.4; // 80% total clearance zone
        const towerLeft = towerCenter - skipBuffer;
        const towerRight = towerCenter + skipBuffer;
        if ((x + w > towerLeft && x < towerRight)) continue;

        const h = farHeights[i % farHeights.length];
        const y = this.height - h - 50; 
        
        ctx.fillRect(x, y, w, h + 50);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h + 50);
    }

    // --- NEAR SILHOUETTE (Darker) ---
    ctx.fillStyle = '#6abada'; 
    const nearWidths = [80, 110, 70, 130, 90];
    const nearHeights = [180, 240, 210, 260, 200];
    
    for (let i = 0; i < 15; i++) {
        const x = i * 150 - 50;
        const w = nearWidths[i % nearWidths.length];
        
        // Skip central area (clear zone for DOPA tower)
        const towerCenter = this.width / 2;
        const skipBuffer = this.width * 0.35; 
        const towerLeft = towerCenter - skipBuffer;
        const towerRight = towerCenter + skipBuffer;
        if ((x + w > towerLeft && x < towerRight)) continue;

        const h = nearHeights[i % nearHeights.length];
        const y = this.height - h;
        
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
    }
  }

  // ENHANCED VAN SYSTEM: 5-minute intervals, proper parking near screen edge
  public setDanVanVisibility(visible: boolean): void {
    // VAN SYSTEM DISABLED until properly triggered by black market unlock
    if (!visible) {
      // Force hide van completely
      if (this.danVan) {
        this.danVan.visible = false;
        this.danVan.animating = false;
        this.danVan.x = -200; // Move far off-screen
      }
      return;
    }
    
    // Only show van if explicitly requested with visible=true
    if (visible && this.danVan) {
      console.log('🚐 Black Market Van arriving - Dan is ready for business!');
      this.danVan.visible = true;
      this.danVan.x = this.width + 150;
      this.danVan.targetX = this.width - 80;
      this.danVan.animating = true;
      this.playHornSound();
    }
  }

  // Check if it's time for van to appear (every 5 minutes)
  public checkVanSchedule(): void {
    // VAN SYSTEM DISABLED - controlled by black market state only
    return;
  }

  // Manual van trigger - DISABLED, controlled by black market unlock
  public triggerFirstVanIfReady(gameStartTime: number): void {
    // VAN SYSTEM DISABLED - only appears when black market is unlocked
    return;
  }

  public setCallbacks(
    onIncomeUpdate: (amount: number) => void, 
    onUsersUpdate: (amount: number) => void,
    onRegulatoryRiskUpdate?: (risk: number) => void,
    onCampaignCooldownUpdate?: (campaignId: string, cooldown: number) => void,
    onDataInventoryUpdate?: (amount: number) => void,
    onCampaignChargesUpdate?: (charges: number) => void,
    onLawsuitDelivered?: () => void,
    onLawsuitProgress?: (progress: number) => void,
    onOrbsInventoryUpdate?: (amount: number) => void,
    onAddEffect?: (type: 'money' | 'users' | 'purchase' | 'achievement', x: number, y: number, intensity: 'low' | 'medium' | 'high' | 'extreme', value: string) => void
  ): void {
    this.onIncomeUpdate = onIncomeUpdate;
    this.onUsersUpdate = onUsersUpdate;
    this.onRegulatoryRiskUpdate = onRegulatoryRiskUpdate;
    this.onCampaignCooldownUpdate = onCampaignCooldownUpdate;
    this.onDataInventoryUpdate = onDataInventoryUpdate;
    this.onCampaignChargesUpdate = onCampaignChargesUpdate;
    this.onLawsuitDelivered = onLawsuitDelivered;
    this.onLawsuitProgress = onLawsuitProgress;
    this.onOrbsInventoryUpdate = onOrbsInventoryUpdate;
    this.onAddEffect = onAddEffect;
  }

  public getRegulatoryRisk(): number {
    return this.campaignSystem.getRiskPercentage();
  }

  public setCurrentView(view: 'city' | 'basement'): void {
    this.currentView = view;
  }

  public getCurrentView(): 'city' | 'basement' {
    return this.currentView;
  }
  
  public spawnRedNpc(): void {
    // Fixed: Spawn Red NPC from edge of screen towards tower base (ground level)
    const towerX = this.width / 2;
    const towerY = this.height - 50; // Ground level at tower base
    const startX = Math.random() < 0.5 ? 0 : this.width;
    const startY = Math.random() * this.height;
    
    this.redNpc = new RedNpc(startX, startY, towerX, towerY);
    console.log("Red NPC spawned - lawsuit delivery imminent!");
  }

  public bribeLarry(): void {
    if (this.redNpc) {
      this.redNpc.bribe();
    }
  }
  
  public getUsers(): number {
    return this.userCount;
  }

  public setTowerHeight(height: number): void {
    const baseSkyscraperHeight = 350; 
    const additionalHeight = (height - 1) * 40;
    this.towerHeight = Math.max(1, height);
    
    // Update existing Metaman position instead of recreating instance (stops flickering)
    const newY = this.height - baseSkyscraperHeight - additionalHeight;
    this.metaman.setPosition(this.width / 2, newY);
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.city.resize(width, height);
    // Update Metaman position with new dimensions
    this.setTowerHeight(this.towerHeight);
  }

  public getTowerHeight(): number {
    return this.towerHeight;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHeight(): number {
    return this.height;
  }
}
