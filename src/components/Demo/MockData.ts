export const mockUser = {
  id: 'demo-user',
  name: 'Ayşe Demir',
  email: 'ayse@example.com',
  age: 28,
  height: 165,
  weight: 62,
  goal: 'lose' as const,
  activity_level: 'moderate' as const,
  daily_calorie_goal: 2000,
  daily_protein_goal: 125,
  daily_carb_goal: 200,
  daily_fat_goal: 67
}

export const mockMeals = [
  {
    id: '1',
    name: 'Yumurtalı Tost',
    meal_type: 'breakfast',
    calories: 320,
    protein: 18,
    carbs: 28,
    fat: 16,
    created_at: '2024-01-28T08:00:00Z',
    image_url: '/placeholder.svg'
  },
  {
    id: '2',
    name: 'Tavuk Salatası',
    meal_type: 'lunch',
    calories: 450,
    protein: 35,
    carbs: 25,
    fat: 18,
    created_at: '2024-01-28T12:30:00Z',
    image_url: '/placeholder.svg'
  },
  {
    id: '3',
    name: 'Izgara Somon',
    meal_type: 'dinner',
    calories: 680,
    protein: 42,
    carbs: 35,
    fat: 28,
    created_at: '2024-01-28T19:00:00Z',
    image_url: '/placeholder.svg'
  },
  {
    id: '4',
    name: 'Badem ve Muz',
    meal_type: 'snack',
    calories: 180,
    protein: 6,
    carbs: 18,
    fat: 12,
    created_at: '2024-01-28T15:30:00Z',
    image_url: '/placeholder.svg'
  }
]

export const mockDailyStats = {
  totalCalories: 1630,
  totalProtein: 101,
  totalCarbs: 106,
  totalFat: 74,
  calorieGoal: 2000,
  proteinGoal: 125,
  carbGoal: 200,
  fatGoal: 67
}

export const mockMealSuggestions = [
  {
    id: '1',
    name: 'Avokadolu Quinoa Salatası',
    description: 'Protein açısından zengin, sağlıklı bir öğle yemeği seçeneği',
    calories: 420,
    protein: 18,
    carbs: 45,
    fat: 22,
    prep_time: 15,
    difficulty: 'Kolay',
    image_url: '/placeholder.svg',
    ingredients: ['1 su bardağı quinoa', '1/2 avokado', 'Karışık yeşillik', 'Cherry domates']
  },
  {
    id: '2',
    name: 'Fırınlanmış Tavuk Göğsü',
    description: 'Yüksek protein, düşük karbonhidrat akşam yemeği',
    calories: 380,
    protein: 42,
    carbs: 8,
    fat: 18,
    prep_time: 25,
    difficulty: 'Orta',
    image_url: '/placeholder.svg',
    ingredients: ['200g tavuk göğsü', 'Baharatlı sebzeler', 'Zeytinyağı', 'Limon']
  },
  {
    id: '3',
    name: 'Protein Smoothie',
    description: 'Antrenman sonrası ideal protein kaynağı',
    calories: 280,
    protein: 25,
    carbs: 35,
    fat: 8,
    prep_time: 5,
    difficulty: 'Kolay',
    image_url: '/placeholder.svg',
    ingredients: ['1 muz', 'Protein tozu', 'Badem sütü', 'Yaban mersini']
  }
]

export const mockAIInsights = [
  {
    type: 'tip',
    title: 'Protein Alımınızı Artırın',
    message: 'Bugün protein hedefinizin %81\'ine ulaştınız. Akşam yemeğine 20g daha protein eklemeyi deneyin.',
    priority: 'high'
  },
  {
    type: 'achievement',
    title: 'Harika İlerleme!',
    message: 'Bu hafta kalori hedefinizi 6 gün tutturduğunuz için tebrikler! 🎉',
    priority: 'medium'
  },
  {
    type: 'suggestion',
    title: 'Öğün Zamanlaması',
    message: 'Öğle yemeğinizi biraz daha erken almanız metabolizmanızı hızlandırabilir.',
    priority: 'low'
  }
]

export const mockHistoryMeals = [
  {
    date: '2024-01-27',
    meals: [
      { name: 'Müsli ve Süt', calories: 290, meal_type: 'breakfast' },
      { name: 'Mercimek Çorbası', calories: 380, meal_type: 'lunch' },
      { name: 'Izgara Köfte', calories: 520, meal_type: 'dinner' }
    ],
    totalCalories: 1190
  },
  {
    date: '2024-01-26',
    meals: [
      { name: 'Omlet', calories: 350, meal_type: 'breakfast' },
      { name: 'Makarna Salatası', calories: 420, meal_type: 'lunch' },
      { name: 'Balık ve Sebze', calories: 480, meal_type: 'dinner' }
    ],
    totalCalories: 1250
  }
]