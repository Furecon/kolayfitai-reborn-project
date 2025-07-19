
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
  const radius = size === 'large' ? 80 : 65
  const strokeWidth = size === 'large' ? 8 : 6
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={`relative ${size === 'large' ? 'w-44 h-44' : 'w-36 h-36'}`}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
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
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center max-w-full px-3">
          <div className={`${size === 'large' ? 'text-3xl' : 'text-2xl'} font-bold text-gray-900 leading-tight`}>
            {Math.round(current)}
          </div>
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
    <div className="flex flex-col items-center space-y-3 max-w-full">
      <CircularProgress 
        current={current} 
        goal={goal} 
        color={color} 
        size={size}
      />
      <div className="text-center max-w-full px-2">
        <div className={`${size === 'large' ? 'text-lg' : 'text-base'} font-semibold text-gray-900 mb-1 leading-tight`}>
          {label}
        </div>
        <div className={`${size === 'large' ? 'text-sm' : 'text-xs'} text-gray-600 leading-tight`}>
          Hedef: {Math.round(goal)} {unit}
        </div>
      </div>
    </div>
  )
}
