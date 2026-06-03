import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, Button, Badge } from "@/components/ui"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      artworks: true,
      purchases: true,
      sales: true,
    }
  })

  if (!user) redirect('/login')

  const totalSales = user.sales.filter(s => s.type !== "PAY_TO_VIEW").reduce((acc, sale) => acc + Number(sale.amount), 0)
  const revenueFromViews = user.sales.filter(s => s.type === "PAY_TO_VIEW").reduce((acc, sale) => acc + Number(sale.amount), 0)
  const walletBalance = totalSales + revenueFromViews

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 border-l-4 border-l-gold" hoverable={false}>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Total Sales</h3>
              <p className="text-3xl font-bold text-text-primary">${totalSales.toFixed(2)}</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-success" hoverable={false}>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Revenue from Views</h3>
              <p className="text-3xl font-bold text-text-primary">${revenueFromViews.toFixed(2)}</p>
              <p className="text-xs text-success mt-2 flex items-center gap-1">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                 Web Monetization active
              </p>
            </Card>
            <Card className="p-6" hoverable={false}>
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Wallet Balance</h3>
              <p className="text-3xl font-bold text-text-primary">${walletBalance.toFixed(2)}</p>
              {!user.walletPointer ? (
                <Link href="/dashboard/settings" className="text-xs text-error hover:underline mt-2 inline-block">Set up wallet →</Link>
              ) : (
                 <p className="text-xs text-text-muted mt-2 truncate font-mono bg-bg-tertiary px-2 py-1 rounded inline-block max-w-full">{user.walletPointer}</p>
              )}
            </Card>
          </div>

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
                      <img src={art.thumbnailUrl} alt={art.title} className="w-full h-full object-cover" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {user.purchases.map((purchase) => (
                  <Card key={purchase.id} className="p-4">
                     <p className="text-xs text-text-muted">Transaction</p>
                     <p className="font-bold text-lg text-text-primary mt-1">${Number(purchase.amount).toFixed(2)}</p>
                  </Card>
                ))}
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
