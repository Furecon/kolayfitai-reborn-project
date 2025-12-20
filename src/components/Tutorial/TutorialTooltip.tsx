import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { PlacementType } from '@/lib/tutorialConfig'

interface TooltipProps {
  title: string
  body: string
  placement: PlacementType
  targetRect: DOMRect
  currentStep: number
  totalSteps: number
  showSkip: boolean
  showDontShowAgain: boolean
  dontShowAgain: boolean
  onDontShowAgainChange: (checked: boolean) => void
  onNext: () => void
  onSkip: () => void
  isLastStep: boolean
  primaryNextText: string
  primaryDoneText: string
  skipText: string
}

export function TutorialTooltip({
  title,
  body,
  placement,
  targetRect,
  currentStep,
  totalSteps,
  showSkip,
  showDontShowAgain,
  dontShowAgain,
  onDontShowAgainChange,
  onNext,
  onSkip,
  isLastStep,
  primaryNextText,
  primaryDoneText,
  skipText
}: TooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null)

  const getTooltipPosition = (): React.CSSProperties => {
    const offset = 20
    const sideMargin = 16
    const maxTooltipWidth = 320
    const availableWidth = window.innerWidth - (sideMargin * 2)
    const tooltipWidth = Math.min(maxTooltipWidth, availableWidth)
    const bottomNavHeight = 80
    const minTopMargin = 16
    const minBottomMargin = bottomNavHeight + 16
    const estimatedTooltipHeight = 200

    let position: React.CSSProperties = {
      maxWidth: tooltipWidth,
      width: tooltipWidth
    }

    switch (placement) {
      case 'top':
        position.bottom = window.innerHeight - targetRect.top + offset
        position.left = targetRect.left + targetRect.width / 2
        position.transform = 'translateX(-50%)'
        break
      case 'bottom':
        position.top = targetRect.bottom + offset
        position.left = targetRect.left + targetRect.width / 2
        position.transform = 'translateX(-50%)'
        break
      case 'left':
        position.top = targetRect.top + targetRect.height / 2
        position.right = window.innerWidth - targetRect.left + offset
        position.transform = 'translateY(-50%)'
        break
      case 'right':
        position.top = targetRect.top + targetRect.height / 2
        position.left = targetRect.right + offset
        position.transform = 'translateY(-50%)'
        break
    }

    if (position.left !== undefined && typeof position.left === 'number') {
      const halfWidth = tooltipWidth / 2
      if (position.left - halfWidth < sideMargin) {
        position.left = halfWidth + sideMargin
      } else if (position.left + halfWidth > window.innerWidth - sideMargin) {
        position.left = window.innerWidth - halfWidth - sideMargin
      }
    }

    if (position.right !== undefined && typeof position.right === 'number') {
      const minRight = sideMargin
      const maxRight = window.innerWidth - tooltipWidth - sideMargin

      if (position.right < minRight) {
        position.right = minRight
      } else if (position.right > maxRight) {
        position.right = maxRight
      }
    }

    if (position.top !== undefined && typeof position.top === 'number') {
      if (position.top < minTopMargin) {
        position.top = minTopMargin
      }

      const wouldOverlapBottomNav = position.top + estimatedTooltipHeight > window.innerHeight - minBottomMargin

      if (wouldOverlapBottomNav) {
        delete position.top
        position.bottom = minBottomMargin
      }
    }

    if (position.bottom !== undefined && typeof position.bottom === 'number') {
      if (position.bottom < minBottomMargin) {
        position.bottom = minBottomMargin
      }

      if (position.bottom > window.innerHeight - minTopMargin - estimatedTooltipHeight) {
        position.bottom = window.innerHeight - minTopMargin - estimatedTooltipHeight
      }
    }

    return position
  }

  return (
    <Card
      className="fixed z-[10000] p-3 sm:p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={getTooltipPosition()}
    >
      <div className="space-y-2 sm:space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5 sm:mb-2 gap-2">
            <h3 className="font-semibold text-sm sm:text-base line-clamp-2 flex-1">{title}</h3>
            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
              {currentStep + 1}/{totalSteps}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{body}</p>
        </div>

        {showDontShowAgain && (
          <div className="flex items-center space-x-2 py-1.5 sm:py-2">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={onDontShowAgainChange}
            />
            <label
              htmlFor="dont-show-again"
              className="text-xs text-muted-foreground cursor-pointer select-none"
            >
              Bir daha gösterme
            </label>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          {showSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 flex-shrink-0"
            >
              {skipText}
            </Button>
          )}
          <Button
            onClick={onNext}
            size="sm"
            className="ml-auto text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4 flex-shrink-0"
          >
            {isLastStep ? primaryDoneText : primaryNextText}
          </Button>
        </div>
      </div>
    </Card>
  )
}
