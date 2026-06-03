"use server"

import { prisma } from "@/lib/prisma"

export async function completePayment(txId: string) {
  try {
    const transaction = await prisma.transaction.update({
      where: { id: txId },
      data: { status: 'COMPLETED' },
      include: { artwork: true, gallery: true }
    })

    if (transaction.type === 'ONE_TIME_PURCHASE' && transaction.artworkId) {
      await prisma.artwork.update({
        where: { id: transaction.artworkId },
        data: { status: 'SOLD' }
      })
    } else if (transaction.type === 'PAY_TO_VIEW' && transaction.galleryId) {
      await prisma.galleryAccess.create({
        data: {
          viewerId: transaction.buyerId,
          galleryId: transaction.galleryId,
          transactionId: transaction.id
        }
      })
    }

    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to complete payment" }
  }
}
