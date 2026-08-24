"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, Input, Button } from "@/components/ui"
import { registerUser, signInWithGoogle } from "@/actions/auth"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [role, setRole] = React.useState<"ARTIST" | "VIEWER">("VIEWER")
  const [loading, setLoading] = React.useState(false)
  const [googleLoading, setGoogleLoading] = React.useState(false)
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

  const handleGoogleSignIn = async () => {
    setError("")
    setGoogleLoading(true)
    try {
      await signInWithGoogle("/dashboard")
    } catch (err: any) {
      if (err.message === "NEXT_REDIRECT" || err.digest?.startsWith("NEXT_REDIRECT")) {
        return
      }
      setError("Failed to sign in with Google.")
      setGoogleLoading(false)
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

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-bg-secondary px-2 text-text-muted">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full flex items-center justify-center gap-3"
          onClick={handleGoogleSignIn}
          loading={googleLoading}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google
        </Button>

        <div className="mt-6 flex items-center justify-center gap-4 text-xs text-text-muted">
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
