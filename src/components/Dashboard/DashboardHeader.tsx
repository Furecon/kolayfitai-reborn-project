
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Camera, User, Lightbulb, Phone, BookOpen } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'

interface DashboardHeaderProps {
  onCameraClick: () => void
  onProfileClick: () => void
  onContactClick: () => void
  onResourcesClick: () => void
}

export function DashboardHeader({ onCameraClick, onProfileClick, onContactClick, onResourcesClick }: DashboardHeaderProps) {
  const { signOut, user } = useAuth()

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/0ded84b0-5b4f-411e-bb63-649e8fb48126.png" 
            alt="KolayfitAi" 
            className="h-10"
          />
          <div>
            <h1 className="text-xl font-bold text-black">KolayfitAi</h1>
            <p className="text-sm text-gray-600">Hoş geldin!</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onCameraClick}
            className="border-gray-300"
          >
            <Camera className="h-5 w-5" />
          </Button>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onProfileClick}
            className="border-gray-300"
          >
            <User className="h-5 w-5" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-gray-300"
              >
                <Lightbulb className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={onContactClick}
                >
                  <Phone className="h-4 w-4 mr-2" />
                  İletişim ve Destek
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={onResourcesClick}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Kaynaklar
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant="ghost"
            onClick={signOut}
            className="text-gray-600"
          >
            Çıkış
          </Button>
        </div>
      </div>
    </div>
  )
}
