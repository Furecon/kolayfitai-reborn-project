import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.51.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate deterministic hash from image content (not URL)
 */
async function generateImageHash(imageUrl: string): Promise<string> {
  try {
    // 1) If data URL (data:image/...), decode base64 content and hash it
    if (imageUrl.startsWith('data:')) {
      const base64Part = imageUrl.split(',')[1] || '';
      const binary = atob(base64Part);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    }

    // 2) Normal http/https URL: fetch image and hash content bytes
    const resp = await fetch(imageUrl);
    if (resp.ok) {
      const arrayBuffer = await resp.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } else {
      console.warn('Failed to fetch image for hashing, status:', resp.status);
    }
  } catch (err) {
    console.error('Error while hashing image content, falling back to URL hash:', err);
  }

  // 3) Fallback: if fetch/parse fails, hash URL as before (safe fallback)
  const encoder = new TextEncoder();
  const data = encoder.encode(imageUrl);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Clean JSON string from markdown code blocks and trailing garbage
 */
function cleanJsonString(raw: string): string {
  let cleaned = raw.trim()

  // Remove markdown code blocks
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/```json\n?/, '').replace(/\n?```$/, '')
  }
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/```\n?/, '').replace(/\n?```$/, '')
  }

  // Find last valid ] and cut everything after
  const lastBracket = cleaned.lastIndexOf(']')
  if (lastBracket !== -1) {
    const afterBracket = cleaned.substring(lastBracket + 1).trim()
    if (afterBracket.startsWith('}')) {
      // This is likely valid JSON object ending
      const lastBrace = cleaned.lastIndexOf('}')
      if (lastBrace > lastBracket) {
        cleaned = cleaned.substring(0, lastBrace + 1)
      }
    }
  }

  return cleaned.trim()
}

/**
 * Parse portion to normalized grams
 */
function normalizePortionToGrams(estimatedAmount: string, portionType: string): number {
  const numMatch = estimatedAmount.match(/(\d+(?:\.\d+)?)/);
  const numValue = numMatch ? parseFloat(numMatch[1]) : 1;

  switch (portionType.toLowerCase()) {
    case 'gram':
      return numValue;
    case 'ml':
      return numValue; // 1ml ≈ 1g for most liquids
    case 'bardak':
    case 'kase':
      return numValue * 200;
    case 'şişe':
      return numValue * 500;
    case 'kutu':
      return numValue * 330;
    case 'dilim':
      return numValue * 30;
    case 'adet':
      return numValue * 100; // default
    case 'porsiyon':
      return numValue * 150; // default
    default:
      return 100; // fallback
  }
}

/**
 * Lookup food in database with Turkish/English name matching
 */
async function lookupFoodInDatabase(
  supabaseClient: any,
  nameTr: string,
  nameEn: string | null
): Promise<any> {
  console.log(`Looking up food: TR="${nameTr}", EN="${nameEn}"`)

  // Build search conditions
  const searchConditions: string[] = []

  if (nameTr) {
    const escapedTr = nameTr.toLowerCase().trim()
    searchConditions.push(`name_tr.ilike.%${escapedTr}%`)
  }

  if (nameEn) {
    const escapedEn = nameEn.toLowerCase().trim()
    searchConditions.push(`name_en.ilike.%${escapedEn}%`)
    searchConditions.push(`name.ilike.%${escapedEn}%`)
  }

  if (searchConditions.length === 0) {
    return null
  }

  const { data, error } = await supabaseClient
    .from('foods')
    .select('*')
    .or(searchConditions.join(','))
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Database lookup error:', error)
    return null
  }

  if (data) {
    console.log(`Found food in DB: ${data.name_tr || data.name}`)
  }

  return data
}

/**
 * Calculate nutrition from database food entry
 */
