/**
 * The Detox Guy – GDD v2.0 (revised)
 * "You can't ban someone who was never here."
 *
 * - Walks in the SKY zone (between tower roof and clouds)
 * - Cannot be banned, bribed or stopped
 * - Longer pauses in vortex phase
 * - Citizens in aura are immediately blocked from luring
 */

export type DetoxPhase = 'whisper' | 'pull' | 'vortex' | 'silence';

export interface DetoxGuyUpdate {
  phase: DetoxPhase;
  phaseChanged: boolean;
  isFinished: boolean;
  /** 0.0–1.0 multiplier applied to campaign lure efficiency in aura */
  campaignEfficiency: number;
  auraRadius: number;
}

const PHASE_DURATIONS: Record<DetoxPhase, number> = {
  whisper: 25_000,  // 0–25s  – he arrives, barely noticeable
  pull:    35_000,  // 25–60s – aura grows, citizens drift
  vortex:  40_000,  // 60–100s – paused, strong pull, real threat
  silence: 6_000,   // ~6s walk-out
};

const PHASE_EFFICIENCY: Record<DetoxPhase, number> = {
  whisper: 0.75,
  pull:    0.50,
  vortex:  0.25,
  silence: 0.60,
};

const PHASE_RADIUS: Record<DetoxPhase, { max: number; start: number }> = {
  whisper: { start: 35,  max: 70  },
  pull:    { start: 70,  max: 140 },
  vortex:  { start: 140, max: 240 },
  silence: { start: 240, max: 0   },
};

export const OFFLINE_TOOLTIPS = [
  "This user is reading a book.",
  "This user is outside.",
  "This user baked bread.",
  "This user called their mother.",
  "This user went for a walk. They said it was nice.",
  "This user doesn't know what day it is on social media.\nThey say it's been wonderful.",
  "This user is thinking.\nNot about anything specific. Just thinking.",
  "This user looked at the sky.",
];

export class DetoxGuy {
  public x: number;
  public y: number;
  public phase: DetoxPhase = 'whisper';

  private phaseTimer: number = 0;
  private totalTimer: number = 0;
  private phaseChanged: boolean = false;
  private finished: boolean = false;

  /** Direction: -1 = walking left, +1 = walking right */
  private direction: number;
  /** Base walk speed px/ms – slow and deliberate */
  private readonly BASE_WALK_SPEED = 0.018;
  /** Aura animation pulse */
  private auraPulse: number = 0;
  /** Pause timer: in vortex phase he stops for up to 8 seconds at a time */
  private pauseTimer: number = 0;
  private readonly PAUSE_INTERVAL = 12_000;  // pause every 12s
  private readonly PAUSE_DURATION = 8_000;   // stand still for 8s
  private isPaused: boolean = false;

  /** Left/right bounce margin – stays within these bounds during play */
  private readonly MARGIN = 28;
  private canvasWidth: number;
  private canvasHeight: number;

  constructor(canvasWidth: number, canvasHeight: number) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;

    // Start just inside either edge so he's immediately visible
    if (Math.random() < 0.5) {
      this.x = canvasWidth - this.MARGIN;  // Right side, walking left
      this.direction = -1;
    } else {
      this.x = this.MARGIN;               // Left side, walking right
      this.direction = 1;
    }

