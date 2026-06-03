"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function updateProfile(data: { name: string, walletPointer: string, bio: string }) {
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
        bio: data.bio
      }
    })
    
    return { success: true }
  } catch (error) {
    return { error: "Failed to update profile" }
  }
}
