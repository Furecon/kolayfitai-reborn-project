import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, ChevronRight, ScrollText } from 'lucide-react'
import { tutorials, TutorialScreen } from './tutorials'

interface TutorialOverlayProps {
  isVisible: boolean
  currentScreen: TutorialScreen | null
  onComplete: () => void
  onClose: () => void
}

export function TutorialOverlay({ isVisible, currentScreen, onComplete, onClose }: TutorialOverlayProps) {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    if (isVisible && currentScreen) {
      setStepIndex(0)
    }
  }, [isVisible, currentScreen])

  if (!isVisible || !currentScreen) return null

  const steps = tutorials[currentScreen] || []
  if (steps.length === 0) return null

  const currentStep = steps[stepIndex]

  const handleNext = () => {
    if (stepIndex === steps.length - 1) {
      onComplete()
    } else {
      setStepIndex(stepIndex + 1)
    }
  }

  const handleSkip = () => {
    onClose()
  }

  const getTargetPosition = () => {
    if (!currentStep) return null
    
    const target = document.querySelector(currentStep.targetSelector)
    if (!target) return null
    
    const rect = target.getBoundingClientRect()
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight && 
                     rect.left >= 0 && rect.right <= window.innerWidth
    
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right,
      isVisible
    }
  }

  const getTooltipPosition = (targetPos: any) => {
    if (!targetPos) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
    
    const tooltipWidth = 280  // Reduced width for mobile
    const tooltipHeight = 160 // Reduced height
    const padding = 12
    const isMobile = window.innerWidth < 768
    
    let top = targetPos.top - tooltipHeight - padding
    let left = targetPos.left + (targetPos.width / 2) - (tooltipWidth / 2)
    
    // If target is not visible or too low on screen, center the tooltip
    if (!targetPos.isVisible || targetPos.top > window.innerHeight * 0.7) {
      return {
        top: '40%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'fixed' as const
      }
    }
    
    // Adjust if tooltip goes off screen vertically
    if (top < padding) {
      top = targetPos.bottom + padding
      // If still off screen, center it
      if (top + tooltipHeight > window.innerHeight - padding) {
        return {
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          position: 'fixed' as const
        }
      }
    }
    
    // Adjust horizontally
    if (left < padding) {
      left = padding
    } else if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding
    }
    
    return {
      top: `${Math.max(padding, top)}px`,
      left: `${Math.max(padding, left)}px`,
      position: 'fixed' as const
    }
  }

  const scrollToTarget = () => {
    if (!currentStep) return
    
    const target = document.querySelector(currentStep.targetSelector)
    if (target) {
      target.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      })
    }
  }

  const targetPosition = getTargetPosition()
  const tooltipPosition = getTooltipPosition(targetPosition)
  const isTargetOffScreen = targetPosition && !targetPosition.isVisible

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />
      
      {/* Highlighted area */}
      {targetPosition && targetPosition.isVisible && (
        <div
          className="absolute border-2 border-primary bg-transparent pointer-events-none"
          style={{
            top: `${targetPosition.top - 4}px`,
            left: `${targetPosition.left - 4}px`,
            width: `${targetPosition.width + 8}px`,
            height: `${targetPosition.height + 8}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
            borderRadius: '8px'
          }}
        />
      )}
      
      {/* Tutorial tooltip */}
      <div
        className="absolute bg-white rounded-lg shadow-xl pointer-events-auto"
        style={{
          ...tooltipPosition,
          padding: '10px',
          maxWidth: '280px',
          minHeight: 'auto'
        }}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-sm font-semibold text-gray-900 leading-tight">
            {currentStep.title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-6 w-6 -mt-1 -mr-1"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
        
        <p className="text-xs text-gray-600 mb-3 leading-relaxed">
          {currentStep.description}
        </p>

        {/* Show scroll message if target is off-screen */}
        {isTargetOffScreen && (
          <div className="flex items-center gap-1 mb-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
            <ScrollText className="w-3 h-3" />
            <span>İlgili alanı görmek için kaydırın</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={scrollToTarget}
              className="text-xs p-1 h-5 ml-1"
            >
              Git
            </Button>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {stepIndex + 1} / {steps.length}
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
              className="text-xs px-3 py-1 h-8 bg-gray-50 text-gray-700 border-gray-300"
            >
              Kapat
            </Button>
            
            <Button
              size="sm"
              onClick={handleNext}
              className="flex items-center gap-1 text-xs px-3 py-1 h-8 bg-green-600 hover:bg-green-700 text-white"
            >
              {stepIndex === steps.length - 1 ? 'Tamamla' : 'İleri'}
              {stepIndex < steps.length - 1 && <ChevronRight className="w-3 h-3" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}