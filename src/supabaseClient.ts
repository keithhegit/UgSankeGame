import { createClient } from '@supabase/supabase-js';

// 临时使用测试配置
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 