import { useEffect } from 'react'
import { useTutorial } from '@/components/Tutorial/TutorialProvider'
import { tutorialStorage } from '@/lib/tutorialStorage'

export function useTutorialTrigger(featureId: string, enabled: boolean = true) {
  const { startTutorial } = useTutorial()

  useEffect(() => {
    if (!enabled) return

    const shouldShow = tutorialStorage.shouldShowTutorial(featureId)
    const isDisabled = tutorialStorage.isDisabled(featureId)

    if (shouldShow && !isDisabled) {
      const timer = setTimeout(() => {
        startTutorial(featureId)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [featureId, enabled, startTutorial])
}
