import { Categories } from "@/types"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, Badge } from "@/components/ui"

export default async function ExplorePage() {
  const artworks = await prisma.artwork.findMany({
    include: { artist: true },
    orderBy: { createdAt: 'desc' },
    take: 12
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Discover</p>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Explore Art</h1>
        <p className="text-text-secondary">Browse categories or discover pieces from talented artists worldwide.</p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2 mb-10">
        {Categories.map(category => (
          <Link key={category} href={`/search?category=${encodeURIComponent(category)}`}>
            <div className="px-4 py-2 text-sm font-medium rounded-lg border border-border bg-bg-secondary text-text-secondary hover:border-gold/50 hover:text-gold transition-all cursor-pointer">
              {category}
            </div>
          </Link>
        ))}
      </div>

      {/* All artworks */}
      {artworks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {artworks.map((art) => (
            <Link key={art.id} href={`/artwork/${art.id}`}>
              <Card className="overflow-hidden group h-full flex flex-col">
                <div className="relative aspect-[4/5] overflow-hidden bg-bg-tertiary">
                  <img 
                    src={art.thumbnailUrl} 
                    alt={art.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-bg-primary/60 backdrop-blur-sm border border-border flex items-center justify-center text-text-muted hover:text-gold transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                  </button>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-text-primary truncate">{art.title}</h3>
                  <p className="text-xs text-text-muted truncate mt-1">{art.artist.name}</p>
                  <div className="mt-auto pt-3">
                    <span className="text-sm font-bold text-text-primary">{art.price ? `$${art.price.toString()}` : 'Not for sale'}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-bg-secondary rounded-2xl border border-border">
          <p className="text-text-secondary">No artworks found. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
