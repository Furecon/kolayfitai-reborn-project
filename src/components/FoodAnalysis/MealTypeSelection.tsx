
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Check, ArrowLeft } from 'lucide-react'

interface MealTypeSelectionProps {
  onSubmit: (mealType: string) => void
  onBack: () => void
  loading?: boolean
}

export default function MealTypeSelection({ onSubmit, onBack, loading }: MealTypeSelectionProps) {
  const [selectedMealType, setSelectedMealType] = useState('kahvaltı')

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
          <h1 className="text-xl font-semibold text-black">Öğün Türü Seç</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-black">Bu hangi öğününüz?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meal-type">Öğün Türü</Label>
              <Select value={selectedMealType} onValueChange={setSelectedMealType}>
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kahvaltı">Kahvaltı</SelectItem>
                  <SelectItem value="öğle">Öğle Yemeği</SelectItem>
                  <SelectItem value="akşam">Akşam Yemeği</SelectItem>
                  <SelectItem value="atıştırmalık">Atıştırmalık</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => onSubmit(selectedMealType)}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <Check className="mr-2 h-4 w-4" />
              {loading ? 'Kaydediliyor...' : 'Öğünü Kaydet'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
