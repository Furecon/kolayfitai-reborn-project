
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
  icon: Icon, 
  size = 'normal' 
}: { 
  current: number
  goal: number
  color: string
  icon?: LucideIcon
  size?: 'large' | 'normal'
}) => {
  const percentage = Math.min((current / goal) * 100, 100)
  const radius = size === 'large' ? 80 : 65
  const strokeWidth = size === 'large' ? 14 : 12
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (percentage / 100) * circumference
  const iconSize = size === 'large' ? 28 : 20

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
          {Icon && (
            <Icon 
              className="mx-auto mb-1 text-gray-600" 
              size={iconSize}
            />
          )}
          <div className={`${size === 'large' ? 'text-2xl' : 'text-xl'} font-bold text-gray-900 leading-tight`}>
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
  icon, 
  size = 'normal' 
}: CircularMacroChartProps) {
  return (
    <div className="flex flex-col items-center space-y-3 max-w-full">
      <CircularProgress 
        current={current} 
        goal={goal} 
        color={color} 
        icon={icon}
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
