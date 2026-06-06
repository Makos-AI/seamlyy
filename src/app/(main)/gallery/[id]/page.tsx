import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Metadata, ResolvingMetadata } from "next"
import { auth } from "@/auth"
import { MonetizedGalleryView } from "@/components/MonetizedGalleryView"

export const dynamic = "force-dynamic"

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params
  const gallery = await prisma.gallery.findUnique({
    where: { id },
    include: { artist: true }
  })

  if (!gallery) return {}

  const meta: Metadata = {
    title: `${gallery.title} - Seamlyy`,
    description: gallery.description || `View ${gallery.title} on Seamlyy`,
  }

  // Web Monetization Standard (ILP)
  if (gallery.artist.walletPointer) {
    meta.other = {
      monetization: gallery.artist.walletPointer
    }
  }

  return meta
}

export default async function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

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

  const gallery = await prisma.gallery.findUnique({
    where: { id },
    include: { 
      artist: {
        select: {
          name: true,
          image: true,
          walletPointer: true
        }
      },
      artworks: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true
        }
      }
    }
  })

  if (!gallery) return notFound()

  // Determine if the user has paid/authorized access to this premium gallery
  let hasPaidAccess = false

  if (gallery.accessFee === 0) {
    hasPaidAccess = true
  } else if (session?.user?.id) {
    // 1. Owner/artist of the gallery has full access
    if (gallery.artistId === session.user.id) {
      hasPaidAccess = true
    } else {
      // 2. Check if user has purchased access to the gallery
      const galleryAccess = await prisma.galleryAccess.findUnique({
        where: {
          viewerId_galleryId: {
            viewerId: session.user.id,
            galleryId: gallery.id
          }
        }
      })
      if (galleryAccess) {
        hasPaidAccess = true
      }
    }
  }

  return (
    <MonetizedGalleryView
      gallery={{
        id: gallery.id,
        title: gallery.title,
        description: gallery.description,
        accessFee: gallery.accessFee,
        coverImageUrl: gallery.coverImageUrl,
        artistId: gallery.artistId,
        artist: gallery.artist,
        artworks: gallery.artworks
      }}
      hasPaidAccess={hasPaidAccess}
      preferredCurrency={preferredCurrency}
      userWalletPointer={userWalletPointer}
    />
  )
}
