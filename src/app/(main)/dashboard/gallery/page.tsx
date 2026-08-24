import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, Button, Input, Badge } from "@/components/ui"
import Link from "next/link"
import { ImageWithFallback } from "@/components/ImageWithFallback"

export default async function GalleryManagementPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      artworks: true,
      galleries: true,
    }
  })

  if (!user || user.role !== 'ARTIST') redirect('/dashboard')

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary mb-2">Gallery Management</h1>
          <p className="text-text-secondary">Organize your portfolio, set standard prices, and define web monetization rules.</p>
        </div>
        <Link href="/dashboard/upload">
          <Button>Upload New Piece</Button>
        </Link>
      </div>

      <div className="mb-12">
        <h2 className="text-2xl font-heading font-semibold text-text-primary mb-6">Premium Exhibitions</h2>
        {user.galleries.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {user.galleries.map(gallery => (
              <Card key={gallery.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">{gallery.title}</h3>
                  <Badge variant="info">Monetized</Badge>
                </div>
                <p className="text-sm text-text-secondary mb-4 line-clamp-2">{gallery.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-lg font-bold">${Number(gallery.accessFee).toFixed(2)} Access Fee</span>
                  <Link href={`/dashboard/gallery/${gallery.id}/edit`}><Button variant="secondary" size="sm">Edit Exhibition</Button></Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed bg-bg-secondary">
            <p className="text-text-secondary mb-4">You haven't created any premium exhibitions yet.</p>
            <Link href="/dashboard/gallery/new"><Button variant="secondary">Create Premium Exhibition</Button></Link>
          </Card>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-heading font-semibold text-text-primary mb-6">Artwork Inventory & Pricing</h2>
        <div className="bg-bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg-secondary text-sm">
                  <th className="p-4 font-medium text-text-secondary">Artwork</th>
                  <th className="p-4 font-medium text-text-secondary">Status</th>
                  <th className="p-4 font-medium text-text-secondary">Standard Price</th>
                  <th className="p-4 font-medium text-text-secondary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {user.artworks.map((art) => (
                  <tr key={art.id} className="hover:bg-bg-secondary/50 transition-colors group cursor-default">
                    <td className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-bg-tertiary overflow-hidden flex-shrink-0 relative">
                          <ImageWithFallback 
                            src={art.thumbnailUrl} 
                            alt={art.title} 
                            fill
                            sizes="48px"
                            placeholder={art.blurDataURL ? "blur" : "empty"}
                            blurDataURL={art.blurDataURL || undefined}
                            className="object-cover" 
                          />
                        </div>
                        <span className="font-medium">{art.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant={art.status === 'NOT_FOR_SALE' ? 'neutral' : 'success'}>
                        {art.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td className="p-4 font-medium">
                      {art.price ? `$${Number(art.price).toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/dashboard/artwork/${art.id}/edit`}><Button variant="ghost" size="sm">Edit</Button></Link>
                    </td>
                  </tr>
                ))}
                {user.artworks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-text-secondary">
                      No artworks found. Upload some pieces to start managing your gallery.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
