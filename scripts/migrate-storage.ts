import { prisma } from "../src/lib/prisma"
import { supabaseAdmin } from "../src/lib/supabase"
import { processUploadedImage } from "../src/lib/image-processing"
import { promises as fs } from "fs"
import path from "path"

async function ensureBucketsExist() {
  const buckets = ["artworks", "covers"]
  for (const bucketName of buckets) {
    const { data, error } = await supabaseAdmin.storage.getBucket(bucketName)
    if (error || !data) {
      console.log(`Creating public storage bucket: ${bucketName}...`)
      const { error: createErr } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 20971520, // 20MB
      })
      if (createErr) {
        console.warn(`Could not create bucket ${bucketName}: ${createErr.message}`)
      } else {
        console.log(`Bucket ${bucketName} created successfully.`)
      }
    } else {
      console.log(`Bucket '${bucketName}' already exists.`)
    }
  }
}

async function uploadVariantToSupabase(
  bucket: string,
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const { error } = await supabaseAdmin.storage.from(bucket).upload(key, buffer, {
    contentType,
    upsert: true,
  })

  if (error) {
    console.error(`Error uploading ${key} to Supabase bucket ${bucket}:`, error.message)
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(key)
  return data.publicUrl
}

async function main() {
  console.log("=== Starting Seamlyy Storage Migration Script ===")

  try {
    await ensureBucketsExist()
  } catch (e) {
    console.warn("Skipping automatic bucket creation:", e)
  }

  // 1. Migrate Artworks
  const artworks = await prisma.artwork.findMany()
  console.log(`\nFound ${artworks.length} artwork records to inspect/migrate.`)

  let migratedArtworks = 0
  for (const art of artworks) {
    try {
      let localRelativePath = art.thumbnailUrl
      if (localRelativePath.startsWith("http://") || localRelativePath.startsWith("https://")) {
        console.log(`Artwork "${art.title}" uses external URL, computing blurDataURL...`)
        continue
      }
      if (localRelativePath.startsWith("/")) {
        localRelativePath = localRelativePath.slice(1)
      }
      
      const localFilePath = path.join(process.cwd(), "public", localRelativePath)

      let fileBuffer: Buffer | null = null
      try {
        fileBuffer = await fs.readFile(localFilePath)
      } catch (err) {
        console.warn(`Local file not found for artwork ${art.id} (${art.title}) at ${localFilePath}`)
      }

      if (fileBuffer) {
        const baseKey = art.thumbnailKey || `artworks/${art.artistId}/${art.id}`
        const processed = await processUploadedImage(fileBuffer, baseKey, "image/jpeg")

        // Try Supabase upload
        let thumbPublicUrl = await uploadVariantToSupabase("artworks", processed.thumbnail.key, processed.thumbnail.buffer, processed.thumbnail.contentType)
        let displayPublicUrl = await uploadVariantToSupabase("artworks", processed.display.key, processed.display.buffer, processed.display.contentType)
        let masterPublicUrl = await uploadVariantToSupabase("artworks", processed.master.key, processed.master.buffer, processed.master.contentType)

        // Fallback to local files if Supabase upload isn't configured
        if (!thumbPublicUrl || thumbPublicUrl.includes("Invalid")) {
          const publicUploadsDir = path.join(process.cwd(), "public", "uploads")
          await fs.mkdir(path.dirname(path.join(publicUploadsDir, processed.thumbnail.key)), { recursive: true })

          await fs.writeFile(path.join(publicUploadsDir, processed.thumbnail.key), processed.thumbnail.buffer)
          await fs.writeFile(path.join(publicUploadsDir, processed.display.key), processed.display.buffer)
          await fs.writeFile(path.join(publicUploadsDir, processed.master.key), processed.master.buffer)

          thumbPublicUrl = `/uploads/${processed.thumbnail.key}`
          displayPublicUrl = `/uploads/${processed.display.key}`
          masterPublicUrl = `/uploads/${processed.master.key}`
        }

        await prisma.artwork.update({
          where: { id: art.id },
          data: {
            thumbnailUrl: thumbPublicUrl,
            thumbnailKey: processed.thumbnail.key,
            displayUrl: displayPublicUrl,
            displayKey: processed.display.key,
            highResKey: processed.master.key,
            blurDataURL: processed.blurDataURL,
            masterWidth: processed.master.width,
            masterHeight: processed.master.height,
          },
        })
        migratedArtworks++
        console.log(`✓ Migrated Artwork "${art.title}" (${art.id}) -> Variants created.`)
      }
    } catch (artErr: any) {
      console.error(`Failed to migrate artwork ${art.id}:`, artErr.message)
    }
  }

  // 2. Migrate Galleries
  const galleries = await prisma.gallery.findMany()
  console.log(`\nFound ${galleries.length} gallery records to inspect/migrate.`)

  let migratedGalleries = 0
  for (const gal of galleries) {
    try {
      let localRelativePath = gal.coverImageUrl
      if (localRelativePath.startsWith("http://") || localRelativePath.startsWith("https://")) {
        console.log(`Gallery "${gal.title}" uses external URL.`)
        continue
      }
      if (localRelativePath.startsWith("/")) {
        localRelativePath = localRelativePath.slice(1)
      }

      const localFilePath = path.join(process.cwd(), "public", localRelativePath)

      let fileBuffer: Buffer | null = null
      try {
        fileBuffer = await fs.readFile(localFilePath)
      } catch (err) {
        console.warn(`Local cover not found for gallery ${gal.id} (${gal.title}) at ${localFilePath}`)
      }

      if (fileBuffer) {
        const baseKey = gal.coverImageKey || `covers/${gal.artistId}/${gal.id}`
        const processed = await processUploadedImage(fileBuffer, baseKey, "image/jpeg")

        let coverPublicUrl = await uploadVariantToSupabase("covers", processed.display.key, processed.display.buffer, processed.display.contentType)

        if (!coverPublicUrl || coverPublicUrl.includes("Invalid")) {
          const publicUploadsDir = path.join(process.cwd(), "public", "uploads")
          await fs.mkdir(path.dirname(path.join(publicUploadsDir, processed.display.key)), { recursive: true })
          await fs.writeFile(path.join(publicUploadsDir, processed.display.key), processed.display.buffer)

          coverPublicUrl = `/uploads/${processed.display.key}`
        }

        await prisma.gallery.update({
          where: { id: gal.id },
          data: {
            coverImageUrl: coverPublicUrl,
            coverImageKey: processed.display.key,
            coverBlurDataURL: processed.blurDataURL,
          },
        })
        migratedGalleries++
        console.log(`✓ Migrated Gallery "${gal.title}" (${gal.id}) -> Cover processed.`)
      }
    } catch (galErr: any) {
      console.error(`Failed to migrate gallery ${gal.id}:`, galErr.message)
    }
  }

  console.log(`\n=== Migration Complete: ${migratedArtworks} artworks & ${migratedGalleries} galleries migrated. ===`)
}

main()
  .catch((err) => {
    console.error("Migration error:", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
