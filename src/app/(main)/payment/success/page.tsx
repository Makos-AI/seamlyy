import Link from "next/link"
import { Button, Card } from "@/components/ui"

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-24 flex items-center justify-center">
      <Card className="p-12 text-center max-w-md border-success/30 bg-success/5">
        <div className="w-20 h-20 bg-success/20 text-success rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-4">Payment Successful!</h1>
        <p className="text-text-secondary mb-8">
          Your transaction has been confirmed on the Interledger network. 
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="w-full">
            Return to Dashboard
          </Button>
        </Link>
      </Card>
    </div>
  )
}
