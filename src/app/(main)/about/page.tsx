import { Button, Badge } from "@/components/ui"
import Link from "next/link"
import { ImageWithFallback } from "@/components/ImageWithFallback"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen pb-24">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-bg-primary/20 via-bg-primary/80 to-bg-primary z-10" />
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop" 
            alt="Cinematic 3D Art Background" 
            fill
            sizes="100vw"
            className="object-cover blur-sm opacity-50"
          />
        </div>
        
        <div className="container mx-auto px-4 relative z-20 text-center max-w-4xl animate-slide-up">
          <Badge variant="info" className="mb-6 border-accent/30 text-accent bg-accent/10">The $57.5B Global Art Market</Badge>
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-text-primary leading-tight mb-6">
            African Art is <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover">Cutting-Edge.</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-10">
            Yet, it represents less than 1% of global art revenue. We are changing the math. No legacy banks. No 40% gallery cuts. Just direct support from the world to your studio.
          </p>
          <Link href="/register">
            <Button size="lg" className="px-12 h-14 text-lg">Join the Movement</Button>
          </Link>
        </div>
      </section>

      {/* The "Why" Grid */}
      <section className="container mx-auto px-4 py-20 relative z-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-text-primary mb-4">The Gatekeepers are Gone</h2>
          <p className="text-lg text-text-secondary">A unified protocol built for the modern creator economy.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Feature 1 */}
          <div className="bg-bg-secondary border border-border rounded-3xl p-8 hover:border-accent/50 transition-colors group">
            <div className="w-14 h-14 bg-bg-tertiary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <h3 className="text-xl font-heading font-bold text-text-primary mb-3">Artist-Owned</h3>
            <p className="text-text-secondary">Your personal secure vault. You own the relationship with your collectors, and you own your wallet pointer.</p>
          </div>

          {/* Feature 2 */}
          <div className="bg-bg-secondary border border-border rounded-3xl p-8 hover:border-accent/50 transition-colors group relative">
            <div className="w-14 h-14 bg-bg-tertiary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <h3 className="text-xl font-heading font-bold text-text-primary mb-3 flex items-center gap-2">
              Flat 5% Fee
              <div className="group/tooltip relative inline-block cursor-help">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-text-muted hover:text-text-primary"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-4 bg-bg-card border border-border rounded-xl shadow-2xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 text-sm font-normal">
                  <p className="text-text-primary mb-2 font-semibold flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    How it Works
                  </p>
                  <p className="text-text-secondary leading-relaxed">
                    By utilizing the Open Payments standard, Seamlyy completely bypasses traditional banking intermediaries and high credit card processing fees. We pass the 35% savings directly back to the creator.
                  </p>
                </div>
              </div>
            </h3>
            <p className="text-text-secondary">Legacy platforms take 40%. We take 5%. Powered securely by the Open Payments infrastructure.</p>
          </div>

          {/* Feature 3 */}
          <div className="bg-bg-secondary border border-border rounded-3xl p-8 hover:border-accent/50 transition-colors group">
            <div className="w-14 h-14 bg-bg-tertiary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent animate-pulse"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </div>
            <h3 className="text-xl font-heading font-bold text-text-primary mb-3">Earn from Views</h3>
            <p className="text-text-secondary">Monetize attention. Receive seamless micro-transactions pulsing straight into your wallet the moment a collector views your art.</p>
          </div>

          {/* Feature 4 */}
          <div className="bg-bg-secondary border border-border rounded-3xl p-8 hover:border-accent/50 transition-colors group">
            <div className="w-14 h-14 bg-bg-tertiary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </div>
            <h3 className="text-xl font-heading font-bold text-text-primary mb-3">Global Default</h3>
            <p className="text-text-secondary">Borderless by design. Instantly connect nodes from collectors anywhere in the world straight to your central wallet.</p>
          </div>
        </div>
      </section>
    </div>
  )
}
