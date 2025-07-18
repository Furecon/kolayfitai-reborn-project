
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Settings, 
  Bell, 
  HelpCircle, 
  LogOut,
  Edit
} from 'lucide-react'

interface ProfileDropdownProps {
  userName: string
  userEmail?: string
}

export default function ProfileDropdown({ userName, userEmail }: ProfileDropdownProps) {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const handleLogout = () => {
    // TODO: Implement actual logout logic
    console.log('Kullanıcı çıkış yapıyor...')
    setIsLogoutDialogOpen(false)
  }

  const handleProfileEdit = () => {
    console.log('Profil düzenleme sayfasına yönlendiriliyor...')
  }

  const handleAccountSettings = () => {
    console.log('Hesap ayarları sayfasına yönlendiriliyor...')
  }

  const handleNotifications = () => {
    console.log('Bildirim ayarları sayfasına yönlendiriliyor...')
  }

  const handleHelp = () => {
    console.log('Yardım sayfasına yönlendiriliyor...')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Avatar className="h-8 w-8">
            <AvatarImage alt={userName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-medium">
              {userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64 mr-4" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{userName}</p>
            {userEmail && (
              <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleProfileEdit} className="cursor-pointer">
          <Edit className="mr-2 h-4 w-4" />
          <span>Profil Düzenle</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleAccountSettings} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Hesap Ayarları</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleNotifications} className="cursor-pointer">
          <Bell className="mr-2 h-4 w-4" />
          <span>Bildirimler</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleHelp} className="cursor-pointer">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Yardım & Destek</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem 
              onSelect={(e) => {
                e.preventDefault()
                setIsLogoutDialogOpen(true)
              }}
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Çıkış Yap</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
          
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Çıkış yapmak istediğinizden emin misiniz?</AlertDialogTitle>
              <AlertDialogDescription>
                Bu işlem sizi uygulamadan çıkaracak ve tekrar giriş yapmanız gerekecek.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>İptal</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700"
              >
                Çıkış Yap
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
