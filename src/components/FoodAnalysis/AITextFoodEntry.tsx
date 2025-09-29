import React, { useState } from 'react'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Clock, ChefHat, Plus, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FoodItem {
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  category: string;
}

interface AnalysisResult {
  recognizedName: string;
  foods: FoodItem[];
  confidence: number;
  suggestions: string[];
  notes: string;
}

interface AITextFoodEntryProps {
  mealType: string;
  onSave: (foods: FoodItem[]) => Promise<void>;
  onBack: () => void;
  loading: boolean;
}

export function AITextFoodEntry({ mealType, onSave, onBack, loading }: AITextFoodEntryProps) {
  const [foodInput, setFoodInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [confirmedFoods, setConfirmedFoods] = useState<FoodItem[]>([]);
  const { toast } = useToast();

  // Popular Turkish food suggestions
  const popularFoods = [
    'Döner', 'Pilav', 'Köfte', 'Lahmacun', 'Pide', 'Çorba',
    'Mantı', 'Kebap', 'Börek', 'Baklava', 'İmam Bayıldı'
  ];

  const recentFoods = [
    'Mercimek Çorbası', 'Kuru Fasulye', 'Tavuk Şiş'
  ];

  const analyzeFoodByName = async (foodName: string) => {
    if (!foodName.trim()) {
      toast({
        title: "Hata",
        description: "Lütfen bir yemek adı girin",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-food-by-name', {
        body: { foodName: foodName.trim(), mealType }
      });

      if (error) {
        console.error('Analysis error:', error);
        toast({
          title: "Analiz Hatası",
          description: "Yemek analizi yapılırken bir hata oluştu",
          variant: "destructive"
        });
        return;
      }

      if (data?.error) {
        toast({
          title: "Analiz Hatası", 
          description: data.error,
          variant: "destructive"
        });
        return;
      }

      setAnalysisResult(data);
      setFoodInput('');
    } catch (error) {
      console.error('Error analyzing food:', error);
      toast({
        title: "Hata",
        description: "Beklenmeyen bir hata oluştu",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnalyzing) {
      analyzeFoodByName(foodInput);
    }
  };

  const addToConfirmed = (food: FoodItem) => {
    setConfirmedFoods(prev => [...prev, food]);
    setAnalysisResult(null);
  };

  const updateConfirmedFood = (index: number, field: keyof FoodItem, value: number | string) => {
    setConfirmedFoods(prev => {
      const updated = [...prev];
      if (field === 'amount' && typeof value === 'number') {
        const ratio = value / updated[index].amount;
        updated[index] = {
          ...updated[index],
          amount: value,
          calories: Math.round(updated[index].calories * ratio),
          protein: Number((updated[index].protein * ratio).toFixed(1)),
          carbs: Number((updated[index].carbs * ratio).toFixed(1)),
          fat: Number((updated[index].fat * ratio).toFixed(1)),
          fiber: Number((updated[index].fiber * ratio).toFixed(1)),
          sugar: Number((updated[index].sugar * ratio).toFixed(1))
        };
      } else {
        (updated[index] as any)[field] = value;
      }
      return updated;
    });
  };

  const removeConfirmedFood = (index: number) => {
    setConfirmedFoods(prev => prev.filter((_, i) => i !== index));
  };

  const getTotalNutrition = () => {
    return confirmedFoods.reduce((total, food) => ({
      calories: total.calories + food.calories,
      protein: total.protein + food.protein,
      carbs: total.carbs + food.carbs,
      fat: total.fat + food.fat
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const handleSave = async () => {
    if (confirmedFoods.length === 0) {
      toast({
        title: "Uyarı",
        description: "Kaydetmek için en az bir yemek eklemelisiniz",
        variant: "destructive"
      });
      return;
    }

    await onSave(confirmedFoods);
  };

  const totalNutrition = getTotalNutrition();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-primary">
            <Sparkles className="h-6 w-6" />
            <h1 className="text-2xl font-bold">AI Yemek Girişi</h1>
          </div>
          <p className="text-muted-foreground">
            Yemek adını yazın, AI anında kalori hesaplasın
          </p>
          <Badge variant="secondary">{mealType}</Badge>
        </div>

        {/* Food Input */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-3">
              <Input
                value={foodInput}
                onChange={(e) => setFoodInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Örn: döner, pilav, mercimek çorbası..."
                disabled={isAnalyzing}
                className="flex-1"
              />
              <Button 
                onClick={() => analyzeFoodByName(foodInput)}
                disabled={isAnalyzing || !foodInput.trim()}
                className="px-6"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Quick suggestions */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <ChefHat className="h-4 w-4" />
                  Popüler Yemekler
                </h3>
                <div className="flex flex-wrap gap-2">
                  {popularFoods.map((food) => (
                    <Button
                      key={food}
                      variant="outline"
                      size="sm"
                      onClick={() => setFoodInput(food)}
                      disabled={isAnalyzing}
                      className="text-xs"
                    >
                      {food}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Son Girilen
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentFoods.map((food) => (
                    <Button
                      key={food}
                      variant="outline"
                      size="sm"
                      onClick={() => setFoodInput(food)}
                      disabled={isAnalyzing}
                      className="text-xs"
                    >
                      {food}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Result */}
        {analysisResult && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Analiz Sonucu</CardTitle>
                <Badge variant={analysisResult.confidence > 80 ? "default" : "secondary"}>
                  %{analysisResult.confidence} güven
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-primary mb-2">
                  {analysisResult.recognizedName}
                </h3>
                {analysisResult.notes && (
                  <p className="text-sm text-muted-foreground mb-3">{analysisResult.notes}</p>
                )}
              </div>

              {analysisResult.foods.map((food, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{food.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {food.amount} {food.unit} • {food.category}
                      </p>
                    </div>
                    <Button 
                      onClick={() => addToConfirmed(food)}
                      size="sm"
                      className="gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Ekle
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-primary">{food.calories}</p>
                      <p className="text-xs text-muted-foreground">Kalori</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{food.protein}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{food.carbs}g</p>
                      <p className="text-xs text-muted-foreground">Karb.</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{food.fat}g</p>
                      <p className="text-xs text-muted-foreground">Yağ</p>
                    </div>
                  </div>
                </div>
              ))}

              {analysisResult.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Benzer Yemekler:</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => setFoodInput(suggestion)}
                        className="text-xs"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Confirmed Foods */}
        {confirmedFoods.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Eklenen Yemekler ({confirmedFoods.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {confirmedFoods.map((food, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{food.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateConfirmedFood(index, 'amount', Math.max(1, food.amount - 10))}
                          className="h-6 w-6 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm min-w-[80px] text-center">
                          {food.amount} {food.unit}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateConfirmedFood(index, 'amount', food.amount + 10)}
                          className="h-6 w-6 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <Button 
                      variant="ghost"
                      size="sm"
                      onClick={() => removeConfirmedFood(index)}
                      className="text-destructive"
                    >
                      Kaldır
                    </Button>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-center">
                    <div>
                      <p className="text-lg font-bold text-primary">{food.calories}</p>
                      <p className="text-xs text-muted-foreground">Kalori</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{food.protein}g</p>
                      <p className="text-xs text-muted-foreground">Protein</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{food.carbs}g</p>
                      <p className="text-xs text-muted-foreground">Karb.</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold">{food.fat}g</p>
                      <p className="text-xs text-muted-foreground">Yağ</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Total Nutrition */}
              <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                <h4 className="font-medium text-primary mb-3">Toplam Besin Değeri</h4>
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-xl font-bold text-primary">{totalNutrition.calories}</p>
                    <p className="text-sm text-muted-foreground">Kalori</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{totalNutrition.protein.toFixed(1)}g</p>
                    <p className="text-sm text-muted-foreground">Protein</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{totalNutrition.carbs.toFixed(1)}g</p>
                    <p className="text-sm text-muted-foreground">Karbonhidrat</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{totalNutrition.fat.toFixed(1)}g</p>
                    <p className="text-sm text-muted-foreground">Yağ</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            Geri
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || confirmedFoods.length === 0}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Kaydet ({confirmedFoods.length} yemek)
          </Button>
        </div>
      </div>
    </div>
  )
}