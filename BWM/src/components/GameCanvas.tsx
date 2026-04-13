import { useEffect, useRef } from 'react';
import { useStoryStore } from '../stores/useStoryStore';

interface Tree {
  x: number;
  layer: number;
  height: number;
  width: number;
  sway: number;
  swaySpeed: number;
}

interface Star {
  x: number;
  y: number;
  r: number;
  flicker: number;
}

interface Snowflake {
  x: number;
  y: number;
  r: number;
  speed: number;
  drift: number;
  opacity: number;
}

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { 
    phase, 
    bearLying,
    bearLieProgress,
    updateBearLieProgress,
    updateApproachDist
  } = useStoryStore();

  const treesRef = useRef<Tree[]>([]);
  const starsRef = useRef<Star[]>([]);
  const snowflakesRef = useRef<Snowflake[]>([]);
  
  // Animation variables held in refs to avoid React re-render lag
  const playerXRef = useRef(0);
  const playerTargetXRef = useRef(0);
  const timeRef = useRef(0);
  const fogOffsetRef = useRef(0);
  const breathPhaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initScene();
    };

    const initScene = () => {
      const W = canvas.width;
      const H = canvas.height;
      
      // Initialize positions
      playerXRef.current = W * 0.32;
      playerTargetXRef.current = W * 0.32;

      // Trees
      treesRef.current = [];
      for (let i = 0; i < 18; i++) {
        treesRef.current.push({ x: (i / 17) * W * 1.1 - W * 0.05, layer: 0, height: H * (0.55 + Math.random() * 0.2), width: 28 + Math.random() * 18, sway: Math.random() * Math.PI * 2, swaySpeed: 0.3 + Math.random() * 0.4 });
      }
      for (let i = 0; i < 10; i++) {
        treesRef.current.push({ x: (i / 9) * W * 1.05 - W * 0.025, layer: 1, height: H * (0.45 + Math.random() * 0.15), width: 38 + Math.random() * 22, sway: Math.random() * Math.PI * 2, swaySpeed: 0.2 + Math.random() * 0.3 });
      }
      [0, 0.1, 0.82, 0.91, 1.0].forEach(p => {
        treesRef.current.push({ x: p * W, layer: 2, height: H * (0.38 + Math.random() * 0.1), width: 55 + Math.random() * 30, sway: Math.random() * Math.PI * 2, swaySpeed: 0.15 + Math.random() * 0.2 });
      });

      // Stars
      starsRef.current = [];
      for (let i = 0; i < 80; i++) {
        starsRef.current.push({ x: Math.random() * W, y: Math.random() * H * 0.4, r: Math.random() * 1.2, flicker: Math.random() * Math.PI * 2 });
      }

      // Snow
      snowflakesRef.current = [];
      for (let i = 0; i < 40; i++) {
        snowflakesRef.current.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.5 + 0.3, speed: 0.2 + Math.random() * 0.4, drift: (Math.random() - 0.5) * 0.3, opacity: 0.2 + Math.random() * 0.4 });
      }
    };

    window.addEventListener('resize', resize);
    resize();

    // Listen for mouse movement directly to update refs
    const handleMove = (e: MouseEvent) => {
      playerTargetXRef.current = e.clientX * 0.6 + window.innerWidth * 0.15;
    };
    window.addEventListener('mousemove', handleMove);

    let animationId: number;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const W = canvas.width;
      const H = canvas.height;
      timeRef.current += 0.016;
      const time = timeRef.current;
      const treeSway = Math.sin(time * 0.4) * 2;

      ctx.clearRect(0, 0, W, H);
      if (phase === 'title') {
        ctx.fillStyle = '#050808';
        ctx.fillRect(0, 0, W, H);
        animationId = requestAnimationFrame(render);
        return;
      }

      // 1. Sky & Stars
      const skyGrad = ctx.createLinearGradient(0, 0, 0, H * 0.65);
      skyGrad.addColorStop(0, '#04090e');
      skyGrad.addColorStop(0.4, '#060d14');
      skyGrad.addColorStop(0.7, '#0a1a18');
      skyGrad.addColorStop(1, '#0d2218');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, W, H);

      starsRef.current.forEach(s => {
        const flicker = 0.5 + 0.5 * Math.sin(s.flicker + time * 0.8);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,210,220,${0.2 + flicker * 0.5})`;
        ctx.fill();
        s.flicker += 0.02;
      });

      // 2. Mist
      fogOffsetRef.current += 0.12;
      for (let i = 0; i < 5; i++) {
        const x = ((fogOffsetRef.current * (0.4 + i * 0.1) + i * W * 0.22) % (W * 1.3)) - W * 0.15;
        const y = H * (0.42 + i * 0.06) + Math.sin(fogOffsetRef.current * 0.05 + i) * 20;
        const w = W * (0.5 + i * 0.12);
        const grad = ctx.createRadialGradient(x + w / 2, y, 0, x + w / 2, y, w * 0.6);
        grad.addColorStop(0, `rgba(140,180,170,${0.04 + i * 0.01})`);
        grad.addColorStop(1, 'rgba(140,180,170,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(x + w / 2, y, w * 0.6, H * (0.08 + i * 0.02), 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Ground
      const groundGrad = ctx.createLinearGradient(0, H * 0.62, 0, H);
      groundGrad.addColorStop(0, '#0d1e1a');
      groundGrad.addColorStop(0.3, '#111f1b');
      groundGrad.addColorStop(1, '#080f0e');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, H * 0.62, W, H * 0.38);

      // 4. Background Trees (Layer 0)
      treesRef.current.filter(t => t.layer === 0).forEach(t => drawTree(ctx, t, treeSway, H, time));
      treesRef.current.filter(t => t.layer === 1).forEach(t => drawTree(ctx, t, treeSway * 1.3, H, time));

      // 5. Bear
      drawBear(ctx, W, H);

      // 6. Player
      drawPlayer(ctx, H);

      // 7. Foreground Trees (Layer 2)
      treesRef.current.filter(t => t.layer === 2).forEach(t => drawTree(ctx, t, treeSway * 1.6, H, time));

      // 8. Snow
      snowflakesRef.current.forEach(s => {
        s.y += s.speed;
        s.x += s.drift + Math.sin(time * 0.3 + s.x) * 0.1;
        if (s.y > H) { s.y = -5; s.x = Math.random() * W; }
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,215,${s.opacity})`;
        ctx.fill();
      });

      // 9. Warm Glow Interaction
      const bearX = W * 0.62;
      const currentApproach = Math.abs(playerXRef.current - bearX);
      
      if (phase === 'forest' && bearLying && currentApproach < 200) {
        const glowAlpha = Math.max(0, (200 - currentApproach) / 200) * 0.06;
        const bearY = H * 0.58;
        const warmGrad = ctx.createRadialGradient(bearX, bearY, 0, bearX, bearY, 200);
        warmGrad.addColorStop(0, `rgba(120,80,30,${glowAlpha})`);
        warmGrad.addColorStop(1, 'rgba(120,80,30,0)');
        ctx.fillStyle = warmGrad;
        ctx.beginPath(); ctx.arc(bearX, bearY, 200, 0, Math.PI * 2); ctx.fill();
        
        // Push update to store for UI logic (throttle slightly maybe?)
        updateApproachDist(currentApproach);
      }

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      cancelAnimationFrame(animationId);
    };
  }, [phase, bearLying]); // Reduced dependency array

  const drawTree = (ctx: CanvasRenderingContext2D, tree: Tree, sw: number, H: number, time: number) => {
    const colors = [['#0a1a14', '#081410'], ['#091612', '#07100e'], ['#060e0c', '#040a08']];
    const alphas = [0.7, 0.85, 1.0];
    const sway = Math.sin(tree.sway + time * tree.swaySpeed) * sw * (tree.layer === 2 ? 0.5 : 1);
    const x = tree.x + sway;
    const baseY = H * 0.63;
    const h = tree.height, w = tree.width;

    ctx.save();
    ctx.globalAlpha = alphas[tree.layer];
    ctx.fillStyle = colors[tree.layer][1];
    ctx.fillRect(x - w * 0.06, baseY - h * 0.12, w * 0.12, h * 0.12);
    const numLayers = 5 + tree.layer;
    for (let i = 0; i < numLayers; i++) {
      const t = i / (numLayers - 1);
      const layerY = baseY - h * (0.08 + t * 0.88);
      const layerW = w * (1 - t * 0.65) * (1 + Math.sin(t * Math.PI) * 0.2);
      ctx.beginPath();
      ctx.moveTo(x, layerY - h * (0.12 + t * 0.06));
      ctx.lineTo(x - layerW / 2, layerY + h * 0.04);
      ctx.lineTo(x + layerW / 2, layerY + h * 0.04);
      ctx.closePath();
      ctx.fillStyle = colors[tree.layer][0];
      ctx.fill();
    }
    ctx.restore();
  };

  const drawBear = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
    const bearX = W * 0.62, bearY = H * 0.58;
    const scale = H / 700;
    ctx.save();
    breathPhaseRef.current += 0.018;
    const breathY = bearLying ? Math.sin(breathPhaseRef.current) * 1.5 : Math.sin(breathPhaseRef.current) * 2.5;
    
    if (bearLying && bearLieProgress < 1) updateBearLieProgress(0.008);
    const lieAmt = bearLieProgress;

    const shadowW = (80 + lieAmt * 40) * scale;
    ctx.beginPath();
    ctx.ellipse(bearX, bearY + 5 + breathY, shadowW, 10 * scale, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.fill();

    ctx.translate(bearX, bearY + breathY);
    const bodyY = -28 * scale + lieAmt * 14 * scale;
    ctx.save();
    ctx.rotate(lieAmt * 0.3);
    const bodyW = (58 + lieAmt * 20) * scale, bodyHH = (36 - lieAmt * 12) * scale;
    ctx.fillStyle = '#1e1208';
    ctx.beginPath(); ctx.ellipse(lieAmt * 15 * scale, bodyY, bodyW, bodyHH, 0, 0, Math.PI * 2); ctx.fill();
    
    const headX = -(40 + lieAmt * -25) * scale, headY = bodyY - (14 - lieAmt * 18) * scale;
    ctx.fillStyle = '#1a1006';
    ctx.beginPath(); ctx.ellipse(headX, headY, 22 * scale, 18 * scale, lieAmt * 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0e0804';
    ctx.beginPath(); ctx.ellipse(headX - 10 * scale, headY + 3 * scale, 10 * scale, 7 * scale, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#080604';
    ctx.beginPath(); ctx.ellipse(headX - 17 * scale, headY + 2 * scale, 4 * scale, 3 * scale, 0, 0, Math.PI * 2); ctx.fill();
    
    const eyeX = headX - 5 * scale, eyeY = headY - 4 * scale;
    ctx.fillStyle = 'rgba(60,45,25,0.8)';
    ctx.beginPath(); ctx.ellipse(eyeX, eyeY, 4 * scale, 3 * scale, 0, 0, Math.PI * 2); ctx.fill();
    const eyeGlow = 0.4 + Math.sin(breathPhaseRef.current * 0.5) * 0.2;
    ctx.fillStyle = `rgba(180,140,40,${eyeGlow})`;
    ctx.beginPath(); ctx.ellipse(eyeX, eyeY, 2.5 * scale, 2 * scale, 0, 0, Math.PI * 2); ctx.fill();
    
    ctx.fillStyle = '#1a1006';
    ctx.beginPath(); ctx.ellipse(headX + 8 * scale, headY - 14 * scale, 8 * scale, 7 * scale, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(headX - 4 * scale, headY - 15 * scale, 7 * scale, 6 * scale, 0.2, 0, Math.PI * 2); ctx.fill();

    if (!bearLying) {
      ctx.fillStyle = '#140e04';
      ctx.beginPath(); ctx.ellipse(-30 * scale, 8 * scale, 14 * scale, 8 * scale, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(30 * scale, 10 * scale, 12 * scale, 7 * scale, -0.1, 0, Math.PI * 2); ctx.fill();
    } else {
      ctx.fillStyle = '#140e04';
      ctx.beginPath(); ctx.ellipse(-55 * scale + lieAmt * 10, 8 * scale + lieAmt * 14, 16 * scale, 7 * scale, -0.3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(40 * scale, 12 * scale + lieAmt * 8, 12 * scale, 6 * scale, 0.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    ctx.restore();

    const mistAlpha = 0.08 + Math.sin(breathPhaseRef.current * 2) * 0.04;
    const mistX = bearX - 58 * scale, mistY = bearY + breathY - 28 * scale + lieAmt * 14 * scale;
    const mistGrad = ctx.createRadialGradient(mistX, mistY, 0, mistX, mistY, 20 * scale);
    mistGrad.addColorStop(0, `rgba(180,200,195,${mistAlpha})`);
    mistGrad.addColorStop(1, 'rgba(180,200,195,0)');
    ctx.fillStyle = mistGrad;
    ctx.beginPath(); ctx.arc(mistX, mistY, 20 * scale, 0, Math.PI * 2); ctx.fill();
  };

  const drawPlayer = (ctx: CanvasRenderingContext2D, H: number) => {
    // Hide player during title and meditative intro to focus on text
    if (phase === 'title' || phase === 'intro') return;
    
    // Smooth follow target
    playerXRef.current += (playerTargetXRef.current - playerXRef.current) * 0.04;

    const px = playerXRef.current, py = H * 0.635;
    ctx.save();
    ctx.globalAlpha = 0.9;
    
    ctx.beginPath();
    ctx.ellipse(px, py + 2, 12, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fill();
    
    const bobY = Math.sin(timeRef.current * 1.2) * 0.8;
    const bodyH = 44, bodyW = 14;
    
    ctx.fillStyle = '#1a1410';
    ctx.beginPath();
    ctx.roundRect(px - bodyW / 2, py - bodyH + bobY, bodyW, bodyH * 0.72, 3);
    ctx.fill();
    
    ctx.fillStyle = '#2a1e14';
    ctx.beginPath();
    ctx.ellipse(px, py - bodyH + bobY - 6, 7, 8, -0.1, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#0e0c0a';
    ctx.fillRect(px - 8, py - bodyH + bobY - 16, 16, 5);
    ctx.fillRect(px - 6, py - bodyH + bobY - 22, 12, 9);
    
    ctx.strokeStyle = '#2a1e10';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px + 10, py + 2 + bobY);
    ctx.lineTo(px + 12, py - bodyH - 12 + bobY);
    ctx.stroke();
    
    ctx.strokeStyle = '#141008';
    ctx.lineWidth = 5;
    const legSway = Math.sin(timeRef.current * 1.2) * 3;
    ctx.beginPath(); ctx.moveTo(px - 3, py - bodyH * 0.3 + bobY); ctx.lineTo(px - 5 + legSway, py + 1 + bobY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px + 3, py - bodyH * 0.3 + bobY); ctx.lineTo(px + 5 - legSway, py + 1 + bobY); ctx.stroke();
    ctx.restore();
  };

  return <canvas ref={canvasRef} id="scene" />;
};
