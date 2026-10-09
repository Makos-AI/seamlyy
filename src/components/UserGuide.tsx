"use client"

import * as React from "react"
import Link from "next/link"

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "ARTIST" | "ART_LOVER"

interface Phase {
  title: string
  steps: Step[]
}

interface Step {
  number: number
  text: React.ReactNode
  note?: React.ReactNode
}

// ─── Content ─────────────────────────────────────────────────────────────────

const ARTIST_PHASES: Phase[] = [
  {
    title: "Phase 1 — Create Your Account",
    steps: [
      {
        number: 1,
        text: (
          <>
            Go to{" "}
            <Link href="/register" className="text-accent hover:underline font-medium">
              /register
            </Link>
            . Enter your email and a secure password, or sign in instantly with Google.
          </>
        ),
      },
      {
        number: 2,
        text: (
          <>
            You will land on the <strong className="text-text-primary">Onboarding</strong> screen.
            Under &ldquo;I am a…&rdquo; select <strong className="text-accent">Artist</strong>.
          </>
        ),
      },
      {
        number: 3,
        text: "Enter your Display Name and a short Bio. These appear publicly on your artist profile and help collectors discover your work.",
      },
      {
        number: 4,
        text: (
          <>
            Click <strong className="text-text-primary">Save &amp; Continue</strong>. You will be taken
            to the Signature Seal setup screen (see Phase 2 below).
          </>
        ),
      },
    ],
  },
  {
    title: "Phase 2 — Complete Your Profile Settings",
    steps: [
      {
        number: 5,
        text: (
          <>
            Navigate to{" "}
            <Link href="/dashboard/settings" className="text-accent hover:underline font-medium">
              Dashboard → Settings
            </Link>
            .
          </>
        ),
      },
      {
        number: 6,
        text: "Set your Preferred Currency (USD or NGN). Prices displayed across the platform will respect this setting.",
      },
      {
        number: 7,
        text: (
          <>
            Under <strong className="text-text-primary">Payment Configuration</strong>, enter your{" "}
            <strong className="text-text-primary">Wallet Pointer</strong> — this is the address where
            all your earnings land directly (e.g.{" "}
            <code className="text-accent bg-bg-tertiary px-1 py-0.5 rounded text-xs">
              $rafiki.money/p/your-handle
            </code>
            ).
          </>
        ),
        note: (
          <>
            <span className="text-gold font-semibold">Get a free testnet wallet →</span>{" "}
            <a
              href="https://rafiki.money"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              rafiki.money
            </a>
            . A live version capable of real payments is coming soon.
          </>
        ),
      },
      {
        number: 8,
        text: (
          <>
            Click <strong className="text-text-primary">Save Changes</strong>.
          </>
        ),
      },
    ],
  },
  {
    title: "Phase 3 — Activate Artwork Protection (Required)",
    steps: [
      {
        number: 9,
        text: "Still in Settings, scroll to the Artwork Protection section.",
      },
      {
        number: 10,
        text: "Upload your Master Signature — a clean image of your handwritten signature or unique artistic mark. A white or transparent background works best.",
      },
      {
        number: 11,
        text: (
          <>
            Click <strong className="text-text-primary">Lock Master Signature &amp; Activate Protection</strong>.
          </>
        ),
        note: (
          <>
            <span className="text-red-400 font-semibold">⚠️ This action is permanent.</span> Once
            locked, your signature cannot be changed without contacting support. Every artwork you
            upload will be automatically scanned against it, and an{" "}
            <strong className="text-text-primary">invisible LSB watermark</strong> embedding your
            Artist ID will be silently added to every image — with zero visible change to the artwork.
          </>
        ),
      },
      {
        number: 12,
        text: "You cannot upload artworks until this step is complete. This protects both you and the platform.",
      },
    ],
  },
  {
    title: "Phase 4 — Upload Your First Artwork",
    steps: [
      {
        number: 13,
        text: (
          <>
            Go to{" "}
            <Link href="/dashboard/upload" className="text-accent hover:underline font-medium">
              Dashboard → Upload Artwork
            </Link>
            .
          </>
        ),
      },
      {
        number: 14,
        text: (
          <>
            Click the upload area and select your image file.{" "}
            <strong className="text-text-primary">Accepted formats: PNG, JPG, WEBP. Maximum size: 20 MB.</strong>
          </>
        ),
      },
      {
        number: 15,
        text: "Fill in the Title, Description, and Category for your artwork.",
      },
      {
        number: 16,
        text: (
          <>
            Choose your monetisation option:
            <ul className="mt-2 ml-4 space-y-1 list-none">
              <li>
                <span className="text-accent font-semibold">Open to Sale</span> — tick this to list
                the artwork at a fixed price. Enter your price in USD.
              </li>
              <li>
                <span className="text-accent font-semibold">Add to Premium Gallery</span> — tick this
                to place the artwork inside a pay-to-view gallery. Select an existing gallery or create
                a new one.
              </li>
              <li>
                <span className="text-text-muted">Leave both unticked</span> to publish the artwork
                freely as a portfolio piece (no purchase option).
              </li>
            </ul>
          </>
        ),
      },
      {
        number: 17,
        text: (
          <>
            Click <strong className="text-text-primary">Upload</strong>. The server will:
            <ul className="mt-2 ml-4 space-y-1 list-disc text-text-secondary text-sm">
              <li>Generate 3 image variants (thumbnail, display, high-resolution master).</li>
              <li>Embed your invisible watermark into all variants.</li>
              <li>Scan for your master signature and verify it matches.</li>
            </ul>
          </>
        ),
      },
      {
        number: 18,
        text: (
          <>
            <strong className="text-green-400">If the scan passes</strong> — your artwork is
            published and immediately visible on your public profile.
            <br />
            <strong className="text-amber-400">If flagged (signature mismatch)</strong> — you&apos;ll
            see an &ldquo;Upload Flagged&rdquo; screen. You can submit it for manual curator review or
            save it as an unverified draft.
            <br />
            <strong className="text-red-400">If flagged (foreign watermark detected)</strong> — a
            watermark belonging to another registered creator was found. You can file an ownership
            dispute or cancel the upload.
          </>
        ),
      },
    ],
  },
  {
    title: "Phase 5 — Create a Premium Gallery (Pay-to-View Exhibition)",
    steps: [
      {
        number: 19,
        text: (
          <>
            Go to{" "}
            <Link href="/dashboard/gallery/new" className="text-accent hover:underline font-medium">
              Dashboard → Gallery → New
            </Link>
            .
          </>
        ),
      },
      {
        number: 20,
        text: "Give your gallery a Title and Description that captures the theme or mood of the collection.",
      },
      {
        number: 21,
        text: "Set an Access Fee in USD (e.g. $2.00). Art Lovers pay this one-time fee to unlock all artworks inside the gallery. You keep 95%.",
      },
      {
        number: 22,
        text: "Upload a Cover Image. This is the first thing people see when browsing galleries.",
      },
      {
        number: 23,
        text: (
          <>
            Click <strong className="text-text-primary">Create Gallery</strong>. When uploading
            artworks, tick &ldquo;Add to Premium Gallery&rdquo; and select this gallery. Artworks inside
            will appear blurred to visitors who have not yet paid.
          </>
        ),
      },
    ],
  },
  {
    title: "Phase 6 — Getting Paid",
    steps: [
      {
        number: 24,
        text: "When a collector buys your artwork or unlocks your gallery, Seamlyy uses Open Payments / Interledger to split the transaction automatically.",
      },
      {
        number: 25,
        text: (
          <>
            <strong className="text-accent">95%</strong> of every payment lands directly in your wallet
            pointer.{" "}
            <strong className="text-text-muted">5%</strong> is the platform fee. No waiting periods.
            No payout schedules. Funds arrive in real time.
          </>
        ),
      },
      {
        number: 26,
        text: (
          <>
            Track all earnings, purchases, and activity from your{" "}
            <Link href="/dashboard" className="text-accent hover:underline font-medium">
              Dashboard
            </Link>
            .
          </>
        ),
      },
    ],
  },
]

