import React, { useState } from 'react';
import { Difficulty } from '../types/game';
import { Leaderboard } from './LeaderBoard';

interface StartScreenProps {
  onStart: (difficulty: Difficulty) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [showSnakeKings, setShowSnakeKings] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <div className="text-center mb-8">
        <img src="/snake-logo.png" alt="Logo" className="w-32 h-32 mx-auto mb-4" />
        <h1 className="text-4xl font-bold mb-2">Ug贪吃蛇</h1>
        <h2 className="text-xl text-gray-400">Ug游戏工作室出品</h2>
      </div>
      
      <div className="space-y-4 w-full max-w-xs">
        <button
          onClick={() => onStart(Difficulty.Casual)}
          className="w-full py-3 px-6 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors"
        >
          休闲模式
        </button>
        
        <button
          onClick={() => onStart(Difficulty.Hard)}
          className="w-full py-3 px-6 bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold transition-colors"
        >
          困难模式
        </button>
        
        <button
          onClick={() => onStart(Difficulty.Hell)}
          className="w-full py-3 px-6 bg-red-600 hover:bg-red-700 rounded-lg font-bold transition-colors"
        >
          地狱模式
        </button>

        <div className="relative">
          <button
            className="w-full py-3 px-6 bg-gray-600 rounded-lg font-bold opacity-50 cursor-not-allowed flex items-center justify-center"
            disabled
          >
            <span className="mr-2">🔒</span>
            Og模式
          </button>
          <div className="text-sm text-gray-500 text-center mt-1">
            Keith认为难度太高暂不开放
          </div>
        </div>

        <button
          onClick={() => setShowSnakeKings(true)}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors"
        >
          蛇王排行榜
        </button>
      </div>

      {showSnakeKings && (
        <Leaderboard onClose={() => setShowSnakeKings(false)} />
      )}
    </div>
  );
}; 