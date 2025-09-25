import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { BrowserBarcodeReader } from '@zxing/library'
import { ArrowLeft, Scan, X } from 'lucide-react'
import { useRef } from 'react'
import Webcam from 'react-webcam'

interface BarcodeScannerProps {
  onBack: () => void
  onBarcodeScanned: (barcode: string) => void
  onManualFallback: () => void
}

export function BarcodeScanner({ onBack, onBarcodeScanned, onManualFallback }: BarcodeScannerProps) {
  const webcamRef = useRef<Webcam>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkCameraPermission()
    return () => {
      if (isScanning) {
        stopScan()
      }
    }
  }, [])

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
    } catch (error) {
      console.error('Camera permission check failed:', error)
      setHasPermission(false)
    }
  }

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach(track => track.stop())
      setHasPermission(true)
      setShowCamera(true)
    } catch (error) {
      console.error('Camera permission request failed:', error)
      toast({
        title: "Kamera İzni Gerekli",
        description: "Barkod okutmak için kamera iznine ihtiyaç var",
        variant: "destructive"
      })
      setHasPermission(false)
    }
  }

  const startScan = async () => {
    if (!hasPermission) {
      await requestPermission()
      return
    }

    setShowCamera(true)
    setIsScanning(true)
  }

  const stopScan = () => {
    try {
      setIsScanning(false)
      setShowCamera(false)
    } catch (error) {
      console.error('Error stopping scan:', error)
    }
  }

  const scanBarcodeFromVideo = async () => {
    if (!webcamRef.current) return

    try {
      const imageSrc = webcamRef.current.getScreenshot()
      if (!imageSrc) return

      const codeReader = new BrowserBarcodeReader()
      const img = new Image()
      
      img.onload = async () => {
        try {
          const result = await codeReader.decodeFromImageElement(img)
          onBarcodeScanned(result.getText())
          setShowCamera(false)
          setIsScanning(false)
          
          toast({
            title: "Barkod Okundu",
            description: `Barkod: ${result.getText()}`,
          })
        } catch (error) {
          console.log('No barcode found, continuing scan...')
          // Continue scanning
          setTimeout(scanBarcodeFromVideo, 1000)
        }
      }
      img.src = imageSrc
    } catch (error) {
      console.error('Barcode scan error:', error)
    }
  }

  // Start continuous scanning when camera is shown
  useEffect(() => {
    if (showCamera && isScanning) {
      const interval = setInterval(scanBarcodeFromVideo, 1000)
      return () => clearInterval(interval)
    }
  }, [showCamera, isScanning])

  if (showCamera) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-black">Barkod Tarayıcı</h1>
            <p className="text-sm text-gray-600 mt-2">
              Barkodu kamera karesi içerisine hizalayın
            </p>
          </div>
          
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="rounded-md w-full"
            videoConstraints={{
              facingMode: 'environment'
            }}
          />
          
          <div className="flex gap-3">
            <Button
              onClick={stopScan}
              variant="outline"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>
            <Button
              onClick={onManualFallback}
              variant="outline"
              className="flex-1"
            >
              Manuel Giriş
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold text-black">Barkod Okuyucu</h1>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scan className="h-5 w-5" />
                Barkod Tarama
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Paketli ürünlerin arkasındaki barkodu okutarak besin değerlerini otomatik olarak alabilirsiniz.
              </p>
              
              {hasPermission === false && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-orange-800 text-sm">
                    Barkod okutmak için kamera iznine ihtiyaç var
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                {hasPermission === false ? (
                  <Button onClick={requestPermission} className="flex-1">
                    Kamera İzni Ver
                  </Button>
                ) : (
                  <Button 
                    onClick={startScan}
                    disabled={isScanning}
                    className="flex-1"
                  >
                    <Scan className="h-4 w-4 mr-2" />
                    {isScanning ? 'Taranıyor...' : 'Barkod Tarat'}
                  </Button>
                )}
                
                <Button onClick={onManualFallback} variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Manuel Giriş
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nasıl Kullanılır?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  1
                </div>
                <p className="text-gray-600">Ürünün üzerindeki barkodu bulun</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  2
                </div>
                <p className="text-gray-600">"Barkod Tarat" butonuna basın</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  3
                </div>
                <p className="text-gray-600">Barkodu kamera karesi içerisine hizalayın</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                  4
                </div>
                <p className="text-gray-600">Ürün bilgileri otomatik olarak gelecektir</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}