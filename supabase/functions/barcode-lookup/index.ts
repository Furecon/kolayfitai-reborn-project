import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { barcode } = await req.json();
    
    if (!barcode) {
      return new Response(
        JSON.stringify({ error: 'Barcode is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Looking up barcode:', barcode);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // First, check our local database
    const { data: localProduct, error: localError } = await supabase
      .from('scanned_products')
      .select('*')
      .eq('barcode', barcode)
      .maybeSingle();

    if (localProduct) {
      console.log('Found product in local database:', localProduct.product_name);
      return new Response(
        JSON.stringify({
          found: true,
          source: 'local',
          product: {
            product_name: localProduct.product_name,
            brands: localProduct.brand || '',
            serving_size: localProduct.serving_size || '100g',
            nutriments: {
              'energy-kcal_100g': localProduct.calories_per_100g || 0,
              'proteins_100g': localProduct.protein_per_100g || 0,
              'carbohydrates_100g': localProduct.carbs_per_100g || 0,
              'fat_100g': localProduct.fat_per_100g || 0,
              'fiber_100g': localProduct.fiber_per_100g || 0,
              'sugars_100g': localProduct.sugar_per_100g || 0,
              'sodium_100g': localProduct.sodium_per_100g || 0
            }
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If not found locally, try Open Food Facts API
    console.log('Product not found locally, checking Open Food Facts...');
    const openFoodFactsUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    
    const response = await fetch(openFoodFactsUrl);
    const data = await response.json();

    if (data.status === 1 && data.product) {
      console.log('Found product in Open Food Facts:', data.product.product_name);
      
      // Save to our local database for future lookups
      const productData = {
        barcode: barcode,
        product_name: data.product.product_name || 'Bilinmeyen Ürün',
        brand: data.product.brands || '',
        serving_size: data.product.serving_size || '100g',
        calories_per_100g: data.product.nutriments?.['energy-kcal_100g'] || 0,
        protein_per_100g: data.product.nutriments?.['proteins_100g'] || 0,
        carbs_per_100g: data.product.nutriments?.['carbohydrates_100g'] || 0,
        fat_per_100g: data.product.nutriments?.['fat_100g'] || 0,
        fiber_per_100g: data.product.nutriments?.['fiber_100g'] || 0,
        sugar_per_100g: data.product.nutriments?.['sugars_100g'] || 0,
        sodium_per_100g: data.product.nutriments?.['sodium_100g'] || 0,
        source: 'openfoodfacts',
        created_by: null
      };

      // Save to local database (ignore errors if already exists)
      await supabase
        .from('scanned_products')
        .upsert(productData, { onConflict: 'barcode' });

      return new Response(
        JSON.stringify({
          found: true,
          source: 'openfoodfacts',
          product: data.product
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Product not found in Open Food Facts');
    return new Response(
      JSON.stringify({
        found: false,
        message: 'Ürün bulunamadı'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in barcode-lookup function:', error);
    return new Response(
      JSON.stringify({ error: 'İç sunucu hatası', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});