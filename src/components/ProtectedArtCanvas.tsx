"use client"

import { useEffect, useRef, useState } from "react"
import { Skeleton } from "./ui"

export default function ProtectedArtCanvas({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = src

    img.onload = () => {
      // Set canvas size to match image aspect ratio while fitting container
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      setLoading(false)
    }

    img.onerror = () => {
      setLoading(false) // Fallback handled gracefully
    }
  }, [src])

  return (
    <div 
      className={`relative select-none protected-art-viewport ${className}`}
      onContextMenu={(e) => e.preventDefault()} // Block Right Click
      onDragStart={(e) => e.preventDefault()}   // Block Image Dragging
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-secondary rounded-lg">
          <Skeleton className="w-full h-full" />
        </div>
      )}
      
      <canvas 
        ref={canvasRef} 
        aria-label={alt} 
        className={`w-full h-auto max-w-full rounded-lg ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} 
      />
      
      {/* Invisible Overlay Shield to prevent direct interaction */}
      <div className="absolute inset-0 bg-transparent z-10" />
    </div>
  )
}
