import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { TimePicker } from './time-picker'

interface TimePickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  value: string
  onConfirm: (time: string) => void
  title?: string
}

export function TimePickerDialog({
  open,
  onOpenChange,
  value,
  onConfirm,
  title = 'Saat Seçin'
}: TimePickerDialogProps) {
  const [selectedTime, setSelectedTime] = useState(value)

  const handleConfirm = () => {
    onConfirm(selectedTime)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setSelectedTime(value) // Reset to original value
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <TimePicker
            value={selectedTime}
            onChange={setSelectedTime}
          />
        </div>

        <div className="flex justify-between gap-3">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1"
          >
            İptal
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1"
          >
            Kaydet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
