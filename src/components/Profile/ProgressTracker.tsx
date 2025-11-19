import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/Auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import { Calendar, TrendingUp, Target, MessageCircle, Sparkles, Heart } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

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
  const { toast } = useToast()
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

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

  const generateNewAssessment = async () => {
    if (!user) return

    setGenerating(true)
    try {
      const { data, error } = await supabase.functions.invoke('profile-assessment', {
        body: { userId: user.id }
      })

      if (error) throw error

      toast({
        title: "Değerlendirme Tamamlandı!",
        description: "Yeni AI değerlendirmeniz başarıyla oluşturuldu.",
      })

      await fetchAssessments()
    } catch (error: any) {
      console.error('Error generating assessment:', error)
      toast({
        title: "Hata",
        description: error.message || "Değerlendirme oluşturulurken bir hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setGenerating(false)
    }
  }

  const openAssessmentDetail = (assessment: Assessment) => {
    setSelectedAssessment(assessment)
    setIsDialogOpen(true)
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
      {/* New Assessment Button */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Yeni AI Değerlendirmesi
              </h3>
              <p className="text-sm text-gray-600">
                İlerlemenizi analiz edin ve kişiselleştirilmiş öneriler alın
              </p>
            </div>
            <Button
              onClick={generateNewAssessment}
              disabled={generating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {generating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Değerlendir
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

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

            <Button
              variant="outline"
              size="sm"
              onClick={() => openAssessmentDetail(latestAssessment)}
              className="w-full mt-2"
            >
              Tümünü Görüntüle
            </Button>

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
                <div
                  key={assessment.id}
                  className="border rounded-lg p-4 space-y-3 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => openAssessmentDetail(assessment)}
                >
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

                  <p className="text-xs text-gray-400 text-center">Detayları görmek için tıklayın</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assessment Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Değerlendirme Detayları
            </DialogTitle>
          </DialogHeader>

          {selectedAssessment && (
            <div className="space-y-6 py-4">
              {/* Score */}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">Genel İlerleme Skoru</p>
                <div className="flex items-center justify-center gap-3">
                  <span className={`text-4xl font-bold ${getScoreColor(selectedAssessment.progress_score)}`}>
                    {selectedAssessment.progress_score}/100
                  </span>
                  <Badge variant={getScoreBadgeVariant(selectedAssessment.progress_score)} className="text-base px-3 py-1">
                    {selectedAssessment.progress_score >= 80 ? 'Mükemmel' :
                     selectedAssessment.progress_score >= 60 ? 'İyi' : 'Gelişim Alanı'}
                  </Badge>
                </div>
                <Progress value={selectedAssessment.progress_score} className="w-full h-3" />
              </div>

              {/* Recommendations */}
              <div className="space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Öneriler
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedAssessment.recommendations}
                </p>
              </div>

              {/* Health Insights */}
              <div className="space-y-2 bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg">
                <h4 className="font-semibold text-base flex items-center gap-2">
                  <Heart className="h-5 w-5 text-green-600" />
                  Sağlık Önerileri
                </h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {selectedAssessment.health_insights}
                </p>
              </div>

              {/* Motivational Message */}
              <div className="space-y-2 bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-base flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                  Motivasyon
                </h4>
                <p className="text-sm text-purple-700 italic whitespace-pre-wrap leading-relaxed">
                  {selectedAssessment.motivational_message}
                </p>
              </div>

              {/* Date */}
              <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(selectedAssessment.created_at)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}