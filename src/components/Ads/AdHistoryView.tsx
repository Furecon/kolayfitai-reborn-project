import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Camera, FileText, UtensilsCrossed, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { AdRewardService } from '@/services/AdRewardService';
import { Button } from '@/components/ui/button';

interface AdHistoryItem {
  id: string;
  ad_type: 'photo_analysis' | 'detailed_analysis' | 'diet_plan';
  feature_unlocked: string;
  completed: boolean;
  reward_granted: boolean;
  watched_at: string;
  ad_network?: string;
  ad_duration_seconds?: number;
  error_message?: string;
}

export const AdHistoryView = () => {
  const [history, setHistory] = useState<AdHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await AdRewardService.getAdHistory(20);
      setHistory(data as AdHistoryItem[]);
    } catch (error) {
      console.error('Error loading ad history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'photo_analysis':
        return <Camera className="h-4 w-4" />;
      case 'detailed_analysis':
        return <FileText className="h-4 w-4" />;
      case 'diet_plan':
        return <UtensilsCrossed className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getFeatureName = (type: string) => {
    switch (type) {
      case 'photo_analysis':
        return 'Fotoğraf Analizi';
      case 'detailed_analysis':
        return 'Detaylı Analiz';
      case 'diet_plan':
        return 'Diyet Planı';
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} dakika önce`;
    } else if (diffHours < 24) {
      return `${diffHours} saat önce`;
    } else if (diffDays < 7) {
      return `${diffDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reklam Geçmişi</CardTitle>
          <CardDescription>İzlediğiniz reklamlar ve kazandığınız ödüller</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reklam Geçmişi</CardTitle>
          <CardDescription>İzlediğiniz reklamlar ve kazandığınız ödüller</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Henüz reklam izlemediniz</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Reklam Geçmişi</CardTitle>
        <CardDescription>Son 20 reklam kaydı</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {item.reward_granted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      {getIcon(item.ad_type)}
                      <span>{getFeatureName(item.ad_type)}</span>
                    </div>
                    <Badge
                      variant={item.reward_granted ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {item.reward_granted ? 'Ödül Verildi' : 'Tamamlanmadı'}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>{formatDate(item.watched_at)}</p>
                    {item.ad_duration_seconds && (
                      <p>{item.ad_duration_seconds} saniye</p>
                    )}
                    {item.error_message && (
                      <p className="text-red-500">Hata: {item.error_message}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t mt-4">
          <Button variant="outline" size="sm" className="w-full" onClick={loadHistory}>
            Yenile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
