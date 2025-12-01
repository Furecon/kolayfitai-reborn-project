import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Utensils, Sparkles } from 'lucide-react';

interface EmptyDietStateProps {
  hasProfile: boolean;
  onCreateProfile: () => void;
  onGeneratePlan: () => void;
}

export function EmptyDietState({ hasProfile, onCreateProfile, onGeneratePlan }: EmptyDietStateProps) {
  return (
    <div className="flex items-center justify-center p-6 pb-24 h-full overflow-y-auto">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Utensils className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>Kişisel Diyet Planın Hazır!</CardTitle>
          <CardDescription className="text-base">
            Diyet profilini doldurarak sana özel 7 günlük AI destekli yemek planı oluşturabilirsin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!hasProfile ? (
            <>
              <Button
                onClick={onCreateProfile}
                className="w-full"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Diyet Profilimi Oluştur
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Yaş, hedef, diyet türü gibi bilgilerle planını kişiselleştir
              </p>
            </>
          ) : (
            <>
              <Button
                onClick={onGeneratePlan}
                className="w-full"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                7 Günlük Plan Oluştur
              </Button>
              <Button
                variant="outline"
                onClick={onCreateProfile}
                className="w-full"
              >
                Profili Düzenle
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Profilin hazır! Hemen yeni bir diyet planı oluşturabilirsin.
              </p>
            </>
          )}

          <div className="bg-muted p-4 rounded-lg mt-4">
            <h4 className="font-medium text-sm mb-2">Neler Sağlar?</h4>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>✓ Kişisel hedeflere göre kalori hesaplama</li>
              <li>✓ Alerjilerine uygun öneriler</li>
              <li>✓ Çeşitli ve lezzetli yemekler</li>
              <li>✓ Detaylı tarifler</li>
              <li>✓ Beğenmediklerini değiştirme</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
