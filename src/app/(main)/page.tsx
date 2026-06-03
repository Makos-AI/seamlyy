import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, Badge, Button } from "@/components/ui"

export default async function HomePage() {
  const recentArtworks = await prisma.artwork.findMany({
    where: { status: { not: 'NOT_FOR_SALE' }, galleryId: null },
    include: { artist: true },
    orderBy: { createdAt: 'desc' },
    take: 8
  })

  const premiumGalleries = await prisma.gallery.findMany({
    include: { artist: true },
    orderBy: { createdAt: 'desc' },
    take: 4
  })

  return (
    <div className="flex flex-col min-h-screen">
      <section className="relative overflow-hidden py-24 px-4 bg-bg-secondary">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-bg-primary/0 pointer-events-none" />
        <div className="container mx-auto text-center max-w-3xl relative z-10 animate-slide-up">
          <Badge variant="info" className="mb-6">Powered by Open Payments</Badge>
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-text-primary leading-tight mb-6">
            Discover and collect <br className="hidden md:block"/> extraordinary art
          </h1>
          <p className="text-lg md:text-xl text-text-secondary mb-10 max-w-2xl mx-auto">
            Seamlyy is a frictionless marketplace for artists and collectors. Support creators directly with one-time purchases and micro-transactions.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/explore">
              <Button size="lg">Explore Artworks</Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="secondary">Sell Your Art</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 container mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-3xl font-heading font-bold text-text-primary">Recently Added</h2>
          <Link href="/explore" className="text-accent hover:text-accent-hover font-medium">View all</Link>
        </div>
        
        {recentArtworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentArtworks.map((art) => (
              <Link key={art.id} href={`/artwork/${art.id}`}>
                <Card className="overflow-hidden group h-full flex flex-col">
                  <div className="relative aspect-square overflow-hidden bg-bg-tertiary">
                    <img 
                      src={art.thumbnailUrl} 
                      alt={art.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <Badge variant={art.status === 'SOLD' ? 'neutral' : 'info'}>
                        {art.status === 'SOLD' ? 'Sold' : `$${art.price?.toString()}`}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-text-canvas truncate">{art.title}</h3>
                    <p className="text-sm text-text-canvas-muted truncate mt-1">by {art.artist.name}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-bg-card rounded-2xl border border-border">
            <p className="text-text-secondary">No artworks available yet.</p>
          </div>
        )}
      </section>

      <section className="py-20 px-4 container mx-auto bg-bg-secondary rounded-3xl mb-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-heading font-bold text-text-primary">Premium Exhibitions</h2>
            <p className="text-text-secondary mt-2">Unlock exclusive galleries with a simple micro-transaction.</p>
          </div>
        </div>
        
        {premiumGalleries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {premiumGalleries.map((gallery) => (
              <Link key={gallery.id} href={`/gallery/${gallery.id}`}>
                <Card className="overflow-hidden group h-full">
                  <div className="relative aspect-[4/3] overflow-hidden bg-bg-tertiary">
                    <img 
                      src={gallery.coverImageUrl} 
                      alt={gallery.title}
                      className="w-full h-full object-cover blur-sm transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-bg-primary/20 flex items-center justify-center">
                      <div className="bg-bg-glass backdrop-blur-md border border-border px-4 py-2 rounded-full flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        <span className="font-semibold text-text-primary">${gallery.accessFee.toString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-text-canvas truncate">{gallery.title}</h3>
                    <p className="text-sm text-text-canvas-muted truncate mt-1">by {gallery.artist.name}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-text-secondary">No premium galleries available yet.</p>
          </div>
        )}
      </section>
    </div>
  )
}
