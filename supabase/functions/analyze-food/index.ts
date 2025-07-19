
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
    
    const { imageUrl, mealType } = await req.json()
    
    console.log('Request data:', { 
      imageUrlLength: imageUrl?.length,
      mealType,
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
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this food image and provide nutritional information. Return ONLY a valid JSON object with this exact structure:

{
  "detectedFoods": [
    {
      "name": "Food name in Turkish",
      "nameEn": "Food name in English", 
      "estimatedAmount": "Amount with unit (e.g., 1 porsiyon, 100g, 1 adet)",
      "nutritionPer100g": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "sugar": number,
        "sodium": number
      },
      "totalNutrition": {
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "fiber": number,
        "sugar": number,
        "sodium": number
      }
    }
  ],
  "mealType": "${mealType || 'öğün'}",
  "confidence": number_between_0_and_1,
  "suggestions": "Brief suggestions in Turkish"
}

Important notes:
- All nutrition values should be realistic numbers
- Fiber is in grams, sugar in grams, sodium in milligrams
- Use Turkish food names when possible
- Be as accurate as possible with portion estimates
- Include fiber, sugar, and sodium values for comprehensive nutrition analysis
- If you cannot clearly identify any food, return an empty detectedFoods array
- Always provide helpful suggestions in Turkish`
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
        max_tokens: 1000,
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
      console.log('Successfully parsed JSON result')
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw content that failed to parse:', content)
      throw new Error('Invalid JSON response from AI')
    }

    // Validate the response structure
    if (!analysisResult.detectedFoods || !Array.isArray(analysisResult.detectedFoods)) {
      console.error('Invalid response structure: missing detectedFoods array')
      throw new Error('Invalid response structure: missing detectedFoods array')
    }

    // Ensure all required nutrition fields are present
    analysisResult.detectedFoods.forEach((food: any, index: number) => {
      if (!food.nutritionPer100g || !food.totalNutrition) {
        console.error(`Missing nutrition data for food item ${index}`)
        throw new Error(`Missing nutrition data for food item ${index}`)
      }
      
      // Ensure fiber, sugar, and sodium are present
      const requiredFields = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium']
      requiredFields.forEach(field => {
        if (typeof food.nutritionPer100g[field] !== 'number') {
          food.nutritionPer100g[field] = 0
        }
        if (typeof food.totalNutrition[field] !== 'number') {
          food.totalNutrition[field] = 0
        }
      })
    })

    console.log('Analysis result validated successfully:', {
      detectedFoodsCount: analysisResult.detectedFoods.length,
      confidence: analysisResult.confidence
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
