-- Add comprehensive beverage data to foods table
INSERT INTO public.foods (name, name_en, calories_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g, category, is_turkish_cuisine) VALUES
-- Çay ve Kahve
('Şekersiz Çay', 'Plain Tea', 1, 0, 0.2, 0, 0, 0, 1, 'İçecekler', true),
('Şekerli Çay (1 küp şeker)', 'Tea with Sugar (1 cube)', 17, 0, 4.2, 0, 0, 4, 1, 'İçecekler', true),
('Türk Kahvesi (şekersiz)', 'Turkish Coffee (no sugar)', 2, 0.1, 0.3, 0, 0, 0, 1, 'İçecekler', true),
('Türk Kahvesi (az şekerli)', 'Turkish Coffee (little sugar)', 15, 0.1, 3.8, 0, 0, 3.5, 1, 'İçecekler', true),
('Türk Kahvesi (orta)', 'Turkish Coffee (medium sugar)', 28, 0.1, 7.1, 0, 0, 7, 1, 'İçecekler', true),
('Türk Kahvesi (şekerli)', 'Turkish Coffee (sweet)', 41, 0.1, 10.4, 0, 0, 10, 1, 'İçecekler', true),
('Nescafe (şekersiz)', 'Instant Coffee (no sugar)', 2, 0.1, 0.3, 0, 0, 0, 1, 'İçecekler', true),
('Nescafe 3ü1 Arada', 'Instant Coffee 3in1', 60, 1.2, 11, 2.8, 0, 9, 25, 'İçecekler', true),
('Süt Kahvesi', 'Coffee with Milk', 25, 1.2, 2.5, 1.2, 0, 2.5, 15, 'İçecekler', true),

-- Meyve Suları
('Portakal Suyu (taze)', 'Fresh Orange Juice', 45, 0.7, 10.4, 0.2, 0.2, 8.1, 1, 'İçecekler', false),
('Elma Suyu', 'Apple Juice', 46, 0.1, 11.3, 0.1, 0.2, 9.6, 2, 'İçecekler', false),
('Şeftali Suyu', 'Peach Juice', 57, 0.6, 13.8, 0.1, 1.4, 12.7, 9, 'İçecekler', false),
('Vişne Suyu', 'Cherry Juice', 50, 1, 12.2, 0.3, 0, 10, 3, 'İçecekler', false),
('Nar Suyu', 'Pomegranate Juice', 67, 0.6, 16.6, 0.3, 0, 14.3, 3, 'İçecekler', false),
('Şalgam Suyu', 'Turnip Juice', 15, 0.8, 3.2, 0.1, 1.1, 2, 850, 'İçecekler', true),

-- Gazlı İçecekler
('Kola', 'Cola', 42, 0, 10.6, 0, 0, 10.6, 4, 'İçecekler', false),
('Fanta', 'Orange Soda', 47, 0, 11.7, 0, 0, 11.7, 3, 'İçecekler', false),
('Sprite', 'Lemon-Lime Soda', 37, 0, 9.2, 0, 0, 9.2, 13, 'İçecekler', false),
('Diet Kola', 'Diet Cola', 0.4, 0, 0.1, 0, 0, 0, 12, 'İçecekler', false),
('Soda', 'Club Soda', 0, 0, 0, 0, 0, 0, 21, 'İçecekler', false),
('Ayran', 'Buttermilk', 36, 1.8, 2.8, 2.2, 0, 2.8, 85, 'İçecekler', true),

-- Enerji ve Spor İçecekleri
('Red Bull', 'Red Bull', 45, 0.4, 11.3, 0, 0, 11, 105, 'İçecekler', false),
('Powerade', 'Sports Drink', 25, 0, 6.3, 0, 0, 6.3, 54, 'İçecekler', false),

-- Alkollü İçecekler
('Bira (lager)', 'Beer (lager)', 43, 0.5, 3.6, 0, 0, 0, 4, 'İçecekler', false),
('Şarap (kırmızı)', 'Red Wine', 85, 0.1, 2.6, 0, 0, 0.6, 4, 'İçecekler', false),
('Şarap (beyaz)', 'White Wine', 82, 0.1, 2.6, 0, 0, 1.4, 5, 'İçecekler', false),
('Rakı', 'Raki', 231, 0, 0, 0, 0, 0, 0, 'İçecekler', true),

-- Diğer İçecekler
('Su', 'Water', 0, 0, 0, 0, 0, 0, 0, 'İçecekler', false),
('Maden Suyu', 'Mineral Water', 0, 0, 0, 0, 0, 0, 7, 'İçecekler', false),
('Süt (tam yağlı)', 'Whole Milk', 61, 3.2, 4.5, 3.2, 0, 4.5, 44, 'İçecekler', false),
('Süt (yarım yağlı)', 'Semi-skimmed Milk', 47, 3.4, 4.8, 1.7, 0, 4.8, 44, 'İçecekler', false),
('Süt (yağsız)', 'Skimmed Milk', 35, 3.4, 5, 0.1, 0, 5, 44, 'İçecekler', false);