    // SKY ZONE: 25%–40% from top, between clouds and tower roof
    this.y = canvasHeight * 0.27 + Math.random() * canvasHeight * 0.10;
  }

  public update(deltaTime: number): DetoxGuyUpdate {
    this.phaseChanged = false;
    this.phaseTimer += deltaTime;
    this.totalTimer += deltaTime;
    this.auraPulse += deltaTime * 0.002;

    // Phase transitions
    const phaseDuration = PHASE_DURATIONS[this.phase];
    if (this.phaseTimer >= phaseDuration) {
      this.phaseTimer = 0;
      this.phaseChanged = true;

      if      (this.phase === 'whisper') this.phase = 'pull';
      else if (this.phase === 'pull')    this.phase = 'vortex';
      else if (this.phase === 'vortex')  this.phase = 'silence';
      else if (this.phase === 'silence') this.finished = true;
    }

    // Movement – with deliberate pauses during vortex phase
    if (this.phase === 'vortex') {
      this.pauseTimer += deltaTime;
      if (!this.isPaused && this.pauseTimer >= this.PAUSE_INTERVAL) {
        this.isPaused = true;
        this.pauseTimer = 0;
      } else if (this.isPaused && this.pauseTimer >= this.PAUSE_DURATION) {
        this.isPaused = false;
        this.pauseTimer = 0;
      }
    } else {
      this.isPaused = false;
    }

    if (!this.isPaused) {
      let speedMult = 1.0;
      if (this.phase === 'vortex')  speedMult = 0.15;
      else if (this.phase === 'pull') speedMult = 0.55;
      this.x += this.direction * this.BASE_WALK_SPEED * deltaTime * speedMult;
    }

    // BOUNCE: during active phases (not silence), reverse at canvas edges
    if (this.phase !== 'silence') {
      if (this.x <= this.MARGIN) {
        this.x = this.MARGIN;
        this.direction = 1;
        // Subtle y drift on each bounce to feel organic
        this.y = Math.max(
          this.canvasHeight * 0.22,
          Math.min(this.canvasHeight * 0.40, this.y + (Math.random() - 0.5) * this.canvasHeight * 0.06)
        );
      } else if (this.x >= this.canvasWidth - this.MARGIN) {
        this.x = this.canvasWidth - this.MARGIN;
        this.direction = -1;
        this.y = Math.max(
          this.canvasHeight * 0.22,
          Math.min(this.canvasHeight * 0.40, this.y + (Math.random() - 0.5) * this.canvasHeight * 0.06)
        );
      }
    }
    // During 'silence' phase: walk off-screen in current direction (exit)

    return {
      phase: this.phase,
      phaseChanged: this.phaseChanged,
      isFinished: this.finished,
      campaignEfficiency: PHASE_EFFICIENCY[this.phase],
      auraRadius: this.getAuraRadius(),
    };
  }

  private getAuraRadius(): number {
    const { start, max } = PHASE_RADIUS[this.phase];
    const t = Math.min(1, this.phaseTimer / PHASE_DURATIONS[this.phase]);

    if (this.phase === 'silence') {
      return start * (1 - t);
    }
    return start + (max - start) * t;
  }

  public getAffectedArea(): { x: number; y: number; radius: number } {
    return { x: this.x, y: this.y, radius: this.getAuraRadius() };
  }

  public isFinished(): boolean {
    return this.finished;
  }

  /** Returns true if citizen at (cx, cy) is within the aura */
  public isInAura(cx: number, cy: number): boolean {
    const radius = this.getAuraRadius();
    const dx = cx - this.x;
    const dy = cy - this.y;
    return Math.sqrt(dx * dx + dy * dy) < radius;
  }

  /** Returns true if TDG is currently paused (standing still in vortex) */
  public isPausedNow(): boolean {
    return this.isPaused;
  }

  public getPhaseProgress(): number {
    return Math.min(1, this.phaseTimer / PHASE_DURATIONS[this.phase]);
  }

  // ─── RENDER ──────────────────────────────────────────────────────────────────

  public render(ctx: CanvasRenderingContext2D): void {
    if (this.finished) return;

    ctx.save();
    this.renderAura(ctx);
    this.renderSprite(ctx);
    ctx.restore();
  }

  private renderAura(ctx: CanvasRenderingContext2D): void {
    const radius = this.getAuraRadius();
    if (radius <= 0) return;

    const pulse = Math.sin(this.auraPulse) * 0.08 + 0.92;

    // Outer glow gradient (calm green/blue)
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, radius * pulse);
    grad.addColorStop(0,   'rgba(72, 199, 142, 0.20)');
    grad.addColorStop(0.5, 'rgba(60, 167, 219, 0.12)');
    grad.addColorStop(1,   'rgba(60, 167, 219, 0.0)');

    ctx.beginPath();
    ctx.arc(this.x, this.y, radius * pulse, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Soft ring
    ctx.strokeStyle = `rgba(72, 199, 142, ${0.28 * pulse})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Floating offline icons (pull+)
    if (this.phase === 'pull' || this.phase === 'vortex') {
      this.renderAuraIcons(ctx, radius * pulse);
    }
  }

  private renderAuraIcons(ctx: CanvasRenderingContext2D, radius: number): void {
    const icons = ['📵', '🌿', '📖', '☀️'];
    const count = this.phase === 'vortex' ? 6 : 3;

    ctx.save();
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < count; i++) {
      const angleOffset = (i / count) * Math.PI * 2 + this.auraPulse;
      const r = radius * 0.62;
      const ix = this.x + Math.cos(angleOffset) * r;
      const iy = this.y + Math.sin(angleOffset) * r * 0.45;
      ctx.globalAlpha = 0.50;
      ctx.fillText(icons[i % icons.length], ix, iy);
    }

    ctx.restore();
  }

  private renderSprite(ctx: CanvasRenderingContext2D): void {
    const size = 22;
    const sx = this.x;
    const sy = this.y;

    // Gentle bob – slower when paused
    const bobSpeed = this.isPaused ? 1.5 : 3;
    const walkBob = Math.sin(this.auraPulse * bobSpeed) * 1.5;

    ctx.save();
    ctx.translate(sx, sy + walkBob);

    if (this.direction === -1) {
      ctx.scale(-1, 1);
    }

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // Drop shadow
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.beginPath();
    ctx.ellipse(0, 2, size * 0.5, size * 0.12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Sandals
    ctx.fillStyle = '#c8a96e';
    ctx.fillRect(-size * 0.35, -size * 0.15, size * 0.28, size * 0.12);
    ctx.fillRect(size * 0.07,  -size * 0.15, size * 0.28, size * 0.12);

    // Legs – white linen
    ctx.fillStyle = '#f5f0e8';
    ctx.fillRect(-size * 0.28, -size * 0.55, size * 0.22, size * 0.42);
    ctx.fillRect(size * 0.05,  -size * 0.55, size * 0.22, size * 0.42);

    // Body – linen robe
    ctx.fillStyle = '#fafaf7';
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.roundRect(-size * 0.38, -size * 1.25, size * 0.76, size * 0.74, size * 0.06);
    ctx.fill();
    ctx.stroke();

    // Subtle linen texture
    ctx.strokeStyle = 'rgba(0,0,0,0.10)';
    ctx.lineWidth = 0.8;
    for (let l = 0; l < 3; l++) {
      const lx = -size * 0.2 + l * size * 0.2;
      ctx.beginPath();
      ctx.moveTo(lx, -size * 1.1);
      ctx.lineTo(lx, -size * 0.55);
      ctx.stroke();
    }
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;

    // Arms
    ctx.fillStyle = '#fde8c8';
    ctx.fillRect(-size * 0.6, -size * 1.15, size * 0.24, size * 0.45);
    ctx.fillRect(size * 0.36,  -size * 1.15, size * 0.24, size * 0.45);

    // Head
    ctx.fillStyle = '#fde8c8';
    ctx.strokeStyle = '#000';
    ctx.beginPath();
    ctx.arc(0, -size * 1.5, size * 0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Calm half-closed eyes
    ctx.fillStyle = '#4a3728';
    ctx.beginPath();
    ctx.ellipse(-size * 0.12, -size * 1.52, size * 0.06, size * 0.035, 0, 0, Math.PI * 2);
    ctx.ellipse( size * 0.12, -size * 1.52, size * 0.06, size * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();

    // Zen smile
    ctx.strokeStyle = '#a0522d';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -size * 1.42, size * 0.12, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Halo
    this.renderHalo(ctx, size);

    ctx.restore();
  }

  private renderHalo(ctx: CanvasRenderingContext2D, size: number): void {
    const haloR = size * 0.55;
    const iconCount = 6;
    ctx.save();
    ctx.font = `${Math.floor(size * 0.35)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const haloIcons = ['📵', '🌿', '☀️', '📖', '🍃', '⭕'];
    for (let i = 0; i < iconCount; i++) {
      const angle = (i / iconCount) * Math.PI * 2 + this.auraPulse * 0.7;
      const hx = Math.cos(angle) * haloR;
      const hy = -size * 1.88 + Math.sin(angle) * haloR * 0.3;
      ctx.globalAlpha = 0.7 + Math.sin(angle + this.auraPulse) * 0.3;
      ctx.fillText(haloIcons[i], hx, hy);
    }
    ctx.restore();
  }
}
