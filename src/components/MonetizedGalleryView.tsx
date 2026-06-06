"use client"

import * as React from "react"
import { Avatar, Badge, Card, Button } from "@/components/ui"
import Link from "next/link"
import { CheckoutButton } from "@/components/CheckoutButton"
import { WebMonetizationMeta } from "./WebMonetizationMeta"
import { formatPrice } from "@/lib/utils"

interface MonetizedGalleryViewProps {
  gallery: {
    id: string
    title: string
    description: string | null
    accessFee: number
    coverImageUrl: string
    artistId: string
    artist: {
      name: string | null
      image: string | null
      walletPointer: string | null
    }
    artworks: Array<{
      id: string
      title: string
      thumbnailUrl: string
    }>
  }
  hasPaidAccess: boolean
  preferredCurrency: string
  userWalletPointer: string
}

export function MonetizedGalleryView({
  gallery,
  hasPaidAccess,
  preferredCurrency,
  userWalletPointer
}: MonetizedGalleryViewProps) {
  const [monetizationStatus, setMonetizationStatus] = React.useState<
    "idle" | "checking" | "detected" | "pending" | "streaming" | "no-provider"
  >("idle")
  const [streamedAmount, setStreamedAmount] = React.useState(0)
  const [assetCode, setAssetCode] = React.useState("")
  const [isSimulated, setIsSimulated] = React.useState(false)

  // Unlocked if user has paid access, or is streaming (real or simulated)
  const isUnlocked = hasPaidAccess || monetizationStatus === "streaming" || isSimulated

  React.useEffect(() => {
    // Listen to Web Monetization events continuously to enable testing even after paid access
    if (monetizationStatus !== "streaming") {
      setMonetizationStatus("checking")
    }
    const doc = document as any
    const walletPointer = gallery.artist.walletPointer

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
  }, [gallery.artist.walletPointer])

  const handleSimulateStream = () => {
    setIsSimulated(true)
    setMonetizationStatus("streaming")
  }

  return (
    <div>
      {/* Inject monetization tag for optional streaming support */}
      {gallery.artist.walletPointer && (
        <WebMonetizationMeta paymentPointer={gallery.artist.walletPointer} />
      )}

      {/* Hero Section */}
      <div className="relative h-[55vh] min-h-[380px] flex items-end">
        <div className="absolute inset-0 z-0">
          <img
            src={gallery.coverImageUrl}
            alt={gallery.title}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              isUnlocked ? "blur-none brightness-50" : "blur-md brightness-40 saturate-70"
            }`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pb-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-4">
              <Badge variant={isUnlocked ? "success" : "info"}>
                {isUnlocked ? "Unlocked Premium" : "Premium Exhibition"}
              </Badge>
              {monetizationStatus === "streaming" && (
                <Badge variant="success" className="animate-pulse">
                  Streaming active
                </Badge>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">{gallery.title}</h1>
            <p className="text-lg text-white/80 mb-6 max-w-2xl">{gallery.description}</p>

            <div className="flex items-center gap-4">
              <Link href={`/profile/${gallery.artistId}`}>
                <Avatar src={gallery.artist.image} fallback={gallery.artist.name || "U"} />
              </Link>
              <div>
                <p className="text-xs text-white/60">Curated by</p>
                <Link href={`/profile/${gallery.artistId}`} className="text-white font-medium hover:underline">
                  {gallery.artist.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Collection Container */}
      <div className="container mx-auto px-4 py-16">
        {isUnlocked ? (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center border-b border-border pb-4">
              <h2 className="text-2xl font-heading font-semibold text-text-primary">
                Exhibition Collection ({gallery.artworks.length})
              </h2>
              {monetizationStatus === "streaming" && streamedAmount > 0 && (
                <div className="text-xs font-mono text-text-secondary bg-bg-secondary px-3 py-1.5 rounded-lg border border-border">
                  Active Web Monetization stream: <span className="text-gold font-bold">{streamedAmount} {assetCode || "Units"}</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {gallery.artworks.map((art) => (
                <Link key={art.id} href={`/artwork/${art.id}`}>
                  <Card className="overflow-hidden group h-full flex flex-col border border-border hover:border-gold/30 hover:shadow-xl transition-all duration-300">
                    <div className="relative aspect-square overflow-hidden bg-bg-tertiary">
                      <img
                        src={art.thumbnailUrl}
                        alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <h3 className="text-lg font-semibold text-text-primary truncate">{art.title}</h3>
                      <span className="text-xs text-gold font-medium mt-2 group-hover:underline">
                        View Artwork &rarr;
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          /* Locked State Paywall */
          <div className="max-w-xl mx-auto py-8 animate-fade-in">
            <Card className="p-8 border-gold/30 bg-gradient-to-br from-bg-secondary to-bg-secondary/40 shadow-2xl text-center space-y-8">
              <div className="w-16 h-16 bg-bg-tertiary border border-gold/20 rounded-full flex items-center justify-center mx-auto text-gold animate-pulse">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>

              <div>
                <h2 className="text-2xl font-heading font-bold text-text-primary">Unlock Premium Exhibition</h2>
                <p className="text-sm text-text-secondary mt-2">
                  Gain access to the exclusive high-resolution collection curated by {gallery.artist.name} using one of the channels below:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pt-2">
                {/* Path A: Stream to View */}
                <div className="flex flex-col justify-between p-5 bg-bg-primary/50 border border-border rounded-xl text-left space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gold uppercase tracking-wider">Option A</span>
                    <h4 className="text-sm font-semibold text-text-primary">Stream to View</h4>
                    {monetizationStatus === "no-provider" ? (
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        No Web Monetization client detected. Learn how to{" "}
                        <a
                          href="https://webmonetization.org"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold hover:underline"
                        >
                          setup a wallet extension
                        </a>{" "}
                        to support creators passively.
                      </p>
                    ) : (
                      <p className="text-[11px] text-gold animate-pulse">
                        {monetizationStatus === "checking" && "Scanning browser..."}
                        {monetizationStatus === "detected" && "Connecting wallet..."}
                        {monetizationStatus === "pending" && "Waiting for connection..."}
                        {(monetizationStatus as string) === "streaming" && "Streaming active! Unlocking exhibition..."}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full text-xs font-medium border border-gold/20 text-gold hover:bg-gold/10"
                    onClick={handleSimulateStream}
                  >
                    ⚡ Simulate Stream
                  </Button>
                </div>

                {/* Path B: Ticketed Access */}
                <div className="flex flex-col justify-between p-5 bg-bg-primary/50 border border-border rounded-xl text-left space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-gold uppercase tracking-wider">Option B</span>
                    <h4 className="text-sm font-semibold text-text-primary">Ticketed Access</h4>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      A flat-fee, one-time pass to view this premium gallery.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-text-muted">Fee:</span>
                      <span className="text-lg font-bold text-text-primary">
                        {formatPrice(gallery.accessFee, preferredCurrency)}
                      </span>
                    </div>
                    
                    <CheckoutButton
                      targetId={gallery.id}
                      type="GALLERY"
                      amount={Number(gallery.accessFee)}
                      title={gallery.title}
                      initialWalletPointer={userWalletPointer}
                      buttonText="Buy Ticket Pass"
                      className="w-full h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-text-muted border-t border-border pt-4">
                Exhibition Monetization Address: <span className="font-mono text-text-secondary">{gallery.artist.walletPointer || "N/A"}</span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
