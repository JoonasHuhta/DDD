import React from 'react';
import { getGameConfig } from '../lib/config/GameConfig';

interface GameTitleProps {
  className?: string;
  showDescription?: boolean;
}

export default function GameTitle({ className = '', showDescription = false }: GameTitleProps) {
  const gameConfig = getGameConfig();
  
  return (
    <div className={className}>
      <h1 
        data-game-title 
        className="text-4xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent"
      >
        {gameConfig.name}
      </h1>
      {showDescription && (
        <p className="text-center text-gray-400 text-sm">
          {gameConfig.description}
        </p>
      )}
    </div>
  );
}