
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Zap, Search, Edit3 } from 'lucide-react'

interface AnalysisTypeSelectionProps {
  onSelectType: (type: 'quick' | 'detailed' | 'manual') => void
  onBack: () => void
  capturedImage: string
}

export default function AnalysisTypeSelection({ onSelectType, onBack, capturedImage }: AnalysisTypeSelectionProps) {
  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-xl font-semibold text-black">Analiz Türü Seç</h1>
        </div>

        {capturedImage && (
          <div className="mb-6">
            <img
              src={capturedImage}
              alt="Captured food"
              className="w-full max-w-md mx-auto rounded-lg shadow-md"
            />
          </div>
        )}

        <div className="space-y-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectType('quick')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-black">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                Hızlı Analiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Ai fotoğraftaki besini hemen değerlendirir. Hızlı sonuç alırsınız.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Anında sonuç</li>
                <li>• Genel besin değerleri</li>
                <li>• Temel kalori hesabı</li>
              </ul>
              <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white">
                Hızlı Analiz Yap
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onSelectType('detailed')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-black">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Search className="h-6 w-6 text-blue-600" />
                </div>
                Detaylı Analiz
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Daha doğru hesaplama için size birkaç soru sorarız. Daha hassas sonuç alırsınız.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Pişirme yöntemi soruları</li>
                <li>• Porsiyon detayları</li>
                <li>• Gizli malzemeler</li>
                <li>• Daha hassas kalori hesabı</li>
              </ul>
              <Button className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white">
                Detaylı Analiz Yap
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
                <li>• Ai hatalarından bağımsız</li>
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
