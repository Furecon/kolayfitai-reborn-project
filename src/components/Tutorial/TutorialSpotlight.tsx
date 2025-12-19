import { useEffect, useState } from 'react'

interface SpotlightProps {
  targetElement: HTMLElement | null
  opacity: number
}

export function TutorialSpotlight({ targetElement, opacity }: SpotlightProps) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (targetElement) {
      const updateRect = () => {
        setRect(targetElement.getBoundingClientRect())
      }

      updateRect()
      window.addEventListener('resize', updateRect)
      window.addEventListener('scroll', updateRect, true)

      return () => {
        window.removeEventListener('resize', updateRect)
        window.removeEventListener('scroll', updateRect, true)
      }
    }
  }, [targetElement])

  if (!rect) return null

  const padding = 8

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <rect
              x={rect.left - padding}
              y={rect.top - padding}
              width={rect.width + padding * 2}
              height={rect.height + padding * 2}
              rx="12"
              fill="black"
            />
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="black"
          opacity={opacity}
          mask="url(#spotlight-mask)"
        />
      </svg>

      <div
        className="absolute border-2 border-primary rounded-xl transition-all duration-300 animate-pulse"
        style={{
          left: rect.left - padding,
          top: rect.top - padding,
          width: rect.width + padding * 2,
          height: rect.height + padding * 2
        }}
      />
    </div>
  )
}
