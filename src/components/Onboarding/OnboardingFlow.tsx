
import { useState } from 'react'
import { WelcomeScreen } from './WelcomeScreen'
import { AgeScreen } from './AgeScreen'
import { GenderScreen } from './GenderScreen'
import { HeightScreen } from './HeightScreen'
import { WeightScreen } from './WeightScreen'
import { GoalScreen } from './GoalScreen'
import { ActivityScreen } from './ActivityScreen'
import { WhyInfoScreen } from './WhyInfoScreen'
import { CompletionScreen } from './CompletionScreen'

export type OnboardingData = {
  age: number | null
  gender: string | null
  height: number | null
  weight: number | null
  goal: string | null
  activityLevel: string | null
}

type OnboardingStep = 
  | 'welcome'
  | 'age' 
  | 'gender'
  | 'height'
  | 'weight'
  | 'goal'
  | 'activity'
  | 'why-info'
  | 'completion'

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
  const [data, setData] = useState<OnboardingData>({
    age: null,
    gender: null,
    height: null,
    weight: null,
    goal: null,
    activityLevel: null
  })

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    const steps: OnboardingStep[] = [
      'welcome', 'age', 'gender', 'height', 'weight', 
      'goal', 'activity', 'why-info', 'completion'
    ]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }

  const handleComplete = () => {
    onComplete(data)
  }

  switch (currentStep) {
    case 'welcome':
      return <WelcomeScreen onNext={nextStep} />
    case 'age':
      return <AgeScreen data={data} onUpdate={updateData} onNext={nextStep} />
    case 'gender':
      return <GenderScreen data={data} onUpdate={updateData} onNext={nextStep} />
    case 'height':
      return <HeightScreen data={data} onUpdate={updateData} onNext={nextStep} />
    case 'weight':
      return <WeightScreen data={data} onUpdate={updateData} onNext={nextStep} />
    case 'goal':
      return <GoalScreen data={data} onUpdate={updateData} onNext={nextStep} />
    case 'activity':
      return <ActivityScreen data={data} onUpdate={updateData} onNext={nextStep} />
    case 'why-info':
      return <WhyInfoScreen onNext={nextStep} />
    case 'completion':
      return <CompletionScreen data={data} onComplete={handleComplete} />
    default:
      return <WelcomeScreen onNext={nextStep} />
  }
}
