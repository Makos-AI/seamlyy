"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, Input, Button } from "@/components/ui"
import { loginUser } from "@/actions/auth"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await loginUser({ email, password })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <Card className="w-full max-w-md border border-border rounded-2xl p-8 shadow-2xl relative z-10 animate-slide-up" hoverable={false}>
        <div className="flex justify-center mb-6">
          <Link href="/">
            <img src="/logo.png" alt="Seamlyy Logo" className="h-10 w-auto" />
          </Link>
        </div>
        <h1 className="text-2xl font-heading font-bold text-text-primary text-center mb-2">Welcome back</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Sign In
        </Button>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          256-bit Encrypted Connection
        </div>
      </form>
      <div className="mt-6 text-center text-sm text-text-secondary">
        Don't have an account?{" "}
        <Link href="/register" className="text-accent hover:text-accent-hover transition-colors">
          Register here
        </Link>
      </div>
    </Card>
  )
}
