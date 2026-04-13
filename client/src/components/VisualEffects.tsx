import React, { useEffect, useRef } from 'react';

const MAX_EFFECTS = 30;

const ICONS = {
  money: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
  users: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
  zap: `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>`
};

const getHTMLForEffect = (detail: any) => {
  const { type, value, color, intensity } = detail;
  
  if (type === 'money') {
    const isLoss = color === 'red' || (typeof value === 'string' && value.startsWith('-'));
    const colorClass = color === 'red' ? 'text-red-500' : 'text-green-400';
    const borderColor = color === 'red' ? 'border-red-500/40' : 'border-green-500/40';
    const glowColor = color === 'red' ? 'shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'shadow-[0_0_15px_rgba(34,197,94,0.4)]';
    
    return `
      <div class="flex items-center gap-1 bg-black/95 border ${borderColor} rounded-full px-3 py-1 scale-75 md:scale-100 ${glowColor}">
        <div class="${colorClass}">${ICONS.money}</div>
        <span class="text-xs md:text-sm font-black whitespace-nowrap font-mono ${colorClass}">${value || '+'}</span>
      </div>
    `;
  }
  
  if (type === 'users') {
    const isLoss = color === 'red';
    const colorClass = isLoss ? 'text-red-500' : 'text-blue-400';
    const borderColor = isLoss ? 'border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.4)]';
    
    return `
      <div class="flex items-center gap-1 bg-black/95 border ${borderColor} rounded-full px-3 py-1 scale-75 md:scale-100">
        <div class="${colorClass}">${ICONS.users}</div>
        <span class="text-xs md:text-sm font-black whitespace-nowrap font-mono ${colorClass}">${value || '+USERS'}</span>
      </div>
    `;
  }

  if (type === 'achievement') {
    return `
      <div class="relative">
        <div class="w-12 h-12 bg-yellow-400/20 border-2 border-yellow-400 rounded-lg animate-spin rotate-45 flex items-center justify-center">
           <div class="text-yellow-400 -rotate-45">${ICONS.shield}</div>
        </div>
        <div class="absolute inset-x-0 -top-8 text-center">
          <span class="text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-black px-2 py-0.5 whitespace-nowrap shadow-[0_0_10px_rgba(250,204,21,0.5)]">
            ASSET SECURED
          </span>
        </div>
      </div>
    `;
  }

  if (type === 'crisis') {
    return `
      <div class="relative p-4 bg-red-800/80 border-2 border-red-500 rounded-lg shadow-xl text-center">
        <div class="text-white font-black text-3xl uppercase whitespace-nowrap animate-pulse">
          🚨 PR DISASTER! 🚨 SCANDALS! 🚨 DEFEND THE HQ! 🚨
        </div>
      </div>
    `;
  }
  
  if (type === 'confetti') {
    let dots = '';
    const colors = ['bg-yellow-400', 'bg-blue-400', 'bg-red-500', 'bg-green-400', 'bg-purple-500', 'bg-pink-500'];
    for(let i=0; i<16; i++) {
        const rc = colors[Math.floor(Math.random() * colors.length)];
        const dist = 20 + Math.random() * 40;
        const angle = (Math.PI * 2 * i) / 16 + (Math.random() * 0.5);
        dots += `<div class="absolute w-1.5 h-1.5 ${rc} rounded-sm" style="transform: translate(${Math.cos(angle)*dist}px, ${Math.sin(angle)*dist}px)"></div>`;
    }
    return `<div class="relative">${dots}</div>`;
  }

  return ``;
};

const VisualEffects = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const poolRef = useRef<{ el: HTMLDivElement, active: boolean, expires: number }[]>([]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Initialize DOM Pool
    for (let i = 0; i < MAX_EFFECTS; i++) {
      const el = document.createElement('div');
      el.className = "absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 opacity-0";
      el.style.zIndex = '100';
      el.style.transition = 'opacity 0.15s ease-out, transform 0.8s cubic-bezier(0.1, 0.8, 0.4, 1.0)';
      el.style.willChange = 'transform, opacity';
      container.appendChild(el);
      poolRef.current.push({ el, active: false, expires: 0 });
    }

    // 2. Map Event to DOM Node
    const handleEffect = (e: Event) => {
      const customEvent = e as CustomEvent;
      const detail = customEvent.detail;
      
      const p = poolRef.current.find(p => !p.active);
      if (!p) return; // Soft Cap enforcement - safely drops excess visuals to preserve FPS

      p.active = true;
      p.expires = Date.now() + (detail.duration || 800);

      const el = p.el;
      
      // Inject pure HTML string (0 React renders!)
      el.innerHTML = getHTMLForEffect(detail);
      
      // Reset transform and animation
      el.style.transition = 'none';
      el.style.transform = `translate(-50%, -50%) scale(0.5) translateY(20px)`;
      el.style.opacity = '0';
      el.style.left = `${detail.x}px`;
      el.style.top = `${detail.y}px`;

      // Trigger reflow
      void el.offsetHeight;

      // Animate in
      el.style.transition = 'opacity 0.15s ease-out, transform 0.6s cubic-bezier(0.1, 0.8, 0.4, 1.0)';
      el.style.opacity = '1';
      el.style.transform = `translate(-50%, -50%) scale(1) translateY(-40px)`;
    };

    document.addEventListener('metaman-visual-effect', handleEffect);

    // 3. Engine Loop (Vanilla GC and Fade Out)
    let animationId: number;
    const loop = () => {
      const now = Date.now();
      poolRef.current.forEach(p => {
        if (p.active && now > p.expires) {
          p.active = false;
          p.el.style.transition = 'opacity 0.2s ease-out';
          p.el.style.opacity = '0';
        }
      });
      animationId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      document.removeEventListener('metaman-visual-effect', handleEffect);
      cancelAnimationFrame(animationId);
      container.innerHTML = '';
    };
  }, []);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none z-[100]" />;
};

export default React.memo(VisualEffects);