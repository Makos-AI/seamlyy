import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Card, Badge } from "@/components/ui"
import { auth } from "@/auth"
import { formatPrice } from "@/lib/utils"
import { ImageWithFallback } from "@/components/ImageWithFallback"

export default async function SearchPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string, category?: string }>
}) {
  const session = await auth()
  let preferredCurrency = "USD"
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferredCurrency: true }
    })
    preferredCurrency = dbUser?.preferredCurrency || "USD"
  }

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
                  <ImageWithFallback 
                    src={art.thumbnailUrl} 
                    alt={art.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    placeholder={art.blurDataURL ? "blur" : "empty"}
                    blurDataURL={art.blurDataURL || undefined}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant={art.status === 'SOLD' ? 'neutral' : 'gold'}>
                      {art.status === 'SOLD' ? 'Sold' : formatPrice(Number(art.price), preferredCurrency)}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-text-primary truncate">{art.title}</h3>
                  <p className="text-xs text-text-muted truncate mt-1">{art.artist.name}</p>
                  <div className="mt-auto pt-3">
                    <span className="text-sm font-bold text-text-primary">{formatPrice(Number(art.price), preferredCurrency)}</span>
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
