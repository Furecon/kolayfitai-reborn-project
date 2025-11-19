/*
  # Add Assessment Retention Policy
  
  1. Changes
    - Create function to automatically clean old assessments
    - Keep last 12 assessments per user OR assessments from last 1 year (whichever is more)
    - Add index for efficient cleanup
    - Schedule automatic cleanup (can be called via cron job or edge function)
  
  2. Security
    - Function runs with security definer privileges
    - Only removes old data beyond retention policy
*/

-- Add index for efficient cleanup queries
CREATE INDEX IF NOT EXISTS idx_ai_assessments_user_created 
  ON ai_assessments(user_id, created_at DESC);

-- Function to clean old assessments
CREATE OR REPLACE FUNCTION cleanup_old_assessments()
RETURNS TABLE(deleted_count bigint) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  deletion_count bigint;
BEGIN
  -- Delete assessments that are:
  -- 1. Older than 1 year AND
  -- 2. Not in the last 12 assessments for that user
  WITH ranked_assessments AS (
    SELECT 
      id,
      user_id,
      created_at,
      ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM ai_assessments
  ),
  assessments_to_delete AS (
    SELECT id
    FROM ranked_assessments
    WHERE 
      rn > 12 AND 
      created_at < NOW() - INTERVAL '1 year'
  )
  DELETE FROM ai_assessments
  WHERE id IN (SELECT id FROM assessments_to_delete);
  
  GET DIAGNOSTICS deletion_count = ROW_COUNT;
  
  RETURN QUERY SELECT deletion_count;
END;
$$;

-- Add comment
COMMENT ON FUNCTION cleanup_old_assessments IS 
  'Removes assessments older than 1 year, keeping at least last 12 per user';
