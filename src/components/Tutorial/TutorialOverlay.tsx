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

  // Calculate tooltip position with better mobile optimization
  const getTooltipPosition = () => {
    const tooltipOffset = 12
    const tooltipWidth = 280
    const tooltipHeight = 140
    const screenPadding = 16
    
    // If target is in bottom third of screen, show tooltip in center
    const isTargetInBottomThird = targetPos.top > (window.innerHeight * 2) / 3
    
    if (isTargetInBottomThird) {
      return {
        top: (window.innerHeight - tooltipHeight) / 2,
        left: (window.innerWidth - tooltipWidth) / 2
      }
    }
    
    let position = { top: 0, left: 0 }
    
    switch (currentTutorialStep.position) {
      case 'top':
        position = {
          top: targetPos.top - tooltipHeight - tooltipOffset,
          left: targetPos.left + targetPos.width / 2 - tooltipWidth / 2
        }
        break
      case 'bottom':
        position = {
          top: targetPos.top + targetPos.height + tooltipOffset,
          left: targetPos.left + targetPos.width / 2 - tooltipWidth / 2
        }
        break
      case 'left':
        position = {
          top: targetPos.top + targetPos.height / 2 - tooltipHeight / 2,
          left: targetPos.left - tooltipWidth - tooltipOffset
        }
        break
      case 'right':
        position = {
          top: targetPos.top + targetPos.height / 2 - tooltipHeight / 2,
          left: targetPos.left + targetPos.width + tooltipOffset
        }
        break
      default:
        position = { top: 0, left: 0 }
    }
    
    // Ensure tooltip stays within screen bounds
    position.left = Math.max(screenPadding, Math.min(position.left, window.innerWidth - tooltipWidth - screenPadding))
    position.top = Math.max(screenPadding, Math.min(position.top, window.innerHeight - tooltipHeight - screenPadding))
    
    return position
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

      {/* Compact tooltip with mobile-friendly styling */}
      <div
        className="absolute bg-white rounded-lg shadow-lg border border-gray-200 max-w-[90vw]"
        style={{
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: '280px'
        }}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>

        {/* Content with reduced padding */}
        <div className="p-3 pr-6">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
              Adım {currentStep + 1} / {tutorialSteps.length}
            </span>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-2 leading-tight">
            {currentTutorialStep.title}
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            {currentTutorialStep.description}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="px-3 mb-3">
          <div className="flex space-x-1">
            {tutorialSteps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                  index <= currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Navigation buttons - always accessible */}
        <div className="flex items-center justify-between p-3 pt-0 border-t border-gray-100">
          <button
            onClick={handleSkip}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors"
          >
            Kapat
          </button>
          
          <button
            onClick={handleNext}
            className="bg-green-500 hover:bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md min-h-[40px] flex items-center gap-1.5 transition-colors"
          >
            {isLastStep ? 'Tamamla' : 'İleri'}
            {!isLastStep && <ArrowRight className="h-3 w-3" />}
          </button>
        </div>
      </div>
    </div>
  )
}