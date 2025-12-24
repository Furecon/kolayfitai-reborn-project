/**
 * Calculate water content from food/drink items
 * Based on general hydration content of common foods and beverages
 */

export interface WaterContentEstimate {
  waterContentMl: number;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Estimate water content from food/drink name and amount
 */
export function estimateWaterContent(
  foodName: string,
  portionGrams: number
): WaterContentEstimate {
  const nameLower = foodName.toLowerCase();

  // High water content foods/drinks (>80% water)
  const highWaterFoods = [
    { keywords: ['su', 'water'], percentage: 100 },
    { keywords: ['çay', 'tea'], percentage: 99 },
    { keywords: ['kahve', 'coffee'], percentage: 98 },
    { keywords: ['meyve suyu', 'juice', 'limonata', 'lemonade'], percentage: 90 },
    { keywords: ['süt', 'milk', 'ayran'], percentage: 88 },
    { keywords: ['çorba', 'soup'], percentage: 85 },
    { keywords: ['karpuz', 'watermelon'], percentage: 92 },
    { keywords: ['kavun', 'melon'], percentage: 90 },
    { keywords: ['domates', 'tomato'], percentage: 94 },
    { keywords: ['salatalık', 'cucumber'], percentage: 96 },
    { keywords: ['portakal', 'orange'], percentage: 87 },
    { keywords: ['elma', 'apple'], percentage: 86 },
    { keywords: ['şeftali', 'peach'], percentage: 89 },
    { keywords: ['üzüm', 'grape'], percentage: 81 },
    { keywords: ['çilek', 'strawberry'], percentage: 91 },
  ];

  // Medium water content foods (50-80% water)
  const mediumWaterFoods = [
    { keywords: ['yoğurt', 'yogurt'], percentage: 85 },
    { keywords: ['muz', 'banana'], percentage: 75 },
    { keywords: ['patates', 'potato'], percentage: 77 },
    { keywords: ['tavuk', 'chicken'], percentage: 65 },
    { keywords: ['balık', 'fish'], percentage: 70 },
    { keywords: ['yumurta', 'egg'], percentage: 75 },
    { keywords: ['peynir', 'cheese'], percentage: 40 },
    { keywords: ['pilav', 'rice'], percentage: 68 },
    { keywords: ['makarna', 'pasta'], percentage: 62 },
  ];

  // Check high water content foods
  for (const food of highWaterFoods) {
    if (food.keywords.some(keyword => nameLower.includes(keyword))) {
      const waterMl = (portionGrams * food.percentage) / 100;
      return {
        waterContentMl: Math.round(waterMl),
        confidence: 'high',
      };
    }
  }

  // Check medium water content foods
  for (const food of mediumWaterFoods) {
    if (food.keywords.some(keyword => nameLower.includes(keyword))) {
      const waterMl = (portionGrams * food.percentage) / 100;
      return {
        waterContentMl: Math.round(waterMl),
        confidence: 'medium',
      };
    }
  }

  // Default: assume 60% water content for unrecognized foods
  return {
    waterContentMl: Math.round(portionGrams * 0.6),
    confidence: 'low',
  };
}

/**
 * Calculate daily water goal based on weight
 * Formula: 25-30ml per kg of body weight
 */
export function calculateDailyWaterGoal(weightKg: number): number {
  const mlPerKg = 27.5; // Average of 25-30ml
  const goalMl = weightKg * mlPerKg;

  // Round to nearest 250ml for convenience
  return Math.round(goalMl / 250) * 250;
}

/**
 * Update water intake from food consumption
 */
export async function updateWaterFromFood(
  supabase: any,
  userId: string,
  foodName: string,
  portionGrams: number
): Promise<void> {
  const { waterContentMl } = estimateWaterContent(foodName, portionGrams);

  if (waterContentMl < 10) return; // Ignore negligible water content

  const today = new Date().toISOString().split('T')[0];

  try {
    // Get or create today's water intake record
    const { data: existing } = await supabase
      .from('water_intake')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();

    if (existing) {
      // Update existing record
      await supabase
        .from('water_intake')
        .update({
          food_intake_ml: existing.food_intake_ml + waterContentMl,
        })
        .eq('id', existing.id);
    } else {
      // Create new record using upsert to prevent race condition
      const { data: profile } = await supabase
        .from('profiles')
        .select('weight')
        .eq('user_id', userId)
        .maybeSingle();

      const dailyGoal = calculateDailyWaterGoal(profile?.weight || 70);

      await supabase.from('water_intake').upsert({
        user_id: userId,
        date: today,
        manual_intake_ml: 0,
        food_intake_ml: waterContentMl,
        daily_goal_ml: dailyGoal,
      }, {
        onConflict: 'user_id,date'
      });
    }
  } catch (error) {
    console.error('Error updating water from food:', error);
  }
}
