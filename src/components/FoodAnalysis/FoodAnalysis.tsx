
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import AnalysisTypeSelection from './AnalysisTypeSelection'
import MealTypeSelection from './MealTypeSelection'
import QuickAnalysisResult from './QuickAnalysisResult'
import DetailedAnalysisForm from './DetailedAnalysisForm'
import ManualFoodEntry from './ManualFoodEntry'
import AIVerification from './AIVerification'
import MealSelectionAfterAnalysis from './MealSelectionAfterAnalysis'
import NativeCameraCapture from './NativeCameraCapture'
import { Capacitor } from '@capacitor/core'

type AnalysisStep = 'camera' | 'analysis-type' | 'meal-type' | 'quick-result' | 'detailed-form' | 'manual-entry' | 'meal-selection' | 'ai-verification'

interface FoodAnalysisProps {
  onMealAdded: () => void
  onBack: () => void
}

export default function FoodAnalysis({ onMealAdded, onBack }: FoodAnalysisProps) {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('camera')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [analysisType, setAnalysisType] = useState<'quick' | 'detailed' | null>(null)
  const [selectedMealType, setSelectedMealType] = useState<string>('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [detectedFoods, setDetectedFoods] = useState<any[]>([])
  const [finalMealType, setFinalMealType] = useState<string>('')
  const [detailedFormData, setDetailedFormData] = useState<any>(null)

  const isNative = Capacitor.isNativePlatform()

  const handleImageCaptured = (imageUrl: string) => {
    console.log('Image captured:', imageUrl.substring(0, 50) + '...')
    setCapturedImage(imageUrl)
    setCurrentStep('analysis-type')
  }

  const handleAnalysisTypeSelected = (type: 'quick' | 'detailed' | 'manual') => {
    console.log('Analysis type selected:', type)
    if (type === 'manual') {
      setCurrentStep('manual-entry')
    } else {
      setAnalysisType(type)
      setCurrentStep('meal-type')
    }
  }

  const handleMealTypeSelected = (mealType: string) => {
    console.log('Meal type selected:', mealType)
    setSelectedMealType(mealType)
    if (analysisType === 'quick') {
      setCurrentStep('quick-result')
    } else {
      setCurrentStep('detailed-form')
    }
  }

  const handleQuickAnalysisComplete = (foods: any[]) => {
    console.log('Quick analysis completed with foods:', foods)
    setDetectedFoods(foods)
    setCurrentStep('meal-selection')
  }

  const handleDetailedAnalysisComplete = (data: any) => {
    console.log('Detailed analysis completed:', data)
    setDetailedFormData(data)
    // Start detailed analysis with the form data
    setCurrentStep('quick-result') // Use same result component but with detailed data
  }

  const handleManualEntryComplete = async (foods: any[]) => {
    console.log('Manual entry completed:', foods)
    setDetectedFoods(foods)
    setCurrentStep('meal-selection')
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

  const handleVerificationComplete = () => {
    console.log('Verification completed')
    onMealAdded()
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'camera':
        onBack()
        break
      case 'analysis-type':
        setCurrentStep('camera')
        break
      case 'meal-type':
        setCurrentStep('analysis-type')
        break
      case 'quick-result':
      case 'detailed-form':
        setCurrentStep('meal-type')
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
      case 'meal-type':
        return 'Öğün Türü'
      case 'quick-result':
        return 'AI Analiz Sonucu'
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
          />
        )}

        {currentStep === 'analysis-type' && capturedImage && (
          <AnalysisTypeSelection
            onSelectType={handleAnalysisTypeSelected}
            onBack={handleBack}
            capturedImage={capturedImage}
          />
        )}

        {currentStep === 'meal-type' && (
          <MealTypeSelection
            onSubmit={handleMealTypeSelected}
            onBack={handleBack}
          />
        )}

        {currentStep === 'quick-result' && capturedImage && (
          <QuickAnalysisResult
            capturedImage={capturedImage}
            mealType={selectedMealType}
            onSave={handleQuickAnalysisComplete}
            onRetry={() => setCurrentStep('camera')}
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
            mealType={selectedMealType}
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
          <AIVerification
            analysisResult={analysisResult}
            capturedImage={capturedImage}
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
