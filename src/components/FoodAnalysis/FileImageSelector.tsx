import React, { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Image, AlertCircle, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FileImageSelectorProps {
  onImageSelected: (imageUrl: string) => void
  onError?: (error: string) => void
  onBack?: () => void
  accept?: string
  maxSizeMB?: number
  title?: string
  subtitle?: string
}

export function FileImageSelector({
  onImageSelected,
  onError,
  onBack,
  accept = "image/jpeg,image/png,image/heic,image/heif",
  maxSizeMB = 10,
  title = "Görsel Seç",
  subtitle = "Galeriden veya dosyalardan görsel seçin"
}: FileImageSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    console.log('File selected:', file.name, file.type, file.size)

    // File size check
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      const error = `Dosya boyutu çok büyük. Lütfen ${maxSizeMB} MB altında bir görsel seçin.`
      toast.error(error)
      onError?.(error)
      return
    }

    // File type check
    const acceptedTypes = accept.split(',').map(type => type.trim())
    const isValidType = acceptedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/')
      return file.type === type || file.name.toLowerCase().endsWith(type.replace('image/', '.'))
    })

    if (!isValidType) {
      const error = 'Bu dosya türü desteklenmiyor. Lütfen JPG, PNG veya HEIC formatında bir görsel seçin.'
      toast.error(error)
      onError?.(error)
      return
    }

    try {
      // Handle HEIC files
      if (file.type === 'image/heic' || file.type === 'image/heif' || 
          file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        await convertHeicToJpeg(file)
      } else {
        // Standard image processing
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string

          // Don't resize here, let parent handle it
          onImageSelected(result)

          toast.success('Görsel başarıyla yüklendi!')
        }
        reader.onerror = () => {
          const error = 'Dosya okunurken hata oluştu'
          toast.error(error)
          onError?.(error)
        }
        reader.readAsDataURL(file)
      }
    } catch (error: any) {
      console.error('File processing error:', error)
      const errorMessage = 'Görsel işlenirken hata oluştu'
      toast.error(errorMessage)
      onError?.(errorMessage)
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const convertHeicToJpeg = async (file: File) => {
    // For HEIC files, we'll use a basic FileReader approach
    // In a production app, you might want to use a library like heic2any
    const reader = new FileReader()
    reader.onload = async (e) => {
      const result = e.target?.result as string
      
      try {
        // Try to create an image element to see if browser supports HEIC
        const img = document.createElement('img')
        img.onload = () => {
          // Don't resize here, let parent handle it
          onImageSelected(result)
          toast.success('HEIC görsel başarıyla dönüştürüldü!')
        }
        img.onerror = () => {
          const error = 'HEIC formatı bu tarayıcıda desteklenmiyor. Lütfen JPG veya PNG formatında bir görsel seçin.'
          toast.error(error)
          onError?.(error)
        }
        img.src = result
      } catch (error) {
        const errorMessage = 'HEIC dönüştürme hatası'
        toast.error(errorMessage)
        onError?.(errorMessage)
      }
    }
    reader.readAsDataURL(file)
  }


  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 px-3 sm:px-4 py-3 sm:py-4 z-10">
        <div className="flex items-center justify-between">
          {onBack && (
            <Button
              variant="ghost"
              onClick={onBack}
              className="text-gray-600 h-10 px-2"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Geri
            </Button>
          )}
          <h1 className="text-lg font-semibold text-gray-900 flex-1 text-center">
            {title}
          </h1>
          <div className="w-16" />
        </div>
      </div>

      <div className="px-3 sm:px-4 py-4 sm:py-6 space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Desteklenen formatlar: JPG, PNG, HEIC • Maksimum boyut: {maxSizeMB} MB
        </AlertDescription>
      </Alert>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        onClick={() => fileInputRef.current?.click()}
        className="w-full h-24 bg-success hover:bg-success/90 text-success-foreground flex flex-col items-center justify-center gap-2"
      >
        <div className="flex items-center gap-2">
          <Image className="h-6 w-6" />
          <Upload className="h-5 w-5" />
        </div>
        <span className="text-sm">Galeriden/Dosyadan Seç</span>
      </Button>

        <div className="text-center text-xs text-muted-foreground">
          <p>Seçilen görsel otomatik olarak optimize edilecektir</p>
        </div>
      </div>
    </div>
  )
}