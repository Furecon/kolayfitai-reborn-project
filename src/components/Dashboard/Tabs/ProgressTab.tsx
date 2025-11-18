import { useEffect } from 'react'
import ProgressTracker from '../../Profile/ProgressTracker'
import { useTutorialAutoShow } from '@/context/TutorialContext'

export function ProgressTab() {
  const { autoShowTutorial } = useTutorialAutoShow()

  useEffect(() => {
    autoShowTutorial('progress')
  }, [])

  return (
    <div className="pb-20 pt-4">
      <div className="px-3 sm:px-4 lg:px-6 mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Gelişim Takibi</h1>
        <p className="text-sm text-gray-600 mt-1">Kilonuzu ve ilerlemenizi takip edin</p>
      </div>

      <div className="px-4">
        <ProgressTracker />
      </div>
    </div>
  )
}
