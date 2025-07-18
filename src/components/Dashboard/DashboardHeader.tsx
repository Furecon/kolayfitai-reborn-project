
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Menu, User, LogOut } from 'lucide-react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DashboardHeaderProps {
  onCameraClick: () => void
  onProfileClick: () => void
}

export function DashboardHeader({ onCameraClick, onProfileClick }: DashboardHeaderProps) {
  const { user, signOut } = useAuth()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    if (user) {
      fetchUserName()
    }
  }, [user])

  const fetchUserName = async () => {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('name')
      .eq('user_id', user.id)
      .single()

    if (data?.name) {
      setUserName(data.name)
    } else {
      setUserName(user.email?.split('@')[0] || 'Kullanıcı')
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Günaydın'
    if (hour < 18) return 'İyi günler'
    return 'İyi akşamlar'
  }

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-black">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-sm text-gray-600">Bugünkü hedeflerinizi takip edin</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={onCameraClick}
            className="bg-green-500 hover:bg-green-600 text-white"
            size="sm"
          >
            <Camera className="h-4 w-4 mr-2" />
            Fotoğraf Çek
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-300">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
                <User className="h-4 w-4 mr-2" />
                Profil Ayarları
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış Yap
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
