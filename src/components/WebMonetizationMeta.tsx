"use client"

import { useEffect } from "react"

interface WebMonetizationMetaProps {
  paymentPointer: string | null | undefined
}

export function WebMonetizationMeta({ paymentPointer }: WebMonetizationMetaProps) {
  useEffect(() => {
    if (!paymentPointer) return

    // Find or create meta tag
    let meta = document.querySelector('meta[name="monetization"]') as HTMLMetaElement
    if (!meta) {
      meta = document.createElement("meta")
      meta.name = "monetization"
      document.head.appendChild(meta)
    }
    meta.content = paymentPointer

    console.log(`[Web Monetization] Meta tag injected: ${paymentPointer}`)

    return () => {
      // Clean up when unmounting or paymentPointer changes
      if (meta) {
        meta.remove()
        console.log(`[Web Monetization] Meta tag removed`)
      }
    }
  }, [paymentPointer])

  return null
}
