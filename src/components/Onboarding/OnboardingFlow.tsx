
import { useNavigation } from '@/hooks/useNavigation'
import { OnboardingProvider, useOnboarding } from './OnboardingProvider'
import { OnboardingWelcome } from './OnboardingWelcome'
import { OnboardingAge } from './OnboardingAge'
import { OnboardingGender } from './OnboardingGender'
import { OnboardingHeight } from './OnboardingHeight'
import { OnboardingWeight } from './OnboardingWeight'
import { OnboardingGoal } from './OnboardingGoal'
import { OnboardingActivity } from './OnboardingActivity'
import { OnboardingEducation } from './OnboardingEducation'
import { OnboardingComplete } from './OnboardingComplete'

function OnboardingSteps() {
  const { currentStep, setCurrentStep } = useOnboarding()
  
  // Enhanced navigation with hardware back button support
  useNavigation({
    enableHardwareBackButton: true,
    customBackHandler: () => {
      // Go back to previous onboarding step if possible
      if (currentStep > 1) {
        setCurrentStep(currentStep - 1)
      }
      // Otherwise prevent app exit during onboarding
    }
  })

  switch (currentStep) {
    case 1:
      return <OnboardingWelcome />
    case 2:
      return <OnboardingAge />
    case 3:
      return <OnboardingGender />
    case 4:
      return <OnboardingHeight />
    case 5:
      return <OnboardingWeight />
    case 6:
      return <OnboardingGoal />
    case 7:
      return <OnboardingActivity />
    case 8:
      return <OnboardingEducation />
    case 9:
      return <OnboardingComplete />
    default:
      return <OnboardingWelcome />
  }
}

export function OnboardingFlow() {
  return (
    <OnboardingProvider>
      <OnboardingSteps />
    </OnboardingProvider>
  )
}
