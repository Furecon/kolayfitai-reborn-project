
import { createContext, useContext, useState, ReactNode } from 'react'

interface OnboardingData {
  age: number | null
  gender: 'erkek' | 'kadın' | null
  height: number | null
  weight: number | null
  goal: 'lose' | 'maintain' | 'gain' | null
  activityLevel: 'sedanter' | 'orta_aktif' | 'aktif' | null
}

interface OnboardingContextType {
  currentStep: number
  onboardingData: OnboardingData
  setCurrentStep: (step: number) => void
  updateOnboardingData: (data: Partial<OnboardingData>) => void
  calculateBMR: () => number
  calculateDailyCalories: () => number
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    age: null,
    gender: null,
    height: null,
    weight: null,
    goal: null,
    activityLevel: null
  })

  const updateOnboardingData = (data: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...data }))
  }

  const calculateBMR = () => {
    const { age, gender, height, weight } = onboardingData
    if (!age || !gender || !height || !weight) return 0

    if (gender === 'erkek') {
      return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    } else {
      return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age)
    }
  }

  const calculateDailyCalories = () => {
    const bmr = calculateBMR()
    const { activityLevel, goal } = onboardingData
    
    if (!activityLevel || !goal) return 0

    let activityMultiplier = 1.2
    if (activityLevel === 'orta_aktif') activityMultiplier = 1.55
    if (activityLevel === 'aktif') activityMultiplier = 1.725

    let dailyCalories = bmr * activityMultiplier

    if (goal === 'lose') dailyCalories -= 500
    if (goal === 'gain') dailyCalories += 500

    return Math.round(dailyCalories)
  }

  return (
    <OnboardingContext.Provider value={{
      currentStep,
      onboardingData,
      setCurrentStep,
      updateOnboardingData,
      calculateBMR,
      calculateDailyCalories
    }}>
      {children}
    </OnboardingContext.Provider>
  )
}

export const useOnboarding = () => {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}
