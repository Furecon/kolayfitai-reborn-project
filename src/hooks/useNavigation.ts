import { useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useBackButton } from './useBackButton'
import { usePlatform } from './usePlatform'

interface UseNavigationOptions {
  enableHardwareBackButton?: boolean
  customBackHandler?: () => void
  defaultRoute?: string
}

export function useNavigation({
  enableHardwareBackButton = true,
  customBackHandler,
  defaultRoute = '/'
}: UseNavigationOptions = {}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAndroid } = usePlatform()

  const goBack = useCallback(() => {
    if (customBackHandler) {
      customBackHandler()
      return
    }

    // Check if we can go back in history
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      // Fallback to default route
      navigate(defaultRoute)
    }
  }, [navigate, customBackHandler, defaultRoute])

  // Set up hardware back button for Android
  useBackButton({
    onBackButton: () => {
      if (enableHardwareBackButton) {
        goBack()
        return true // Prevent default app exit
      }
      return false
    },
    enabled: enableHardwareBackButton && isAndroid
  })

  const navigateTo = useCallback((path: string, options?: { replace?: boolean }) => {
    navigate(path, options)
  }, [navigate])

  const canGoBack = window.history.length > 1

  return {
    goBack,
    navigateTo,
    canGoBack,
    currentPath: location.pathname,
    isAndroid
  }
}