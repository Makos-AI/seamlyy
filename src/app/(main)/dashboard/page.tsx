import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, Button } from "@/components/ui"
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
  
  // A mock logic for current wallet balance (e.g. Sales + Revenue - Payouts)
  // We'll just display the sum for now to demonstrate the metric
  const walletBalance = totalSales + revenueFromViews

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary">Dashboard</h1>
        <div className="flex gap-4">
          <Link href="/dashboard/gallery">
            <Button variant="secondary">Gallery Management</Button>
          </Link>
          <Link href="/dashboard/settings">
            <Button variant="secondary">Profile Settings</Button>
          </Link>
        </div>
      </div>

      {user.role === 'ARTIST' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6 border-l-4 border-l-accent">
              <h3 className="text-sm font-medium text-text-secondary mb-2">Total Sales (Artworks)</h3>
              <p className="text-3xl font-semibold text-text-primary">${totalSales.toFixed(2)}</p>
            </Card>
            <Card className="p-6 border-l-4 border-l-success relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-16 h-16 bg-success/10 rounded-full flex items-center justify-center opacity-50 group-hover:scale-150 transition-transform">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-success"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </div>
              <h3 className="text-sm font-medium text-text-secondary mb-2 relative z-10">Revenue from Views</h3>
              <p className="text-3xl font-semibold text-text-primary relative z-10">${revenueFromViews.toFixed(2)}</p>
              <p className="text-xs text-success mt-2 relative z-10 flex items-center gap-1">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                 +24% this week
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-text-secondary mb-2">Wallet Balance</h3>
              <p className="text-3xl font-semibold text-text-primary">${walletBalance.toFixed(2)}</p>
              {!user.walletPointer ? (
                <Link href="/dashboard/settings" className="text-sm text-error hover:underline mt-2 inline-block">Pointer not set</Link>
              ) : (
                 <p className="text-xs text-text-muted mt-2 truncate font-mono bg-bg-secondary px-2 py-1 rounded inline-block">{user.walletPointer}</p>
              )}
            </Card>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-semibold text-text-primary">Your Artworks</h2>
              <Link href="/dashboard/upload">
                <Button>Upload Artwork</Button>
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
                      <h3 className="font-semibold text-text-primary truncate">{art.title}</h3>
                      <p className="text-sm text-text-secondary mt-1">{art.status}</p>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center bg-bg-secondary border-dashed">
                <p className="text-text-secondary mb-4">You haven't uploaded any artwork yet.</p>
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
            <Card className="p-6 border-l-4 border-l-accent">
              <h3 className="text-sm font-medium text-text-secondary mb-2">Your Collection</h3>
              <p className="text-3xl font-semibold text-text-primary">{user.purchases.length} Artworks</p>
            </Card>
            <Card className="p-6">
              <h3 className="text-sm font-medium text-text-secondary mb-2">Wallet Pointer</h3>
              <p className="text-xl font-semibold text-text-primary mb-2">Linked to Rafiki Testnet</p>
              {!user.walletPointer ? (
                <Link href="/dashboard/settings" className="text-sm text-error hover:underline mt-2 inline-block">Pointer not set</Link>
              ) : (
                 <p className="text-xs text-text-muted truncate font-mono bg-bg-secondary px-2 py-1 rounded inline-block">{user.walletPointer}</p>
              )}
            </Card>
          </div>

          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-heading font-semibold text-text-primary">Acquired Pieces</h2>
              <Link href="/explore">
                <Button>Explore Galleries</Button>
              </Link>
            </div>
            
            {user.purchases.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {user.purchases.map((purchase) => (
                  <Card key={purchase.id} className="overflow-hidden flex flex-col p-4">
                     <p className="text-sm text-text-secondary">Transaction: {purchase.id}</p>
                     <p className="font-semibold text-lg mt-2">${Number(purchase.amount).toFixed(2)}</p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center bg-bg-secondary border-dashed">
                <p className="text-text-secondary mb-4">Your collection is empty.</p>
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
