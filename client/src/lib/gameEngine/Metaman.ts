export class Metaman {
  private x: number;
  private y: number;
  private animationFrame: number = 0;
  private lastClick: number = 0;
  private smileTimer: number = 0;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  public getPosition(): { x: number, y: number } {
    return { x: this.x, y: this.y };
  }

  public update(deltaTime: number): void {
    this.animationFrame += deltaTime * 0.005;
    if (this.smileTimer > 0) {
      this.smileTimer -= deltaTime;
    }
  }

  public render(ctx: CanvasRenderingContext2D, isMobile: boolean = false): void {
    ctx.save();
    
    // We want 'y' to be the ground/roof level.
    // The character will be rendered upwards from this point.
    const baseSize = isMobile ? 45 : 40; 
    const size = baseSize;
    const footY = this.y;
    const skinColor = '#ffccbc'; // Natural skin tone (peach) to match ears and hands
    
    const outlineWidth = 3;
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = outlineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    // --- LEGS & BOOTS ---
    ctx.fillStyle = '#1a1a1a'; // Black boots
    // Left Boot
    ctx.fillRect(this.x - size * 0.4, footY - size * 0.2, size * 0.35, size * 0.2);
    ctx.strokeRect(this.x - size * 0.4, footY - size * 0.2, size * 0.35, size * 0.2);
    // Right Boot
    ctx.fillRect(this.x + size * 0.05, footY - size * 0.2, size * 0.35, size * 0.2);
    ctx.strokeRect(this.x + size * 0.05, footY - size * 0.2, size * 0.35, size * 0.2);

    // Blue Jeans
    ctx.fillStyle = '#3f51b5';
    ctx.fillRect(this.x - size * 0.3, footY - size * 0.6, size * 0.6, size * 0.4);
    ctx.strokeRect(this.x - size * 0.3, footY - size * 0.6, size * 0.6, size * 0.4);

    // --- ARBS & BODY ---
    // Yellow sweater
    ctx.fillStyle = '#fbc02d';
    // Left Arm
    ctx.fillRect(this.x - size * 0.6, footY - size * 1.1, size * 0.3, size * 0.5);
    ctx.strokeRect(this.x - size * 0.6, footY - size * 1.1, size * 0.3, size * 0.5);
    // Right Arm (holding remote)
    ctx.fillStyle = '#fbc02d'; // Arm is sweater color
    ctx.fillRect(this.x + size * 0.3, footY - size * 1.1, size * 0.6, size * 0.25);
    ctx.strokeRect(this.x + size * 0.3, footY - size * 1.1, size * 0.6, size * 0.25);
    
    // Hands
    ctx.fillStyle = '#ffccbc'; 
    ctx.beginPath();
    ctx.arc(this.x - size * 0.45, footY - size * 0.55, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.x + size * 0.9, footY - size * 0.97, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Torso (Sweater)
    ctx.fillStyle = '#fbc02d';
    ctx.fillRect(this.x - size * 0.4, footY - size * 1.2, size * 0.8, size * 0.7);
    ctx.strokeRect(this.x - size * 0.4, footY - size * 1.2, size * 0.8, size * 0.7);
    
    // V-pattern
    ctx.strokeStyle = '#f9a825';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x - size * 0.2, footY - size * 1.1);
    ctx.lineTo(this.x, footY - size * 0.9);
    ctx.lineTo(this.x + size * 0.2, footY - size * 1.1);
    ctx.stroke();

    // Lightning removed to prevent yellow flickering

    // --- HEAD ---
    const faceY = footY - size * 1.6;
    
    // Switch to thin black outline for face and ears
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;

    // Ears
    ctx.fillStyle = '#ffccbc'; // Explicitly set ear color
    ctx.beginPath();
    ctx.arc(this.x - size * 0.6, faceY + size * 0.4, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(this.x + size * 0.6, faceY + size * 0.4, size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Face
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    const faceW = size * 1.2;
    const faceH = size * 0.9;
    ctx.roundRect(this.x - faceW/2, faceY, faceW, faceH, size * 0.4);
    ctx.fill();
    ctx.stroke();

    // Smile logic
    const isBigSmile = this.smileTimer > 0;
    
    // Smile - Wide toothy smile vs Moderate subtle smile
    ctx.fillStyle = 'white';
    ctx.beginPath();
    if (isBigSmile) {
      // Big Wide Smile (Award mode)
      ctx.arc(this.x, faceY + size * 0.55, size * 0.35, 0, Math.PI);
    } else {
      // Moderate Smile (Standard mode)
      ctx.arc(this.x, faceY + size * 0.65, size * 0.22, 0, Math.PI);
    }
    ctx.fill();
    ctx.stroke();
    
    // Teeth lines - only if mouth is open enough (Big Smile)
    if (isBigSmile) {
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      
      // Horizontal mid-line
      ctx.beginPath();
      ctx.moveTo(this.x - size * 0.32, faceY + size * 0.73);
      ctx.lineTo(this.x + size * 0.32, faceY + size * 0.73); 
      ctx.stroke();
      
      // Vertical separators (shortened to avoid edge bleed)
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(this.x + i * size * 0.18, faceY + size * 0.58);
        ctx.lineTo(this.x + i * size * 0.18, faceY + size * 0.85); // 0.85 instead of 0.88 to fix gray pixels
        ctx.stroke();
      }
    } else {
      // Optional: tiny teeth highlight for moderate smile if desired, 
      // but keeping it simple for cleaner look as requested
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.x - size * 0.1, faceY + size * 0.78);
      ctx.lineTo(this.x + size * 0.1, faceY + size * 0.78);
      ctx.stroke();
    }

    // Mustache - Drawn after smile so it sits correctly
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.roundRect(this.x - size * 0.4, faceY + size * 0.52, size * 0.8, size * 0.18, size * 0.05);
    ctx.fill();
    ctx.stroke();

    // Nose
    ctx.fillStyle = '#ef9a9a';
    ctx.beginPath();
    ctx.arc(this.x, faceY + size * 0.45, size * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Glasseses - Black frames now, no green bridge
    ctx.lineWidth = 2; // Slightly thinner for inner details
    ctx.strokeStyle = 'black';
    ctx.fillStyle = '#212121'; // Black frames
    ctx.fillRect(this.x - size * 0.48, faceY + size * 0.15, size * 0.96, size * 0.3);
    ctx.strokeRect(this.x - size * 0.48, faceY + size * 0.15, size * 0.96, size * 0.3);
    
    const isFlashing = Date.now() - this.lastClick < 600;
    
    // Left Eye area
    ctx.fillStyle = 'white';
    ctx.fillRect(this.x - size * 0.4, faceY + size * 0.2, size * 0.32, size * 0.2);
    ctx.strokeRect(this.x - size * 0.4, faceY + size * 0.2, size * 0.32, size * 0.2);
    
    // Right Eye area
    ctx.fillRect(this.x + size * 0.08, faceY + size * 0.2, size * 0.32, size * 0.2);
    ctx.strokeRect(this.x + size * 0.08, faceY + size * 0.2, size * 0.32, size * 0.2);
    
    // Dollar Signs - Flash Green!
    ctx.fillStyle = isFlashing ? '#00e676' : 'black';
    ctx.font = `bold ${Math.floor(size * 0.28)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('$', this.x - size * 0.24, faceY + size * 0.36);
    ctx.fillText('$', this.x + size * 0.24, faceY + size * 0.36);

    // --- HAT ---
    ctx.fillStyle = '#212121';
    // Brim
    ctx.beginPath();
    ctx.roundRect(this.x - size * 0.9, faceY - size * 0.05, size * 1.8, size * 0.15, size * 0.05);
    ctx.fill();
    ctx.stroke();
    // Top
    ctx.fillRect(this.x - size * 0.6, faceY - size * 0.4, size * 1.2, size * 0.4);
    ctx.strokeRect(this.x - size * 0.6, faceY - size * 0.4, size * 1.2, size * 0.4);
    // Band
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(this.x - size * 0.6, faceY - size * 0.15, size * 1.2, size * 0.12);
    ctx.strokeRect(this.x - size * 0.6, faceY - size * 0.15, size * 1.2, size * 0.12);

    // Ripple
    if (Date.now() - this.lastClick < 500) {
      this.renderClickEffect(ctx);
    }

    // --- MJOLNIR HAMMER (Drawn last to be on top) ---
    const hammerX = this.x + size * 0.8;
    const hammerY = footY - size * 1.1;
    
    // Handle
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.fillStyle = '#4e342e'; // Dark brown wood
    ctx.beginPath();
    ctx.roundRect(hammerX - size * 0.05, hammerY - size * 0.6, size * 0.1, size * 0.8, size * 0.05);
    ctx.fill();
    ctx.stroke();
    
    // Handle Wraps (Visual texture)
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(hammerX - size * 0.05, hammerY - size * 0.5 + i * size * 0.12);
        ctx.lineTo(hammerX + size * 0.05, hammerY - size * 0.55 + i * size * 0.12);
        ctx.stroke();
    }
    
    // Leather Strap Loop
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(hammerX, hammerY + size * 0.2, size * 0.1, 0, Math.PI * 2);
    ctx.stroke();

    // Hammer Head
    const headW = size * 0.8;
    const headH = size * 0.5;
    ctx.save();
    ctx.translate(hammerX, hammerY - size * 0.7);
    ctx.rotate(0); // Flattened per user request to match reference exactly

    // Head Outline/Body
    ctx.fillStyle = '#757575'; // Gray metal
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.roundRect(-headW/2, -headH/2, headW, headH, size * 0.08);
    ctx.fill();
    ctx.stroke();

    // Metallic Highlights
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(-headW/2, -headH/2, headW, headH * 0.3);
    
    // Golden Pattern (As seen in reference)
    ctx.strokeStyle = '#ffd600'; // Gold
    ctx.lineWidth = 1.5;
    // Outer Rectangle
    ctx.strokeRect(-headW * 0.35, -headH * 0.3, headW * 0.7, headH * 0.6);
    // Inner Cross/Rune details
    ctx.beginPath();
    ctx.moveTo(-headW * 0.15, -headH * 0.2);
    ctx.lineTo(headW * 0.15, headH * 0.2);
    ctx.moveTo(headW * 0.15, -headH * 0.2);
    ctx.lineTo(-headW * 0.15, headH * 0.2);
    ctx.stroke();
    
    // Side texture (rugged look)
    ctx.fillStyle = '#616161';
    ctx.fillRect(-headW/2, -headH/2, size * 0.1, headH);
    ctx.fillRect(headW/2 - size * 0.1, -headH/2, size * 0.1, headH);
    
    ctx.restore();

    ctx.restore();
  }

  private renderClickEffect(ctx: CanvasRenderingContext2D): void {
    const elapsed = Date.now() - this.lastClick;
    const alpha = 1 - (elapsed / 500);
    
    ctx.save();
    ctx.strokeStyle = `rgba(255, 235, 59, ${alpha})`;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(this.x, this.y - 20, 40 + elapsed * 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  public onClick(): void {
    this.lastClick = Date.now();
  }

  public triggerSmile(duration: number = 8000): void {
    this.smileTimer = duration;
    console.log(`😊 Dan is smiling wide for ${duration/1000}s!`);
  }
}
