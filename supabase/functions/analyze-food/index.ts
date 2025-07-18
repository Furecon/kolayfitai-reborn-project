
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
    const { 
      imageBase64, 
      mealType = 'kahvaltı',
      analysisType = 'quick',
      detailedData = null
    } = await req.json()

    if (!imageBase64) {
      throw new Error('Image data is required')
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    console.log('Starting food analysis...', { analysisType, detailedData })
    const startTime = Date.now()

    // Create detailed prompt based on analysis type
    let systemPrompt = `Sen uzman bir besin analisti ve yemek tanıma uzmanısın. Verilen yemek fotoğrafını analiz ederek şunları yap:

1. Fotoğraftaki tüm yiyecekleri ve içecekleri tespit et (Türk, İtalyan, Çin, Amerikan, Fransız, Hint, Meksikan, Akdeniz ve diğer dünya mutfaklarından)
2. Her yiyecek için 100g başına besin değerlerini hesapla
3. Porsiyon miktarını tahmin et
4. Güven skorunu (0-1 arası) belirle

ÖNEMLİ: Yanıtını SADECE JSON formatında ver. Hiçbir açıklama, yorum veya ek metin ekleme. Sadece JSON objesi döndür.`

    // Add detailed analysis context if provided
    if (analysisType === 'detailed' && detailedData) {
      systemPrompt += `

DETAYLI ANALİZ BİLGİLERİ:
- Yemek kaynağı: ${detailedData.foodSource === 'homemade' ? 'Ev yapımı' : 'Paketli/dışarıdan hazır'}
- Pişirme yöntemi: ${detailedData.cookingMethod}
- Tüketim miktarı: ${detailedData.consumedAmount}
- Yemek tipi: ${detailedData.mealType === 'single' ? 'Tek tip yemek' : 'Karışık tabak'}
${detailedData.hiddenIngredients && !detailedData.noHiddenIngredients ? 
  `- Ek malzemeler: ${detailedData.hiddenIngredients}` : 
  '- Ek malzemeler: Belirtilmedi'}

Bu ek bilgileri kullanarak daha hassas kalori ve besin değeri hesabı yap.`
    }

    systemPrompt += `

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Bu ${mealType} fotoğrafını analiz et ve SADECE JSON yanıtı ver:`
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
        temperature: analysisType === 'detailed' ? 0.2 : 0.3
      }),
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText)
      throw new Error(`OpenAI API error: ${response.statusText}`)
    }

    const aiResult = await response.json()
    const processingTime = Date.now() - startTime

    console.log('AI Response received:', aiResult.choices[0].message.content)

    // Parse AI response with better error handling
    let analysisResult
    try {
      const content = aiResult.choices[0].message.content.trim()
      
      // Try to extract JSON if it's wrapped in markdown or extra text
      let jsonString = content
      if (content.includes('```json')) {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          jsonString = jsonMatch[1]
        }
      } else if (content.includes('```')) {
        const jsonMatch = content.match(/```\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          jsonString = jsonMatch[1]
        }
      }
      
      // Try to find JSON object in the response
      const jsonStart = jsonString.indexOf('{')
      const jsonEnd = jsonString.lastIndexOf('}')
      if (jsonStart !== -1 && jsonEnd !== -1) {
        jsonString = jsonString.substring(jsonStart, jsonEnd + 1)
      }
      
      analysisResult = JSON.parse(jsonString)
      
      // Validate required fields
      if (!analysisResult.detectedFoods || !Array.isArray(analysisResult.detectedFoods)) {
        throw new Error('Invalid response structure: missing detectedFoods array')
      }
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('Raw AI response:', aiResult.choices[0].message.content)
      
      // Fallback: return error that triggers manual review
      return new Response(JSON.stringify({
        error: 'AI_PARSE_ERROR',
        message: 'AI yanıtı işlenemedi. Manuel giriş gerekli.',
        requiresManualReview: true,
        fallbackToManual: true,
        processingTimeMs: processingTime
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 so frontend can handle gracefully
      })
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
    const lowConfidenceThreshold = analysisType === 'detailed' ? 0.60 : 0.70
    const requiresReview = analysisResult.overallConfidence < lowConfidenceThreshold || 
                          analysisResult.detectedFoods.some((food: any) => food.confidence < lowConfidenceThreshold)

    const result = {
      detectedFoods: analysisResult.detectedFoods,
      analysisType,
      detailedData,
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
      requiresManualReview: requiresReview
    }

    console.log('Analysis completed successfully')
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in analyze-food function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'ANALYSIS_FAILED',
        message: 'Yemek analizi başarısız oldu. Manuel giriş yapabilirsiniz.',
        details: error.message,
        requiresManualReview: true,
        fallbackToManual: true
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 200 
      }
    )
  }
})
