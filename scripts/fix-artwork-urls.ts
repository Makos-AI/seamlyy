import { prisma } from '../src/lib/prisma'

/**
 * Fix artwork records that have double-prefixed Supabase Storage URLs.
 * Old URLs: .../artworks/artworks/userId/uuid_thumb.webp  (broken - 400 error)
 * Fixed:    .../artworks/userId/uuid_thumb.webp           (correct)
 * 
 * Also fixes the storage keys stored in the DB.
 */
async function fixArtworkUrls() {
  console.log("=== Fixing Artwork URLs ===\n")
  
  const artworks = await prisma.artwork.findMany()
  console.log(`Found ${artworks.length} artworks in database\n`)

  let fixed = 0

  for (const art of artworks) {
    const updates: any = {}
    let needsUpdate = false

    // Fix thumbnailUrl: remove double prefix
    if (art.thumbnailUrl && art.thumbnailUrl.includes('/artworks/artworks/')) {
      updates.thumbnailUrl = art.thumbnailUrl.replace('/artworks/artworks/', '/artworks/')
      needsUpdate = true
    }

    // Fix thumbnailKey: remove artworks/ prefix from key
    if (art.thumbnailKey && art.thumbnailKey.startsWith('artworks/')) {
      updates.thumbnailKey = art.thumbnailKey.replace(/^artworks\//, '')
      needsUpdate = true
    }

    // Fix displayUrl
    if (art.displayUrl && art.displayUrl.includes('/artworks/artworks/')) {
      updates.displayUrl = art.displayUrl.replace('/artworks/artworks/', '/artworks/')
      needsUpdate = true
    }

    // Fix displayKey
    if (art.displayKey && art.displayKey.startsWith('artworks/')) {
      updates.displayKey = art.displayKey.replace(/^artworks\//, '')
      needsUpdate = true
    }

    // Fix highResKey
    if (art.highResKey && art.highResKey.startsWith('artworks/')) {
      updates.highResKey = art.highResKey.replace(/^artworks\//, '')
      needsUpdate = true
    }

    if (needsUpdate) {
      await prisma.artwork.update({
        where: { id: art.id },
        data: updates
      })
      console.log(`✅ Fixed artwork "${art.title}" (${art.id})`)
      console.log(`   thumbnailUrl: ${art.thumbnailUrl}`)
      console.log(`   → ${updates.thumbnailUrl || art.thumbnailUrl}`)
      fixed++
    } else {
      console.log(`⏭  Artwork "${art.title}" — URLs OK, skipping`)
    }
  }

  console.log(`\n=== Done! Fixed ${fixed} of ${artworks.length} artworks ===`)
}

fixArtworkUrls()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error("Script error:", e)
    process.exit(1)
  })