function calculateNutritionFromDB(dbFood: any, normalizedGrams: number) {
  const nutritionPer100g = {
    calories: parseFloat(dbFood.calories_per_100g || 0),
    protein: parseFloat(dbFood.protein_per_100g || 0),
    carbs: parseFloat(dbFood.carbs_per_100g || 0),
    fat: parseFloat(dbFood.fat_per_100g || 0),
    fiber: parseFloat(dbFood.fiber_per_100g || 0),
    sugar: parseFloat(dbFood.sugar_per_100g || 0),
    sodium: parseFloat(dbFood.sodium_per_100g || 0)
  }

  const factor = normalizedGrams / 100
  const totalNutrition = {
    calories: Math.round(nutritionPer100g.calories * factor),
    protein: Math.round(nutritionPer100g.protein * factor * 10) / 10,
    carbs: Math.round(nutritionPer100g.carbs * factor * 10) / 10,
    fat: Math.round(nutritionPer100g.fat * factor * 10) / 10,
    fiber: Math.round(nutritionPer100g.fiber * factor * 10) / 10,
    sugar: Math.round(nutritionPer100g.sugar * factor * 10) / 10,
    sodium: Math.round(nutritionPer100g.sodium * factor)
  }

  return { nutritionPer100g, totalNutrition }
}

/**
 * Add new food to database automatically (learning system)
 */
