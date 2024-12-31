import { supabase } from '../lib/supabase';
import { LeaderboardEntry } from '../types/leaderboard';

class LeaderboardService {
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('snake_kings')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('获取排行榜失败:', error);
      throw error;
    }

    console.log('Supabase 原始数据:', data);
    // 直接返回原始数据，不做转换
    return data || [];
  }

  async submitScore(playerName: string, score: number): Promise<void> {
    const now = new Date();
    const localISOTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString();

    const { error } = await supabase
      .from('snake_kings')
      .insert([
        {
          player_name: playerName,
          score: score,
          achieved_at: localISOTime
        }
      ]);

    if (error) {
      console.error('提交分数失败:', error);
      throw error;
    }
  }

  async isNewHighScore(score: number): Promise<boolean> {
    const { data, error } = await supabase
      .from('snake_kings')
      .select('score')
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('检查高分失败:', error);
      throw error;
    }

    if (!data || data.length < 10) {
      return true;
    }

    return score > data[data.length - 1].score;
  }
}

export const leaderboardService = new LeaderboardService(); 