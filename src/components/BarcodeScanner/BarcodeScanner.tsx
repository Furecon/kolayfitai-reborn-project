import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { BarcodeScanner as CapacitorBarcodeScanner } from '@capacitor-community/barcode-scanner'
import { Capacitor } from '@capacitor/core'
import { ArrowLeft, Scan, X } from 'lucide-react'

interface BarcodeScannerProps {
  onProductFound: (product: any) => void
  onBack: () => void
}

interface ProductData {
  name: string
  brand?: string
  nutritionPer100g: {
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber: number
    sugar: number
    sodium: number
  }
  barcode: string
  imageUrl?: string
}

export function BarcodeScanner({ onProductFound, onBack }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isSupported, setIsSupported] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    checkSupport()
    return () => {
      if (isScanning) {
        stopScan()
      }
    }
  }, [])

  const checkSupport = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        setIsSupported(false)
        return
      }

      // For now, assume it's supported on native platforms
      setIsSupported(true)
      
      if (isSupported) {
        checkPermission()
      }
    } catch (error) {
      console.error('Error checking barcode scanner support:', error)
      setIsSupported(false)
    }
  }

  const checkPermission = async () => {
    try {
      const status = await CapacitorBarcodeScanner.checkPermission({ force: false })
      
      if (status.granted) {
        setHasPermission(true)
      } else if (status.denied || status.asked || status.neverAsked) {
        setHasPermission(false)
      }
    } catch (error) {
      console.error('Error checking camera permission:', error)
      setHasPermission(false)
    }
  }

  const requestPermission = async () => {
    try {
      const status = await CapacitorBarcodeScanner.checkPermission({ force: true })
      setHasPermission(status.granted)
      
      if (!status.granted) {
        toast({
          title: "Kamera İzni Gerekli",
          description: "Barkod okutmak için kamera iznine ihtiyaç var",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error requesting camera permission:', error)
      toast({
        title: "İzin Hatası",
        description: "Kamera izni alınamadı",
        variant: "destructive"
      })
    }
  }

  const startScan = async () => {
    if (!hasPermission) {
      await requestPermission()
      return
    }

    try {
      setIsScanning(true)
      
      // Hide background to show camera
      document.body.classList.add('barcode-scanner-active')
      
      const result = await CapacitorBarcodeScanner.startScan()
      
      if (result.hasContent) {
        await searchProduct(result.content)
      }
    } catch (error) {
      console.error('Error starting barcode scan:', error)
      toast({
        title: "Tarama Hatası",
        description: "Barkod tarama başlatılamadı",
        variant: "destructive"
      })
    } finally {
      setIsScanning(false)
      document.body.classList.remove('barcode-scanner-active')
    }
  }

  const stopScan = async () => {
    try {
      await CapacitorBarcodeScanner.stopScan()
      setIsScanning(false)
      document.body.classList.remove('barcode-scanner-active')
    } catch (error) {
      console.error('Error stopping barcode scan:', error)
    }
  }

  const searchProduct = async (barcode: string) => {
    try {
      toast({
        title: "Ürün Aranıyor",
        description: `Barkod: ${barcode}`,
      })

      // Try Open Food Facts API first
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`)
      
      if (!response.ok) {
        throw new Error('Product not found')
      }

      const data = await response.json()
      
      if (data.status === 1 && data.product) {
        const product = data.product
        
        const productData: ProductData = {
          name: product.product_name || product.product_name_tr || 'Bilinmeyen Ürün',
          brand: product.brands,
          barcode: barcode,
          imageUrl: product.image_url,
          nutritionPer100g: {
            calories: parseFloat(product.nutriments?.['energy-kcal_100g']) || 0,
            protein: parseFloat(product.nutriments?.proteins_100g) || 0,
            carbs: parseFloat(product.nutriments?.carbohydrates_100g) || 0,
            fat: parseFloat(product.nutriments?.fat_100g) || 0,
            fiber: parseFloat(product.nutriments?.fiber_100g) || 0,
            sugar: parseFloat(product.nutriments?.sugars_100g) || 0,
            sodium: parseFloat(product.nutriments?.sodium_100g) * 1000 || 0, // Convert g to mg
          }
        }

        onProductFound(productData)
        
        toast({
          title: "Ürün Bulundu",
          description: `${productData.name} başarıyla eklendi`,
        })
      } else {
        throw new Error('Product not found in database')
      }
    } catch (error) {
      console.error('Error searching product:', error)
      toast({
        title: "Ürün Bulunamadı",
        description: "Bu barkod veritabanımızda kayıtlı değil. Manuel olarak ekleyebilirsiniz.",
        variant: "destructive"
      })
    }
  }

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
            <h1 className="text-xl font-semibold text-black">Barkod Okuyucu</h1>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center text-red-600">Desteklenmiyor</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Barkod okuyucu bu cihazda desteklenmiyor. 
                Mobile uygulamada bu özelliği kullanabilirsiniz.
              </p>
              <Button onClick={onBack} variant="outline">
                Manuel Girişe Geç
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-xl font-semibold text-black">Barkod Okuyucu</h1>
        </div>

        {isScanning && (
          <div className="fixed inset-0 z-50 bg-black">
            <div className="absolute top-4 right-4 z-50">
              <Button
                onClick={stopScan}
                variant="outline"
                size="sm"
                className="bg-white text-black"
              >
                <X className="h-4 w-4 mr-2" />
                İptal
              </Button>
            </div>
            <div className="flex items-center justify-center h-full text-white text-center">
              <div>
                <p className="text-lg mb-4">Barkodu kameranın merkezine hizalayın</p>
                <div className="w-64 h-64 border-2 border-white border-dashed mx-auto"></div>
              </div>
            </div>
          </div>
        )}

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
                
                <Button onClick={onBack} variant="outline">
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