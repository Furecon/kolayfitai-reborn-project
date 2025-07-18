
import { Button } from '@/components/ui/button'
import { Camera, User } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'

interface DashboardHeaderProps {
  onCameraClick: () => void
  onProfileClick: () => void
}

export function DashboardHeader({ onCameraClick, onProfileClick }: DashboardHeaderProps) {
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
