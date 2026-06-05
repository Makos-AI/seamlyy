"use client"

import * as React from "react"
import { Button, Modal, Input } from "@/components/ui"

interface CheckoutButtonProps {
  targetId: string
  type: 'ARTWORK' | 'GALLERY'
  amount: number
  title: string
  initialWalletPointer?: string | null
  buttonText?: string
  className?: string
}

export function CheckoutButton({
  targetId,
  type,
  amount,
  title,
  initialWalletPointer = "",
  buttonText = "Acquire Artwork",
  className = ""
}: CheckoutButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [walletPointer, setWalletPointer] = React.useState(initialWalletPointer || "")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!walletPointer.trim()) {
      setError("Please enter your Interledger wallet address.")
      return
    }

    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/sell-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetId,
          type,
          amount,
          buyerWallet: walletPointer.trim()
        })
      })

      const data = await response.json()

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to initiate payment")
      }

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        throw new Error("No redirect URL returned from checkout server.")
      }

    } catch (err: any) {
      console.error(err)
      setError(err.message || "An unexpected error occurred during checkout.")
      setLoading(false)
    }
  }

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className={className}
      >
        {buttonText}
      </Button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => {
          if (!loading) {
            setIsOpen(false)
            setError("")
          }
        }} 
        title="Checkout via Open Payments"
      >
        <form onSubmit={handleCheckout} className="space-y-6">
          <div>
            <p className="text-sm text-text-secondary mb-1">Purchasing:</p>
            <p className="font-semibold text-text-primary text-base mb-1">{title}</p>
            <p className="text-gold font-bold text-lg">${amount.toFixed(2)} USD</p>
          </div>

          <Input
            label="Your Wallet Address (Payment Pointer)"
            type="text"
            placeholder="e.g. $rafiki.money/p/sarah"
            value={walletPointer}
            onChange={(e) => setWalletPointer(e.target.value)}
            required
            disabled={loading}
          />

          {error && (
            <p className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              loading={loading}
            >
              Pay Now
            </Button>
          </div>
          
          <p className="text-center text-[10px] text-text-muted">
            You will be redirected to your wallet provider to authorize this secure transaction.
          </p>
        </form>
      </Modal>
    </>
  )
}
