"use client"

import * as React from "react"
import { Button, Input, useToast } from "@/components/ui"
import { reportArtworkAction } from "@/actions/report"

export function ReportArtworkModal({ artworkId, onClose }: { artworkId: string, onClose: () => void }) {
  const [reason, setReason] = React.useState("Signature Forgery")
  const [details, setDetails] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const { addToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const res = await reportArtworkAction({ artworkId, reason, details })
    
    setLoading(false)
    if (res.success) {
      addToast({ type: "success", message: "Report submitted successfully. Our curators will review it." })
      onClose()
    } else {
      addToast({ type: "error", message: res.error || "Failed to submit report." })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-bg-secondary border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-bold text-text-primary">Report Artwork</h2>
          <p className="text-sm text-text-secondary mt-1">Help us keep the community safe.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Reason for Report</label>
            <select 
              className="w-full h-10 bg-bg-primary border border-border rounded-lg px-3 text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25 transition-all text-text-primary"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            >
              <option value="Signature Forgery">Signature Forgery</option>
              <option value="Stolen Artwork">Stolen Artwork</option>
              <option value="Duplicate/Watermark Dispute">Duplicate/Watermark Dispute</option>
              <option value="Impersonation">Impersonation</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Additional Details (Optional)</label>
            <textarea 
              className="w-full bg-bg-primary border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/25 transition-all text-text-primary placeholder:text-text-muted resize-none"
              rows={4}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Provide evidence URLs or explain the issue..."
            />
          </div>

          <div className="flex gap-4 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} className="w-full">Cancel</Button>
            <Button type="submit" loading={loading} className="w-full bg-red-500 hover:bg-red-600 text-white border-transparent">
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
