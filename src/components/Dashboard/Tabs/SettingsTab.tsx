import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  User,
  Target,
  Bell,
  CreditCard,
  HelpCircle,
  Shield,
  FileText,
  LogOut,
  ChevronRight,
  Mail,
  Utensils,
  BookOpen,
  History
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { useTutorialTarget } from '@/hooks/useTutorialTarget'
import ProfileSetup from '../../Profile/ProfileSetup'
import { DailyGoalsSettings } from '../../Profile/DailyGoalsSettings'
import { SubscriptionManager } from '../../Subscription/SubscriptionManager'
import { ContactPage } from '../../Support/ContactPage'
import { ResourcesPage } from '../../Support/ResourcesPage'
import { PoliciesPage } from '../../Support/PoliciesPage'
import { FAQPage } from '../../Support/FAQPage'
import { NotificationSettings } from '../../Profile/NotificationSettings'
import { DietOnboarding } from '../../Diet/DietOnboarding'
import { DietProfile } from '@/types/diet'
import { TutorialsGuide } from '../../Settings/TutorialsGuide'
import { getTutorialByFeatureId } from '@/lib/tutorialConfig'
import { useTutorial } from '../../Tutorial/TutorialProvider'
import { AdHistoryView } from '@/components/Ads/AdHistoryView'

type SettingsView = 'main' | 'profile' | 'goals' | 'subscription' | 'notifications' | 'contact' | 'resources' | 'policies' | 'faq' | 'diet' | 'tutorials' | 'ad_history'

interface SettingsTabProps {
  onRefreshNeeded?: () => void
}

