import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Check, Camera, Sparkles } from 'lucide-react'

export function ScreenshotFoodAnalysis() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
        <ArrowLeft className="h-6 w-6" />
        <h1 className="text-xl font-semibold">Yemek Analizi</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Photo Section */}
        <Card className="p-4">
          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-red-500 opacity-80"></div>
            <div className="relative z-10 text-center text-white">
              <Camera className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">Izgara Tavuk Salatası</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-medium">AI Analizi Tamamlandı</span>
            <Check className="h-5 w-5 text-green-500" />
          </div>
        </Card>

        {/* Analysis Results */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Besin Değerleri</h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-primary/5 rounded-lg">
              <div className="text-3xl font-bold text-primary">420</div>
              <div className="text-sm text-muted-foreground">Kalori</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-lg font-semibold">250g</div>
              <div className="text-sm text-muted-foreground">Porsiyon</div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Protein</span>
                <span className="text-sm font-semibold">35g</span>
              </div>
              <Progress value={88} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Günlük hedefin %28'i</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Karbonhidrat</span>
                <span className="text-sm font-semibold">18g</span>
              </div>
              <Progress value={45} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Günlük hedefin %9'u</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Yağ</span>
                <span className="text-sm font-semibold">22g</span>
              </div>
              <Progress value={65} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">Günlük hedefin %33'ü</p>
            </div>
          </div>
        </Card>

        {/* Detected Ingredients */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Tespit Edilen Malzemeler</h3>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Tavuk göğsü</Badge>
            <Badge variant="secondary">Karışık yeşillik</Badge>
            <Badge variant="secondary">Cherry domates</Badge>
            <Badge variant="secondary">Avokado</Badge>
            <Badge variant="secondary">Zeytinyağı</Badge>
            <Badge variant="secondary">Limon sosu</Badge>
          </div>
        </Card>

        {/* AI Insights */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-primary">AI Önerisi</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Mükemmel bir protein kaynağı! Bu öğün günlük protein ihtiyacınızın büyük bir kısmını karşılıyor. 
            Hafif ve sağlıklı bir seçim.
          </p>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            <span>Hedefinizle uyumlu</span>
          </div>
        </Card>

        {/* Meal Type Selection */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Öğün Türü</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12">Kahvaltı</Button>
            <Button className="h-12">Öğle Yemeği</Button>
            <Button variant="outline" className="h-12">Akşam Yemeği</Button>
            <Button variant="outline" className="h-12">Atıştırmalık</Button>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button className="w-full h-12" size="lg">
            Öğünü Kaydet
          </Button>
          <Button variant="outline" className="w-full h-12" size="lg">
            Tekrar Analiz Et
          </Button>
        </div>
      </div>
    </div>
  )
}