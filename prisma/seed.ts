import { PrismaClient } from '@prisma/client'
import { UserRole, ArtworkStatus, TransactionType } from '../src/types'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed...')

  // Clean up
  await prisma.transaction.deleteMany()
  await prisma.galleryAccess.deleteMany()
  await prisma.savedArtwork.deleteMany()
  await prisma.artwork.deleteMany()
  await prisma.gallery.deleteMany()
  await prisma.user.deleteMany()

  // Create Users
  const password = await bcrypt.hash('password123', 10)
  
  const artist1 = await prisma.user.create({
    data: {
      email: 'artist1@example.com',
      name: 'Elena Rostova',
      hashedPassword: password,
      role: UserRole.ARTIST,
      bio: 'Digital artist exploring the intersection of light and emotion.',
      walletPointer: '$ilp.rafiki.money/elena',
      location: 'Berlin, Germany',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop'
    }
  })

  const artist2 = await prisma.user.create({
    data: {
      email: 'artist2@example.com',
      name: 'Marcus Chen',
      hashedPassword: password,
      role: UserRole.ARTIST,
      bio: 'Traditional oil painter focusing on abstract landscapes.',
      walletPointer: '$ilp.rafiki.money/marcus',
      location: 'Vancouver, Canada',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop'
    }
  })

  const collector = await prisma.user.create({
    data: {
      email: 'collector@example.com',
      name: 'Sarah Jenkins',
      hashedPassword: password,
      role: UserRole.VIEWER,
      walletPointer: '$ilp.rafiki.money/sarah',
    }
  })

  // Create Artworks
  await prisma.artwork.create({
    data: {
      title: 'Neon Dreams',
      description: 'A cyberpunk inspired digital painting exploring urban isolation.',
      price: 150.00,
      status: ArtworkStatus.FIXED_PRICE,
      category: 'Digital Art',
      thumbnailUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop',
      thumbnailKey: 'seed/neon-dreams',
      highResKey: 'seed/neon-dreams-high',
      artistId: artist1.id,
    }
  })

  await prisma.artwork.create({
    data: {
      title: 'Silent Ocean',
      description: 'Oil on canvas. A study of turbulent waters in the early morning.',
      price: 1200.00,
      status: ArtworkStatus.FIXED_PRICE,
      category: 'Oil Paintings',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518998053401-878c73fd5fce?q=80&w=800&auto=format&fit=crop',
      thumbnailKey: 'seed/silent-ocean',
      highResKey: 'seed/silent-ocean-high',
      artistId: artist2.id,
    }
  })

  // Create Premium Gallery
  const gallery = await prisma.gallery.create({
    data: {
      title: 'The Light Series',
      description: 'An exclusive collection of 5 unseen digital works exploring ethereal light.',
      accessFee: 5.00,
      coverImageUrl: 'https://images.unsplash.com/photo-1549490349-8643362247b5?q=80&w=800&auto=format&fit=crop',
      coverImageKey: 'seed/light-series',
      artistId: artist1.id,
      artworks: {
        create: [
          {
            title: 'Luminescence I',
            status: ArtworkStatus.NOT_FOR_SALE,
            category: 'Digital Art',
            thumbnailUrl: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=800&auto=format&fit=crop',
            thumbnailKey: 'seed/lum-1',
            highResKey: 'seed/lum-1-high',
            artistId: artist1.id
          }
        ]
      }
    }
  })

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
