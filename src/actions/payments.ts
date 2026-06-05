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
      const sellerId = type === 'ARTWORK' 
        ? (await prisma.artwork.findUnique({where: {id: targetId}}))?.artistId! 
        : (await prisma.gallery.findUnique({where: {id: targetId}}))?.artistId!

      await prisma.transaction.create({
        data: {
          id: txId,
          buyerId: session.user.id,
          sellerId: sellerId,
          artworkId: type === 'ARTWORK' ? targetId : null,
          galleryId: type === 'GALLERY' ? targetId : null,
          type: type === 'ARTWORK' ? 'ONE_TIME_PURCHASE' : 'PAY_TO_VIEW',
          amount,
          platformFee: amount * 0.05,
          status: 'PENDING',
          openPaymentsUrl: `/payment/simulate?txId=${txId}`
        }
      })

      return {
        success: true,
        redirectUrl: `/payment/simulate?txId=${txId}`,
        transactionId: txId
      }
    }

    const formattedSellerWallet = formatWalletPointer(sellerWalletPointer)
    const formattedBuyerWallet = formatWalletPointer(process.env.WALLET_ADDRESS || '')
    const platformWalletPointer = process.env.PLATFORM_WALLET_POINTER || '$wallet.example.com/seamlyy'
    const formattedPlatformWallet = formatWalletPointer(platformWalletPointer)

    if (!formattedBuyerWallet) {
      return { error: "Platform wallet address not configured in environment." }
    }

    // 1. Get Wallet Address info for both Seller and Platform
    const sellerWalletAddress = await client.walletAddress.get({
      url: formattedSellerWallet
    })
    const platformWalletAddress = await client.walletAddress.get({
      url: formattedPlatformWallet
    })

    // Calculate split units based on each wallet's assetScale (95% to Seller, 5% to Platform)
    const sellerScaleFactor = Math.pow(10, sellerWalletAddress.assetScale)
    const sellerUnits = Math.round((amount * 0.95) * sellerScaleFactor)

    const platformScaleFactor = Math.pow(10, platformWalletAddress.assetScale)
    const platformUnits = Math.round((amount * 0.05) * platformScaleFactor)

    // 2. Create Incoming Payment on Seller's Wallet (95%)
    const incomingPaymentSeller = await client.incomingPayment.create(
      { url: sellerWalletAddress.resourceServer, accessToken: '' } as any,
      {
        walletAddress: sellerWalletAddress.id,
        incomingAmount: {
          value: sellerUnits.toString(),
          assetCode: sellerWalletAddress.assetCode,
          assetScale: sellerWalletAddress.assetScale
        },
        metadata: {
          description: `Seamlyy - ${type} Purchase (Artist Share)`,
        }
      }
    )

    // Create Incoming Payment on Platform's Wallet (5%)
    const incomingPaymentPlatform = await client.incomingPayment.create(
      { url: platformWalletAddress.resourceServer, accessToken: '' } as any,
      {
        walletAddress: platformWalletAddress.id,
        incomingAmount: {
          value: platformUnits.toString(),
          assetCode: platformWalletAddress.assetCode,
          assetScale: platformWalletAddress.assetScale
        },
        metadata: {
          description: `Seamlyy - ${type} Purchase (Platform Commission)`,
        }
      }
    )

    // 3. Create Quotes on Buyer's Wallet
    const buyerWalletAddress = await client.walletAddress.get({
      url: formattedBuyerWallet
    })

    const quoteSeller = await client.quote.create(
      { url: buyerWalletAddress.resourceServer, accessToken: '' } as any,
      {
        walletAddress: buyerWalletAddress.id,
        receiver: incomingPaymentSeller.id,
        method: "ilp"
      }
    )

    const quotePlatform = await client.quote.create(
      { url: buyerWalletAddress.resourceServer, accessToken: '' } as any,
      {
        walletAddress: buyerWalletAddress.id,
        receiver: incomingPaymentPlatform.id,
        method: "ilp"
      }
    )

    // 4. Request GNAP Grant for both outgoing payments in a single request
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
                debitAmount: quoteSeller.debitAmount
              } as any
            },
            {
              type: "outgoing-payment",
              actions: ["create", "read", "list"],
              identifier: buyerWalletAddress.id,
              limits: {
                debitAmount: quotePlatform.debitAmount
              } as any
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

    if (!(grantRequest as any).interact?.redirect) {
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
        platformFee: amount * 0.05,
        status: 'PENDING',
        openPaymentsUrl: grantRequest.continue?.uri,
        shippingDetails: JSON.stringify({
          quoteSellerId: quoteSeller.id,
          quotePlatformId: quotePlatform.id,
          continueToken: grantRequest.continue?.access_token.value as string
        })
      }
    })

    return { 
      success: true, 
      redirectUrl: (grantRequest as any).interact.redirect,
      transactionId: txId
    }
  } catch (error) {
    console.error("Payment error:", error)
    return { error: "Failed to initiate Open Payments transaction" }
  }
}

import { redirect } from "next/navigation"

export async function buyArtworkAction(artworkId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/artwork/${artworkId}`)
  }

  const artwork = await prisma.artwork.findUnique({
    where: { id: artworkId },
    include: { artist: true }
  })
  if (!artwork || !artwork.price) return

  const res = await initiatePayment({
    targetId: artworkId,
    type: 'ARTWORK',
    amount: Number(artwork.price),
    sellerWalletPointer: artwork.artist.walletPointer || '$rafiki.money/p/amara'
  })

  if (res.redirectUrl) {
    redirect(res.redirectUrl)
  }
}

export async function unlockGalleryAction(galleryId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/gallery/${galleryId}`)
  }

  const gallery = await prisma.gallery.findUnique({
    where: { id: galleryId },
    include: { artist: true }
  })
  if (!gallery) return

  const res = await initiatePayment({
    targetId: galleryId,
    type: 'GALLERY',
    amount: Number(gallery.accessFee),
    sellerWalletPointer: gallery.artist.walletPointer || '$rafiki.money/p/amara'
  })

  if (res.redirectUrl) {
    redirect(res.redirectUrl)
  }
}
