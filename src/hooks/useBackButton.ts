import { useEffect } from 'react'
import { App } from '@capacitor/app'

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

    // Add Capacitor App backButton listener for mobile
    let backButtonListener: any = null

    const setupCapacitorBackButton = async () => {
      try {
        backButtonListener = await App.addListener('backButton', () => {
          const preventDefault = onBackButton()
          // If handler returns true, we prevent default (app exit)
          // If returns false/void, allow default behavior
          if (!preventDefault) {
            App.exitApp()
          }
        })
      } catch (error) {
        // Capacitor not available (web platform)
        console.log('Capacitor App plugin not available, using web back button handlers only')
      }
    }

    setupCapacitorBackButton()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('popstate', handlePopState)

      // Remove Capacitor listener
      if (backButtonListener) {
        backButtonListener.remove()
      }
    }
  }, [enabled, onBackButton])
}