export function SettingsTab({ onRefreshNeeded }: SettingsTabProps) {
  const { toast } = useToast()
  const [currentView, setCurrentView] = useState<SettingsView>('main')
  const bodyInfoSectionRef = useTutorialTarget('BodyInfoSection')
  const { startTutorial } = useTutorial()

  useEffect(() => {
    const handleTutorialNavigate = (event: CustomEvent) => {
      const { featureId } = event.detail
      const tutorial = getTutorialByFeatureId(featureId)

      if (!tutorial) return

      // Handle settings-related tutorials
      if (tutorial.targetView === 'profile') {
        setCurrentView('profile')
        setTimeout(() => {
          startTutorial(featureId)
        }, tutorial.navigationDelay || 1200)
      } else if (tutorial.targetView === 'subscription') {
        setCurrentView('subscription')
        setTimeout(() => {
          startTutorial(featureId)
        }, tutorial.navigationDelay || 1200)
      } else if (tutorial.targetView === 'notifications') {
        setCurrentView('notifications')
        setTimeout(() => {
          startTutorial(featureId)
        }, tutorial.navigationDelay || 1200)
      }
    }

    window.addEventListener('tutorial-navigate' as any, handleTutorialNavigate)
    return () => {
      window.removeEventListener('tutorial-navigate' as any, handleTutorialNavigate)
    }
  }, [startTutorial])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      toast({
        title: "Çıkış yapıldı",
        description: "Başarıyla çıkış yaptınız"
      })
    } catch (error) {
      toast({
        title: "Hata",
        description: "Çıkış yapılırken bir hata oluştu",
        variant: "destructive"
      })
    }
  }

  if (currentView === 'profile') {
    return (
      <div className="pb-20 w-full">
        <ProfileSetup
          onBack={() => {
            setCurrentView('main')
            onRefreshNeeded?.()
          }}
        />
      </div>
    )
  }

  if (currentView === 'goals') {
    return (
      <div className="pb-20 w-full">
        <DailyGoalsSettings
          onBack={() => {
            setCurrentView('main')
            onRefreshNeeded?.()
          }}
        />
      </div>
    )
  }

  if (currentView === 'subscription') {
    return (
      <div className="pb-20 pt-4 w-full">
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-3 sm:py-4 mb-4 w-full">
          <div className="max-w-screen-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('main')}
              className="text-gray-600 h-10"
            >
              <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
              Geri
            </Button>
            <h1 className="text-xl font-semibold mt-2">Abonelik Yönetimi</h1>
          </div>
        </div>
        <div className="w-full px-4 sm:px-6">
          <div className="max-w-screen-2xl mx-auto">
            <SubscriptionManager />
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'contact') {
    return (
      <div className="pb-20 w-full">
        <ContactPage onBack={() => setCurrentView('main')} />
      </div>
    )
  }

  if (currentView === 'resources') {
    return (
      <div className="pb-20 w-full">
        <ResourcesPage onBack={() => setCurrentView('main')} />
      </div>
    )
  }

  if (currentView === 'policies') {
    return (
      <div className="pb-20 w-full">
        <PoliciesPage onBack={() => setCurrentView('main')} />
      </div>
    )
  }

  if (currentView === 'faq') {
    return (
      <div className="pb-20 w-full">
        <FAQPage onBack={() => setCurrentView('main')} />
      </div>
    )
  }

  if (currentView === 'diet') {
    const handleDietProfileComplete = async (profile: DietProfile) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: existingProfile } = await supabase
          .from('diet_profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existingProfile) {
          await supabase
            .from('diet_profiles')
            .update(profile)
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('diet_profiles')
            .insert({
              ...profile,
              user_id: user.id,
            });
        }

        toast({
          title: 'Başarılı',
          description: 'Diyet profili kaydedildi',
        });

        setCurrentView('main');
      } catch (error: any) {
        toast({
          title: 'Hata',
          description: error.message || 'Profil kaydedilirken hata oluştu',
          variant: 'destructive',
        });
      }
    };

    return (
      <DietOnboarding
        onComplete={handleDietProfileComplete}
        onSkip={() => setCurrentView('main')}
      />
    );
  }

  if (currentView === 'notifications') {
    return (
      <div className="pb-20 pt-4 w-full">
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-3 sm:py-4 mb-4 w-full">
          <div className="max-w-screen-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('main')}
              className="text-gray-600 h-10"
            >
              <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
              Geri
            </Button>
            <h1 className="text-xl font-semibold mt-2">Bildirim Ayarları</h1>
          </div>
        </div>
        <div className="w-full px-4 sm:px-6">
          <div className="max-w-screen-2xl mx-auto">
            <NotificationSettings />
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'tutorials') {
    return (
      <div className="pb-20 pt-4 w-full">
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-3 sm:py-4 mb-4 w-full">
          <div className="max-w-screen-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('main')}
              className="text-gray-600 h-10"
            >
              <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
              Geri
            </Button>
            <h1 className="text-xl font-semibold mt-2">Rehberler & İpuçları</h1>
          </div>
        </div>
        <div className="w-full px-4 sm:px-6">
          <div className="max-w-screen-2xl mx-auto">
            <TutorialsGuide />
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'ad_history') {
    return (
      <div className="pb-20 pt-4 w-full">
        <div className="border-b border-gray-200 bg-white px-4 sm:px-6 py-3 sm:py-4 mb-4 w-full">
          <div className="max-w-screen-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('main')}
              className="text-gray-600 h-10"
            >
              <ChevronRight className="h-4 w-4 mr-2 rotate-180" />
              Geri
            </Button>
            <h1 className="text-xl font-semibold mt-2">Reklam Geçmişi</h1>
          </div>
        </div>
        <div className="w-full px-4 sm:px-6">
          <div className="max-w-screen-2xl mx-auto">
            <AdHistoryView />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-20 pt-4 w-full">
      <div className="w-full px-4 sm:px-6 mb-4">
        <div className="max-w-screen-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Ayarlar</h1>
          <p className="text-sm text-gray-600 mt-1">Hesap ve uygulama ayarları</p>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 space-y-4">
        <div className="max-w-screen-2xl mx-auto space-y-4">
        <Card ref={bodyInfoSectionRef as any}>
          <CardContent className="p-0">
            <button
              onClick={() => setCurrentView('profile')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Profil Bilgileri</div>
                  <div className="text-xs text-gray-500">Kişisel bilgilerinizi düzenleyin</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={() => setCurrentView('goals')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Günlük Hedefler</div>
                  <div className="text-xs text-gray-500">Kalori ve makro hedefleriniz</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={() => setCurrentView('diet')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Utensils className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Diyet Profilim</div>
                  <div className="text-xs text-gray-500">Diyet tercihleri ve AI plan ayarları</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <button
              onClick={() => setCurrentView('notifications')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Bell className="h-5 w-5 text-orange-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Bildirim Ayarları</div>
                  <div className="text-xs text-gray-500">Hatırlatma ve bildirimler</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={() => setCurrentView('subscription')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Abonelik Yönetimi</div>
                  <div className="text-xs text-gray-500">Premium üyelik ve ödemeler</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={() => setCurrentView('ad_history')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <History className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Reklam Geçmişi</div>
                  <div className="text-xs text-gray-500">İzlediğiniz reklamlar ve ödüller</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <button
              onClick={() => setCurrentView('tutorials')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Rehberler & İpuçları</div>
                  <div className="text-xs text-gray-500">Uygulama rehberleri</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={() => setCurrentView('faq')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <HelpCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Sık Sorulan Sorular</div>
                  <div className="text-xs text-gray-500">Yardım ve destek</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={() => setCurrentView('contact')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">İletişim</div>
                  <div className="text-xs text-gray-500">Bize ulaşın</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>

            <button
              onClick={() => setCurrentView('resources')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <FileText className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Kaynaklar</div>
                  <div className="text-xs text-gray-500">Faydalı bilgiler</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            <button
              onClick={() => setCurrentView('policies')}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-gray-600" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900">Gizlilik ve Politikalar</div>
                  <div className="text-xs text-gray-500">Kullanım koşulları ve gizlilik</div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </button>
          </CardContent>
        </Card>

          <Card>
            <CardContent className="p-4">
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Çıkış Yap
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
