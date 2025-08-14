import { useEffect } from 'react'
import { App } from '@capacitor/app'
import { usePlatform } from './usePlatform'

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
  const { isAndroid } = usePlatform()

  useEffect(() => {
    if (!isAndroid || !enabled || !onBackButton) return

    const handleBackButton = () => {
      const preventDefault = onBackButton()
      // If handler returns true, prevent default app exit
      return preventDefault === true
    }

    // Add listener for Android hardware back button
    let listener: any
    App.addListener('backButton', handleBackButton).then((handle) => {
      listener = handle
    })

    return () => {
      if (listener) {
        listener.remove()
      }
    }
  }, [isAndroid, enabled, onBackButton])
}