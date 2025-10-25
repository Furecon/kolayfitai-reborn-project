
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Upload, CircleAlert as AlertCircle } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Webcam from 'react-webcam'
import { useRef } from 'react'

interface NativeCameraCaptureProps {
  onImageCaptured: (imageUrl: string) => void
  onFileUploaded: (imageUrl: string) => void
  autoOpenCamera?: boolean
}

export default function NativeCameraCapture({ onImageCaptured, onFileUploaded, autoOpenCamera = false }: NativeCameraCaptureProps) {
  const { toast } = useToast()
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [showCamera, setShowCamera] = useState(autoOpenCamera)

  const captureFromCamera = async () => {
    try {
      setIsCapturing(true)
      
      if (!showCamera) {
        setShowCamera(true)
        setIsCapturing(false)
        return
      }

      if (!webcamRef.current) {
        throw new Error('Kamera hazır değil')
      }

      const imageSrc = webcamRef.current.getScreenshot()

      if (imageSrc) {
        // Don't resize here, let parent handle it
        onImageCaptured(imageSrc)
        setShowCamera(false)
        
        toast({
          title: "Başarılı!",
          description: "Fotoğraf çekildi, analiz ediliyor...",
        })
      }
    } catch (error: any) {
      console.error('Camera error:', error)
      
      toast({
        title: "Hata",
        description: "Kamera açılamadı. Lütfen tarayıcı izinlerini kontrol edin.",
        variant: "destructive"
      })
    } finally {
      setIsCapturing(false)
    }
  }

  const selectFromGallery = async () => {
    try {
      setIsUploading(true)
      
      fileInputRef.current?.click()
    } catch (error: any) {
      console.error('File selection error:', error)
      
      toast({
        title: "Hata",
        description: "Dosya seçimi başarısız oldu.",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Geçersiz Dosya",
        description: "Lütfen bir resim dosyası seçin.",
        variant: "destructive"
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      // Don't resize here, let parent handle it
      onFileUploaded(result)

      toast({
        title: "Başarılı!",
        description: "Dosya yüklendi, analiz ediliyor...",
      })
    }
    reader.readAsDataURL(file)
  }

  if (showCamera) {
    return (
      <div className="space-y-4">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="rounded-md w-full"
          videoConstraints={{
            facingMode: 'environment'
          }}
        />
        <div className="flex gap-2">
          <Button
            onClick={captureFromCamera}
            disabled={isCapturing}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          >
            <Camera className="h-4 w-4 mr-2" />
            {isCapturing ? 'Çekiliyor...' : 'Fotoğraf Çek'}
          </Button>
          <Button
            onClick={() => setShowCamera(false)}
            variant="outline"
          >
            İptal
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={captureFromCamera}
          disabled={isCapturing}
          className="bg-green-500 hover:bg-green-600 text-white py-3 h-auto"
        >
          <Camera className="h-5 w-5 mr-2" />
          {showCamera ? 'Kamerayı Kapat' : 'Kamera ile Çek'}
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
    </div>
  )
}
