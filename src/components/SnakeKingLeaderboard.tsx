import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SnakeKingEntry {
  id: number;
  player_name: string;
  highest_score: number;
  achieved_at: string;
}

interface SnakeKingLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SnakeKingLeaderboard: React.FC<SnakeKingLeaderboardProps> = ({
  isOpen,
  onClose
}) => {
  const [entries, setEntries] = useState<SnakeKingEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadSnakeKings();
    }
  }, [isOpen]);

  const loadSnakeKings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('snake_kings')
        .select('*')
        .order('highest_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setEntries(data || []);
    } catch (err) {
      console.error('加载蛇王排行榜失败:', err);
      setError('加载排行榜失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">🏆 蛇王排行榜</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-gray-400">加载中...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg"
              >
                <div className="flex items-center">
                  <span className="text-xl font-bold text-white w-8">
                    {index + 1}.
                  </span>
                  <div className="ml-3">
                    <div className="text-white font-medium">
                      {entry.player_name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(entry.achieved_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className="text-yellow-400 font-bold text-xl">
                  {entry.highest_score}
                </span>
              </div>
            ))}
            {entries.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                暂无记录
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 