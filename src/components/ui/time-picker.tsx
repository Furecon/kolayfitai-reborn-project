import { cn } from '@/lib/utils'
import { Input } from './input'
import { Label } from './label'

interface TimePickerProps {
  value: string // "14:00" format
  onChange: (time: string) => void
  className?: string
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const [hours, minutes] = value.split(':')

  const handleHourChange = (newHour: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(newHour)) return

    // Limit to 2 digits
    if (newHour.length > 2) return

    // Validate hour range (0-23)
    if (newHour !== '') {
      const hourNum = parseInt(newHour, 10)
      if (isNaN(hourNum) || hourNum < 0 || hourNum > 23) return
    }

    // Keep as-is during typing, don't pad yet
    const formattedHour = newHour === '' ? '00' : newHour
    onChange(`${formattedHour}:${minutes}`)
  }

  const handleMinuteChange = (newMinute: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(newMinute)) return

    // Limit to 2 digits
    if (newMinute.length > 2) return

    // Validate minute range (0-59)
    if (newMinute !== '') {
      const minuteNum = parseInt(newMinute, 10)
      if (isNaN(minuteNum) || minuteNum < 0 || minuteNum > 59) return
    }

    // Keep as-is during typing, don't pad yet
    const formattedMinute = newMinute === '' ? '00' : newMinute
    onChange(`${hours}:${formattedMinute}`)
  }

  const handleHourBlur = () => {
    // Ensure 2 digits on blur
    const hourNum = parseInt(hours, 10) || 0
    onChange(`${hourNum.toString().padStart(2, '0')}:${minutes}`)
  }

  const handleMinuteBlur = () => {
    // Ensure 2 digits on blur
    const minuteNum = parseInt(minutes, 10) || 0
    onChange(`${hours}:${minuteNum.toString().padStart(2, '0')}`)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for easy replacement
    e.target.select()
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="hours" className="text-xs text-muted-foreground">Saat</Label>
        <Input
          id="hours"
          type="text"
          inputMode="numeric"
          value={hours}
          onChange={(e) => handleHourChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleHourBlur}
          className="w-16 text-center text-lg font-medium"
          placeholder="00"
        />
      </div>

      <div className="text-2xl font-bold mt-6">:</div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="minutes" className="text-xs text-muted-foreground">Dakika</Label>
        <Input
          id="minutes"
          type="text"
          inputMode="numeric"
          value={minutes}
          onChange={(e) => handleMinuteChange(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleMinuteBlur}
          className="w-16 text-center text-lg font-medium"
          placeholder="00"
        />
      </div>
    </div>
  )
}
