import React, { useState, useEffect } from 'react';
import { useMetamanGame } from '../lib/stores/useMetamanGame';

interface PersonSprite {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
}

export default function PeopleSprites() {
  const { users } = useMetamanGame();
  const [sprites, setSprites] = useState<PersonSprite[]>([]);

  // Calculate how many sprites should be shown based on user count
  const getSpriteCount = (userCount: number): number => {
    if (userCount >= 5000) return 100; // Screen filled
    if (userCount >= 1000) return 50;  // Many sprites
    if (userCount >= 500) return 25;   // Moderate amount
    if (userCount >= 100) return 10;   // First sprites appear
    return 0; // No sprites yet
  };

  // Generate random colors for diversity
  const getRandomColor = (): string => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
      '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Create initial sprite positions
  const createSprite = (id: number): PersonSprite => ({
    id,
    x: Math.random() * 900 + 50, // Keep within visible area
    y: Math.random() * 600 + 50,
    vx: (Math.random() - 0.5) * 2, // Random velocity
    vy: (Math.random() - 0.5) * 2,
    color: getRandomColor(),
    size: Math.random() * 4 + 3 // Size between 3-7px
  });

  // Update sprites based on user count
  useEffect(() => {
    const targetCount = getSpriteCount(users);
    
    setSprites(current => {
      if (current.length === targetCount) return current;
      
      if (current.length < targetCount) {
        // Add new sprites
        const newSprites = [];
        for (let i = current.length; i < targetCount; i++) {
          newSprites.push(createSprite(i));
        }
        return [...current, ...newSprites];
      } else {
        // Remove excess sprites
        return current.slice(0, targetCount);
      }
    });
  }, [users]);

  // Animate sprites
  useEffect(() => {
    const interval = setInterval(() => {
      setSprites(current => 
        current.map(sprite => {
          let newX = sprite.x + sprite.vx;
          let newY = sprite.y + sprite.vy;
          let newVx = sprite.vx;
          let newVy = sprite.vy;

          // Bounce off walls
          if (newX <= 0 || newX >= 1000) {
            newVx = -newVx;
            newX = Math.max(0, Math.min(1000, newX));
          }
          if (newY <= 0 || newY >= 750) {
            newVy = -newVy;
            newY = Math.max(0, Math.min(750, newY));
          }

          return {
            ...sprite,
            x: newX,
            y: newY,
            vx: newVx,
            vy: newVy
          };
        })
      );
    }, 50); // Update 20 times per second

    return () => clearInterval(interval);
  }, []);

  if (sprites.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
      {sprites.map(sprite => (
        <div
          key={sprite.id}
          className="absolute rounded-full transition-all duration-100"
          style={{
            left: `${(sprite.x / 1024) * 100}%`,
            top: `${(sprite.y / 768) * 100}%`,
            width: `${sprite.size}px`,
            height: `${sprite.size}px`,
            backgroundColor: sprite.color,
            boxShadow: `0 0 ${sprite.size}px ${sprite.color}40`,
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}
      
      {/* Crowd density indicator */}
      {sprites.length > 20 && (
        <div className="absolute top-4 right-4 bg-black bg-opacity-60 rounded-lg p-2">
          <div className="text-white text-xs">
            👥 {sprites.length} people online
          </div>
        </div>
      )}
    </div>
  );
}