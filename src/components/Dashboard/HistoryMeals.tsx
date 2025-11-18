
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { History, Calendar, Search, Clock, Utensils, ChevronDown, ChevronUp } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'

interface FoodItem {
  id?: string
  name: string
  amount: number
  unit: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface MealHistory {
  id: string
  date: string
  meal_type: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  food_items: FoodItem[]
  created_at: string
}

export function HistoryMeals() {
  const { user } = useAuth()
  const [meals, setMeals] = useState<MealHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedMealType, setSelectedMealType] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedMeals, setExpandedMeals] = useState<Set<string>>(new Set())
  const mealsPerPage = 10

  useEffect(() => {
    if (user) {
      fetchHistoryMeals()
    }
  }, [user, selectedPeriod, selectedMealType])

  const fetchHistoryMeals = async () => {
    if (!user) return

    setLoading(true)
    try {
      let daysBack = 7
      switch (selectedPeriod) {
        case 'week': daysBack = 7; break
        case 'month': daysBack = 30; break
        case '3months': daysBack = 90; break
      }

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - daysBack)
      
      let query = supabase
        .from('meal_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', new Date().toISOString().split('T')[0])
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (selectedMealType !== 'all') {
        query = query.eq('meal_type', selectedMealType)
      }

      const { data, error } = await query

      if (error) throw error

      // Transform the data to match our interface
      const transformedMeals: MealHistory[] = data?.map(meal => ({
        id: meal.id,
        date: meal.date,
        meal_type: meal.meal_type,
        total_calories: meal.total_calories,
        total_protein: meal.total_protein,
        total_carbs: meal.total_carbs,
        total_fat: meal.total_fat,
        created_at: meal.created_at,
        food_items: Array.isArray(meal.food_items) 
          ? meal.food_items.map((item: any) => ({
              id: item.id,
              name: item.name || 'Bilinmeyen yemek',
              amount: parseFloat(item.estimatedAmount) || 100,
              unit: item.estimatedAmount?.includes('g') ? 'g' : 'porsiyon',
              calories: item.totalNutrition?.calories || 0,
              protein: item.totalNutrition?.protein || 0,
              carbs: item.totalNutrition?.carbs || 0,
              fat: item.totalNutrition?.fat || 0
            }))
          : []
      })) || []

      setMeals(transformedMeals)
    } catch (error) {
      console.error('Error fetching history meals:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleMealExpansion = (mealId: string) => {
    setExpandedMeals(prev => {
      const newSet = new Set(prev)
      if (newSet.has(mealId)) {
        newSet.delete(mealId)
      } else {
        newSet.add(mealId)
      }
      return newSet
    })
  }

  const getMealIcon = (mealType: string) => {
    switch (mealType.toLowerCase()) {
      case 'kahvaltı':
      case 'breakfast':
        return '🌅'
      case 'öğle':
      case 'lunch':
        return '☀️'
      case 'akşam':
      case 'dinner':
        return '🌙'
      case 'atıştırmalık':
      case 'snack':
        return '🍎'
      default:
        return '🍽️'
    }
  }

  const getMealTypeInTurkish = (mealType: string) => {
    const translations = {
      'breakfast': 'Kahvaltı',
      'lunch': 'Öğle Yemeği',
      'dinner': 'Akşam Yemeği',
      'snack': 'Atıştırmalık',
      'kahvaltı': 'Kahvaltı',
      'öğle': 'Öğle Yemeği',
      'akşam': 'Akşam Yemeği',
      'atıştırmalık': 'Atıştırmalık'
    }
    return translations[mealType.toLowerCase() as keyof typeof translations] || mealType
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderFoodItems = (foodItems: FoodItem[]) => {
    if (!foodItems || foodItems.length === 0) {
      return (
        <p className="text-sm text-gray-500 italic">Bu öğün için yemek detayı bulunamadı</p>
      )
    }

    return (
      <div className="space-y-2">
        {foodItems.map((item, index) => (
          <div 
            key={index}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 bg-gray-50 rounded border"
          >
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </h5>
              <p className="text-xs text-gray-600">
                {item.amount} {item.unit}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-600 mt-1 sm:mt-0">
              <span className="font-medium text-blue-600">
                {Math.round(item.calories)} kcal
              </span>
              <span>P: {item.protein?.toFixed(1)}g</span>
              <span>K: {item.carbs?.toFixed(1)}g</span>
              <span>Y: {item.fat?.toFixed(1)}g</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Filter meals based on search term
  const filteredMeals = meals.filter(meal => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      getMealTypeInTurkish(meal.meal_type).toLowerCase().includes(searchLower) ||
      meal.food_items.some(item => 
        item.name?.toLowerCase().includes(searchLower)
      ) ||
      formatDate(meal.date).toLowerCase().includes(searchLower)
    )
  })

  // Pagination
  const totalPages = Math.ceil(filteredMeals.length / mealsPerPage)
  const paginatedMeals = filteredMeals.slice(
    (currentPage - 1) * mealsPerPage,
    currentPage * mealsPerPage
  )

  // Group meals by date
  const groupedMeals = paginatedMeals.reduce((acc, meal) => {
    const date = meal.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(meal)
    return acc
  }, {} as Record<string, MealHistory[]>)

  return (
    <div className="px-3 sm:px-4 lg:px-6 pb-4 sm:pb-6">
      <Card>
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
            <History className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
            Geçmiş Yemekler
          </CardTitle>
          
          {/* Filters - Responsive Layout */}
          <div className="flex flex-col gap-3 mt-3 sm:mt-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full sm:flex-1 h-9 sm:h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Son 1 Hafta</SelectItem>
                  <SelectItem value="month">Son 1 Ay</SelectItem>
                  <SelectItem value="3months">Son 3 Ay</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                <SelectTrigger className="w-full sm:flex-1 h-9 sm:h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Öğünler</SelectItem>
                  <SelectItem value="kahvaltı">Kahvaltı</SelectItem>
                  <SelectItem value="öğle">Öğle Yemeği</SelectItem>
                  <SelectItem value="akşam">Akşam Yemeği</SelectItem>
                  <SelectItem value="atıştırmalık">Atıştırmalık</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              <Input
                placeholder="Yemek veya tarih ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-10 h-9 sm:h-10 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6 sm:py-8">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-gray-600">Yükleniyor...</span>
            </div>
          ) : filteredMeals.length === 0 ? (
            <div className="text-center py-6 sm:py-8">
              <Utensils className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm text-gray-600 mb-2 px-2">
                {searchTerm ? 'Arama sonucu bulunamadı' : 'Bu dönemde yemek bulunamadı'}
              </p>
              {searchTerm && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600 text-sm h-8"
                >
                  Aramayı Temizle
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3 sm:space-y-4">
                {Object.entries(groupedMeals).map(([date, dayMeals]) => (
                  <div key={date} className="space-y-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                      <h3 className="text-sm font-medium text-gray-900 flex-1 min-w-0 truncate">
                        {formatDate(date)}
                      </h3>
                      <Badge variant="secondary" className="text-xs flex-shrink-0 h-5">
                        {dayMeals.length} öğün
                      </Badge>
                    </div>
                    
                    {dayMeals.map((meal) => (
                      <Collapsible
                        key={meal.id}
                        open={expandedMeals.has(meal.id)}
                        onOpenChange={() => toggleMealExpansion(meal.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors gap-3 cursor-pointer">
                            <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <div className="text-lg sm:text-xl flex-shrink-0 mt-0.5 sm:mt-0">
                                {getMealIcon(meal.meal_type)}
                              </div>
                              
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">
                                    {getMealTypeInTurkish(meal.meal_type)}
                                  </h4>
                                  <Badge variant="outline" className="text-xs self-start sm:self-auto flex-shrink-0 h-5">
                                    <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                                    {formatTime(meal.created_at)}
                                  </Badge>
                                </div>
                                
                                <p className="text-xs text-gray-600 truncate">
                                  {meal.food_items.length > 0 
                                    ? meal.food_items.map(item => item.name).join(', ')
                                    : 'Detay yok'
                                  }
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-0">
                                <p className="text-sm font-semibold text-blue-600">
                                  {Math.round(meal.total_calories)} kcal
                                </p>
                                <p className="text-xs text-gray-500 whitespace-nowrap">
                                  P:{meal.total_protein?.toFixed(0)}g • 
                                  K:{meal.total_carbs?.toFixed(0)}g • 
                                  Y:{meal.total_fat?.toFixed(0)}g
                                </p>
                              </div>
                              
                              {expandedMeals.has(meal.id) ? (
                                <ChevronUp className="h-4 w-4 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        
                        <CollapsibleContent>
                          <div className="px-3 pb-3 pt-1">
                            <div className="border-t border-gray-100 pt-3">
                              <h5 className="text-sm font-medium text-gray-900 mb-3">
                                Yemek Detayları:
                              </h5>
                              {renderFoodItems(meal.food_items)}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                ))}
              </div>

              {/* Pagination - Mobile Optimized */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-600 text-center sm:text-left">
                    {filteredMeals.length} yemekten {(currentPage - 1) * mealsPerPage + 1}-{Math.min(currentPage * mealsPerPage, filteredMeals.length)} arası
                  </p>
                  <div className="flex gap-2 justify-center sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-3 text-sm"
                    >
                      Önceki
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="h-8 px-3 text-sm"
                    >
                      Sonraki
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
