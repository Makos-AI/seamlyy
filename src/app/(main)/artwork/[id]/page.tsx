import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Avatar, Badge, Button, Card } from "@/components/ui"
import Link from "next/link"

export default async function ArtworkPage({ params }: { params: { id: string } }) {
  const artwork = await prisma.artwork.findUnique({
    where: { id: params.id },
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

            <h1 className="text-4xl font-heading font-bold text-text-primary mb-4">{artwork.title}</h1>
            
            <div className="flex flex-wrap gap-2 mb-8">
              {artwork.category && <Badge variant="neutral">{artwork.category}</Badge>}
              <Badge variant={artwork.status === 'SOLD' ? 'neutral' : 'info'}>
                {artwork.status === 'SOLD' ? 'Sold Out' : artwork.status === 'NOT_FOR_SALE' ? 'Not for Sale' : 'Available'}
              </Badge>
            </div>

            <div className="bg-bg-secondary border border-border rounded-2xl p-6 mb-8">
              <p className="text-sm text-text-secondary mb-2">Price</p>
              <p className="text-3xl font-semibold text-text-primary mb-6">
                {artwork.price ? `$${artwork.price.toString()}` : 'N/A'}
              </p>

              {artwork.status === 'FIXED_PRICE' && (
                <Button className="w-full" size="lg">
                  Purchase Artwork
                </Button>
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
