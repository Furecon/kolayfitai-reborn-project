
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/components/Auth/AuthProvider";
import { AuthScreen } from "@/components/Auth/AuthScreen";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { ProfileSetup } from "@/components/Profile/ProfileSetup";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const queryClient = new QueryClient();

function AppContent() {
  const { user, loading } = useAuth();
  const [needsProfile, setNeedsProfile] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(true);

  useEffect(() => {
    if (user && !loading) {
      checkProfileCompleteness();
    } else if (!loading) {
      setCheckingProfile(false);
    }
  }, [user, loading]);

  const checkProfileCompleteness = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('age, gender, height, weight, activity_level, diet_goal')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking profile:', error);
      }

      // Check if essential profile fields are missing
      const isProfileIncomplete = !data || 
        !data.age || 
        !data.gender || 
        !data.height || 
        !data.weight || 
        !data.activity_level || 
        !data.diet_goal;

      setNeedsProfile(isProfileIncomplete);
    } catch (error) {
      console.error('Profile check error:', error);
    } finally {
      setCheckingProfile(false);
    }
  };

  if (loading || checkingProfile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">KolayfitAI yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (needsProfile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4 bg-green-500 text-white text-center">
          <h2 className="font-semibold">Hoş geldiniz!</h2>
          <p className="text-sm">Kişiselleştirilmiş deneyim için profil bilgilerinizi tamamlayın</p>
        </div>
        <ProfileSetup />
      </div>
    );
  }

  return <Dashboard />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
