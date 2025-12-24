import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DietOnboarding } from './DietOnboarding';
import { DietPlanView } from './DietPlanView';
import { EmptyDietState } from './EmptyDietState';
import { DietProfile, DietPlan } from '@/types/diet';
import { Loader2 } from 'lucide-react';
import { AdRewardDialog } from '@/components/Ads/AdRewardDialog';
import { AdRewardService } from '@/services/AdRewardService';

export function DietPlanScreen() {
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [dietProfile, setDietProfile] = useState<DietProfile | null>(null);
  const [activePlan, setActivePlan] = useState<DietPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showAdDialog, setShowAdDialog] = useState(false);
  const [pendingProfile, setPendingProfile] = useState<DietProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDietData();
  }, []);

  const loadDietData = async () => {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('diet_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setDietProfile(profile);

      if (!profile || !profile.has_seen_onboarding) {
        setShowOnboarding(true);
        return;
      }

      const { data: plan } = await supabase
        .from('diet_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      setActivePlan(plan);
    } catch (error) {
      console.error('Error loading diet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (profile: DietProfile) => {
    try {
      setGenerating(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: existingProfile } = await supabase
        .from('diet_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from('diet_profiles')
          .update({
            ...profile,
            has_seen_onboarding: true,
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('diet_profiles')
          .insert({
            ...profile,
            user_id: user.id,
            has_seen_onboarding: true,
          });
      }

      setDietProfile({ ...profile, has_seen_onboarding: true });
      setShowOnboarding(false);

      await generateDietPlan(profile);
    } catch (error: any) {
      console.error('Error saving diet profile:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Profil kaydedilirken hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleOnboardingSkip = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingProfile } = await supabase
        .from('diet_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        await supabase
          .from('diet_profiles')
          .update({ has_seen_onboarding: true })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('diet_profiles')
          .insert({
            user_id: user.id,
            has_seen_onboarding: true,
          });
      }

      setShowOnboarding(false);
      setDietProfile({ has_seen_onboarding: true });
    } catch (error) {
      console.error('Error skipping onboarding:', error);
    }
  };

  const generateDietPlan = async (profile?: DietProfile) => {
    try {
      setGenerating(true);

      const profileToUse = profile || dietProfile;
      if (!profileToUse) {
        throw new Error('Diet profile required');
      }

      const limitCheck = await AdRewardService.checkAdLimit('diet_plan');

      if (limitCheck.isPremium) {
        await executeDietPlanGeneration(profileToUse);
        return;
      }

      if (limitCheck.limitReached) {
        toast({
          title: 'Haftalık Limit Doldu',
          description: limitCheck.message,
          variant: 'destructive',
          duration: 5000,
        });
        setGenerating(false);
        return;
      }

      if (limitCheck.requiresAd) {
        setPendingProfile(profileToUse);
        setShowAdDialog(true);
        setGenerating(false);
        return;
      }

      await executeDietPlanGeneration(profileToUse);
    } catch (error: any) {
      console.error('Error generating diet plan:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Plan oluşturulurken hata oluştu',
        variant: 'destructive',
      });
      setGenerating(false);
    }
  };

  const executeDietPlanGeneration = async (profileToUse: DietProfile) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://acsqneuzkukmvtfmbphb.supabase.co';
      const apiUrl = `${supabaseUrl}/functions/v1/generate-diet-plan`;

      console.log('Generating diet plan, API URL:', apiUrl);

      const response = await fetch(
        apiUrl,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dietProfile: profileToUse }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Plan oluşturulurken hata oluştu');
      }

      setActivePlan(result.plan);

      toast({
        title: 'Başarılı!',
        description: '7 günlük kişisel diyet planın hazır.',
      });
    } catch (error: any) {
      console.error('Error generating diet plan:', error);
      toast({
        title: 'Hata',
        description: error.message || 'Plan oluşturulurken hata oluştu',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAdCompleted = async () => {
    if (pendingProfile) {
      setGenerating(true);
      await executeDietPlanGeneration(pendingProfile);
      setPendingProfile(null);
    }
  };

  const handleAdCancelled = () => {
    setPendingProfile(null);
  };

  const handleCreateProfile = () => {
    setShowOnboarding(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <DietOnboarding
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
        initialData={dietProfile || undefined}
      />
    );
  }

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-semibold">Diyet Planın Hazırlanıyor</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Sana özel 7 günlük plan oluşturuyoruz...
          </p>
        </div>
      </div>
    );
  }

  if (!activePlan) {
    return (
      <EmptyDietState
        hasProfile={!!dietProfile && !!dietProfile.age}
        onCreateProfile={handleCreateProfile}
        onGeneratePlan={() => generateDietPlan()}
      />
    );
  }

  return (
    <>
      <DietPlanView
        plan={activePlan}
        dietProfile={dietProfile}
        onRegeneratePlan={() => generateDietPlan()}
        onEditProfile={handleCreateProfile}
        onPlanUpdated={setActivePlan}
      />

      <AdRewardDialog
        open={showAdDialog}
        onOpenChange={setShowAdDialog}
        featureType="diet_plan"
        featureName="Haftalık Diyet Planı"
        onAdCompleted={handleAdCompleted}
        onCancel={handleAdCancelled}
      />
    </>
  );
}
