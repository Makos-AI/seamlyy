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
    const op_invoice_id = cookieStore.get('op_invoice_id')?.value
    const op_quote_id = cookieStore.get('op_quote_id')?.value
    const op_buyer_wallet = cookieStore.get('op_buyer_wallet')?.value

    if (!op_continue_uri || !op_continue_token || !op_quote_id || !op_buyer_wallet) {
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

    // 5. Execute Outgoing Payment from Buyer -> Seamlyy Platform
    const outgoingPaymentBuyer = await client.outgoingPayment.create(
      {
        url: buyerWalletAddress.resourceServer,
        accessToken: buyerAccessToken
      },
      {
        walletAddress: buyerWalletAddress.id,
        quoteId: op_quote_id,
      }
    )

    if (!outgoingPaymentBuyer || outgoingPaymentBuyer.failed) {
      throw new Error("Outgoing payment from buyer to Seamlyy failed")
    }

    // 6. Split Payment: Payout to Artist (95% of total amount)
    // Find the Seller/Artist user in database
    const seller = await prisma.user.findUnique({
      where: { id: transaction.sellerId }
    })

    if (!seller || !seller.walletPointer) {
      console.warn(`Seller ${transaction.sellerId} does not have a wallet pointer configured. Platform keeping 100% of funds.`)
    } else {
      console.log(`Processing payout of 95% from Seamlyy to artist: ${seller.walletPointer}`)

      const artistWalletPointer = formatWalletPointer(seller.walletPointer)
      const artistWalletAddress = await client.walletAddress.get({
        url: artistWalletPointer
      })

      // Resolve Seamlyy's Platform Wallet Address info
      const platformWalletUrl = formatWalletPointer(process.env.WALLET_ADDRESS!)
      const platformWalletAddress = await client.walletAddress.get({
        url: platformWalletUrl
      })

      const artistShareUSD = transaction.amount * 0.95
      let artistUnits: number

      // If currencies match, we can skip rate discovery
      if (platformWalletAddress.assetCode === artistWalletAddress.assetCode) {
        artistUnits = Math.round(artistShareUSD * Math.pow(10, artistWalletAddress.assetScale))
      } else {
        // Cross-currency split payment: perform rate discovery first by creating a temporary 1-unit invoice/quote
        console.log(`Currencies differ (${platformWalletAddress.assetCode} -> ${artistWalletAddress.assetCode}). Querying testnet conversion rate...`)
        
        // 1. Grant for temporary incoming payment
        const tempIncomingGrant = await client.grant.request(
          { url: artistWalletAddress.authServer },
          {
            access_token: {
              access: [
                {
                  type: "incoming-payment",
                  actions: ["create", "read", "list"],
                  identifier: artistWalletAddress.id
                }
              ]
            }
          }
        )
        if (isPendingGrant(tempIncomingGrant) || !tempIncomingGrant.access_token) {
          throw new Error("Failed to request non-interactive grant for rate discovery invoice")
        }

        // 2. Create 1-unit temporary incoming payment (e.g. 1.00 EUR or 1.00 NGN)
        const tempValue = Math.pow(10, artistWalletAddress.assetScale).toString()
        const tempIncomingPayment = await client.incomingPayment.create(
          { url: artistWalletAddress.resourceServer, accessToken: tempIncomingGrant.access_token.value },
          {
            walletAddress: artistWalletAddress.id,
            incomingAmount: {
              value: tempValue,
              assetCode: artistWalletAddress.assetCode,
              assetScale: artistWalletAddress.assetScale
            },
            metadata: { description: "Temp Invoice for Rate Discovery" }
          }
        )

        // 3. Grant for temporary quote
        const tempQuoteGrant = await client.grant.request(
          { url: platformWalletAddress.authServer },
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
        if (isPendingGrant(tempQuoteGrant) || !tempQuoteGrant.access_token) {
          throw new Error("Failed to request non-interactive grant for rate discovery quote")
        }

        // 4. Create temporary quote to pay the 1-unit invoice
        const tempQuote = await client.quote.create(
          { url: platformWalletAddress.resourceServer, accessToken: tempQuoteGrant.access_token.value },
          {
            walletAddress: platformWalletAddress.id,
            receiver: tempIncomingPayment.id,
            method: "ilp"
          }
        )

        // 5. Calculate rate: Artist units per Platform unit (e.g. EUR per USD)
        const debitVal = parseFloat(tempQuote.debitAmount.value) / Math.pow(10, tempQuote.debitAmount.assetScale)
        const receiveVal = parseFloat(tempQuote.receiveAmount.value) / Math.pow(10, tempQuote.receiveAmount.assetScale)
        const rate = receiveVal / debitVal

        console.log(`Discovered Rate: 1 ${platformWalletAddress.assetCode} = ${rate.toFixed(6)} ${artistWalletAddress.assetCode}`)
        
        // Calculate the exact amount Victor should receive in his currency (EUR/NGN) to cost the platform exactly 95% in USD
        const finalArtistAmount = artistShareUSD * rate
        artistUnits = Math.round(finalArtistAmount * Math.pow(10, artistWalletAddress.assetScale))
      }

      console.log(`Creating final invoice for artist: ${artistUnits / Math.pow(10, artistWalletAddress.assetScale)} ${artistWalletAddress.assetCode}`)

      // a. Create Real Incoming Payment (Invoice) on Artist's Wallet
      const incomingGrantArtist = await client.grant.request(
        { url: artistWalletAddress.authServer },
        {
          access_token: {
            access: [
              {
                type: "incoming-payment",
                actions: ["create", "read", "list"],
                identifier: artistWalletAddress.id
              }
            ]
          }
        }
      )

      if (isPendingGrant(incomingGrantArtist) || !incomingGrantArtist.access_token) {
        throw new Error("Expected non-interactive incoming payment grant for artist")
      }

      const incomingPaymentArtist = await client.incomingPayment.create(
        { url: artistWalletAddress.resourceServer, accessToken: incomingGrantArtist.access_token.value },
        {
          walletAddress: artistWalletAddress.id,
          incomingAmount: {
            value: artistUnits.toString(),
            assetCode: artistWalletAddress.assetCode,
            assetScale: artistWalletAddress.assetScale
          },
          metadata: {
            description: `Seamlyy - Payout for transaction ${txId}`,
          }
        }
      )

      // b. Request a non-interactive quote grant from Seamlyy's auth server
      const quoteGrantArtist = await client.grant.request(
        { url: platformWalletAddress.authServer },
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

      if (isPendingGrant(quoteGrantArtist) || !quoteGrantArtist.access_token) {
        throw new Error("Expected non-interactive quote grant for artist payout")
      }

      // c. Create Quote on Seamlyy's Platform Wallet
      const quoteArtist = await client.quote.create(
        { url: platformWalletAddress.resourceServer, accessToken: quoteGrantArtist.access_token.value },
        {
          walletAddress: platformWalletAddress.id,
          receiver: incomingPaymentArtist.id,
          method: "ilp"
        }
      )

      console.log(`Executing payout: Seamlyy will pay ${parseFloat(quoteArtist.debitAmount.value) / Math.pow(10, quoteArtist.debitAmount.assetScale)} ${platformWalletAddress.assetCode} to deliver ${parseFloat(quoteArtist.receiveAmount.value) / Math.pow(10, quoteArtist.receiveAmount.assetScale)} ${artistWalletAddress.assetCode}`)

      // d. Execute Outgoing Payment from Seamlyy -> Artist (using SEAMLYY_LONG_LIVED_TOKEN)
      const outgoingPaymentArtist = await client.outgoingPayment.create(
        {
          url: platformWalletAddress.resourceServer,
          accessToken: process.env.SEAMLYY_LONG_LIVED_TOKEN!
        },
        {
          walletAddress: platformWalletAddress.id,
          quoteId: quoteArtist.id
        }
      )

      if (!outgoingPaymentArtist || outgoingPaymentArtist.failed) {
        console.error("Payout to Artist failed:", outgoingPaymentArtist)
        throw new Error("Payout to Artist failed")
      } else {
        console.log(`Successfully completed payout to artist: ${outgoingPaymentArtist.id}`)
      }
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
    cookieStore.delete('op_invoice_id')
    cookieStore.delete('op_quote_id')
    cookieStore.delete('op_buyer_wallet')

    return NextResponse.redirect(new URL(`/payment/success?txId=${txId}`, req.url))

  } catch (err) {
    console.error("Callback processing error:", err)
    // Clear cookies on failure to prevent stale state issues
    try {
      const cookieStore = await cookies()
      cookieStore.delete('op_continue_uri')
      cookieStore.delete('op_continue_token')
      cookieStore.delete('op_invoice_id')
      cookieStore.delete('op_quote_id')
      cookieStore.delete('op_buyer_wallet')
    } catch {}
    
    return NextResponse.redirect(new URL('/payment/error', req.url))
  }
}
