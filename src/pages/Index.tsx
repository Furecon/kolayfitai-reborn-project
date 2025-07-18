
import { useState } from 'react'
import Dashboard from '@/components/Dashboard'
import FoodAnalysis from '@/components/FoodAnalysis'
import { Button } from '@/components/ui/button'
import { Camera, BarChart3 } from 'lucide-react'

const Index = () => {
  const [activeView, setActiveView] = useState<'dashboard' | 'analysis'>('dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content */}
      {activeView === 'dashboard' ? <Dashboard /> : <FoodAnalysis />}
    </div>
  );
};

export default Index;
