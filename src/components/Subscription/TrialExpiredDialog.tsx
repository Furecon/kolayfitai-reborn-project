import { useState, useEffect } from 'react';
import { useAuth } from '@/components/Auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';
import { purchaseService } from '@/services/PurchaseService';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Crown, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function TrialExpiredDialog() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkTrialStatus();
  }, [user]);

  const checkTrialStatus = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, trial_end_date')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      // Check if trial has expired
      if (profile.subscription_status === 'trial' && profile.trial_end_date) {
        const trialEndDate = new Date(profile.trial_end_date);
        const now = new Date();

        if (now > trialEndDate) {
          // Trial has expired, show upgrade dialog
          setTimeout(() => {
            setShowDialog(true);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error checking trial status:', error);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const success = await purchaseService.purchaseWithPaywall(user.id);

      if (success) {
        toast({
          title: 'Harika!',
          description: 'Premium aboneliğiniz başarıyla aktif edildi.',
        });
        setShowDialog(false);
      } else {
        toast({
          title: 'İşlem İptal Edildi',
          description: 'Satın alma işlemi iptal edildi.',
        });
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLater = () => {
    setShowDialog(false);
    // Show again after 24 hours
    setTimeout(() => {
      setShowDialog(true);
    }, 24 * 60 * 60 * 1000);
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 p-4 rounded-full">
              <Crown className="h-12 w-12 text-orange-500" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Deneme Süreniz Sona Erdi
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-4">
            <p className="text-base">
              KolayFit'in tüm özelliklerinden yararlanmaya devam etmek için Premium'a geçin!
            </p>
            <div className="space-y-2 text-left bg-gradient-to-br from-orange-50 to-white p-4 rounded-lg">
              <h4 className="font-semibold text-foreground mb-3">Premium Özellikler:</h4>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Sınırsız fotoğraf analizi</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Kişiselleştirilmiş AI yemek önerileri</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Detaylı besin değeri analizi</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">İlerleme takibi ve raporlar</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">Favori yemekler ve özel tarifler</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <strong className="text-foreground">Aylık:</strong> 149,99 ₺
              </p>
              <p>
                <strong className="text-foreground">Yıllık:</strong> 1.499,99 ₺ <span className="text-green-600 font-semibold">(17% indirim)</span>
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <Button
            onClick={handleUpgrade}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            size="lg"
          >
            {isLoading ? (
              'Yükleniyor...'
            ) : (
              <>
                <Crown className="h-5 w-5 mr-2" />
                Premium'a Geç
              </>
            )}
          </Button>
          <Button
            onClick={handleLater}
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            Daha Sonra
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
