import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BrowserBarcodeReader } from '@zxing/library'
import { useToast } from '@/hooks/use-toast'
import { FileImageSelector } from '@/components/FoodAnalysis/FileImageSelector'
import { Card, CardContent } from '@/components/ui/card'
import { QrCode, AlertCircle, RotateCcw } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface BarcodeFromImageProps {
  onBarcodeDetected: (barcode: string) => void
  onBack: () => void
}

export function BarcodeFromImage({ onBarcodeDetected, onBack }: BarcodeFromImageProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const detectBarcodeFromImage = async (imageDataUrl: string) => {
    setIsProcessing(true)
    setError(null)

    try {
      const codeReader = new BrowserBarcodeReader()
      
      // Create image element from data URL
      const img = new Image()
      
      const result = await new Promise<string>((resolve, reject) => {
        img.onload = async () => {
          try {
            const result = await codeReader.decodeFromImageElement(img)
            resolve(result.getText())
          } catch (error) {
            reject(error)
          }
        }
        img.onerror = () => reject(new Error('Görsel yüklenemedi'))
        img.src = imageDataUrl
      })

      console.log('Barcode detected:', result)
      toast({
        title: "Başarılı!",
        description: "Barkod başarıyla okundu!"
      })
      onBarcodeDetected(result)

    } catch (error: any) {
      console.error('Barcode detection error:', error)
      
      let errorMessage = 'Bu görselde barkod bulunamadı.'
      
      if (error.message?.includes('No MultiFormat Readers')) {
        errorMessage = 'Barkod okuyucu başlatılamadı. Lütfen tekrar deneyin.'
      } else if (error.message?.includes('NotFoundException')) {
        errorMessage = 'Bu görselde okunabilir bir barkod bulunamadı. Barkodun net ve tam görünür olduğundan emin olun.'
      }
      
      setError(errorMessage)
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleImageSelected = (imageUrl: string) => {
    setSelectedImage(imageUrl)
    detectBarcodeFromImage(imageUrl)
  }

  const handleRetry = () => {
    setSelectedImage(null)
    setError(null)
  }

  const handleManualEntry = () => {
    // This would navigate to manual entry - for now just go back
    onBack()
  }

  if (selectedImage && !isProcessing && error) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-3 py-3 z-10">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            <h1 className="text-base sm:text-lg font-semibold text-foreground">
              Barkod Bulunamadı
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-3 space-y-4">
          {/* Selected Image */}
          <Card>
            <CardContent className="p-4">
              <img 
                src={selectedImage} 
                alt="Seçilen görsel" 
                className="w-full h-48 object-cover rounded-lg"
              />
            </CardContent>
          </Card>

          {/* Error Message */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>

          {/* Retry Options */}
          <div className="space-y-3">
            <Button
              onClick={handleRetry}
              variant="outline"
              className="w-full"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Farklı Görsel Seç
            </Button>

            <Button
              onClick={handleManualEntry}
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
            >
              Manuel Ekleme Yap
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground px-2">
            <p>
              Barkodun net, tam görünür ve iyi ışıklandırılmış olduğundan emin olun. 
              EAN ve UPC barkod türleri desteklenmektedir.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border px-3 py-3 z-10">
          <div className="flex items-center justify-center max-w-2xl mx-auto">
            <h1 className="text-base sm:text-lg font-semibold text-foreground">
              Barkod Okunuyor...
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-3 space-y-4">
          {selectedImage && (
            <Card>
              <CardContent className="p-4">
                <img 
                  src={selectedImage} 
                  alt="Seçilen görsel" 
                  className="w-full h-48 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success"></div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Barkod taranıyor...</p>
              <p className="text-xs text-muted-foreground mt-1">
                Görseldeki barkod aranıyor
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-3 py-3 z-10">
        <div className="flex items-center justify-center max-w-2xl mx-auto">
          <h1 className="text-base sm:text-lg font-semibold text-foreground">
            Barkod Görseli Seç
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-3 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
            <QrCode className="h-8 w-8 text-success" />
          </div>
          <p className="text-sm text-muted-foreground">
            Barkod içeren bir fotoğraf seçin. Barkod net ve tam görünür olmalıdır.
          </p>
        </div>

        <FileImageSelector
          onImageSelected={handleImageSelected}
          title="Barkod Fotoğrafı"
          subtitle="Barkod içeren görseli seçin"
          accept="image/jpeg,image/png"
          maxSizeMB={5}
        />

        <Alert>
          <QrCode className="h-4 w-4" />
          <AlertDescription>
            <strong>İpuçları:</strong>
            <ul className="mt-1 text-xs space-y-1">
              <li>• Barkod net ve odaklanmış olmalı</li>
              <li>• İyi ışıklandırma kullanın</li>
              <li>• Barkod tam olarak görünür olmalı</li>
              <li>• EAN/UPC barkod türleri desteklenir</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}