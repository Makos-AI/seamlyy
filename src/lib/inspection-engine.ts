import imghash from 'imghash'
import leven from 'fast-levenshtein'
import sharp from 'sharp'

// 1. pHash Functions
export async function generatePHash(buffer: Buffer): Promise<string> {
  // Generate 64-bit perceptual hash (8x8 hex)
  return await imghash.hash(buffer, 8, 'hex')
}

// Compares two hex hashes by calculating Hamming distance
export function compareHashes(hash1: string, hash2: string): number {
  if (!hash1 || !hash2) return 64; // Max distance if missing
  // Convert hex to binary strings to calculate true hamming distance
  const bin1 = hexToBinary(hash1)
  const bin2 = hexToBinary(hash2)
  
  let distance = 0
  for (let i = 0; i < 64; i++) {
    if (bin1[i] !== bin2[i]) distance++
  }
  return distance
}

function hexToBinary(hex: string): string {
  let bin = ''
  for (let i = 0; i < hex.length; i++) {
    bin += parseInt(hex[i], 16).toString(2).padStart(4, '0')
  }
  return bin
}


// 2. LSB Steganography Functions (Simplified for demonstration/Node.js usage)
// Note: In a production environment with lossy WebP compression, LSB might be destroyed on variants. 
// We embed this into the master file which is preserved.

const END_MARKER = ":::END:::"

export async function embedLSBWatermark(imageBuffer: Buffer, payload: string): Promise<Buffer> {
  const message = payload + END_MARKER
  const binaryMessage = message.split('').map(char => 
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('')

  const { data, info } = await sharp(imageBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true })

  // We need enough pixels to store the message (1 bit per pixel/channel)
  if (data.length < binaryMessage.length) {
    throw new Error("Image too small to hold watermark")
  }

  // Embed bit into the Least Significant Bit of the Red channel for simplicity
  for (let i = 0; i < binaryMessage.length; i++) {
    const bit = parseInt(binaryMessage[i], 10)
    // Clear the LSB and set it to our bit
    data[i] = (data[i] & ~1) | bit
  }

  return await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: info.channels
    }
  }).png().toBuffer() // Save as lossless PNG to preserve LSB
}

export async function extractLSBWatermark(imageBuffer: Buffer): Promise<string | null> {
  try {
    const { data } = await sharp(imageBuffer)
      .raw()
      .toBuffer({ resolveWithObject: true })

    let binaryMessage = ''
    let stringMessage = ''

    // Read bits until we find the END_MARKER or run out of sensible data
    for (let i = 0; i < data.length; i++) {
      binaryMessage += (data[i] & 1).toString()
      
      // Every 8 bits, convert to character
      if (binaryMessage.length === 8) {
        const char = String.fromCharCode(parseInt(binaryMessage, 2))
        stringMessage += char
        binaryMessage = ''
        
        if (stringMessage.endsWith(END_MARKER)) {
          return stringMessage.replace(END_MARKER, '')
        }
      }
      
      // Safety break to prevent scanning massive images entirely if no watermark exists
      if (i > 50000 && !stringMessage.includes(":") && stringMessage.length > 100) {
        return null 
      }
    }
    return null
  } catch (error) {
    return null // Fails safely if not parseable
  }
}
