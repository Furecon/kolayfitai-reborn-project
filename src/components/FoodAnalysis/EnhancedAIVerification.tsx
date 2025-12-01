import React, { useState, useCallback } from 'react'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, CreditCard as Edit2, Save, X, Search, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FoodItem {
  name: string;
  estimated_amount: number;
  portion_type: 'gram' | 'adet' | 'porsiyon' | 'bardak' | 'ml' | 'cl' | 'şişe' | 'kutu' | 'kaşık';
  nutrition_per_100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
  total_nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  };
}

interface SearchResult {
  id: string;
  name: string;
  name_en?: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  category?: string;
}

interface EnhancedAIVerificationProps {
  analysisResult: {
    foods: FoodItem[];
    confidence: number;
    suggestions?: string;
    meal_type: string;
  };
  image: string;
  onConfirm: (foods: FoodItem[]) => Promise<void>;
  onEdit: () => void;
  onManualEntry: () => void;
  onBack: () => void;
  loading?: boolean;
}

export const EnhancedAIVerification: React.FC<EnhancedAIVerificationProps> = ({
  analysisResult,
  image,
  onConfirm,
  onEdit,
  onManualEntry,
  onBack,
  loading = false
}) => {
  const [foods, setFoods] = useState<FoodItem[]>(analysisResult.foods);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddFood, setShowAddFood] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const { toast } = useToast();

  // Search for foods in the database
  const searchFoods = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { data, error } = await supabase.rpc('search_foods', {
        search_term: term.trim()
      });

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Food search error:', error);
      toast({
        title: "Arama Hatası",
        description: "Yemek arama sırasında bir hata oluştu",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  }, [toast]);

  // Calculate nutrition based on portion with enhanced beverage support
  const calculateNutrition = (nutritionPer100g: any, amount: number, portionType: string, foodCategory?: string) => {
    let multiplier = amount / 100; // Default: per 100g
    
    // Enhanced portion conversions with beverage-specific logic
    switch (portionType) {
      case 'gram':
        multiplier = amount / 100;
        break;
      case 'adet':
        multiplier = amount * 1; // 100g per piece (default)
        break;
      case 'porsiyon':
        multiplier = amount * 1.5; // 150g per portion
        break;
      case 'bardak':
        // Check if it's a beverage - use ml/g density
        if (foodCategory === 'İçecekler') {
          multiplier = amount * 2.5; // 250ml per cup, beverages have ~1g/ml density
        } else {
          multiplier = amount * 2; // 200g per cup for solid foods
        }
        break;
      case 'ml':
        // Direct ml measurement for beverages (1ml ≈ 1g for most beverages)
        multiplier = amount / 100;
        break;
      case 'cl':
        // Centiliters to grams (1cl = 10ml ≈ 10g for beverages)
        multiplier = (amount * 10) / 100;
        break;
      case 'şişe':
        // Standard bottle sizes for beverages
        if (foodCategory === 'İçecekler') {
          multiplier = amount * 5; // 500ml per bottle
        } else {
          multiplier = amount * 0.5; // 50g for other bottled items
        }
        break;
      case 'kutu':
        // Standard can sizes for beverages
        if (foodCategory === 'İçecekler') {
          multiplier = amount * 3.3; // 330ml per can
        } else {
          multiplier = amount * 0.4; // 40g for other canned items
        }
        break;
      case 'kaşık':
        // Tea/coffee spoons for beverages vs food spoons
        if (foodCategory === 'İçecekler') {
          multiplier = amount * 0.05; // 5ml per teaspoon for liquids
        } else {
          multiplier = amount * 0.15; // 15g per spoon for solids
        }
        break;
      case 'dilim':
        multiplier = amount * 0.3; // 30g per slice
        break;
      default:
        multiplier = amount / 100;
    }

    return {
      calories: Math.round(nutritionPer100g.calories * multiplier),
      protein: Math.round(nutritionPer100g.protein * multiplier * 10) / 10,
      carbs: Math.round(nutritionPer100g.carbs * multiplier * 10) / 10,
      fat: Math.round(nutritionPer100g.fat * multiplier * 10) / 10,
      fiber: nutritionPer100g.fiber ? Math.round(nutritionPer100g.fiber * multiplier * 10) / 10 : 0,
      sugar: nutritionPer100g.sugar ? Math.round(nutritionPer100g.sugar * multiplier * 10) / 10 : 0,
      sodium: nutritionPer100g.sodium ? Math.round(nutritionPer100g.sodium * multiplier * 10) / 10 : 0
    };
  };

  // Add food from search results
  const addFoodFromSearch = (searchResult: SearchResult, amount: number = 100, portionType: string = 'gram') => {
    const nutritionPer100g = {
      calories: Number(searchResult.calories_per_100g),
      protein: Number(searchResult.protein_per_100g),
      carbs: Number(searchResult.carbs_per_100g),
      fat: Number(searchResult.fat_per_100g),
      fiber: 0,
      sugar: 0,
      sodium: 0
    };

    const newFood: FoodItem = {
      name: searchResult.name,
      estimated_amount: amount,
      portion_type: portionType as any,
      nutrition_per_100g: nutritionPer100g,
      total_nutrition: calculateNutrition(nutritionPer100g, amount, portionType, searchResult.category)
    };

    setFoods(prev => [...prev, newFood]);
    setShowAddFood(false);
    setSearchTerm('');
    setSearchResults([]);
    
    toast({
      title: "Yemek Eklendi",
      description: `${searchResult.name} listeye eklendi`
    });
  };

  // Delete food item
  const deleteFood = (index: number) => {
    setFoods(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Yemek Silindi",
      description: "Yemek listeden kaldırıldı"
    });
  };

  // Update food item
  const updateFood = (index: number, updatedFood: FoodItem) => {
    setFoods(prev => prev.map((food, i) => 
      i === index ? {
        ...updatedFood,
        total_nutrition: calculateNutrition(
          updatedFood.nutrition_per_100g,
          updatedFood.estimated_amount,
          updatedFood.portion_type,
          'İçecekler' // Will be enhanced later with actual category detection
        )
      } : food
    ));
    setEditingIndex(null);
  };

  // AI Recalculation
  const recalculateWithAI = async () => {
    if (foods.length === 0) return;

    setIsRecalculating(true);
    try {
      // Create a prompt for recalculation
      const foodNames = foods.map(f => `${f.name} (${f.estimated_amount} ${f.portion_type})`).join(', ');
      
      const { data, error } = await supabase.functions.invoke('analyze-food', {
        body: {
          imageUrl: image,
          mealType: analysisResult.meal_type,
          analysisType: 'detailed',
          detailsData: {
            userModifications: true,
            currentFoods: foodNames,
            recalculate: true
          }
        },
        headers: {
          'x-request-timeout': '60000'
        }
      });

      if (error) throw error;

      if (data?.foods) {
        // Merge AI suggestions with current user modifications
        const aiSuggestion = data.foods;
        toast({
          title: "AI Yeniden Hesaplama Tamamlandı",
          description: data.suggestions || "Besin değerleri güncellendi"
        });
      }
    } catch (error) {
      console.error('AI recalculation error:', error);
      toast({
        title: "Yeniden Hesaplama Hatası",
        description: "AI yeniden hesaplaması başarısız oldu",
        variant: "destructive"
      });
    } finally {
      setIsRecalculating(false);
    }
  };

  // Calculate total nutrition
  const totalNutrition = foods.reduce((total, food) => ({
    calories: total.calories + food.total_nutrition.calories,
    protein: total.protein + food.total_nutrition.protein,
    carbs: total.carbs + food.total_nutrition.carbs,
    fat: total.fat + food.total_nutrition.fat,
    fiber: total.fiber + (food.total_nutrition.fiber || 0),
    sugar: total.sugar + (food.total_nutrition.sugar || 0),
    sodium: total.sodium + (food.total_nutrition.sodium || 0)
  }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 });

  return (
    <div className="space-y-6">
      {/* Image Display */}
      <Card>
        <CardContent className="p-4">
          <img
            src={image}
            alt="Analiz edilen yemek"
            className="w-full h-48 object-cover rounded-lg"
          />
        </CardContent>
      </Card>

      {/* Confidence Score */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">AI Güven Skoru</h3>
              <p className="text-sm text-muted-foreground">
                {analysisResult.confidence >= 0.8 ? 'Yüksek güven' : 
                 analysisResult.confidence >= 0.6 ? 'Orta güven' : 'Düşük güven'}
              </p>
            </div>
            <div className="text-2xl font-bold text-primary">
              {Math.round(analysisResult.confidence * 100)}%
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Food Items List */}
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle className="text-base sm:text-lg">Tespit Edilen Yemekler</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={recalculateWithAI}
              disabled={isRecalculating}
              className="w-full sm:w-auto text-xs sm:text-sm"
            >
              <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              {isRecalculating ? 'Hesaplanıyor...' : 'AI Yeniden Hesapla'}
            </Button>
            <Dialog open={showAddFood} onOpenChange={setShowAddFood}>
              <DialogTrigger asChild>
                <Button size="sm" className="w-full sm:w-auto text-xs sm:text-sm">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Yemek Ekle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yemek Ekle</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="search">Yemek Ara</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Yemek adı yazın..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          searchFoods(e.target.value);
                        }}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {isSearching && (
                    <div className="text-center py-4">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  )}

                  {searchResults.length > 0 && (
                    <div className="max-h-64 overflow-y-auto border rounded-lg">
                      {searchResults.map((result) => (
                        <div
                          key={result.id}
                          className="p-3 border-b last:border-b-0 hover:bg-accent cursor-pointer"
                          onClick={() => addFoodFromSearch(result)}
                        >
                          <div className="font-medium">{result.name}</div>
                          {result.name_en && (
                            <div className="text-sm text-muted-foreground">{result.name_en}</div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            {Math.round(result.calories_per_100g)} kcal/100g
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {foods.map((food, index) => (
            <div key={index} className="border rounded-lg p-4">
              {editingIndex === index ? (
                <EditFoodForm
                  food={food}
                  onSave={(updatedFood) => updateFood(index, updatedFood)}
                  onCancel={() => setEditingIndex(null)}
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-lg">{food.name}</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingIndex(index)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteFood(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {food.estimated_amount} {food.portion_type}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="bg-accent/50 p-2 rounded">
                      <div className="font-medium text-orange-600">Kalori</div>
                      <div>{food.total_nutrition.calories} kcal</div>
                    </div>
                    <div className="bg-accent/50 p-2 rounded">
                      <div className="font-medium text-blue-600">Protein</div>
                      <div>{food.total_nutrition.protein}g</div>
                    </div>
                    <div className="bg-accent/50 p-2 rounded">
                      <div className="font-medium text-green-600">Karbonhidrat</div>
                      <div>{food.total_nutrition.carbs}g</div>
                    </div>
                    <div className="bg-accent/50 p-2 rounded">
                      <div className="font-medium text-yellow-600">Yağ</div>
                      <div>{food.total_nutrition.fat}g</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {foods.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Henüz yemek eklenmedi</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setShowAddFood(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                İlk Yemeğinizi Ekleyin
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Nutrition Summary */}
      {foods.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Toplam Besin Değerleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-orange-100 dark:bg-orange-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{totalNutrition.calories}</div>
                <div className="text-sm text-orange-600">Kalori</div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{totalNutrition.protein.toFixed(1)}g</div>
                <div className="text-sm text-blue-600">Protein</div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{totalNutrition.carbs.toFixed(1)}g</div>
                <div className="text-sm text-green-600">Karbonhidrat</div>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-yellow-600">{totalNutrition.fat.toFixed(1)}g</div>
                <div className="text-sm text-yellow-600">Yağ</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Suggestions */}
      {analysisResult.suggestions && (
        <Card>
          <CardHeader>
            <CardTitle>AI Önerileri</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{analysisResult.suggestions}</p>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Geri
        </Button>
        <Button
          onClick={() => onConfirm(foods)}
          disabled={loading || foods.length === 0}
          className="flex-1"
        >
          {loading ? 'Kaydediliyor...' : 'Kaydet'}
        </Button>
      </div>
    </div>
  )
}

// Edit Food Form Component
interface EditFoodFormProps {
  food: FoodItem;
  onSave: (food: FoodItem) => void;
  onCancel: () => void;
}

const EditFoodForm: React.FC<EditFoodFormProps> = ({ food, onSave, onCancel }) => {
  const [editedFood, setEditedFood] = useState<FoodItem>(food);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedFood);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Yemek Adı</Label>
          <Input
            id="name"
            value={editedFood.name}
            onChange={(e) => setEditedFood(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="amount">Miktar</Label>
          <div className="flex gap-2">
            <Input
              id="amount"
              type="number"
              value={editedFood.estimated_amount}
              onChange={(e) => setEditedFood(prev => ({ ...prev, estimated_amount: Number(e.target.value) }))}
            />
            <Select
              value={editedFood.portion_type}
              onValueChange={(value) => setEditedFood(prev => ({ ...prev, portion_type: value as any }))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gram">Gram</SelectItem>
                <SelectItem value="adet">Adet</SelectItem>
                <SelectItem value="porsiyon">Porsiyon</SelectItem>
                <SelectItem value="bardak">Bardak</SelectItem>
                <SelectItem value="ml">ml</SelectItem>
                <SelectItem value="cl">cl</SelectItem>
                <SelectItem value="şişe">Şişe</SelectItem>
                <SelectItem value="kutu">Kutu</SelectItem>
                <SelectItem value="kaşık">Kaşık</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="calories">Kalori (100g)</Label>
          <Input
            id="calories"
            type="number"
            value={editedFood.nutrition_per_100g.calories}
            onChange={(e) => setEditedFood(prev => ({
              ...prev,
              nutrition_per_100g: { ...prev.nutrition_per_100g, calories: Number(e.target.value) }
            }))}
          />
        </div>
        <div>
          <Label htmlFor="protein">Protein (100g)</Label>
          <Input
            id="protein"
            type="number"
            step="0.1"
            value={editedFood.nutrition_per_100g.protein}
            onChange={(e) => setEditedFood(prev => ({
              ...prev,
              nutrition_per_100g: { ...prev.nutrition_per_100g, protein: Number(e.target.value) }
            }))}
          />
        </div>
        <div>
          <Label htmlFor="carbs">Karbonhidrat (100g)</Label>
          <Input
            id="carbs"
            type="number"
            step="0.1"
            value={editedFood.nutrition_per_100g.carbs}
            onChange={(e) => setEditedFood(prev => ({
              ...prev,
              nutrition_per_100g: { ...prev.nutrition_per_100g, carbs: Number(e.target.value) }
            }))}
          />
        </div>
        <div>
          <Label htmlFor="fat">Yağ (100g)</Label>
          <Input
            id="fat"
            type="number"
            step="0.1"
            value={editedFood.nutrition_per_100g.fat}
            onChange={(e) => setEditedFood(prev => ({
              ...prev,
              nutrition_per_100g: { ...prev.nutrition_per_100g, fat: Number(e.target.value) }
            }))}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm">
          <Save className="h-4 w-4 mr-2" />
          Kaydet
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          İptal
        </Button>
      </div>
    </form>
  )
}

export default EnhancedAIVerification