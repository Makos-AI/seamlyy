"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession } from "@/lib/auth-client"
import { Card, Input, Button, useToast } from "@/components/ui"

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
    setLoading(true)
    
    // Simulating API call for gallery creation
    setTimeout(() => {
      setLoading(false)
      addToast({ type: 'success', message: 'Gallery created successfully!' })
      router.push('/dashboard')
    }, 1500)
  }

  if (session?.user?.role !== 'ARTIST') {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="text-text-secondary">Only artists can create galleries.</p>
      </div>
    )
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
              accept="image/*" 
              className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-bg-tertiary file:text-text-primary hover:file:bg-bg-secondary"
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
