"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getOpenPaymentsClient, formatWalletPointer } from "@/lib/open-payments"

export async function initiatePayment(params: {
  targetId: string, 
  type: 'ARTWORK' | 'GALLERY', 
  amount: number,
  sellerWalletPointer: string
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const { targetId, type, amount, sellerWalletPointer } = params
  const txId = crypto.randomUUID()

  try {
    const client = await getOpenPaymentsClient()
    if (!client) {
      return { error: "Open Payments client not configured." }
    }

    const formattedSellerWallet = formatWalletPointer(sellerWalletPointer)
    const formattedBuyerWallet = formatWalletPointer(process.env.WALLET_ADDRESS || '')

    if (!formattedBuyerWallet) {
      return { error: "Platform wallet address not configured in environment." }
    }

    // 1. Get Seller's Wallet Address info
    const sellerWalletAddress = await client.walletAddress.get({
      url: formattedSellerWallet
    })

    // 2. Create Incoming Payment on Seller's Wallet
    const incomingPayment = await client.incomingPayment.create(
      { url: sellerWalletAddress.resourceServer },
      {
        walletAddress: sellerWalletAddress.id,
        incomingAmount: {
          value: (amount * 100).toString(),
          assetCode: sellerWalletAddress.assetCode,
          assetScale: sellerWalletAddress.assetScale
        },
        metadata: {
          description: `Seamlyy - ${type} Purchase`,
        }
      }
    )

    // 3. Create Quote on Buyer's Wallet
    const buyerWalletAddress = await client.walletAddress.get({
      url: formattedBuyerWallet
    })

    const quote = await client.quote.create(
      { url: buyerWalletAddress.resourceServer },
      {
        walletAddress: buyerWalletAddress.id,
        receiver: incomingPayment.id,
        method: "ilp"
      }
    )

    // 4. Request GNAP Grant for outgoing payment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const grantRequest = await client.grant.request(
      { url: buyerWalletAddress.authServer },
      {
        access_token: {
          access: [
            {
              type: "outgoing-payment",
              actions: ["create", "read", "list"],
              identifier: buyerWalletAddress.id,
              limits: {
                debitAmount: quote.debitAmount,
                receiveAmount: quote.receiveAmount
              }
            }
          ]
        },
        interact: {
          start: ["redirect"],
          finish: {
            method: "redirect",
            uri: `${baseUrl}/api/payments/callback?txId=${txId}`,
            nonce: crypto.randomUUID()
          }
        }
      }
    )

    if (!grantRequest.interact?.redirect) {
      throw new Error("No interact redirect URI returned from grant request")
    }

    const sellerId = type === 'ARTWORK' 
      ? (await prisma.artwork.findUnique({where: {id: targetId}}))?.artistId! 
      : (await prisma.gallery.findUnique({where: {id: targetId}}))?.artistId!

    // 5. Create pending transaction in our DB
    await prisma.transaction.create({
      data: {
        id: txId,
        buyerId: session.user.id,
        sellerId: sellerId,
        artworkId: type === 'ARTWORK' ? targetId : null,
        galleryId: type === 'GALLERY' ? targetId : null,
        type: type === 'ARTWORK' ? 'ONE_TIME_PURCHASE' : 'PAY_TO_VIEW',
        amount,
        status: 'PENDING',
        openPaymentsUrl: grantRequest.continue?.uri,
        shippingDetails: {
          quoteId: quote.id,
          continueToken: grantRequest.continue?.access_token.value
        }
      }
    })

    return { 
      success: true, 
      redirectUrl: grantRequest.interact.redirect,
      transactionId: txId
    }
  } catch (error) {
    console.error("Payment error:", error)
    return { error: "Failed to initiate Open Payments transaction" }
  }
}
