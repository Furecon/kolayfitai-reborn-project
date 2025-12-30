import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Award, Sparkles, X, Crown } from 'lucide-react';
import { AdRewardService, FeatureType } from '@/services/AdRewardService';
import { AdMobService } from '@/services/AdMobService';
import { paywallService } from '@/services/PaywallService';
import { useToast } from '@/hooks/use-toast';

interface AdRewardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featureType: FeatureType;
  featureName: string;
  onAdCompleted: () => void;
  onCancel?: () => void;
}

export const AdRewardDialog = ({
  open,
  onOpenChange,
  featureType,
  featureName,
  onAdCompleted,
  onCancel,
}: AdRewardDialogProps) => {
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [isAdReady, setIsAdReady] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [adFailed, setAdFailed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAndPreload = async () => {
      if (!open) return;

      setAdFailed(false);

      try {
        if (!AdMobService.isInitialized() && AdMobService.isNativePlatform()) {
          console.log('[AdRewardDialog] AdMob not initialized, initializing now...');
          await AdMobService.initialize();
        }

        setIsTestMode(AdMobService.isTestMode());

        if (AdMobService.isInitialized()) {
          setIsAdReady(AdMobService.isAdReady());

          if (!AdMobService.isAdReady()) {
            console.log('[AdRewardDialog] Preloading ad...');
            await AdMobService.preloadRewardedAd();
            setIsAdReady(true);
          }
        } else {
          console.log('[AdRewardDialog] AdMob not available, will use test mode');
        }
      } catch (error) {
        console.error('[AdRewardDialog] Failed to initialize or preload ad:', error);
        setAdFailed(true);
      }
    };

    initializeAndPreload();
  }, [open]);

  const handleWatchAd = async () => {
    setIsShowingAd(true);

    try {
      const startTime = Date.now();
      let adWatched = false;
      let adNetwork = 'admob';

      if (AdMobService.isNativePlatform() && AdMobService.isInitialized()) {
        console.log('[AdRewardDialog] Showing real AdMob ad');
        adWatched = await AdMobService.showRewardedAd();
      } else {
        console.log('[AdRewardDialog] Using test mode (non-native or not initialized)');
        await new Promise(resolve => setTimeout(resolve, 2000));
        adWatched = true;
        adNetwork = 'test';
      }

      const adDuration = Math.floor((Date.now() - startTime) / 1000);

      const adResult = await AdRewardService.recordAdWatch(featureType, adWatched, {
        adNetwork,
        adPlacementId: `${featureType}_placement`,
        adDurationSeconds: adDuration,
      });

      if (adResult.rewardGranted) {
        toast({
          title: 'Ödül Kazandınız!',
          description: adResult.message,
          duration: 3000,
        });

        onOpenChange(false);
        onAdCompleted();
      } else {
        throw new Error('Ödül verilmedi');
      }
    } catch (error) {
      console.error('Ad watch error:', error);

      await AdRewardService.recordAdWatch(featureType, false, {
        adNetwork: AdMobService.isNativePlatform() ? 'admob' : 'test',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      const errorDetails = AdMobService.getLastError();
      const isTestMode = AdMobService.isTestMode();

      let errorMessage = 'Lütfen tekrar deneyin veya Premium üyeliğe geçin.';

      if (errorDetails) {
        errorMessage = errorDetails;
      }

      if (isTestMode) {
        errorMessage += '\n\n(Test modu aktif - Gerçek reklamlar gösterilecek)';
      }

      setAdFailed(true);

      toast({
        title: 'Reklam Gösterilemedi',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
      });

      AdMobService.clearLastError();
    } finally {
      setIsShowingAd(false);
    }
  };

  const handleUpgradeToPremium = async () => {
    try {
      onOpenChange(false);
      const result = await paywallService.presentPaywall();

      if (result.result === 'purchased' || result.result === 'restored') {
        toast({
          title: 'Premium Aktif!',
          description: 'Tüm özelliklere sınırsız erişim sağladınız.',
          duration: 4000,
        });
        onAdCompleted();
      } else if (result.result === 'error') {
        toast({
          title: 'Hata',
          description: result.error || 'Premium sayfası açılamadı.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to show paywall:', error);
      toast({
        title: 'Hata',
        description: 'Premium sayfası açılamadı. Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    onCancel?.();
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <Award className="h-6 w-6 text-primary" />
            Reklam İzleyerek Devam Et
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base space-y-3 pt-2">
            <div className="flex items-start gap-2">
              <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <span>
                <strong>{featureName}</strong> özelliğini kullanmak için kısa bir reklam izleyin.
              </span>
            </div>

            <div className="bg-primary/5 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium text-foreground">Neden reklam izliyorum?</p>
              <p className="text-sm text-muted-foreground">
                KolayFit'in tüm özelliklerini ücretsiz sunabilmek için reklamlardan gelir elde
                ediyoruz. Premium üyelikle tüm özelliklere reklamsız erişebilirsiniz.
              </p>
              {isTestMode && (
                <p className="text-xs text-amber-600 font-medium mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                  Test modu aktif: Google test reklamları gösterilecek
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col gap-2">
          {adFailed && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-2">
              <p className="text-sm text-amber-800 font-medium">
                Reklam şu anda kullanılamıyor. Premium üyelikle tüm özelliklere sınırsız erişin!
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 w-full">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isShowingAd}
              className="w-full sm:w-auto order-3 sm:order-1"
            >
              <X className="h-4 w-4 mr-2" />
              İptal
            </Button>

            {!adFailed && (
              <Button
                onClick={handleWatchAd}
                disabled={isShowingAd}
                className="w-full sm:flex-1 bg-primary hover:bg-primary/90 order-1 sm:order-2"
              >
                {isShowingAd ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reklam Gösteriliyor...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Reklamı İzle
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={handleUpgradeToPremium}
              disabled={isShowingAd}
              variant={adFailed ? 'default' : 'secondary'}
              className={`w-full sm:flex-1 order-2 sm:order-3 ${
                adFailed
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                  : ''
              }`}
            >
              <Crown className="h-4 w-4 mr-2" />
              Premium'a Geç
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
