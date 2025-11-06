import { useState, useEffect } from 'react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Crown, Calendar, RefreshCw, Sparkles, CheckCircle2, Info } from 'lucide-react'
import { purchaseService } from '@/services/PurchaseService'
import { PaywallButton } from './PaywallButton'
import { Capacitor } from '@capacitor/core'

interface SubscriptionData {
  subscriptionValid: boolean
  subscriptionStatus: 'trial' | 'premium' | 'expired'
  remainingDays: number
  currentPlan?: 'monthly_premium' | 'yearly_premium' | null
  subscription?: any
}

export function SubscriptionManager() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [restoring, setRestoring] = useState(false)

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

  const cancelSubscription = async () => {
    if (!user) return

    toast({
      title: "Abonelik İptali",
      description: "Aboneliğinizi iptal etmek için Play Store'dan Abonelikler bölümünü açın.",
    })

    try {
      const playStoreUrl = "https://play.google.com/store/account/subscriptions"
      window.open(playStoreUrl, '_blank')
    } catch (error) {
      console.error('Failed to open Play Store:', error)
    }
  }

  const restorePurchases = async () => {
    if (!user) return

    setRestoring(true)
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
      setRestoring(false)
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
  const isMonthlyPlan = subscriptionData.currentPlan === 'monthly_premium'
  const isYearlyPlan = subscriptionData.currentPlan === 'yearly_premium'
  const isNative = Capacitor.isNativePlatform()

  return (
    <div className="space-y-6">
      {/* Abonelik Durumu */}
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
              : "Premium özelliklerden yararlanmak için abone olun"
            }
          </CardDescription>
        </CardHeader>
        {isPremiumActive && (
          <CardContent>
            <div className="p-4 bg-muted rounded-lg space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <p className="text-sm font-medium">
                    {isMonthlyPlan ? 'Aylık Premium' : isYearlyPlan ? 'Yıllık Premium' : 'Premium'} aktif
                  </p>
                </div>
                <p className="text-xs text-muted-foreground ml-6">
                  Aboneliğiniz {subscriptionData.remainingDays} gün sonra yenilenecek
                </p>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Abonelik Yönetimi:</strong> Play Store üzerinden aboneliğinizi yönetebilir, iptal edebilir veya değiştirebilirsiniz.
                </p>
                <p className="text-xs text-muted-foreground">
                  İptal durumunda aboneliğiniz mevcut dönem sonuna kadar aktif kalacaktır.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelSubscription}
                className="w-full"
              >
                Abonelik Ayarları (Play Store)
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Premium Özellikler - Sadece premium değilse göster */}
      {!isPremiumActive && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Premium Özellikleri
            </CardTitle>
            <CardDescription>
              Premium abonelikle neler kazanırsınız?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Sınırsız Yemek Analizi</p>
                  <p className="text-xs text-muted-foreground">Günlük 10 analiz limiti olmadan dilediğiniz kadar analiz yapın</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">AI Destekli Beslenme Önerileri</p>
                  <p className="text-xs text-muted-foreground">Kişiselleştirilmiş menüler ve beslenme önerileri</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Detaylı Raporlar</p>
                  <p className="text-xs text-muted-foreground">Haftalık ve aylık beslenme raporları</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Favoriler ve Geçmiş</p>
                  <p className="text-xs text-muted-foreground">Sık kullandığınız yemekleri kaydedin ve geçmişinizi takip edin</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Öncelikli Destek</p>
                  <p className="text-xs text-muted-foreground">Sorularınıza hızlı yanıt alın</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Premium Planlar - Native'de Paywall, Web'de Bilgilendirme */}
      {!isPremiumActive && (
        <>
          {isNative ? (
            <Card className="relative border-2 border-primary shadow-lg overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -z-10"></div>
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Önerilen
                </Badge>
              </div>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-primary" />
                  Premium'a Geçin
                </CardTitle>
                <CardDescription>
                  Tüm özelliklere sınırsız erişim kazanın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Aylık Plan</span>
                    </div>
                    <span className="text-lg font-bold text-primary">149,99 ₺/ay</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Yıllık Plan</span>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">1.499,99 ₺/yıl</span>
                      <span className="block text-xs text-green-600">%17 indirim</span>
                    </div>
                  </div>
                </div>

                {isTrialActive && (
                  <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <Info className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-green-700">
                      İlk 3 gün ücretsiz! Deneme süresi içinde iptal ederseniz ücret alınmaz.
                    </p>
                  </div>
                )}

                <PaywallButton
                  size="lg"
                  className="w-full"
                  onSuccess={checkSubscriptionStatus}
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Planları Görüntüle
                </PaywallButton>

                <p className="text-xs text-center text-muted-foreground">
                  Güvenli ödeme - Google Play ile korumalı
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  Premium Planlar
                </CardTitle>
                <CardDescription>
                  Mobil uygulamadan premium aboneliğe geçebilirsiniz
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">Aylık Premium</span>
                      </div>
                      <span className="text-lg font-bold text-primary">149,99 ₺/ay</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Tüm premium özelliklere erişim</p>
                  </div>
                  <div className="p-4 border border-primary rounded-lg bg-primary/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-primary" />
                        <span className="font-medium">Yıllık Premium</span>
                        <Badge variant="secondary" className="text-xs">%17 İndirim</Badge>
                      </div>
                      <span className="text-lg font-bold text-primary">1.499,99 ₺/yıl</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Yaklaşık 300 ₺ tasarruf</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground text-center">
                      Satın alma işlemleri Android uygulaması üzerinden yapılabilir
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Bilgilendirme ve Restore */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Önemli Bilgiler:</strong></p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Ödemeler Google Play hesabınız üzerinden güvenli şekilde yapılır</li>
                  <li>Abonelik süresi sonunda otomatik olarak yenilenir</li>
                  <li>İptal için Play Store → Abonelikler bölümünü kullanın</li>
                  <li>İptal durumunda mevcut dönem sonuna kadar Premium erişim devam eder</li>
                  {isTrialActive && (
                    <li className="text-green-600">Ücretsiz deneme süresi içinde iptal ederseniz ücret alınmaz</li>
                  )}
                </ul>
              </div>
            </div>

            {isNative && (
              <div className="pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={restorePurchases}
                  disabled={restoring}
                  className="w-full"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${restoring ? 'animate-spin' : ''}`} />
                  {restoring ? "Yükleniyor..." : "Satın Alımları Geri Yükle"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
