"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath, revalidateTag } from "next/cache"

export async function getArtistGalleries() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const galleries = await prisma.gallery.findMany({
      where: { artistId: session.user.id }
    })
    return { success: true, galleries }
  } catch (error) {
    console.error("Failed to fetch artist galleries:", error)
    return { error: "Failed to fetch galleries" }
  }
}

export async function createArtworkAction(data: {
  title: string
  description: string
  category: string
  price: number | null
  galleryId: string | null
  status: string
  thumbnailUrl: string
  thumbnailKey: string
  displayUrl?: string | null
  displayKey?: string | null
  highResKey: string
  blurDataURL?: string | null
  masterWidth?: number | null
  masterHeight?: number | null
  inspectionStatus?: string
  watermarkPayload?: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) {
    console.error("[ARTWORK ACTION] ❌ No session found — user not authenticated")
    return { error: "Unauthorized" }
  }

  console.log(`[ARTWORK ACTION] Creating artwork "${data.title}" for user ${session.user.id}`)
  console.log(`[ARTWORK ACTION] thumbnailUrl: ${data.thumbnailUrl}`)
  console.log(`[ARTWORK ACTION] highResKey: ${data.highResKey}`)
  console.log(`[ARTWORK ACTION] galleryId: ${data.galleryId || "none (public portfolio)"}`)

  try {
    // Ensure user role is ARTIST so dashboard displays artist portfolio
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "ARTIST" }
    })
    console.log(`[ARTWORK ACTION] ✅ User role set to ARTIST`)

    const artwork = await prisma.artwork.create({
      data: {
        artistId: session.user.id,
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        galleryId: data.galleryId || null,
        status: data.status,
        thumbnailUrl: data.thumbnailUrl,
        thumbnailKey: data.thumbnailKey,
        displayUrl: data.displayUrl || data.thumbnailUrl,
        displayKey: data.displayKey || data.thumbnailKey,
        highResKey: data.highResKey,
        blurDataURL: data.blurDataURL || null,
        masterWidth: data.masterWidth || null,
        masterHeight: data.masterHeight || null,
        inspectionStatus: data.inspectionStatus || "PUBLISHED",
        watermarkPayload: data.watermarkPayload || null,
        hasValidSignature: data.inspectionStatus === "PUBLISHED" ? true : false,
        hasForeignWatermark: data.inspectionStatus === "FLAGGED_DUPLICATE_WATERMARK" ? true : false
      }
    })

    console.log(`[ARTWORK ACTION] ✅ Artwork created in DB! ID: ${artwork.id}`)

    revalidatePath("/dashboard")
    revalidatePath("/explore")
    revalidatePath(`/profile/${session.user.id}`)
    revalidatePath("/")
    revalidateTag("artworks")

    console.log(`[ARTWORK ACTION] ✅ Cache revalidated for dashboard, explore, profile, home`)

    return { success: true, artworkId: artwork.id }
  } catch (error: any) {
    console.error("[ARTWORK ACTION] ❌ FAILED to create artwork:", error.message || error)
    console.error("[ARTWORK ACTION] Full error:", error)
    return { error: `Failed to create artwork: ${error.message || "Database error"}` }
  }
}

export async function createGalleryAction(data: {
  title: string
  description: string
  accessFee: number
  coverImageUrl: string
  coverImageKey: string
  coverBlurDataURL?: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  console.log(`[GALLERY ACTION] Creating gallery "${data.title}" for user ${session.user.id}`)

  try {
    // Ensure user role is ARTIST so gallery management and portfolio controls show
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "ARTIST" }
    })

    const gallery = await prisma.gallery.create({
      data: {
        artistId: session.user.id,
        title: data.title,
        description: data.description,
        accessFee: data.accessFee,
        coverImageUrl: data.coverImageUrl,
        coverImageKey: data.coverImageKey,
        coverBlurDataURL: data.coverBlurDataURL || null
      }
    })

    console.log(`[GALLERY ACTION] ✅ Gallery created in DB! ID: ${gallery.id}`)

    revalidatePath("/dashboard")
    revalidatePath("/explore")
    revalidatePath(`/profile/${session.user.id}`)
    revalidatePath("/")
    revalidateTag("galleries")
    revalidateTag("artworks")
    return { success: true, galleryId: gallery.id }
  } catch (error: any) {
    console.error("[GALLERY ACTION] ❌ FAILED:", error.message || error)
    return { error: `Failed to create gallery: ${error.message || "Database error"}` }
  }
}

export async function getHighResDownloadUrl(artworkId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      include: { gallery: true }
    })

    if (!artwork) {
      return { error: "Artwork not found" }
    }

    const isArtist = artwork.artistId === session.user.id
    
    const purchase = await prisma.transaction.findFirst({
      where: {
        buyerId: session.user.id,
        artworkId: artwork.id,
        status: 'COMPLETED'
      }
    })

    let hasGalleryAccess = false
    if (artwork.galleryId) {
      const gAccess = await prisma.galleryAccess.findFirst({
        where: {
          viewerId: session.user.id,
          galleryId: artwork.galleryId
        }
      })
      hasGalleryAccess = !!gAccess
    }

    if (!isArtist && !purchase && !hasGalleryAccess) {
      return { error: "Access denied. Purchase or unlock gallery to download master." }
    }

    const { supabaseAdmin } = await import("@/lib/supabase")

    let downloadUrl = `/uploads/${artwork.highResKey}`

    try {
      const { data, error } = await supabaseAdmin.storage
        .from("artworks")
        .createSignedUrl(artwork.highResKey, 3600)

      if (data?.signedUrl && !error) {
        downloadUrl = data.signedUrl
      }
    } catch (e) {
      console.warn("Supabase signed URL error, using default URL path:", e)
    }

    return { success: true, downloadUrl, title: artwork.title }
  } catch (error: any) {
    console.error("High res download error:", error)
    return { error: error.message || "Failed to generate download link" }
  }
}
