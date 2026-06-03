import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-primary mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <img src="/logo.png" alt="Seamlyy Logo" className="h-8 w-auto" />
            </Link>
            <p className="mt-4 text-sm text-text-secondary">
              The open marketplace for digital and physical art, powered by Open Payments.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Explore</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/explore" className="hover:text-accent transition-colors">Digital Art</Link></li>
              <li><Link href="/explore" className="hover:text-accent transition-colors">Photography</Link></li>
              <li><Link href="/explore" className="hover:text-accent transition-colors">Oil Paintings</Link></li>
              <li><Link href="/explore" className="hover:text-accent transition-colors">Sculptures</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link href="/how-it-works" className="hover:text-accent transition-colors">How It Works</Link></li>
              <li><Link href="/register" className="hover:text-accent transition-colors">Sell Your Art</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-muted">
          <p>&copy; {new Date().getFullYear()} Seamlyy. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-bg-secondary border border-border rounded-lg shadow-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              <span className="text-xs font-medium">Powered securely by <a href="https://openpayments.dev" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Open Payments</a></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
