import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Avatar, Button, Card, Badge } from "@/components/ui"
import Link from "next/link"
import { Metadata, ResolvingMetadata } from "next"
import { CheckoutButton } from "@/components/CheckoutButton"
import { auth } from "@/auth"
import { formatPrice } from "@/lib/utils"

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params
  const gallery = await prisma.gallery.findUnique({
    where: { id },
    include: { artist: true }
  })

  if (!gallery) return {}

  const meta: Metadata = {
    title: `${gallery.title} - Seamlyy`,
    description: gallery.description || `View ${gallery.title} on Seamlyy`,
  }

  // Web Monetization Standard (ILP)
  if (gallery.artist.walletPointer) {
    meta.other = {
      monetization: gallery.artist.walletPointer
    }
  }

  return meta
}

export default async function GalleryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  let preferredCurrency = "USD"
  let userWalletPointer = ""
  if (session?.user?.id) {
    const loggedInUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferredCurrency: true, walletPointer: true }
    })
    preferredCurrency = loggedInUser?.preferredCurrency || "USD"
    userWalletPointer = loggedInUser?.walletPointer || ""
  }

  const gallery = await prisma.gallery.findUnique({
    where: { id },
    include: { 
      artist: true,
      artworks: true
    }
  })

  if (!gallery) return notFound()

  // In a real implementation, we would check if the current user has `GalleryAccess`
  const hasAccess = false // Default to false for now

  return (
    <div>
      {/* Hero Section */}
      <div className="relative h-[60vh] min-h-[400px] flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            src={gallery.coverImageUrl} 
            alt={gallery.title} 
            className="w-full h-full object-cover blur-sm brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-primary via-bg-primary/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 relative z-10 pb-12">
          <div className="max-w-3xl">
            <Badge variant="info" className="mb-4">Premium Exhibition</Badge>
            <h1 className="text-5xl font-heading font-bold text-white mb-4">{gallery.title}</h1>
            <p className="text-xl text-white/80 mb-8 max-w-2xl">{gallery.description}</p>
            
            <div className="flex items-center gap-4">
              <Link href={`/profile/${gallery.artistId}`}>
                <Avatar src={gallery.artist.image} fallback={gallery.artist.name || 'U'} />
              </Link>
              <div>
                <p className="text-sm text-white/60">Curated by</p>
                <Link href={`/profile/${gallery.artistId}`} className="text-white font-medium hover:underline">
                  {gallery.artist.name}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {hasAccess ? (
          <div>
            <h2 className="text-2xl font-heading font-semibold text-text-primary mb-8">Exhibition Collection ({gallery.artworks.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {gallery.artworks.map(art => (
                <Link key={art.id} href={`/artwork/${art.id}`}>
                  <Card className="overflow-hidden group h-full flex flex-col">
                    <div className="relative aspect-square overflow-hidden bg-bg-tertiary">
                      <img src={art.thumbnailUrl} alt={art.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-text-primary truncate">{art.title}</h3>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-12">
            <div className="bg-bg-secondary border border-border rounded-3xl p-12">
              <div className="w-16 h-16 bg-bg-tertiary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-primary"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              </div>
              <h2 className="text-2xl font-heading font-bold text-text-primary mb-4">Unlock this Exhibition</h2>
              <p className="text-text-secondary mb-8">
                Gain permanent access to this premium gallery to view all high-resolution artworks curated by {gallery.artist.name}.
              </p>
              <div className="flex flex-col items-center justify-center gap-4">
                <CheckoutButton
                  targetId={gallery.id}
                  type="GALLERY"
                  amount={Number(gallery.accessFee)}
                  title={gallery.title}
                  initialWalletPointer={userWalletPointer}
                  buttonText={`Unlock for ${formatPrice(gallery.accessFee, preferredCurrency)}`}
                  className="px-12 h-12 text-base"
                />
                <p className="text-xs text-text-muted flex items-center gap-1">
                  Powered by Open Payments
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
