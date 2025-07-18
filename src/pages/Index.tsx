import { useState } from 'react'
import Dashboard from '@/components/Dashboard'
import FoodAnalysis from '@/components/FoodAnalysis'
import { Button } from '@/components/ui/button'
import { Camera, BarChart3 } from 'lucide-react'

const Index = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'analysis'>('dashboard')

  return (
    <div className="min-h-screen bg-gradient-bg">
      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-white/20 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img 
              src="/lovable-uploads/317535ce-569b-46f4-9335-cbf575700142.png" 
              alt="KolayfitAI" 
              className="h-10 w-10"
            />
            <h1 className="text-2xl font-bold gradient-text">KolayfitAI</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={activeView === 'dashboard' ? 'default' : 'ghost'}
              onClick={() => setActiveView('dashboard')}
              className={activeView === 'dashboard' ? 'btn-gradient' : ''}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </Button>
            <Button
              variant={activeView === 'analysis' ? 'default' : 'ghost'}
              onClick={() => setActiveView('analysis')}
              className={activeView === 'analysis' ? 'btn-gradient' : ''}
            >
              <Camera className="h-4 w-4 mr-2" />
              AI Analiz
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {activeView === 'dashboard' ? <Dashboard /> : <FoodAnalysis />}
    </div>
  );
};

export default Index;
