
import { useState, useEffect } from 'react'

export function usePlatform() {
  const [platform] = useState<'web' | 'android' | 'ios'>('web')

  useEffect(() => {
    // Always web platform in Bolt environment
  }, [])

  return {
    platform,
    isNative: false,
    isAndroid: platform === 'android',
    isIOS: platform === 'ios',
    isWeb: true
  }
}
