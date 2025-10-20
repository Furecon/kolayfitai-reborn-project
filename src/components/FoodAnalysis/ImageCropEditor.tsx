import React, { useState, useRef } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { RotateCw, Square, Crop as CropIcon, Check, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ImageCropEditorProps {
  imageUrl: string
  onCropComplete: (croppedImageUrl: string) => void
  onCancel: () => void
}

export function ImageCropEditor({ imageUrl, onCropComplete, onCancel }: ImageCropEditorProps) {
  const { toast } = useToast()
  const imgRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const [rotation, setRotation] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1, // Square aspect ratio
        width,
        height,
      ),
      width,
      height,
    )
    setCrop(crop)
  }

  const setSquareAspect = () => {
    if (!imgRef.current) return
    const { width, height } = imgRef.current
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        1, // Square aspect
        width,
        height,
      ),
      width,
      height,
    )
    setCrop(crop)
  }

  const set43Aspect = () => {
    if (!imgRef.current) return
    const { width, height } = imgRef.current
    const crop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        4 / 3, // 4:3 aspect
        width,
        height,
      ),
      width,
      height,
    )
    setCrop(crop)
  }

  const rotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const getCroppedImg = async (): Promise<string> => {
    const image = imgRef.current
    const canvas = canvasRef.current
    const crop = completedCrop

    if (!image || !canvas || !crop) {
      throw new Error('Canvas or image not loaded')
    }

    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    const ctx = canvas.getContext('2d')

    if (!ctx) {
      throw new Error('No 2d context')
    }

    const pixelRatio = window.devicePixelRatio
    canvas.width = crop.width * pixelRatio * scaleX
    canvas.height = crop.height * pixelRatio * scaleY

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
    ctx.imageSmoothingQuality = 'high'

    // Apply rotation if needed
    if (rotation !== 0) {
      const centerX = crop.width * scaleX / 2
      const centerY = crop.height * scaleY / 2
      ctx.translate(centerX, centerY)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-centerX, -centerY)
    }

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    )

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error('Failed to create blob')
          }
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        },
        'image/jpeg',
        0.8
      )
    })
  }

  const handleCropComplete = async () => {
    if (!completedCrop) {
      toast({
        title: "Hata",
        description: "Lütfen kırpma alanını seçin",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)
    try {
      const croppedImageUrl = await getCroppedImg()
      // Don't resize here, let parent handle it
      onCropComplete(croppedImageUrl)
      toast({
        title: "Başarılı!",
        description: "Görsel kırpıldı!"
      })
    } catch (error) {
      console.error('Crop error:', error)
      toast({
        title: "Hata",
        description: "Görsel kırpılırken hata oluştu",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 bg-background border-b border-border px-3 py-3 z-10">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-muted-foreground p-2"
          >
            <X className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">İptal</span>
          </Button>
          <div className="text-center flex-1 px-2">
            <h1 className="text-base sm:text-lg font-semibold text-foreground">
              Görseli Kırp
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Yemeğin daha iyi görünmesi için kırpabilirsiniz
            </p>
          </div>
          <Button
            onClick={handleCropComplete}
            disabled={!completedCrop || isProcessing}
            className="bg-success hover:bg-success/90 text-success-foreground p-2"
          >
            <Check className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">
              {isProcessing ? 'İşleniyor...' : 'Tamam'}
            </span>
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-3 space-y-4">
        {/* Controls */}
        <div className="flex flex-wrap gap-2 justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={setSquareAspect}
            className="flex items-center gap-1"
          >
            <Square className="h-3 w-3" />
            Kare
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={set43Aspect}
            className="flex items-center gap-1"
          >
            <CropIcon className="h-3 w-3" />
            4:3
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={rotate}
            className="flex items-center gap-1"
          >
            <RotateCw className="h-3 w-3" />
            Döndür
          </Button>
        </div>

        {/* Crop Area */}
        <div className="relative">
          <ReactCrop
            crop={crop}
            onChange={(pixelCrop, percentCrop) => setCrop(percentCrop)}
            onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
            aspect={undefined}
            minWidth={50}
            minHeight={50}
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={imageUrl}
              style={{ 
                transform: `rotate(${rotation}deg)`,
                maxWidth: '100%',
                height: 'auto'
              }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>

        <canvas
          ref={canvasRef}
          style={{
            display: 'none',
          }}
        />

        <div className="text-center text-xs text-muted-foreground">
          <p>Görseli sürükleyerek kırpma alanını ayarlayın</p>
        </div>
      </div>
    </div>
  )
}