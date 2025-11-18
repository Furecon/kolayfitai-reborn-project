import ProgressTracker from '../../Profile/ProgressTracker'

export function ProgressTab() {

  return (
    <div className="pb-20 pt-4 w-full">
      <div className="w-full px-4 sm:px-6 mb-4">
        <div className="max-w-screen-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900">Gelişim Takibi</h1>
          <p className="text-sm text-gray-600 mt-1">Kilonuzu ve ilerlemenizi takip edin</p>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6">
        <div className="max-w-screen-2xl mx-auto">
          <ProgressTracker />
        </div>
      </div>
    </div>
  )
}
