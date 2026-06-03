import { Card } from "@/components/ui"

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-24 max-w-4xl">
      <h1 className="text-4xl font-heading font-bold text-text-primary mb-4 text-center">How Seamlyy Works</h1>
      <p className="text-xl text-text-secondary text-center mb-16">The future of seamless art collection powered by Open Payments.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-9xl font-bold font-heading">1</span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-4 relative z-10">Connect</h3>
          <p className="text-text-secondary relative z-10">
            Sign up and configure your Web Monetization Wallet Pointer. Artists use this to receive funds instantly, and collectors use it to make seamless purchases.
          </p>
        </Card>
        
        <Card className="p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-9xl font-bold font-heading">2</span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-4 relative z-10">Discover</h3>
          <p className="text-text-secondary relative z-10">
            Browse through unique single artworks or curated premium exhibitions. When you find a piece you love, interaction is frictionless.
          </p>
        </Card>
        
        <Card className="p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span className="text-9xl font-bold font-heading">3</span>
          </div>
          <h3 className="text-2xl font-bold text-text-primary mb-4 relative z-10">Unlock</h3>
          <p className="text-text-secondary relative z-10">
            Authorize a micro-transaction directly from your wallet. Interledger handles the currency conversion and settlement instantly.
          </p>
        </Card>
      </div>
    </div>
  )
}
