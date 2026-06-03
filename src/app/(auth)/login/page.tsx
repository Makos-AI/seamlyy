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
    <Card className="p-8" hoverable={false}>
      <h2 className="text-2xl font-semibold mb-6 text-center">Welcome back</h2>
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
        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>
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
