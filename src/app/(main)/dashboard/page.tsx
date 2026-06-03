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

  const totalSales = user.sales.reduce((acc, sale) => acc + Number(sale.amount), 0)
  const totalPurchases = user.purchases.reduce((acc, p) => acc + Number(p.amount), 0)

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary">Dashboard</h1>
        <Link href="/dashboard/settings">
          <Button variant="secondary">Profile Settings</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Total Sales</h3>
          <p className="text-3xl font-semibold text-text-primary">${totalSales.toFixed(2)}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Total Spent</h3>
          <p className="text-3xl font-semibold text-text-primary">${totalPurchases.toFixed(2)}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-text-secondary mb-2">Wallet Pointer</h3>
          <p className="text-lg font-medium text-text-primary truncate">
            {user.walletPointer || "Not set"}
          </p>
          {!user.walletPointer && (
            <Link href="/dashboard/settings" className="text-sm text-accent hover:underline mt-2 inline-block">Set up wallet</Link>
          )}
        </Card>
      </div>

      {user.role === 'ARTIST' && (
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
      )}
    </div>
  )
}
