import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, ChefHat, Sparkles, Heart } from 'lucide-react'
import { mockMealSuggestions } from './MockData'

export function ScreenshotMealSuggestions() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
        <ArrowLeft className="h-6 w-6" />
        <h1 className="text-xl font-semibold">AI Öğün Önerileri</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* AI Suggestion Header */}
        <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">Kişisel AI Öneriler</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Günlük kalori hedefinize ve besin değeri ihtiyaçlarınıza uygun öğünler
          </p>
        </Card>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          <Button className="whitespace-nowrap">Tümü</Button>
          <Button variant="outline" className="whitespace-nowrap">Kahvaltı</Button>
          <Button variant="outline" className="whitespace-nowrap">Ana Yemek</Button>
          <Button variant="outline" className="whitespace-nowrap">Atıştırmalık</Button>
          <Button variant="outline" className="whitespace-nowrap">Vegetaryen</Button>
        </div>

        {/* Meal Suggestions */}
        <div className="space-y-4">
          {mockMealSuggestions.map((meal) => (
            <Card key={meal.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center">
                  <ChefHat className="h-8 w-8 text-white" />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-lg">{meal.name}</h3>
                    <Button variant="ghost" size="sm" className="p-1">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {meal.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {meal.calories} kcal
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      P: {meal.protein}g
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      K: {meal.carbs}g
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Y: {meal.fat}g
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{meal.prep_time} dk</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ChefHat className="h-3 w-3" />
                      <span>{meal.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1">
                  Tarif Detayı
                </Button>
                <Button className="flex-1">
                  Öğünüme Ekle
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Recipe Detail Modal Preview */}
        <Card className="p-4 border-2 border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <ChefHat className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Avokadolu Quinoa Salatası</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Malzemeler:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 1 su bardağı quinoa</li>
                <li>• 1/2 avokado (küp küp doğranmış)</li>
                <li>• 2 su bardağı karışık yeşillik</li>
                <li>• 10 adet cherry domates</li>
                <li>• 2 yemek kaşığı zeytinyağı</li>
                <li>• 1 limon suyu</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Hazırlanışı:</h4>
              <p className="text-sm text-muted-foreground">
                Quinoa'yı haşlayın, soğutun. Diğer malzemelerle karıştırın ve servis edin.
              </p>
            </div>
            
            <Button className="w-full">
              Bu Tarifi Öğünüme Ekle
            </Button>
          </div>
        </Card>

        {/* Favorites Section */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-red-500" />
            <h3 className="text-lg font-semibold">Favori Tariflerim</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Protein Bowl</p>
              <p className="text-xs text-muted-foreground">380 kcal</p>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <ChefHat className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Smoothie</p>
              <p className="text-xs text-muted-foreground">280 kcal</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}