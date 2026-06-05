"use client"

import * as React from "react"

export function MonetizationBanner() {
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    const dismissed = sessionStorage.getItem("seamlyy-monetization-banner-dismissed")
    if (dismissed === "true") {
      setIsVisible(false)
    }
  }, [])

  const handleDismiss = () => {
    sessionStorage.setItem("seamlyy-monetization-banner-dismissed", "true")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="w-full bg-bg-secondary border-b border-gold/20 py-2.5 px-4 text-center relative z-40 transition-all duration-300">
      <div className="container mx-auto flex items-center justify-center gap-2 pr-8">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="text-gold flex-shrink-0 animate-pulse"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <p className="text-xs text-text-secondary font-medium">
          Seamlyy supports Web Monetization. Stream micropayments directly to artists passively as you view their work using an Interledger-enabled browser extension.
        </p>
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-lg transition-colors"
        aria-label="Dismiss Banner"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  )
}
