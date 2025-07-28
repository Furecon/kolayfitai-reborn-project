import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Camera, Utensils, TrendingUp, Brain, Plus } from 'lucide-react'
import { mockDailyStats, mockMeals, mockAIInsights, mockHistoryMeals } from './MockData'

export function ScreenshotDashboard() {
  const { totalCalories, calorieGoal, totalProtein, proteinGoal, totalCarbs, carbGoal, totalFat, fatGoal } = mockDailyStats

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Merhaba, Ayşe!</h1>
            <p className="text-primary-foreground/80">Bugün harika bir gün olacak 🌟</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-foreground/80">28 Ocak 2024</p>
            <p className="text-lg font-semibold">Pazartesi</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Calorie Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Kalori</span>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{totalCalories}</span>
                  <span className="text-sm text-muted-foreground">/ {calorieGoal}</span>
                </div>
                <Progress value={(totalCalories / calorieGoal) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {calorieGoal - totalCalories} kalori kaldı
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Protein</span>
                <span className="text-xs text-blue-500">81%</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{totalProtein}g</span>
                  <span className="text-sm text-muted-foreground">/ {proteinGoal}g</span>
                </div>
                <Progress value={(totalProtein / proteinGoal) * 100} className="h-2" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Karbonhidrat</span>
                <span className="text-xs text-orange-500">53%</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{totalCarbs}g</span>
                  <span className="text-sm text-muted-foreground">/ {carbGoal}g</span>
                </div>
                <Progress value={(totalCarbs / carbGoal) * 100} className="h-2" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Yağ</span>
                <span className="text-xs text-red-500">110%</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{totalFat}g</span>
                  <span className="text-sm text-muted-foreground">/ {fatGoal}g</span>
                </div>
                <Progress value={(totalFat / fatGoal) * 100} className="h-2" />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button className="h-20 flex flex-col gap-2">
            <Camera className="h-6 w-6" />
            <span>Fotoğraf Çek</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col gap-2">
            <Plus className="h-6 w-6" />
            <span>Manuel Ekle</span>
          </Button>
        </div>

        {/* Today's Meals */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Bugünkü Öğünler
            </h3>
          </div>
          <div className="space-y-3">
            {mockMeals.map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Utensils className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{meal.name}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {meal.meal_type === 'breakfast' ? 'Kahvaltı' : 
                       meal.meal_type === 'lunch' ? 'Öğle' :
                       meal.meal_type === 'dinner' ? 'Akşam' : 'Atıştırmalık'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{meal.calories} kcal</p>
                  <p className="text-xs text-muted-foreground">
                    P: {meal.protein}g • K: {meal.carbs}g • Y: {meal.fat}g
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI Insights */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">AI Öneriler</h3>
          </div>
          <div className="space-y-3">
            {mockAIInsights.map((insight, index) => (
              <div key={index} className="p-3 bg-muted/50 rounded-lg">
                <h4 className="font-medium text-sm">{insight.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{insight.message}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* History */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Geçmiş Öğünler</h3>
          <div className="space-y-4">
            {mockHistoryMeals.map((day) => (
              <div key={day.date} className="border-l-2 border-primary/20 pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">27 Ocak 2024</h4>
                  <span className="text-sm font-semibold">{day.totalCalories} kcal</span>
                </div>
                <div className="space-y-1">
                  {day.meals.map((meal, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{meal.name}</span>
                      <span>{meal.calories} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}