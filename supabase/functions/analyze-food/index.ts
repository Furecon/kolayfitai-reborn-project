
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Analyze-food function called')
    
    const { imageUrl, mealType, analysisType, detailsData } = await req.json()
    
    console.log('Request data:', { 
      imageUrlLength: imageUrl?.length,
      mealType,
      analysisType,
      detailsData,
      imageUrlPrefix: imageUrl?.substring(0, 50)
    })
    
    if (!imageUrl) {
      console.error('Image URL is required')
      throw new Error('Image URL is required')
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      console.error('OpenAI API key not configured')
      throw new Error('OpenAI API key not configured')
    }

    // Build detailed prompt based on analysis type
    let detailsPrompt = ''
    if (analysisType === 'detailed' && detailsData) {
      detailsPrompt = `

ÖNEMLI EK BİLGİLER:
- Yemek kaynağı: ${detailsData.foodSource === 'homemade' ? 'Ev yapımı' : 'Paketli/hazır'}
- Pişirme yöntemi: ${detailsData.cookingMethod}
- Tüketilen miktar: ${detailsData.consumedAmount}
- Yemek türü: ${detailsData.mealType === 'single' ? 'Tek tip yemek' : 'Karışık tabak'}
${detailsData.hiddenIngredients ? `- Gizli malzemeler/ekstralar: ${detailsData.hiddenIngredients}` : ''}

Bu bilgileri kullanarak daha doğru besin değeri hesaplama yap.`
    }

    console.log('Making request to OpenAI API...')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `Sen Türk mutfağı ve beslenme konusunda uzman bir yapay zeka asistanısın. Yemek fotoğraflarını analiz ederek doğru besin değerlerini hesaplıyorsun. Türkçe yemek adlarını tercih et ve gerçekçi porsiyon tahminleri yap.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Bu yemek fotoğrafını analiz et ve besin değerlerini hesapla. Mümkün olduğunca Türkçe yemek adları kullan ve gerçekçi porsiyon tahminleri yap.

${detailsPrompt}

Sadece geçerli bir JSON objesi döndür, başka hiçbir metin ekleme:

{
  "detectedFoods": [
    {
      "name": "Yemek adı (Türkçe)",
      "nameEn": "Food name (English)", 
      "estimatedAmount": "Miktar ve birim (örn: 1 porsiyon, 100g, 1 adet)",
      "nutritionPer100g": {
        "calories": sayı,
        "protein": sayı,
        "carbs": sayı,
        "fat": sayı,
        "fiber": sayı,
        "sugar": sayı,
        "sodium": sayı
      },
      "totalNutrition": {
        "calories": sayı,
        "protein": sayı,
        "carbs": sayı,
        "fat": sayı,
        "fiber": sayı,
        "sugar": sayı,
        "sodium": sayı
      }
    }
  ],
  "mealType": "${mealType || 'öğün'}",
  "confidence": 0_ile_1_arası_sayı,
  "suggestions": "Türkçe kısa öneriler (maksimum 2 cümle)"
}

ÖNEMLI KURALLAR:
- Tüm besin değerleri gerçekçi sayılar olmalı (0'dan büyük)
- Lif gram, şeker gram, sodyum miligram cinsinden
- Porsiyon tahminlerinde gerçekçi ol
- Eğer hiçbir yemeği net tanıyamıyorsan boş detectedFoods array'i döndür
- Confidence değeri 0.1-1.0 arasında olmalı
- Sadece JSON döndür, başka açıklama yapma`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1500,
        temperature: 0.2, // Lower temperature for more consistent results
      }),
    })

    console.log('OpenAI API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI API error:', response.status, errorText)
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    console.log('OpenAI response received:', { 
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length 
    })

    const content = data.choices[0]?.message?.content
    if (!content) {
      console.error('No content received from OpenAI')
      throw new Error('No content received from OpenAI')
    }

    console.log('Raw content from OpenAI:', content.substring(0, 200) + '...')

    // Clean the response to extract JSON
    let jsonStr = content.trim()
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/\n?```$/, '')
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/, '').replace(/\n?```$/, '')
    }

    let analysisResult
    try {
      analysisResult = JSON.parse(jsonStr)
      console.log('Successfully parsed JSON result:', {
        detectedFoodsCount: analysisResult.detectedFoods?.length || 0,
        confidence: analysisResult.confidence
      })
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw content that failed to parse:', content)
      throw new Error('Invalid JSON response from AI')
    }

    // Validate and fix the response structure
    if (!analysisResult.detectedFoods || !Array.isArray(analysisResult.detectedFoods)) {
      console.error('Invalid response structure: missing detectedFoods array')
      analysisResult.detectedFoods = []
    }

    // Set default confidence if missing
    if (typeof analysisResult.confidence !== 'number') {
      analysisResult.confidence = 0.7
    }

    // Ensure confidence is between 0 and 1
    if (analysisResult.confidence > 1) {
      analysisResult.confidence = analysisResult.confidence / 100
    }

    // Validate and fix nutrition data for each food
    analysisResult.detectedFoods.forEach((food: any, index: number) => {
      if (!food.name) {
        food.name = `Yemek ${index + 1}`
      }
      if (!food.nameEn) {
        food.nameEn = food.name
      }
      if (!food.estimatedAmount) {
        food.estimatedAmount = '1 porsiyon'
      }
      
      // Ensure nutrition objects exist
      if (!food.nutritionPer100g) {
        food.nutritionPer100g = {}
      }
      if (!food.totalNutrition) {
        food.totalNutrition = {}
      }
      
      // Ensure all required nutrition fields are present with valid numbers
      const requiredFields = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium']
      requiredFields.forEach(field => {
        if (typeof food.nutritionPer100g[field] !== 'number' || food.nutritionPer100g[field] < 0) {
          food.nutritionPer100g[field] = 0
        }
        if (typeof food.totalNutrition[field] !== 'number' || food.totalNutrition[field] < 0) {
          food.totalNutrition[field] = 0
        }
      })

      // Ensure calories is reasonable (at least some calories for detected food)
      if (food.totalNutrition.calories < 10) {
        food.totalNutrition.calories = 50 // Default minimum calories
      }
    })

    // Set default suggestions if missing
    if (!analysisResult.suggestions) {
      analysisResult.suggestions = 'Yemek analizi tamamlandı. Besin değerlerini kontrol ediniz.'
    }

    console.log('Analysis result validated successfully:', {
      detectedFoodsCount: analysisResult.detectedFoods.length,
      confidence: analysisResult.confidence,
      totalCalories: analysisResult.detectedFoods.reduce((sum: number, food: any) => sum + (food.totalNutrition?.calories || 0), 0)
    })

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in analyze-food function:', error)
    
    // Return a structured error response that the frontend can handle
    const errorResponse = {
      error: error.message,
      detectedFoods: [],
      confidence: 0,
      suggestions: "Görüntü analizi sırasında hata oluştu. Lütfen manuel olarak yemek bilgilerini girin veya tekrar deneyin."
    }
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 200, // Return 200 so frontend can handle the error gracefully
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
