"use client"
import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui"
import { useSession, signOut } from "@/lib/auth-client"
import { useTheme } from "next-themes"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [mobileOpen, setMobileOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search)}`)
    }
  }

  const navLinks = [
    { href: '/explore', label: 'Discover' },
    { href: '/search', label: 'Galleries' },
    { href: '/how-it-works', label: 'How it Works' },
    { href: '/about', label: 'About' },
  ]

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-bg-primary/90 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-6">
        
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <img src="/logo.png" alt="Seamlyy" className="h-7 w-auto" />
        </Link>

        {/* Center Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                pathname === link.href 
                  ? 'text-text-primary bg-bg-secondary' 
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary/50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {/* Search */}
          <form onSubmit={handleSearch} className="relative hidden lg:block">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input
              type="text"
              placeholder="Search artworks, artists..."
              className="w-56 h-9 bg-bg-secondary border border-border rounded-lg pl-9 pr-3 text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/25 transition-all text-text-primary placeholder:text-text-muted"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>

          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-2 rounded-lg hover:bg-bg-secondary text-text-muted hover:text-text-primary transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </button>
          )}

          {status === 'loading' ? (
            <div className="flex items-center gap-3">
              <div className="w-16 h-8 rounded bg-bg-secondary animate-pulse hidden sm:block" />
              <div className="w-24 h-8 rounded bg-bg-secondary animate-pulse" />
            </div>
          ) : session ? (
            <>
              <Link
                href="/dashboard"
                className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center"
                title="Go to Dashboard"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
              <div className="relative group cursor-pointer">
                <div className="h-9 w-9 rounded-full bg-bg-tertiary border-2 border-gold/30 flex items-center justify-center font-semibold text-sm text-gold overflow-hidden">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    session.user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="absolute right-0 top-full mt-2 w-52 bg-bg-card border border-border rounded-xl shadow-2xl shadow-black/40 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-sm font-semibold text-text-primary truncate">{session.user?.name}</p>
                    <p className="text-xs text-text-muted truncate mt-0.5">{session.user?.email}</p>
                  </div>
                  <Link href="/dashboard/settings" className="block px-4 py-2.5 text-sm text-text-secondary hover:text-text-primary hover:bg-bg-secondary transition-colors">
                    Settings
                  </Link>
                  <button onClick={() => signOut()} className="w-full text-left block px-4 py-2.5 text-sm text-error hover:bg-bg-secondary transition-colors">
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-text-secondary hover:text-text-primary hidden sm:block transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-colors border border-gold/50 text-gold hover:bg-gold/10"
              >
                Get Started
              </Link>
              <Link
                href="/dashboard"
                className="p-2 rounded-lg hover:bg-bg-secondary text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center"
                title="Go to Dashboard"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button 
            onClick={() => setMobileOpen(!mobileOpen)} 
            className="md:hidden p-2 rounded-lg hover:bg-bg-secondary text-text-secondary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-bg-primary px-4 py-4 space-y-1 animate-fade-in">
          {navLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href} 
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg-secondary rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <form onSubmit={handleSearch} className="pt-2">
            <input
              type="text"
              placeholder="Search artworks, artists..."
              className="w-full h-10 bg-bg-secondary border border-border rounded-lg px-4 text-sm focus:outline-none focus:border-gold/50 transition-all text-text-primary placeholder:text-text-muted"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>
      )}
    </nav>
  )
}
