
import React from 'react'

interface CircularMacroChartProps {
  current: number
  goal: number
  label: string
  color: string
  unit: string
}

const CircularProgress = ({ current, goal, color }: { current: number; goal: number; color: string }) => {
  const percentage = Math.min((current / goal) * 100, 100)
  const radius = 45
  const strokeWidth = 8
  const normalizedRadius = radius - strokeWidth * 2
  const circumference = normalizedRadius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className="relative w-24 h-24">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          stroke="#e5e7eb"
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
      
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm font-bold text-gray-800">{Math.round(current)}</div>
          <div className="text-xs text-gray-500">/ {Math.round(goal)}</div>
        </div>
      </div>
    </div>
  )
}

export function CircularMacroChart({ current, goal, label, color, unit }: CircularMacroChartProps) {
  const percentage = Math.min((current / goal) * 100, 100)
  
  return (
    <div className="flex flex-col items-center space-y-2">
      <CircularProgress current={current} goal={goal} color={color} />
      <div className="text-center">
        <div className="text-sm font-medium text-gray-800">{label}</div>
        <div className="text-xs text-gray-500">{Math.round(percentage)}% • {unit}</div>
      </div>
    </div>
  )
}
