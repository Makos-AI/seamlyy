"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Card, Input, Button, useToast, Badge } from "@/components/ui"
import { Categories } from "@/types"
import { getArtistGalleries, createArtworkAction } from "@/actions/artwork"
import Link from "next/link"

export default function UploadArtworkPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { addToast } = useToast()
  
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [category, setCategory] = React.useState<string>(Categories[0])
  const [file, setFile] = React.useState<File | null>(null)
  
  const [openToSale, setOpenToSale] = React.useState(true)
  const [addToGallery, setAddToGallery] = React.useState(false)
  const [galleryId, setGalleryId] = React.useState("")
  const [galleries, setGalleries] = React.useState<any[]>([])
  
  const [loading, setLoading] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  
  // Flagged Dialog State
  const [flaggedStatus, setFlaggedStatus] = React.useState<string | null>(null)
  const [flaggedPayload, setFlaggedPayload] = React.useState<any>(null)
  const [flaggedArtworkId, setFlaggedArtworkId] = React.useState<string | null>(null)

  React.useEffect(() => {
    async function loadGalleries() {
      const res = await getArtistGalleries()
      if (res.success && res.galleries) {
        setGalleries(res.galleries)
        if (res.galleries.length > 0) {
          setGalleryId(res.galleries[0].id)
        }
      }
    }
    loadGalleries()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      addToast({ type: 'error', message: 'Please select an image file.' })
      return
    }

    if (file.size > 20 * 1024 * 1024) {
      addToast({ type: 'error', message: 'File size exceeds 20MB limit.' })
      return
    }

    if (openToSale && (!price || parseFloat(price) <= 0)) {
      addToast({ type: 'error', message: 'Please enter a valid price.' })
      return
    }

    if (addToGallery && !galleryId) {
      addToast({ type: 'error', message: 'Please select a premium gallery or create one.' })
      return
    }

    setLoading(true)

    try {
      // 1. Upload file via FormData (server processes 3 variants & uploads to storage)
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)
      uploadFormData.append("folder", "artworks")

      console.log("[UPLOAD FORM] Sending file to /api/upload with folder='artworks'...")

      const presignedRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData
      })
      
      const uploadData = await presignedRes.json()
      console.log("[UPLOAD FORM] /api/upload response:", uploadData)

      if (!presignedRes.ok || !uploadData.thumbnailUrl) {
        throw new Error(uploadData.error || "Failed to upload image")
      }

      let status = "NOT_FOR_SALE"
      if (openToSale) {
        status = "FIXED_PRICE"
      } else if (addToGallery) {
        status = "PREMIUM_LOCKED"
      }

      console.log("[UPLOAD FORM] Calling createArtworkAction with status:", status)

      const res = await createArtworkAction({
        title,
        description,
        category,
        price: openToSale ? parseFloat(price) : null,
        galleryId: addToGallery ? galleryId : null,
        status,
        thumbnailUrl: uploadData.thumbnailUrl,
        thumbnailKey: uploadData.thumbnailKey,
        displayUrl: uploadData.displayUrl,
        displayKey: uploadData.displayKey,
        highResKey: uploadData.highResKey,
        blurDataURL: uploadData.blurDataURL,
        blurDataURL: uploadData.blurDataURL,
        masterWidth: uploadData.masterWidth,
        masterHeight: uploadData.masterHeight,
        inspectionStatus: uploadData.inspectionStatus,
        watermarkPayload: uploadData.watermarkPayload
      })

      console.log("[UPLOAD FORM] createArtworkAction result:", res)

      if (res.error) throw new Error(res.error)

      if (uploadData.inspectionStatus && uploadData.inspectionStatus !== "PUBLISHED") {
        setFlaggedStatus(uploadData.inspectionStatus)
        setFlaggedPayload(uploadData)
        setFlaggedArtworkId(res.artworkId)
      } else {
        addToast({ type: 'success', message: 'Artwork uploaded successfully!' })
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      console.error("[UPLOAD FORM] ❌ Error:", error)
      addToast({ type: 'error', message: error.message || 'Failed to upload artwork.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {flaggedStatus ? (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-heading font-bold text-text-primary">Upload Flagged</h1>
            <a href="mailto:support@seamlyy.com">
              <Button variant="secondary" size="sm">Contact Us</Button>
            </a>
          </div>

          {flaggedStatus === "FLAGGED_INVALID_SIGNATURE" && (
            <div className="bg-bg-secondary border border-border rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4 text-amber-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                <h2 className="text-xl font-bold">Signature Verification Warning</h2>
              </div>
              <p className="text-text-secondary mb-4">We could not match the signature on this artwork with the master signature locked to your profile.</p>
              <ul className="list-disc pl-5 text-sm text-text-muted mb-6 space-y-1">
                <li>The signature is placed in an unconventional area or too faint.</li>
                <li>You uploaded work using a signature version different from your lock.</li>
              </ul>
              <div className="bg-bg-tertiary p-4 rounded-lg mb-6 text-sm text-text-primary">
                <strong>Status:</strong> Your artwork has been saved as UNVERIFIED (Flagged).
              </div>
              <div className="flex gap-4">
                <Button onClick={() => {
                  router.push('/dashboard')
                  router.refresh()
                }}>Submit for Manual Curator Review</Button>
                <Button variant="ghost" onClick={() => {
                  router.push('/dashboard')
                  router.refresh()
                }}>Proceed as Unverified Draft</Button>
              </div>
            </div>
          )}

          {flaggedStatus === "FLAGGED_DUPLICATE_WATERMARK" && (
            <div className="bg-bg-secondary border border-red-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4 text-red-500">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                <h2 className="text-xl font-bold">Duplicate Watermark Detected</h2>
              </div>
              <p className="text-text-secondary mb-4">Our inspection engine found a digital copyright watermark embedded in this image that belongs to another registered creator.</p>
              <div className="bg-red-500/10 p-4 rounded-lg mb-6 text-sm text-red-400">
                <strong>Status:</strong> Upload Flagged for Copyright Review.
              </div>
              <ul className="list-disc pl-5 text-sm text-text-muted mb-6 space-y-1">
                <li>If you own this work under another account, contact support.</li>
                <li>If you hold an official license, attach proof in a dispute.</li>
              </ul>
              <div className="flex gap-4">
                <Button variant="secondary" onClick={() => {
                  addToast({ type: 'info', message: 'Dispute filed. Support will contact you.' })
                  router.push('/dashboard')
                }}>File Ownership Dispute</Button>
                <Button variant="ghost" onClick={() => {
                  // In a real app we'd trigger an API to delete the artwork
                  addToast({ type: 'success', message: 'Upload cancelled.' })
                  router.push('/dashboard')
                }}>Dismiss & Cancel Upload</Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-heading font-bold text-text-primary">Upload Artwork</h1>
            <p className="text-text-secondary mt-2">Add a new piece to your public portfolio or a gallery.</p>
          </div>
          <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Artwork Image</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border hover:border-accent transition-colors rounded-xl p-8 text-center bg-bg-secondary cursor-pointer"
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden" 
                ref={fileInputRef}
              />
              <div className="flex flex-col items-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <span className="text-text-primary font-medium">{file ? file.name : 'Click to select a file'}</span>
                <span className="text-sm text-text-secondary mt-1">PNG, JPG, or WEBP (Max 20MB)</span>
              </div>
            </div>
          </div>

          <Input 
            label="Title" 
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

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Category</label>
            <select 
              className="w-full h-10 bg-bg-secondary border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-accent transition-colors text-text-primary"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {Categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Monetization Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg-secondary/40">
              <div>
                <label className="block text-sm font-semibold text-text-primary">Open to Sale</label>
                <span className="text-xs text-text-muted">Allow collectors to buy this artwork</span>
              </div>
              <input 
                type="checkbox"
                checked={openToSale}
                onChange={(e) => setOpenToSale(e.target.checked)}
                className="w-5 h-5 rounded border-border text-gold focus:ring-gold"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-bg-secondary/40">
              <div>
                <label className="block text-sm font-semibold text-text-primary">Add to Premium Gallery</label>
                <span className="text-xs text-text-muted">Group this into a premium exhibition</span>
              </div>
              <input 
                type="checkbox"
                checked={addToGallery}
                onChange={(e) => setAddToGallery(e.target.checked)}
                className="w-5 h-5 rounded border-border text-gold focus:ring-gold"
              />
            </div>
          </div>

          {openToSale && (
            <Input 
              label="Price (USD)" 
              type="number" 
              step="0.01" 
              min="0"
              required
              placeholder="e.g., 150.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          )}

          {addToGallery && (
            <div className="space-y-2 p-4 rounded-xl border border-border bg-bg-secondary/20">
              <label className="block text-sm font-medium text-text-secondary">Select Premium Gallery</label>
              <div className="flex items-center gap-4">
                <select 
                  className="flex-1 h-10 bg-bg-secondary border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-accent transition-colors text-text-primary"
                  value={galleryId}
                  onChange={(e) => setGalleryId(e.target.value)}
                >
                  {galleries.map(g => (
                    <option key={g.id} value={g.id}>{g.title}</option>
                  ))}
                  {galleries.length === 0 && (
                    <option value="" disabled>No galleries available</option>
                  )}
                </select>
                <Link href="/dashboard/gallery/new">
                  <Button type="button" variant="secondary" size="sm">Create New Gallery</Button>
                </Link>
              </div>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" loading={loading}>Upload</Button>
          </div>
        </form>
      </Card>

    </div>
  )
}
