-- meal_type Değerlerini İngilizce'ye Standartlaştırma

-- 1. Trigger'ı geçici devre dışı bırak
DROP TRIGGER IF EXISTS update_meal_logs_updated_at ON meal_logs;

-- 2. Önce eski constraint'leri kaldır
ALTER TABLE meal_logs 
DROP CONSTRAINT IF EXISTS meal_logs_meal_type_check;

ALTER TABLE favorite_meals 
DROP CONSTRAINT IF EXISTS favorite_meals_meal_type_check;

ALTER TABLE meal_suggestions 
DROP CONSTRAINT IF EXISTS meal_suggestions_meal_type_check;

-- 3. meal_logs tablosundaki mevcut Türkçe değerleri İngilizce'ye çevir
UPDATE meal_logs
SET meal_type = CASE meal_type
  WHEN 'kahvaltı' THEN 'breakfast'
  WHEN 'öğle' THEN 'lunch'
  WHEN 'akşam' THEN 'dinner'
  WHEN 'atıştırmalık' THEN 'snack'
  WHEN 'içecek' THEN 'drink'
  ELSE meal_type
END
WHERE meal_type IN ('kahvaltı', 'öğle', 'akşam', 'atıştırmalık', 'içecek');

-- 4. Yeni constraint'leri ekle (İngilizce değerlerle)
ALTER TABLE meal_logs
ADD CONSTRAINT meal_logs_meal_type_check
CHECK (meal_type = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack'::text, 'drink'::text]));

ALTER TABLE favorite_meals
ADD CONSTRAINT favorite_meals_meal_type_check
CHECK (meal_type = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack'::text, 'drink'::text]));

ALTER TABLE meal_suggestions
ADD CONSTRAINT meal_suggestions_meal_type_check
CHECK (meal_type = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack'::text, 'drink'::text]));
