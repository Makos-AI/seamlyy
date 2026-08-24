"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button, Input } from "@/components/ui"
import { useSession } from "@/lib/auth-client"

export default function OnboardingPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [role, setRole] = React.useState<"ARTIST" | "VIEWER">("ARTIST")
  const [name, setName] = React.useState(session?.user?.name || "")
  const [bio, setBio] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [showSealDialog, setShowSealDialog] = React.useState(false)

  React.useEffect(() => {
    if (session?.user?.name) setName(session.user.name)
  }, [session])

  const handleSave = async () => {
    setLoading(true)
    try {
      const { completeOnboarding } = await import("@/actions/auth")
      const res = await completeOnboarding({ role, name, bio })
      if (res?.error) {
        alert(res.error)
        setLoading(false)
        return
      }
      setShowSealDialog(true)
    } catch (err) {
      alert("Failed to save profile.")
    } finally {
      setLoading(false)
    }
  }

  if (showSealDialog) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-bg-secondary border border-border rounded-2xl p-8 max-w-lg w-full shadow-2xl shadow-black/20 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gold/10 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-3">Set Up Your Seal</h2>
          <p className="text-text-secondary mb-2">
            Before you can upload artwork, you need to set up your signature seal. This locks your creative identity and powers our Digital Copyright Engine.
          </p>
          <p className="text-sm text-gold font-medium mb-8">
            You cannot post artwork without a signature seal.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push('/dashboard/settings')} className="w-full" size="lg">
              Set Up My Seal
            </Button>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-sm text-text-muted hover:text-text-secondary transition-colors"
            >
              Remind me later
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Seamlyy" className="h-8 w-auto" />
        </div>

        <div className="bg-bg-secondary border border-border rounded-2xl p-8 shadow-2xl shadow-black/20">
          <h1 className="text-2xl font-bold text-text-primary text-center mb-2">Welcome to Seamlyy</h1>
          <p className="text-sm text-text-muted text-center mb-8">Let's set up your creative profile</p>

          {session?.user?.image && (
            <div className="flex justify-center mb-6">
              <img
                src={session.user.image}
                alt="Profile"
                className="w-20 h-20 rounded-full border-2 border-gold/30"
              />
            </div>
          )}

          {/* Role Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">I am a...</label>
            <div className="flex gap-2 p-1 bg-bg-primary rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setRole('ARTIST')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                  role === 'ARTIST' ? 'bg-gold text-white shadow-sm' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Artist
              </button>
              <button
                type="button"
                onClick={() => setRole('VIEWER')}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${
                  role === 'VIEWER' ? 'bg-blue text-white shadow-sm' : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                Collector
              </button>
            </div>
          </div>

          <div className="space-y-5">
            <Input
              label="Display Name"
              placeholder="How should we call you?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">Bio</label>
              <textarea
                placeholder="Tell us about yourself and your art..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-bg-primary border border-border rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all resize-none"
              />
            </div>
          </div>

          <div className="mt-8">
            <Button onClick={handleSave} className="w-full" size="lg" loading={loading}>
              Save & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
