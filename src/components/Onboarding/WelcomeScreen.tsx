
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface WelcomeScreenProps {
  onNext: () => void
}

export function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl font-bold">K</span>
          </div>
          <h1 className="text-3xl font-bold text-black mb-2">KolayfitAI'ye Hoş Geldin!</h1>
          <p className="text-gray-600 text-lg">
            Senin için kişisel kalori hedefi ve yemek planı hazırlamak için birkaç sorumuz var.
          </p>
        </div>

        {/* Action Card */}
        <Card className="border-gray-200">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <p className="text-gray-700 mb-6">
                Sağlıklı yaşam yolculuğuna başlamak için sadece 2 dakika ayır!
              </p>
            </div>
            
            <Button 
              onClick={onNext}
              className="bg-green-500 hover:bg-green-600 text-white text-lg px-8 py-3 rounded-lg w-full"
            >
              Başlayalım
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