const ART_LOVER_PHASES: Phase[] = [
  {
    title: "Phase 1 — Create Your Account",
    steps: [
      {
        number: 1,
        text: (
          <>
            Go to{" "}
            <Link href="/register" className="text-accent hover:underline font-medium">
              /register
            </Link>
            . Enter your email and password, or sign in with Google.
          </>
        ),
      },
      {
        number: 2,
        text: (
          <>
            On the Onboarding screen, under &ldquo;I am a…&rdquo; select{" "}
            <strong className="text-accent">Collector</strong> (Art Lover).
          </>
        ),
      },
      {
        number: 3,
        text: "Enter your Display Name and optionally a short Bio. Then click Save & Continue.",
      },
      {
        number: 4,
        text: (
          <>
            Head to{" "}
            <Link href="/dashboard/settings" className="text-accent hover:underline font-medium">
              Dashboard → Settings
            </Link>{" "}
            to update your preferred currency and optionally add a Wallet Pointer for making payments
            via Interledger.
          </>
        ),
        note: (
          <>
            Get a free testnet wallet at{" "}
            <a
              href="https://rafiki.money"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              rafiki.money
            </a>
            . A live version capable of real payments is coming soon.
          </>
        ),
      },
    ],
  },
  {
    title: "Phase 2 — Discovering Art",
    steps: [
      {
        number: 5,
        text: (
          <>
            Click <strong className="text-text-primary">Galleries</strong> in the navigation bar at
            the top of any page.
          </>
        ),
      },
      {
        number: 6,
        text: (
          <>
            The Galleries hub has three sections:
            <ul className="mt-2 ml-4 space-y-1 list-disc text-text-secondary text-sm">
              <li>
                <strong className="text-text-primary">Featured Artworks</strong> — individual pieces
                available for purchase. Click &ldquo;See More&rdquo; to browse the full catalogue.
              </li>
              <li>
                <strong className="text-text-primary">Featured Galleries</strong> — curated premium
                exhibitions. Blurred images mean the gallery is locked behind a one-time access fee.
              </li>
              <li>
                <strong className="text-text-primary">Explore Artists</strong> — browse all registered
                artist profiles. Click a card to visit their public page.
              </li>
            </ul>
          </>
        ),
      },
      {
        number: 7,
        text: "On an artist's public profile you can see their name, bio, location, follower count, public portfolio, and premium galleries. You cannot see their private transaction history or edit their profile.",
      },
      {
        number: 8,
        text: (
          <>
            Click the <strong className="text-text-primary">Follow</strong> button on any artist
            profile to follow them. Their work will be easier to find next time.
          </>
        ),
      },
    ],
  },
  {
    title: "Phase 3 — Purchasing an Artwork",
    steps: [
      {
        number: 9,
        text: "Click on any artwork to open its detail page.",
      },
      {
        number: 10,
        text: (
          <>
            If the artwork is listed at a fixed price, you will see a{" "}
            <strong className="text-text-primary">Buy Now</strong> button showing the price. Click it.
            You must be logged in — if you are not, you will be redirected to log in first.
          </>
        ),
      },
      {
        number: 11,
        text: "The platform initiates an Open Payments transaction. It creates an incoming payment on the artist's wallet (95% of the price) and routes the 5% platform fee to Seamlyy.",
      },
      {
        number: 12,
        text: "You are redirected to your wallet provider's authorization page to approve the spend.",
      },
      {
        number: 13,
        text: (
          <>
            Once approved, you are returned to Seamlyy. The artwork is now marked as{" "}
            <strong className="text-green-400">Purchased</strong> in your dashboard. You own it.
          </>
        ),
      },
    ],
  },
  {
    title: "Phase 4 — Unlocking a Premium Gallery",
    steps: [
      {
        number: 14,
        text: "Click on any gallery that shows a lock icon and a price badge. All artworks inside will appear blurred.",
      },
      {
        number: 15,
        text: "Click the Unlock button showing the access fee.",
      },
      {
        number: 16,
        text: "Complete the payment the same way as a purchase — you are redirected to approve the spend at your wallet, then returned to Seamlyy.",
      },
      {
        number: 17,
        text: "Once unlocked, all artworks in that gallery are fully visible in high resolution. Your access is stored permanently — you will never need to pay again to view this gallery.",
      },
    ],
  },
  {
    title: "Phase 5 — Saving &amp; Managing Your Collection",
    steps: [
      {
        number: 18,
        text: "On any artwork detail page, click the Save (bookmark) icon to add it to your saved artworks.",
      },
      {
        number: 19,
        text: (
          <>
            View all saved artworks, past purchases, and unlocked galleries from your{" "}
            <Link href="/dashboard" className="text-accent hover:underline font-medium">
              Dashboard
            </Link>
            .
          </>
        ),
      },
      {
        number: 20,
        text: "Your dashboard also shows every artist you follow. Use it as your personal art hub.",
      },
    ],
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepItem({ step }: { step: Step }) {
  return (
    <li className="flex gap-4">
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold flex items-center justify-center mt-0.5">
        {step.number}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-text-secondary text-sm leading-relaxed">{step.text}</p>
        {step.note && (
          <div className="mt-2 pl-3 border-l-2 border-gold/40 text-xs text-text-muted leading-relaxed">
            {step.note}
          </div>
        )}
      </div>
    </li>
  )
}

function PhaseBlock({ phase, index }: { phase: Phase; index: number }) {
  const [open, setOpen] = React.useState(index === 0)

  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 bg-bg-secondary hover:bg-bg-tertiary transition-colors text-left"
      >
        <span className="text-sm font-semibold text-text-primary">{phase.title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`flex-shrink-0 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="px-6 py-5 bg-bg-primary border-t border-border">
          <ul className="space-y-5">
            {phase.steps.map((step) => (
              <StepItem key={step.number} step={step} />
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export function UserGuide() {
  const [tab, setTab] = React.useState<Tab>("ARTIST")
  const phases = tab === "ARTIST" ? ARTIST_PHASES : ART_LOVER_PHASES

  return (
    <section className="container mx-auto px-4 py-20 max-w-4xl">
      {/* Section header */}
      <div className="text-center mb-12">
        <p className="text-accent font-semibold text-sm uppercase tracking-widest mb-3">
          User Guide
        </p>
        <h2 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-4">
          How to use Seamlyy
        </h2>
        <p className="text-lg text-text-secondary max-w-xl mx-auto">
          A detailed walkthrough for every step — from creating your account to making your first
          sale or purchase.
        </p>
      </div>

      {/* Tab toggle */}
      <div className="flex gap-2 p-1 bg-bg-secondary rounded-xl border border-border mb-10 max-w-xs mx-auto">
        <button
          onClick={() => setTab("ARTIST")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            tab === "ARTIST"
              ? "bg-accent text-bg-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          For Artists
        </button>
        <button
          onClick={() => setTab("ART_LOVER")}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
            tab === "ART_LOVER"
              ? "bg-accent text-bg-primary shadow-sm"
              : "text-text-muted hover:text-text-secondary"
          }`}
        >
          For Art Lovers
        </button>
      </div>

      {/* Phase accordion */}
      <div className="space-y-3">
        {phases.map((phase, i) => (
          <PhaseBlock key={phase.title} phase={phase} index={i} />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center">
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-xl px-8 py-3.5 text-sm font-semibold bg-accent text-bg-primary hover:bg-accent-hover transition-colors"
        >
          Get Started — It&apos;s Free
        </Link>
      </div>
    </section>
  )
}
