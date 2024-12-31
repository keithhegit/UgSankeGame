import React from 'react';

interface GameStatusProps {
  score: number;
  lives: number;
  timeLeft: number;
}

export const GameStatus: React.FC<GameStatusProps> = ({ score, lives, timeLeft }) => {
  return (
    <div className="flex gap-6 bg-gray-100 rounded-lg px-4 py-2 shadow-md">
      <div className="text-sm font-medium text-gray-700">
        分数: {score}
      </div>
      <div className="text-sm font-medium text-gray-700">
        生命: {lives}
      </div>
      <div className="text-sm font-medium text-gray-700">
        时间: {timeLeft}s
      </div>
    </div>
  );
};