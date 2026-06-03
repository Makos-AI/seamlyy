import * as React from "react"
import Link from "next/link"

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary">
      {/* Minimalist Top Bar, just a back button / subtle branding */}
      <header className="fixed top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-bg-primary/80 to-transparent pointer-events-none">
        <Link href="/" className="pointer-events-auto mix-blend-difference hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Seamlyy Logo" className="h-6 w-auto" />
        </Link>
      </header>

      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  )
}
