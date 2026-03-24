import React, { useRef, useEffect } from 'react';
import { useResponsiveUI } from '../hooks/useResponsiveUI';

interface ResponsiveGameCanvasProps {
  width: number;
  height: number;
  onCanvasReady: (canvas: HTMLCanvasElement) => void;
  onClick?: (x: number, y: number) => void;
}

export default function ResponsiveGameCanvas({ 
  width, 
  height, 
  onCanvasReady, 
  onClick 
}: ResponsiveGameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const responsive = useResponsiveUI();

  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady]);

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onClick || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate scaling factors
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    // Get click position relative to canvas and adjust for scaling
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    
    onClick(x, y);
  };

  // Calculate responsive canvas dimensions
  let canvasWidth = Math.floor(width * responsive.canvasScale);
  let canvasHeight = Math.floor(height * responsive.canvasScale);
  
  // For mobile, maintain 4:3 aspect ratio to prevent stretching
  if (responsive.isMobile) {
    const targetAspectRatio = 4 / 3; // 1024/768 = 4:3
    const availableWidth = window.innerWidth - 16;
    const availableHeight = window.innerHeight - 160; // Account for UI
    
    if (availableWidth / availableHeight > targetAspectRatio) {
      // Width constrained by height
      canvasHeight = Math.min(canvasHeight, availableHeight);
      canvasWidth = Math.floor(canvasHeight * targetAspectRatio);
    } else {
      // Height constrained by width  
      canvasWidth = Math.min(canvasWidth, availableWidth);
      canvasHeight = Math.floor(canvasWidth / targetAspectRatio);
    }
  }
  
  // CSS dimensions for responsive display
  const displayWidth = Math.min(
    window.innerWidth - (responsive.isMobile ? 16 : 32),
    canvasWidth
  );
  const displayHeight = Math.min(
    window.innerHeight - (responsive.isMobile ? 160 : 120),
    canvasHeight
  );

  return (
    <div className="flex items-center justify-center w-full h-full">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        onClick={handleClick}
        className="border border-gray-700 rounded-lg bg-black cursor-pointer touch-action-manipulation"
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
          maxWidth: '100vw',
          maxHeight: responsive.isMobile ? 'calc(100vh - 160px)' : 'calc(100vh - 160px)',
          imageRendering: 'pixelated'
        }}
      />
    </div>
  );
}