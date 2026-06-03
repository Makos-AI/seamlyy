import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getOpenPaymentsClient, formatWalletPointer } from "@/lib/open-payments"
import { isPendingGrant } from "@interledger/open-payments"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const interactRef = searchParams.get('interact_ref')
  const txId = searchParams.get('txId')

  if (!interactRef || !txId) {
    return NextResponse.redirect(new URL('/payment/error', req.url))
  }

  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: txId }
    })

    if (!transaction || !transaction.openPaymentsUrl || !transaction.shippingDetails) {
      return NextResponse.redirect(new URL('/payment/error', req.url))
    }

    const metadata = transaction.shippingDetails as any

    const client = await getOpenPaymentsClient()
    if (!client) throw new Error("No client")

    // Continue the GNAP grant
    const continuedGrant = await client.grant.continue(
      {
        url: transaction.openPaymentsUrl,
        accessToken: metadata.continueToken
      },
      {
        interact_ref: interactRef
      }
    )

    if (!isPendingGrant(continuedGrant) && (continuedGrant as any).access_token) {
      const buyerWalletAddress = await client.walletAddress.get({
        url: formatWalletPointer(process.env.WALLET_ADDRESS!)
      })

      // Execute Outgoing Payment
      await client.outgoingPayment.create(
        {
          url: buyerWalletAddress.resourceServer,
          accessToken: (continuedGrant as any).access_token.value
        },
        {
          walletAddress: buyerWalletAddress.id,
          quoteId: metadata.quoteId,
        }
      )

      // Complete Transaction in DB
      await prisma.transaction.update({
        where: { id: txId },
        data: { status: 'COMPLETED' }
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

      return NextResponse.redirect(new URL(`/payment/success?txId=${txId}`, req.url))
    }
    
    throw new Error("Grant continuation failed or still pending")
  } catch (err) {
    console.error("Callback error:", err)
    return NextResponse.redirect(new URL('/payment/error', req.url))
  }
}
