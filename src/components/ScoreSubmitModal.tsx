import React, { useState } from 'react';
import { leaderboardService } from '../services/leaderboardService';

interface ScoreSubmitModalProps {
  isOpen: boolean;
  onClose: () => void;
  score: number;
  onSubmitSuccess: () => void;
}

export const ScoreSubmitModal: React.FC<ScoreSubmitModalProps> = ({
  isOpen,
  onClose,
  score,
  onSubmitSuccess
}) => {
  const [playerName, setPlayerName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('请输入您的名字');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await leaderboardService.submitScore(playerName.trim(), score);
      onSubmitSuccess();
    } catch (error) {
      console.error('提交分数失败:', error);
      setError('提交分数失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">提交分数</h2>
        <p className="text-gray-300 mb-6">
          恭喜！您获得了 {score} 分
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">
              您的名字
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入您的名字"
              maxLength={20}
              disabled={isSubmitting}
            />
          </div>

          {error && (
            <div className="text-red-500 mb-4">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? '提交中...' : '提交'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 