
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { ArrowLeft, Check } from 'lucide-react'

interface DetailedAnalysisData {
  foodSource: 'homemade' | 'packaged' | ''
  hiddenIngredients: string
  noHiddenIngredients: boolean
  cookingMethod: 'boiled' | 'oven' | 'grilled' | 'fried' | 'steamed' | 'raw' | 'unsure' | ''
  consumedAmount: string
  mealType: 'single' | 'mixed' | ''
}

interface DetailedAnalysisFormProps {
  onSubmit: (data: DetailedAnalysisData) => void
  onBack: () => void
  loading?: boolean
}

export default function DetailedAnalysisForm({ onSubmit, onBack, loading }: DetailedAnalysisFormProps) {
  const [formData, setFormData] = useState<DetailedAnalysisData>({
    foodSource: '',
    hiddenIngredients: '',
    noHiddenIngredients: false,
    cookingMethod: '',
    consumedAmount: '',
    mealType: ''
  })

  const [customAmount, setCustomAmount] = useState('')
  const [useCustomAmount, setUseCustomAmount] = useState(false)

  const handleSubmit = () => {
    const finalData = {
      ...formData,
      consumedAmount: useCustomAmount ? customAmount : formData.consumedAmount
    }
    onSubmit(finalData)
  }

  const isFormValid = formData.foodSource && formData.cookingMethod && 
                     (formData.consumedAmount || customAmount) && formData.mealType

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-black">Yemek Detayları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Soru 1: Yemek Türü */}
            <div className="space-y-3">
              <Label className="text-black font-medium">1. Bu yemek evde mi yapıldı, dışarıdan mı alındı?</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="homemade"
                    checked={formData.foodSource === 'homemade'}
                    onCheckedChange={() => setFormData({...formData, foodSource: 'homemade'})}
                  />
                  <Label htmlFor="homemade" className="text-gray-700">Ev yapımı</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="packaged"
                    checked={formData.foodSource === 'packaged'}
                    onCheckedChange={() => setFormData({...formData, foodSource: 'packaged'})}
                  />
                  <Label htmlFor="packaged" className="text-gray-700">Paketli / dışarıdan hazır</Label>
                </div>
              </div>
            </div>

            {/* Soru 2: Gizli İçerikler */}
            <div className="space-y-3">
              <Label className="text-black font-medium">2. Yemeğin içeriği hakkında yapay zekanın doğrudan göremeyeceği unsurlar varsa belirtin:</Label>
              <p className="text-sm text-gray-600">Yağ, tuz, şeker, sos vb. kullanıldı mı?</p>
              <Textarea
                placeholder="Ek malzemeler varsa buraya yazın..."
                value={formData.hiddenIngredients}
                onChange={(e) => setFormData({...formData, hiddenIngredients: e.target.value})}
                disabled={formData.noHiddenIngredients}
                className="min-h-20"
              />
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="no-hidden"
                  checked={formData.noHiddenIngredients}
                  onCheckedChange={(checked) => {
                    setFormData({
                      ...formData, 
                      noHiddenIngredients: checked as boolean,
                      hiddenIngredients: checked ? '' : formData.hiddenIngredients
                    })
                  }}
                />
                <Label htmlFor="no-hidden" className="text-gray-700">Hiçbiri / Emin değilim</Label>
              </div>
            </div>

            {/* Soru 3: Pişirme Yöntemi */}
            <div className="space-y-3">
              <Label className="text-black font-medium">3. Pişirme yöntemi nedir?</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 'boiled', label: 'Haşlama' },
                  { value: 'oven', label: 'Fırın' },
                  { value: 'grilled', label: 'Izgara' },
                  { value: 'fried', label: 'Kızartma' },
                  { value: 'steamed', label: 'Buharda' },
                  { value: 'raw', label: 'Çiğ / Karışık' },
                  { value: 'unsure', label: 'Emin değilim' }
                ].map((method) => (
                  <div key={method.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={method.value}
                      checked={formData.cookingMethod === method.value}
                      onCheckedChange={() => setFormData({...formData, cookingMethod: method.value as any})}
                    />
                    <Label htmlFor={method.value} className="text-gray-700">{method.label}</Label>
                  </div>
                ))}
              </div>
              {formData.cookingMethod === 'unsure' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    💡 Emin değilseniz, yapay zeka fotoğrafı analiz ederek pişirme yöntemini tahmin edecek.
                  </p>
                </div>
              )}
            </div>

            {/* Soru 4: Tüketim Miktarı */}
            <div className="space-y-3">
              <Label className="text-black font-medium">4. Ne kadar tükettiniz?</Label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: '1 porsiyon', label: '1 porsiyon' },
                    { value: 'Yarım porsiyon', label: 'Yarım porsiyon' },
                    { value: '100 gram', label: '100 gram' },
                    { value: '150 gram', label: '150 gram' }
                  ].map((amount) => (
                    <div key={amount.value} className="flex items-center space-x-2">
                      <Checkbox 
                        id={amount.value}
                        checked={formData.consumedAmount === amount.value && !useCustomAmount}
                        onCheckedChange={() => {
                          setFormData({...formData, consumedAmount: amount.value})
                          setUseCustomAmount(false)
                          setCustomAmount('')
                        }}
                      />
                      <Label htmlFor={amount.value} className="text-gray-700">{amount.label}</Label>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="custom-amount"
                      checked={useCustomAmount}
                      onCheckedChange={(checked) => {
                        setUseCustomAmount(checked as boolean)
                        if (checked) {
                          setFormData({...formData, consumedAmount: ''})
                        } else {
                          setCustomAmount('')
                        }
                      }}
                    />
                    <Label htmlFor="custom-amount" className="text-gray-700">Manuel giriş</Label>
                  </div>
                  {useCustomAmount && (
                    <Input
                      placeholder="Miktarı kendin yaz (örneğin: 230 gram, 1,5 porsiyon)"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Soru 5: Yemek Tipi */}
            <div className="space-y-3">
              <Label className="text-black font-medium">5. Bu yemek tek bir ürün mü yoksa karışık bir tabak mı?</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="single"
                    checked={formData.mealType === 'single'}
                    onCheckedChange={() => setFormData({...formData, mealType: 'single'})}
                  />
                  <Label htmlFor="single" className="text-gray-700">Tek tip yemek (örneğin: çorba, tek porsiyon pilav)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="mixed"
                    checked={formData.mealType === 'mixed'}
                    onCheckedChange={() => setFormData({...formData, mealType: 'mixed'})}
                  />
                  <Label htmlFor="mixed" className="text-gray-700">Karışık tabak (örneğin: et + pilav + salata)</Label>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white mt-6"
            >
              <Check className="mr-2 h-4 w-4" />
              {loading ? 'Analiz Ediliyor...' : 'Detaylı Analizi Başlat'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
