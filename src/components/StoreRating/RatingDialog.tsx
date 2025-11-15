import { useState, useEffect } from 'react';
import { useAuth } from '@/components/Auth/AuthProvider';
import { storeRatingService } from '@/services/StoreRatingService';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Star, Heart } from 'lucide-react';

export function RatingDialog() {
  const { user } = useAuth();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    checkAndShowRatingPrompt();
  }, [user]);

  const checkAndShowRatingPrompt = async () => {
    if (!user) return;

    try {
      const shouldShow = await storeRatingService.shouldShowRatingPrompt(user.id);
      if (shouldShow) {
        setTimeout(() => {
          setShowDialog(true);
        }, 2000);
      }
    } catch (error) {
      console.error('Error checking rating prompt:', error);
    }
  };

  const handleRate = async () => {
    if (!user) return;

    try {
      await storeRatingService.requestRating(user.id);
      setShowDialog(false);
    } catch (error) {
      console.error('Error handling rating:', error);
    }
  };

  const handleLater = () => {
    setShowDialog(false);
  };

  const handleDismiss = async () => {
    if (!user) return;

    try {
      await storeRatingService.dismissRatingPrompt(user.id);
      setShowDialog(false);
    } catch (error) {
      console.error('Error dismissing rating prompt:', error);
    }
  };

  return (
    <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-orange-100 to-red-100 p-4 rounded-full">
              <Heart className="h-10 w-10 text-orange-500 fill-orange-500" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            KolayFit'i Beğeniyor musunuz?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center space-y-3">
            <p>
              Uygulamayı kullanırken keyif aldıysanız, bize birkaç dakikanızı ayırıp
              mağazada değerlendirme yapabilir misiniz?
            </p>
            <p className="text-sm text-muted-foreground">
              Geri bildiriminiz, uygulamayı geliştirmemize ve daha fazla kişiye ulaşmamıza yardımcı oluyor.
            </p>
            <div className="flex justify-center gap-1 pt-2">
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          <AlertDialogAction
            onClick={handleRate}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            <Star className="h-4 w-4 mr-2" />
            Değerlendir
          </AlertDialogAction>
          <div className="flex gap-2 w-full">
            <AlertDialogCancel
              onClick={handleLater}
              className="flex-1"
            >
              Daha Sonra
            </AlertDialogCancel>
            <AlertDialogCancel
              onClick={handleDismiss}
              className="flex-1"
            >
              Hayır, Teşekkürler
            </AlertDialogCancel>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
