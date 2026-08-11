import { prisma } from '../src/lib/prisma'
import { supabaseAdmin } from '../src/lib/supabase'

/**
 * Fix Supabase Storage artwork files: 
 * Files were uploaded with keys like "artworks/userId/uuid_thumb.webp" 
 * inside the "artworks" bucket. The DB URLs were fixed to remove the double prefix,
 * but the actual Storage objects still live at the old keys.
 * 
 * This script copies files from old keys to new keys inside the bucket.
 */
async function fixStorageFiles() {
  console.log("=== Fixing Supabase Storage File Paths ===\n")

  const artworks = await prisma.artwork.findMany()
  console.log(`Found ${artworks.length} artworks\n`)

  for (const art of artworks) {
    // Skip artworks with local paths (/uploads/...)
    if (!art.thumbnailUrl?.includes('supabase.co')) {
      console.log(`⏭  "${art.title}" — local file, skipping`)
      continue
    }

    // The current DB key is "userId/uuid_thumb.webp" (the correct key)
    // But the actual file in the bucket is at "artworks/userId/uuid_thumb.webp" (the old key)
    const oldThumbKey = `artworks/${art.thumbnailKey}`
    const oldDisplayKey = art.displayKey ? `artworks/${art.displayKey}` : null
    const oldMasterKey = `artworks/${art.highResKey}`

    console.log(`\nProcessing "${art.title}" (${art.id})`)
    console.log(`  Current key: ${art.thumbnailKey}`)
    console.log(`  Old key to check: ${oldThumbKey}`)

    // Try to download the file from the old key location
    const { data: oldFileData, error: oldErr } = await supabaseAdmin.storage
      .from('artworks')
      .download(oldThumbKey)

    if (oldFileData && !oldErr) {
      console.log(`  ✅ Found file at old key "${oldThumbKey}", copying to "${art.thumbnailKey}"...`)

      // Upload to the correct (new) key
      const buffer = Buffer.from(await oldFileData.arrayBuffer())
      const { error: upErr } = await supabaseAdmin.storage
        .from('artworks')
        .upload(art.thumbnailKey, buffer, {
          contentType: 'image/webp',
          upsert: true
        })

      if (upErr) {
        console.error(`  ❌ Failed to copy thumbnail: ${upErr.message}`)
      } else {
        console.log(`  ✅ Thumbnail copied successfully`)

        // Also copy display variant
        if (oldDisplayKey && art.displayKey) {
          const { data: dispData } = await supabaseAdmin.storage
            .from('artworks')
            .download(oldDisplayKey)
          if (dispData) {
            const dispBuf = Buffer.from(await dispData.arrayBuffer())
            await supabaseAdmin.storage
              .from('artworks')
              .upload(art.displayKey, dispBuf, { contentType: 'image/webp', upsert: true })
            console.log(`  ✅ Display copied`)
          }
        }

        // Also copy master
        const { data: masterData } = await supabaseAdmin.storage
          .from('artworks')
          .download(oldMasterKey)
        if (masterData) {
          const masterBuf = Buffer.from(await masterData.arrayBuffer())
          const masterType = art.highResKey.endsWith('.webp') ? 'image/webp' : 
                            art.highResKey.endsWith('.png') ? 'image/png' : 'image/jpeg'
          await supabaseAdmin.storage
            .from('artworks')
            .upload(art.highResKey, masterBuf, { contentType: masterType, upsert: true })
          console.log(`  ✅ Master copied`)
        }

        // Delete old files
        await supabaseAdmin.storage.from('artworks').remove([oldThumbKey])
        if (oldDisplayKey) await supabaseAdmin.storage.from('artworks').remove([oldDisplayKey])
        await supabaseAdmin.storage.from('artworks').remove([oldMasterKey])
        console.log(`  🗑️  Old files removed`)
      }
    } else {
      // Check if the file already exists at the correct key
      const { data: newFileData } = await supabaseAdmin.storage
        .from('artworks')
        .download(art.thumbnailKey)
      
      if (newFileData) {
        console.log(`  ✅ File already at correct key "${art.thumbnailKey}"`)
      } else {
        console.log(`  ⚠️  File not found at old key ("${oldThumbKey}") or new key ("${art.thumbnailKey}")`)
      }
    }
  }

  // Also fix gallery covers  
  console.log("\n\n=== Fixing Gallery Cover Files ===\n")
  const galleries = await prisma.gallery.findMany()
  
  for (const gal of galleries) {
    if (!gal.coverImageUrl?.includes('supabase.co')) {
      console.log(`⏭  Gallery "${gal.title}" — local file, skipping`)
      continue
    }

    const oldKey = `covers/${gal.coverImageKey}`
    console.log(`\nProcessing gallery "${gal.title}"`)
    
    // Check if cover key has the old prefix
    if (gal.coverImageKey.startsWith('covers/')) {
      const newKey = gal.coverImageKey.replace(/^covers\//, '')
      const newUrl = gal.coverImageUrl.replace('/covers/covers/', '/covers/')
      
      const { data: oldData } = await supabaseAdmin.storage.from('covers').download(gal.coverImageKey)
      if (oldData) {
        const buf = Buffer.from(await oldData.arrayBuffer())
        await supabaseAdmin.storage.from('covers').upload(newKey, buf, { contentType: 'image/webp', upsert: true })
        await prisma.gallery.update({
          where: { id: gal.id },
          data: { coverImageKey: newKey, coverImageUrl: newUrl }
        })
        console.log(`  ✅ Fixed gallery cover key and URL`)
      }
    } else {
      console.log(`  ✅ Key already correct: ${gal.coverImageKey}`)
    }
  }

  console.log("\n\n=== Done! ===")
}

fixStorageFiles()
  .then(() => process.exit(0))
  .catch(e => { console.error("Error:", e); process.exit(1) })
