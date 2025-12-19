import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { TutorialEngine } from './TutorialEngine'
import { tutorialStorage } from '@/lib/tutorialStorage'
import { getTutorialByFeatureId } from '@/lib/tutorialConfig'
import type { Tutorial } from '@/lib/tutorialConfig'

interface TutorialContextType {
  startTutorial: (featureId: string) => void
  stopTutorial: () => void
  registerTarget: (key: string, element: HTMLElement | null) => void
  unregisterTarget: (key: string) => void
  isActive: boolean
  currentFeatureId: string | null
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined)

export function TutorialProvider({ children }: { children: React.ReactNode }) {
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const targetRegistry = useRef<Map<string, HTMLElement>>(new Map())

  const registerTarget = useCallback((key: string, element: HTMLElement | null) => {
    if (element) {
      targetRegistry.current.set(key, element)
    } else {
      targetRegistry.current.delete(key)
    }
  }, [])

  const unregisterTarget = useCallback((key: string) => {
    targetRegistry.current.delete(key)
  }, [])

  const startTutorial = useCallback((featureId: string) => {
    const tutorial = getTutorialByFeatureId(featureId)
    if (!tutorial) {
      console.warn(`[Tutorial] Tutorial not found: ${featureId}`)
      return
    }

    if (tutorialStorage.isDisabled(featureId)) {
      console.log(`[Tutorial] Tutorial disabled: ${featureId}`)
      return
    }

    console.log(`[Tutorial] Starting tutorial: ${featureId}`)
    setActiveTutorial(tutorial)
    setCurrentStepIndex(0)
    tutorialStorage.markAsShown(featureId, 0)
  }, [])

  const stopTutorial = useCallback(() => {
    console.log('[Tutorial] Stopping tutorial')
    setActiveTutorial(null)
    setCurrentStepIndex(0)
  }, [])

  const handleStepComplete = useCallback(() => {
    if (!activeTutorial) return

    const nextStep = currentStepIndex + 1
    if (nextStep < activeTutorial.steps.length) {
      setCurrentStepIndex(nextStep)
      tutorialStorage.markAsShown(activeTutorial.featureId, nextStep)
    } else {
      tutorialStorage.markAsCompleted(activeTutorial.featureId)
      stopTutorial()
    }
  }, [activeTutorial, currentStepIndex, stopTutorial])

  const handleSkip = useCallback(() => {
    if (!activeTutorial) return

    console.log(`[Tutorial] Skipping tutorial: ${activeTutorial.featureId}`)
    tutorialStorage.markAsSkipped(activeTutorial.featureId)
    stopTutorial()
  }, [activeTutorial, stopTutorial])

  const handleComplete = useCallback(() => {
    if (!activeTutorial) return

    console.log(`[Tutorial] Completing tutorial: ${activeTutorial.featureId}`)
    tutorialStorage.markAsCompleted(activeTutorial.featureId)
    stopTutorial()
  }, [activeTutorial, stopTutorial])

  useEffect(() => {
    console.log('[Tutorial] Registry size:', targetRegistry.current.size)
  }, [activeTutorial])

  return (
    <TutorialContext.Provider
      value={{
        startTutorial,
        stopTutorial,
        registerTarget,
        unregisterTarget,
        isActive: activeTutorial !== null,
        currentFeatureId: activeTutorial?.featureId || null
      }}
    >
      {children}
      {activeTutorial && (
        <TutorialEngine
          tutorial={activeTutorial}
          currentStepIndex={currentStepIndex}
          onStepComplete={handleStepComplete}
          onSkip={handleSkip}
          onComplete={handleComplete}
          targetRegistry={targetRegistry.current}
        />
      )}
    </TutorialContext.Provider>
  )
}

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider')
  }
  return context
}
