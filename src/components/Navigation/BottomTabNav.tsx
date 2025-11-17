import { Home, Brain, TrendingUp, UtensilsCrossed, Settings } from 'lucide-react'

export type TabType = 'home' | 'ai-insights' | 'progress' | 'meals' | 'settings'

interface BottomTabNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
}

export function BottomTabNav({ activeTab, onTabChange }: BottomTabNavProps) {
  const tabs = [
    { id: 'home' as TabType, icon: Home, label: 'Ana Sayfa' },
    { id: 'ai-insights' as TabType, icon: Brain, label: 'AI Analiz' },
    { id: 'progress' as TabType, icon: TrendingUp, label: 'Gelişim' },
    { id: 'meals' as TabType, icon: UtensilsCrossed, label: 'Öğünler' },
    { id: 'settings' as TabType, icon: Settings, label: 'Ayarlar' }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="grid grid-cols-5 h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? 'text-green-600'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon
                className={`h-6 w-6 transition-all ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className={`text-xs font-medium ${
                isActive ? 'opacity-100' : 'opacity-60'
              }`}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
