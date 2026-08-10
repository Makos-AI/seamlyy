import sharp from "sharp"

export interface ProcessedImageVariant {
  buffer: Buffer
  key: string
  width: number
  height: number
  contentType: string
}

export interface ProcessedImageResult {
  thumbnail: ProcessedImageVariant
  display: ProcessedImageVariant
  master: {
    buffer: Buffer
    key: string
    contentType: string
    width: number
    height: number
  }
  blurDataURL: string
}

export async function processUploadedImage(
  inputBuffer: Buffer,
  baseKey: string,
  originalContentType: string
): Promise<ProcessedImageResult> {
  const masterMetadata = await sharp(inputBuffer).metadata()
  const masterWidth = masterMetadata.width || 800
  const masterHeight = masterMetadata.height || 600

  // 1. Thumbnail (400x400 max, WebP format)
  const thumbBuffer = await sharp(inputBuffer)
    .resize(400, 400, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true })

  // 2. Display (1200x1200 max, WebP format)
  const displayBuffer = await sharp(inputBuffer)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85 })
    .toBuffer({ resolveWithObject: true })

  // 3. BlurDataURL (16px WebP tiny preview base64)
  const blurBuffer = await sharp(inputBuffer)
    .resize(16, 16, { fit: "inside" })
    .webp({ quality: 20 })
    .toBuffer()
  const blurDataURL = `data:image/webp;base64,${blurBuffer.toString("base64")}`

  // Key base without extension
  const extension = baseKey.includes(".") ? baseKey.substring(baseKey.lastIndexOf(".")) : ""
  const baseKeyWithoutExt = baseKey.includes(".") ? baseKey.substring(0, baseKey.lastIndexOf(".")) : baseKey

  return {
    thumbnail: {
      buffer: thumbBuffer.data,
      key: `${baseKeyWithoutExt}_thumb.webp`,
      width: thumbBuffer.info.width,
      height: thumbBuffer.info.height,
      contentType: "image/webp"
    },
    display: {
      buffer: displayBuffer.data,
      key: `${baseKeyWithoutExt}_display.webp`,
      width: displayBuffer.info.width,
      height: displayBuffer.info.height,
      contentType: "image/webp"
    },
    master: {
      buffer: inputBuffer,
      key: baseKey.endsWith("_master") ? baseKey : `${baseKeyWithoutExt}_master${extension}`,
      contentType: originalContentType,
      width: masterWidth,
      height: masterHeight
    },
    blurDataURL
  }
}
