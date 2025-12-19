import { useEffect, useState, useCallback } from 'react'
import { TutorialSpotlight } from './TutorialSpotlight'
import { TutorialPointer } from './TutorialPointer'
import { TutorialTooltip } from './TutorialTooltip'
import type { Tutorial, TutorialStep } from '@/lib/tutorialConfig'
import { tutorialConfig } from '@/lib/tutorialConfig'

interface TutorialEngineProps {
  tutorial: Tutorial
  currentStepIndex: number
  onStepComplete: () => void
  onSkip: () => void
  onComplete: () => void
  targetRegistry: Map<string, HTMLElement>
}

export function TutorialEngine({
  tutorial,
  currentStepIndex,
  onStepComplete,
  onSkip,
  onComplete,
  targetRegistry
}: TutorialEngineProps) {
  const [currentStep, setCurrentStep] = useState<TutorialStep | null>(null)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    const step = tutorial.steps[currentStepIndex]
    if (!step) {
      onComplete()
      return
    }

    setCurrentStep(step)

    const element = targetRegistry.get(step.targetKey)
    if (element) {
      setTargetElement(element)
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else {
      console.warn(`[Tutorial] Target element not found: ${step.targetKey}, skipping step`)
      setTimeout(() => {
        handleNext()
      }, 100)
    }
  }, [currentStepIndex, tutorial.steps, targetRegistry])

  const handleNext = useCallback(() => {
    if (currentStepIndex === tutorial.steps.length - 1) {
      if (dontShowAgain) {
        onComplete()
      } else {
        onComplete()
      }
    } else {
      onStepComplete()
    }
  }, [currentStepIndex, tutorial.steps.length, dontShowAgain, onStepComplete, onComplete])

  const handleSkip = useCallback(() => {
    onSkip()
  }, [onSkip])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip()
      } else if (e.key === 'Enter') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handleSkip])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (!currentStep || !targetElement) {
    return null
  }

  const targetRect = targetElement.getBoundingClientRect()

  return (
    <>
      <TutorialSpotlight
        targetElement={targetElement}
        opacity={tutorialConfig.settings.overlayOpacity}
        onClickOutside={handleSkip}
      />

      <TutorialPointer
        type={currentStep.pointer}
        placement={currentStep.placement}
        targetRect={targetRect}
      />

      <TutorialTooltip
        title={currentStep.title}
        body={currentStep.bodyTr}
        placement={currentStep.placement}
        targetRect={targetRect}
        currentStep={currentStepIndex}
        totalSteps={tutorial.steps.length}
        showSkip={tutorialConfig.settings.controls.showSkip}
        showDontShowAgain={
          tutorialConfig.settings.controls.showDontShowAgain &&
          currentStepIndex === tutorial.steps.length - 1
        }
        dontShowAgain={dontShowAgain}
        onDontShowAgainChange={setDontShowAgain}
        onNext={handleNext}
        onSkip={handleSkip}
        isLastStep={currentStepIndex === tutorial.steps.length - 1}
        primaryNextText={tutorialConfig.settings.controls.primaryNext}
        primaryDoneText={tutorialConfig.settings.controls.primaryDone}
        skipText={tutorialConfig.settings.controls.skip}
      />
    </>
  )
}
