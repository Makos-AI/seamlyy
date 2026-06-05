import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Avatar, Badge, Button, Card } from "@/components/ui"
import Link from "next/link"
import { CheckoutButton } from "@/components/CheckoutButton"
import { auth } from "@/auth"
import { formatPrice } from "@/lib/utils"

export default async function ArtworkPage({ params }: { params: Promise<{ id: string }> }) {
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

  const artwork = await prisma.artwork.findUnique({
    where: { id },
    include: { artist: true, gallery: true }
  })

  if (!artwork) return notFound()

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="order-2 lg:order-1">
          <div className="sticky top-24">
            <div className="flex items-center gap-4 mb-6">
              <Link href={`/profile/${artwork.artistId}`}>
                <Avatar src={artwork.artist.image} fallback={artwork.artist.name || 'U'} />
              </Link>
              <div>
                <Link href={`/profile/${artwork.artistId}`} className="text-text-primary font-medium hover:underline">
                  {artwork.artist.name}
                </Link>
                <p className="text-xs text-text-muted">Artist</p>
              </div>
            </div>

            <div className="relative aspect-square rounded-2xl overflow-hidden bg-bg-secondary border border-border shadow-2xl">
              <img src={artwork.thumbnailUrl} alt={artwork.title} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-4xl font-bold text-text-primary">{artwork.title}</h1>
              <Badge variant={artwork.status === 'SOLD' ? 'neutral' : 'info'}>
                {artwork.status === 'SOLD' ? 'Sold Out' : artwork.status === 'NOT_FOR_SALE' ? 'Not for Sale' : 'Available'}
              </Badge>
            </div>

            <div className="bg-bg-secondary border border-border rounded-2xl p-6 mb-8 relative">
              <p className="text-sm text-text-secondary mb-2">Price</p>
              <p className="text-3xl font-semibold text-text-primary mb-6">
                {artwork.price ? formatPrice(Number(artwork.price), preferredCurrency) : 'N/A'}
              </p>

              {artwork.status === 'FIXED_PRICE' && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-bg-card/90 backdrop-blur-md border-t border-border z-50 md:absolute md:bottom-auto md:left-auto md:right-auto md:p-0 md:bg-transparent md:backdrop-blur-none md:border-none md:z-auto md:w-full">
                  <CheckoutButton
                    targetId={artwork.id}
                    type="ARTWORK"
                    amount={Number(artwork.price)}
                    title={artwork.title}
                    initialWalletPointer={userWalletPointer}
                    buttonText="Acquire Artwork"
                    className="w-full h-14 text-lg shadow-[0_0_20px_rgba(124,92,252,0.4)] transition-shadow hover:shadow-[0_0_30px_rgba(124,92,252,0.6)]"
                  />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-text-primary mb-2">Description</h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {artwork.description || 'No description provided.'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
                {artwork.medium && (
                  <div>
                    <p className="text-xs text-text-muted mb-1">Medium</p>
                    <p className="text-sm text-text-primary">{artwork.medium}</p>
                  </div>
                )}
                {artwork.yearCreated && (
                  <div>
                    <p className="text-xs text-text-muted mb-1">Year</p>
                    <p className="text-sm text-text-primary">{artwork.yearCreated}</p>
                  </div>
                )}
                {artwork.dimensions && (
                  <div>
                    <p className="text-xs text-text-muted mb-1">Dimensions</p>
                    <p className="text-sm text-text-primary">{artwork.dimensions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2 flex items-center justify-center bg-bg-tertiary rounded-3xl overflow-hidden border border-border">
          <img 
            src={artwork.thumbnailUrl} 
            alt={artwork.title} 
            className="w-full h-auto max-h-[80vh] object-contain"
          />
        </div>
      </div>
    </div>
  )
}
