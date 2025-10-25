import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Camera, Edit3, Zap, Clock, AlertCircle, Sparkles, Upload } from 'lucide-react'

interface MealMethodSelectionProps {
  onBack: () => void
  onSelectPhoto: () => void
  onSelectManual: () => void
  onForceManual?: () => void
  onSelectPhotoFromFile?: () => void
}

export function MealMethodSelection({
  onBack,
  onSelectPhoto,
  onSelectManual,
  onForceManual,
  onSelectPhotoFromFile
}: MealMethodSelectionProps) {
  // Get user's last preference or default to photo
  const getInitialMethod = (): 'photo' | 'manual' => {
    const saved = localStorage.getItem('mealMethodPreference')
    return (saved as 'photo' | 'manual') || 'photo'
  }

  const [selectedMethod, setSelectedMethod] = useState<'photo' | 'manual'>(getInitialMethod())
  const [cameraPermissionDenied, setCameraPermissionDenied] = useState(false)

  // Save user preference when method changes
  const handleMethodSelect = (method: 'photo' | 'manual') => {
    setSelectedMethod(method)
    localStorage.setItem('mealMethodPreference', method)
  }

  // Check camera permission when photo method is selected
  useEffect(() => {
    if (selectedMethod === 'photo') {
      checkCameraPermission()
    }
  }, [selectedMethod])

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      // If successful, stop the stream immediately
      stream.getTracks().forEach(track => track.stop())
      setCameraPermissionDenied(false)
    } catch (error: any) {
      console.log('Camera permission check:', error.name)
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setCameraPermissionDenied(true)
        // Auto-switch to manual and show info
        handleMethodSelect('manual')
        setTimeout(() => {
          if (onForceManual) {
            onForceManual()
          } else {
            onSelectManual()
          }
        }, 1000)
      }
    }
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-3 py-3 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground p-2"
          >
            <ArrowLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Geri</span>
          </Button>
          <div className="text-center flex-1 px-2">
            <h1 className="text-base sm:text-lg font-semibold text-foreground">
              Öğün Ekleme Yöntemi
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              En doğru sonuç için fotoğrafla analiz önerilir. Manuel eklemede AI tahmini yapılır.
            </p>
          </div>
          <div className="w-8 sm:w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-3 sm:p-4 space-y-4 sm:space-y-6">
        {/* Camera Permission Denied Alert */}
        {cameraPermissionDenied && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Kamera iznini sonradan Ayarlar'dan açabilirsiniz. Bu arada manuel ekleme yapabilirsiniz.
            </AlertDescription>
          </Alert>
        )}

        {/* Selection Cards */}
        <div className="space-y-4">
          {/* Photo Analysis Option - Recommended */}
          <Card 
            className={`cursor-pointer transition-all duration-200 border-2 ${
              selectedMethod === 'photo' 
                ? 'border-success bg-success-muted' 
                : 'border-border hover:border-success/50'
            }`}
            onClick={() => handleMethodSelect('photo')}
          >
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
                    selectedMethod === 'photo' 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <CardTitle className="text-base sm:text-lg">
                        Fotoğrafla Analiz
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs w-fit">
                        <Sparkles className="h-3 w-3 mr-1" />
                        Önerilir
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      AI ile otomatik besin değeri hesaplama
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 sm:w-4 sm:h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                  selectedMethod === 'photo' 
                    ? 'border-success bg-success' 
                    : 'border-muted-foreground'
                }`}>
                  {selectedMethod === 'photo' && (
                    <div className="w-full h-full bg-success-foreground rounded-full scale-50" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Sparkles className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>En doğru sonuçlar</span>
              </div>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 ml-4 sm:ml-6">
                <li>• Otomatik yemek tanıma</li>
                <li>• AI besin değeri hesaplama</li>
                <li>• Doğrulama ve düzeltme imkanı</li>
              </ul>
              
              
              {cameraPermissionDenied && selectedMethod === 'photo' && (
                <div className="pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Kamera kullanmak istemiyorsanız, galeriden/dosyadan görsel seçebilirsiniz.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 border-2 ${
              selectedMethod === 'manual' 
                ? 'border-success bg-success-muted' 
                : 'border-border hover:border-success/50'
            }`}
            onClick={() => handleMethodSelect('manual')}
          >
            <CardHeader className="pb-2 sm:pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0 ${
                    selectedMethod === 'manual' 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Edit3 className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <CardTitle className="text-base sm:text-lg">
                        Manuel Ekle
                      </CardTitle>
                      <Badge variant="outline" className="text-xs w-fit">
                        <Zap className="h-3 w-3 mr-1" />
                        AI ile otomatik hesaplama
                      </Badge>
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      Form ile bilgi girişi ve AI tahmini
                    </p>
                  </div>
                </div>
                <div className={`w-5 h-5 sm:w-4 sm:h-4 rounded-full border-2 mt-1 flex-shrink-0 ${
                  selectedMethod === 'manual' 
                    ? 'border-success bg-success' 
                    : 'border-muted-foreground'
                }`}>
                  {selectedMethod === 'manual' && (
                    <div className="w-full h-full bg-success-foreground rounded-full scale-50" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Hızlı ve pratik</span>
              </div>
              <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 ml-4 sm:ml-6">
                <li>• Yemek adı ve miktar girişi</li>
                <li>• AI ile otomatik kalori hesaplama</li>
                <li>• Sık kullanılanlardan kopyalama</li>
                <li>• Hızlı porsiyon seçenekleri</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        {selectedMethod === 'photo' ? (
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onSelectPhoto}
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
              size="lg"
              disabled={cameraPermissionDenied}
            >
              <Camera className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Kamera ile çek</span>
              <span className="sm:hidden">Kamera</span>
            </Button>
            <Button
              onClick={onSelectPhotoFromFile}
              className="w-full bg-success hover:bg-success/90 text-success-foreground"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Galeriden seç</span>
              <span className="sm:hidden">Galeri</span>
            </Button>
          </div>
        ) : (
          <Button
            onClick={onSelectManual}
            className="w-full bg-success hover:bg-success/90 text-success-foreground"
            size="lg"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Manuel Forma Git</span>
            <span className="sm:hidden">Manuel Giriş</span>
          </Button>
        )}

        <div className="text-center text-xs sm:text-sm text-muted-foreground px-2">
          <p>
            {selectedMethod === 'manual'
              ? 'Bilgileri kendiniz gireceksiniz. AI otomatik hesaplama yapar.'
              : cameraPermissionDenied
                ? 'Kamera izni gerekli. Lütfen tarayıcı ayarlarından izin verin.'
                : 'AI fotoğrafınızı analiz edecek ve besin değerlerini hesaplayacak.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}