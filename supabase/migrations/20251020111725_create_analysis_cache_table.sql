/*
  # Analysis Cache System
  
  Creates a caching system for food analysis to reduce API costs.
  
  1. New Tables
    - `analysis_cache`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `image_hash` (text, perceptual hash of the image)
      - `image_size` (integer, to track different resolutions)
      - `analysis_type` (text, 'quick' or 'detailed')
      - `detected_foods` (jsonb, the cached analysis result)
      - `confidence` (decimal, confidence score)
      - `suggestions` (text)
      - `hit_count` (integer, how many times this cache was used)
      - `created_at` (timestamptz)
      - `last_used_at` (timestamptz)
      - `expires_at` (timestamptz, cache expiration)
  
  2. Security
    - Enable RLS on `analysis_cache` table
    - Add policies for authenticated users to read/write their own cache
    
  3. Indexes
    - Index on user_id and image_hash for fast lookups
    - Index on expires_at for cleanup
*/

-- Create analysis_cache table
CREATE TABLE IF NOT EXISTS public.analysis_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_hash text NOT NULL,
  image_size integer NOT NULL DEFAULT 512,
  analysis_type text NOT NULL DEFAULT 'quick',
  detected_foods jsonb NOT NULL,
  confidence decimal(3,2) DEFAULT 0.85,
  suggestions text,
  hit_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz DEFAULT now(),
  expires_at timestamptz DEFAULT (now() + interval '30 days')
);

-- Enable RLS
ALTER TABLE public.analysis_cache ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own cache
CREATE POLICY "Users can read own cache"
  ON public.analysis_cache
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own cache
CREATE POLICY "Users can insert own cache"
  ON public.analysis_cache
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own cache (hit_count, last_used_at)
CREATE POLICY "Users can update own cache"
  ON public.analysis_cache
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own cache
CREATE POLICY "Users can delete own cache"
  ON public.analysis_cache
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analysis_cache_user_hash 
  ON public.analysis_cache(user_id, image_hash);

CREATE INDEX IF NOT EXISTS idx_analysis_cache_expires 
  ON public.analysis_cache(expires_at);

CREATE INDEX IF NOT EXISTS idx_analysis_cache_user_created 
  ON public.analysis_cache(user_id, created_at DESC);

-- Add check constraint for analysis_type
ALTER TABLE public.analysis_cache 
  ADD CONSTRAINT analysis_cache_type_check 
  CHECK (analysis_type IN ('quick', 'detailed'));
