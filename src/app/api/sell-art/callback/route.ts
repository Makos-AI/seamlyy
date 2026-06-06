import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getOpenPaymentsClient, formatWalletPointer } from "@/lib/open-payments"
import { isPendingGrant } from "@interledger/open-payments"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const interactRef = searchParams.get('interact_ref')
  const txId = searchParams.get('txId')

  if (!interactRef || !txId) {
    console.error("Missing interact_ref or txId in callback parameters")
    return NextResponse.redirect(new URL('/payment/error', req.url))
  }

  try {
    // 1. Fetch transaction record
    const transaction = await prisma.transaction.findUnique({
      where: { id: txId }
    })

    if (!transaction || transaction.status !== 'PENDING') {
      console.error(`Transaction ${txId} not found or not in PENDING state`)
      return NextResponse.redirect(new URL('/payment/error', req.url))
    }

    // 2. Read cookie state
    const cookieStore = await cookies()
    const op_continue_uri = cookieStore.get('op_continue_uri')?.value
    const op_continue_token = cookieStore.get('op_continue_token')?.value
    const op_quote_seller_id = cookieStore.get('op_quote_seller_id')?.value
    const op_quote_platform_id = cookieStore.get('op_quote_platform_id')?.value
    const op_buyer_wallet = cookieStore.get('op_buyer_wallet')?.value

    if (!op_continue_uri || !op_continue_token || !op_quote_seller_id || !op_quote_platform_id || !op_buyer_wallet) {
      console.error("Missing Open Payments transaction cookies")
      return NextResponse.redirect(new URL('/payment/error', req.url))
    }

    const client = await getOpenPaymentsClient()
    if (!client) {
      throw new Error("Open Payments client not configured during callback execution")
    }

    // 3. Continue the GNAP grant
    const continuedGrant = await client.grant.continue(
      {
        url: op_continue_uri,
        accessToken: op_continue_token
      },
      {
        interact_ref: interactRef
      }
    )

    if (isPendingGrant(continuedGrant) || !(continuedGrant as any).access_token) {
      throw new Error("Grant continuation failed or still pending")
    }

    const buyerAccessToken = (continuedGrant as any).access_token.value

    // 4. Resolve buyer's wallet address
    const buyerWalletAddress = await client.walletAddress.get({
      url: formatWalletPointer(op_buyer_wallet)
    })

    // 5. Execute Outgoing Payment 1: Buyer -> Artist (Seller)
    const outgoingPaymentSeller = await client.outgoingPayment.create(
      {
        url: buyerWalletAddress.resourceServer,
        accessToken: buyerAccessToken
      },
      {
        walletAddress: buyerWalletAddress.id,
        quoteId: op_quote_seller_id,
      }
    )

    if (!outgoingPaymentSeller || outgoingPaymentSeller.failed) {
      throw new Error("Outgoing payment from buyer to Artist failed")
    }

    // 6. Execute Outgoing Payment 2: Buyer -> Platform (Commission)
    const outgoingPaymentPlatform = await client.outgoingPayment.create(
      {
        url: buyerWalletAddress.resourceServer,
        accessToken: buyerAccessToken
      },
      {
        walletAddress: buyerWalletAddress.id,
        quoteId: op_quote_platform_id,
      }
    )

    if (!outgoingPaymentPlatform || outgoingPaymentPlatform.failed) {
      throw new Error("Outgoing payment from buyer to Platform failed")
    }

    // 7. Update database transaction status to COMPLETED
    await prisma.transaction.update({
      where: { id: txId },
      data: { status: 'COMPLETED' }
    })

    // 8. Grant product access / mark sold
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

    // 9. Clear transaction cookies
    cookieStore.delete('op_continue_uri')
    cookieStore.delete('op_continue_token')
    cookieStore.delete('op_quote_seller_id')
    cookieStore.delete('op_quote_platform_id')
    cookieStore.delete('op_buyer_wallet')

    return NextResponse.redirect(new URL(`/payment/success?txId=${txId}`, req.url))

  } catch (err) {
    console.error("Callback processing error:", err)
    // Clear cookies on failure to prevent stale state issues
    try {
      const cookieStore = await cookies()
      cookieStore.delete('op_continue_uri')
      cookieStore.delete('op_continue_token')
      cookieStore.delete('op_quote_seller_id')
      cookieStore.delete('op_quote_platform_id')
      cookieStore.delete('op_buyer_wallet')
    } catch {}
    
    return NextResponse.redirect(new URL('/payment/error', req.url))
  }
}

