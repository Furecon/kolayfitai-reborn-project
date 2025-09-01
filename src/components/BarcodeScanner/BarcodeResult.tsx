import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { 
  ArrowLeft, 
  QrCode, 
  AlertCircle, 
  CheckCircle, 
  Edit3, 
  Sparkles,
  Heart,
  Plus,
  Package
} from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/components/Auth/AuthProvider'
import { useToast } from '@/hooks/use-toast'

interface BarcodeResultProps {
  barcode: string
  onBack: () => void
  onMealSaved: () => void
  onManualEntry: () => void
}

interface ProductData {
  product_name: string
  brands?: string
  serving_size?: string
  nutriments: {
    'energy-kcal_100g': number
    'proteins_100g': number
    'carbohydrates_100g': number
    'fat_100g': number
    'fiber_100g': number
    'sugars_100g': number
    'sodium_100g': number
  }
}

const PORTION_OPTIONS = [
  { label: '1 porsiyon', value: 1, unit: 'porsiyon' },
  { label: '100g', value: 100, unit: 'g' },
  { label: '150g', value: 150, unit: 'g' }
]

const MEAL_TYPES = [
  { value: 'kahvaltı', label: 'Kahvaltı' },
  { value: 'öğle', label: 'Öğle Yemeği' },
  { value: 'akşam', label: 'Akşam Yemeği' },
  { value: 'atıştırmalık', label: 'Atıştırmalık' }
]

