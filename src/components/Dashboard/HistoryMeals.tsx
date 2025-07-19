
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { History, Calendar, Search, Filter, Clock, Utensils } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'

interface MealHistory {
  id: string
  date: string
  meal_type: string
  total_calories: number
  total_protein: number
  total_carbs: number
  total_fat: number
  food_items: any[]
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
        .lt('date', new Date().toISOString().split('T')[0]) // Exclude today
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (selectedMealType !== 'all') {
        query = query.eq('meal_type', selectedMealType)
      }

      const { data, error } = await query

      if (error) throw error

      setMeals(data?.map(meal => ({
        ...meal,
        food_items: Array.isArray(meal.food_items) ? meal.food_items : []
      })) || [])
    } catch (error) {
      console.error('Error fetching history meals:', error)
    } finally {
      setLoading(false)
    }
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    })
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
    <div className="px-4 pb-6">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <History className="h-5 w-5 text-blue-600" />
            Geçmiş Yemekler
          </CardTitle>
          
          {/* Filters */}
          <div className="flex flex-col gap-3 mt-4">
            <div className="flex gap-2">
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Son 1 Hafta</SelectItem>
                  <SelectItem value="month">Son 1 Ay</SelectItem>
                  <SelectItem value="3months">Son 3 Ay</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                <SelectTrigger className="flex-1">
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Yemek veya tarih ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Yemekler yükleniyor...</span>
            </div>
          ) : filteredMeals.length === 0 ? (
            <div className="text-center py-8">
              <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {searchTerm ? 'Arama kriterlerinize uygun yemek bulunamadı' : 'Bu dönemde kayıtlı yemek bulunamadı'}
              </p>
              {searchTerm && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchTerm('')}
                  className="text-blue-600"
                >
                  Aramayı Temizle
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {Object.entries(groupedMeals).map(([date, dayMeals]) => (
                  <div key={date} className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <h3 className="font-medium text-gray-900">{formatDate(date)}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {dayMeals.length} öğün
                      </Badge>
                    </div>
                    
                    {dayMeals.map((meal) => (
                      <div
                        key={meal.id}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-xl">
                            {getMealIcon(meal.meal_type)}
                          </div>
                          
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-gray-900">
                                {getMealTypeInTurkish(meal.meal_type)}
                              </h4>
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatTime(meal.created_at)}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-gray-600">
                              {meal.food_items.length > 0 
                                ? `${meal.food_items.length} yemek türü`
                                : 'Detay yok'
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-blue-600">
                            {Math.round(meal.total_calories)} kcal
                          </p>
                          <p className="text-xs text-gray-500">
                            P: {meal.total_protein?.toFixed(1)}g • 
                            K: {meal.total_carbs?.toFixed(1)}g • 
                            Y: {meal.total_fat?.toFixed(1)}g
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    {filteredMeals.length} yemekten {(currentPage - 1) * mealsPerPage + 1}-{Math.min(currentPage * mealsPerPage, filteredMeals.length)} arası gösteriliyor
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Önceki
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
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
