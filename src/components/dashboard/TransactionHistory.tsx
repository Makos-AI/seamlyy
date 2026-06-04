"use client"

import * as React from "react"
import { Card, Badge } from "@/components/ui"

interface Transaction {
  id: string
  type: string
  amount: number
  currency: string
  status: string
  createdAt: Date | string
  buyer: {
    name: string | null
    email: string
  }
  artwork: {
    title: string
  } | null
  gallery: {
    title: string
  } | null
}

interface TransactionHistoryProps {
  transactions: Transaction[]
  preferredCurrency: string
}

export function TransactionHistory({ transactions, preferredCurrency }: TransactionHistoryProps) {
  const formatValue = (usdAmount: number) => {
    if (preferredCurrency === "NGN") {
      const ngnAmount = usdAmount * 1500
      return `₦${ngnAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }
    return `$${usdAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <Card className="p-8" hoverable={false}>
      <h2 className="text-xl font-bold text-text-primary mb-6">Transaction History</h2>
      
      {transactions.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-secondary text-sm">
                <th className="p-4 font-medium text-text-secondary">Date</th>
                <th className="p-4 font-medium text-text-secondary">Sender</th>
                <th className="p-4 font-medium text-text-secondary">Type</th>
                <th className="p-4 font-medium text-text-secondary">Item</th>
                <th className="p-4 font-medium text-text-secondary">Amount</th>
                <th className="p-4 font-medium text-text-secondary text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-bg-secondary/30 transition-colors">
                  <td className="p-4 text-text-secondary">
                    {new Date(tx.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-text-primary">{tx.buyer.name || "Anonymous Collector"}</div>
                    <div className="text-xs text-text-muted">{tx.buyer.email}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant={tx.type === "ONE_TIME_PURCHASE" ? "info" : "premium"}>
                      {tx.type === "ONE_TIME_PURCHASE" ? "One-Time Purchase" : "Pay-to-View Unlock"}
                    </Badge>
                  </td>
                  <td className="p-4 font-medium text-text-primary">
                    {tx.artwork?.title || tx.gallery?.title || "Exhibition Unlock"}
                  </td>
                  <td className="p-4 font-bold text-text-primary">
                    {formatValue(tx.amount)}
                  </td>
                  <td className="p-4 text-right">
                    <Badge variant={tx.status === "COMPLETED" ? "success" : "neutral"}>
                      {tx.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 text-text-muted">
          No settled transactions found.
        </div>
      )}
    </Card>
  )
}
