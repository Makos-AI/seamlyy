"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Card, Input, Button, useToast } from "@/components/ui"
import { getGalleryById, updateGalleryAction, deleteGalleryAction } from "@/actions/artwork"

export default function EditGalleryPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const { data: session } = useSession()
  const { addToast } = useToast()
  
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [accessFee, setAccessFee] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [currentCoverUrl, setCurrentCoverUrl] = React.useState("")
  const [artworksCount, setArtworksCount] = React.useState(0)
  
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    async function loadGallery() {
      try {
        const res = await getGalleryById(id)
        if (res.error || !res.gallery) {
          throw new Error(res.error || "Failed to load gallery")
        }
        const { gallery } = res
        setTitle(gallery.title || "")
        setDescription(gallery.description || "")
        setAccessFee(gallery.accessFee?.toString() || "0")
        if (gallery.coverImageUrl) {
          setCurrentCoverUrl(gallery.coverImageUrl)
        }
        if (gallery.artworks) {
          setArtworksCount(gallery.artworks.length)
        } else if (gallery._count?.artworks !== undefined) {
          setArtworksCount(gallery._count.artworks)
        }
      } catch (err: any) {
        addToast({ type: 'error', message: err.message })
        router.push('/dashboard/gallery')
      } finally {
        setLoading(false)
      }
    }
    if (id) loadGallery()
  }, [id, router, addToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (file && file.size > 20 * 1024 * 1024) {
      addToast({ type: 'error', message: 'File size exceeds 20MB limit.' })
      return
    }

    setSaving(true)
    try {
      let updateData: any = {
        id,
        title,
        description,
        accessFee: parseFloat(accessFee) || 0,
      }

      if (file) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", file)
        uploadFormData.append("folder", "covers")

        const presignedRes = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData
        })
        const uploadData = await presignedRes.json()
        if (!presignedRes.ok || !uploadData.displayUrl) {
          throw new Error(uploadData.error || "Failed to upload cover image")
        }

        updateData.coverImageUrl = uploadData.displayUrl || uploadData.thumbnailUrl
        updateData.coverImageKey = uploadData.displayKey || uploadData.thumbnailKey
        updateData.coverBlurDataURL = uploadData.blurDataURL
      }

      const res = await updateGalleryAction(updateData)
      if (res.error) throw new Error(res.error)

      addToast({ type: 'success', message: 'Gallery updated successfully!' })
      router.push('/dashboard/gallery')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      addToast({ type: 'error', message: err.message || 'Failed to update gallery.' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Are you sure? This will remove the exhibition but preserve all artworks.')) {
      try {
        const res = await deleteGalleryAction(id)
        if (res.error) throw new Error(res.error)
        addToast({ type: 'success', message: 'Exhibition deleted successfully.' })
        router.push('/dashboard/gallery')
        router.refresh()
      } catch (err: any) {
        addToast({ type: 'error', message: err.message || 'Failed to delete exhibition.' })
      }
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary">Edit Premium Gallery</h1>
          <p className="text-text-secondary mt-2">Update your exhibition details.</p>
        </div>
        <Button variant="ghost" className="text-red-500 hover:bg-red-500/10 hover:text-red-600" onClick={handleDelete}>
          Delete Exhibition
        </Button>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input 
            label="Gallery Title" 
            required 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Description</label>
            <textarea 
              className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-accent transition-colors text-text-primary"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Input 
            label="Access Fee (USD)" 
            type="number" 
            step="0.01" 
            min="0"
            required
            placeholder="e.g. 5.00"
            value={accessFee}
            onChange={(e) => setAccessFee(e.target.value)}
          />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Cover Image (Optional)</label>
            {currentCoverUrl && (
              <div className="mb-4">
                <img src={currentCoverUrl} alt="Current Cover" className="h-32 w-auto object-cover rounded-lg border border-border" />
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-bg-tertiary file:text-text-primary hover:file:bg-bg-secondary cursor-pointer"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0])
                }
              }}
            />
            <p className="text-xs text-text-tertiary mt-1">Leave empty to keep the current cover image.</p>
          </div>
          
          <div className="text-sm text-text-secondary">
            Current Artworks: {artworksCount}
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
