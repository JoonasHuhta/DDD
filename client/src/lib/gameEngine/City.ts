export interface StreetPosition {
  x: number;
  y: number;
}

export class City {
  public width: number;
  public height: number;
  private buildings: Array<{x: number, y: number, width: number, height: number, color: string}>;
  private streets: StreetPosition[];
  private baseTowerHeight: number = 350; // Fixed: Increased from 200 to 350 for higher initial tower

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.buildings = [];
    this.streets = [];
    this.generateCity();
  }

  private generateCity(): void {
    this.buildings = [];
    this.streets = [];
    
    // Central skyscraper - deterministic baseline
    const centerX = this.width / 2;
    const skyscraperWidth = 80;
    const skyscraperHeight = this.baseTowerHeight; // Use the increased base height
    
    this.buildings.push({
      x: centerX - skyscraperWidth / 2,
      y: this.height - skyscraperHeight,
      width: skyscraperWidth,
      height: skyscraperHeight,
      color: '#2c3e50'
    });

    // Generate distant background buildings - keep clear zone around main tower
    const gridSize = 10;
    const cellWidth = this.width / gridSize;
    const cellHeight = (this.height - 200) / gridSize;

    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const cellX = col * cellWidth;
        const cellY = 200 + row * cellHeight;

        // Add streets for citizen movement everywhere except the very center tower base
        const centerCol = Math.floor(gridSize/2);
        const centerRow = gridSize - 1;
        const distanceFromCenter = Math.sqrt((col - centerCol)**2 + (row - centerRow)**2);
        
        // EXTREME clearance zone around main tower to ensure "ONLY ONE SKYSCRAPER"
        // Skip anything in the central 70% of the screen horizontally for front rows
        if (distanceFromCenter < 7.0 || (row > 4 && col > 1 && col < 8)) {
          continue;
        }

        this.streets.push({ x: cellX + cellWidth/2, y: cellY + cellHeight/2 });
      }
    }

    // Add additional street grid for citizen movement
    for (let i = 0; i < gridSize; i++) {
      // Horizontal streets
      this.streets.push({ x: i * cellWidth, y: 250 });
      this.streets.push({ x: i * cellWidth, y: 400 });
      this.streets.push({ x: i * cellWidth, y: 550 });
      
      // Vertical streets
      this.streets.push({ x: cellWidth * 2, y: 200 + i * cellHeight });
      this.streets.push({ x: cellWidth * 6, y: 200 + i * cellHeight });
    }
  }

  private getRandomBuildingColor(): string {
    // Very transparent, subtle background building colors - won't compete with main tower
    const colors = [
      'rgba(52, 73, 94, 0.2)', 
      'rgba(44, 62, 80, 0.2)', 
      'rgba(127, 140, 141, 0.2)', 
      'rgba(149, 165, 166, 0.15)', 
      'rgba(189, 195, 199, 0.15)'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  public resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
    this.generateCity();
  }

  public render(ctx: CanvasRenderingContext2D, isNight: boolean, towerHeight: number = 1, isMobile: boolean = false): void {
    // Calculate dynamic tower height
    const dynamicHeight = this.baseTowerHeight + (towerHeight - 1) * 40; // Each floor adds 40px
    
    // Update the central tower building with new height
    if (this.buildings.length > 0) {
      const centerX = this.width / 2;
      // Mobile-specific tower width removed to keep it narrow as requested
      const baseWidth = 80;
      const skyscraperWidth = baseWidth; 
      this.buildings[0] = {
        x: centerX - skyscraperWidth / 2,
        y: this.height - dynamicHeight,
        width: skyscraperWidth,
        height: dynamicHeight,
        color: '#2c3e50'
      };
    }

    // Render background buildings first
    this.buildings.forEach((building, index) => {
      if (index !== 0) {
        ctx.fillStyle = building.color;
        ctx.fillRect(building.x, building.y, building.width, building.height);
        
        // Add windows if it's night
        if (isNight) {
          this.renderWindows(ctx, building, false);
        }
      }
    });

    // Render the main skyscraper LAST so it's always on top
    if (this.buildings.length > 0) {
      this.renderSkyscraper(ctx, this.buildings[0], isNight, towerHeight);
    }

    // Street grid rendering removed to clean up background "blobs"
  }

  private renderSkyscraper(ctx: CanvasRenderingContext2D, building: any, isNight: boolean, towerHeight: number = 1): void {
    // COMIC STYLE: Saturated colors and thick black outlines
    
    // Draw solid base
    ctx.fillStyle = '#000000'; // Black for outer outline effect
    ctx.fillRect(building.x - 4, building.y - 4, building.width + 8, building.height + 4);

    // Main building body
    ctx.fillStyle = '#2c3e50'; 
    ctx.fillRect(building.x, building.y, building.width, building.height);
    
    // Saturated walls - uniform color
    ctx.fillStyle = '#3b82f6'; // Bright blue
    ctx.fillRect(building.x, building.y, building.width, building.height);
    
    // DOPA Branding area at the VERY TOP
    const logoH = 50; 
    ctx.fillStyle = '#FFD700';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.fillRect(building.x, building.y, building.width, logoH);
    ctx.strokeRect(building.x, building.y, building.width, logoH);
    
    // "DOPA" text inside the yellow block
    ctx.fillStyle = '#ff0000'; 
    ctx.font = 'bold 24px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DOPA', building.x + building.width / 2, building.y + logoH / 2 + 2);
    ctx.textBaseline = 'alphabetic'; // Reset
    
    // Neon sign removed as user requested it "as in the beginning" (inside the tower)

    // Render floor dividers as thick black lines
    const floorHeight = 40;
    const startY = building.y + 60; 
    
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    for (let floor = 1; floor < towerHeight; floor++) {
      const floorY = startY + (floor - 1) * floorHeight;
      ctx.beginPath();
      ctx.moveTo(building.x, floorY);
      ctx.lineTo(building.x + building.width, floorY);
      ctx.stroke();
      

    }

    // Windows always lit in comic style
    this.renderWindows(ctx, building, true);

    // THICK OUTER BORDER
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(building.x, building.y, building.width, building.height);
  }
  private renderWindows(ctx: CanvasRenderingContext2D, building: any, isMainTower: boolean): void {
    // Render the DOPA branding windows ONLY on the main tower
    if (isMainTower) {
      this.renderDopaSpelling(ctx, building);
    }

    // Filter out random windows that overlap with the DOPA spelling area
    const windowWidth = 6;
    const windowHeight = 8;
    const windowSpacing = 12;
    
    const centerX = building.x + building.width / 2;
    const windowOffset = 30; // Distance from center for windows
    let windowIndex = 0;

    for (let y = building.y + 65; y < building.y + building.height - 20; y += windowSpacing) {
      // Create groups of 3 (skip every 4th slot)
      if (windowIndex % 4 !== 3) {
        // Draw symmetrical windows on both sides
        [centerX - windowOffset, centerX + windowOffset].forEach(xPos => {
          const x = xPos - windowWidth / 2;
          ctx.fillStyle = '#ffd700';
          ctx.fillRect(x, y, windowWidth, windowHeight);
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, windowWidth, windowHeight);
        });
      }
      windowIndex++;
    }
  }

  private renderDopaSpelling(ctx: CanvasRenderingContext2D, building: any): void {
    ctx.fillStyle = '#ffff00'; // Pure bright yellow for DOPA spelling
    const centerX = building.x + building.width / 2;
    const startY = building.y + 70;
    const w = 5;
    const h = 7;
    const s = 10; // spacing

    // D
    const dX = centerX - 12;
    const dY = startY;
    [ [0,0],[0,1],[0,2],[0,3],[0,4], [1,0],[2,1],[2,2],[2,3],[1,4] ].forEach(([ox, oy]) => {
      ctx.fillRect(dX + ox*s, dY + oy*s, w, h);
    });

    // O
    const oY = startY + 6*s;
    [ [0,0],[0,1],[0,2],[0,3],[0,4], [2,0],[2,1],[2,2],[2,3],[2,4], [1,0], [1,4] ].forEach(([ox, oy]) => {
      ctx.fillRect(dX + ox*s, oY + oy*s, w, h);
    });

    // P
    const pY = startY + 12*s;
    [ [0,0],[0,1],[0,2],[0,3],[0,4], [1,0],[2,0],[2,1],[2,2],[1,2] ].forEach(([ox, oy]) => {
      ctx.fillRect(dX + ox*s, pY + oy*s, w, h);
    });

    // A
    const aY = startY + 18*s;
    [ [0,1],[0,2],[0,3],[0,4], [2,1],[2,2],[2,3],[2,4], [1,0], [1,2] ].forEach(([ox, oy]) => {
      ctx.fillRect(dX + ox*s, aY + oy*s, w, h);
    });
  }

  public getStreetPositions(): StreetPosition[] {
    return this.streets;
  }
}
