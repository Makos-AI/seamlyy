import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getOpenPaymentsClient, formatWalletPointer } from "@/lib/open-payments"
import { auth } from "@/auth"
import { isPendingGrant } from "@interledger/open-payments"

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
    let sellerWalletPointer = ""
    
    if (type === 'ARTWORK') {
      const artwork = await prisma.artwork.findUnique({
        where: { id: targetId },
        include: { artist: true }
      })
      if (!artwork || !artwork.artist) {
        return NextResponse.json({ error: "Artwork or Artist not found" }, { status: 404 })
      }
      sellerId = artwork.artistId
      sellerWalletPointer = artwork.artist.walletPointer || "$rafiki.money/p/amara"
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
      sellerWalletPointer = gallery.artist.walletPointer || "$rafiki.money/p/amara"
      description = `Seamlyy - Unlock Gallery: ${gallery.title}`
    } else {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    // 3. Get Wallet Address info for both Seller (Artist) and Platform
    const formattedSellerWallet = formatWalletPointer(sellerWalletPointer)
    const platformWalletUrl = formatWalletPointer(process.env.WALLET_ADDRESS!)
    
    const sellerWalletAddress = await client.walletAddress.get({
      url: formattedSellerWallet
    })
    const platformWalletAddress = await client.walletAddress.get({
      url: platformWalletUrl
    })

    // Calculate split units based on each wallet's assetScale (95% to Seller, 5% to Platform)
    const sellerScaleFactor = Math.pow(10, sellerWalletAddress.assetScale)
    const sellerUnits = Math.round((amount * 0.95) * sellerScaleFactor)

    const platformScaleFactor = Math.pow(10, platformWalletAddress.assetScale)
    const platformUnits = Math.round((amount * 0.05) * platformScaleFactor)

    // 4. Create Incoming Payment on Seller's Wallet (95%)
    const incomingGrantSeller = await client.grant.request(
      { url: sellerWalletAddress.authServer },
      {
        access_token: {
          access: [
            {
              type: "incoming-payment",
              actions: ["create", "read", "list"],
              identifier: sellerWalletAddress.id
            }
          ]
        }
      }
    )
    if (isPendingGrant(incomingGrantSeller) || !incomingGrantSeller.access_token) {
      throw new Error("Expected non-interactive incoming payment grant for seller")
    }

    const incomingPaymentSeller = await client.incomingPayment.create(
      { url: sellerWalletAddress.resourceServer, accessToken: incomingGrantSeller.access_token.value },
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
    const incomingGrantPlatform = await client.grant.request(
      { url: platformWalletAddress.authServer },
      {
        access_token: {
          access: [
            {
              type: "incoming-payment",
              actions: ["create", "read", "list"],
              identifier: platformWalletAddress.id
            }
          ]
        }
      }
    )
    if (isPendingGrant(incomingGrantPlatform) || !incomingGrantPlatform.access_token) {
      throw new Error("Expected non-interactive incoming payment grant for platform")
    }

    const incomingPaymentPlatform = await client.incomingPayment.create(
      { url: platformWalletAddress.resourceServer, accessToken: incomingGrantPlatform.access_token.value },
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

    // 5. Get Buyer's Wallet Address info
    const formattedBuyerWallet = formatWalletPointer(buyerWallet)
    const buyerWalletAddress = await client.walletAddress.get({
      url: formattedBuyerWallet
    })

    // 6. Create Quotes on Buyer's Wallet
    // Quote for Seller
    const quoteGrantSeller = await client.grant.request(
      { url: buyerWalletAddress.authServer },
      {
        access_token: {
          access: [
            {
              type: "quote",
              actions: ["create", "read"]
            }
          ]
        }
      }
    )
    if (isPendingGrant(quoteGrantSeller) || !quoteGrantSeller.access_token) {
      throw new Error("Expected non-interactive quote grant for seller payment")
    }

    const quoteSeller = await client.quote.create(
      { url: buyerWalletAddress.resourceServer, accessToken: quoteGrantSeller.access_token.value },
      {
        walletAddress: buyerWalletAddress.id,
        receiver: incomingPaymentSeller.id,
        method: "ilp"
      }
    )

    // Quote for Platform
    const quoteGrantPlatform = await client.grant.request(
      { url: buyerWalletAddress.authServer },
      {
        access_token: {
          access: [
            {
              type: "quote",
              actions: ["create", "read"]
            }
          ]
        }
      }
    )
    if (isPendingGrant(quoteGrantPlatform) || !quoteGrantPlatform.access_token) {
      throw new Error("Expected non-interactive quote grant for platform payment")
    }

    const quotePlatform = await client.quote.create(
      { url: buyerWalletAddress.resourceServer, accessToken: quoteGrantPlatform.access_token.value },
      {
        walletAddress: buyerWalletAddress.id,
        receiver: incomingPaymentPlatform.id,
        method: "ilp"
      }
    )


    // 7. Request GNAP interactive grant from Buyer's Authorization Server
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    // Combine both quote debit amounts into a single outgoing-payment limit
    // GNAP does not support duplicate access types — we need ONE entry with the total
    const sellerDebitValue = BigInt(quoteSeller.debitAmount.value)
    const platformDebitValue = BigInt(quotePlatform.debitAmount.value)
    const totalDebitValue = (sellerDebitValue + platformDebitValue).toString()

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
                debitAmount: {
                  value: totalDebitValue,
                  assetCode: quoteSeller.debitAmount.assetCode,
                  assetScale: quoteSeller.debitAmount.assetScale
                }
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
        shippingDetails: JSON.stringify({
          quoteSellerId: quoteSeller.id,
          quotePlatformId: quotePlatform.id,
          continueToken: grantRequest.continue?.access_token.value,
          buyerWallet: buyerWalletAddress.id
        })
      }
    })

    // 9. Save state to Next.js HTTP-only cookies
    // NOTE: secure must be false for http://localhost development; set true in production
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieStore = await cookies()
    cookieStore.set('op_continue_uri', grantRequest.continue?.uri || '', { httpOnly: true, secure: isProduction, sameSite: 'lax' })
    cookieStore.set('op_continue_token', grantRequest.continue?.access_token.value || '', { httpOnly: true, secure: isProduction, sameSite: 'lax' })
    cookieStore.set('op_quote_seller_id', quoteSeller.id, { httpOnly: true, secure: isProduction, sameSite: 'lax' })
    cookieStore.set('op_quote_platform_id', quotePlatform.id, { httpOnly: true, secure: isProduction, sameSite: 'lax' })
    cookieStore.set('op_buyer_wallet', buyerWalletAddress.id, { httpOnly: true, secure: isProduction, sameSite: 'lax' })

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
