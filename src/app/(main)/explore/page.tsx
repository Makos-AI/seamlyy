import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, Badge } from "@/components/ui"
import { auth } from "@/auth"
import { formatPrice } from "@/lib/utils"
import { ImageWithFallback } from "@/components/ImageWithFallback"

import { unstable_cache } from "next/cache"

const getExploreArtworks = unstable_cache(
  async () => {
    return await prisma.artwork.findMany({
      include: { artist: true },
      orderBy: { createdAt: 'desc' },
      take: 12
    })
  },
  ["explore-artworks"],
  { tags: ["artworks"] }
)

export default async function ExplorePage() {
  const session = await auth()
  let preferredCurrency = "USD"
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferredCurrency: true }
    })
    preferredCurrency = dbUser?.preferredCurrency || "USD"
  }

  const artworks = await getExploreArtworks()


  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-2">Discover</p>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Explore Art</h1>
        <p className="text-text-secondary">Browse categories or discover pieces from talented artists worldwide.</p>
      </div>



      {/* All artworks */}
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
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-sm font-semibold text-text-primary truncate">{art.title}</h3>
                  <p className="text-xs text-text-muted truncate mt-1">{art.artist.name}</p>
                  <div className="mt-auto pt-3">
                    <span className="text-sm font-bold text-text-primary">
                      {art.price ? formatPrice(Number(art.price), preferredCurrency) : 'Not for sale'}
                    </span>
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