async function autoAddFoodToDatabase(
  supabaseClient: any,
  foodItem: any,
  imageHash: string,
  confidence: number
): Promise<boolean> {
  try {
    console.log(`Auto-adding new food to DB: ${foodItem.name}`)

    const nameTr = foodItem.name
    const nameEn = foodItem.nameEn || foodItem.name
    const name = nameEn || nameTr

    // Extract nutrition per 100g from AI
    const nutritionPer100g = foodItem.nutritionPer100g || {}

    // Validation: reasonable calorie range
    const calories = nutritionPer100g.calories || 0
    if (calories < 0 || calories > 2000) {
      console.log('Calories out of reasonable range, skipping auto-add')
      return false
    }

    // Insert into foods table
    const { error: insertError } = await supabaseClient
      .from('foods')
      .insert({
        name: name,
        name_en: nameEn,
        name_tr: nameTr,
        calories_per_100g: nutritionPer100g.calories || 0,
        protein_per_100g: nutritionPer100g.protein || 0,
        carbs_per_100g: nutritionPer100g.carbs || 0,
        fat_per_100g: nutritionPer100g.fat || 0,
        fiber_per_100g: nutritionPer100g.fiber || 0,
        sugar_per_100g: nutritionPer100g.sugar || 0,
        sodium_per_100g: nutritionPer100g.sodium || 0,
        category: 'Diğer',
        is_turkish_cuisine: false,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error auto-adding food to DB:', insertError)
      return false
    }

    console.log(`Successfully auto-added: ${nameTr}`)

    // Log to ai_food_candidates
    const { error: candidateError } = await supabaseClient
      .from('ai_food_candidates')
      .insert({
        name_tr: nameTr,
        name_en: nameEn,
        image_hash: imageHash,
        ai_nutrition: nutritionPer100g,
        ai_confidence: confidence,
        occurrence_count: 1
      })

    if (candidateError) {
      console.log('Could not log to ai_food_candidates:', candidateError)
    }

    return true
  } catch (err) {
    console.error('Exception in autoAddFoodToDatabase:', err)
    return false
  }
}

/**
 * Call OpenAI Vision API
 */
async function analyzeImageWithAI(
  imageUrl: string,
  mealType: string | null,
  detailsPrompt: string,
  openaiApiKey: string,
  model: string = 'gpt-4o-mini'
): Promise<any> {
  console.log(`Calling OpenAI with model: ${model}`)

  const systemPrompt = `Sen Türk mutfağı ve beslenme konusunda uzman bir yapay zeka asistanısın. Yemek fotoğraflarını analiz ederek yiyecek/içecekleri tespit ediyorsun.

ÖNEMLİ: Tüm yemek adlarını **Türk kullanıcılar için en doğal Türkçe isim** olarak ver:
- "Greek yogurt" deme, "süzme yoğurt" de
- "Skimmed milk" → "yağsız süt"
- "Yogurt, plain, nonfat" → "yağsız yoğurt"
- "Club soda" → "soda"
- "Soy milk, unsweetened" → "şekersiz soya sütü"
- "Red delicious apple" → "kırmızı elma"
- "Cottage cheese" → "lor peyniri"
- "Ground beef" → "kıyma"

FOTOĞRAF KALİTESİ DEĞERLENDİRMESİ:
Gerekirse analysisErrors'a ekle:
- "Fotoğraf çok karanlık - daha iyi ışıkta tekrar çekin"
- "Fotoğraf bulanık - daha net bir fotoğraf çekin"
- "Fotoğrafta yemek görünmüyor"
- "Porsiyon miktarı belirlenemiyor"`

  const userPrompt = `Bu yemek fotoğrafını analiz et. Türkçe yemek adları kullan, gerçekçi porsiyon tahminleri yap.

${detailsPrompt}

Sadece geçerli bir JSON objesi döndür:

{
  "detectedFoods": [
    {
      "name": "Yemek adı (Türkçe)",
      "nameEn": "Food name (English, opsiyonel)",
      "estimatedAmount": "Miktar (örn: 1 porsiyon, 150g, 250ml)",
      "portionType": "gram|ml|bardak|şişe|kutu|adet|porsiyon|dilim|kase",
      "normalizedPortionGrams": sayı,
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
  "confidence": 0.1_ile_1_arası,
  "suggestions": "Türkçe kısa öneri (max 2 cümle)",
  "analysisErrors": []
}

BESİN KURALLARI:
- Çoğu yiyecek makroları 0'dan büyük
- Ancak su, sade kahve, şekersiz çay, soda, maden suyu, diyet içecekler: 0 kalori/makro olabilir
- Sodyum mg, lif ve şeker gr cinsinden
- İçeceklerde 1ml ≈ 1g`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.2,
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('OpenAI API error:', response.status, errorText)
    throw new Error(`OpenAI API error: ${response.status}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content

  if (!content) {
    throw new Error('No content received from OpenAI')
  }

  console.log('Raw AI response:', content.substring(0, 200) + '...')

  // Clean and parse JSON
  const cleanedJson = cleanJsonString(content)
  const parsed = JSON.parse(cleanedJson)

  return parsed
}

/**
 * Read cache from database
 */
async function getCachedAnalysis(
  supabaseClient: any,
  imageHash: string
): Promise<any | null> {
  const { data, error } = await supabaseClient
    .from('photo_analysis_cache')
    .select('result, created_at')
    .eq('image_hash', imageHash)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  // Check if cache is not too old (30 days)
  const cacheAge = Date.now() - new Date(data.created_at).getTime()
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000

  if (cacheAge > thirtyDaysMs) {
    console.log('Cache expired, ignoring')
    return null
  }

  console.log('Cache hit!')
  return data.result
}

/**
 * Save analysis result to cache
 */
async function saveCacheAnalysis(
  supabaseClient: any,
  imageHash: string,
  result: any
): Promise<void> {
  const { error } = await supabaseClient
    .from('photo_analysis_cache')
    .insert({
      image_hash: imageHash,
      result: result
    })

  if (error) {
    console.error('Error saving cache:', error)
  } else {
    console.log('Analysis cached successfully')
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Analyze-food function called ===')

    // 1. Authorization
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // 2. Parse request body
    const requestData = await req.json()
    const { imageUrl, mealType, analysisType, detailsData } = requestData

    // 3. Trial & subscription check
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('subscription_status, trial_photo_analysis_count, trial_photo_analysis_limit')
      .eq('user_id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      throw new Error('Failed to fetch user profile')
    }

    if (profile.subscription_status === 'trial') {
      if (profile.trial_photo_analysis_count >= profile.trial_photo_analysis_limit) {
        return new Response(
          JSON.stringify({
            error: 'trial_limit_reached',
            message: 'Ücretsiz fotoğraf analizi hakkınız doldu. Premium üyeliğe geçerek sınırsız analiz yapabilirsiniz.',
            detectedFoods: [],
            confidence: 0,
            suggestions: 'Premium üyeliğe geçerek sınırsız fotoğraf analizi yapabilirsiniz.'
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // 4. Input validation
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error('Valid image URL is required')
    }
    if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
      throw new Error('Invalid image URL format')
    }
    if (mealType && !['breakfast', 'lunch', 'dinner', 'snack', 'drink', 'kahvaltı', 'öğle', 'akşam', 'atıştırmalık', 'içecek'].includes(mealType)) {
      throw new Error('Invalid meal type')
    }
    if (analysisType && !['quick', 'detailed'].includes(analysisType)) {
      throw new Error('Invalid analysis type')
    }

    console.log('Request validated:', { mealType, analysisType })

    // 5. Generate image hash
    const imageHash = await generateImageHash(imageUrl)
    console.log('Image hash:', imageHash)

    // 6. Check cache
    const cachedResult = await getCachedAnalysis(supabaseClient, imageHash)
    if (cachedResult) {
      console.log('Returning cached result')
      return new Response(JSON.stringify(cachedResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 7. Build details prompt
    let detailsPrompt = ''
    if (analysisType === 'detailed' && detailsData) {
      const cookingMethodText = detailsData.cookingMethod === 'unsure'
        ? 'Pişirme yöntemi belirsiz - fotoğraftan tahmin et'
        : detailsData.cookingMethod

      detailsPrompt = `
ÖNEMLI EK BİLGİLER:
- Yemek kaynağı: ${detailsData.foodSource === 'homemade' ? 'Ev yapımı' : 'Paketli/hazır'}
- Pişirme yöntemi: ${cookingMethodText}
- Tüketilen miktar: ${detailsData.consumedAmount}
- Yemek türü: ${detailsData.mealType === 'single' ? 'Tek tip yemek' : 'Karışık tabak'}
${detailsData.hiddenIngredients ? `- Gizli malzemeler: ${detailsData.hiddenIngredients}` : ''}`
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    // 8. Call AI (gpt-4o-mini)
    let aiResult = await analyzeImageWithAI(
      imageUrl,
      mealType,
      detailsPrompt,
      openaiApiKey,
      'gpt-4o-mini'
    )

    // Validate AI response
    if (!aiResult.detectedFoods || !Array.isArray(aiResult.detectedFoods)) {
      aiResult.detectedFoods = []
    }
    if (typeof aiResult.confidence !== 'number') {
      aiResult.confidence = 0.7
    }
    if (aiResult.confidence > 1) {
      aiResult.confidence = aiResult.confidence / 100
    }

    // 9. Upgrade to gpt-4o if needed
    if (analysisType === 'quick' && aiResult.confidence < 0.6) {
      console.log('Low confidence, upgrading to gpt-4o')
      try {
        const upgradeResult = await analyzeImageWithAI(
          imageUrl,
          mealType,
          detailsPrompt,
          openaiApiKey,
          'gpt-4o'
        )
        if (upgradeResult.detectedFoods && upgradeResult.detectedFoods.length > 0) {
          console.log('Upgrade successful, using gpt-4o result')
          aiResult = upgradeResult
        }
      } catch (upgradeError) {
        console.log('Upgrade failed, keeping gpt-4o-mini result:', upgradeError)
      }
    }

    // 10. Process each food: match with DB or auto-add
    const processedFoods: any[] = []

    for (const foodItem of aiResult.detectedFoods) {
      console.log(`\n--- Processing: ${foodItem.name} ---`)

      // Normalize portion to grams
      const normalizedGrams = foodItem.normalizedPortionGrams ||
        normalizePortionToGrams(foodItem.estimatedAmount, foodItem.portionType)

      console.log(`Normalized portion: ${normalizedGrams}g`)

      // Try to find in database
      const dbFood = await lookupFoodInDatabase(
        supabaseClient,
        foodItem.name,
        foodItem.nameEn
      )

      let finalFood: any

      if (dbFood) {
        // Use database nutrition
        console.log('Using database nutrition')
        const { nutritionPer100g, totalNutrition } = calculateNutritionFromDB(dbFood, normalizedGrams)

        finalFood = {
          name: dbFood.name_tr || dbFood.name,
          nameEn: dbFood.name_en || dbFood.name,
          estimatedAmount: foodItem.estimatedAmount,
          portionType: foodItem.portionType,
          nutritionPer100g,
          totalNutrition
        }
      } else {
        // Not in database - use AI nutrition as fallback
        console.log('Food not in database, using AI nutrition')

        finalFood = {
          name: foodItem.name,
          nameEn: foodItem.nameEn || foodItem.name,
          estimatedAmount: foodItem.estimatedAmount,
          portionType: foodItem.portionType,
          nutritionPer100g: foodItem.nutritionPer100g || {},
          totalNutrition: foodItem.totalNutrition || {}
        }

        // Auto-add to database if confidence is high
        if (aiResult.confidence >= 0.8) {
          const added = await autoAddFoodToDatabase(
            supabaseClient,
            foodItem,
            imageHash,
            aiResult.confidence
          )
          if (added) {
            console.log('Food auto-added to database')
          }
        }
      }

      // Handle zero-calorie drinks
      const lowerName = finalFood.name.toLowerCase()
      const isZeroCalDrink =
        lowerName.includes('su') ||
        lowerName.includes('water') ||
        lowerName.includes('sade kahve') ||
        lowerName.includes('black coffee') ||
        lowerName.includes('sade çay') ||
        lowerName.includes('plain tea') ||
        lowerName.includes('soda') ||
        lowerName.includes('maden suyu') ||
        lowerName.includes('mineral') ||
        lowerName.includes('diyet') ||
        lowerName.includes('zero')

      if (isZeroCalDrink) {
        console.log('Zero-calorie drink detected')
        const fields = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'sodium']
        fields.forEach(field => {
          finalFood.nutritionPer100g[field] = 0
          finalFood.totalNutrition[field] = 0
        })
      }

      processedFoods.push(finalFood)
    }

    // 11. Build final response
    const analysisResult = {
      detectedFoods: processedFoods,
      mealType: aiResult.mealType || mealType || 'öğün',
      confidence: aiResult.confidence,
      suggestions: aiResult.suggestions || 'Yemek analizi tamamlandı. Besin değerlerini kontrol ediniz.',
      analysisErrors: aiResult.analysisErrors || []
    }

    console.log('Analysis complete:', {
      foodCount: processedFoods.length,
      confidence: analysisResult.confidence,
      totalCalories: processedFoods.reduce((sum, f) => sum + (f.totalNutrition?.calories || 0), 0)
    })

    // 12. Save to cache
    await saveCacheAnalysis(supabaseClient, imageHash, analysisResult)

    // 13. Increment trial count
    if (profile.subscription_status === 'trial') {
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          trial_photo_analysis_count: profile.trial_photo_analysis_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (updateError) {
        console.error('Failed to update trial count:', updateError)
      } else {
        console.log('Trial count incremented:', profile.trial_photo_analysis_count + 1)
      }
    }

    // 14. Return response
    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    console.error('Error in analyze-food function:', error)

    const sanitizedError = error instanceof Error ?
      (error.message.includes('API') ? 'Service temporarily unavailable' : error.message) :
      'Unexpected error occurred'

    const errorResponse = {
      error: sanitizedError,
      detectedFoods: [],
      confidence: 0,
      suggestions: "Görüntü analizi sırasında hata oluştu. Lütfen manuel olarak yemek bilgilerini girin veya tekrar deneyin."
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
