import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { imageBase64, mealType = 'kahvaltı' } = await req.json()

    if (!imageBase64) {
      throw new Error('Image data is required')
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log('Starting food analysis...')
    const startTime = Date.now()

    // AI food analysis with confidence scoring
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Sen uzman bir besin analisti ve yemek tanıma uzmanısın. Verilen yemek fotoğrafını analiz ederek şunları yap:

1. Fotoğraftaki tüm yiyecekleri ve içecekleri tespit et (Türk, İtalyan, Çin, Amerikan, Fransız, Hint, Meksikan, Akdeniz ve diğer dünya mutfaklarından)
2. Her yiyecek için 100g başına besin değerlerini hesapla
3. Porsiyon miktarını tahmin et
4. Güven skorunu (0-1 arası) belirle

Çıktını SADECE aşağıdaki JSON formatında ver:
{
  "detectedFoods": [
    {
      "name": "yiyecek adı",
      "nameEn": "english name",
      "category": "kategori",
      "confidence": 0.85,
      "portionSize": 150,
      "nutritionPer100g": {
        "calories": 250,
        "protein": 20,
        "carbs": 30,
        "fat": 10,
        "fiber": 3
      }
    }
  ],
  "overallConfidence": 0.80,
  "requiresManualReview": false,
  "suggestions": "AI önerileri"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Bu ${mealType} fotoğrafını analiz et:`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.3
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const aiResult = await response.json()
    const processingTime = Date.now() - startTime

    console.log('AI Response received:', aiResult.choices[0].message.content)

    // Parse AI response
    let analysisResult
    try {
      analysisResult = JSON.parse(aiResult.choices[0].message.content)
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      throw new Error('Invalid AI response format')
    }

    // Calculate total nutrition for the meal
    let totalCalories = 0
    let totalProtein = 0
    let totalCarbs = 0
    let totalFat = 0

    analysisResult.detectedFoods.forEach((food: any) => {
      const portionMultiplier = food.portionSize / 100
      totalCalories += food.nutritionPer100g.calories * portionMultiplier
      totalProtein += food.nutritionPer100g.protein * portionMultiplier
      totalCarbs += food.nutritionPer100g.carbs * portionMultiplier
      totalFat += food.nutritionPer100g.fat * portionMultiplier
    })

    // Determine if manual review is needed
    const lowConfidenceThreshold = 0.70
    const requiresReview = analysisResult.overallConfidence < lowConfidenceThreshold || 
                          analysisResult.detectedFoods.some((food: any) => food.confidence < lowConfidenceThreshold)

    const result = {
      detectedFoods: analysisResult.detectedFoods,
      confidenceScores: {
        overall: analysisResult.overallConfidence,
        individual: analysisResult.detectedFoods.map((food: any) => ({
          name: food.name,
          confidence: food.confidence
        }))
      },
      nutritionalAnalysis: {
        totalCalories: Math.round(totalCalories),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        foodItems: analysisResult.detectedFoods.map((food: any) => ({
          name: food.name,
          nameEn: food.nameEn,
          category: food.category,
          portionSize: food.portionSize,
          calories: Math.round(food.nutritionPer100g.calories * food.portionSize / 100),
          protein: Math.round(food.nutritionPer100g.protein * food.portionSize / 100 * 10) / 10,
          carbs: Math.round(food.nutritionPer100g.carbs * food.portionSize / 100 * 10) / 10,
          fat: Math.round(food.nutritionPer100g.fat * food.portionSize / 100 * 10) / 10
        }))
      },
      aiSuggestions: analysisResult.suggestions,
      processingTimeMs: processingTime,
      confidenceThreshold: lowConfidenceThreshold,
      requiresManualReview: requiresReview,
      finalAnalysis: requiresReview ? null : analysisResult
    }

    console.log('Analysis completed successfully')
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in analyze-food function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Food analysis failed', 
        details: error.message,
        requiresManualReview: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    )
  }
})