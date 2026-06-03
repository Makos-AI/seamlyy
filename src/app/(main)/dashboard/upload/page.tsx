"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, Input, Button, useToast, Badge } from "@/components/ui"
import { Categories } from "@/types"

export default function UploadArtworkPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { addToast } = useToast()
  
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [category, setCategory] = React.useState<string>(Categories[0])
  const [file, setFile] = React.useState<File | null>(null)
  const [loading, setLoading] = React.useState(false)

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

    setLoading(true)

    try {
      // 1. Get presigned URL
      const presignedRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: 'artworks'
        })
      })
      
      const { url, key } = await presignedRes.json()
      if (!url) throw new Error("Failed to get presigned URL")

      // 2. Upload file to S3
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      })

      addToast({ type: 'success', message: 'Artwork uploaded successfully!' })
      router.push('/dashboard')
    } catch (error) {
      console.error(error)
      addToast({ type: 'error', message: 'Failed to upload artwork.' })
    } finally {
      setLoading(false)
    }
  }

  if (session?.user?.role !== 'ARTIST') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-text-secondary">Only artists can upload artworks.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary">Upload Artwork</h1>
        <p className="text-text-secondary mt-2">Add a new piece to your public portfolio or a gallery.</p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Artwork Image</label>
            <div className="border-2 border-dashed border-border hover:border-accent transition-colors rounded-xl p-8 text-center bg-bg-secondary">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="hidden" 
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted mb-4"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                <span className="text-text-primary font-medium">{file ? file.name : 'Click to select a file'}</span>
                <span className="text-sm text-text-secondary mt-1">PNG, JPG, or WEBP (Max 20MB)</span>
              </label>
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Category</label>
              <select 
                className="w-full h-10 bg-bg-secondary border border-border rounded-xl px-3 text-sm focus:outline-none focus:border-accent transition-colors text-text-primary appearance-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {Categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <Input 
              label="Price (USD)" 
              type="number" 
              step="0.01" 
              min="0"
              placeholder="0.00 (Leave empty if not for sale)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" loading={loading}>Upload</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
