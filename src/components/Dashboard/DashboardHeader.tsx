
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Camera, User, Lightbulb, Phone, BookOpen, LogOut, FileText, HelpCircle } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'

interface DashboardHeaderProps {
  onCameraClick: () => void
  onProfileClick: () => void
  onContactClick: () => void
  onResourcesClick: () => void
  onPoliciesClick: () => void
  onFAQClick: () => void
}

export function DashboardHeader({ 
  onCameraClick, 
  onProfileClick, 
  onContactClick, 
  onResourcesClick,
  onPoliciesClick,
  onFAQClick
}: DashboardHeaderProps) {
  const { signOut, user } = useAuth()

  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2 sm:py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
          <img 
            src="/lovable-uploads/0ded84b0-5b4f-411e-bb63-649e8fb48126.png" 
            alt="KolayfitAi" 
            className="h-6 sm:h-8 md:h-10 flex-shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-black truncate">KolayfitAi</h1>
            <p className="text-xs sm:text-sm text-gray-600 truncate">Hoş geldin!</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onCameraClick}
            className="border-gray-300 h-8 w-8 sm:h-10 sm:w-10"
          >
            <Camera className="h-3 w-3 sm:h-5 sm:w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onProfileClick}
            className="border-gray-300 h-8 w-8 sm:h-10 sm:w-10"
          >
            <User className="h-3 w-3 sm:h-5 sm:w-5" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 h-8 w-8 sm:h-10 sm:w-10"
              >
                <Lightbulb className="h-3 w-3 sm:h-5 sm:w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 sm:w-56 p-2">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={onContactClick}
                >
                  <Phone className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  İletişim ve Destek
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={onResourcesClick}
                >
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Kaynaklar
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={onPoliciesClick}
                >
                  <FileText className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Politikalar
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={onFAQClick}
                >
                  <HelpCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Sık Sorulan Sorular
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant="ghost"
            onClick={signOut}
            className="text-gray-600 h-8 sm:h-10 px-2 sm:px-4"
          >
            <LogOut className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">Çıkış</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
