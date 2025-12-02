import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

interface TimePickerProps {
  value: string // "14:00" format
  onChange: (time: string) => void
  className?: string
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hours, setHours] = useState('00')
  const [minutes, setMinutes] = useState('00')
  const hourRef = useRef<HTMLDivElement>(null)
  const minuteRef = useRef<HTMLDivElement>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout>()

  // Parse initial value
  useEffect(() => {
    if (value && value.includes(':')) {
      const [h, m] = value.split(':')
      setHours(h.padStart(2, '0'))
      setMinutes(m.padStart(2, '0'))
    }
  }, [value])

  // Update parent when time changes
  useEffect(() => {
    onChange(`${hours}:${minutes}`)
  }, [hours, minutes, onChange])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // Create circular lists - repeat 3 times for infinite feel
  const baseHours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  )
  const baseMinutes = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  )

  const hourOptions = [...baseHours, ...baseHours, ...baseHours]
  const minuteOptions = [...baseMinutes, ...baseMinutes, ...baseMinutes]

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    options: string[],
    setValue: (val: string) => void,
    baseLength: number
  ) => {
    if (!ref.current) return

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    // Debounce the value update
    scrollTimeoutRef.current = setTimeout(() => {
      if (!ref.current) return

      const container = ref.current
      const itemHeight = 48
      const scrollTop = container.scrollTop
      const index = Math.round(scrollTop / itemHeight)
      const clampedIndex = Math.max(0, Math.min(index, options.length - 1))

      // Update value
      setValue(options[clampedIndex])

      // Handle circular wraparound - jump to middle section
      const currentIndex = Math.round(container.scrollTop / itemHeight)

      // If near start, jump to middle
      if (currentIndex < baseLength / 2) {
        container.scrollTop = (currentIndex + baseLength) * itemHeight
      }
      // If near end, jump to middle
      else if (currentIndex >= baseLength * 2.5) {
        container.scrollTop = (currentIndex - baseLength) * itemHeight
      }
    }, 100)
  }

  const scrollToValue = (
    ref: React.RefObject<HTMLDivElement>,
    value: string,
    baseLength: number
  ) => {
    if (!ref.current) return
    // Always scroll to middle section for circular effect
    const middleSetIndex = baseLength + parseInt(value, 10)
    ref.current.scrollTop = middleSetIndex * 48
  }

  useEffect(() => {
    scrollToValue(hourRef, hours, 24)
  }, [hours])

  useEffect(() => {
    scrollToValue(minuteRef, minutes, 60)
  }, [minutes])

  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      {/* Hours */}
      <div className="relative h-[240px] w-[80px]">
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-[96px] bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />

        {/* Selection indicator */}
        <div className="absolute top-[96px] left-0 right-0 h-[48px] border-y-2 border-primary/20 bg-primary/5 pointer-events-none z-10" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-[96px] bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

        {/* Scrollable hours */}
        <div
          ref={hourRef}
          className="h-full overflow-y-scroll scrollbar-hide"
          onScroll={() => handleScroll(hourRef, hourOptions, setHours, 24)}
          style={{
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Top padding */}
          <div className="h-[96px]" />

          {hourOptions.map((hour, idx) => (
            <div
              key={`hour-${idx}`}
              className={cn(
                "h-[48px] flex items-center justify-center text-2xl font-medium snap-start transition-all",
                hour === hours ? "text-foreground scale-110" : "text-muted-foreground"
              )}
            >
              {hour}
            </div>
          ))}

          {/* Bottom padding */}
          <div className="h-[96px]" />
        </div>
      </div>

      {/* Separator */}
      <div className="text-3xl font-bold text-foreground">:</div>

      {/* Minutes */}
      <div className="relative h-[240px] w-[80px]">
        {/* Top fade */}
        <div className="absolute top-0 left-0 right-0 h-[96px] bg-gradient-to-b from-background to-transparent pointer-events-none z-10" />

        {/* Selection indicator */}
        <div className="absolute top-[96px] left-0 right-0 h-[48px] border-y-2 border-primary/20 bg-primary/5 pointer-events-none z-10" />

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-[96px] bg-gradient-to-t from-background to-transparent pointer-events-none z-10" />

        {/* Scrollable minutes */}
        <div
          ref={minuteRef}
          className="h-full overflow-y-scroll scrollbar-hide"
          onScroll={() => handleScroll(minuteRef, minuteOptions, setMinutes, 60)}
          style={{
            scrollSnapType: 'y mandatory',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {/* Top padding */}
          <div className="h-[96px]" />

          {minuteOptions.map((minute, idx) => (
            <div
              key={`minute-${idx}`}
              className={cn(
                "h-[48px] flex items-center justify-center text-2xl font-medium snap-start transition-all",
                minute === minutes ? "text-foreground scale-110" : "text-muted-foreground"
              )}
            >
              {minute}
            </div>
          ))}

          {/* Bottom padding */}
          <div className="h-[96px]" />
        </div>
      </div>
    </div>
  )
}
