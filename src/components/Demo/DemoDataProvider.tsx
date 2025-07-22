
import React, { createContext, useContext, useState } from 'react'

interface DemoData {
  userProfile: {
    name: string
    age: number
    weight: number
    height: number
    dailyCalorieGoal: number
    dailyProteinGoal: number
    dailyCarbsGoal: number
    dailyFatGoal: number
  }
  dailyStats: {
    totalCalories: number
    goalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    totalFiber: number
    totalSugar: number
    totalSodium: number
    proteinGoal: number
    carbsGoal: number
    fatGoal: number
  }
  todaysMeals: Array<{
    id: string
    mealType: string
    foodItems: Array<{
      name: string
      amount: number
      unit: string
      calories: number
      protein: number
      carbs: number
      fat: number
    }>
    totalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    photoUrl?: string
    time: string
  }>
  mealSuggestions: Array<{
    id: string
    name: string
    description: string
    calories: number
    protein: number
    carbs: number
    fat: number
    prepTime: string
    difficulty: string
    imageUrl?: string
    recipe: {
      ingredients: string[]
      instructions: string[]
      servings: number
    }
  }>
  favoriteRecipes: Array<{
    id: string
    name: string
    description: string
    calories: number
    imageUrl?: string
    rating: number
  }>
}

const demoData: DemoData = {
  userProfile: {
    name: "Ayşe Yılmaz",
    age: 28,
    weight: 65,
    height: 165,
    dailyCalorieGoal: 1800,
    dailyProteinGoal: 120,
    dailyCarbsGoal: 180,
    dailyFatGoal: 60
  },
  dailyStats: {
    totalCalories: 1450,
    goalCalories: 1800,
    totalProtein: 95,
    totalCarbs: 142,
    totalFat: 48,
    totalFiber: 28,
    totalSugar: 35,
    totalSodium: 1850,
    proteinGoal: 120,
    carbsGoal: 180,
    fatGoal: 60
  },
  todaysMeals: [
    {
      id: '1',
      mealType: 'Kahvaltı',
      time: '08:30',
      foodItems: [
        { name: 'Yulaf Ezmesi', amount: 50, unit: 'g', calories: 190, protein: 6.8, carbs: 32, fat: 3.4 },
        { name: 'Muz', amount: 1, unit: 'adet', calories: 89, protein: 1.1, carbs: 23, fat: 0.3 },
        { name: 'Badem', amount: 15, unit: 'g', calories: 87, protein: 3.2, carbs: 3.3, fat: 7.5 }
      ],
      totalCalories: 366,
      totalProtein: 11.1,
      totalCarbs: 58.3,
      totalFat: 11.2,
      photoUrl: '/lovable-uploads/breakfast-demo.jpg'
    },
    {
      id: '2',
      mealType: 'Öğle',
      time: '13:15',
      foodItems: [
        { name: 'Izgara Tavuk Göğsü', amount: 120, unit: 'g', calories: 198, protein: 37, carbs: 0, fat: 4.3 },
        { name: 'Bulgur Pilavı', amount: 80, unit: 'g', calories: 280, protein: 8, carbs: 56, fat: 2.2 },
        { name: 'Çoban Salatası', amount: 150, unit: 'g', calories: 45, protein: 2, carbs: 8, fat: 1.5 }
      ],
      totalCalories: 523,
      totalProtein: 47,
      totalCarbs: 64,
      totalFat: 8,
      photoUrl: '/lovable-uploads/lunch-demo.jpg'
    },
    {
      id: '3',
      mealType: 'Akşam',
      time: '19:45',
      foodItems: [
        { name: 'Izgara Somon', amount: 100, unit: 'g', calories: 208, protein: 25, carbs: 0, fat: 12 },
        { name: 'Buharda Brokoli', amount: 100, unit: 'g', calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
        { name: 'Kinoa', amount: 60, unit: 'g', calories: 220, protein: 8, carbs: 39, fat: 3.6 }
      ],
      totalCalories: 462,
      totalProtein: 35.8,
      totalCarbs: 46,
      totalFat: 16,
      photoUrl: '/lovable-uploads/dinner-demo.jpg'
    }
  ],
  mealSuggestions: [
    {
      id: '1',
      name: 'Protein Smoothie Bowl',
      description: 'Yüksek protein içerikli, lezzetli ve doyurucu smoothie bowl',
      calories: 320,
      protein: 25,
      carbs: 35,
      fat: 8,
      prepTime: '10 dk',
      difficulty: 'Kolay',
      imageUrl: '/lovable-uploads/smoothie-bowl.jpg',
      recipe: {
        ingredients: ['1 muz', '1 ölçek protein tozu', '150ml badem sütü', '1 yemek kaşığı chia tohumu', 'Taze meyveler (süsleme için)'],
        instructions: ['Muz, protein tozu ve badem sütünü blenderda karıştırın', 'Kaseye döküp chia tohumu serpin', 'Taze meyvelerle süsleyin'],
        servings: 1
      }
    },
    {
      id: '2',
      name: 'Akdeniz Salatası',
      description: 'Taze sebzeler ve zeytinyağı ile sağlıklı Akdeniz salatası',
      calories: 280,
      protein: 12,
      carbs: 15,
      fat: 20,
      prepTime: '15 dk',
      difficulty: 'Kolay',
      imageUrl: '/lovable-uploads/mediterranean-salad.jpg',
      recipe: {
        ingredients: ['2 domates', '1 salatalık', '100g beyaz peynir', '10 siyah zeytin', '2 yemek kaşığı zeytinyağı'],
        instructions: ['Sebzeleri küp küp doğrayın', 'Peyniri parçalayın', 'Zeytinyağı ile karıştırın'],
        servings: 2
      }
    },
    {
      id: '3',
      name: 'Fırında Sebze Kebabı',
      description: 'Renkli sebzelerle hazırlanan sağlıklı fırın yemeği',
      calories: 180,
      protein: 8,
      carbs: 25,
      fat: 6,
      prepTime: '30 dk',
      difficulty: 'Orta',
      imageUrl: '/lovable-uploads/veggie-kebab.jpg',
      recipe: {
        ingredients: ['1 patlıcan', '2 kabak', '1 biber', '200g mantarlar', '3 yemek kaşığı zeytinyağı'],
        instructions: ['Sebzeleri dilimleyin', 'Şişlere dizin', 'Zeytinyağı ile fırında pişirin'],
        servings: 4
      }
    }
  ],
  favoriteRecipes: [
    {
      id: '1',
      name: 'Overnight Oats',
      description: 'Gecede hazırlanan pratik kahvaltı',
      calories: 250,
      imageUrl: '/lovable-uploads/overnight-oats.jpg',
      rating: 4.8
    },
    {
      id: '2',
      name: 'Avokado Toast',
      description: 'Protein ve sağlıklı yağ kaynağı',
      calories: 320,
      imageUrl: '/lovable-uploads/avocado-toast.jpg',
      rating: 4.9
    },
    {
      id: '3',
      name: 'Lentil Çorbası',
      description: 'Besleyici ve doyurucu ev yapımı çorba',
      calories: 180,
      imageUrl: '/lovable-uploads/lentil-soup.jpg',
      rating: 4.7
    }
  ]
}

interface DemoContextType {
  demoData: DemoData
  isDemoMode: boolean
  setDemoMode: (enabled: boolean) => void
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

export function DemoDataProvider({ children }: { children: React.ReactNode }) {
  const [isDemoMode, setDemoMode] = useState(false)

  return (
    <DemoContext.Provider value={{ demoData, isDemoMode, setDemoMode }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemoData() {
  const context = useContext(DemoContext)
  if (!context) {
    throw new Error('useDemoData must be used within a DemoDataProvider')
  }
  return context
}
