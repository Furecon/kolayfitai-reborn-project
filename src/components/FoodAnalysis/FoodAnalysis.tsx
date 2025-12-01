
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigation } from '@/hooks/useNavigation'
import AnalysisTypeSelection from './AnalysisTypeSelection'
import MealTypeSelection from './MealTypeSelection'
import QuickAnalysisResult from './QuickAnalysisResult'
import DetailedAnalysisForm from './DetailedAnalysisForm'
import ManualFoodEntry from './ManualFoodEntry'
import { EnhancedAIVerification } from './EnhancedAIVerification'
import MealSelectionAfterAnalysis from './MealSelectionAfterAnalysis'
import NativeCameraCapture from './NativeCameraCapture'

type AnalysisStep = 'camera' | 'analysis-type' | 'quick-result' | 'detailed-form' | 'manual-entry' | 'meal-selection' | 'ai-verification'

interface FoodAnalysisProps {
  onMealAdded: () => void
  onBack: () => void
  initialImage?: string | null
  skipCameraStep?: boolean
  autoOpenCamera?: boolean
  onUpgradeClick?: () => void
}

export default function FoodAnalysis({ onMealAdded, onBack, initialImage = null, skipCameraStep = false, autoOpenCamera = false, onUpgradeClick }: FoodAnalysisProps) {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>(skipCameraStep && initialImage ? 'analysis-type' : 'camera')
  const [capturedImage, setCapturedImage] = useState<string | null>(initialImage)
  const [capturedImageHD, setCapturedImageHD] = useState<string | null>(initialImage)
  const [analysisType, setAnalysisType] = useState<'quick' | 'detailed' | null>(null)
  const [selectedMealType, setSelectedMealType] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [detectedFoods, setDetectedFoods] = useState<any[]>([])
  const [finalMealType, setFinalMealType] = useState<string>('')
  const [detailedFormData, setDetailedFormData] = useState<any>(null)

  // Enhanced navigation with hardware back button support
  const { goBack } = useNavigation({
    enableHardwareBackButton: true,
    customBackHandler: () => {
      handleBack()
    }
  })


  const handleImageCaptured = async (imageUrl: string) => {
    console.log('Image captured:', imageUrl.substring(0, 50) + '...')

    // Import resize function dynamically
    const { resizeImage } = await import('@/lib/imageResize')

    // Create 512px version for quick analysis
    const resizedImage = await resizeImage(imageUrl, 512, 0.8)
    setCapturedImage(resizedImage)

    // Create 1024px version for detailed analysis
    const hdImage = await resizeImage(imageUrl, 1024, 0.85)
    setCapturedImageHD(hdImage)

    setCurrentStep('analysis-type')
  }

  const handleAnalysisTypeSelected = (type: 'quick' | 'detailed' | 'manual') => {
    console.log('Analysis type selected:', type)
    if (type === 'manual') {
      setCurrentStep('manual-entry')
    } else {
      setAnalysisType(type)
      if (type === 'quick') {
        setCurrentStep('quick-result')
      } else {
        setCurrentStep('detailed-form')
      }
    }
  }

  // Remove this function as we no longer select meal type before analysis

  const handleQuickAnalysisComplete = (foods: any[]) => {
    console.log('Quick analysis completed with foods:', foods)
    // Meal is already saved in QuickAnalysisResult, just trigger callback
    onMealAdded()
  }

  const handleDetailedAnalysisComplete = (data: any) => {
    console.log('Detailed analysis completed:', data)
    setDetailedFormData(data)
    // Start detailed analysis with the form data
    setCurrentStep('quick-result') // Use same result component but with detailed data
  }

  const handleManualEntryComplete = async (foods: any[]) => {
    console.log('Manual entry completed:', foods)
    // Manual entry now also saves directly, just trigger callback
    onMealAdded()
  }

  const handleMealSelectionComplete = (mealType: string, foods: any[]) => {
    console.log('Meal selection completed:', { mealType, foods })
    setFinalMealType(mealType)
    setDetectedFoods(foods)
    
    // Create analysis result for verification
    const analysisResult = {
      detectedFoods: foods,
      confidence: 0.85, // Default confidence for manual/processed foods
      suggestions: 'Analiz tamamlandı. Besin değerlerini kontrol ediniz.',
      mealType: mealType
    }
    setAnalysisResult(analysisResult)
    setCurrentStep('ai-verification')
  }

  const handleVerificationComplete = async (foods: any[]) => {
    console.log('Verification completed, saving meal with foods:', foods)
    console.log('Final meal type:', finalMealType)
    
    try {
      // Save the meal to database
      const { supabase } = await import('@/integrations/supabase/client')
      
      const totalNutrition = foods.reduce((total, food) => ({
        totalCalories: total.totalCalories + (food.total_nutrition?.calories || 0),
        totalProtein: total.totalProtein + (food.total_nutrition?.protein || 0),
        totalCarbs: total.totalCarbs + (food.total_nutrition?.carbs || 0),
        totalFat: total.totalFat + (food.total_nutrition?.fat || 0),
        totalFiber: total.totalFiber + (food.total_nutrition?.fiber || 0),
        totalSugar: total.totalSugar + (food.total_nutrition?.sugar || 0),
        totalSodium: total.totalSodium + (food.total_nutrition?.sodium || 0)
      }), { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0, totalFiber: 0, totalSugar: 0, totalSodium: 0 })

      const { data: user } = await supabase.auth.getUser()
      if (!user?.user?.id) {
        throw new Error('User not authenticated')
      }

      const mealData = {
        user_id: user.user.id,
        meal_type: finalMealType,
        food_items: foods.map(food => ({
          name: food.name,
          nameEn: food.nameEn || food.name,
          estimatedAmount: `${food.estimated_amount || 100} ${food.portion_type || 'gram'}`,
          nutritionPer100g: food.nutrition_per_100g,
          totalNutrition: food.total_nutrition
        })),
        total_calories: totalNutrition.totalCalories,
        total_protein: totalNutrition.totalProtein,
        total_carbs: totalNutrition.totalCarbs,
        total_fat: totalNutrition.totalFat,
        total_fiber: totalNutrition.totalFiber,
        total_sugar: totalNutrition.totalSugar,
        total_sodium: totalNutrition.totalSodium,
        photo_url: capturedImage,
        date: new Date().toISOString().split('T')[0]
      }

      const { error } = await supabase
        .from('meal_logs')
        .insert([mealData])

      if (error) {
        console.error('Error saving meal:', error)
        throw error
      }

      console.log('Meal saved successfully')
      // Add toast notification
      const { toast } = await import('@/hooks/use-toast')
      toast({
        title: "Başarılı!",
        description: "Öğün kaydedildi."
      })
      onMealAdded()
    } catch (error) {
      console.error('Failed to save meal:', error)
      // Show error toast
      const { toast } = await import('@/hooks/use-toast')
      toast({
        title: "Hata",
        description: "Öğün kaydedilirken hata oluştu.",
        variant: "destructive"
      })
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'camera':
        onBack()
        break
      case 'analysis-type':
        // User has already taken a photo, go back to dashboard instead of camera
        onBack()
        break
      case 'quick-result':
      case 'detailed-form':
        setCurrentStep('analysis-type')
        break
      case 'manual-entry':
        setCurrentStep('analysis-type')
        break
      case 'meal-selection':
        if (analysisType === 'quick') {
          setCurrentStep('quick-result')
        } else if (analysisType === 'detailed') {
          setCurrentStep('detailed-form')
        } else {
          setCurrentStep('manual-entry')
        }
        break
      case 'ai-verification':
        setCurrentStep('meal-selection')
        break
      default:
        setCurrentStep('camera')
    }
  }

  const getStepTitle = () => {
    switch (currentStep) {
      case 'camera':
        return 'Yemek Fotoğrafı'
      case 'analysis-type':
        return 'Analiz Türü'
      case 'quick-result':
        return 'Ai Analiz Sonucu'
      case 'detailed-form':
        return 'Detaylı Analiz'
      case 'manual-entry':
        return 'Manuel Giriş'
      case 'meal-selection':
        return 'Öğün Seçimi'
      case 'ai-verification':
        return 'Sonuç Doğrulama'
      default:
        return 'Yemek Analizi'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 z-10">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-gray-600 h-10 px-2"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Geri
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">
            {getStepTitle()}
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="px-3 sm:px-4 py-4 sm:py-6">
        {currentStep === 'camera' && (
          <NativeCameraCapture
            onImageCaptured={handleImageCaptured}
            onFileUploaded={handleImageCaptured}
            autoOpenCamera={autoOpenCamera}
          />
        )}

        {currentStep === 'analysis-type' && capturedImage && (
          <AnalysisTypeSelection
            onSelectType={handleAnalysisTypeSelected}
            onBack={handleBack}
            capturedImage={capturedImage}
            onRetakePhoto={() => setCurrentStep('camera')}
          />
        )}


        {currentStep === 'quick-result' && capturedImage && (
          <QuickAnalysisResult
            capturedImage={analysisType === 'detailed' && capturedImageHD ? capturedImageHD : capturedImage}
            mealType=""
            onSave={handleQuickAnalysisComplete}
            onRetry={() => setCurrentStep('analysis-type')}
            analysisType={analysisType || 'quick'}
            detailsData={detailedFormData}
            onUpgradeClick={onUpgradeClick}
          />
        )}

        {currentStep === 'detailed-form' && (
          <DetailedAnalysisForm
            onSubmit={handleDetailedAnalysisComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === 'manual-entry' && (
          <ManualFoodEntry
            mealType=""
            onSave={handleManualEntryComplete}
            onBack={handleBack}
            loading={false}
          />
        )}

        {currentStep === 'meal-selection' && (
          <MealSelectionAfterAnalysis
            detectedFoods={detectedFoods}
            onSubmit={handleMealSelectionComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === 'ai-verification' && (
          <EnhancedAIVerification
            analysisResult={{
              foods: analysisResult?.detectedFoods?.map((food: any) => ({
                name: food.name,
                estimated_amount: food.estimatedAmount || 100,
                portion_type: 'gram',
                nutrition_per_100g: food.nutritionPer100g || {
                  calories: food.totalNutrition?.calories || 0,
                  protein: food.totalNutrition?.protein || 0,
                  carbs: food.totalNutrition?.carbs || 0,
                  fat: food.totalNutrition?.fat || 0,
                  fiber: food.totalNutrition?.fiber || 0,
                  sugar: food.totalNutrition?.sugar || 0,
                  sodium: food.totalNutrition?.sodium || 0
                },
                total_nutrition: food.totalNutrition || {
                  calories: 0,
                  protein: 0,
                  carbs: 0,
                  fat: 0,
                  fiber: 0,
                  sugar: 0,
                  sodium: 0
                }
              })) || [],
              confidence: analysisResult?.confidence || 0.85,
              suggestions: analysisResult?.suggestions,
              meal_type: analysisResult?.mealType || finalMealType
            }}
            image={capturedImage || ''}
            onConfirm={handleVerificationComplete}
            onEdit={() => setCurrentStep('manual-entry')}
            onManualEntry={() => setCurrentStep('manual-entry')}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  )
}
