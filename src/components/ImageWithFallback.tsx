"use client"

import * as React from "react"
import Image, { ImageProps } from "next/image"

interface ImageWithFallbackProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string
}

export function ImageWithFallback({
  alt,
  src,
  fallbackSrc,
  className = "",
  ...props
}: ImageWithFallbackProps) {
  const [error, setError] = React.useState(false)
  const [imgSrc, setImgSrc] = React.useState(src)

  React.useEffect(() => {
    setImgSrc(src)
    setError(false)
  }, [src])

  if (error || !imgSrc) {
    if (fallbackSrc) {
      return (
        <Image
          {...props}
          alt={alt}
          src={fallbackSrc}
          className={className}
          onError={() => setError(true)}
        />
      )
    }
    return (
      <div className={`w-full h-full bg-bg-tertiary flex items-center justify-center border border-border/50 text-text-muted text-xs select-none ${className}`}>
        <div className="flex flex-col items-center gap-1.5 p-2 text-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <span className="text-[10px] font-medium text-text-muted opacity-75">Image Unavailable</span>
        </div>
      </div>
    )
  }

  return (
    <Image
      {...props}
      alt={alt}
      src={imgSrc}
      className={className}
      onError={() => setError(true)}
    />
  )
}
