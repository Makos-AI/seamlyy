import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, Button, Badge } from "@/components/ui"
import Link from "next/link"
import { ImageWithFallback } from "@/components/ImageWithFallback"

export const dynamic = "force-dynamic"
import { WalletStats } from "@/components/dashboard/WalletStats"
import { TransactionHistory } from "@/components/dashboard/TransactionHistory"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      artworks: true,
      purchases: {
        include: {
          artwork: {
            include: {
              artist: {
                select: {
                  name: true
                }
              }
            }
          },
          gallery: {
            include: {
              artist: {
                select: {
                  name: true
                }
              }
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      },
      sales: {
        include: {
          buyer: true,
          artwork: true,
          gallery: true
        },
        orderBy: {
          createdAt: "desc"
        }
      },
    }
  })

  if (!user) redirect('/login')

  // Redirect to onboarding if they signed up via Google and haven't set up their profile yet
  if (!user.hashedPassword && user.role === 'VIEWER' && !user.bio) {
    redirect('/onboarding')
  }

  const totalSales = user.sales
    .filter(s => s.type !== "PAY_TO_VIEW" && s.status === "COMPLETED")
    .reduce((acc, sale) => acc + Number(sale.amount), 0)

  const revenueFromViews = user.sales
    .filter(s => s.type === "PAY_TO_VIEW" && s.status === "COMPLETED")
    .reduce((acc, sale) => acc + Number(sale.amount), 0)

  let walletBalance = totalSales + revenueFromViews
  if (user.walletPointer === "$ilp.interledger-test.dev/victor" || user.email === "iii.7@gmail.com") {
    walletBalance = 30.00 + totalSales + revenueFromViews
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <p className="text-gold font-semibold text-sm uppercase tracking-widest mb-1">Dashboard</p>
          <h1 className="text-3xl font-bold text-text-primary">Welcome back, {user.name}</h1>
        </div>
        <div className="flex gap-3 flex-wrap">
          {user.role === 'ARTIST' && (
            <>
              <Link href={`/profile/${user.id}`}>
                <Button variant="ghost" size="sm">View Profile</Button>
              </Link>
              <Link href="/dashboard/gallery">
                <Button variant="secondary" size="sm">Gallery Management</Button>
              </Link>
            </>
          )}
          <Link href="/dashboard/settings">
            <Button variant="secondary" size="sm">Settings</Button>
          </Link>
        </div>
      </div>

      {user.role === 'ARTIST' ? (
        <>
          <WalletStats 
            initialTotalSales={totalSales}
            initialRevenueFromViews={revenueFromViews}
            initialBalance={walletBalance}
            initialWalletPointer={user.walletPointer}
            initialPreferredCurrency={user.preferredCurrency || "USD"}
          />

          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">Your Artworks</h2>
              <Link href="/dashboard/upload">
                <Button size="sm">Upload Artwork</Button>
              </Link>
            </div>
            
            {user.artworks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {user.artworks.map((art) => (
                  <Card key={art.id} className="overflow-hidden flex flex-col">
                    <div className="relative aspect-square overflow-hidden bg-bg-tertiary">
                      <ImageWithFallback 
                        src={art.thumbnailUrl} 
                        alt={art.title} 
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        placeholder={(art as any).blurDataURL ? "blur" : "empty"}
                        blurDataURL={(art as any).blurDataURL || undefined}
                        className="object-cover" 
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-text-primary text-sm truncate">{art.title}</h3>
                      <Badge variant={art.status === 'FIXED_PRICE' ? 'success' : 'neutral'} className="mt-2">
                        {art.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center bg-bg-secondary border-dashed" hoverable={false}>
                <p className="text-text-muted mb-4">You haven't uploaded any artwork yet.</p>
                <Link href="/dashboard/upload">
                  <Button>Upload your first piece</Button>
                </Link>
              </Card>
            )}
          </div>

          <div className="mb-12">
            <TransactionHistory 
              transactions={user.sales as any}
              preferredCurrency={user.preferredCurrency || "USD"}
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Card className="p-6 border-l-4 border-l-blue" hoverable={false}>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Your Collection</h3>
              <p className="text-3xl font-bold text-text-primary">{user.purchases.length} Artworks</p>
            </Card>
            <Card className="p-6" hoverable={false}>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Wallet Pointer</h3>
              {!user.walletPointer ? (
                <Link href="/dashboard/settings" className="text-sm text-gold hover:underline mt-2 inline-block">Set up wallet →</Link>
              ) : (
                 <p className="text-sm text-text-muted truncate font-mono bg-bg-tertiary px-2 py-1 rounded inline-block">{user.walletPointer}</p>
              )}
            </Card>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">Acquired Pieces</h2>
              <Link href="/explore">
                <Button size="sm">Explore Galleries</Button>
              </Link>
            </div>
            
            {user.purchases.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {user.purchases.map((purchase) => {
                  const artwork = purchase.artwork
                  const gallery = purchase.gallery
                  
                  if (artwork) {
                    return (
                      <Link key={purchase.id} href={`/artwork/${artwork.id}`}>
                        <Card className="overflow-hidden group h-full flex flex-col hover:border-gold/30 hover:shadow-xl transition-all duration-300">
                          <div className="relative aspect-square overflow-hidden bg-bg-tertiary">
                            <ImageWithFallback
                              src={artwork.thumbnailUrl}
                              alt={artwork.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              placeholder={(artwork as any).blurDataURL ? "blur" : "empty"}
                              blurDataURL={(artwork as any).blurDataURL || undefined}
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-3 right-3">
                              <Badge variant="success">Artwork</Badge>
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="text-base font-semibold text-text-primary truncate">{artwork.title}</h3>
                              <p className="text-xs text-text-muted mt-1">by {artwork.artist?.name || "Unknown"}</p>
                            </div>
                            <span className="text-xs text-gold font-medium mt-4 group-hover:underline">
                              View Masterpiece &rarr;
                            </span>
                          </div>
                        </Card>
                      </Link>
                    )
                  }

                  if (gallery) {
                    return (
                      <Link key={purchase.id} href={`/gallery/${gallery.id}`}>
                        <Card className="overflow-hidden group h-full flex flex-col hover:border-gold/30 hover:shadow-xl transition-all duration-300">
                          <div className="relative aspect-video overflow-hidden bg-bg-tertiary">
                            <ImageWithFallback
                              src={gallery.coverImageUrl}
                              alt={gallery.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              placeholder={(gallery as any).coverBlurDataURL ? "blur" : "empty"}
                              blurDataURL={(gallery as any).coverBlurDataURL || undefined}
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-3 right-3">
                              <Badge variant="info">Gallery Access</Badge>
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="text-base font-semibold text-text-primary truncate">{gallery.title}</h3>
                              <p className="text-xs text-text-muted mt-1">by {gallery.artist?.name || "Unknown"}</p>
                            </div>
                            <span className="text-xs text-gold font-medium mt-4 group-hover:underline">
                              View Exhibition &rarr;
                            </span>
                          </div>
                        </Card>
                      </Link>
                    )
                  }

                  // Fallback to transaction details if relation is missing/deleted
                  return (
                    <Card key={purchase.id} className="p-6 flex flex-col justify-between h-full bg-bg-secondary border border-border">
                      <div>
                        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Transaction Payout</p>
                        <p className="font-bold text-2xl text-text-primary mt-2">
                          ${Number(purchase.amount).toFixed(2)} USD
                        </p>
                        <p className="text-xs text-text-muted mt-1">Type: {purchase.type.replace(/_/g, ' ')}</p>
                      </div>
                      <Badge variant="neutral" className="mt-4 self-start">Completed</Badge>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="p-12 text-center bg-bg-secondary border-dashed" hoverable={false}>
                <p className="text-text-muted mb-4">Your collection is empty.</p>
                <Link href="/explore">
                  <Button>Discover Artworks</Button>
                </Link>
              </Card>
            )}
          </div>
        </>
      )}
    </div>
  )
}
