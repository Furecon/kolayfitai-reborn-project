import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { purchaseService } from '@/services/PurchaseService';

interface PaywallButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  onSuccess?: () => void;
}

export function PaywallButton({
  variant = 'default',
  size = 'default',
  className,
  children,
  onSuccess
}: PaywallButtonProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleShowPaywall = async () => {
    if (!user) {
      toast({
        title: 'Giriş Gerekli',
        description: 'Premium özelliklere erişmek için lütfen giriş yapın.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await purchaseService.purchaseWithPaywall(user.id);

      if (success) {
        toast({
          title: 'Başarılı!',
          description: 'Premium aboneliğiniz aktif edildi.',
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: 'İşlem Tamamlanamadı',
          description: 'Satın alma işlemi iptal edildi veya tamamlanamadı. Lütfen tekrar deneyin.',
        });
      }
    } catch (error: any) {
      console.error('Paywall error:', error);

      // More detailed error message
      let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';

      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast({
        title: 'Hata',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleShowPaywall}
      disabled={isLoading}
    >
      {isLoading ? (
        'Yükleniyor...'
      ) : (
        children || "Premium'a Geç"
      )}
    </Button>
  );
}
