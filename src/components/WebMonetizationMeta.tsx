"use client"

import { useEffect } from "react"

interface WebMonetizationMetaProps {
  paymentPointer: string | null | undefined
}

function formatPaymentPointer(pointer: string) {
  if (!pointer) return ""
  let clean = pointer.trim()
  if (clean.startsWith("$$")) {
    clean = clean.slice(2)
  } else if (clean.startsWith("$")) {
    clean = clean.slice(1)
  }
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    return `https://${clean}`
  }
  return clean
}

export function WebMonetizationMeta({ paymentPointer }: WebMonetizationMetaProps) {
  const formattedUrl = paymentPointer ? formatPaymentPointer(paymentPointer) : ""

  useEffect(() => {
    if (formattedUrl) {
      console.log(`[Web Monetization] Tag active for: ${formattedUrl}`)
    }
  }, [formattedUrl])

  if (!formattedUrl) return null

  return (
    <>
      <link rel="monetization" href={formattedUrl} />
      <meta name="monetization" content={formattedUrl} />
    </>
  )
}
