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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';

interface HealthDisclaimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
  onDecline: () => void;
}

export function HealthDisclaimerDialog({
  open,
  onOpenChange,
  onAccept,
  onDecline,
}: HealthDisclaimerDialogProps) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    if (accepted) {
      onAccept();
      onOpenChange(false);
    }
  };

  const handleDecline = () => {
    setAccepted(false);
    onDecline();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <AlertCircle className="h-6 w-6 text-amber-500" />
            Sağlık Uyarısı
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base space-y-4 pt-2">
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-foreground font-medium mb-2">
                Lütfen dikkatle okuyun:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• Uygulama tarafından oluşturulan diyet planları <strong>öneri amaçlıdır</strong> ve kişisel sağlık değerlendirmesi yerine geçmez.</li>
                <li>• Özel beslenme ihtiyaçlarınız, alerjileriniz veya kronik rahatsızlıklarınız varsa, bir <strong>sağlık uzmanına danışmanız</strong> önerilir.</li>
                <li>• Bu diyet planlarını uygulamadan önce sağlık durumunuzu değerlendirmek için mutlaka bir diyetisyen veya doktor ile görüşün.</li>
                <li>• Herhangi bir sağlık sorunu yaşarsanız planı durdurun ve bir uzmana başvurun.</li>
              </ul>
            </div>

            <div className="flex items-start space-x-2 pt-2">
              <Checkbox
                id="disclaimer"
                checked={accepted}
                onCheckedChange={(checked) => setAccepted(checked === true)}
              />
              <Label
                htmlFor="disclaimer"
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                Bu planın öneri amaçlı olduğunu ve kişisel sağlık değerlendirmesi yerine geçmediğini anlıyorum ve kabul ediyorum.
              </Label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleDecline}
            className="w-full sm:w-auto"
          >
            İptal
          </Button>
          <Button
            onClick={handleAccept}
            disabled={!accepted}
            className="w-full sm:w-auto"
          >
            Anladım ve Kabul Ediyorum
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
