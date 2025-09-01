-- Create scanned_products table for local product database
CREATE TABLE public.scanned_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barcode TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  brand TEXT,
  serving_size TEXT,
  calories_per_100g NUMERIC DEFAULT 0,
  protein_per_100g NUMERIC DEFAULT 0,
  carbs_per_100g NUMERIC DEFAULT 0,
  fat_per_100g NUMERIC DEFAULT 0,
  fiber_per_100g NUMERIC DEFAULT 0,
  sugar_per_100g NUMERIC DEFAULT 0,
  sodium_per_100g NUMERIC DEFAULT 0,
  source TEXT DEFAULT 'manual', -- 'openfoodfacts', 'manual', 'ai'
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.scanned_products ENABLE ROW LEVEL SECURITY;

-- Create policies for scanned_products
CREATE POLICY "Anyone can view scanned products" 
ON public.scanned_products 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert scanned products" 
ON public.scanned_products 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own scanned products" 
ON public.scanned_products 
FOR UPDATE 
USING (auth.uid() = created_by);

-- Create favorite_products table
CREATE TABLE public.favorite_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  barcode TEXT NOT NULL,
  product_name TEXT NOT NULL,
  brand TEXT,
  preferred_serving_size NUMERIC DEFAULT 100,
  preferred_serving_unit TEXT DEFAULT 'g',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  UNIQUE(user_id, barcode)
);

-- Enable RLS
ALTER TABLE public.favorite_products ENABLE ROW LEVEL SECURITY;

-- Create policies for favorite_products
CREATE POLICY "Users can view their own favorite products" 
ON public.favorite_products 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite products" 
ON public.favorite_products 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own favorite products" 
ON public.favorite_products 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite products" 
ON public.favorite_products 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_scanned_products_updated_at
BEFORE UPDATE ON public.scanned_products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();