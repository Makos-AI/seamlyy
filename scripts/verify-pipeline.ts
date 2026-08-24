import { embedLSBWatermark, extractLSBWatermark, generatePHash, compareHashes } from '../src/lib/inspection-engine'
import { prisma } from '../src/lib/prisma'
import { completePayment } from '../src/actions/payment-complete'
import sharp from 'sharp'

async function runVerificationPipelineTests() {
  console.log("==================================================")
  console.log("⚙️  STARTING SEAMLYY VERIFICATION PIPELINE TESTS")
  console.log("==================================================\n")

  // --------------------------------------------------
  // TEST 1: LSB Steganography Watermarking
  // --------------------------------------------------
  console.log("🧪 Test 1: LSB Watermark embedding & extraction...")
  
  // Create a dummy solid color 100x100 PNG image buffer using sharp
  const testBuffer = await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 4,
      background: { r: 217, g: 164, b: 65, alpha: 1 } // Seamlyy gold
    }
  }).png().toBuffer()

  const artistId = "test-artist-id-12345"
  
  try {
    const watermarkedBuffer = await embedLSBWatermark(testBuffer, artistId)
    console.log("  ✅ Embedded artist ID into image LSB successfully.")

    const extractedPayload = await extractLSBWatermark(watermarkedBuffer)
    console.log(`  🔍 Extracted Payload: "${extractedPayload}"`)

    if (extractedPayload === artistId) {
      console.log("  🎉 SUCCESS: Steganography check passed! Watermark matches original ID.\n")
    } else {
      console.error("  ❌ FAILURE: Extracted watermark does not match.\n")
    }
  } catch (err: any) {
    console.error("  ❌ ERROR in Steganography test:", err.message || err, "\n")
  }

  // --------------------------------------------------
  // TEST 2: Perceptual Hashing & Hamming Distance
  // --------------------------------------------------
  console.log("🧪 Test 2: Perceptual Hashing & signature matching...")

  try {
    // Generate base hash
    const baseHash = await generatePHash(testBuffer)
    console.log(`  🎨 Base Image pHash: ${baseHash}`)

    // Create a slightly modified image (resized to 90x90)
    const modifiedBuffer = await sharp(testBuffer).resize(90, 90).png().toBuffer()
    const modifiedHash = await generatePHash(modifiedBuffer)
    console.log(`  🎨 Modified Image pHash: ${modifiedHash}`)

    // Hamming distance between original and resized should be very small
    const matchingDistance = compareHashes(baseHash, modifiedHash)
    console.log(`  🔍 Hamming Distance (same image resized): ${matchingDistance}`)

    // Create a completely different image (blue background instead of gold)
    const differentBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 4,
        background: { r: 0, g: 0, b: 255, alpha: 1 }
      }
    }).png().toBuffer()
    const differentHash = await generatePHash(differentBuffer)
    const differentDistance = compareHashes(baseHash, differentHash)
    console.log(`  🔍 Hamming Distance (different image): ${differentDistance}`)

    if (matchingDistance < 10 && differentDistance > 20) {
      console.log("  🎉 SUCCESS: Perceptual hashing behaves correctly! Similar images match, different images diverge.\n")
    } else {
      console.error("  ❌ FAILURE: Hash comparisons did not yield expected thresholds.\n")
    }
  } catch (err: any) {
    console.error("  ❌ ERROR in Perceptual Hashing test:", err.message || err, "\n")
  }

  // --------------------------------------------------
  // TEST 3: Payment Flow Verification
  // --------------------------------------------------
  console.log("🧪 Test 3: Transaction creation & payment completion flow...")

  try {
    // Fetch a user from seed to act as buyer
    const buyer = await prisma.user.findFirst({ where: { role: 'VIEWER' } })
    const artist = await prisma.user.findFirst({ where: { role: 'ARTIST' } })
    const artwork = await prisma.artwork.findFirst({ where: { status: 'FIXED_PRICE' } })

    if (!buyer || !artist || !artwork) {
      throw new Error("Missing seeded test data (users or artworks). Run migrations & seeding first.")
    }

    console.log(`  👤 Buyer: ${buyer.name} (${buyer.email})`)
    console.log(`  🖼️  Artwork: "${artwork.title}" - Status: ${artwork.status}`)

    // Create a PENDING transaction simulating click on "Buy Artwork"
    const txId = `test-tx-${crypto.randomUUID()}`
    const transaction = await prisma.transaction.create({
      data: {
        id: txId,
        buyerId: buyer.id,
        sellerId: artist.id,
        artworkId: artwork.id,
        type: 'ONE_TIME_PURCHASE',
        amount: Number(artwork.price || 100.00),
        status: 'PENDING'
      }
    })
    console.log(`  ✅ PENDING transaction record created in database. ID: ${txId}`)

    // Execute payment completion (simulating GNAP checkout redirect callback)
    const paymentResult = await completePayment(txId)
    console.log("  ⚙️  Executing completePayment server action...")

    if (paymentResult.success) {
      // Verify database records updated correctly
      const updatedTx = await prisma.transaction.findUnique({ where: { id: txId } })
      const updatedArt = await prisma.artwork.findUnique({ where: { id: artwork.id } })

      console.log(`  🔍 Updated Transaction Status: ${updatedTx?.status}`)
      console.log(`  🔍 Updated Artwork Status: ${updatedArt?.status}`)

      if (updatedTx?.status === 'COMPLETED' && updatedArt?.status === 'SOLD') {
        console.log("  🎉 SUCCESS: Payment completion verified! Database state is fully consistent.\n")
      } else {
        console.error("  ❌ FAILURE: Database values do not match expected status.\n")
      }
    } else {
      console.error(`  ❌ FAILURE: completePayment returned error: ${paymentResult.error}\n`)
    }

    // Cleanup test transaction
    await prisma.transaction.delete({ where: { id: txId } })

  } catch (err: any) {
    console.error("  ❌ ERROR in Payment verification test:", err.message || err, "\n")
  }

  console.log("==================================================")
  console.log("🏁 VERIFICATION PIPELINE TESTS COMPLETED")
  console.log("==================================================")
}

runVerificationPipelineTests()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("Fatal Test Execution Error:", err)
    process.exit(1)
  })
