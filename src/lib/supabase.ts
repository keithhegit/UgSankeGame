import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmsktwcigrvyjuucptfk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc2t0d2NpZ3J2eWp1dWNwdGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyNjYzNzcsImV4cCI6MjA1MDg0MjM3N30.-jNxrLjmPAZHyMaXNLWkUriKwD7ZyZCRZq87u8enKeg';

export const supabase = createClient(supabaseUrl, supabaseKey); 