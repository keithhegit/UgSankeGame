/*
  # Create leaderboard table

  1. New Tables
    - `leaderboard`
      - `id` (uuid, primary key)
      - `player_name` (text)
      - `score` (integer)
      - `difficulty` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `leaderboard` table
    - Add policies for read and insert operations
*/

CREATE TABLE IF NOT EXISTS leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  score integer NOT NULL,
  difficulty text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read leaderboard"
  ON leaderboard
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert scores"
  ON leaderboard
  FOR INSERT
  TO authenticated
  WITH CHECK (true);