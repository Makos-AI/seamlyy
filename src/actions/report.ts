"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function reportArtworkAction(data: {
  artworkId: string
  reason: string
  details?: string
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be logged in to report an artwork." }
  }

  try {
    const report = await prisma.artworkReport.create({
      data: {
        artworkId: data.artworkId,
        reporterId: session.user.id,
        reason: data.reason,
        details: data.details || null
      }
    })

    return { success: true, reportId: report.id }
  } catch (error: any) {
    console.error("[REPORT ACTION] Error:", error)
    return { error: "Failed to submit report. Please try again." }
  }
}
