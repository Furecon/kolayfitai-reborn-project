/*
  # Create Weight History Table
  
  1. New Tables
    - `weight_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `weight` (numeric, current weight in kg)
      - `recorded_at` (timestamptz, when weight was recorded)
      - `source` (text, 'profile_update' or 'manual')
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on `weight_history` table
    - Add policies for authenticated users to manage their own data
  
  3. Indexes
    - Index on user_id and recorded_at for efficient queries
    - Index for graph data retrieval
*/

-- Create weight_history table
CREATE TABLE IF NOT EXISTS weight_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight numeric(5,2) NOT NULL CHECK (weight > 0 AND weight < 500),
  recorded_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'profile_update' CHECK (source IN ('profile_update', 'manual')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;

-- Add indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_weight_history_user_recorded 
  ON weight_history(user_id, recorded_at DESC);

-- RLS Policies
CREATE POLICY "Users can view own weight history"
  ON weight_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weight history"
  ON weight_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weight history"
  ON weight_history FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own weight history"
  ON weight_history FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically add weight history when profile is updated
CREATE OR REPLACE FUNCTION add_weight_to_history()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only add if weight has changed
  IF NEW.weight IS DISTINCT FROM OLD.weight THEN
    INSERT INTO weight_history (user_id, weight, recorded_at, source)
    VALUES (NEW.user_id, NEW.weight, NOW(), 'profile_update');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on profiles table
DROP TRIGGER IF EXISTS trigger_add_weight_history ON profiles;
CREATE TRIGGER trigger_add_weight_history
  AFTER UPDATE OF weight ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION add_weight_to_history();

-- Add initial weight for existing users (one-time migration)
INSERT INTO weight_history (user_id, weight, recorded_at, source)
SELECT user_id, weight, updated_at, 'profile_update'
FROM profiles
WHERE weight IS NOT NULL
ON CONFLICT DO NOTHING;

COMMENT ON TABLE weight_history IS 'Tracks user weight changes over time for progress graphs';
COMMENT ON FUNCTION add_weight_to_history IS 'Automatically records weight changes from profile updates';
