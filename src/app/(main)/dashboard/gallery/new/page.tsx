"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Card, Input, Button, useToast } from "@/components/ui"
import { createGalleryAction } from "@/actions/artwork"

export default function CreateGalleryPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { addToast } = useToast()
  
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [accessFee, setAccessFee] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      addToast({ type: 'error', message: 'Please select a cover image file.' })
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
          folder: 'covers'
        })
      })
      const { url, key } = await presignedRes.json()
      if (!url) throw new Error("Failed to get presigned URL")

      // 2. Upload file (S3 or mock local route)
      await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      })

      // 3. Save to database using server action
      const isMock = url.startsWith('/api/upload/mock')
      const coverImageUrl = isMock 
        ? `/uploads/${key}` 
        : `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME || 'seamlyy-uploads'}.s3.amazonaws.com/${key}`

      const res = await createGalleryAction({
        title,
        description,
        accessFee: parseFloat(accessFee) || 0,
        coverImageUrl,
        coverImageKey: key
      })

      if (res.error) throw new Error(res.error)

      addToast({ type: 'success', message: 'Gallery created successfully!' })
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      addToast({ type: 'error', message: err.message || 'Failed to create gallery.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary">Create Premium Gallery</h1>
        <p className="text-text-secondary mt-2">Group your artworks into a premium exhibition for collectors to unlock.</p>
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
            <label className="block text-sm font-medium text-text-secondary">Cover Image</label>
            <input 
              type="file" 
              required
              accept="image/*" 
              className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-bg-tertiary file:text-text-primary hover:file:bg-bg-secondary cursor-pointer"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFile(e.target.files[0])
                }
              }}
            />
          </div>

          <div className="pt-4 flex justify-end gap-4">
            <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" loading={loading}>Create Gallery</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
