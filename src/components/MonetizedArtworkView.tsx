"use client"

import * as React from "react"
import { Badge, Card, Button } from "@/components/ui"
import { CheckoutButton } from "@/components/CheckoutButton"
import { WebMonetizationMeta } from "./WebMonetizationMeta"
import { formatPrice } from "@/lib/utils"

interface MonetizedArtworkViewProps {
  artwork: {
    id: string
    title: string
    description: string | null
    price: number | null
    thumbnailUrl: string
    status: string
    artist: {
      name: string | null
      walletPointer: string | null
      image: string | null
    }
  }
  hasPaidAccess: boolean
  preferredCurrency: string
  userWalletPointer: string
}

export function MonetizedArtworkView({
  artwork,
  hasPaidAccess,
  preferredCurrency,
  userWalletPointer
}: MonetizedArtworkViewProps) {
  const [monetizationStatus, setMonetizationStatus] = React.useState<
    "idle" | "checking" | "detected" | "pending" | "streaming" | "no-provider"
  >("idle")
  const [streamedAmount, setStreamedAmount] = React.useState(0)
  const [assetCode, setAssetCode] = React.useState("")
  const [isSimulated, setIsSimulated] = React.useState(false)

  // A user is unlocked if they have paid access (database check) or active monetization (real or simulated)
  const isUnlocked = hasPaidAccess || monetizationStatus === "streaming" || isSimulated

  React.useEffect(() => {
    // Listen to Web Monetization events continuously to enable testing even after paid access
    if (monetizationStatus !== "streaming") {
      setMonetizationStatus("checking")
    }
    const doc = document as any
    const walletPointer = artwork.artist.walletPointer

    const handleProgress = (e: any) => {
      setMonetizationStatus("streaming")
      let amount = 0
      let currencyCode = ""

      if (e.amountSent) {
        amount = Number(e.amountSent.value)
        currencyCode = e.amountSent.currency
      } else if (e.detail?.amountSent) {
        amount = Number(e.detail.amountSent.value)
        currencyCode = e.detail.amountSent.currency
      } else if (e.detail?.amount) {
        amount = Number(e.detail.amount)
        currencyCode = e.detail.assetCode || e.detail.currency || ""
      }

      if (amount > 0) {
        setStreamedAmount((prev) => prev + amount)
      }
      if (currencyCode) {
        setAssetCode(currencyCode)
      }
    }

    const handleStart = () => {
      setMonetizationStatus("streaming")
    }

    const handlePending = () => {
      setMonetizationStatus("pending")
    }

    // 1. Listen for standard monetization events on the link element
    let linkEl = document.querySelector('link[rel="monetization"]')
    if (linkEl) {
      linkEl.addEventListener("monetization", handleProgress)
    }

    // 2. Fallback to legacy document.monetization events
    if (doc.monetization) {
      setMonetizationStatus("detected")
      doc.monetization.addEventListener("monetizationpending", handlePending)
      doc.monetization.addEventListener("monetizationstart", handleStart)
      doc.monetization.addEventListener("monetizationprogress", handleProgress)

      if (doc.monetization.state === "started") {
        setMonetizationStatus("streaming")
      }
    } else if (!linkEl) {
      // Retry checking for the link tag shortly after mount/render
      const timeout = setTimeout(() => {
        const checkLink = document.querySelector('link[rel="monetization"]')
        if (checkLink) {
          checkLink.addEventListener("monetization", handleProgress)
          setMonetizationStatus("detected")
        } else {
          setMonetizationStatus("no-provider")
        }
      }, 1000)
      
      return () => clearTimeout(timeout)
    } else {
      setMonetizationStatus("detected")
    }

    return () => {
      if (linkEl) {
        linkEl.removeEventListener("monetization", handleProgress)
      }
      if (doc.monetization) {
        doc.monetization.removeEventListener("monetizationpending", handlePending)
        doc.monetization.removeEventListener("monetizationstart", handleStart)
        doc.monetization.removeEventListener("monetizationprogress", handleProgress)
      }
    }
  }, [artwork.artist.walletPointer])

  // Mock simulator for local testing
  const handleSimulateStream = () => {
    setIsSimulated(true)
    setMonetizationStatus("streaming")
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      {/* Inject monetization tag for optional streaming support */}
      {artwork.artist.walletPointer && (
        <WebMonetizationMeta paymentPointer={artwork.artist.walletPointer} />
      )}

      {/* Artwork Display Pane */}
      <div className="lg:col-span-7">
        <div className="relative aspect-square rounded-3xl overflow-hidden bg-bg-secondary border border-border shadow-2xl flex items-center justify-center">
          {/* Unlocked / Unblurred High-Res Image */}
          <img
            src={artwork.thumbnailUrl}
            alt={artwork.title}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              isUnlocked ? "blur-0 scale-100" : "blur-2xl saturate-50 brightness-75 scale-105"
            }`}
          />

          {/* Watermark Overlay (Only visible when locked) */}
          {!isUnlocked && (
            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8 select-none pointer-events-none">
              <div className="border-4 border-gold/30 rounded-xl px-6 py-4 bg-bg-primary/80 backdrop-blur-md shadow-2xl flex flex-col items-center gap-2 max-w-sm">
                <svg
                  width="36"
                  height="36"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gold animate-pulse"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span className="text-gold font-bold uppercase tracking-wider text-sm text-center">
                  Premium Exhibition
                </span>
                <span className="text-white/60 text-xs text-center font-medium">
                  Stream micro-payments or purchase to reveal high resolution
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Paywall & Detail Pane */}
      <div className="lg:col-span-5">
        <div className="max-w-md space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4 mb-2">
              <h1 className="text-3xl font-heading font-bold text-text-primary truncate">{artwork.title}</h1>
              <Badge variant={!artwork.price ? "info" : isUnlocked ? "success" : "warning"}>
                {!artwork.price ? "Free to View" : isUnlocked ? "Unlocked" : "Curated Premium"}
              </Badge>
            </div>
            <p className="text-sm text-text-secondary">
              Curated artwork by <span className="font-semibold text-text-primary">{artwork.artist.name}</span>
            </p>
            {!artwork.price && artwork.artist.walletPointer && (
              <div className="mt-3 text-xs text-gold bg-gold/10 border border-gold/20 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse"></span>
                Free to View — Optional Streaming Active to Support the Artist
              </div>
            )}
          </div>

          {/* Smart Paywall Interface */}
          {!isUnlocked ? (
            <Card className="p-6 border-gold/30 bg-gradient-to-br from-bg-secondary to-bg-secondary/40 shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-gold flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  Unlock this Masterpiece
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Support the artist directly using either of the two pathways below:
                </p>
              </div>

              {/* Path A: Web Monetization */}
              <div className="space-y-3 p-4 bg-bg-primary/50 border border-border rounded-xl">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-semibold text-text-primary">Path A: Stream to View</h4>
                  <Badge variant="info" className="text-[10px] py-0.5">Frictionless</Badge>
                </div>

                {monetizationStatus === "no-provider" ? (
                  <p className="text-xs text-text-muted leading-relaxed">
                    No Web Monetization wallet detected. Learn how to{" "}
                    <a
                      href="https://webmonetization.org"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold hover:underline"
                    >
                      set up an ILP browser extension
                    </a>{" "}
                    to support artists passively.
                  </p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-gold animate-pulse">
                      {monetizationStatus === "checking" && "Scanning for provider..."}
                      {monetizationStatus === "detected" && "Extension detected. Initializing payment stream..."}
                      {monetizationStatus === "pending" && "Requesting wallet connection..."}
                      {(monetizationStatus as string) === "streaming" && "Streaming micropayments! Unlocking artwork..."}
                    </p>
                    {(monetizationStatus as string) === "streaming" && streamedAmount > 0 && (
                      <p className="text-xs font-mono text-text-secondary">
                        Streamed: {streamedAmount} {assetCode || "Units"}
                      </p>
                    )}
                  </div>
                )}

                {/* Dev Simulator Toggle */}
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full text-xs h-9 font-medium border border-gold/20 text-gold hover:bg-gold/10 mt-2"
                  onClick={handleSimulateStream}
                >
                  ⚡ Simulate Web Monetization Stream
                </Button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-4 text-xs font-semibold text-text-muted">OR</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              {/* Path B: Flat Fee Purchase */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-semibold text-text-primary">Path B: Acquire Artwork</h4>
                    <p className="text-xs text-text-muted mt-0.5">Outright purchase and ownership</p>
                  </div>
                  <span className="text-xl font-bold text-text-primary">
                    {artwork.price ? formatPrice(artwork.price, preferredCurrency) : "N/A"}
                  </span>
                </div>

                {artwork.status === "FIXED_PRICE" && artwork.price && (
                  <CheckoutButton
                    targetId={artwork.id}
                    type="ARTWORK"
                    amount={Number(artwork.price)}
                    title={artwork.title}
                    initialWalletPointer={userWalletPointer}
                    buttonText="Acquire Artwork"
                    className="w-full h-12 text-sm shadow-[0_0_15px_rgba(124,92,252,0.3)]"
                  />
                )}
              </div>
            </Card>
          ) : (
            /* Unlocked Controls & Info */
            <div className="space-y-4">
              <Card className="p-6 border-success/30 bg-gradient-to-br from-success/5 to-transparent space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-primary">Premium Access Granted</h3>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {hasPaidAccess
                        ? "Acquired via outright purchase"
                        : isSimulated
                        ? "Unlocked via simulated monetization stream"
                        : "Unlocked via active web monetization stream"}
                    </p>
                  </div>
                </div>

                {monetizationStatus === "streaming" && streamedAmount > 0 && (
                  <div className="p-3 bg-bg-secondary border border-border rounded-xl font-mono text-xs text-text-secondary flex justify-between">
                    <span>Streamed:</span>
                    <span className="text-gold font-semibold">{streamedAmount} {assetCode || "Units"}</span>
                  </div>
                )}
              </Card>

              {/* If accessed via streaming but not owned yet, allow acquiring it */}
              {!hasPaidAccess && artwork.price && (
                <Card className="p-6 border-gold/20 bg-bg-secondary space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-semibold text-text-primary">Acquire Artwork</h4>
                      <p className="text-xs text-text-muted mt-0.5">Outright purchase and permanent ownership</p>
                    </div>
                    <span className="text-xl font-bold text-text-primary">
                      {formatPrice(artwork.price, preferredCurrency)}
                    </span>
                  </div>

                  {artwork.status === "FIXED_PRICE" && (
                    <CheckoutButton
                      targetId={artwork.id}
                      type="ARTWORK"
                      amount={Number(artwork.price)}
                      title={artwork.title}
                      initialWalletPointer={userWalletPointer}
                      buttonText="Acquire Artwork"
                      className="w-full h-12 text-sm shadow-[0_0_15px_rgba(124,92,252,0.3)]"
                    />
                  )}
                </Card>
              )}
            </div>
          )}

          {/* Detailed Info */}
          <div className="space-y-4 pt-6 border-t border-border">
            <div>
              <h3 className="text-sm font-medium text-text-primary mb-1">Description</h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {artwork.description || "No description provided."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 text-xs">
              <div>
                <p className="text-text-muted">Monetized Address</p>
                <p className="text-text-primary font-mono truncate" title={artwork.artist.walletPointer || "N/A"}>
                  {artwork.artist.walletPointer || "No curation address configured"}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Preferred Settlement</p>
                <p className="text-text-primary uppercase">{preferredCurrency}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
