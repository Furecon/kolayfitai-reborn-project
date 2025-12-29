/*
  # Add Health Disclaimer Acceptance to Diet Profiles

  1. Changes
    - Add `accepted_health_disclaimer` column to `diet_profiles` table
      - Boolean field to track if user has accepted the health disclaimer
      - Defaults to `false` for new records
      - Required before generating diet plans

  2. Purpose
    - Legal protection: Ensure users understand diet plans are recommendations
    - User consent tracking: One-time acceptance requirement
    - Compliance: Meet health advisory standards for diet applications

  3. Notes
    - Existing users will have `false` by default and will be prompted on next plan generation
    - Users must explicitly accept disclaimer before generating their first diet plan
    - Acceptance is permanent once given (not asked again)
*/

-- Add health disclaimer acceptance column to diet_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'diet_profiles' AND column_name = 'accepted_health_disclaimer'
  ) THEN
    ALTER TABLE diet_profiles
    ADD COLUMN accepted_health_disclaimer BOOLEAN DEFAULT false NOT NULL;

    COMMENT ON COLUMN diet_profiles.accepted_health_disclaimer IS
      'Indicates if user has accepted the health disclaimer stating that diet plans are recommendations only';
  END IF;
END $$;