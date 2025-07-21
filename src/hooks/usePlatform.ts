
import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'

export function usePlatform() {
  const [platform, setPlatform] = useState<'web' | 'android' | 'ios'>('web')

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      setPlatform(Capacitor.getPlatform() as 'android' | 'ios')
    } else {
      setPlatform('web')
    }
  }, [])

  return {
    platform,
    isNative: Capacitor.isNativePlatform(),
    isAndroid: platform === 'android',
    isIOS: platform === 'ios',
    isWeb: platform === 'web'
  }
}
