
import React from 'react'
import { LucideIcon } from 'lucide-react'

interface CircularMacroChartProps {
  current: number
  goal: number
  label: string
  color: string
  unit: string
  icon?: LucideIcon
  size?: 'large' | 'normal'
}

const CircularProgress = ({ 
  current, 
  goal, 
  color, 
  size = 'normal' 
}: { 
  current: number
  goal: number
  color: string
  size?: 'large' | 'normal'
}) => {
  const percentage = Math.min((current / goal) * 100, 100)
  
  // Responsive sizing
  const dimensions = {
    large: {
      container: 'w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44',
      radius: { mobile: 60, tablet: 70, desktop: 80 },
      strokeWidth: { mobile: 6, tablet: 7, desktop: 8 },
      fontSize: 'text-xl sm:text-2xl md:text-3xl'
    },
    normal: {
      container: 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36',
      radius: { mobile: 45, tablet: 55, desktop: 65 },
      strokeWidth: { mobile: 4, tablet: 5, desktop: 6 },
      fontSize: 'text-lg sm:text-xl md:text-2xl'
    }
  }
  
  const config = dimensions[size]
  const radius = config.radius.desktop
  const strokeWidth = config.strokeWidth.desktop
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative ${config.container} flex items-center justify-center`}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 w-full h-full"
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
      >
        {/* Background circle */}
        <circle
          stroke="#f3f4f6"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress circle */}
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      
      {/* Center content - Absolutely positioned and centered */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`${config.fontSize} font-bold text-gray-900 text-center leading-none`}>
          {Math.round(current)}
        </div>
      </div>
    </div>
  )
}

export function CircularMacroChart({ 
  current, 
  goal, 
  label, 
  color, 
  unit, 
  size = 'normal' 
}: CircularMacroChartProps) {
  return (
    <div className="flex flex-col items-center space-y-2 sm:space-y-3 max-w-full">
      <CircularProgress 
        current={current} 
        goal={goal} 
        color={color} 
        size={size}
      />
      <div className="text-center max-w-full px-1 sm:px-2">
        <div className={`${size === 'large' ? 'text-sm sm:text-base md:text-lg' : 'text-xs sm:text-sm md:text-base'} font-semibold text-gray-900 mb-1 leading-tight break-words`}>
          {label}
        </div>
        <div className={`${size === 'large' ? 'text-xs sm:text-sm' : 'text-xs'} text-gray-600 leading-tight break-words`}>
          Hedef: {Math.round(goal)} {unit}
        </div>
      </div>
    </div>
  )
}
