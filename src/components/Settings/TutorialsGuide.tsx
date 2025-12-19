import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { useTutorial } from '@/components/Tutorial/TutorialProvider'
import { tutorialStorage } from '@/lib/tutorialStorage'
import { getAllTutorials, getTutorialByFeatureId } from '@/lib/tutorialConfig'
import { Play, RotateCcw, BookOpen, CheckCircle2, XCircle, Clock, Ban } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function TutorialsGuide() {
  const { startTutorial } = useTutorial()
  const { toast } = useToast()
  const [, setRefreshKey] = useState(0)

  const tutorials = getAllTutorials()

  const handleStartTutorial = (featureId: string) => {
    const tutorial = getTutorialByFeatureId(featureId)

    if (tutorial?.route && tutorial?.tabId) {
      localStorage.setItem('tutorial_pending_start', JSON.stringify({
        featureId,
        tabId: tutorial.tabId
      }))

      window.dispatchEvent(new CustomEvent('tutorial-navigate', {
        detail: { featureId, tabId: tutorial.tabId }
      }))

      toast({
        title: 'Rehber başlatılıyor',
        description: 'İlgili sayfaya yönlendiriliyorsunuz...'
      })
    } else {
      startTutorial(featureId)
      toast({
        title: 'Rehber başlatıldı',
        description: 'Adımları takip ederek özelliği keşfedin.'
      })
    }
  }

  const handleResetTutorial = (featureId: string, title: string) => {
    tutorialStorage.resetTutorial(featureId)
    setRefreshKey(prev => prev + 1)
    toast({
      title: 'Rehber sıfırlandı',
      description: `"${title}" rehberi tekrar gösterilecek.`
    })
  }

  const handleResetAll = () => {
    tutorialStorage.resetAllTutorials()
    setRefreshKey(prev => prev + 1)
    toast({
      title: 'Tüm rehberler sıfırlandı',
      description: 'Tüm rehberler tekrar gösterilecek.'
    })
  }

  const getStatusBadge = (featureId: string) => {
    const state = tutorialStorage.getState(featureId)

    switch (state.status) {
      case 'never_shown':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Görülmedi
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-500">
            <CheckCircle2 className="w-3 h-3" />
            Tamamlandı
          </Badge>
        )
      case 'skipped':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Atlandı
          </Badge>
        )
      case 'disabled':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <Ban className="w-3 h-3" />
            Devre Dışı
          </Badge>
        )
      case 'shown':
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Play className="w-3 h-3" />
            Devam Ediyor
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 pb-20">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <CardTitle>Rehberler & İpuçları</CardTitle>
          </div>
          <CardDescription>
            Uygulamanın özelliklerini keşfetmek için adım adım rehberler
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {tutorials.length} rehber mevcut
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Tümünü Sıfırla
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Tüm rehberleri sıfırla?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bu işlem tüm rehberlerin durumunu sıfırlayacak ve hepsi tekrar gösterilecek.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>İptal</AlertDialogCancel>
                  <AlertDialogAction onClick={handleResetAll}>
                    Sıfırla
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {tutorials.map((tutorial) => (
          <Card key={tutorial.featureId}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{tutorial.title}</h3>
                    {getStatusBadge(tutorial.featureId)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {tutorial.steps.length} adım
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleStartTutorial(tutorial.featureId)}
                    className="gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Başlat
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Rehberi sıfırla?</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{tutorial.title}" rehberinin durumu sıfırlanacak ve tekrar gösterilecek.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleResetTutorial(tutorial.featureId, tutorial.title)}
                        >
                          Sıfırla
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">İpuçları</h4>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Her rehber ilgili özelliğe ilk girişte otomatik başlar</li>
              <li>"Başlat" butonuna bastığınızda ilgili sayfaya yönlendirilirsiniz</li>
              <li>"Atla" butonuna dokunarak rehberi atlayabilirsiniz</li>
              <li>"Devam" butonuna dokunarak sonraki adıma geçersiniz</li>
              <li>"Bir daha gösterme" seçeneği ile rehberi kalıcı kapatabilirsiniz</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
