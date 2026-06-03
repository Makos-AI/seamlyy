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
                <Link 
                  href="/explore" 
                  className="inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-bg-primary border border-border bg-transparent hover:bg-bg-tertiary text-text-primary hover:border-border-hover active:scale-[0.98] h-12 px-8 text-base cursor-pointer"
                >
                  Explore Art
                </Link>
                <Link 
                  href="/login" 
                  className="inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-offset-2 focus:ring-offset-bg-primary bg-success text-white hover:bg-success/90 hover:shadow-lg hover:shadow-success/25 active:scale-[0.98] h-12 px-8 text-base cursor-pointer"
                >
                  Become an Artist
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
              { 
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                ), 
                label: 'Artists', 
                value: `${artistCount > 0 ? artistCount : '1,250'}+` 
              },
              { 
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
                    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.5 3 16.5 4.5 18.5L5.5 19.5C6.5 20.5 8 22 12 22Z"></path>
                    <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor"></circle>
                    <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor"></circle>
                    <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor"></circle>
                    <circle cx="15.5" cy="14.5" r="1.5" fill="currentColor"></circle>
                  </svg>
                ), 
                label: 'Artworks', 
                value: `${artworkCount > 0 ? artworkCount : '8,450'}+` 
              },
              { 
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
                    <path d="M6 3h12l4 6-10 12L2 9z"></path>
                    <path d="M11 3 8 9l4 12 4-12-3-6"></path>
                    <path d="M2 9h20"></path>
                  </svg>
                ), 
                label: 'Collectors', 
                value: `${collectorCount > 0 ? collectorCount : '6,100'}+` 
              },
              { 
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                ), 
                label: 'Countries', 
                value: '90+' 
              },
            ].map(stat => (
              <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-bg-secondary/50">
                <span className="flex-shrink-0">{stat.icon}</span>
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

      {/* How it Works Section */}
      <section className="py-20 px-4 border-t border-border bg-bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <Badge variant="premium" className="mb-4">Simple Setup</Badge>
            <h2 className="text-3xl md:text-4xl font-extrabold text-text-primary mb-4">How Seamlyy Works</h2>
            <p className="text-text-secondary">The future of seamless art collection powered by Open Payments.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "Connect",
                desc: "Sign up and configure your Web Monetization Wallet Pointer. Artists use this to receive funds instantly, and collectors use it to make seamless purchases."
              },
              {
                num: "02",
                title: "Discover",
                desc: "Browse through unique single artworks or curated premium exhibitions. When you find a piece you love, interaction is frictionless."
              },
              {
                num: "03",
                title: "Unlock & Own",
                desc: "Authorize a micro-transaction directly from your wallet. Interledger handles the currency conversion and settlement instantly."
              }
            ].map((step, idx) => (
              <Card key={idx} className="p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="text-8xl font-black font-heading text-gold">{step.num}</span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-gold/10 text-gold flex items-center justify-center font-bold font-heading mb-6">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-text-primary mb-4 relative z-10">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed relative z-10">{step.desc}</p>
              </Card>
            ))}
          </div>
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
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="2" y1="12" x2="22" y2="12"></line>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                  </svg>
                ),
                title: "Pay From Everywhere",
                desc: "We support borderless payments from any country. Say goodbye to international wire delays and banking barriers."
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                ),
                title: "Instant Settlement",
                desc: "Transactions clear in real-time. The moment you acquire an artwork or unlock a gallery, funds route directly to the creator."
              },
              {
                icon: (
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-copper">
                    <rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect>
                    <line x1="2" y1="10" x2="22" y2="10"></line>
                  </svg>
                ),
                title: "Interoperable Wallets",
                desc: "Using Wallet Pointers, artists can receive payments directly into any standard ILP-compatible wallet, keeping transactions secure and decentralized."
              }
            ].map((feature, idx) => (
              <Card key={idx} className="p-8 border border-border bg-bg-card flex flex-col items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-bg-secondary border border-border">{feature.icon}</div>
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

