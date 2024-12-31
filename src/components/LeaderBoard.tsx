import React, { useEffect, useState } from 'react';
import { LeaderboardState } from '../types/leaderboard';
import { leaderboardService } from '../services/leaderboardService';

interface LeaderboardProps {
  onClose: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
  const [state, setState] = useState<LeaderboardState>({
    entries: [],
    isLoading: false,
    error: null
  });

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setState((prev: LeaderboardState) => ({ ...prev, isLoading: true, error: null }));
        const entries = await leaderboardService.getLeaderboard();
        setState((prev: LeaderboardState) => ({ ...prev, entries, isLoading: false }));
      } catch (error) {
        setState((prev: LeaderboardState) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : '获取排行榜失败'
        }));
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">排行榜</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {state.isLoading ? (
          <div className="text-white text-center py-4">加载中...</div>
        ) : state.error ? (
          <div className="text-red-500 text-center py-4">{state.error}</div>
        ) : (
          <div className="space-y-2">
            {state.entries.map((entry, index: number) => (
              <div
                key={entry.id}
                className="flex items-center justify-between bg-gray-700 p-3 rounded"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-yellow-500 font-bold">{index + 1}</span>
                  <span className="text-white">{entry.player_name}</span>
                </div>
                <span className="text-green-400">{entry.score}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 