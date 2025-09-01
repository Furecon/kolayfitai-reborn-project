import { useState, useEffect } from 'react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Crown, Calendar, TrendingUp, RefreshCw } from 'lucide-react'
import { purchaseService } from '@/services/PurchaseService'

interface SubscriptionData {
  subscriptionValid: boolean
  subscriptionStatus: 'trial' | 'premium' | 'expired'
  remainingDays: number
  subscription?: any
}

export function SubscriptionManager() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (user) {
      initializePurchaseService()
      checkSubscriptionStatus()
    }
  }, [user])

  const initializePurchaseService = async () => {
    try {
      await purchaseService.initialize()
    } catch (error) {
      console.error('Failed to initialize purchase service:', error)
    }
  }

  const checkSubscriptionStatus = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          method: 'POST',
          action: 'check_subscription',
          userId: user.id
        }
      })

      if (error) throw error
      setSubscriptionData(data)
    } catch (error) {
      console.error('Subscription check error:', error)
      toast({
        title: "Hata",
        description: "Abonelik durumu kontrol edilemedi",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const purchaseSubscription = async (productId: string) => {
    if (!user) return

    setPurchasing(true)
    try {
      if (!purchaseService.isAvailable()) {
        throw new Error('Satın alma servisi kullanılamıyor')
      }

      const success = await purchaseService.purchaseProduct(productId, user.id)
      
      if (success) {
        toast({
          title: "Başarılı!",
          description: "Aboneliğiniz başarıyla etkinleştirildi",
        })

        // Abonelik durumunu yeniden kontrol et
        await checkSubscriptionStatus()
      } else {
        throw new Error('Satın alma işlemi başarısız oldu')
      }

    } catch (error: any) {
      console.error('Purchase error:', error)
      toast({
        title: "Hata",
        description: error.message || "Satın alma işlemi başarısız oldu",
        variant: "destructive"
      })
    } finally {
      setPurchasing(false)
    }
  }

  const restorePurchases = async () => {
    if (!user) return

    setPurchasing(true)
    try {
      const success = await purchaseService.restorePurchases()
      
      if (success) {
        toast({
          title: "Başarılı!",
          description: "Satın alımlarınız geri yüklendi",
        })
        await checkSubscriptionStatus()
      } else {
        toast({
          title: "Bilgi",
          description: "Geri yüklenecek satın alım bulunamadı",
        })
      }
    } catch (error) {
      console.error('Restore error:', error)
      toast({
        title: "Hata",
        description: "Satın alımlar geri yüklenemedi",
        variant: "destructive"
      })
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg"></div>
        <div className="h-40 bg-muted animate-pulse rounded-lg"></div>
      </div>
    )
  }

  if (!subscriptionData) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Abonelik bilgileri yüklenemedi</p>
        </CardContent>
      </Card>
    )
  }

  const isTrialActive = subscriptionData.subscriptionStatus === 'trial' && subscriptionData.subscriptionValid
  const isPremiumActive = subscriptionData.subscriptionStatus === 'premium' && subscriptionData.subscriptionValid

  return (
    <div className="space-y-6">
      {/* Mevcut Durum */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              <CardTitle>Abonelik Durumu</CardTitle>
            </div>
            <Badge variant={subscriptionData.subscriptionValid ? "default" : "destructive"}>
              {isTrialActive ? "Ücretsiz Deneme" : isPremiumActive ? "Premium" : "Süresi Dolmuş"}
            </Badge>
          </div>
          <CardDescription>
            {subscriptionData.subscriptionValid 
              ? `${subscriptionData.remainingDays} gün kaldı`
              : "Premium özelliklerden yararlanmak için bir plan seçin"
            }
          </CardDescription>
        </CardHeader>
        {isPremiumActive && (
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Abonelik Yönetimi:</strong> Play Store üzerinden aboneliğinizi yönetebilir, iptal edebilir veya değiştirebilirsiniz.
              </p>
              <p className="text-xs text-muted-foreground">
                İptal durumunda aboneliğiniz mevcut dönem sonuna kadar aktif kalacaktır.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Abonelik Planları */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Aylık Plan */}
        <Card className="relative">
          {!isPremiumActive && isTrialActive && (
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge variant="secondary">
                3 Gün Ücretsiz Deneme
              </Badge>
            </div>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Aylık Plan
            </CardTitle>
            <CardDescription>
              <div className="space-y-1">
                <div>
                  <span className="text-2xl font-bold text-primary">119,99 ₺</span>
                  <span className="text-muted-foreground">/ay</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Her ay düzenli olarak 119,99 ₺ tahsil edilir.
                </div>
                {!isPremiumActive && isTrialActive && (
                <div className="text-xs text-green-600 font-medium">
                  İlk 3 gün ücretsiz, sonra aylık 119,99 ₺
                </div>
                )}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li>• Sınırsız yemek analizi</li>
              <li>• AI destekli beslenme önerileri</li>
              <li>• Kişiselleştirilmiş menüler</li>
              <li>• Detaylı raporlama</li>
              <li>• Favoriler ve geçmiş kayıtlar</li>
            </ul>
            <Button 
              className="w-full" 
              onClick={() => purchaseSubscription('monthly_119_99')}
              disabled={purchasing || isPremiumActive}
              variant={isPremiumActive ? "secondary" : "default"}
            >
              {purchasing ? "İşleniyor..." : isPremiumActive ? "Mevcut Plan" : "Aylık Plana Geç"}
            </Button>
          </CardContent>
        </Card>

        {/* Yıllık Plan */}
        <Card className="relative border-primary">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-primary">
              <TrendingUp className="h-3 w-3 mr-1" />
              %17 İndirim
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Yıllık Plan
            </CardTitle>
            <CardDescription>
              <div className="space-y-1">
                <div>
                  <span className="text-2xl font-bold text-primary">1.199,99 ₺</span>
                  <span className="text-muted-foreground">/yıl</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Yılda bir kez 1.199,99 ₺ tahsil edilir (Aylık ortalama 100 ₺).
                </div>
                <div className="text-xs text-green-600 font-medium">
                  %17 indirim ile yaklaşık 240 ₺ tasarruf
                </div>
                {!isPremiumActive && isTrialActive && (
                  <div className="text-xs text-green-600 font-medium">
                    İlk 3 gün ücretsiz, sonra yıllık 1.199,99 ₺
                  </div>
                )}
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li>• Aylık planın tüm özellikleri</li>
              <li>• %17 indirim ile yaklaşık 240 ₺ tasarruf</li>
              <li>• Öncelikli müşteri desteği</li>
              <li>• Gelişmiş analitikler ve raporlar</li>
              <li>• Özel AI önerileri</li>
            </ul>
            <Button 
              className="w-full" 
              onClick={() => purchaseSubscription('yearly_1199_99')}
              disabled={purchasing || isPremiumActive}
              variant={isPremiumActive ? "secondary" : "default"}
            >
              {purchasing ? "İşleniyor..." : isPremiumActive ? "Mevcut Plan" : "Yıllık Plana Geç"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Play Store Bilgilendirme */}
      <Card>
        <CardContent className="p-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>Önemli Bilgiler:</strong></p>
            <ul className="space-y-1 ml-4">
              <li>• Ödemeler Google Play hesabınız üzerinden güvenli şekilde yapılır.</li>
              <li>• Abonelik süresi sonunda otomatik olarak yenilenir.</li>
              <li>• İptal etmek için Play Store → Abonelikler bölümünü kullanabilirsiniz.</li>
              <li>• İptal durumunda mevcut fatura dönemi sonuna kadar Premium erişim devam eder.</li>
              <li>• Ücretsiz deneme süresi içinde iptal ederseniz ücret alınmaz.</li>
            </ul>
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={restorePurchases}
                disabled={purchasing}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {purchasing ? "Yükleniyor..." : "Satın Alımları Geri Yükle"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}