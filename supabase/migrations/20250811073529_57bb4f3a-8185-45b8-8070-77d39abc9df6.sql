-- Create AI assessments table for user progress tracking
CREATE TABLE public.ai_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  assessment_type TEXT NOT NULL DEFAULT 'profile_update',
  assessment_data JSONB NOT NULL DEFAULT '{}',
  recommendations TEXT,
  progress_score NUMERIC,
  health_insights TEXT,
  motivational_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own assessments" 
ON public.ai_assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own assessments" 
ON public.ai_assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create function to update timestamps
CREATE TRIGGER update_ai_assessments_updated_at
BEFORE UPDATE ON public.ai_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();