export function BarcodeResult({ barcode, onBack, onMealSaved, onManualEntry }: BarcodeResultProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [productFound, setProductFound] = useState(false)
  const [productData, setProductData] = useState<ProductData | null>(null)
  const [source, setSource] = useState<string>('')
  
  // Form state
  const [selectedPortion, setSelectedPortion] = useState(100)
  const [portionUnit, setPortionUnit] = useState('g')
  const [customPortion, setCustomPortion] = useState('')
  const [mealType, setMealType] = useState('öğle')
  const [addToFavorites, setAddToFavorites] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (barcode) {
      lookupProduct()
    }
  }, [barcode])

  const lookupProduct = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('barcode-lookup', {
        body: { barcode }
      })

      if (error) throw error

      if (data.found) {
        setProductFound(true)
        setProductData(data.product)
        setSource(data.source)
        
        // Check if user has this as favorite to pre-fill preferred serving
        if (user) {
          const { data: favorite } = await supabase
            .from('favorite_products')
            .select('preferred_serving_size, preferred_serving_unit')
            .eq('user_id', user.id)
            .eq('barcode', barcode)
            .maybeSingle()
          
          if (favorite) {
            setSelectedPortion(favorite.preferred_serving_size)
            setPortionUnit(favorite.preferred_serving_unit)
          }
        }
      } else {
        setProductFound(false)
      }
    } catch (error) {
      console.error('Product lookup error:', error)
      toast({
        title: "Hata",
        description: "Ürün bilgileri alınırken hata oluştu.",
        variant: "destructive"
      })
      setProductFound(false)
    } finally {
      setLoading(false)
    }
  }

  const calculateNutrition = () => {
    if (!productData) return { calories: 0, protein: 0, carbs: 0, fat: 0 }
    
    const portionAmount = customPortion ? Number(customPortion) : selectedPortion
    const multiplier = portionUnit === 'porsiyon' ? 1 : portionAmount / 100
    
    return {
      calories: Math.round((productData.nutriments['energy-kcal_100g'] || 0) * multiplier),
      protein: Math.round((productData.nutriments['proteins_100g'] || 0) * multiplier * 10) / 10,
      carbs: Math.round((productData.nutriments['carbohydrates_100g'] || 0) * multiplier * 10) / 10,
      fat: Math.round((productData.nutriments['fat_100g'] || 0) * multiplier * 10) / 10,
      fiber: Math.round((productData.nutriments['fiber_100g'] || 0) * multiplier * 10) / 10,
      sugar: Math.round((productData.nutriments['sugars_100g'] || 0) * multiplier * 10) / 10,
      sodium: Math.round((productData.nutriments['sodium_100g'] || 0) * multiplier)
    }
  }

  const handleSave = async () => {
    if (!user || !productData) return

    setIsSaving(true)
    try {
      const nutrition = calculateNutrition()
      const portionAmount = customPortion ? Number(customPortion) : selectedPortion

      // Create food item
      const foodItem = {
        name: productData.product_name,
        nameEn: productData.product_name,
        brand: productData.brands || '',
        barcode: barcode,
        estimatedAmount: `${portionAmount} ${portionUnit}`,
        totalNutrition: nutrition,
        source: 'barcode'
      }

      // Create meal log
      const mealLogData = {
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        meal_type: mealType,
        meal_name: productData.product_name,
        amount_value: portionAmount,
        amount_unit: portionUnit,
        food_items: [foodItem],
        total_calories: nutrition.calories,
        total_protein: nutrition.protein,
        total_carbs: nutrition.carbs,
        total_fat: nutrition.fat,
        total_fiber: nutrition.fiber,
        total_sugar: nutrition.sugar,
        total_sodium: nutrition.sodium,
        estimation_source: 'barcode',
        confidence: 0.95 // High confidence for barcode scans
      }

      const { error } = await supabase.from('meal_logs').insert([mealLogData])
      if (error) throw error

      // Add to favorites if requested
      if (addToFavorites) {
        await supabase.from('favorite_products').upsert({
          user_id: user.id,
          barcode: barcode,
          product_name: productData.product_name,
          brand: productData.brands || '',
          preferred_serving_size: portionAmount,
          preferred_serving_unit: portionUnit
        }, { onConflict: 'user_id,barcode' })
      }

      toast({
        title: "Başarılı!",
        description: "Ürün öğün kaydınıza eklendi.",
      })
      
      onMealSaved()
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: "Hata",
        description: "Ürün kaydedilirken hata oluştu.",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Ürün bilgileri kontrol ediliyor...</p>
        </div>
      </div>
    )
  }

  if (!productFound) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto space-y-6 pt-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
            <h1 className="text-xl font-semibold">Barkod Sonucu</h1>
          </div>

          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Ürün Bulunamadı</h3>
                <p className="text-muted-foreground mt-2">
                  Bu barkoda ait ürün bilgileri bulunamadı.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Barkod: {barcode}
                </p>
              </div>
              <div className="space-y-2">
                <Button
                  onClick={onManualEntry}
                  className="w-full"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Manuel Bilgi Gir
                </Button>
                <p className="text-xs text-muted-foreground">
                  Ürün paketindeki besin tablosundan bilgileri girebilirsiniz
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const nutrition = calculateNutrition()

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-xl font-semibold">Ürün Bulundu</h1>
        </div>

        {/* Product Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              {productData?.product_name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {productData?.brands && (
                <p className="text-sm text-muted-foreground">
                  Marka: {productData.brands}
                </p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Barkod:</span>
                <span className="text-xs font-mono">{barcode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Kaynak:</span>
                <Badge variant="outline" className="text-xs">
                  {source === 'local' ? 'Yerel Veritabanı' : 'Open Food Facts'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Öğün Kategorisi</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={mealType} onValueChange={setMealType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Portion Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Miktar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Quick Options */}
            <div className="flex flex-wrap gap-2">
              {PORTION_OPTIONS.map((option) => (
                <Button
                  key={option.label}
                  variant={selectedPortion === option.value && portionUnit === option.unit ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedPortion(option.value)
                    setPortionUnit(option.unit)
                    setCustomPortion('')
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Custom Amount */}
            <div className="space-y-2">
              <Label>Manuel Miktar</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Miktar"
                  value={customPortion}
                  onChange={(e) => {
                    setCustomPortion(e.target.value)
                    if (e.target.value) {
                      setSelectedPortion(0) // Clear quick selection
                    }
                  }}
                  className="flex-1"
                />
                <Select value={portionUnit} onValueChange={setPortionUnit}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">gram</SelectItem>
                    <SelectItem value="porsiyon">porsiyon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Nutrition Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Besin Değerleri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span>Kalori:</span>
                <span className="font-medium">{nutrition.calories} kcal</span>
              </div>
              <div className="flex justify-between">
                <span>Protein:</span>
                <span className="font-medium">{nutrition.protein}g</span>
              </div>
              <div className="flex justify-between">
                <span>Karbonhidrat:</span>
                <span className="font-medium">{nutrition.carbs}g</span>
              </div>
              <div className="flex justify-between">
                <span>Yağ:</span>
                <span className="font-medium">{nutrition.fat}g</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2 text-center">
              {customPortion ? customPortion : selectedPortion} {portionUnit} için hesaplanan değerler
            </div>
          </CardContent>
        </Card>

        {/* Favorites Toggle */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Favorilere Ekle</span>
              </div>
              <Switch
                checked={addToFavorites}
                onCheckedChange={setAddToFavorites}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Bir sonraki sefer bu ürünü taradığınızda tercih ettiğiniz miktar otomatik gelecek.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isSaving || (!customPortion && !selectedPortion)}
          className="w-full bg-success hover:bg-success/90 text-success-foreground"
          size="lg"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-success-foreground mr-2"></div>
              Ekleniyor...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Öğüne Ekle
            </>
          )}
        </Button>
      </div>
    </div>
  )
}