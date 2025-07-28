
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Brain, TrendingUp, Target, Lightbulb, RefreshCw } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'

interface AIInsightsProps {
  dailyStats: {
    totalCalories: number
    goalCalories: number
    totalProtein: number
    totalCarbs: number
    totalFat: number
    proteinGoal: number
    carbsGoal: number
    fatGoal: number
  }
}

interface InsightData {
  dailyProgress: {
    calorieProgress: number
    proteinProgress: number
    recommendation: string
  }
  weeklyTrend: {
    averageCalories: number
    trend: 'up' | 'down' | 'stable'
    message: string
  }
  aiSuggestion: string
}

export function AIInsights({ dailyStats }: AIInsightsProps) {
  const { user } = useAuth()
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchInsights()
    }
  }, [user, dailyStats])

  const fetchInsights = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Get last 7 days data for weekly analysis
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { data: weeklyMeals } = await supabase
        .from('meal_logs')
        .select('total_calories, date')
        .eq('user_id', user.id)
        .gte('date', sevenDaysAgo.toISOString().split('T')[0])
        .order('date', { ascending: false })

      // Calculate insights
      const calorieProgress = (dailyStats.totalCalories / dailyStats.goalCalories) * 100
      const proteinProgress = (dailyStats.totalProtein / dailyStats.proteinGoal) * 100
      
      let weeklyAverage = 0
      let trend: 'up' | 'down' | 'stable' = 'stable'
      let trendMessage = ''

      if (weeklyMeals && weeklyMeals.length > 0) {
        const dailyTotals = weeklyMeals.reduce((acc, meal) => {
          acc[meal.date] = (acc[meal.date] || 0) + meal.total_calories
          return acc
        }, {} as Record<string, number>)

        const dailyAverages = Object.values(dailyTotals)
        weeklyAverage = dailyAverages.reduce((sum, cal) => sum + cal, 0) / dailyAverages.length

        // Simple trend analysis
        if (dailyAverages.length >= 3) {
          const recent = dailyAverages.slice(0, 3).reduce((a, b) => a + b) / 3
          const older = dailyAverages.slice(-3).reduce((a, b) => a + b) / 3
          
          if (recent > older * 1.05) {
            trend = 'up'
            trendMessage = 'Son günlerde kalori alımınız artış gösteriyor'
          } else if (recent < older * 0.95) {
            trend = 'down'
            trendMessage = 'Son günlerde kalori alımınız azalış gösteriyor'
          } else {
            trendMessage = 'Kalori alımınız stabil seyrediyor'
          }
        }
      }

      // Generate AI suggestion based on progress
      let aiSuggestion = ''
      if (calorieProgress < 80) {
        aiSuggestion = 'Günlük kalori hedefinizin altındasınız. Sağlıklı atıştırmalıklar ekleyebilirsiniz.'
      } else if (calorieProgress > 120) {
        aiSuggestion = 'Kalori hedefinizi aştınız. Yarın daha hafif yemekler tercih edebilirsiniz.'
      } else if (proteinProgress < 80) {
        aiSuggestion = 'Protein alımınız yetersiz. Yumurta, tavuk veya baklagiller ekleyebilirsiniz.'
      } else {
        aiSuggestion = 'Beslenme dengeniz çok iyi! Bu şekilde devam edin.'
      }

      setInsights({
        dailyProgress: {
          calorieProgress,
          proteinProgress,
          recommendation: calorieProgress > 90 && calorieProgress < 110 ? 'Mükemmel!' : 'Geliştirebilir'
        },
        weeklyTrend: {
          averageCalories: Math.round(weeklyAverage),
          trend,
          message: trendMessage
        },
        aiSuggestion
      })
    } catch (error) {
      console.error('Error fetching insights:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-green-500" />
              <span className="ml-2 text-sm sm:text-base text-gray-600">Ai analiz yapılıyor...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4">
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            Ai Analiz ve Öneriler
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-3 sm:space-y-4">
          {/* Daily Progress */}
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
              <h3 className="text-sm sm:text-base font-medium text-gray-900">Günlük İlerleme</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Kalori</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(insights?.dailyProgress.calorieProgress || 0, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 min-w-[3rem]">
                    {Math.round(insights?.dailyProgress.calorieProgress || 0)}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Protein</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min(insights?.dailyProgress.proteinProgress || 0, 100)}%` }}
                    />
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-gray-900 min-w-[3rem]">
                    {Math.round(insights?.dailyProgress.proteinProgress || 0)}%
                  </span>
                </div>
              </div>
            </div>
            <Badge 
              variant={insights?.dailyProgress.recommendation === 'Mükemmel!' ? 'default' : 'secondary'}
              className="mt-2 text-xs"
            >
              {insights?.dailyProgress.recommendation}
            </Badge>
          </div>

          {/* Weekly Trend */}
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
              <h3 className="text-sm sm:text-base font-medium text-gray-900">Haftalık Trend</h3>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Ortalama Kalori</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{insights?.weeklyTrend.averageCalories} kcal</p>
              </div>
              <Badge 
                variant={insights?.weeklyTrend.trend === 'up' ? 'destructive' : insights?.weeklyTrend.trend === 'down' ? 'secondary' : 'default'}
                className="text-xs self-start sm:self-auto"
              >
                {insights?.weeklyTrend.trend === 'up' ? '↗ Artış' : insights?.weeklyTrend.trend === 'down' ? '↘ Azalış' : '→ Stabil'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 mt-2">{insights?.weeklyTrend.message}</p>
          </div>

          {/* AI Suggestion */}
          <div className="bg-white rounded-lg p-3 sm:p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
              <h3 className="text-sm sm:text-base font-medium text-gray-900">Ai Önerisi</h3>
            </div>
            <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">
              {insights?.aiSuggestion}
            </p>
          </div>

          <Button 
            onClick={fetchInsights}
            variant="outline" 
            size="sm"
            className="w-full border-green-300 text-green-700 hover:bg-green-50 h-10 sm:h-9 text-sm"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
            Analizi Yenile
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
