import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, Badge } from "@/components/ui"

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q?: string, category?: string }
}) {
  const query = searchParams.q || ""
  const category = searchParams.category || ""

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
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">
        {query ? `Search results for "${query}"` : category ? `${category} Artworks` : 'All Artworks'}
      </h1>
      <p className="text-text-secondary mb-10">Found {artworks.length} result{artworks.length !== 1 ? 's' : ''}</p>

      {artworks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {artworks.map((art) => (
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
                  <h3 className="text-lg font-semibold text-text-primary truncate">{art.title}</h3>
                  <p className="text-sm text-text-secondary truncate mt-1">by {art.artist.name}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-bg-card rounded-2xl border border-border">
          <p className="text-text-secondary">No artworks found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
