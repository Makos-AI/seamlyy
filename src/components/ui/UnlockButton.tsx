"use client"
import * as React from "react"
import { Button } from "./Button"

interface UnlockButtonProps {
  amount: string | number
  onClick?: () => void
  loading?: boolean
}

export function UnlockButton({ amount, onClick, loading }: UnlockButtonProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Button size="lg" className="px-12 relative overflow-hidden group" onClick={onClick} loading={loading}>
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
        <span className="relative z-10 flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Unlock for ${amount.toString()}
        </span>
      </Button>
      <p className="text-xs text-text-muted flex items-center gap-1">
        Powered by Open Payments
      </p>
    </div>
  )
}
