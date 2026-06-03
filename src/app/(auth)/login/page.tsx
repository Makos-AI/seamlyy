"use client"

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, Input, Button } from "@/components/ui"
import { loginUser } from "@/actions/auth"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await loginUser({ email, password }, callbackUrl)

      if (result?.error) {
        setError(result.error)
        setLoading(false)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      // Succeeded and redirect error bubbled up, or other error occurred
      setLoading(false)
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
        <h1 className="text-2xl font-bold text-text-primary text-center mb-2">Welcome back</h1>
        <p className="text-sm text-text-muted text-center mb-8">Sign in to your studio</p>
        
        <form onSubmit={handleSubmit} className="space-y-5">
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
          />
          {error && <p className="text-sm text-error bg-error/10 border border-error/20 rounded-lg px-3 py-2">{error}</p>}
          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Sign In
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          256-bit Encrypted
        </div>
      </div>
      
      <p className="mt-6 text-center text-sm text-text-muted">
        Don't have an account?{" "}
        <Link href="/register" className="text-gold hover:text-gold/80 font-medium transition-colors">
          Create one
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md mx-auto text-center py-20">
        <p className="text-text-secondary">Loading...</p>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
