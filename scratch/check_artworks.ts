import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const artworks = await prisma.artwork.findMany({
    include: { artist: true, gallery: true }
  })

  console.log('--- ALL ARTWORKS IN DB ---')
  for (const art of artworks) {
    console.log(`- Title: "${art.title}"`)
    console.log(`  Artist: ${art.artist.name} (${art.artist.email})`)
    console.log(`  Status: ${art.status}`)
    console.log(`  Gallery: ${art.gallery ? art.gallery.title : 'None (Standalone)'}`)
    console.log(`  URL: ${art.thumbnailUrl}`)
    console.log('------------------------')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
