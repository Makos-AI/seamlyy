import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, Badge, Button } from "@/components/ui"

export default async function HomePage() {
  const recentArtworks = await prisma.artwork.findMany({
    where: { status: { not: 'NOT_FOR_SALE' } },
    include: { artist: true },
    orderBy: { createdAt: 'desc' },
    take: 8
  })

  const premiumGalleries = await prisma.gallery.findMany({
    include: { artist: true },
    orderBy: { createdAt: 'desc' },
    take: 4
  })

  const artistCount = await prisma.user.count({ where: { role: 'ARTIST' } })
  const artworkCount = await prisma.artwork.count()
  const collectorCount = await prisma.user.count({ where: { role: 'VIEWER' } })

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden py-24 md:py-32 px-4">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gold/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue/5 rounded-full blur-[100px]" />
        </div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-6">The Home for Artists</p>
              <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary leading-[1.1] mb-6">
                Discover art.<br/>
                Support artists.<br/>
                <span className="text-gold">Own stories.</span>
              </h1>
              <p className="text-lg text-text-secondary mb-10 max-w-lg leading-relaxed">
                Explore galleries, connect with creators, and enjoy seamless payments from anywhere in the world.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/explore">
                  <Button variant="secondary" size="lg">Explore Art</Button>
                </Link>
                <Link href="/register">
                  <Button variant="buy" size="lg">Become an Artist</Button>
                </Link>
              </div>
            </div>
            
            <div className="hidden lg:block">
              {recentArtworks[0] && (
                <div className="relative">
                  <div className="rounded-2xl overflow-hidden border border-border shadow-2xl shadow-black/30 animate-float">
                    <img 
                      src={recentArtworks[0].thumbnailUrl} 
                      alt={recentArtworks[0].title}
                      className="w-full h-[420px] object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-4 -left-4 bg-bg-card border border-border rounded-xl p-4 shadow-xl">
                    <p className="text-xs text-text-muted mb-1">Featured</p>
                    <p className="font-semibold text-text-primary">{recentArtworks[0].title}</p>
                    <p className="text-sm text-gold">${recentArtworks[0].price?.toString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Row */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '👤', label: 'Artists', value: `${artistCount > 0 ? artistCount : '1,250'}+` },
              { icon: '🎨', label: 'Artworks', value: `${artworkCount > 0 ? artworkCount : '8,450'}+` },
              { icon: '💎', label: 'Collectors', value: `${collectorCount > 0 ? collectorCount : '6,100'}+` },
              { icon: '🌍', label: 'Countries', value: '90+' },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-bg-secondary/50">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-xl font-bold text-text-primary">{stat.value}</p>
                  <p className="text-xs text-text-muted">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold text-text-primary">Featured Artworks</h2>
            <Link href="/explore" className="text-sm text-gold hover:text-gold/80 font-medium transition-colors">View all</Link>
          </div>
          
          {recentArtworks.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentArtworks.map((art) => (
                <Link key={art.id} href={`/artwork/${art.id}`}>
                  <Card className="overflow-hidden group h-full flex flex-col">
                    <div className="relative aspect-[4/5] overflow-hidden bg-bg-tertiary">
                      <img 
                        src={art.thumbnailUrl} 
                        alt={art.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Save button */}
                      <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-bg-primary/60 backdrop-blur-sm border border-border flex items-center justify-center text-text-muted hover:text-gold transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                      </button>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-sm font-semibold text-text-primary truncate">{art.title}</h3>
                      <p className="text-xs text-text-muted truncate mt-1">{art.artist.name}</p>
                      <div className="mt-auto pt-3 flex items-center gap-2">
                        <span className="text-sm font-bold text-text-primary">${art.price?.toString()}</span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-bg-secondary rounded-2xl border border-border">
              <p className="text-text-secondary">No artworks available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Premium Galleries */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="bg-bg-secondary rounded-2xl border border-border p-8 md:p-12">
            <div className="flex items-center justify-between mb-10">
              <div>
                <Badge variant="premium" className="mb-3">Premium</Badge>
                <h2 className="text-2xl font-bold text-text-primary">Exclusive Exhibitions</h2>
                <p className="text-text-secondary mt-2 text-sm">Unlock curated galleries with seamless micro-payments.</p>
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
                          className="w-full h-full object-cover blur-[2px] transition-all duration-500 group-hover:scale-105 group-hover:blur-0"
                        />
                        <div className="absolute inset-0 bg-bg-primary/40 flex items-center justify-center group-hover:bg-transparent transition-colors">
                          <div className="bg-bg-glass backdrop-blur-md border border-gold/30 px-4 py-2 rounded-full flex items-center gap-2">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                            <span className="font-semibold text-sm text-gold">${gallery.accessFee.toString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold text-text-primary truncate">{gallery.title}</h3>
                        <p className="text-xs text-text-muted truncate mt-1">by {gallery.artist.name}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-text-secondary">No premium galleries available yet.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="gold" className="mb-4">Who We Are</Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary leading-tight mb-6">
                Redefining the Value Curve of <span className="text-gold">African Artistry</span>
              </h2>
              <p className="text-text-secondary leading-relaxed mb-6">
                Seamlyy is a premier decentralized art collective and marketplace designed to connect global curators directly with pioneering artists. By removing traditional art-world gatekeepers and intermediaries, we empower creators to retain the true value of their work.
              </p>
              <p className="text-text-secondary leading-relaxed mb-8">
                Our platform introduces Web Monetization standards to fine art, enabling continuous micro-payments to flow directly to artists as collectors engage with their digital galleries.
              </p>
              <Link href="/about">
                <Button variant="primary" size="lg">
                  Learn More About Our Mission
                </Button>
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-gold/10 to-blue/10 rounded-2xl blur-2xl" />
              <div className="relative border border-border bg-bg-secondary p-8 rounded-2xl shadow-xl">
                <h3 className="text-xl font-bold text-text-primary mb-4">Empowering Creators Globally</h3>
                <ul className="space-y-4">
                  {[
                    { title: "Direct Artist Support", desc: "Keep 95% of sales revenue, bypassing the traditional 40% gallery commission." },
                    { title: "Engagement Rewards", desc: "Earn micro-transactions continuously while visitors browse your exhibitions." },
                    { title: "True Sovereignty", desc: "Complete ownership of your digital assets, portfolio, and collector relations." }
                  ].map((item, idx) => (
                    <li key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center font-bold text-sm">✓</div>
                      <div>
                        <h4 className="font-semibold text-text-primary text-sm">{item.title}</h4>
                        <p className="text-xs text-text-muted mt-1">{item.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Payments Section */}
      <section className="py-20 px-4 border-t border-border bg-gradient-to-b from-transparent to-bg-secondary/40">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="info" className="mb-4">Global Infrastructure</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-6">
              Global, Borderless Payments with Open Payments
            </h2>
            <p className="text-text-secondary leading-relaxed">
              Seamlyy integrates the Open Payments standard and the Interledger Protocol (ILP) to facilitate instant, low-cost cross-border payments. Collectors and art lovers from anywhere in the world can securely buy artwork and stream payments directly to artists.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🌍",
                title: "Pay From Everywhere",
                desc: "We support borderless payments from any country. Say goodbye to international wire delays and banking barriers."
              },
              {
                icon: "⚡",
                title: "Instant Settlement",
                desc: "Transactions clear in real-time. The moment you acquire an artwork or unlock a gallery, funds route directly to the creator."
              },
              {
                icon: "💳",
                title: "Interoperable Wallets",
                desc: "Using Wallet Pointers, artists can receive payments directly into any standard ILP-compatible wallet, keeping transactions secure and decentralized."
              }
            ].map((feature, idx) => (
              <Card key={idx} className="p-8 border border-border bg-bg-card flex flex-col items-start gap-4">
                <div className="text-4xl">{feature.icon}</div>
                <h3 className="text-lg font-bold text-text-primary">{feature.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

