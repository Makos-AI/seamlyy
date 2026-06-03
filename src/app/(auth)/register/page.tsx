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

    const result = await registerUser({ name, email, password, role })

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push("/login")
    }
  }

  return (
    <Card className="p-8" hoverable={false}>
      <h2 className="text-2xl font-semibold mb-6 text-center">Create an account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 p-1 bg-bg-secondary rounded-lg mb-4">
          <button
            type="button"
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${role === "VIEWER" ? "bg-bg-card shadow-sm text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
            onClick={() => setRole("VIEWER")}
          >
            I'm a Collector
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${role === "ARTIST" ? "bg-bg-card shadow-sm text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
            onClick={() => setRole("ARTIST")}
          >
            I'm an Artist
          </button>
        </div>

        <Input
          label="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="Email address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
        {error && <p className="text-sm text-error">{error}</p>}
        <Button type="submit" className="w-full" loading={loading}>
          Create account
        </Button>
      </form>
      <div className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:text-accent-hover transition-colors">
          Sign in
        </Link>
      </div>
    </Card>
  )
}
