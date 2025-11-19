import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/components/Auth/AuthProvider'
import { supabase } from '@/integrations/supabase/client'
import { Calendar, TrendingUp, Target, MessageCircle, Sparkles, Heart, Activity, Apple, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// Helper function to parse assessment data
const parseAssessmentData = (assessment: Assessment) => {
  try {
    // First, try to parse recommendations field (it might contain the structured data as JSON string)
    if (assessment.recommendations) {
      try {
        const recommendationsData = typeof assessment.recommendations === 'string'
          ? JSON.parse(assessment.recommendations)
          : assessment.recommendations;

        // Check if it has the new structure
        if (recommendationsData.general_evaluation || recommendationsData.dietary_advice) {
          console.log('Found structured data in recommendations field');
          return recommendationsData;
        }
      } catch (e) {
        // If recommendations is not JSON, continue to assessment_data
      }
    }

    // Try to parse assessment_data if it exists
    if (assessment.assessment_data) {
      const data = typeof assessment.assessment_data === 'string'
        ? JSON.parse(assessment.assessment_data)
        : assessment.assessment_data;

      // Check if it has the new structure
      if (data.general_evaluation || data.dietary_advice) {
        console.log('Found structured data in assessment_data field');
        return data;
      }
    }
  } catch (e) {
    console.error('Error parsing assessment data:', e);
  }
  return null;
}

// Helper component to render structured content
const StructuredContent = ({ title, content, icon: Icon, gradientFrom, gradientTo, textColor }: any) => {
  if (!content) return null;

  // Split content into sentences and create bullet points
  const sentences = content
    .split(/\.\s+/)
    .filter((s: string) => s.trim().length > 0)
    .map((s: string) => s.trim() + (s.endsWith('.') ? '' : '.'));

  return (
    <div className={`space-y-3 bg-gradient-to-br ${gradientFrom} ${gradientTo} p-5 rounded-lg border border-gray-200`}>
      <h4 className="font-semibold text-base flex items-center gap-2">
        <Icon className={`h-5 w-5 ${textColor}`} />
        {title}
      </h4>
      <ul className="space-y-2">
        {sentences.map((sentence: string, idx: number) => (
          <li key={idx} className="text-sm text-gray-700 leading-relaxed flex gap-2">
            <span className="text-gray-400 mt-1">•</span>
            <span>{sentence}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

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
  const [showAllHistory, setShowAllHistory] = useState(false)

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
      {latestAssessment && (() => {
        const parsedData = parseAssessmentData(latestAssessment);

        return (
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

              {/* Show parsed data if available */}
              {parsedData ? (
                <div className="space-y-3">
                  {parsedData.general_evaluation && (
                    <div className="space-y-1">
                      <h4 className="font-semibold text-sm flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        Genel Değerlendirme
                      </h4>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {parsedData.general_evaluation}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {parsedData.dietary_advice && (
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm flex items-center gap-1">
                          <Apple className="h-4 w-4" />
                          Beslenme
                        </h4>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {parsedData.dietary_advice}
                        </p>
                      </div>
                    )}

                    {parsedData.exercise_recommendations && (
                      <div className="space-y-1">
                        <h4 className="font-semibold text-sm flex items-center gap-1">
                          <Activity className="h-4 w-4" />
                          Egzersiz
                        </h4>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {parsedData.exercise_recommendations}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
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
              )}

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
        );
      })()}

      {/* Assessment History */}
      <Card>
        <CardHeader>
          <CardTitle>Değerlendirme Geçmişi</CardTitle>
          <p className="text-sm text-gray-600">
            Son 3 değerlendirmeniz
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
            <>
              <div className="space-y-4">
                {(showAllHistory ? assessments : assessments.slice(0, 3)).map((assessment, index) => {
                  const parsedData = parseAssessmentData(assessment);

                  return (
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
                        {index === 0 && !showAllHistory && (
                          <Badge variant="outline" className="text-xs">
                            En Son
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 text-sm">
                        {parsedData ? (
                          <>
                            {parsedData.general_evaluation && (
                              <div>
                                <h5 className="font-medium mb-1">Genel Değerlendirme</h5>
                                <p className="text-gray-700 line-clamp-2">
                                  {parsedData.general_evaluation}
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {assessment.health_insights && (
                              <div>
                                <h5 className="font-medium mb-1">Sağlık Önerileri</h5>
                                <p className="text-gray-700 line-clamp-2">
                                  {assessment.health_insights}
                                </p>
                              </div>
                            )}
                            {assessment.recommendations && (
                              <div>
                                <h5 className="font-medium mb-1">Genel Öneriler</h5>
                                <p className="text-gray-700 line-clamp-2">
                                  {assessment.recommendations}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <Progress value={assessment.progress_score} className="w-full" />

                      <p className="text-xs text-gray-400 text-center">Detayları görmek için tıklayın</p>
                    </div>
                  );
                })}
              </div>

              {/* Show More/Less Button */}
              {assessments.length > 3 && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setShowAllHistory(!showAllHistory)}
                >
                  {showAllHistory ? 'Daha Az Göster' : `Tümünü Gör (${assessments.length})`}
                </Button>
              )}
            </>
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

          {selectedAssessment && (() => {
            const parsedData = parseAssessmentData(selectedAssessment);

            return (
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

                {/* Show new structured format or fallback to old format */}
                {parsedData ? (
                  <>
                    {/* General Evaluation */}
                    {parsedData.general_evaluation && (
                      <div className="space-y-2 bg-gradient-to-br from-slate-50 to-gray-50 p-5 rounded-lg border border-gray-200">
                        <h4 className="font-semibold text-base flex items-center gap-2">
                          <Target className="h-5 w-5 text-gray-700" />
                          Genel Değerlendirme
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {parsedData.general_evaluation}
                        </p>
                      </div>
                    )}

                    {/* Dietary Advice */}
                    <StructuredContent
                      title="Beslenme Önerileri"
                      content={parsedData.dietary_advice}
                      icon={Apple}
                      gradientFrom="from-green-50"
                      gradientTo="to-emerald-50"
                      textColor="text-green-600"
                    />

                    {/* Exercise Recommendations */}
                    <StructuredContent
                      title="Egzersiz Önerileri"
                      content={parsedData.exercise_recommendations}
                      icon={Activity}
                      gradientFrom="from-orange-50"
                      gradientTo="to-amber-50"
                      textColor="text-orange-600"
                    />

                    {/* Lifestyle Changes */}
                    <StructuredContent
                      title="Yaşam Tarzı Değişiklikleri"
                      content={parsedData.lifestyle_changes}
                      icon={Zap}
                      gradientFrom="from-purple-50"
                      gradientTo="to-pink-50"
                      textColor="text-purple-600"
                    />
                  </>
                ) : (
                  <>
                    {/* Fallback: Show health insights */}
                    {selectedAssessment.health_insights && (
                      <div className="space-y-2 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200">
                        <h4 className="font-semibold text-base flex items-center gap-2">
                          <Heart className="h-5 w-5 text-blue-600" />
                          Sağlık Önerileri
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {selectedAssessment.health_insights}
                        </p>
                      </div>
                    )}

                    {/* Fallback: Show general recommendations */}
                    {selectedAssessment.recommendations && (
                      <div className="space-y-2 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-lg border border-green-200">
                        <h4 className="font-semibold text-base flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          Genel Öneriler
                        </h4>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {selectedAssessment.recommendations}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {/* Motivational Message */}
                {selectedAssessment.motivational_message && (
                  <div className="space-y-2 bg-gradient-to-br from-indigo-50 to-blue-50 p-5 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-base flex items-center gap-2">
                      <MessageCircle className="h-5 w-5 text-indigo-600" />
                      Motivasyon Mesajı
                    </h4>
                    <p className="text-sm text-indigo-700 italic leading-relaxed">
                      {selectedAssessment.motivational_message}
                    </p>
                  </div>
                )}

                {/* Date */}
                <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(selectedAssessment.created_at)}
                </p>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  )
}