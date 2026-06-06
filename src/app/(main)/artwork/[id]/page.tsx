import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { MonetizedArtworkView } from "@/components/MonetizedArtworkView"

export const dynamic = "force-dynamic"

export default async function ArtworkPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  const artwork = await prisma.artwork.findUnique({
    where: { id },
    include: { 
      artist: {
        select: {
          name: true,
          walletPointer: true,
          image: true
        }
      }, 
      gallery: true 
    }
  })

  if (!artwork) return notFound()

  let preferredCurrency = "USD"
  let userWalletPointer = ""
  if (session?.user?.id) {
    const loggedInUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferredCurrency: true, walletPointer: true }
    })
    preferredCurrency = loggedInUser?.preferredCurrency || "USD"
    userWalletPointer = loggedInUser?.walletPointer || ""
  }

  // Determine if the user has paid/authorized access to this artwork
  let hasPaidAccess = false

  // If the artwork does not belong to a premium gallery (accessFee > 0), access is open/free
  const isPremium = artwork.galleryId !== null && artwork.gallery && artwork.gallery.accessFee > 0
  if (!isPremium) {
    hasPaidAccess = true
  } else if (session?.user?.id) {
    // 1. Owner of the artwork has full access
    if (artwork.artistId === session.user.id) {
      hasPaidAccess = true
    } else {
      // 2. Check if user has purchased this artwork directly
      const purchasedArtwork = await prisma.transaction.findFirst({
        where: {
          buyerId: session.user.id,
          artworkId: artwork.id,
          status: 'COMPLETED'
        }
      })
      if (purchasedArtwork) {
        hasPaidAccess = true
      } else if (artwork.galleryId) {
        // 3. Check if user has purchased access to the parent gallery
        const galleryAccess = await prisma.galleryAccess.findUnique({
          where: {
            viewerId_galleryId: {
              viewerId: session.user.id,
              galleryId: artwork.galleryId
            }
          }
        })
        if (galleryAccess) {
          hasPaidAccess = true
        }
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <MonetizedArtworkView
        artwork={{
          id: artwork.id,
          title: artwork.title,
          description: artwork.description,
          price: artwork.price,
          thumbnailUrl: artwork.thumbnailUrl,
          status: artwork.status,
          artist: artwork.artist
        }}
        hasPaidAccess={hasPaidAccess}
        preferredCurrency={preferredCurrency}
        userWalletPointer={userWalletPointer}
      />
    </div>
  )
}
