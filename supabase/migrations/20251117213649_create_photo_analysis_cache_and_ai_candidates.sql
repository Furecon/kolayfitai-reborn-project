/*
  # Photo Analysis Cache ve AI Food Candidates Tabloları

  ## 1. Yeni Tablolar
    - `photo_analysis_cache`
      - `id` (uuid, primary key)
      - `image_hash` (text, unique) - Fotoğraf URL'inin hash'i
      - `result` (jsonb) - Analiz sonucu
      - `created_at` (timestamptz)
      
    - `ai_food_candidates`
      - `id` (uuid, primary key)
      - `name_tr` (text) - Türkçe yiyecek adı
      - `name_en` (text) - İngilizce yiyecek adı
      - `image_hash` (text) - Kaynak fotoğraf hash'i
      - `source_image_url` (text) - Kaynak fotoğraf URL'i
      - `ai_nutrition` (jsonb) - AI'dan gelen besin değerleri
      - `ai_confidence` (numeric) - AI güven skoru
      - `occurrence_count` (integer) - Kaç kez görüldü
      - `created_at` (timestamptz)

  ## 2. İndeksler
    - `photo_analysis_cache.image_hash` - Hızlı cache lookup
    - `ai_food_candidates.name_tr` ve `name_en` - Hızlı arama

  ## 3. RLS Policies
    - Cache ve candidates tablolarına erişim için authenticated kullanıcı politikaları
*/

-- Photo Analysis Cache Tablosu
CREATE TABLE IF NOT EXISTS photo_analysis_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_hash text UNIQUE NOT NULL,
  result jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- AI Food Candidates Tablosu
CREATE TABLE IF NOT EXISTS ai_food_candidates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_tr text NOT NULL,
  name_en text,
  image_hash text,
  source_image_url text,
  ai_nutrition jsonb,
  ai_confidence numeric,
  occurrence_count integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_photo_cache_hash ON photo_analysis_cache(image_hash);
CREATE INDEX IF NOT EXISTS idx_photo_cache_created ON photo_analysis_cache(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_candidates_name_tr ON ai_food_candidates(name_tr);
CREATE INDEX IF NOT EXISTS idx_ai_candidates_name_en ON ai_food_candidates(name_en);
CREATE INDEX IF NOT EXISTS idx_ai_candidates_occurrence ON ai_food_candidates(occurrence_count DESC);

-- RLS Enable
ALTER TABLE photo_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_food_candidates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for photo_analysis_cache
CREATE POLICY "Authenticated users can read cache"
  ON photo_analysis_cache FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert cache"
  ON photo_analysis_cache FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for ai_food_candidates
CREATE POLICY "Authenticated users can read candidates"
  ON ai_food_candidates FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert candidates"
  ON ai_food_candidates FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update candidates"
  ON ai_food_candidates FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Foods tablosuna name_tr kolonu ekle (yoksa)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'foods' AND column_name = 'name_tr'
  ) THEN
    ALTER TABLE foods ADD COLUMN name_tr text;
    
    -- Mevcut kayıtlar için name_tr'yi name'den kopyala
    UPDATE foods SET name_tr = name WHERE name_tr IS NULL;
  END IF;
END $$;

-- name_tr indeksi
CREATE INDEX IF NOT EXISTS idx_foods_name_tr ON foods(name_tr);
