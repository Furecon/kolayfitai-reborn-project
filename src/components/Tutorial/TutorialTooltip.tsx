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
  const getTooltipPosition = (): React.CSSProperties => {
    const offset = 20
    const tooltipWidth = 320

    switch (placement) {
      case 'top':
        return {
          bottom: window.innerHeight - targetRect.top + offset,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
          maxWidth: tooltipWidth
        }
      case 'bottom':
        return {
          top: targetRect.bottom + offset,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translateX(-50%)',
          maxWidth: tooltipWidth
        }
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          right: window.innerWidth - targetRect.left + offset,
          transform: 'translateY(-50%)',
          maxWidth: tooltipWidth
        }
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + offset,
          transform: 'translateY(-50%)',
          maxWidth: tooltipWidth
        }
    }
  }

  return (
    <Card
      className="fixed z-[10000] p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={getTooltipPosition()}
    >
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-base">{title}</h3>
            <span className="text-xs text-muted-foreground">
              {currentStep + 1}/{totalSteps}
            </span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
        </div>

        {showDontShowAgain && (
          <div className="flex items-center space-x-2 py-2">
            <Checkbox
              id="dont-show-again"
              checked={dontShowAgain}
              onCheckedChange={onDontShowAgainChange}
            />
            <label
              htmlFor="dont-show-again"
              className="text-xs text-muted-foreground cursor-pointer"
            >
              Bir daha gösterme
            </label>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          {showSkip && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-xs"
            >
              {skipText}
            </Button>
          )}
          <Button
            onClick={onNext}
            size="sm"
            className="ml-auto"
          >
            {isLastStep ? primaryDoneText : primaryNextText}
          </Button>
        </div>
      </div>
    </Card>
  )
}
