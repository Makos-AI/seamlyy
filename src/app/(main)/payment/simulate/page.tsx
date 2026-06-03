"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, Button, Badge } from "@/components/ui"
import { completePayment } from "@/actions/payment-complete"

export default function SimulatePaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const txId = searchParams.get('txId')
  const [loading, setLoading] = React.useState(false)

  const handleSimulateGNAP = async () => {
    if (!txId) return
    setLoading(true)
    
    // Server action to mark transaction complete and grant access
    const res = await completePayment(txId)
    
    if (res.success) {
      router.push(`/payment/success?txId=${txId}`)
    } else {
      alert("Payment failed")
      setLoading(false)
    }
  }

  if (!txId) return <div>Invalid Transaction</div>

  return (
    <div className="container mx-auto px-4 py-24 flex items-center justify-center">
      <Card className="p-12 text-center max-w-md">
        <Badge variant="warning" className="mb-6">Sandbox Mode</Badge>
        <h1 className="text-2xl font-bold mb-4">GNAP Authorization</h1>
        <p className="text-text-secondary mb-8">
          In a real environment, you would be redirected to your wallet provider (e.g., Rafiki) to approve this Open Payments transaction.
        </p>
        <Button size="lg" className="w-full" onClick={handleSimulateGNAP} loading={loading}>
          Simulate Approval
        </Button>
      </Card>
    </div>
  )
}
