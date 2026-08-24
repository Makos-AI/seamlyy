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
    revalidateTag("artworks", "max")

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
    revalidateTag("galleries", "max")
    revalidateTag("artworks", "max")
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

export async function getGalleryById(galleryId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId },
      include: {
        artworks: { select: { id: true, title: true, thumbnailUrl: true } },
        _count: { select: { artworks: true } }
      }
    })

    if (!gallery) {
      return { error: "Gallery not found" }
    }

    if (gallery.artistId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    return { success: true, gallery }
  } catch (error: any) {
    console.error("[GALLERY ACTION] ❌ FAILED to get gallery:", error.message || error)
    return { error: `Failed to get gallery: ${error.message || "Database error"}` }
  }
}

export async function getArtworkById(artworkId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId },
      include: {
        gallery: { select: { id: true, title: true } }
      }
    })

    if (!artwork) {
      return { error: "Artwork not found" }
    }

    if (artwork.artistId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    return { success: true, artwork }
  } catch (error: any) {
    console.error("[ARTWORK ACTION] ❌ FAILED to get artwork:", error.message || error)
    return { error: `Failed to get artwork: ${error.message || "Database error"}` }
  }
}

export async function updateGalleryAction(data: {
  galleryId: string
  title: string
  description: string
  accessFee: number
  coverImageUrl?: string
  coverImageKey?: string
  coverBlurDataURL?: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  console.log(`[GALLERY ACTION] Updating gallery "${data.galleryId}" for user ${session.user.id}`)

  try {
    const gallery = await prisma.gallery.findUnique({
      where: { id: data.galleryId }
    })

    if (!gallery || gallery.artistId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    const updateData: any = {
      title: data.title,
      description: data.description,
      accessFee: data.accessFee
    }
    if (data.coverImageUrl) updateData.coverImageUrl = data.coverImageUrl
    if (data.coverImageKey) updateData.coverImageKey = data.coverImageKey
    if (data.coverBlurDataURL !== undefined) updateData.coverBlurDataURL = data.coverBlurDataURL

    await prisma.gallery.update({
      where: { id: data.galleryId },
      data: updateData
    })

    console.log(`[GALLERY ACTION] ✅ Gallery updated in DB! ID: ${data.galleryId}`)

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/gallery")
    revalidatePath(`/gallery/${data.galleryId}`)
    revalidatePath(`/profile/${session.user.id}`)
    revalidatePath("/explore")
    revalidatePath("/")
    revalidateTag("galleries", "max")
    revalidateTag("artworks", "max")

    return { success: true, galleryId: data.galleryId }
  } catch (error: any) {
    console.error("[GALLERY ACTION] ❌ FAILED to update gallery:", error.message || error)
    return { error: `Failed to update gallery: ${error.message || "Database error"}` }
  }
}

export async function deleteGalleryAction(galleryId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  console.log(`[GALLERY ACTION] Deleting gallery "${galleryId}" for user ${session.user.id}`)

  try {
    const gallery = await prisma.gallery.findUnique({
      where: { id: galleryId }
    })

    if (!gallery || gallery.artistId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    await prisma.gallery.delete({
      where: { id: galleryId }
    })

    console.log(`[GALLERY ACTION] ✅ Gallery deleted in DB! ID: ${galleryId}`)

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/gallery")
    revalidatePath(`/gallery/${galleryId}`)
    revalidatePath(`/profile/${session.user.id}`)
    revalidatePath("/explore")
    revalidatePath("/")
    revalidateTag("galleries", "max")
    revalidateTag("artworks", "max")

    return { success: true }
  } catch (error: any) {
    console.error("[GALLERY ACTION] ❌ FAILED to delete gallery:", error.message || error)
    return { error: `Failed to delete gallery: ${error.message || "Database error"}` }
  }
}

export async function updateArtworkAction(data: {
  artworkId: string
  title: string
  description: string
  price: number | null
  status: string
  category: string
  galleryId: string | null
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  console.log(`[ARTWORK ACTION] Updating artwork "${data.artworkId}" for user ${session.user.id}`)

  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id: data.artworkId }
    })

    if (!artwork || artwork.artistId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    await prisma.artwork.update({
      where: { id: data.artworkId },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        status: data.status,
        category: data.category,
        galleryId: data.galleryId
      }
    })

    console.log(`[ARTWORK ACTION] ✅ Artwork updated in DB! ID: ${data.artworkId}`)

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/gallery")
    revalidatePath(`/artwork/${data.artworkId}`)
    revalidatePath(`/profile/${session.user.id}`)
    revalidatePath("/explore")
    revalidatePath("/")
    revalidateTag("artworks", "max")
    revalidateTag("galleries", "max")

    return { success: true, artworkId: data.artworkId }
  } catch (error: any) {
    console.error("[ARTWORK ACTION] ❌ FAILED to update artwork:", error.message || error)
    return { error: `Failed to update artwork: ${error.message || "Database error"}` }
  }
}

export async function deleteArtworkAction(artworkId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const artwork = await prisma.artwork.findUnique({
      where: { id: artworkId }
    })

    if (!artwork || artwork.artistId !== session.user.id) {
      return { error: "Unauthorized" }
    }

    if (artwork.status === 'SOLD') {
      return { error: "This artwork has been sold and cannot be deleted." }
    }

    // Nullify any transaction references to this artwork
    await prisma.transaction.updateMany({
      where: { artworkId: artworkId },
      data: { artworkId: null }
    })

    await prisma.artwork.delete({
      where: { id: artworkId }
    })

    revalidatePath("/dashboard")
    revalidatePath("/dashboard/gallery")
    revalidatePath(`/profile/${session.user.id}`)
    revalidatePath("/explore")
    revalidatePath("/")
    revalidateTag("artworks", "max")
    revalidateTag("galleries", "max")

    return { success: true }
  } catch (error: any) {
    console.error("[ARTWORK ACTION] ❌ FAILED to delete artwork:", error.message || error)
    return { error: `Failed to delete artwork: ${error.message || "Database error"}` }
  }
}

