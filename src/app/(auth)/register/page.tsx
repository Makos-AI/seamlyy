"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, Input, Button } from "@/components/ui"
import { registerUser } from "@/actions/auth"

import { signIn } from "next-auth/react"

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
      await signIn("credentials", { email, password, callbackUrl: "/dashboard" })
    }
  }

  return (
    <Card className="p-8" hoverable={false}>
      <h2 className="text-2xl font-semibold mb-6 text-center text-text-canvas">Create an account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-4 p-1 bg-bg-secondary rounded-lg mb-4">
          <button
            type="button"
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${role === "VIEWER" ? "bg-bg-primary shadow-sm text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
            onClick={() => setRole("VIEWER")}
          >
            I'm a Collector
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm rounded-md transition-colors ${role === "ARTIST" ? "bg-bg-primary shadow-sm text-text-primary" : "text-text-secondary hover:text-text-primary"}`}
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

      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-border"></div>
        <span className="px-4 text-sm text-text-canvas-muted">or</span>
        <div className="flex-1 border-t border-border"></div>
      </div>

      <Button 
        type="button" 
        variant="secondary" 
        className="w-full text-text-canvas border-[#1A110D] hover:bg-[#1A110D]/5" 
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
        Sign up with Google
      </Button>

      <div className="mt-6 text-center text-sm text-text-canvas-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:text-accent-hover transition-colors font-medium">
          Sign in
        </Link>
      </div>
    </Card>
  )
}
