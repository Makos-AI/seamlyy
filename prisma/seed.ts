import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing existing data...')
  await prisma.savedArtwork.deleteMany()
  await prisma.galleryAccess.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.artwork.deleteMany()
  await prisma.gallery.deleteMany()
  await prisma.user.deleteMany()

  console.log('Seeding data...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  // Create Artists
  const artist1 = await prisma.user.create({
    data: {
      email: 'artist1@example.com',
      name: 'Amara Nnachi',
      role: 'ARTIST',
      hashedPassword,
      bio: 'Contemporary African artist exploring the intersection of tradition and futuristic aesthetics.',
      walletPointer: '$rafiki.money/p/amara',
      image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=250&auto=format&fit=crop'
    }
  })

  const artist2 = await prisma.user.create({
    data: {
      email: 'artist2@example.com',
      name: 'Kwame Osei',
      role: 'ARTIST',
      hashedPassword,
      bio: 'Digital creator and 3D afrofuturism pioneer.',
      walletPointer: '$rafiki.money/p/kwame',
      image: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=250&auto=format&fit=crop'
    }
  })

  // Create Collectors
  const collector1 = await prisma.user.create({
    data: {
      email: 'collector@example.com',
      name: 'Sarah Jenkins',
      role: 'VIEWER',
      hashedPassword,
      walletPointer: '$rafiki.money/p/sarah',
    }
  })

  const collector2 = await prisma.user.create({
    data: {
      email: 'collector2@example.com',
      name: 'Chidi Collector',
      role: 'VIEWER',
      hashedPassword,
      walletPointer: '$rafiki.money/p/chidi',
    }
  })


  // Create Galleries
  const gallery1 = await prisma.gallery.create({
    data: {
      artistId: artist1.id,
      title: 'Neon Ancestry',
      description: 'A premium exhibition blending neon cityscapes with ancient tribal motifs.',
      accessFee: 2.50,
      coverImageUrl: 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?q=80&w=1000&auto=format&fit=crop',
      coverImageKey: 'seed_cover_1'
    }
  })

  const gallery2 = await prisma.gallery.create({
    data: {
      artistId: artist2.id,
      title: 'Digital Genesis',
      description: 'The birth of a new era in African digital artistry. View the genesis collection.',
      accessFee: 0,
      coverImageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=1000&auto=format&fit=crop',
      coverImageKey: 'seed_cover_2'
    }
  })

  // Create Artworks for Gallery 1 (Neon Ancestry)
  await prisma.artwork.create({
    data: {
      artistId: artist1.id,
      galleryId: gallery1.id,
      title: 'The Golden Mask',
      description: 'A reimagined tribal mask crafted in digital gold.',
      medium: 'Digital 3D',
      price: 1500.00,
      status: 'FIXED_PRICE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=800&auto=format&fit=crop',
      thumbnailKey: 'art1_thumb',
      highResKey: 'art1_high'
    }
  })

  await prisma.artwork.create({
    data: {
      artistId: artist1.id,
      galleryId: gallery1.id,
      title: 'Ancestral Echoes',
      description: 'Vibrations of the past echoing into the future.',
      medium: 'Digital Painting',
      price: 850.00,
      status: 'FIXED_PRICE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb?q=80&w=800&auto=format&fit=crop',
      thumbnailKey: 'art2_thumb',
      highResKey: 'art2_high'
    }
  })

  await prisma.artwork.create({
    data: {
      artistId: artist1.id,
      galleryId: gallery1.id,
      title: 'Ethereal Whispers',
      description: 'Vibrations of ancestral spirits whispering into the modern era.',
      medium: 'Digital Painting',
      price: 850.00,
      status: 'FIXED_PRICE',
      thumbnailUrl: '/art/artwork2.jpg',
      thumbnailKey: 'art6_thumb',
      highResKey: 'art6_high'
    }
  })

  // Create Artworks for Gallery 2 (Digital Genesis)
  await prisma.artwork.create({
    data: {
      artistId: artist2.id,
      galleryId: gallery2.id,
      title: 'Cyber Serengeti',
      description: 'The wild digital frontier.',
      medium: 'Generative Art',
      price: 2200.00,
      status: 'FIXED_PRICE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1550684376-efcbd6e3f031?q=80&w=800&auto=format&fit=crop',
      thumbnailKey: 'art3_thumb',
      highResKey: 'art3_high'
    }
  })

  await prisma.artwork.create({
    data: {
      artistId: artist2.id,
      galleryId: gallery2.id,
      title: 'Cyber Serengeti II',
      description: 'Exploring the boundary-pushing futuristic landscapes of Africa.',
      medium: 'Generative Art',
      price: 2200.00,
      status: 'FIXED_PRICE',
      thumbnailUrl: '/art/artwork3.jpg',
      thumbnailKey: 'art7_thumb',
      highResKey: 'art7_high'
    }
  })

  await prisma.artwork.create({
    data: {
      artistId: artist2.id,
      galleryId: gallery2.id,
      title: 'Unbound Spirit II',
      description: 'A striking study on modern composition and digital textures.',
      medium: 'Photography & Digital',
      price: 450.00,
      status: 'FIXED_PRICE',
      thumbnailUrl: '/art/artwork4.jpg',
      thumbnailKey: 'art8_thumb',
      highResKey: 'art8_high'
    }
  })

  // Standalone artworks
  await prisma.artwork.create({
    data: {
      artistId: artist2.id,
      title: 'Unbound Spirit',
      description: 'A standalone piece not bound to any gallery.',
      medium: 'Photography',
      price: 450.00,
      status: 'FIXED_PRICE',
      thumbnailUrl: 'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?q=80&w=800&auto=format&fit=crop',
      thumbnailKey: 'art4_thumb',
      highResKey: 'art4_high'
    }
  })

  await prisma.artwork.create({
    data: {
      artistId: artist2.id,
      title: 'Luminous Rhythm',
      description: 'A standalone piece exploring the vibrant flow of modern African music and movement.',
      medium: 'Mixed Media',
      price: 1200.00,
      status: 'FIXED_PRICE',
      thumbnailUrl: '/art/artwork5.jpg',
      thumbnailKey: 'art9_thumb',
      highResKey: 'art9_high'
    }
  })

  console.log('Seed completed successfully!')
  console.log('---------------------------------')
  console.log('Test Accounts Created:')
  console.log('1. artist1@example.com / password123')
  console.log('2. artist2@example.com / password123')
  console.log('3. collector@example.com / password123')
  console.log('4. collector2@example.com / password123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
