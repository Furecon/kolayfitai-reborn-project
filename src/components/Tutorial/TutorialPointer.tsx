import { Hand, ArrowDown } from 'lucide-react'
import type { PointerType, PlacementType } from '@/lib/tutorialConfig'

interface PointerProps {
  type: PointerType
  placement: PlacementType
  targetRect: DOMRect
}

export function TutorialPointer({ type, placement, targetRect }: PointerProps) {
  if (type === 'none') return null

  const getPointerPosition = () => {
    const offset = 40

    switch (placement) {
      case 'top':
        return {
          top: targetRect.top - offset,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, -100%) rotate(180deg)'
        }
      case 'bottom':
        return {
          top: targetRect.bottom + offset,
          left: targetRect.left + targetRect.width / 2,
          transform: 'translate(-50%, 0)'
        }
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.left - offset,
          transform: 'translate(-100%, -50%) rotate(90deg)'
        }
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2,
          left: targetRect.right + offset,
          transform: 'translate(0, -50%) rotate(-90deg)'
        }
    }
  }

  const position = getPointerPosition()

  return (
    <div
      className="fixed z-[9999] animate-bounce pointer-events-none"
      style={position}
    >
      {type === 'finger' ? (
        <Hand className="w-8 h-8 text-primary drop-shadow-lg" fill="currentColor" />
      ) : (
        <ArrowDown className="w-8 h-8 text-primary drop-shadow-lg" strokeWidth={3} />
      )}
    </div>
  )
}
