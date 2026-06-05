import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getOpenPaymentsClient, formatWalletPointer } from "@/lib/open-payments"
import { auth } from "@/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { targetId, type, amount, buyerWallet } = await req.json()

    if (!targetId || !type || !amount || !buyerWallet) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const txId = crypto.randomUUID()

    // 1. Get Open Payments Client
    const client = await getOpenPaymentsClient()
    if (!client) {
      // Fallback sandbox simulation mode if Open Payments is not configured
      let sellerId = ""
      if (type === 'ARTWORK') {
        const artwork = await prisma.artwork.findUnique({ where: { id: targetId } })
        sellerId = artwork?.artistId || ""
      } else {
        const gallery = await prisma.gallery.findUnique({ where: { id: targetId } })
        sellerId = gallery?.artistId || ""
      }

      await prisma.transaction.create({
        data: {
          id: txId,
          buyerId: session.user.id,
          sellerId,
          artworkId: type === 'ARTWORK' ? targetId : null,
          galleryId: type === 'GALLERY' ? targetId : null,
          type: type === 'ARTWORK' ? 'ONE_TIME_PURCHASE' : 'PAY_TO_VIEW',
          amount,
          platformFee: amount * 0.05,
          status: 'PENDING',
          openPaymentsUrl: `/payment/simulate?txId=${txId}`
        }
      })

      return NextResponse.json({
        success: true,
        redirectUrl: `/payment/simulate?txId=${txId}`,
        transactionId: txId
      })
    }

    // 2. Fetch the Seller (Artist) to get their wallet pointer
    let sellerId = ""
    let description = ""
    
    if (type === 'ARTWORK') {
      const artwork = await prisma.artwork.findUnique({
        where: { id: targetId },
        include: { artist: true }
      })
      if (!artwork || !artwork.artist) {
        return NextResponse.json({ error: "Artwork or Artist not found" }, { status: 404 })
      }
      sellerId = artwork.artistId
      description = `Seamlyy - Purchase Artwork: ${artwork.title}`
    } else if (type === 'GALLERY') {
      const gallery = await prisma.gallery.findUnique({
        where: { id: targetId },
        include: { artist: true }
      })
      if (!gallery || !gallery.artist) {
        return NextResponse.json({ error: "Gallery or Artist not found" }, { status: 404 })
      }
      sellerId = gallery.artistId
      description = `Seamlyy - Unlock Gallery: ${gallery.title}`
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    // 3. Get Seamlyy's Platform Wallet Address info
    const platformWalletUrl = formatWalletPointer(process.env.WALLET_ADDRESS!)
    const platformWalletAddress = await client.walletAddress.get({
      url: platformWalletUrl
    })

    // Calculate invoice scale units for 100% of the price on Seamlyy's wallet
    const platformScaleFactor = Math.pow(10, platformWalletAddress.assetScale)
    const platformUnits = Math.round(amount * platformScaleFactor)

    // 4. Create Incoming Payment (Invoice) on Seamlyy's Wallet (100% of price)
    const incomingPayment = await client.incomingPayment.create(
      { url: platformWalletAddress.resourceServer, accessToken: '' } as any,
      {
        walletAddress: platformWalletAddress.id,
        incomingAmount: {
          value: platformUnits.toString(),
          assetCode: platformWalletAddress.assetCode,
          assetScale: platformWalletAddress.assetScale
        },
        metadata: {
          description,
        }
      }
    )

    // 5. Get Buyer's Wallet Address info
    const formattedBuyerWallet = formatWalletPointer(buyerWallet)
    const buyerWalletAddress = await client.walletAddress.get({
      url: formattedBuyerWallet
    })

    // 6. Create Quote on Buyer's Wallet
    const quote = await client.quote.create(
      { url: buyerWalletAddress.resourceServer, accessToken: '' } as any,
      {
        walletAddress: buyerWalletAddress.id,
        receiver: incomingPayment.id,
        method: "ilp"
      }
    )

    // 7. Request GNAP interactive grant from Buyer's Authorization Server
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
              } as any
            }
          ]
        },
        interact: {
          start: ["redirect"],
          finish: {
            method: "redirect",
            uri: `${baseUrl}/api/sell-art/callback?txId=${txId}`,
            nonce: crypto.randomUUID()
          }
        }
      }
    )

    if (!(grantRequest as any).interact?.redirect) {
      throw new Error("No interact redirect URI returned from grant request")
    }

    // 8. Create pending transaction in our DB
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
      }
    })

    // 9. Save state to Next.js HTTP-only cookies
    const cookieStore = await cookies()
    cookieStore.set('op_continue_uri', grantRequest.continue?.uri || '', { httpOnly: true, secure: true, sameSite: 'lax' })
    cookieStore.set('op_continue_token', grantRequest.continue?.access_token.value || '', { httpOnly: true, secure: true, sameSite: 'lax' })
    cookieStore.set('op_invoice_id', incomingPayment.id, { httpOnly: true, secure: true, sameSite: 'lax' })
    cookieStore.set('op_quote_id', quote.id, { httpOnly: true, secure: true, sameSite: 'lax' })
    cookieStore.set('op_buyer_wallet', buyerWalletAddress.id, { httpOnly: true, secure: true, sameSite: 'lax' })

    return NextResponse.json({
      success: true,
      redirectUrl: (grantRequest as any).interact.redirect,
      transactionId: txId
    })

  } catch (error: any) {
    console.error("Initiate payment error:", error)
    const details = {
      message: error.message,
      description: error.description,
      status: error.status,
      validationErrors: error.validationErrors,
      details: error.details
    }
    console.error("Open Payments details:", JSON.stringify(details, null, 2))
    return NextResponse.json({ 
      error: error.description || error.message || "Failed to initiate payment",
      details
    }, { status: 500 })
  }
}
