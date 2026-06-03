import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, Badge } from "@/components/ui"

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string, category?: string }>
}) {
  const { q: query = "", category = "" } = await searchParams

  const artworks = await prisma.artwork.findMany({
    where: {
      AND: [
        query ? {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { artist: { name: { contains: query, mode: 'insensitive' } } }
          ]
        } : {},
        category ? { category } : {}
      ]
    },
    include: { artist: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Search Results</p>
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {query ? `Results for "${query}"` : category ? `${category}` : 'All Artworks'}
        </h1>
        <p className="text-text-secondary">Found {artworks.length} result{artworks.length !== 1 ? 's' : ''}</p>
      </div>

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
                  <div className="absolute top-3 left-3">
                    <Badge variant={art.status === 'SOLD' ? 'neutral' : 'gold'}>
                      {art.status === 'SOLD' ? 'Sold' : `$${art.price?.toString()}`}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-text-primary truncate">{art.title}</h3>
                  <p className="text-xs text-text-muted truncate mt-1">{art.artist.name}</p>
                  <div className="mt-auto pt-3">
                    <span className="text-sm font-bold text-text-primary">${art.price?.toString()}</span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-bg-secondary rounded-2xl border border-border">
          <p className="text-text-secondary">No artworks found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
