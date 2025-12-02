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
    const hourNum = parseInt(newHour, 10)
    if (newHour !== '' && (isNaN(hourNum) || hourNum < 0 || hourNum > 23)) return

    onChange(`${newHour.padStart(2, '0')}:${minutes}`)
  }

  const handleMinuteChange = (newMinute: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(newMinute)) return

    // Limit to 2 digits
    if (newMinute.length > 2) return

    // Validate minute range (0-59)
    const minuteNum = parseInt(newMinute, 10)
    if (newMinute !== '' && (isNaN(minuteNum) || minuteNum < 0 || minuteNum > 59)) return

    onChange(`${hours}:${newMinute.padStart(2, '0')}`)
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
          onBlur={handleMinuteBlur}
          className="w-16 text-center text-lg font-medium"
          placeholder="00"
        />
      </div>
    </div>
  )
}
