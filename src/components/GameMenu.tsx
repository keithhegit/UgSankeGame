import React, { useState } from 'react';
import { SnakeKingLeaderboard } from './SnakeKingLeaderboard';

export const GameMenu: React.FC<{ onStartGame: (difficulty: string) => void }> = ({ onStartGame }) => {
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-4xl font-bold text-white text-center mb-8">🐍 贪吃蛇</h1>
        <div className="space-y-4">
          <button
            onClick={() => onStartGame('CASUAL')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            休闲模式
          </button>
          <button
            onClick={() => onStartGame('HARD')}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            困难模式
          </button>
          <button
            onClick={() => onStartGame('HELL')}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            地狱模式
          </button>
          <button
            onClick={() => onStartGame('OG')}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            OG模式
          </button>
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            蛇王排行榜 👑
          </button>
        </div>
      </div>

      <SnakeKingLeaderboard
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </div>
  );
}; 