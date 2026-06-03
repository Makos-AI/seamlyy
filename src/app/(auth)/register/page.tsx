"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, Input, Button } from "@/components/ui"
import { registerUser } from "@/actions/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState<"ARTIST" | "VIEWER">("VIEWER")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await registerUser({ name, email, password, role: role as any })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/login")
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-center mb-8">
        <Link href="/">
          <img src="/logo.png" alt="Seamlyy" className="h-8 w-auto" />
        </Link>
      </div>
      
      <div className="bg-bg-secondary border border-border rounded-2xl p-8 shadow-2xl shadow-black/20 animate-slide-up">
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">Join Seamlyy</h1>
        <p className="text-sm text-text-muted text-center mb-8">Start your creative journey</p>
        
        {/* Role Toggle */}
        <div className="flex gap-2 mb-8 p-1 bg-bg-primary rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setRole('VIEWER')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
              role === 'VIEWER' ? 'bg-blue text-white shadow-sm' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Collector
          </button>
          <button
            type="button"
            onClick={() => setRole('ARTIST')}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
              role === 'ARTIST' ? 'bg-gold text-white shadow-sm' : 'text-text-muted hover:text-text-secondary'
            }`}
          >
            Artist
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Full name"
            placeholder="Sign your masterpiece"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email address"
            type="email"
            placeholder="Where opportunities find you"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="Your studio password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
          {error && <p className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Create Account
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-text-muted">
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            256-bit Encrypted
          </div>
          <div className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            ILP Secure
          </div>
        </div>
      </div>
      
      <p className="mt-6 text-center text-sm text-text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-gold hover:text-gold/80 font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
