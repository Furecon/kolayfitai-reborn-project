
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface WhyInfoScreenProps {
  onNext: () => void
}

export function WhyInfoScreen({ onNext }: WhyInfoScreenProps) {
  const reasons = [
    {
      title: 'BMR Hesaplama',
      description: 'Vücudunun dinlenirken harcadığı kaloriyi öğrenmek için.',
      icon: '🔥',
      color: 'bg-red-50 border-red-200'
    },
    {
      title: 'Günlük Hedef Belirleme',
      description: 'Günlük tüketmen gereken kalori miktarını hesaplamak için.',
      icon: '🎯',
      color: 'bg-blue-50 border-blue-200'
    },
    {
      title: 'Yapay Zeka Önerileri',
      description: 'Senin verilerine uygun yemek önerileri ve tarifler sunabilmemiz için.',
      icon: '🤖',
      color: 'bg-purple-50 border-purple-200'
    }
  ]

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-4">
            Bu bilgileri neden doğru vermelisin?
          </h2>
        </div>

        {/* Cards */}
        <div className="space-y-6 mb-8">
          {reasons.map((reason, index) => (
            <Card key={index} className={`border-2 ${reason.color}`}>
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="text-4xl mr-4 mt-1">{reason.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-black mb-2">
                      {reason.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {reason.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Warning */}
        <Card className="border-2 border-yellow-200 bg-yellow-50 mb-8">
          <CardContent className="p-4 text-center">
            <p className="text-black font-semibold">
              ⚠️ Yanlış bilgi → Yanlış hedef
            </p>
          </CardContent>
        </Card>

        <Button 
          onClick={onNext}
          className="bg-green-500 hover:bg-green-600 text-white w-full py-3 rounded-lg"
        >
          Anladım, Devam Et
        </Button>
      </div>
    </div>
  )
}
