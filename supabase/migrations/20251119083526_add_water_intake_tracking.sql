/*
  # Su Takibi Sistemi (Water Intake Tracking)

  1. Yeni Tablo
    - `water_intake`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `date` (date) - Gün bazlı takip
      - `manual_intake_ml` (integer) - Kullanıcının manuel eklediği su miktarı (ml)
      - `food_intake_ml` (integer) - Yemek/içeceklerden gelen su miktarı (ml)
      - `daily_goal_ml` (integer) - Günlük su hedefi (ml)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Güvenlik
    - RLS aktif
    - Kullanıcılar sadece kendi su takiplerini görebilir/ekleyebilir

  3. İndeksler
    - user_id ve date üzerinde unique index (günde bir kayıt)
    - Performans için foreign key index

  4. Notlar
    - Su hedefi kullanıcının kilosuna göre hesaplanacak (25-30 ml/kg)
    - Yemek ve içeceklerin su içeriği otomatik hesaplanacak
    - Günlük bazda takip yapılacak
*/

-- Water intake tracking table
CREATE TABLE IF NOT EXISTS water_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  manual_intake_ml integer DEFAULT 0,
  food_intake_ml integer DEFAULT 0,
  daily_goal_ml integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_date UNIQUE (user_id, date)
);

-- Enable RLS
ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own water intake"
  ON water_intake FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water intake"
  ON water_intake FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own water intake"
  ON water_intake FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own water intake"
  ON water_intake FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_water_intake_user_id ON water_intake(user_id);
CREATE INDEX IF NOT EXISTS idx_water_intake_date ON water_intake(date);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_water_intake_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS set_water_intake_updated_at ON water_intake;
CREATE TRIGGER set_water_intake_updated_at
  BEFORE UPDATE ON water_intake
  FOR EACH ROW
  EXECUTE FUNCTION update_water_intake_updated_at();