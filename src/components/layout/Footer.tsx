import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-primary mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="text-2xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover">
              Seamlyy
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
            <span className="flex items-center gap-1">Powered by <a href="https://openpayments.dev" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Open Payments</a></span>
          </div>
        </div>
      </div>
    </footer>
  )
}
