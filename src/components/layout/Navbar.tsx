"use client"
import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui"
import { useSession, signOut } from "next-auth/react"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [search, setSearch] = React.useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search)}`)
    }
  }

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-bg-primary/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Seamlyy Logo" className="h-8 w-auto" />
          </Link>
        </div>

        {/* Center: Nav Links & Search */}
        <div className="flex-1 flex items-center justify-center gap-8">
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
              Home
            </Link>
            <Link href="/explore" className={`text-sm font-medium transition-colors ${pathname === '/explore' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}>
              Explore
            </Link>
          </div>
          
          <div className="w-full max-w-md hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                placeholder="Search artists, artworks..."
                className="w-full h-10 bg-bg-secondary border border-border rounded-full pl-10 pr-4 text-sm focus:outline-none focus:border-accent transition-colors text-text-primary placeholder:text-text-muted"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </form>
          </div>
        </div>

        {/* Right: Auth / User Profile */}
        <div className="flex items-center justify-end gap-4 min-w-[150px]">
          {session ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium text-text-secondary hover:text-text-primary hidden sm:block">
                Dashboard
              </Link>
              <div className="relative group cursor-pointer">
                <div className="h-9 w-9 rounded-full bg-bg-tertiary border border-border flex items-center justify-center font-medium text-sm text-text-primary overflow-hidden">
                  {session.user?.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    session.user?.name?.charAt(0).toUpperCase() || 'U'
                  )}
                </div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-bg-card border border-border rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium text-text-canvas truncate">{session.user?.name}</p>
                    <p className="text-xs text-text-canvas-muted truncate">{session.user?.email}</p>
                  </div>
                  <Link href="/dashboard/settings" className="block px-4 py-2 text-sm text-text-canvas-muted hover:text-text-canvas hover:bg-bg-tertiary">
                    Settings
                  </Link>
                  <button onClick={() => signOut()} className="w-full text-left block px-4 py-2 text-sm text-error hover:bg-bg-tertiary">
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary hidden sm:block">
                Sign in
              </Link>
              <Link href="/register">
                <Button size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
