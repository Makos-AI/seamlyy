# Seamlyy — Technical Documentation

> **Version:** 0.1.0  
> **Framework:** Next.js 16.2.7 (App Router, Turbopack)  
> **Repository:** [github.com/Makos-AI/seamlyy](https://github.com/Makos-AI/seamlyy)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [Authentication System](#6-authentication-system)
7. [Pages & Routes](#7-pages--routes)
8. [API Routes](#8-api-routes)
9. [Server Actions](#9-server-actions)
10. [Components](#10-components)
11. [Libraries & Utilities](#11-libraries--utilities)
12. [Payment System (Open Payments / ILP)](#12-payment-system-open-payments--ilp)
13. [Artwork Upload Pipeline](#13-artwork-upload-pipeline)
14. [Digital Copyright & Protection Engine](#14-digital-copyright--protection-engine)
15. [Front-End Rendering Defenses](#15-front-end-rendering-defenses)
16. [Environment Variables](#16-environment-variables)
17. [Deployment](#17-deployment)
18. [Development Guide](#18-development-guide)

---

## 1. Overview

**Seamlyy** is a premium digital art marketplace that enables artists to showcase, monetize, and protect their artwork. It integrates real-time **Web Monetization** via the **Interledger Protocol (ILP)** alongside traditional fixed-price purchases, and features a built-in **Digital Copyright Engine** that uses perceptual hashing and steganography to verify artwork authenticity.

### Core Value Propositions

| Feature | Description |
|---|---|
| **Dual Monetization** | Artists earn through fixed-price sales *and* passive Web Monetization micro-streams |
| **Premium Galleries** | Curated exhibitions gated behind access fees, unlockable via ILP or outright purchase |
| **Digital Copyright Engine** | Automated signature verification (pHash) and invisible watermarking (LSB steganography) |
| **Community Reporting** | Users can flag suspicious artwork for curator review |
| **Canvas-Based Rendering** | Artwork is rendered in HTML5 `<canvas>` elements to deter casual screenshot/right-click theft |

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                     │
│  Next.js App Router (React 19 RSC + Client Components)     │
│  Theme: next-themes (light/dark)                            │
│  Font: Plus Jakarta Sans (Google Fonts)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
   ┌────────────┐ ┌─────────┐ ┌──────────────┐
   │ API Routes │ │ Server  │ │  Static &    │
   │ /api/*     │ │ Actions │ │  RSC Pages   │
   └─────┬──────┘ └────┬────┘ └──────┬───────┘
         │              │             │
         ▼              ▼             ▼
   ┌─────────────────────────────────────────┐
   │              SERVER LAYER               │
   │                                         │
   │  ┌─────────┐  ┌──────────────────────┐  │
   │  │ Prisma  │  │ Supabase Storage     │  │
   │  │ ORM     │  │ (artworks, covers,   │  │
   │  │         │  │  signatures buckets) │  │
   │  └────┬────┘  └──────────┬───────────┘  │
   │       │                  │              │
   │  ┌────┴──────────────────┴────┐         │
   │  │    PostgreSQL (Supabase)   │         │
   │  └────────────────────────────┘         │
   │                                         │
   │  ┌────────────────────────────────────┐ │
   │  │  Interledger Open Payments (ILP)   │ │
   │  │  GNAP Grants, Incoming/Outgoing    │ │
   │  │  Payments, Wallet Address API      │ │
   │  └────────────────────────────────────┘ │
   └─────────────────────────────────────────┘
```

---

## 3. Technology Stack

### Core

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.2.7 |
| Language | TypeScript | 5.x |
| React | React + React DOM | 19.2.4 |
| Styling | Vanilla CSS + Tailwind CSS | 4.x |
| Bundler | Turbopack | Built-in |

### Backend & Data

| Service | Technology | Purpose |
|---|---|---|
| Database | PostgreSQL (Supabase) | Primary data store |
| ORM | Prisma Client | 5.22.0 — Type-safe DB access |
| File Storage | Supabase Storage | Artwork images (artworks, covers, signatures buckets) |
| Auth | NextAuth v5 (beta) | JWT sessions, Google OAuth + Credentials |
| Payments | @interledger/open-payments | ILP-based micropayments & GNAP grants |

### Image Processing & Security

| Library | Purpose |
|---|---|
| `sharp` (0.34.5) | Image resizing, WebP conversion, blur placeholder generation |
| `imghash` (1.1.4) | Perceptual hashing (pHash) for signature verification |
| Custom LSB Engine | Least Significant Bit steganography for invisible watermarking |
| `bcryptjs` (3.0.3) | Password hashing |
| `zod` (4.4.3) | Runtime schema validation |

---

## 4. Project Structure

```
seamlyy/
├── prisma/
│   ├── schema.prisma          # Database schema (all models & relations)
│   └── seed.ts                # Database seeding script
│
├── public/
│   ├── logo.png               # Seamlyy brand logo
│   └── uploads/               # Local fallback storage for artwork files
│
├── src/
│   ├── auth.ts                # NextAuth v5 configuration
│   ├── middleware.ts           # (Not present — auth guards are inline)
│   │
│   ├── app/
│   │   ├── layout.tsx         # Root layout (fonts, metadata, providers)
│   │   ├── (auth)/            # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (main)/            # Main app route group
│   │   │   ├── page.tsx                    # Landing / Home page
│   │   │   ├── layout.tsx                  # Shared layout (Navbar, Footer)
│   │   │   ├── about/page.tsx
│   │   │   ├── how-it-works/page.tsx
│   │   │   ├── explore/page.tsx            # Discover artworks
│   │   │   ├── search/page.tsx             # Search artworks & artists
│   │   │   ├── artwork/[id]/page.tsx       # Individual artwork view
│   │   │   ├── gallery/[id]/page.tsx       # Gallery exhibition view
│   │   │   ├── profile/[id]/page.tsx       # Artist/Viewer profile
│   │   │   ├── payment/
│   │   │   │   ├── success/page.tsx
│   │   │   │   └── error/page.tsx
│   │   │   └── dashboard/
│   │   │       ├── page.tsx                # Artist dashboard
│   │   │       ├── upload/page.tsx         # Upload artwork form
│   │   │       ├── settings/page.tsx       # Profile & Protection settings
│   │   │       └── gallery/
│   │   │           ├── page.tsx            # Gallery management
│   │   │           └── new/page.tsx        # Create new gallery
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts # NextAuth endpoints
│   │   │   ├── upload/route.ts             # Artwork upload + inspection
│   │   │   ├── payments/callback/route.ts  # ILP payment callback
│   │   │   ├── wallet/balance/route.ts     # Wallet balance API
│   │   │   └── metrics/route.ts            # Dashboard metrics
│   │   └── globals.css                     # Global styles & design tokens
│   │
│   ├── actions/
│   │   ├── artwork.ts         # CRUD for artworks & galleries
│   │   ├── auth.ts            # Register & login
│   │   ├── payments.ts        # ILP payment initiation
│   │   ├── payment-complete.ts
│   │   ├── protection.ts      # Signature locking & pHash
│   │   ├── report.ts          # Community artwork reporting
│   │   └── user.ts            # Profile updates, follow/unfollow
│   │
│   ├── components/
│   │   ├── CheckoutButton.tsx
│   │   ├── ImageWithFallback.tsx
│   │   ├── MonetizedArtworkView.tsx
│   │   ├── MonetizedGalleryView.tsx
│   │   ├── ProtectedArtCanvas.tsx
│   │   ├── ReportArtworkModal.tsx
│   │   ├── WebMonetizationMeta.tsx
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MonetizationBanner.tsx
│   │   │   └── SplashScreen.tsx
│   │   ├── dashboard/
│   │   │   ├── WalletStats.tsx
│   │   │   └── TransactionHistory.tsx
│   │   └── ui/
│   │       ├── index.ts       # Barrel export
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Skeleton.tsx
│   │       ├── Toast.tsx
│   │       └── UnlockButton.tsx
│   │
│   ├── lib/
│   │   ├── auth-client.tsx    # Client-side session hooks
│   │   ├── image-processing.ts # Sharp-based image pipeline
│   │   ├── inspection-engine.ts # pHash + LSB steganography
│   │   ├── open-payments.ts   # ILP client factory
│   │   ├── prisma.ts          # Prisma singleton
│   │   ├── s3.ts              # AWS S3 client (legacy)
│   │   ├── supabase.ts        # Supabase admin client
│   │   └── utils.ts           # Formatting helpers
│   │
│   └── types/
│       ├── index.ts           # Enums & constants
│       └── next-auth.d.ts     # NextAuth type extensions
│
├── .env                       # Environment variables (not committed)
├── .env.example               # Template for environment setup
├── next.config.ts             # Next.js configuration
├── package.json
└── tsconfig.json
```

---

## 5. Database Schema

The application uses **PostgreSQL** hosted on **Supabase**, accessed via **Prisma ORM**. Below is a complete reference of every model.

### 5.1 User

Represents both artists and viewers/collectors on the platform.

| Field | Type | Description |
|---|---|---|
| `id` | `String (UUID)` | Primary key |
| `role` | `String` | `"ARTIST"` or `"VIEWER"` (default: `"VIEWER"`) |
| `email` | `String` | Unique email address |
| `emailVerified` | `DateTime?` | Email verification timestamp |
| `hashedPassword` | `String?` | bcrypt hash (null for OAuth users) |
| `googleId` | `String?` | Google OAuth identifier |
| `walletPointer` | `String?` | ILP wallet address (e.g., `$ilp.example.com/alice`) |
| `preferredCurrency` | `String` | `"USD"` or `"NGN"` (default: `"USD"`) |
| `name` | `String?` | Display name |
| `image` | `String?` | Avatar URL |
| `bio` | `String?` | Biography text |
| `location` | `String?` | Geographic location |
| `socialLinks` | `String?` | Social media links |
| `protectionActivated` | `Boolean` | Whether copyright engine is enabled (default: `false`) |
| `signatureLocked` | `Boolean` | Whether master signature is permanently locked (default: `false`) |
| `signatureUrl` | `String?` | Storage path for master signature file |
| `signatureHash` | `String?` | Perceptual hash of the master signature |

**Relations:** `artworks`, `galleries`, `purchases`, `sales`, `galleryAccess`, `savedArtworks`, `followers`, `following`, `accounts`, `reports`

### 5.2 Account

NextAuth provider account linking (Google, Credentials, etc.).

| Field | Type | Description |
|---|---|---|
| `id` | `String (UUID)` | Primary key |
| `userId` | `String` | Foreign key → User |
| `provider` | `String` | e.g., `"google"`, `"credentials"` |
| `providerAccountId` | `String` | Provider-specific user ID |
| `access_token` | `String?` | OAuth access token |
| `refresh_token` | `String?` | OAuth refresh token |

**Unique constraint:** `[provider, providerAccountId]`

### 5.3 Gallery

A curated collection of artworks, optionally gated behind an access fee.

| Field | Type | Description |
|---|---|---|
| `id` | `String (UUID)` | Primary key |
| `artistId` | `String` | Foreign key → User |
| `title` | `String` | Gallery name |
| `description` | `String?` | Gallery description |
| `accessFee` | `Float` | Price to unlock (0 = free) |
| `coverImageUrl` | `String` | Public URL of the cover image |
| `coverImageKey` | `String` | Storage key for the cover image |
| `coverBlurDataURL` | `String?` | Base64 blur placeholder |

**Relations:** `artist`, `artworks`, `transactions`, `access`

### 5.4 Artwork

An individual piece of art uploaded by an artist.

| Field | Type | Description |
|---|---|---|
| `id` | `String (UUID)` | Primary key |
| `artistId` | `String` | Foreign key → User |
| `galleryId` | `String?` | Foreign key → Gallery (null = public portfolio) |
| `title` | `String` | Artwork title |
| `description` | `String?` | Artwork description |
| `medium` | `String?` | Art medium (e.g., "Oil on Canvas") |
| `dimensions` | `String?` | Physical dimensions |
| `yearCreated` | `Int?` | Year the artwork was created |
| `category` | `String?` | One of the predefined categories |
| `status` | `String` | Sales status: `"NOT_FOR_SALE"`, `"FIXED_PRICE"`, `"SOLD"` |
| `price` | `Float?` | Selling price in USD |
| `inspectionStatus` | `String` | Copyright engine result: `"PUBLISHED"`, `"FLAGGED_INVALID_SIGNATURE"`, `"FLAGGED_DUPLICATE_WATERMARK"` |
| `hasValidSignature` | `Boolean` | Whether the pHash matched the artist's master |
| `hasForeignWatermark` | `Boolean` | Whether a foreign LSB watermark was detected |
| `watermarkPayload` | `String?` | Extracted foreign watermark data (artist ID) |
| `thumbnailUrl` | `String` | Public URL — 400px WebP |
| `thumbnailKey` | `String` | Storage key for thumbnail |
| `displayUrl` | `String?` | Public URL — 1200px WebP |
| `displayKey` | `String?` | Storage key for display variant |
| `highResKey` | `String` | Storage key for lossless master file |
| `blurDataURL` | `String?` | Base64 blur placeholder for progressive loading |
| `masterWidth` | `Int?` | Original image width in pixels |
| `masterHeight` | `Int?` | Original image height in pixels |

**Relations:** `artist`, `gallery`, `transactions`, `savedBy`, `reports`  
**Indexes:** `artistId`, `galleryId`, `status`, `category`

### 5.5 Transaction

Records every purchase or gallery unlock.

| Field | Type | Description |
|---|---|---|
| `id` | `String (UUID)` | Primary key |
| `buyerId` | `String` | Foreign key → User |
| `sellerId` | `String` | Foreign key → User |
| `artworkId` | `String?` | Foreign key → Artwork (for artwork purchases) |
| `galleryId` | `String?` | Foreign key → Gallery (for gallery unlocks) |
| `type` | `String` | `"ONE_TIME_PURCHASE"` or `"PAY_TO_VIEW"` |
| `amount` | `Float` | Total transaction amount |
| `platformFee` | `Float` | Seamlyy's commission (default: 0) |
| `currency` | `String` | Settlement currency (default: `"USD"`) |
| `openPaymentsUrl` | `String?` | GNAP grant continuation URL |
| `status` | `String` | `"PENDING"`, `"COMPLETED"`, or `"FAILED"` |
| `shippingDetails` | `String?` | JSON metadata blob for GNAP flow |

### 5.6 GalleryAccess

Tracks which users have unlocked which premium galleries.

| Field | Type | Description |
|---|---|---|
| `viewerId` | `String` | Foreign key → User |
| `galleryId` | `String` | Foreign key → Gallery |
| `transactionId` | `String` | Foreign key → Transaction |
| `unlockedAt` | `DateTime` | Timestamp of unlock |

**Composite Primary Key:** `[viewerId, galleryId]`

### 5.7 SavedArtwork

Bookmarked/favorited artworks for collectors.

| Fields | `viewerId`, `artworkId`, `savedAt` |
|---|---|
| **Composite PK** | `[viewerId, artworkId]` |

### 5.8 Follow

Social following relationship between users.

| Fields | `followerId`, `followingId`, `createdAt` |
|---|---|
| **Composite PK** | `[followerId, followingId]` |

### 5.9 ArtworkReport

Community-submitted reports for suspicious artwork.

| Field | Type | Description |
|---|---|---|
| `id` | `String (UUID)` | Primary key |
| `reason` | `String` | e.g., `"Signature Forgery"`, `"Stolen Artwork"`, `"Impersonation"` |
| `details` | `String?` | Free-text explanation or evidence URLs |
| `artworkId` | `String` | Foreign key → Artwork |
| `reporterId` | `String` | Foreign key → User |

---

## 6. Authentication System

### Implementation

Seamlyy uses **NextAuth v5** (beta) with the `@auth/prisma-adapter` for database-backed sessions.

**Configuration:** [`src/auth.ts`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/auth.ts)

### Providers

| Provider | Method | Details |
|---|---|---|
| **Google OAuth** | Social login | Uses `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` |
| **Credentials** | Email + Password | Passwords hashed with `bcryptjs`. Throws `CredentialsSignin` on failure. |

### Session Strategy

- **JWT-based sessions** (not database sessions)
- The JWT token is extended with `user.id` and `user.role` in the `jwt` callback
- The session object exposes `session.user.id` and `session.user.role` in the `session` callback

### Type Extensions

```typescript
// Extended in src/auth.ts
interface Session {
  user: {
    id: string
    role: string  // "ARTIST" | "VIEWER"
  } & DefaultSession["user"]
}
```

### Client-Side Access

[`src/lib/auth-client.tsx`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/lib/auth-client.tsx) exports:
- `useSession()` — React hook for accessing session data
- `signOut()` — Client-side sign-out function
- `SessionProvider` — Context provider wrapper

### Route Protection

Dashboard routes are protected via an inline redirect pattern in the page component:

```typescript
// src/app/(main)/dashboard/page.tsx
const session = await auth()
if (!session?.user?.id) redirect('/login')
```

---

## 7. Pages & Routes

### Authentication Group `(auth)/`

| Route | File | Description |
|---|---|---|
| `/login` | `(auth)/login/page.tsx` | Email/password login form with Google OAuth button |
| `/register` | `(auth)/register/page.tsx` | User registration with email, name, and password |

### Main Application Group `(main)/`

| Route | File | Rendering | Description |
|---|---|---|---|
| `/` | `page.tsx` | SSR + Cache | Landing page with featured artworks and premium galleries |
| `/explore` | `explore/page.tsx` | Dynamic | Browse all artworks in a responsive grid |
| `/search` | `search/page.tsx` | Dynamic | Search artworks and artists by keyword |
| `/artwork/[id]` | `artwork/[id]/page.tsx` | Dynamic | Individual artwork detail with paywall logic |
| `/gallery/[id]` | `gallery/[id]/page.tsx` | Dynamic | Gallery exhibition view with access-fee gating |
| `/profile/[id]` | `profile/[id]/page.tsx` | Dynamic | Artist portfolio or collector profile |
| `/about` | `about/page.tsx` | Static | About Seamlyy |
| `/how-it-works` | `how-it-works/page.tsx` | Static | Platform explainer |
| `/payment/success` | `payment/success/page.tsx` | Dynamic | Post-payment confirmation |
| `/payment/error` | `payment/error/page.tsx` | Static | Payment failure fallback |

### Dashboard (Protected)

| Route | File | Description |
|---|---|---|
| `/dashboard` | `dashboard/page.tsx` | Artist dashboard: wallet stats, artworks, transactions |
| `/dashboard/upload` | `dashboard/upload/page.tsx` | Upload artwork form with inspection engine integration |
| `/dashboard/settings` | `dashboard/settings/page.tsx` | Profile settings + Artwork Protection activation |
| `/dashboard/gallery` | `dashboard/gallery/page.tsx` | Gallery management |
| `/dashboard/gallery/new` | `dashboard/gallery/new/page.tsx` | Create a new premium gallery |

---

## 8. API Routes

### `POST /api/upload`

**File:** [`src/app/api/upload/route.ts`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/app/api/upload/route.ts)

Handles multipart form uploads. Processes images through `sharp` to generate 3 WebP variants (thumbnail, display, master), runs the **Inspection Engine** (pHash + LSB scan), embeds an invisible watermark if the upload passes, and uploads all files to Supabase Storage.

**Request:** `FormData` with `file` (image) and `folder` (`"artworks"` or `"covers"`)

**Response:**
```json
{
  "success": true,
  "thumbnailUrl": "https://....supabase.co/.../thumb.webp",
  "thumbnailKey": "userId/uuid_thumb.webp",
  "displayUrl": "https://....supabase.co/.../display.webp",
  "displayKey": "userId/uuid_display.webp",
  "highResKey": "userId/uuid_master.jpg",
  "blurDataURL": "data:image/webp;base64,...",
  "masterWidth": 3000,
  "masterHeight": 2000,
  "inspectionStatus": "PUBLISHED",
  "watermarkPayload": null
}
```

### `GET /api/payments/callback`

**File:** [`src/app/api/payments/callback/route.ts`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/app/api/payments/callback/route.ts)

Handles the redirect from the Interledger GNAP authorization flow. Continues the grant, executes outgoing payments to the seller (95%) and platform (5%), updates the transaction status to `COMPLETED`, and marks the artwork as `SOLD` or creates a `GalleryAccess` record.

**Query Params:** `interact_ref`, `txId`

### `GET /api/wallet/balance`

Returns the real-time wallet balance for the authenticated user from the Interledger network.

### `GET /api/auth/[...nextauth]`

NextAuth v5 handler for all authentication endpoints (signin, signout, session, callback).

---

## 9. Server Actions

All server actions use the `"use server"` directive and are located in `src/actions/`.

### Artwork & Gallery Actions

**File:** [`src/actions/artwork.ts`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/actions/artwork.ts)

| Function | Parameters | Description |
|---|---|---|
| `getArtistGalleries()` | — | Returns all galleries owned by the authenticated user |
| `createArtworkAction(data)` | title, description, category, price, galleryId, status, thumbnailUrl, thumbnailKey, displayUrl, displayKey, highResKey, blurDataURL, masterWidth, masterHeight, inspectionStatus, watermarkPayload | Creates an artwork record. Automatically promotes user to `ARTIST` role. Saves inspection flags. Revalidates caches. |
| `createGalleryAction(data)` | title, description, accessFee, coverImageUrl, coverImageKey, coverBlurDataURL | Creates a gallery record. Promotes user to `ARTIST`. |
| `getHighResDownloadUrl(artworkId)` | artworkId | Generates a 60-minute signed Supabase URL for the master file. Requires the user to be the artist, have purchased the artwork, or have gallery access. |

### Authentication Actions

**File:** [`src/actions/auth.ts`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/actions/auth.ts)

| Function | Parameters | Description |
|---|---|---|
| `registerUser(data)` | email, password, name | Hashes password with bcrypt, creates user in DB |
| `loginUser(data)` | email, password | Wraps NextAuth `signIn("credentials")` |

### Payment Actions

**File:** [`src/actions/payments.ts`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/actions/payments.ts)

| Function | Parameters | Description |
|---|---|---|
| `initiatePayment(params)` | targetId, type, amount, sellerWalletPointer | Creates incoming payments on seller (95%) and platform (5%) wallets, generates quotes, requests a GNAP interactive grant, saves a pending transaction |
| `buyArtworkAction(artworkId)` | artworkId | Resolves artwork + artist, calls `initiatePayment` for type `ARTWORK` |
| `unlockGalleryAction(galleryId)` | galleryId | Resolves gallery + artist, calls `initiatePayment` for type `GALLERY` |

### Protection Actions

**File:** [`src/actions/protection.ts`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/actions/protection.ts)

| Function | Parameters | Description |
|---|---|---|
| `activateArtworkProtection(formData)` | FormData with `signatureFile` | Generates a pHash of the uploaded signature, stores the signature in the `signatures` Supabase bucket (private), permanently locks the hash to the user profile (`signatureLocked: true`) |

### Report Actions

**File:** [`src/actions/report.ts`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/actions/report.ts)

| Function | Parameters | Description |
|---|---|---|
| `reportArtworkAction(data)` | artworkId, reason, details | Creates an `ArtworkReport` record linked to the artwork and the reporting user |

### User Actions

**File:** [`src/actions/user.ts`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/actions/user.ts)

| Function | Description |
|---|---|
| `updateProfile(data)` | Updates name, bio, walletPointer, preferredCurrency |
| `getProfile()` | Returns the authenticated user's profile data |
| `followArtistAction(artistId)` | Toggles follow/unfollow relationship |

---

## 10. Components

### Core Display Components

| Component | File | Description |
|---|---|---|
| `MonetizedArtworkView` | [`MonetizedArtworkView.tsx`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/components/MonetizedArtworkView.tsx) | Full artwork detail view with dual-path paywall (Web Monetization streaming OR flat purchase), unlock state management, master file download, and report button |
| `MonetizedGalleryView` | `MonetizedGalleryView.tsx` | Gallery exhibition view with access fee gating and Web Monetization support |
| `ProtectedArtCanvas` | [`ProtectedArtCanvas.tsx`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/components/ProtectedArtCanvas.tsx) | Renders artwork in HTML5 `<canvas>` element to block right-click save, image dragging, and screenshot tools. Includes an invisible overlay shield div. |
| `ImageWithFallback` | `ImageWithFallback.tsx` | Wrapper around `next/image` with error handling and fallback display |
| `CheckoutButton` | `CheckoutButton.tsx` | Triggers the ILP payment flow via `buyArtworkAction` or `unlockGalleryAction` |
| `WebMonetizationMeta` | `WebMonetizationMeta.tsx` | Injects `<link rel="monetization">` tag into the document head |
| `ReportArtworkModal` | [`ReportArtworkModal.tsx`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/components/ReportArtworkModal.tsx) | Modal form for submitting community reports (reason dropdown + details textarea) |

### Layout Components

| Component | File | Description |
|---|---|---|
| `Navbar` | [`layout/Navbar.tsx`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/components/layout/Navbar.tsx) | Sticky navigation with search, theme toggle, auth state, avatar dropdown, mobile menu |
| `Footer` | `layout/Footer.tsx` | Site footer |
| `MonetizationBanner` | `layout/MonetizationBanner.tsx` | Promotional banner for Web Monetization |
| `SplashScreen` | `layout/SplashScreen.tsx` | Initial loading animation |

### Dashboard Components

| Component | File | Description |
|---|---|---|
| `WalletStats` | `dashboard/WalletStats.tsx` | Displays wallet balance, total sales, and streaming revenue |
| `TransactionHistory` | `dashboard/TransactionHistory.tsx` | Paginated table of all purchases and sales |

### UI Primitives (`components/ui/`)

`Avatar`, `Badge`, `Button`, `Card`, `Input`, `Modal`, `Skeleton`, `Toast`, `UnlockButton` — All exported via barrel file `ui/index.ts`.

---

## 11. Libraries & Utilities

### `src/lib/prisma.ts`

Singleton Prisma client instance. Uses the global object pattern to prevent multiple instances in development.

### `src/lib/supabase.ts`

Exports `supabaseAdmin` — a Supabase client initialized with the `SUPABASE_SERVICE_ROLE_KEY` for server-side storage operations (bypasses RLS).

### `src/lib/image-processing.ts`

**`processUploadedImage(buffer, baseKey, mimeType)`**

Uses `sharp` to generate three image variants from a single upload:

| Variant | Format | Max Width | Purpose |
|---|---|---|---|
| Thumbnail | WebP | 400px | Grid cards, previews |
| Display | WebP | 1200px | Full artwork view |
| Master | Original | Unchanged | Lossless archive, high-res download |

Also generates a `blurDataURL` (10px wide Base64 WebP) for progressive loading placeholders.

### `src/lib/inspection-engine.ts`

**File:** [`src/lib/inspection-engine.ts`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/lib/inspection-engine.ts)

| Function | Description |
|---|---|
| `generatePHash(buffer)` | Generates a 64-bit perceptual hash (hex string) from an image buffer using `imghash` |
| `compareHashes(hash1, hash2)` | Calculates the Hamming distance between two hex hashes. Returns 0–64. |
| `embedLSBWatermark(buffer, payload)` | Encodes a string (artist ID) into the least significant bits of image pixel data. Outputs lossless PNG. |
| `extractLSBWatermark(buffer)` | Reads LSB data from an image buffer. Returns the decoded payload string or `null`. |

**Threshold:** A Hamming distance of **≤ 20** is considered a valid signature match.

### `src/lib/open-payments.ts`

| Function | Description |
|---|---|
| `getOpenPaymentsClient()` | Creates an authenticated ILP client using GNAP credentials |
| `formatWalletPointer(pointer)` | Converts `$wallet.example.com/alice` → `https://wallet.example.com/alice` |

### `src/lib/utils.ts`

| Function | Description |
|---|---|
| `formatPrice(amount, currency)` | Formats a number as a localized currency string |
| `cn(...classes)` | Classname merger utility |

---

## 12. Payment System (Open Payments / ILP)

Seamlyy integrates the **Interledger Protocol** via the `@interledger/open-payments` SDK to enable frictionless micropayments.

### Payment Flow

```
┌──────────┐     ┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  Buyer   │────▶│  Seamlyy     │────▶│  ILP Network  │────▶│  Artist      │
│  Browser │     │  Server      │     │  (Rafiki)     │     │  Wallet      │
└──────────┘     └──────────────┘     └───────────────┘     └──────────────┘
     │                  │                                         │
     │  1. Click Buy    │                                         │
     │ ────────────────▶│                                         │
     │                  │  2. Create Incoming Payment (95%)        │
     │                  │ ───────────────────────────────────────▶│
     │                  │  3. Create Incoming Payment (5%)         │
     │                  │ ──────────▶ Platform Wallet              │
     │                  │  4. Create Quotes                        │
     │                  │  5. Request GNAP Grant                   │
     │  6. Redirect to  │                                         │
     │  Auth Server     │                                         │
     │ ◀────────────────│                                         │
     │                  │                                         │
     │  7. User approves│                                         │
     │  8. Redirect to  │                                         │
     │  /api/callback   │                                         │
     │ ────────────────▶│                                         │
     │                  │  9. Continue Grant                       │
     │                  │  10. Execute Outgoing Payments           │
     │                  │  11. Update DB (COMPLETED / SOLD)        │
     │  12. Redirect to │                                         │
     │  /payment/success│                                         │
     │ ◀────────────────│                                         │
```

### Revenue Split

| Recipient | Share |
|---|---|
| Artist (Seller) | **95%** |
| Seamlyy (Platform) | **5%** |

### Web Monetization (Passive Streaming)

When a viewer visits an artwork page, the `<WebMonetizationMeta>` component injects a `<link rel="monetization" href="$artist-wallet-pointer">` tag. If the viewer has a Web Monetization browser extension, micropayments stream passively to the artist while they browse.

---

## 13. Artwork Upload Pipeline

```
User selects file ──▶ Client validates (20MB max, MIME check)
                      │
                      ▼
              POST /api/upload (FormData)
                      │
                      ▼
              ┌───────────────────┐
              │ INSPECTION ENGINE │
              │ (if folder =      │
              │  "artworks" AND   │
              │  protection is ON) │
              ├───────────────────┤
              │ Stage 1: LSB Scan │──▶ Foreign watermark? ──▶ FLAG
              │ Stage 2: pHash    │──▶ Signature mismatch? ──▶ FLAG
              └───────┬───────────┘
                      │ (passes)
                      ▼
              Embed artist ID via LSB into master file
                      │
                      ▼
              sharp processes 3 variants:
              ├── thumbnail (400px WebP)
              ├── display (1200px WebP)
              └── master (original format, watermarked)
                      │
                      ▼
              Upload to Supabase Storage ("artworks" bucket)
                      │
                      ▼
              Return URLs + inspectionStatus to client
                      │
                      ▼
              Client calls createArtworkAction()
              ──▶ Saves to DB with inspectionStatus
              ──▶ If flagged, shows Dialog A or B
              ──▶ If clean, redirects to /dashboard
```

---

## 14. Digital Copyright & Protection Engine

### Activation Flow

1. Artist navigates to **Dashboard → Settings → Artwork Protection**
2. Uploads a master signature image (clear background preferred)
3. System generates a **perceptual hash (pHash)** of the signature
4. Signature is stored in a private `signatures` bucket on Supabase
5. Hash is saved to `User.signatureHash` and `signatureLocked` is set to `true`
6. **This action is permanent** — the signature cannot be changed without contacting support

### Inspection Pipeline (Per Upload)

| Stage | Check | Action on Failure |
|---|---|---|
| **Stage 1** | Extract LSB watermark from uploaded image. If found and the embedded artist ID ≠ the uploader's ID, it belongs to another creator. | Set `inspectionStatus = "FLAGGED_DUPLICATE_WATERMARK"` |
| **Stage 2** | Generate pHash of uploaded image and compare against artist's locked `signatureHash`. If Hamming distance > 20, the signature doesn't match. | Set `inspectionStatus = "FLAGGED_INVALID_SIGNATURE"` |
| **Pass** | No foreign watermark and signature matches (or artist has no protection enabled). | Embed artist's user ID into master file via LSB. Set `inspectionStatus = "PUBLISHED"`. |

### Flagged Upload Dialogs

When the upload returns a non-`PUBLISHED` status, the upload page renders an interactive dialog instead of redirecting to the dashboard:

**Dialog A — Signature Mismatch:**
- ⚠️ Amber warning styling
- Explains possible causes (faint signature, different version)
- Options: "Submit for Manual Curator Review" or "Proceed as Unverified Draft"
- **Contact Us** button at the top

**Dialog B — Duplicate Watermark:**
- 🛑 Red alert styling
- Explains that a foreign copyright watermark was detected
- Options: "File Ownership Dispute" or "Dismiss & Cancel Upload"
- **Contact Us** button at the top

---

## 15. Front-End Rendering Defenses

### Canvas Renderer

The `ProtectedArtCanvas` component renders artwork images inside an HTML5 `<canvas>` element instead of a standard `<img>` tag. This prevents:

- **Right-click → "Save Image As"** (canvas elements don't expose a source URL)
- **Drag & Drop** saving (blocked via `onDragStart` prevention)
- **Context Menu** access (blocked via `onContextMenu` prevention)

An invisible `<div>` overlay sits on top of the canvas (`z-10`) to intercept any remaining pointer events.

### CSS Defenses

```css
/* Prevent text/image selection */
.protected-art-viewport {
  user-select: none;
  -webkit-touch-callout: none;
}

/* Hide artwork during print/PDF export */
@media print {
  canvas, img.protected-art {
    display: none !important;
  }
  body::before {
    content: "Content protected by Seamlyy digital copyright standards.";
    font-size: 24px;
    color: red;
  }
}
```

---

## 16. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string (Supabase pooler) |
| `AUTH_SECRET` | ✅ | NextAuth JWT signing secret |
| `GOOGLE_CLIENT_ID` | ⬜ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ⬜ | Google OAuth client secret |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anonymous key (public, client-safe) |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server-only, bypasses RLS) |
| `WALLET_ADDRESS` | ⬜ | Platform ILP wallet address |
| `PRIVATE_KEY` | ⬜ | ILP GNAP private key |
| `KEY_ID` | ⬜ | ILP GNAP key identifier |
| `PLATFORM_FEE_PERCENT` | ⬜ | Platform commission percentage (default: 5) |

> [!CAUTION]
> `SUPABASE_SERVICE_ROLE_KEY` must be kept strictly server-side. Never prefix it with `NEXT_PUBLIC_`.

---

## 17. Deployment

### Vercel (Recommended)

1. Push code to GitHub (`git push origin main`)
2. Import repository in [Vercel Dashboard](https://vercel.com)
3. Set Framework Preset to **Next.js**
4. Add all environment variables from `.env`
5. Deploy — Vercel automatically runs `npm install` → `prisma generate` (via `postinstall`) → `next build`

### Next.js Configuration

Key settings in [`next.config.ts`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/next.config.ts):

- **`serverExternalPackages`**: `["@interledger/open-payments"]` — excluded from edge bundling
- **Image domains**: `images.unsplash.com`, `*.supabase.co`
- **Local image patterns**: `/uploads/**`
- **Cache headers**: `/uploads/*` served with `Cache-Control: public, max-age=31536000, immutable`

---

## 18. Development Guide

### Prerequisites

- Node.js 18+
- PostgreSQL database (or Supabase project)

### Setup

```bash
git clone https://github.com/Makos-AI/seamlyy.git
cd seamlyy
cp .env.example .env       # Fill in your credentials
npm install                 # Also runs prisma generate via postinstall
npx prisma db push          # Sync schema to database
npm run dev                 # Start dev server at http://localhost:3000
```

### Common Commands

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npx prisma studio` | Open Prisma database GUI |
| `npx prisma db push` | Push schema changes to database |
| `npx prisma generate` | Regenerate Prisma client types |

### Design System

The application uses CSS custom properties defined in `globals.css` for theming:

- `--bg-primary`, `--bg-secondary`, `--bg-tertiary` — Background layers
- `--text-primary`, `--text-secondary`, `--text-muted` — Text hierarchy
- `--gold` — Brand accent color
- `--border` — Border color
- Light/dark themes via `next-themes` with the `class` strategy

### Type System

**Enums** (defined in [`src/types/index.ts`](file:///c:/Users/PC/Desktop/Coding/Seamlyy/src/types/index.ts)):

```typescript
enum UserRole       { ARTIST, VIEWER }
enum ArtworkStatus  { NOT_FOR_SALE, FIXED_PRICE, SOLD }
enum TransactionType   { ONE_TIME_PURCHASE, PAY_TO_VIEW }
enum TransactionStatus { PENDING, COMPLETED, FAILED }

const Categories = [
  'Digital Art', 'Oil Paintings', 'Photography',
  'Sculptures', 'Watercolor', 'Mixed Media'
]
```

---

*Last updated: August 12, 2026*
