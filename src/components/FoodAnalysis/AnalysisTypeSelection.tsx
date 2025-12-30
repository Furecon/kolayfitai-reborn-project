
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Zap, Search, Edit3, Camera } from 'lucide-react'
import { useTutorialTarget } from '@/hooks/useTutorialTarget'

interface AnalysisTypeSelectionProps {
  onSelectType: (type: 'quick' | 'detailed' | 'manual') => void
  onBack: () => void
  capturedImage: string
  onRetakePhoto?: () => void
}

export default function AnalysisTypeSelection({ onSelectType, onBack, capturedImage, onRetakePhoto }: AnalysisTypeSelectionProps) {
  const normalAnalysisRef = useTutorialTarget('NormalAnalysisCard')

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-black">Analiz Türü Seç</h1>
        </div>

        {capturedImage && (
          <div className="mb-6 space-y-3">
            <img
              src={capturedImage}
              alt="Captured food"
              className="w-full max-w-md mx-auto rounded-lg shadow-md"
            />
            {onRetakePhoto && (
              <Button
                variant="outline"
                onClick={onRetakePhoto}
                className="w-full max-w-md mx-auto flex items-center justify-center gap-2"
              >
                <Camera className="h-4 w-4" />
                Yeni Fotoğraf Çek
              </Button>
            )}
          </div>
        )}

        <div className="space-y-4">
          <Card ref={normalAnalysisRef as any} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectType('quick')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-black">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                AI Analiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                AI fotoğraftaki besini hemen değerlendirir ve besin değerlerini hesaplar.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Anında sonuç</li>
                <li>• Tam besin değerleri</li>
                <li>• Hassas kalori hesabı</li>
              </ul>
              <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white">
                AI Analiz Yap
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectType('manual')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-black">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Edit3 className="h-6 w-6 text-purple-600" />
                </div>
                Manuel Giriş
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Yemekleri kendiniz seçin ve porsiyon miktarlarını belirleyin. Tam kontrol sizde.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Yemek arama ve seçimi</li>
                <li>• Porsiyon kontrolü</li>
                <li>• Hassas besin değerleri</li>
                <li>• AI hatalarından bağımsız</li>
              </ul>
              <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white">
                Manuel Giriş Yap
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
