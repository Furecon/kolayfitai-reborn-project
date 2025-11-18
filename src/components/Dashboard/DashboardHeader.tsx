import { Button } from '@/components/ui/button'
import { Camera, Plus } from 'lucide-react'

interface DashboardHeaderProps {
  onCameraClick: () => void
}

export function DashboardHeader({
  onCameraClick
}: DashboardHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 w-full">
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <img
              src="/lovable-uploads/0ded84b0-5b4f-411e-bb63-649e8fb48126.png"
              alt="KolayfitAi"
              className="h-7 sm:h-9 md:h-11 flex-shrink-0"
            />
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-black truncate">KolayfitAi</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Sağlıklı yaşam asistanınız</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            <Button
              onClick={onCameraClick}
              className="bg-green-600 hover:bg-green-700 text-white h-9 sm:h-11 px-3 sm:px-5 shadow-md"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 sm:mr-2" />
              <span className="hidden sm:inline font-medium">Öğün Ekle</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
