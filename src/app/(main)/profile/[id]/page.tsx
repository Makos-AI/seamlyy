import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Avatar, Badge, Card, Button } from "@/components/ui"
import Link from "next/link"
import { auth } from "@/auth"
import { followArtistAction } from "@/actions/user"
import { formatPrice } from "@/lib/utils"

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()

  let preferredCurrency = "USD"
  if (session?.user?.id) {
    const loggedInUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { preferredCurrency: true }
    })
    preferredCurrency = loggedInUser?.preferredCurrency || "USD"
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      artworks: { where: { status: { not: 'NOT_FOR_SALE' }, galleryId: null } },
      galleries: true,
      followers: true,
      following: true,
      savedArtworks: { include: { artwork: { include: { artist: true } } } },
      purchases: { include: { artwork: { include: { artist: true } }, gallery: { include: { artist: true } } } }
    }
  })

  if (!user) return notFound()

  const isFollowing = session?.user?.id 
    ? user.followers.some(f => f.followerId === session.user.id)
    : false

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-6">
        <Link 
          href="/explore" 
          className="inline-flex items-center text-sm font-medium text-text-muted hover:text-gold transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Explore
        </Link>
      </div>
      <div className="bg-bg-secondary rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center gap-8 border border-border">
        <Avatar src={user.image} fallback={user.name || 'U'} size="xl" className="w-32 h-32" />
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
            <h1 className="text-3xl font-heading font-bold text-text-primary">{user.name}</h1>
            <Badge variant={user.role === 'ARTIST' ? 'info' : 'neutral'}>{user.role}</Badge>
          </div>
          <p className="text-text-secondary mb-4 max-w-2xl mx-auto md:mx-0">{user.bio || 'No bio provided.'}</p>
          <div className="flex items-center justify-center md:justify-start gap-6 text-sm text-text-muted">
            {user.location && (
              <span className="flex items-center gap-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                {user.location}
              </span>
            )}
            <span><strong>{user.followers.length}</strong> followers</span>
            <span><strong>{user.following.length}</strong> following</span>
          </div>
        </div>
        <div>
          <form action={followArtistAction.bind(null, user.id)}>
            <Button type="submit" variant={isFollowing ? "secondary" : "primary"}>
              {isFollowing ? "Unfollow" : "Follow"}
            </Button>
          </form>
        </div>
      </div>

      {user.role === 'ARTIST' ? (
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-heading font-semibold text-text-primary mb-6">Public Portfolio</h2>
            {user.artworks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {user.artworks.map((art) => (
                  <Link key={art.id} href={`/artwork/${art.id}`}>
                    <Card className="overflow-hidden group h-full flex flex-col">
                      <div className="relative aspect-square overflow-hidden bg-bg-tertiary">
                        <img src={art.thumbnailUrl} alt={art.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          <Badge variant={art.status === 'SOLD' ? 'neutral' : 'info'}>
                            {art.status === 'SOLD' ? 'Sold' : formatPrice(Number(art.price), preferredCurrency)}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-text-primary truncate">{art.title}</h3>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">No public artworks yet.</p>
            )}
          </section>

          <section>
            <h2 className="text-2xl font-heading font-semibold text-text-primary mb-6">Premium Exhibitions</h2>
            {user.galleries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {user.galleries.map((gallery) => (
                  <Link key={gallery.id} href={`/gallery/${gallery.id}`}>
                    <Card className={`overflow-hidden group h-full flex flex-col ${gallery.accessFee > 0 ? 'border border-gold/40 hover:shadow-[0_0_15px_rgba(217,164,65,0.3)] transition-all relative' : ''}`}>
                      {gallery.accessFee > 0 && (
                        <div className="absolute top-4 right-4 z-10 group/tooltip">
                          <div className="w-8 h-8 rounded-full bg-bg-glass backdrop-blur flex items-center justify-center border border-accent text-accent">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                          </div>
                          <div className="absolute top-full right-0 mt-2 w-48 p-2 bg-bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all text-xs text-text-secondary">
                            Web Monetization Enabled: Seamlessly support the artist as you view.
                          </div>
                        </div>
                      )}
                      <div className="relative aspect-video overflow-hidden bg-bg-tertiary">
                        <img src={gallery.coverImageUrl} alt={gallery.title} className="w-full h-full object-cover blur-sm transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-bg-primary/20 flex items-center justify-center">
                          <div className="bg-bg-glass backdrop-blur-md border border-border px-4 py-2 rounded-full flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                             <span className="font-semibold text-text-primary">{formatPrice(gallery.accessFee, preferredCurrency)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-text-primary truncate">{gallery.title}</h3>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">No premium exhibitions yet.</p>
            )}
          </section>
        </div>
      ) : (
        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-heading font-semibold text-text-primary mb-6">Saved Artworks</h2>
            {user.savedArtworks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {user.savedArtworks.map((saved) => (
                  <Link key={saved.artwork.id} href={`/artwork/${saved.artwork.id}`}>
                    <Card className="overflow-hidden group h-full flex flex-col">
                      <div className="relative aspect-square overflow-hidden bg-bg-tertiary">
                        <img src={saved.artwork.thumbnailUrl} alt={saved.artwork.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-text-primary truncate">{saved.artwork.title}</h3>
                        <p className="text-sm text-text-secondary truncate mt-1">by {saved.artwork.artist.name}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary">No saved artworks yet.</p>
            )}
          </section>
        </div>
      )}
    </div>
  )
}
