import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Target, Activity, Ruler, Scale } from 'lucide-react'

export function ScreenshotOnboarding() {
  return (
    <div className="min-h-screen bg-background">
      {/* Progress Header */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-3">
          <ArrowLeft className="h-6 w-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Adım 6/9</span>
        </div>
        <Progress value={67} className="h-2" />
      </div>

      <div className="p-4 space-y-6">
        {/* Question */}
        <div className="text-center space-y-4 pt-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Target className="h-8 w-8 text-primary" />
          </div>
          
          <h1 className="text-2xl font-bold">
            Hedefiniz nedir?
          </h1>
          
          <p className="text-muted-foreground">
            Size en uygun kalori hedefini belirlemek için hedefinizi öğrenmek istiyoruz
          </p>
        </div>

        {/* Goal Options */}
        <div className="space-y-3 pt-4">
          <Button 
            variant="outline" 
            className="w-full h-16 flex items-center justify-start gap-4 p-4"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Scale className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-left">
              <div className="font-medium">Kilo Vermek</div>
              <div className="text-sm text-muted-foreground">Sağlıklı şekilde kilo kaybı</div>
            </div>
          </Button>

          <Button 
            variant="outline" 
            className="w-full h-16 flex items-center justify-start gap-4 p-4"
          >
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-left">
              <div className="font-medium">Kilomu Korumak</div>
              <div className="text-sm text-muted-foreground">Mevcut kiloyu sürdürmek</div>
            </div>
          </Button>

          <Button 
            className="w-full h-16 flex items-center justify-start gap-4 p-4 bg-primary text-primary-foreground"
          >
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <div className="text-left">
              <div className="font-medium">Kilo Almak</div>
              <div className="text-sm text-primary-foreground/80">Kas kütlesi artırmak</div>
            </div>
          </Button>
        </div>

        {/* Info Card */}
        <Card className="p-4 bg-muted/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-sm font-bold">💡</span>
            </div>
            <div className="space-y-1">
              <h4 className="font-medium text-sm">
                Neden hedefinizi soruyoruz?
              </h4>
              <p className="text-sm text-muted-foreground">
                Hedefinize göre günlük kalori ihtiyacınızı hesaplıyor ve size özel beslenme planı hazırlıyoruz.
              </p>
            </div>
          </div>
        </Card>

        {/* Previous Steps Preview */}
        <Card className="p-4">
          <h3 className="font-medium mb-3">Girdiğiniz Bilgiler</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Yaş:</span>
              <span>28</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cinsiyet:</span>
              <span>Kadın</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Boy:</span>
              <span>165 cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kilo:</span>
              <span>62 kg</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <Button className="w-full h-12" size="lg">
          Devam Et
        </Button>
      </div>
    </div>
  )
}