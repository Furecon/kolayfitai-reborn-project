
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Upload, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Camera as CapacitorCamera, CameraResultType, CameraSource } from '@capacitor/camera'
import { Capacitor } from '@capacitor/core'

interface NativeCameraCaptureProps {
  onImageCaptured: (imageUrl: string) => void
  onFileUploaded: (imageUrl: string) => void
}

export default function NativeCameraCapture({ onImageCaptured, onFileUploaded }: NativeCameraCaptureProps) {
  const { toast } = useToast()
  const [isCapturing, setIsCapturing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const isNative = Capacitor.isNativePlatform()

  const captureFromCamera = async () => {
    try {
      setIsCapturing(true)
      
      if (!isNative) {
        toast({
          title: "Bilgi",
          description: "Kamera sadece mobil uygulamada çalışır. Lütfen dosya yükleme seçeneğini kullanın.",
          variant: "destructive"
        })
        return
      }

      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera
      })

      if (image.dataUrl) {
        onImageCaptured(image.dataUrl)
        
        toast({
          title: "Başarılı!",
          description: "Fotoğraf çekildi, analiz ediliyor...",
        })
      }
    } catch (error: any) {
      console.error('Native camera error:', error)
      
      if (error.message?.includes('User cancelled')) {
        toast({
          title: "İptal Edildi",
          description: "Fotoğraf çekme işlemi iptal edildi.",
        })
      } else {
        toast({
          title: "Hata",
          description: "Kamera açılamadı. Lütfen uygulama izinlerini kontrol edin.",
          variant: "destructive"
        })
      }
    } finally {
      setIsCapturing(false)
    }
  }

  const selectFromGallery = async () => {
    try {
      setIsUploading(true)
      
      if (!isNative) {
        // Web için fallback
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const result = e.target?.result as string
              onFileUploaded(result)
              
              toast({
                title: "Başarılı!",
                description: "Dosya yüklendi, analiz ediliyor...",
              })
            }
            reader.readAsDataURL(file)
          }
        }
        input.click()
        return
      }

      const image = await CapacitorCamera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos
      })

      if (image.dataUrl) {
        onFileUploaded(image.dataUrl)
        
        toast({
          title: "Başarılı!",
          description: "Fotoğraf seçildi, analiz ediliyor...",
        })
      }
    } catch (error: any) {
      console.error('Gallery selection error:', error)
      
      if (error.message?.includes('User cancelled')) {
        toast({
          title: "İptal Edildi",
          description: "Fotoğraf seçme işlemi iptal edildi.",
        })
      } else {
        toast({
          title: "Hata",
          description: "Galeri açılamadı. Lütfen uygulama izinlerini kontrol edin.",
          variant: "destructive"
        })
      }
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      {!isNative && (
        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <p className="text-sm text-blue-700">
            Mobil uygulamada daha iyi kamera deneyimi için uygulamamızı indirin
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={captureFromCamera}
          disabled={isCapturing}
          className="bg-green-500 hover:bg-green-600 text-white py-3 h-auto"
        >
          <Camera className="h-5 w-5 mr-2" />
          {isCapturing ? 'Çekiliyor...' : 'Kamera ile Çek'}
        </Button>

        <Button
          onClick={selectFromGallery}
          disabled={isUploading}
          variant="outline"
          className="py-3 h-auto"
        >
          <Upload className="h-5 w-5 mr-2" />
          {isUploading ? 'Yükleniyor...' : 'Galeriden Seç'}
        </Button>
      </div>

      {isNative && (
        <p className="text-xs text-gray-500 text-center">
          Kamera ve galeri erişimi için izin gereklidir
        </p>
      )}
    </div>
  )
}
