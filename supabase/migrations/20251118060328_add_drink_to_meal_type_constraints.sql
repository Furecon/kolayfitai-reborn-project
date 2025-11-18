/*
  # İçecek (drink) meal_type Desteği Ekleme

  ## Değişiklikler
  
  1. `meal_logs` tablosu:
     - meal_type CHECK constraint'ini güncelle
     - Yeni değer ekle: 'içecek' (Türkçe)
  
  2. `favorite_meals` tablosu:
     - meal_type CHECK constraint'ini güncelle
     - Yeni değer ekle: 'drink' (İngilizce)
  
  3. `meal_suggestions` tablosu:
     - meal_type CHECK constraint'ini güncelle
     - Yeni değer ekle: 'drink' (İngilizce)

  ## Notlar
  - meal_logs Türkçe değerler kullanıyor: 'kahvaltı', 'öğle', 'akşam', 'atıştırmalık', 'içecek'
  - favorite_meals ve meal_suggestions İngilizce değerler kullanıyor: 'breakfast', 'lunch', 'dinner', 'snack', 'drink'
*/

-- 1. meal_logs tablosu - Türkçe 'içecek' ekle
ALTER TABLE meal_logs 
DROP CONSTRAINT IF EXISTS meal_logs_meal_type_check;

ALTER TABLE meal_logs
ADD CONSTRAINT meal_logs_meal_type_check
CHECK (meal_type = ANY (ARRAY['kahvaltı'::text, 'öğle'::text, 'akşam'::text, 'atıştırmalık'::text, 'içecek'::text]));

-- 2. favorite_meals tablosu - İngilizce 'drink' ekle
ALTER TABLE favorite_meals 
DROP CONSTRAINT IF EXISTS favorite_meals_meal_type_check;

ALTER TABLE favorite_meals
ADD CONSTRAINT favorite_meals_meal_type_check
CHECK (meal_type = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack'::text, 'drink'::text]));

-- 3. meal_suggestions tablosu - İngilizce 'drink' ekle
ALTER TABLE meal_suggestions 
DROP CONSTRAINT IF EXISTS meal_suggestions_meal_type_check;

ALTER TABLE meal_suggestions
ADD CONSTRAINT meal_suggestions_meal_type_check
CHECK (meal_type = ANY (ARRAY['breakfast'::text, 'lunch'::text, 'dinner'::text, 'snack'::text, 'drink'::text]));
