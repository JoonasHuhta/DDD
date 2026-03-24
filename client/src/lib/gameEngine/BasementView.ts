import { DataOrbSystem } from './DataOrb';

export class BasementView {
  private dataOrbs: DataOrbSystem;
  private serverRacks: Array<{x: number, y: number, width: number, height: number}> = [];
  private lastCanvasWidth: number = 0;

  constructor() {
    this.dataOrbs = new DataOrbSystem();
    this.generateServerRacks(800);
  }

  private generateServerRacks(canvasWidth: number) {
    // Dynamically calculate server rack positions based on screen width
    // Keep them away from the right edge menu (at least 120px)
    const safeWidth = Math.max(300, canvasWidth - 120);
    const spacingX = Math.min(150, safeWidth / 3);
    const startX = Math.max(20, (safeWidth - (spacingX * 2 + 80)) / 2);
    
    const rackPositions = [
      { x: startX, y: 180, width: 80, height: 120 },
      { x: startX + spacingX, y: 180, width: 80, height: 120 },
      { x: startX + spacingX * 2, y: 180, width: 80, height: 120 },
      
      { x: startX, y: 400, width: 80, height: 120 },
      { x: startX + spacingX, y: 400, width: 80, height: 120 },
      { x: startX + spacingX * 2, y: 400, width: 80, height: 120 },
    ];
    
    this.serverRacks = rackPositions;
  }

  spawnDataOrb(citizenValue: number = 1) {
    // Spawn orbs near the center/random server racks
    const rack = this.serverRacks[Math.floor(Math.random() * this.serverRacks.length)];
    const x = rack.x + rack.width / 2 + (Math.random() - 0.5) * 100;
    const y = rack.y + rack.height / 2 + (Math.random() - 0.5) * 100;
    
    // Let orb system randomly determine type for diversity
    this.dataOrbs.createOrb(x, y);
  }

  update(deltaTime: number, canvasWidth: number, canvasHeight: number) {
    if (this.lastCanvasWidth !== canvasWidth) {
      this.generateServerRacks(canvasWidth);
      this.lastCanvasWidth = canvasWidth;
    }
    this.dataOrbs.update(deltaTime, canvasWidth, canvasHeight);
  }

  handleClick(clickX: number, clickY: number): { type: 'basic' | 'premium' | 'rare' | 'legendary'; value: number; orbs: number } | null {
    const orb = this.dataOrbs.checkOrbClick(clickX, clickY);
    if (orb) {
      // ENHANCED: Different orb types give different rewards
      let dataValue, orbsValue;
      
      switch(orb.type) {
        case 'basic':
          dataValue = Math.floor(Math.random() * 4) + 1; // 1-4 data
          orbsValue = 1; // 1 orb
          break;
        case 'premium':
          dataValue = Math.floor(Math.random() * 6) + 3; // 3-8 data
          orbsValue = Math.floor(Math.random() * 3) + 2; // 2-4 orbs
          break;
        case 'rare':
          dataValue = Math.floor(Math.random() * 10) + 5; // 5-14 data
          orbsValue = Math.floor(Math.random() * 5) + 3; // 3-7 orbs
          break;
        case 'legendary':
          dataValue = Math.floor(Math.random() * 20) + 10; // 10-29 data
          orbsValue = Math.floor(Math.random() * 10) + 5; // 5-14 orbs
          break;
        default:
          dataValue = 1;
          orbsValue = 1;
      }
        
      return { type: orb.type, value: dataValue, orbs: orbsValue };
    }
    return null;
  }

  render(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
    // Clear with dark basement background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw concrete floor pattern
    ctx.fillStyle = '#1a1a1a';
    for (let x = 0; x < canvasWidth; x += 60) {
      for (let y = 0; y < canvasHeight; y += 60) {
        ctx.fillRect(x, y, 58, 58);
      }
    }

    // Draw server racks
    this.serverRacks.forEach(rack => {
      // Main rack body
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(rack.x, rack.y, rack.width, rack.height);
      
      // Rack frame
      ctx.strokeStyle = '#404040';
      ctx.lineWidth = 2;
      ctx.strokeRect(rack.x, rack.y, rack.width, rack.height);
      
      // Server slots (horizontal lines)
      ctx.strokeStyle = '#505050';
      ctx.lineWidth = 1;
      for (let i = 1; i < 8; i++) {
        const slotY = rack.y + (rack.height / 8) * i;
        ctx.beginPath();
        ctx.moveTo(rack.x + 5, slotY);
        ctx.lineTo(rack.x + rack.width - 5, slotY);
        ctx.stroke();
      }
      
      // LED lights (random blinking)
      for (let i = 0; i < 6; i++) {
        const ledX = rack.x + 10 + (i % 3) * 20;
        const ledY = rack.y + 15 + Math.floor(i / 3) * 30;
        
        if (Math.random() < 0.7) { // 70% chance to be on
          ctx.fillStyle = Math.random() < 0.8 ? '#00ff00' : '#ff0000'; // Mostly green, some red
          ctx.beginPath();
          ctx.arc(ledX, ledY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Power/network cables
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rack.x + rack.width, rack.y + rack.height - 20);
      ctx.lineTo(rack.x + rack.width + 15, rack.y + rack.height - 10);
      ctx.stroke();
    });

    // Add some ambient lighting effects
    const gradient = ctx.createRadialGradient(
      canvasWidth / 2, canvasHeight / 2, 0,
      canvasWidth / 2, canvasHeight / 2, Math.max(canvasWidth, canvasHeight) / 2
    );
    gradient.addColorStop(0, 'rgba(0, 100, 200, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw data orbs
    this.dataOrbs.render(ctx);

    // Add basement title - lowered position
    ctx.fillStyle = '#666666';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('DATA HARVESTING FACILITY', canvasWidth / 2, 140); 
    
    // Add orb count info
    const orbCount = this.dataOrbs.getOrbCount();
    if (orbCount > 0) {
      ctx.fillStyle = '#888888';
      ctx.font = '16px monospace';
      ctx.fillText(`${orbCount} data orbs active`, canvasWidth / 2, 170); 
    }
  }

  getDataOrbs() {
    return this.dataOrbs;
  }
}