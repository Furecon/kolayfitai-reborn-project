import { useEffect } from 'react'

interface UseBackButtonOptions {
  onBackButton?: () => boolean | void // Return true to prevent default, false/void to allow
  priority?: number // Higher priority handlers are called first
  enabled?: boolean // Whether the handler is active
}

export function useBackButton({
  onBackButton,
  priority = 0,
  enabled = true
}: UseBackButtonOptions = {}) {

  useEffect(() => {
    if (!enabled || !onBackButton) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle browser back button or ESC key
      if (event.key === 'Escape' || (event.key === 'Backspace' && event.ctrlKey)) {
        event.preventDefault()
        const preventDefault = onBackButton()
        return preventDefault === true
      }
    }

    const handlePopState = () => {
      const preventDefault = onBackButton()
      return preventDefault === true
    }

    // Add listeners for web platform
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [enabled, onBackButton])
}