
import { Button } from '@/components/ui/button'
import { useOnboarding } from './OnboardingProvider'

export function OnboardingWelcome() {
  const { setCurrentStep } = useOnboarding()

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <img 
            src="/kolayfit-logo.png" 
            alt="KolayfitAi" 
            className="h-20 mx-auto"
          />
          <h1 className="text-3xl font-bold text-black">
            KolayfitAi'ye Hoş Geldin!
          </h1>
          <p className="text-gray-600 leading-relaxed">
            Senin için kişisel kalori hedefi ve yemek planı hazırlamak için birkaç sorumuz var.
          </p>
        </div>

        <Button 
          onClick={() => setCurrentStep(2)}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-lg"
        >
          Başlayalım
        </Button>
      </div>
    </div>
  )
}
