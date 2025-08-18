import { useState } from 'react'
import { X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface TutorialStep {
  id: string
  title: string
  description: string
  targetSelector: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

interface TutorialOverlayProps {
  isVisible: boolean
  onComplete: () => void
  onClose: () => void
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'camera-button',
    title: 'Fotoğraf ile Yemek Tanıma',
    description: 'Buradan fotoğraf çekerek yemeklerinizi kolayca tanıyabilir ve kalorilerini hesaplayabilirsiniz.',
    targetSelector: '[data-tutorial="camera-button"]',
    position: 'bottom'
  },
  {
    id: 'macro-charts',
    title: 'Makro Takibi',
    description: 'Makro değerlerinizi (protein, karbonhidrat, yağ) çember grafiklerle takip edebilirsiniz.',
    targetSelector: '[data-tutorial="macro-charts"]',
    position: 'top'
  },
  {
    id: 'meal-history',
    title: 'Öğün Geçmişi',
    description: 'Bugün eklediğiniz tüm öğünleri burada görebilir ve düzenleyebilirsiniz.',
    targetSelector: '[data-tutorial="meal-history"]',
    position: 'top'
  },
  {
    id: 'calorie-cards',
    title: 'Kalori Takibi',
    description: 'Günlük kalori hedefinize ne kadar yakın olduğunuzu burada görebilirsiniz.',
    targetSelector: '[data-tutorial="calorie-cards"]',
    position: 'bottom'
  }
]

export function TutorialOverlay({ isVisible, onComplete, onClose }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0)

  if (!isVisible) return null

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
      {/* Overlay background */}
      <div className="absolute inset-0 bg-black/60" />
      
      {/* Highlight area */}
      <div
        className="absolute border-2 border-primary rounded-lg bg-transparent"
        style={{
          top: targetPos.top - 4,
          left: targetPos.left - 4,
          width: targetPos.width + 8,
          height: targetPos.height + 8,
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)'
        }}
      />

      {/* Tooltip */}
      <div
        className="absolute bg-white rounded-lg shadow-xl p-4 w-80 max-w-[90vw]"
        style={{
          top: Math.max(10, Math.min(tooltipPos.top, window.innerHeight - 140)),
          left: Math.max(10, Math.min(tooltipPos.left, window.innerWidth - 320))
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="pr-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {currentTutorialStep.title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {currentTutorialStep.description}
          </p>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-primary' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-gray-500"
            >
              Atla
            </Button>
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90"
            >
              {isLastStep ? 'Tamamla' : 'İleri'}
              {!isLastStep && <ArrowRight className="ml-1 h-3 w-3" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}