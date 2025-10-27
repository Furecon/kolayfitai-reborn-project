import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'

export function usePlatform() {
  const [platform, setPlatform] = useState<'web' | 'android' | 'ios'>('web')
  const [isNative, setIsNative] = useState(false)

  useEffect(() => {
    const detectedPlatform = Capacitor.getPlatform()
    const native = Capacitor.isNativePlatform()

    console.log('[usePlatform] Detected platform:', detectedPlatform)
    console.log('[usePlatform] Is native:', native)

    setPlatform(detectedPlatform as 'web' | 'android' | 'ios')
    setIsNative(native)
  }, [])

  return {
    platform,
    isNative,
    isAndroid: platform === 'android',
    isIOS: platform === 'ios',
    isWeb: platform === 'web'
  }
}
