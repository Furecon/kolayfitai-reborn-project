-- Clean up duplicate profiles and keep only the most recent one for each user
WITH ranked_profiles AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) as rn
  FROM profiles
),
profiles_to_delete AS (
  SELECT id 
  FROM ranked_profiles 
  WHERE rn > 1
)
DELETE FROM profiles 
WHERE id IN (SELECT id FROM profiles_to_delete);

-- Add a unique constraint to prevent duplicate user profiles in the future
ALTER TABLE profiles 
ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);