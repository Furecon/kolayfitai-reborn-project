import { useState, useEffect } from 'react'
import { useAuth } from '@/components/Auth/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Crown, Calendar, TrendingUp } from 'lucide-react'

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
      checkSubscriptionStatus()
    }
  }, [user])

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
      // Mock purchase data - gerçek uygulamada Google Play API'den gelecek
      const mockReceiptData = {
        purchaseToken: `mock_token_${Date.now()}`,
        orderId: `mock_order_${Date.now()}`,
        productId,
        purchaseTime: Date.now()
      }

      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          method: 'POST',
          action: 'validate_purchase',
          userId: user.id,
          receiptData: mockReceiptData,
          productId
        }
      })

      if (error) throw error

      toast({
        title: "Başarılı!",
        description: "Aboneliğiniz başarıyla etkinleştirildi",
      })

      // Abonelik durumunu yeniden kontrol et
      await checkSubscriptionStatus()

    } catch (error) {
      console.error('Purchase error:', error)
      toast({
        title: "Hata",
        description: "Satın alma işlemi başarısız oldu",
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
              : "Aboneliğinizi yenilemek için aşağıdaki planlardan birini seçin"
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Abonelik Planları */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Aylık Plan */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Aylık Plan
            </CardTitle>
            <CardDescription>
              <span className="text-2xl font-bold text-primary">119,90 ₺</span>
              <span className="text-muted-foreground">/ay</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li>• Sınırsız yemek analizi</li>
              <li>• Ai destekli beslenme önerileri</li>
              <li>• Kişiselleştirilmiş menüler</li>
              <li>• Detaylı raporlama</li>
            </ul>
            <Button 
              className="w-full" 
              onClick={() => purchaseSubscription('monthly_119_90')}
              disabled={purchasing || isPremiumActive}
            >
              {purchasing ? "İşleniyor..." : "Aylık Abonelik Satın Al"}
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
              <span className="text-2xl font-bold text-primary">1.199,99 ₺</span>
              <span className="text-muted-foreground">/yıl</span>
              <div className="text-xs text-muted-foreground mt-1">
                Aylık {(1199.99 / 12).toFixed(2)} ₺
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground mb-4">
              <li>• Tüm aylık plan özellikleri</li>
              <li>• %17 daha ucuz</li>
              <li>• Öncelikli destek</li>
              <li>• Gelişmiş analitikler</li>
            </ul>
            <Button 
              className="w-full" 
              onClick={() => purchaseSubscription('yearly_1199_99')}
              disabled={purchasing || isPremiumActive}
            >
              {purchasing ? "İşleniyor..." : "Yıllık Abonelik Satın Al"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}