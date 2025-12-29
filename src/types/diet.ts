export type Gender = 'male' | 'female' | 'other';

export type WeightGoal = 'lose_weight' | 'gain_weight' | 'maintain_weight';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';

export type DietType =
  | 'normal'
  | 'vegan'
  | 'vegetarian'
  | 'pescatarian'
  | 'low_carb'
  | 'high_protein'
  | 'gluten_free';

export type Allergen =
  | 'dairy'
  | 'gluten'
  | 'eggs'
  | 'nuts'
  | 'peanuts'
  | 'shellfish'
  | 'soy'
  | 'fish'
  | 'sesame';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface DietProfile {
  id?: string;
  user_id?: string;
  age?: number;
  gender?: Gender;
  height_cm?: number;
  weight_kg?: number;
  goal?: WeightGoal;
  activity_level?: ActivityLevel;
  diet_type?: DietType;
  allergens?: Allergen[];
  disliked_foods?: string;
  preferred_cuisines?: string;
  has_seen_onboarding?: boolean;
  hide_diet_tips?: boolean;
  accepted_health_disclaimer?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DietMeal {
  mealType: MealType;
  titleTr: string;
  descriptionTr: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  instructions: string;
}

export interface DietDay {
  dayIndex: number;
  dayName: string;
  totalCalories: number;
  meals: DietMeal[];
  notes?: string;
}

export interface DietPlanData {
  days: DietDay[];
}

export interface DietPlan {
  id?: string;
  user_id?: string;
  plan_data: DietPlanData;
  start_date?: string;
  generated_at?: string;
  is_active?: boolean;
  created_at?: string;
}

export const ALLERGEN_LABELS: Record<Allergen, string> = {
  dairy: 'Süt Ürünleri',
  gluten: 'Gluten',
  eggs: 'Yumurta',
  nuts: 'Fındık/Ceviz',
  peanuts: 'Yer Fıstığı',
  shellfish: 'Kabuklu Deniz Ürünleri',
  soy: 'Soya',
  fish: 'Balık',
  sesame: 'Susam'
};

export const DIET_TYPE_LABELS: Record<DietType, string> = {
  normal: 'Normal',
  vegan: 'Vegan',
  vegetarian: 'Vejetaryen',
  pescatarian: 'Balık Ağırlıklı (Pescetarian)',
  low_carb: 'Düşük Karbonhidrat',
  high_protein: 'Yüksek Protein',
  gluten_free: 'Glutensiz'
};

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Çok Düşük (Hareketsiz)',
  light: 'Hafif (Haftada 1-3 gün egzersiz)',
  moderate: 'Orta (Haftada 3-5 gün egzersiz)',
  very_active: 'Yüksek (Haftada 6-7 gün egzersiz)',
  extra_active: 'Çok Yüksek (Günde 2 kez egzersiz)'
};

export const GOAL_LABELS: Record<WeightGoal, string> = {
  lose_weight: 'Kilo Vermek',
  gain_weight: 'Kilo Almak',
  maintain_weight: 'Kilomu Korumak'
};

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Kahvaltı',
  lunch: 'Öğle Yemeği',
  dinner: 'Akşam Yemeği',
  snack: 'Ara Öğün'
};

export const DAY_NAMES = [
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
  'Pazar'
];
