-- Add show_analysis_help column to profiles table
-- This column stores user preference for showing analysis help/tutorial cards

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS show_analysis_help boolean DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN profiles.show_analysis_help IS 'User preference for showing analysis help/tutorial cards. Default is true (show help).';
