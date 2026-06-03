import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-primary mt-auto">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <img src="/logo.png" alt="Seamlyy" className="h-7 w-auto" />
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed">
              Seamlyy connects artists and art lovers around the world through open payments, making art accessible and rewarding for all.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">Explore</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><Link href="/explore" className="hover:text-gold transition-colors">Discover Art</Link></li>
              <li><Link href="/search" className="hover:text-gold transition-colors">Browse Galleries</Link></li>
              <li><Link href="/search?category=Photography" className="hover:text-gold transition-colors">Photography</Link></li>
              <li><Link href="/search?category=Digital%20Art" className="hover:text-gold transition-colors">Digital Art</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">Platform</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><Link href="/about" className="hover:text-gold transition-colors">About Us</Link></li>
              <li><Link href="/how-it-works" className="hover:text-gold transition-colors">How It Works</Link></li>
              <li><Link href="/sell-art" className="hover:text-gold transition-colors">Become an Artist</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm uppercase tracking-wider mb-4">Connect</h3>
            <ul className="space-y-3 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-gold transition-colors">Twitter / X</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-gold transition-colors">Discord</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
          <p>&copy; {new Date().getFullYear()} Seamlyy. All rights reserved.</p>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-secondary border border-border rounded-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            <span className="text-xs font-medium">Powered by <a href="https://openpayments.dev" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Open Payments</a></span>
          </div>
        </div>
      </div>
    </footer>
  )
}
