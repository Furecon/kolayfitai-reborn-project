
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
  
  // Responsive sizing - optimized for triangle layout
  const dimensions = {
    large: {
      container: 'w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48',
      radius: { mobile: 70, tablet: 80, desktop: 90 },
      strokeWidth: { mobile: 7, tablet: 8, desktop: 9 },
      fontSize: 'text-2xl sm:text-3xl md:text-4xl'
    },
    normal: {
      container: 'w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32',
      radius: { mobile: 38, tablet: 46, desktop: 54 },
      strokeWidth: { mobile: 4, tablet: 5, desktop: 6 },
      fontSize: 'text-base sm:text-lg md:text-xl'
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
