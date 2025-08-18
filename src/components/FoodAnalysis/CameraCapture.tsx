
import React, { useRef, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Upload, AlertCircle } from 'lucide-react'
import Webcam from 'react-webcam'
import { useToast } from '@/components/ui/use-toast'

interface CameraCaptureProps {
  onImageCaptured: (imageUrl: string) => void
  onFileUploaded: (imageUrl: string) => void
}

export default function CameraCapture({ onImageCaptured, onFileUploaded }: CameraCaptureProps) {
  const { toast } = useToast()
  const webcamRef = useRef<Webcam>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [isHttps, setIsHttps] = useState(false)
  const [hasCamera, setHasCamera] = useState<boolean | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)

  useEffect(() => {
    setIsHttps(window.location.protocol === 'https:')
    checkCameraAvailability()
  }, [])

  const checkCameraAvailability = async () => {
    try {
      console.log('Checking camera availability...')
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      
      console.log('Video devices found:', videoDevices.length)
      
      if (videoDevices.length === 0) {
        setHasCamera(false)
        setCameraError('Kamera cihazı bulunamadı')
        return
      }

      // Test camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Prefer back camera on mobile
        } 
      })
      console.log('Camera access granted')
      setHasCamera(true)
      setCameraError(null)
      // Clean up test stream
      stream.getTracks().forEach(track => track.stop())
    } catch (error: any) {
      console.error('Camera availability check failed:', error)
      setHasCamera(false)
      
      if (error.name === 'NotFoundError') {
        setCameraError('Kamera cihazı bulunamadı. Lütfen dosya yükleme seçeneğini kullanın.')
      } else if (error.name === 'NotAllowedError') {
        setCameraError('Kamera erişim izni verilmedi. Lütfen tarayıcı ayarlarından kamera iznini aktifleştirin.')
      } else if (error.name === 'NotReadableError') {
        setCameraError('Kamera başka bir uygulama tarafından kullanılıyor.')
      } else {
        setCameraError(`Kamera hatası: ${error.message}`)
      }
    }
  }

  const capture = async () => {
    if (!webcamRef.current) {
      console.error('Webcam ref is null')
      return
    }

    try {
      setIsCapturing(true)
      console.log('Attempting to capture image...')
      
      const imageSrc = webcamRef.current.getScreenshot()
      
      if (!imageSrc) {
        throw new Error('Fotoğraf çekilemedi')
      }

      console.log('Image captured successfully')
      onImageCaptured(imageSrc)
      
      toast({
        title: "Başarılı!",
        description: "Fotoğraf çekildi, analiz ediliyor...",
      })
    } catch (error: any) {
      console.error('Capture error:', error)
      toast({
        title: "Hata",
        description: error.message || "Fotoğraf çekme sırasında hata oluştu",
        variant: "destructive"
      })
    } finally {
      setIsCapturing(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('File selected:', file.name, file.type, file.size)

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
      console.log('File converted to base64')
      onFileUploaded(result)
      
      toast({
        title: "Başarılı!",
        description: "Dosya yüklendi, analiz ediliyor...",
      })
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      {!isHttps && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <p className="text-sm text-yellow-700">
            Kamera için HTTPS bağlantısı gereklidir
          </p>
        </div>
      )}

      {cameraError && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <p className="text-sm text-red-700">{cameraError}</p>
        </div>
      )}

      {isHttps && hasCamera && !cameraError && (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-md w-full"
            videoConstraints={{
              facingMode: 'environment'
            }}
            onUserMediaError={(error) => {
              console.error('Webcam error:', error)
              setCameraError('Kamera başlatılamadı')
            }}
          />
          <Button
            onClick={capture}
            disabled={isCapturing}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
            data-tutorial="camera-button"
          >
            <Camera className="h-4 w-4 mr-2" />
            {isCapturing ? 'Çekiliyor...' : 'Fotoğraf Çek'}
          </Button>
        </>
      )}

      <div className="text-center">
        <span className="text-sm text-gray-500">
          {isHttps && hasCamera && !cameraError ? 'veya' : 'Alternatif olarak'}
        </span>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="w-full text-gray-600"
      >
        <Upload className="h-4 w-4 mr-2" />
        Dosyadan Yükle
      </Button>
    </div>
  )
}
