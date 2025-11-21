import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Crown, Camera, Sparkles } from 'lucide-react'

interface TrialLimitModalProps {
  isOpen: boolean
  onUpgrade: () => void
  limitType: 'photo' | 'meal_suggestion'
}

export function TrialLimitModal({
  isOpen,
  onUpgrade,
  limitType
}: TrialLimitModalProps) {
  const isPhotoLimit = limitType === 'photo'

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
              {isPhotoLimit ? (
                <Camera className="h-8 w-8 text-orange-600" />
              ) : (
                <Sparkles className="h-8 w-8 text-orange-600" />
              )}
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Ücretsiz Deneme Hakkınız Doldu
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <p className="text-base">
              {isPhotoLimit
                ? 'Ücretsiz fotoğraf analizi hakkınızı tükettiniz.'
                : 'Ücretsiz AI yemek önerisi hakkınızı tükettiniz.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Premium üyeliğe geçerek sınırsız erişimin keyfini çıkarın!
            </p>

            <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-200 rounded-lg p-4 mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Crown className="h-5 w-5 text-orange-600" />
                <p className="font-semibold text-orange-900">Premium Avantajları</p>
              </div>
              <ul className="space-y-2 text-sm text-left text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Sınırsız fotoğraf analizi</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Sınırsız AI yemek önerileri</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Detaylı beslenme raporları</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">•</span>
                  <span>Kişiselleştirilmiş menüler</span>
                </li>
              </ul>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <AlertDialogAction
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Crown className="mr-2 h-4 w-4" />
            Premium'a Geç
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
