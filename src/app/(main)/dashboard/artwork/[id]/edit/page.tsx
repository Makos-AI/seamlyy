"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Card, Input, Button, useToast } from "@/components/ui"
import { getArtworkById, getArtistGalleries, updateArtworkAction, deleteArtworkAction } from "@/actions/artwork"
import { Categories, ArtworkStatus } from "@/types"

export default function EditArtworkPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { data: session } = useSession()
  const { addToast } = useToast()
  
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [category, setCategory] = React.useState(Categories[0])
  const [price, setPrice] = React.useState("")
  const [status, setStatus] = React.useState<string>(ArtworkStatus.FIXED_PRICE)
  const [galleryId, setGalleryId] = React.useState<string>("none")
  
  const [thumbnailUrl, setThumbnailUrl] = React.useState("")
  const [galleries, setGalleries] = React.useState<any[]>([])
  
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)
  const [deleting, setDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (status === 'SOLD') {
      alert('This artwork has been sold and cannot be deleted.')
      return
    }

    if (!window.confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await deleteArtworkAction(id)
      if (res.error) {
        alert(res.error)
      } else {
        alert('Artwork deleted successfully!')
        router.push('/dashboard/gallery')
        router.refresh()
      }
    } catch (err) {
      alert('Failed to delete artwork.')
    } finally {
      setDeleting(false)
    }
  }

  React.useEffect(() => {
    async function loadData() {
      try {
        const [artworkRes, galleriesRes] = await Promise.all([
          getArtworkById(id),
          getArtistGalleries()
        ])

        if (artworkRes.error || !artworkRes.artwork) {
          throw new Error(artworkRes.error || "Failed to load artwork")
        }
        
        const { artwork } = artworkRes
        setTitle(artwork.title || "")
        setDescription(artwork.description || "")
        setCategory(artwork.category || Categories[0])
        setPrice(artwork.price?.toString() || "")
        setStatus(artwork.status || ArtworkStatus.FIXED_PRICE)
        setGalleryId(artwork.galleryId || "none")
        setThumbnailUrl(artwork.thumbnailUrl || artwork.displayUrl || "")
        
        if (galleriesRes.success && galleriesRes.galleries) {
          setGalleries(galleriesRes.galleries)
        }
      } catch (err: any) {
        addToast({ type: 'error', message: err.message })
        router.push('/dashboard/gallery')
      } finally {
        setLoading(false)
      }
    }
    if (id) loadData()
  }, [id, router, addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setSaving(true)
    try {
      const updateData = {
        artworkId: id,
        title,
        description,
        category,
        price: price ? parseFloat(price) : null,
        status,
        galleryId: galleryId === "none" ? null : galleryId
      }

      const res = await updateArtworkAction(updateData)
      if (res.error) throw new Error(res.error)

      addToast({ type: 'success', message: 'Artwork updated successfully!' })
      router.push('/dashboard/gallery')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      addToast({ type: 'error', message: err.message || 'Failed to update artwork.' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary">Edit Artwork</h1>
        <p className="text-text-secondary mt-2">Update the details of your artwork.</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {thumbnailUrl && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Artwork Preview</label>
              <img src={thumbnailUrl} alt="Artwork thumbnail" className="h-48 w-auto object-cover rounded-lg border border-border" />
              <p className="text-xs text-text-tertiary">Image cannot be changed.</p>
            </div>
          )}

          <Input 
            label="Artwork Title" 
            required 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Description</label>
            <textarea 
              className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-accent transition-colors text-text-primary"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Category</label>
            <select 
              className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-accent transition-colors text-text-primary"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              {Categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Price (USD)" 
              type="number" 
              step="0.01" 
              min="0"
              placeholder="e.g. 150.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Status</label>
              <select 
                className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-accent transition-colors text-text-primary"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value={ArtworkStatus.FIXED_PRICE}>Fixed Price</option>
                <option value={ArtworkStatus.NOT_FOR_SALE}>Not For Sale</option>
                <option value={ArtworkStatus.SOLD}>Sold</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Gallery Exhibition</label>
            <select 
              className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-accent transition-colors text-text-primary"
              value={galleryId}
              onChange={(e) => setGalleryId(e.target.value)}
            >
              <option value="none">None (Public Portfolio)</option>
              {galleries.map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex justify-between items-center">
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              loading={deleting}
              disabled={status === 'SOLD'}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              title={status === 'SOLD' ? 'Sold artworks cannot be deleted' : 'Delete artwork'}
            >
              Delete Artwork
            </Button>
            <div className="flex gap-4">
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" loading={saving}>Save Changes</Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  )
}
