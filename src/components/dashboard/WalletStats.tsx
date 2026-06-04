"use client"

import * as React from "react"
import { Card } from "@/components/ui"
import Link from "next/link"

interface WalletStatsProps {
  initialTotalSales: number
  initialRevenueFromViews: number
  initialBalance: number
  initialWalletPointer: string | null
  initialPreferredCurrency: string
}

export function WalletStats({
  initialTotalSales,
  initialRevenueFromViews,
  initialBalance,
  initialWalletPointer,
  initialPreferredCurrency
}: WalletStatsProps) {
  const [totalSales, setTotalSales] = React.useState(initialTotalSales)
  const [revenueFromViews, setRevenueFromViews] = React.useState(initialRevenueFromViews)
  const [balance, setBalance] = React.useState(initialBalance)
  const [walletPointer, setWalletPointer] = React.useState(initialWalletPointer)
  const [preferredCurrency, setPreferredCurrency] = React.useState(initialPreferredCurrency)

  React.useEffect(() => {
    // Dynamic polling to fetch latest wallet balance every 10 seconds
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/wallet/balance")
        const data = await res.json()
        if (data.success) {
          setTotalSales(data.totalSales)
          setRevenueFromViews(data.revenueFromViews)
          setBalance(data.balance)
          setWalletPointer(data.walletPointer)
          setPreferredCurrency(data.preferredCurrency)
        }
      } catch (err) {
        console.error("Failed to poll wallet balance:", err)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const formatValue = (usdAmount: number) => {
    if (preferredCurrency === "NGN") {
      const ngnAmount = usdAmount * 1500
      return `₦${ngnAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$${usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      <Card className="p-6 border-l-4 border-l-gold" hoverable={false}>
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Total Sales</h3>
        <p className="text-3xl font-bold text-text-primary transition-all duration-300">{formatValue(totalSales)}</p>
      </Card>
      
      <Card className="p-6 border-l-4 border-l-success" hoverable={false}>
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Revenue from Views</h3>
        <p className="text-3xl font-bold text-text-primary transition-all duration-300">{formatValue(revenueFromViews)}</p>
        <p className="text-xs text-success mt-2 flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
          Web Monetization active
        </p>
      </Card>

      <Card className="p-6" hoverable={false}>
        <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">Wallet Balance</h3>
        <p className="text-3xl font-bold text-text-primary transition-all duration-300">{formatValue(balance)}</p>
        {!walletPointer ? (
          <Link href="/dashboard/settings" className="text-xs text-error hover:underline mt-2 inline-block">
            Set up wallet →
          </Link>
        ) : (
          <p className="text-xs text-text-muted mt-2 truncate font-mono bg-bg-tertiary px-2 py-1 rounded inline-block max-w-full">
            {walletPointer}
          </p>
        )}
      </Card>
    </div>
  )
}
