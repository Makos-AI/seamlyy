import { prisma } from '../src/lib/prisma'
import { supabaseAdmin } from '../src/lib/supabase'

async function cleanAndVerify() {
  console.log("=== Step 1: Remove orphaned artwork records ===\n")

  const artworks = await prisma.artwork.findMany({
    select: { id: true, title: true, thumbnailUrl: true, thumbnailKey: true }
  })

  for (const art of artworks) {
    if (art.thumbnailUrl?.includes('supabase.co')) {
      // Check if file actually exists in bucket
      const { data } = await supabaseAdmin.storage
        .from('artworks')
        .download(art.thumbnailKey)
      
      if (!data) {
        console.log(`🗑️  Deleting orphaned record "${art.title}" (${art.id}) — file missing from bucket`)
        await prisma.artwork.delete({ where: { id: art.id } })
      } else {
        console.log(`✅ "${art.title}" — file exists in bucket`)
      }
    } else if (art.thumbnailUrl?.startsWith('/uploads/')) {
      // Check if local file exists
      const fs = await import('fs/promises')
      const path = await import('path')
      const filePath = path.join(process.cwd(), 'public', art.thumbnailUrl)
      try {
        await fs.access(filePath)
        console.log(`✅ "${art.title}" — local file exists at ${art.thumbnailUrl}`)
      } catch {
        console.log(`🗑️  Deleting orphaned record "${art.title}" (${art.id}) — local file missing`)
        await prisma.artwork.delete({ where: { id: art.id } })
      }
    }
  }

  console.log("\n=== Step 2: Verify bucket access ===\n")

  // Test listing files in artworks bucket
  const { data: artFiles, error: artErr } = await supabaseAdmin.storage
    .from('artworks')
    .list('', { limit: 10 })
  
  console.log(`artworks bucket: ${artErr ? `ERROR - ${artErr.message}` : `${artFiles?.length || 0} items`}`)
  if (artFiles) {
    for (const f of artFiles) {
      console.log(`  📄 ${f.name} (${f.id ? 'file' : 'folder'})`)
    }
  }

  const { data: coverFiles, error: coverErr } = await supabaseAdmin.storage
    .from('covers')
    .list('', { limit: 10 })
  
  console.log(`covers bucket: ${coverErr ? `ERROR - ${coverErr.message}` : `${coverFiles?.length || 0} items`}`)
  if (coverFiles) {
    for (const f of coverFiles) {
      console.log(`  📄 ${f.name} (${f.id ? 'file' : 'folder'})`)
    }
  }

  console.log("\n=== Step 3: Current DB state ===\n")

  const remaining = await prisma.artwork.findMany({
    select: { id: true, title: true, thumbnailUrl: true, status: true, galleryId: true }
  })
  console.log(`${remaining.length} artworks remain:`)
  for (const a of remaining) {
    const source = a.thumbnailUrl?.includes('supabase') ? '☁️ Supabase' : '💾 Local'
    const gallery = a.galleryId ? `🏛️ Gallery ${a.galleryId}` : '🌐 Public'
    console.log(`  ${source} "${a.title}" [${a.status}] ${gallery}`)
  }

  const galleries = await prisma.gallery.findMany({
    select: { id: true, title: true, coverImageUrl: true }
  })
  console.log(`\n${galleries.length} galleries:`)
  for (const g of galleries) {
    const source = g.coverImageUrl?.includes('supabase') ? '☁️ Supabase' : '💾 Local'
    console.log(`  ${source} "${g.title}" (${g.id})`)
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, role: true }
  })
  console.log(`\n${users.length} users:`)
  for (const u of users) {
    console.log(`  👤 "${u.name}" [${u.role}] (${u.id})`)
  }

  console.log("\n=== Done! Ready for fresh upload test ===")
}

cleanAndVerify()
  .then(() => process.exit(0))
  .catch(e => { console.error("Error:", e); process.exit(1) })
