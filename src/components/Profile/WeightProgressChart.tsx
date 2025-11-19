import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/Auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { format, subDays, subMonths, subYears } from 'date-fns'
import { tr } from 'date-fns/locale'

interface WeightEntry {
  recorded_at: string
  weight: number
}

type TimeRange = '90days' | '6months' | '1year' | 'all'

export default function WeightProgressChart() {
  const { user } = useAuth()
  const [weightData, setWeightData] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('6months')
  const [goalWeight, setGoalWeight] = useState<number | null>(null)

  useEffect(() => {
    if (user) {
      fetchWeightData()
      fetchGoalWeight()
    }
  }, [user, timeRange])

  const fetchGoalWeight = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('weight, diet_goal')
      .eq('user_id', user?.id)
      .single()

    if (data?.weight && data?.diet_goal) {
      // Calculate goal weight based on diet goal
      const currentWeight = data.weight
      if (data.diet_goal === 'kilo_ver') {
        setGoalWeight(currentWeight * 0.9) // 10% weight loss
      } else if (data.diet_goal === 'kilo_al') {
        setGoalWeight(currentWeight * 1.1) // 10% weight gain
      } else {
        setGoalWeight(currentWeight) // maintain
      }
    }
  }

  const fetchWeightData = async () => {
    setLoading(true)

    let startDate = new Date()
    switch (timeRange) {
      case '90days':
        startDate = subDays(new Date(), 90)
        break
      case '6months':
        startDate = subMonths(new Date(), 6)
        break
      case '1year':
        startDate = subYears(new Date(), 1)
        break
      case 'all':
        startDate = new Date('2020-01-01') // Far past date
        break
    }

    const { data, error } = await supabase
      .from('weight_history')
      .select('recorded_at, weight')
      .eq('user_id', user?.id)
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: true })

    if (!error && data) {
      setWeightData(data)
    }

    setLoading(false)
  }

  const getWeightTrend = () => {
    if (weightData.length < 2) return null

    const firstWeight = weightData[0].weight
    const lastWeight = weightData[weightData.length - 1].weight
    const change = lastWeight - firstWeight
    const percentChange = ((change / firstWeight) * 100).toFixed(1)

    return {
      change: Math.abs(change).toFixed(1),
      percentChange: Math.abs(parseFloat(percentChange)),
      direction: change < 0 ? 'down' : change > 0 ? 'up' : 'stable'
    }
  }

  const formatChartData = () => {
    return weightData.map(entry => ({
      date: format(new Date(entry.recorded_at), 'dd MMM', { locale: tr }),
      weight: entry.weight,
      fullDate: format(new Date(entry.recorded_at), 'dd MMMM yyyy', { locale: tr })
    }))
  }

  const getGoalProgress = () => {
    if (!goalWeight || weightData.length === 0) return null

    const currentWeight = weightData[weightData.length - 1].weight
    const startWeight = weightData[0].weight
    const totalChange = goalWeight - startWeight
    const currentChange = currentWeight - startWeight
    const progress = Math.min(Math.abs(currentChange / totalChange) * 100, 100)

    return {
      progress: progress.toFixed(0),
      remaining: Math.abs(goalWeight - currentWeight).toFixed(1)
    }
  }

  const trend = getWeightTrend()
  const chartData = formatChartData()
  const goalProgress = getGoalProgress()

  const timeRangeButtons: { value: TimeRange; label: string }[] = [
    { value: '90days', label: '90 Gün' },
    { value: '6months', label: '6 Ay' },
    { value: '1year', label: '1 Yıl' },
    { value: 'all', label: 'Tümü' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kilo Gelişimi</CardTitle>
        <p className="text-sm text-gray-600">
          Zamanla kilo değişiminizi takip edin
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Time Range Selector */}
        <div className="flex gap-2 flex-wrap">
          {timeRangeButtons.map(btn => (
            <Button
              key={btn.value}
              variant={timeRange === btn.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(btn.value)}
            >
              {btn.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Yükleniyor...</p>
          </div>
        ) : weightData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Henüz kilo kaydı bulunmuyor.</p>
            <p className="text-sm text-gray-400 mt-1">
              Profilinizi güncelleyerek ilk kaydınızı oluşturun.
            </p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Weight */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Mevcut Kilo</p>
                <p className="text-2xl font-bold text-blue-700">
                  {weightData[weightData.length - 1].weight} kg
                </p>
              </div>

              {/* Weight Change */}
              {trend && (
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600 mb-1">Değişim</p>
                  <div className="flex items-center gap-2">
                    {trend.direction === 'down' ? (
                      <TrendingDown className="h-5 w-5 text-green-600" />
                    ) : trend.direction === 'up' ? (
                      <TrendingUp className="h-5 w-5 text-orange-600" />
                    ) : (
                      <Minus className="h-5 w-5 text-gray-600" />
                    )}
                    <div>
                      <p className="text-2xl font-bold text-green-700">
                        {trend.direction === 'down' ? '-' : trend.direction === 'up' ? '+' : ''}
                        {trend.change} kg
                      </p>
                      <p className="text-xs text-gray-600">
                        ({trend.percentChange}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Goal Progress */}
              {goalProgress && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-600 mb-1">Hedefe İlerleme</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {goalProgress.progress}%
                  </p>
                  <p className="text-xs text-gray-600">
                    {goalProgress.remaining} kg kaldı
                  </p>
                </div>
              )}
            </div>

            {/* Chart */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tick={{ fontSize: 12 }}
                    label={{ value: 'Kilo (kg)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border rounded-lg shadow-lg">
                            <p className="text-sm font-semibold">{payload[0].payload.fullDate}</p>
                            <p className="text-lg font-bold text-blue-600">
                              {payload[0].value} kg
                            </p>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="weight"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  {goalWeight && (
                    <Line
                      type="monotone"
                      data={[
                        { date: chartData[0]?.date, weight: goalWeight },
                        { date: chartData[chartData.length - 1]?.date, weight: goalWeight }
                      ]}
                      dataKey="weight"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {goalWeight && (
              <div className="text-center text-sm text-gray-600">
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-0.5 bg-blue-600"></span>
                  Mevcut Kilo
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-green-600 ml-4"></span>
                  Hedef Kilo ({goalWeight.toFixed(1)} kg)
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
