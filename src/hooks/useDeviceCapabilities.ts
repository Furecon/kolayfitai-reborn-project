
import { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { Device } from '@capacitor/device'

interface DeviceCapabilities {
  isNative: boolean
  platform: string
  hasCamera: boolean
  canTakePhotos: boolean
  canAccessGallery: boolean
}

export function useDeviceCapabilities() {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isNative: false,
    platform: 'web',
    hasCamera: false,
    canTakePhotos: false,
    canAccessGallery: false
  })

  useEffect(() => {
    async function checkCapabilities() {
      const isNative = Capacitor.isNativePlatform()
      let platform = 'web'
      
      if (isNative) {
        const deviceInfo = await Device.getInfo()
        platform = deviceInfo.platform
      }

      // Check if getUserMedia is available (for web)
      const hasWebCamera = !isNative && navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function'
      
      // For native platforms, assume camera is available
      const hasCamera = isNative || hasWebCamera
      const canTakePhotos = isNative || hasWebCamera
      const canAccessGallery = isNative || (typeof window !== 'undefined' && 'File' in window)

      setCapabilities({
        isNative,
        platform,
        hasCamera,
        canTakePhotos,
        canAccessGallery
      })
    }

    checkCapabilities()
  }, [])

  return capabilities
}
