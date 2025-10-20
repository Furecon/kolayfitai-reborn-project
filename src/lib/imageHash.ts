export async function simpleImageHash(imageDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()

    img.onload = () => {
      const canvas = document.createElement('canvas')
      const size = 16
      canvas.width = size
      canvas.height = size

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context not available'))
        return
      }

      ctx.drawImage(img, 0, 0, size, size)

      const imageData = ctx.getImageData(0, 0, size, size)
      const data = imageData.data

      const grayscale: number[] = []
      for (let i = 0; i < data.length; i += 4) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3
        grayscale.push(gray)
      }

      const avg = grayscale.reduce((a, b) => a + b, 0) / grayscale.length

      const hash = grayscale.map(val => val > avg ? '1' : '0').join('')

      const hexHash = parseInt(hash.substring(0, 64), 2).toString(16).padStart(16, '0')

      resolve(hexHash)
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageDataUrl
  })
}

export function hammingDistance(hash1: string, hash2: string): number {
  if (hash1.length !== hash2.length) return Infinity

  let distance = 0
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++
  }
  return distance
}

export function isSimilarImage(hash1: string, hash2: string, threshold: number = 5): boolean {
  const distance = hammingDistance(hash1, hash2)
  return distance <= threshold
}
