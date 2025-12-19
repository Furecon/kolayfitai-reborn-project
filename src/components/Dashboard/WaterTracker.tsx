import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Droplet, Plus, Minus } from 'lucide-react';
import { useTutorialTarget } from '@/hooks/useTutorialTarget';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface WaterTrackerProps {
  userWeight?: number;
}

interface WaterIntake {
  id: string;
  manual_intake_ml: number;
  food_intake_ml: number;
  daily_goal_ml: number;
  date: string;
}

const GLASS_SIZE_ML = 250; // Standard glass size

export function WaterTracker({ userWeight = 70 }: WaterTrackerProps) {
  const [waterData, setWaterData] = useState<WaterIntake | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const waterWidgetRef = useTutorialTarget('WaterWidget');
  const addWaterButtonRef = useTutorialTarget('AddWaterButton');

  // Calculate daily water goal based on weight (27.5 ml/kg average)
  const dailyGoalMl = Math.round((userWeight * 27.5) / 250) * 250; // Round to nearest 250ml

  useEffect(() => {
    loadTodayWaterIntake();
  }, []);

  const loadTodayWaterIntake = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setWaterData(data);
      } else {
        // Create today's entry
        const { data: newData, error: insertError } = await supabase
          .from('water_intake')
          .insert({
            user_id: user.id,
            date: today,
            manual_intake_ml: 0,
            food_intake_ml: 0,
            daily_goal_ml: dailyGoalMl,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setWaterData(newData);
      }
    } catch (error) {
      console.error('Error loading water intake:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateWaterIntake = async (amount: number) => {
    if (!waterData) return;

    try {
      const newManualIntake = Math.max(0, waterData.manual_intake_ml + amount);

      const { data, error } = await supabase
        .from('water_intake')
        .update({ manual_intake_ml: newManualIntake })
        .eq('id', waterData.id)
        .select()
        .single();

      if (error) throw error;

      setWaterData(data);

      if (amount > 0) {
        toast({
          title: 'Su eklendi',
          description: `${amount}ml su takibe eklendi`,
        });
      }
    } catch (error) {
      console.error('Error updating water intake:', error);
      toast({
        title: 'Hata',
        description: 'Su takibi güncellenemedi',
        variant: 'destructive',
      });
    }
  };

  const totalIntakeMl = waterData
    ? waterData.manual_intake_ml + waterData.food_intake_ml
    : 0;

  const totalIntakeLiters = (totalIntakeMl / 1000).toFixed(2);
  const goalLiters = (dailyGoalMl / 1000).toFixed(2);
  const percentComplete = Math.min(100, (totalIntakeMl / dailyGoalMl) * 100);

  // Calculate number of glasses (visual representation)
  const totalGlasses = Math.ceil(dailyGoalMl / GLASS_SIZE_ML);
  const filledGlasses = Math.floor(totalIntakeMl / GLASS_SIZE_ML);
  const partialGlassFill = (totalIntakeMl % GLASS_SIZE_ML) / GLASS_SIZE_ML;

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-blue-500" />
            Su Takibi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">Yükleniyor...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card ref={waterWidgetRef as any} className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-800 dark:to-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-blue-500" />
          Su Takibi
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Water Goal and Current Intake */}
        <div className="text-center space-y-1">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Hedef: {goalLiters} Litre
          </div>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {totalIntakeLiters}L
          </div>
          <div className="text-xs text-gray-500">
            {waterData && waterData.food_intake_ml > 0 && (
              <span>+ Yemeklerden: {waterData.food_intake_ml}ml</span>
            )}
          </div>
        </div>

        {/* Glass Visualization */}
        <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-4">
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: totalGlasses }).map((_, index) => {
              let fillPercentage = 0;
              if (index < filledGlasses) {
                fillPercentage = 100;
              } else if (index === filledGlasses && partialGlassFill > 0) {
                fillPercentage = partialGlassFill * 100;
              }

              return (
                <div
                  key={index}
                  className="relative w-full aspect-[3/4] rounded-lg border-2 border-blue-300 dark:border-blue-700 overflow-hidden bg-white/30 dark:bg-gray-900/30"
                >
                  <div
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-400 to-blue-300 dark:from-blue-600 dark:to-blue-500 transition-all duration-300"
                    style={{ height: `${fillPercentage}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <div className="text-xs text-center text-gray-600 dark:text-gray-400">
            %{percentComplete.toFixed(0)} tamamlandı
          </div>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateWaterIntake(-GLASS_SIZE_ML)}
            disabled={totalIntakeMl === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button ref={addWaterButtonRef as any} size="sm" className="bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4 mr-1" />
                Su Ekle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Su Ekle</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3 py-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-1"
                  onClick={() => {
                    updateWaterIntake(200);
                    setIsDialogOpen(false);
                  }}
                >
                  <Droplet className="h-6 w-6" />
                  <span>200ml</span>
                  <span className="text-xs text-gray-500">Küçük bardak</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-1"
                  onClick={() => {
                    updateWaterIntake(250);
                    setIsDialogOpen(false);
                  }}
                >
                  <Droplet className="h-6 w-6" />
                  <span>250ml</span>
                  <span className="text-xs text-gray-500">Standart bardak</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-1"
                  onClick={() => {
                    updateWaterIntake(330);
                    setIsDialogOpen(false);
                  }}
                >
                  <Droplet className="h-6 w-6" />
                  <span>330ml</span>
                  <span className="text-xs text-gray-500">Kutu</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-1"
                  onClick={() => {
                    updateWaterIntake(500);
                    setIsDialogOpen(false);
                  }}
                >
                  <Droplet className="h-6 w-6" />
                  <span>500ml</span>
                  <span className="text-xs text-gray-500">Şişe</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-1"
                  onClick={() => {
                    updateWaterIntake(750);
                    setIsDialogOpen(false);
                  }}
                >
                  <Droplet className="h-6 w-6" />
                  <span>750ml</span>
                  <span className="text-xs text-gray-500">Büyük şişe</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col gap-1"
                  onClick={() => {
                    updateWaterIntake(1000);
                    setIsDialogOpen(false);
                  }}
                >
                  <Droplet className="h-6 w-6" />
                  <span>1000ml</span>
                  <span className="text-xs text-gray-500">1 Litre</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            size="sm"
            variant="outline"
            onClick={() => updateWaterIntake(GLASS_SIZE_ML)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
