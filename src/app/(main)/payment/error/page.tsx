import Link from "next/link"
import { Button, Card } from "@/components/ui"

export default function PaymentErrorPage() {
  return (
    <div className="container mx-auto px-4 py-24 flex items-center justify-center">
      <Card className="p-12 text-center max-w-md border-error/30 bg-error/5">
        <div className="w-20 h-20 bg-error/20 text-error rounded-full flex items-center justify-center mx-auto mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-4">Payment Failed</h1>
        <p className="text-text-secondary mb-8">
          The Open Payments transaction could not be completed. This may be due to an invalid payment pointer, expired session, or declined authorization.
        </p>
        <Link href="/explore">
          <Button size="lg" className="w-full">
            Back to Explore
          </Button>
        </Link>
      </Card>
    </div>
  )
}
