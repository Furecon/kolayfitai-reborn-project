import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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
import { DietPlan, DietProfile, DietDay, DietMeal, MEAL_TYPE_LABELS, DAY_NAMES } from '@/types/diet';
import { ChevronDown, RefreshCw, Settings, Flame, Beef, Wheat, Droplet, Calendar, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MealCard } from './MealCard';

interface DietPlanViewProps {
  plan: DietPlan;
  dietProfile: DietProfile | null;
  onRegeneratePlan: () => void;
  onEditProfile: () => void;
  onPlanUpdated: (plan: DietPlan) => void;
}

export function DietPlanView({
  plan,
  dietProfile,
  onRegeneratePlan,
  onEditProfile,
  onPlanUpdated,
}: DietPlanViewProps) {
  const [selectedDay, setSelectedDay] = useState(() => {
    const today = new Date().getDay();
    const mondayBasedDay = today === 0 ? 6 : today - 1;
    return mondayBasedDay;
  });
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showTips, setShowTips] = useState(!dietProfile?.hide_diet_tips);
  const { toast } = useToast();

  const planData = plan.plan_data;
  const currentDay = planData.days[selectedDay];

  const handleHideTips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('diet_profiles')
        .update({ hide_diet_tips: true })
        .eq('user_id', user.id);

      setShowTips(false);
    } catch (error) {
      console.error('Error hiding tips:', error);
    }
  };

  const handleReplaceMeal = async (meal: DietMeal) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      if (!dietProfile) {
        throw new Error('Diet profile required');
      }

      toast({
        title: 'Alternatif Aranıyor',
        description: 'Sana uygun yeni bir öğün hazırlanıyor...',
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/replace-meal`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dietProfile,
            currentMeal: meal,
            planId: plan.id,
            dayIndex: selectedDay + 1,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Öğün değiştirilemedi');
      }

      const updatedPlanData = { ...planData };
      updatedPlanData.days[selectedDay] = result.updatedDay;

      onPlanUpdated({
        ...plan,
        plan_data: updatedPlanData,
      });

      toast({
        title: 'Başarılı!',
        description: 'Öğün değiştirildi.',
      });
    } catch (error: any) {
      console.error('Error replacing meal:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Öğün değiştirilirken hata oluştu',
        variant: 'destructive',
      });
    }
  };

  if (!currentDay) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Plan yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">Diyet Planım</h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={onEditProfile}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowRegenerateDialog(true)}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showTips && (
            <Card className="mb-3 bg-primary/5 border-primary/20">
              <CardContent className="p-3 flex items-start gap-2">
                <div className="flex-1 text-sm">
                  <p className="font-medium mb-1">💡 İpucu</p>
                  <p className="text-xs text-muted-foreground">
                    Beğenmediğin öğünleri "Değiştir" ile farklı alternatiflerle değiştirebilirsin.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleHideTips}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          <Tabs value={selectedDay.toString()} onValueChange={(v) => setSelectedDay(parseInt(v))}>
            <TabsList className="grid grid-cols-7 w-full h-auto p-1">
              {DAY_NAMES.map((day, index) => (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  className="text-xs py-2 px-1"
                >
                  {day.slice(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{currentDay.dayName}</CardTitle>
                <CardDescription>
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Gün {selectedDay + 1}/7
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {currentDay.totalCalories}
                </div>
                <div className="text-xs text-muted-foreground">kalori</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-muted rounded-lg p-2">
                <Beef className="h-4 w-4 mx-auto mb-1 text-red-500" />
                <div className="text-xs font-medium">
                  {currentDay.meals.reduce((sum, m) => sum + m.protein, 0)}g
                </div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
              <div className="bg-muted rounded-lg p-2">
                <Wheat className="h-4 w-4 mx-auto mb-1 text-amber-500" />
                <div className="text-xs font-medium">
                  {currentDay.meals.reduce((sum, m) => sum + m.carbs, 0)}g
                </div>
                <div className="text-xs text-muted-foreground">Karb.</div>
              </div>
              <div className="bg-muted rounded-lg p-2">
                <Droplet className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                <div className="text-xs font-medium">
                  {currentDay.meals.reduce((sum, m) => sum + m.fat, 0)}g
                </div>
                <div className="text-xs text-muted-foreground">Yağ</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          {currentDay.meals.map((meal, index) => (
            <MealCard
              key={index}
              meal={meal}
              onReplace={() => handleReplaceMeal(meal)}
            />
          ))}
        </div>

        {currentDay.notes && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground italic">
                {currentDay.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Yeni Plan Oluştur?</AlertDialogTitle>
            <AlertDialogDescription>
              Mevcut 7 günlük planın silinecek ve yeni bir plan oluşturulacak. Emin misin?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={onRegeneratePlan}>
              Evet, Yeni Plan Oluştur
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
