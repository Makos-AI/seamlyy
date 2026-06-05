"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

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
  highResKey: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
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
        highResKey: data.highResKey
      }
    })

    revalidatePath("/dashboard")
    revalidatePath("/explore")
    revalidatePath(`/profile/${session.user.id}`)
    revalidatePath("/")
    return { success: true, artworkId: artwork.id }
  } catch (error: any) {
    console.error("Create artwork action error:", error)
    return { error: error.message || "Failed to create artwork" }
  }
}

export async function createGalleryAction(data: {
  title: string
  description: string
  accessFee: number
  coverImageUrl: string
  coverImageKey: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }

  try {
    const gallery = await prisma.gallery.create({
      data: {
        artistId: session.user.id,
        title: data.title,
        description: data.description,
        accessFee: data.accessFee,
        coverImageUrl: data.coverImageUrl,
        coverImageKey: data.coverImageKey
      }
    })

    revalidatePath("/dashboard")
    revalidatePath("/explore")
    revalidatePath(`/profile/${session.user.id}`)
    revalidatePath("/")
    return { success: true, galleryId: gallery.id }
  } catch (error: any) {
    console.error("Create gallery action error:", error)
    return { error: error.message || "Failed to create gallery" }
  }
}
