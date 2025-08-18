import { useState } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { tutorials, TutorialScreen, TutorialStep } from './tutorials'

interface TutorialOverlayProps {
  isVisible: boolean
  screen: TutorialScreen | null
  onComplete: () => void
  onClose: () => void
}

export function TutorialOverlay({ isVisible, screen, onComplete, onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isVisible || !screen) return null

  const tutorialSteps = tutorials[screen] || []

  const currentTutorialStep = tutorialSteps[currentStep]
  const isLastStep = currentStep === tutorialSteps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  // Get target element position
  const getTargetPosition = () => {
    const targetElement = document.querySelector(currentTutorialStep.targetSelector)
    if (!targetElement) return { top: 0, left: 0, width: 0, height: 0 }
    
    const rect = targetElement.getBoundingClientRect()
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height
    }
  }

  const targetPos = getTargetPosition()

  // Calculate tooltip position
  const getTooltipPosition = () => {
    const tooltipOffset = 20
    
    switch (currentTutorialStep.position) {
      case 'top':
        return {
          top: targetPos.top - 120 - tooltipOffset,
          left: targetPos.left + targetPos.width / 2 - 150
        }
      case 'bottom':
        return {
          top: targetPos.top + targetPos.height + tooltipOffset,
          left: targetPos.left + targetPos.width / 2 - 150
        }
      case 'left':
        return {
          top: targetPos.top + targetPos.height / 2 - 60,
          left: targetPos.left - 320 - tooltipOffset
        }
      case 'right':
        return {
          top: targetPos.top + targetPos.height / 2 - 60,
          left: targetPos.left + targetPos.width + tooltipOffset
        }
      default:
        return { top: 0, left: 0 }
    }
  }

  const tooltipPos = getTooltipPosition()

  return (
    <div className="fixed inset-0 z-50">
      {/* Dark overlay background */}
      <div className="absolute inset-0 bg-black/70" />
      
      {/* Highlight area with glowing effect */}
      <div
        className="absolute rounded-lg bg-transparent animate-pulse"
        style={{
          top: targetPos.top - 6,
          left: targetPos.left - 6,
          width: targetPos.width + 12,
          height: targetPos.height + 12,
          boxShadow: `
            0 0 0 4px rgba(59, 130, 246, 0.5),
            0 0 0 8px rgba(59, 130, 246, 0.3),
            0 0 0 9999px rgba(0, 0, 0, 0.7)
          `,
          border: '3px solid rgb(59, 130, 246)',
        }}
      />

      {/* Tooltip with enhanced styling */}
      <div
        className="absolute bg-white rounded-xl shadow-2xl p-6 w-80 max-w-[90vw] border border-gray-200"
        style={{
          top: Math.max(10, Math.min(tooltipPos.top, window.innerHeight - 160)),
          left: Math.max(10, Math.min(tooltipPos.left, window.innerWidth - 320))
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="pr-8">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
              Adım {currentStep + 1} / {tutorialSteps.length}
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            {currentTutorialStep.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">
            {currentTutorialStep.description}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="mb-4">
          <div className="flex space-x-2">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  index <= currentStep ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-gray-500 hover:text-gray-700"
          >
            İpuçlarını Kapat
          </Button>
          
          <Button
            size="sm"
            onClick={handleNext}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
          >
            {isLastStep ? 'Tamamla' : 'İleri'}
            {!isLastStep && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}