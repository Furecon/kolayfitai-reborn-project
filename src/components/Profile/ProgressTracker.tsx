import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/components/Auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import { Calendar, TrendingUp, Target, MessageCircle } from 'lucide-react'

interface Assessment {
  id: string
  progress_score: number
  recommendations: string
  health_insights: string
  motivational_message: string
  created_at: string
  assessment_data: any
}

export default function ProgressTracker() {
  const { user } = useAuth()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchAssessments()
    }
  }, [user])

  const fetchAssessments = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ai_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setAssessments(data || [])
    } catch (error) {
      console.error('Error fetching assessments:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadgeVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'outline'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
      </div>
    )
  }

  const latestAssessment = assessments[0]

  return (
    <div className="space-y-6">
      {/* Latest Assessment Summary */}
      {latestAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Son Değerlendirmeniz
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Genel İlerleme Skoru</p>
              <div className="flex items-center gap-3">
                <span className={`text-2xl font-bold ${getScoreColor(latestAssessment.progress_score)}`}>
                  {latestAssessment.progress_score}/100
                </span>
                <Badge variant={getScoreBadgeVariant(latestAssessment.progress_score)}>
                  {latestAssessment.progress_score >= 80 ? 'Mükemmel' :
                   latestAssessment.progress_score >= 60 ? 'İyi' : 'Gelişim Alanı'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Öneriler
                </h4>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {latestAssessment.recommendations}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  Motivasyon
                </h4>
                <p className="text-sm text-blue-700 italic line-clamp-3">
                  {latestAssessment.motivational_message}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(latestAssessment.created_at)}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Assessment History */}
      <Card>
        <CardHeader>
          <CardTitle>Değerlendirme Geçmişi</CardTitle>
          <p className="text-sm text-gray-600">
            AI tarafından yapılan değerlendirmelerinizin geçmişi
          </p>
        </CardHeader>
        <CardContent>
          {assessments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Henüz değerlendirme bulunmuyor.</p>
              <p className="text-sm text-gray-400 mt-1">
                Profilinizi güncelleyerek ilk değerlendirmenizi alın.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assessments.map((assessment, index) => (
                <div key={assessment.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={getScoreBadgeVariant(assessment.progress_score)}>
                        {assessment.progress_score}/100
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {formatDate(assessment.created_at)}
                      </span>
                    </div>
                    {index === 0 && (
                      <Badge variant="outline" className="text-xs">
                        En Son
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h5 className="font-medium mb-1">Sağlık Önerileri</h5>
                      <p className="text-gray-700 line-clamp-2">
                        {assessment.health_insights}
                      </p>
                    </div>
                    <div>
                      <h5 className="font-medium mb-1">Genel Öneriler</h5>
                      <p className="text-gray-700 line-clamp-2">
                        {assessment.recommendations}
                      </p>
                    </div>
                  </div>

                  <Progress value={assessment.progress_score} className="w-full" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}