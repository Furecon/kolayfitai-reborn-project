import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Play, Award, Sparkles, X } from 'lucide-react';
import { AdRewardService, FeatureType } from '@/services/AdRewardService';
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
  const { toast } = useToast();

  const handleWatchAd = async () => {
    setIsShowingAd(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      const adResult = await AdRewardService.recordAdWatch(featureType, true, {
        adNetwork: 'test',
        adPlacementId: `${featureType}_placement`,
        adDurationSeconds: 30,
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
        adNetwork: 'test',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      toast({
        title: 'Reklam Gösterilemedi',
        description: 'Lütfen tekrar deneyin veya Premium üyeliğe geçin.',
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setIsShowingAd(false);
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
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isShowingAd}
            className="w-full sm:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            İptal
          </Button>
          <Button
            onClick={handleWatchAd}
            disabled={isShowingAd}
            className="w-full sm:w-auto bg-primary hover:bg-primary/90"
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
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
