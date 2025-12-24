import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Camera, FileText, UtensilsCrossed, Crown, Sparkles } from 'lucide-react';
import { AdRewardService } from '@/services/AdRewardService';
import { Button } from '@/components/ui/button';

interface UsageStats {
  photoAnalysisCount: number;
  detailedAnalysisCount: number;
  dietPlanCount: number;
  isPremium: boolean;
}

export const AdUsageCard = () => {
  const [stats, setStats] = useState<UsageStats>({
    photoAnalysisCount: 0,
    detailedAnalysisCount: 0,
    dietPlanCount: 0,
    isPremium: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    try {
      const [daily, weekly, isPremium] = await Promise.all([
        AdRewardService.getDailyUsage(),
        AdRewardService.getWeeklyUsage(),
        AdRewardService.isPremiumUser(),
      ]);

      setStats({
        photoAnalysisCount: daily.photoAnalysisCount,
        detailedAnalysisCount: daily.detailedAnalysisCount,
        dietPlanCount: weekly.dietPlanCount,
        isPremium,
      });
    } catch (error) {
      console.error('Error loading usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Kullanım Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (stats.isPremium) {
    return (
      <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-primary" />
            Premium Üyelik
          </CardTitle>
          <CardDescription>Tüm özelliklere sınırsız erişim</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Reklamsız deneyim aktif</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const photoAnalysisLimit = 3;
  const dietPlanLimit = 1;
  const photoAnalysisRemaining = photoAnalysisLimit - stats.photoAnalysisCount;
  const dietPlanRemaining = dietPlanLimit - stats.dietPlanCount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Günlük Kullanım Durumu
        </CardTitle>
        <CardDescription>Reklam izleyerek özellikleri kullanabilirsiniz</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Fotoğraf Analizi</span>
            </div>
            <Badge variant={photoAnalysisRemaining > 0 ? 'default' : 'destructive'}>
              {photoAnalysisRemaining > 0
                ? `${photoAnalysisRemaining} kalan`
                : 'Limit doldu'}
            </Badge>
          </div>
          <Progress
            value={(stats.photoAnalysisCount / photoAnalysisLimit) * 100}
            className="h-2"
          />
          <p className="text-xs text-muted-foreground">
            {stats.photoAnalysisCount} / {photoAnalysisLimit} kullanıldı (Günlük)
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Detaylı Analiz</span>
            </div>
            <Badge variant="secondary">Sınırsız</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Her analiz için 1 reklam izleyin (Bugün {stats.detailedAnalysisCount} kez kullanıldı)
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Diyet Planı</span>
            </div>
            <Badge variant={dietPlanRemaining > 0 ? 'default' : 'destructive'}>
              {dietPlanRemaining > 0
                ? `${dietPlanRemaining} kalan`
                : 'Limit doldu'}
            </Badge>
          </div>
          <Progress value={(stats.dietPlanCount / dietPlanLimit) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {stats.dietPlanCount} / {dietPlanLimit} kullanıldı (Haftalık)
          </p>
        </div>

        <div className="pt-2 border-t">
          <Button variant="outline" size="sm" className="w-full" onClick={loadUsageStats}>
            Yenile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
