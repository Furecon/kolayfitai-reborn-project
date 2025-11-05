import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/Auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { purchaseService } from '@/services/PurchaseService';
import { Sparkles } from 'lucide-react';

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
          title: 'İşlem İptal Edildi',
          description: 'Satın alma işlemi iptal edildi veya tamamlanamadı.',
        });
      }
    } catch (error: any) {
      console.error('Paywall error:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'destructive'
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
        <>
          <Sparkles className="h-4 w-4 mr-2" />
          {children || "Premium'a Geç"}
        </>
      )}
    </Button>
  );
}
