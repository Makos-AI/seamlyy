"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function updateProfile(data: { name: string, walletPointer: string, bio: string, preferredCurrency?: string }) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }
  
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: data.name,
        walletPointer: data.walletPointer,
        bio: data.bio,
        preferredCurrency: data.preferredCurrency || "USD"
      }
    })
    
    return { success: true }
  } catch (error) {
    return { error: "Failed to update profile" }
  }
}

export async function getProfile() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: "Unauthorized" }
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        name: true,
        walletPointer: true,
        bio: true,
        preferredCurrency: true,
        protectionActivated: true,
        signatureLocked: true
      }
    })
    
    return { success: true, user }
  } catch (error) {
    return { error: "Failed to fetch profile" }
  }
}

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function followArtistAction(followingId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/profile/${followingId}`)
  }

  const followerId = session.user.id
  if (followerId === followingId) return

  try {
    const existing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    })

    if (existing) {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId
          }
        }
      })
    } else {
      await prisma.follow.create({
        data: {
          followerId,
          followingId
        }
      })
    }

    revalidatePath(`/profile/${followingId}`)
  } catch (error) {
    console.error("Follow error:", error)
  }
}
