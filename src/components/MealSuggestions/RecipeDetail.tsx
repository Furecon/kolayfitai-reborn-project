
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Clock, Users, Heart, Plus } from 'lucide-react'

interface MealSuggestion {
  name: string
  description: string
  calories: number
  protein: number
  carbs: number
  fat: number
  prepTime: number
  difficulty: string
  ingredients: string[]
  instructions: string[]
  category: string
  servings: number
}

interface RecipeDetailProps {
  recipe: MealSuggestion
  onBack: () => void
  onAddMeal: () => void
  onSaveFavorite: () => void
}

export function RecipeDetail({ recipe, onBack, onAddMeal, onSaveFavorite }: RecipeDetailProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'kolay': return 'bg-green-100 text-green-800'
      case 'orta': return 'bg-yellow-100 text-yellow-800'
      case 'zor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 px-4 py-4 bg-white">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-xl font-semibold text-black">Tarif Detayı</h1>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Recipe Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{recipe.name}</CardTitle>
                <p className="text-gray-600">{recipe.description}</p>
                <Badge variant="secondary" className="mt-2">{recipe.category}</Badge>
              </div>
              <Badge className={getDifficultyColor(recipe.difficulty)}>
                {recipe.difficulty}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{recipe.prepTime} dakika</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{recipe.servings} porsiyon</span>
              </div>
            </div>

            {/* Nutrition Info */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{recipe.calories}</div>
                <div className="text-sm text-gray-600">Kalori</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{recipe.protein}g</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{recipe.carbs}g</div>
                <div className="text-sm text-gray-600">Karbonhidrat</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{recipe.fat}g</div>
                <div className="text-sm text-gray-600">Yağ</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients */}
        <Card>
          <CardHeader>
            <CardTitle>Malzemeler</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Hazırlanışı</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <p className="pt-1 text-gray-700">{instruction}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3 sticky bottom-4">
          <Button
            onClick={onSaveFavorite}
            variant="outline"
            className="flex-1"
          >
            <Heart className="h-4 w-4 mr-2" />
            Favorilere Ekle
          </Button>
          <Button
            onClick={onAddMeal}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Öğünü Ekle
          </Button>
        </div>
      </div>
    </div>
  )
}
