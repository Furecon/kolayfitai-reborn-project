
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import AnalysisTypeSelection from './AnalysisTypeSelection'
import MealTypeSelection from './MealTypeSelection'
import QuickAnalysisResult from './QuickAnalysisResult'
import DetailedAnalysisForm from './DetailedAnalysisForm'
import ManualFoodEntry from './ManualFoodEntry'
import AIVerification from './AIVerification'
import NativeCameraCapture from './NativeCameraCapture'
import { Capacitor } from '@capacitor/core'

type AnalysisStep = 'camera' | 'analysis-type' | 'meal-type' | 'quick-result' | 'detailed-form' | 'manual-entry' | 'ai-verification'

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

  const isNative = Capacitor.isNativePlatform()

  const handleImageCaptured = (imageUrl: string) => {
    setCapturedImage(imageUrl)
    setCurrentStep('analysis-type')
  }

  const handleAnalysisTypeSelected = (type: 'quick' | 'detailed') => {
    setAnalysisType(type)
    setCurrentStep('meal-type')
  }

  const handleMealTypeSelected = (mealType: string) => {
    setSelectedMealType(mealType)
    if (analysisType === 'quick') {
      setCurrentStep('quick-result')
    } else {
      setCurrentStep('detailed-form')
    }
  }

  const handleQuickAnalysisComplete = (result: any) => {
    setAnalysisResult(result)
    setCurrentStep('ai-verification')
  }

  const handleDetailedAnalysisComplete = (result: any) => {
    setAnalysisResult(result)
    setCurrentStep('ai-verification')
  }

  const handleManualEntryComplete = (result: any) => {
    setAnalysisResult(result)
    setCurrentStep('ai-verification')
  }

  const handleVerificationComplete = () => {
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
      case 'ai-verification':
        if (analysisType === 'quick') {
          setCurrentStep('quick-result')
        } else {
          setCurrentStep('detailed-form')
        }
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
        return 'Hızlı Analiz'
      case 'detailed-form':
        return 'Detaylı Analiz'
      case 'manual-entry':
        return 'Manuel Giriş'
      case 'ai-verification':
        return 'AI Doğrulama'
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

        {currentStep === 'analysis-type' && (
          <AnalysisTypeSelection
            onAnalysisTypeSelected={handleAnalysisTypeSelected}
            onManualEntry={() => setCurrentStep('manual-entry')}
          />
        )}

        {currentStep === 'meal-type' && (
          <MealTypeSelection
            onMealTypeSelected={handleMealTypeSelected}
          />
        )}

        {currentStep === 'quick-result' && capturedImage && (
          <QuickAnalysisResult
            image={capturedImage}
            mealType={selectedMealType}
            onAnalysisComplete={handleQuickAnalysisComplete}
          />
        )}

        {currentStep === 'detailed-form' && capturedImage && (
          <DetailedAnalysisForm
            image={capturedImage}
            mealType={selectedMealType}
            onAnalysisComplete={handleDetailedAnalysisComplete}
          />
        )}

        {currentStep === 'manual-entry' && (
          <ManualFoodEntry
            mealType={selectedMealType}
            onEntryComplete={handleManualEntryComplete}
          />
        )}

        {currentStep === 'ai-verification' && analysisResult && (
          <AIVerification
            analysisResult={analysisResult}
            onVerificationComplete={handleVerificationComplete}
          />
        )}
      </div>
    </div>
  )
}
