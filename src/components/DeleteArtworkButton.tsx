"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { deleteArtworkAction } from "@/actions/artwork"
import { Button } from "@/components/ui"

export function DeleteArtworkButton({ artworkId, artworkStatus }: { artworkId: string; artworkStatus: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = React.useState(false)

  const handleDelete = async () => {
    if (artworkStatus === 'SOLD') {
      alert('This artwork has been sold and cannot be deleted.')
      return
    }

    if (!window.confirm('Are you sure you want to delete this artwork? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await deleteArtworkAction(artworkId)
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

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      loading={deleting}
      disabled={artworkStatus === 'SOLD'}
      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
      title={artworkStatus === 'SOLD' ? 'Sold artworks cannot be deleted' : 'Delete artwork'}
    >
      Delete
    </Button>
  )
}
