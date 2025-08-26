import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Camera, Edit3, Zap, Clock } from 'lucide-react'

interface MealMethodSelectionProps {
  onBack: () => void
  onSelectPhoto: () => void
  onSelectManual: () => void
}

export function MealMethodSelection({ 
  onBack, 
  onSelectPhoto, 
  onSelectManual 
}: MealMethodSelectionProps) {
  const [selectedMethod, setSelectedMethod] = useState<'photo' | 'manual'>('manual')

  const handleContinue = () => {
    if (selectedMethod === 'photo') {
      onSelectPhoto()
    } else {
      onSelectManual()
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-4 py-4 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-lg font-semibold text-foreground">
            Öğün Ekleme Yöntemi
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6">
        {/* Selection Cards */}
        <div className="space-y-4">
          {/* Manual Entry Option - Default Selected */}
          <Card 
            className={`cursor-pointer transition-all duration-200 border-2 ${
              selectedMethod === 'manual' 
                ? 'border-success bg-success-muted' 
                : 'border-border hover:border-success/50'
            }`}
            onClick={() => setSelectedMethod('manual')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    selectedMethod === 'manual' 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Edit3 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      Manuel Ekle
                      <Badge variant="secondary" className="text-xs">
                        <Zap className="h-3 w-3 mr-1" />
                        Önerilen
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Bilgileri doğrudan form ile girin
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
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
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Hızlı ve kolay</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Öğün adı, kalori ve makro girişi</li>
                <li>• Fotoğraf opsiyonel</li>
                <li>• Sık kullanılanlardan kopyalama</li>
                <li>• Hızlı porsiyon seçenekleri</li>
              </ul>
            </CardContent>
          </Card>

          {/* Photo Analysis Option */}
          <Card 
            className={`cursor-pointer transition-all duration-200 border-2 ${
              selectedMethod === 'photo' 
                ? 'border-success bg-success-muted' 
                : 'border-border hover:border-success/50'
            }`}
            onClick={() => setSelectedMethod('photo')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${
                    selectedMethod === 'photo' 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Fotoğrafla Ekle</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      AI ile otomatik analiz
                    </p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 mt-1 ${
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
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Camera className="h-4 w-4" />
                <span>AI destekli analiz</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Fotoğraf çekme/yükleme</li>
                <li>• Otomatik yemek tanıma</li>
                <li>• AI besin değeri hesaplama</li>
                <li>• Doğrulama ve düzeltme imkanı</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          className="w-full bg-success hover:bg-success/90 text-success-foreground"
          size="lg"
        >
          {selectedMethod === 'manual' ? (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Manuel Forma Git
            </>
          ) : (
            <>
              <Camera className="h-4 w-4 mr-2" />
              Kamera'ya Git
            </>
          )}
        </Button>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            {selectedMethod === 'manual' 
              ? 'Bilgileri kendiniz gireceksiniz. Fotoğraf eklemek opsiyoneldir.'
              : 'AI fotoğrafınızı analiz edecek ve besin değerlerini hesaplayacak.'
            }
          </p>
        </div>
      </div>
    </div>
  )
}