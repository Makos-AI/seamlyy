//Used to set up profile

"use client"

import * as React from "react"
import { useSession } from "@/lib/auth-client"
import { Input, Button, useToast } from "@/components/ui"
import { updateProfile, getProfile } from "@/actions/user"
import { useRouter } from "next/navigation"

export default function SettingsPage() {
  const { data: session } = useSession()
  const { addToast } = useToast()
  const router = useRouter()
  
  const [name, setName] = React.useState("")
  const [walletPointer, setWalletPointer] = React.useState("")
  const [bio, setBio] = React.useState("")
  const [preferredCurrency, setPreferredCurrency] = React.useState("USD")
  const [loading, setLoading] = React.useState(false)
  
  // Protection states
  const [protectionActivated, setProtectionActivated] = React.useState(false)
  const [signatureLocked, setSignatureLocked] = React.useState(false)
  const [signatureFile, setSignatureFile] = React.useState<File | null>(null)
  const [lockingSignature, setLockingSignature] = React.useState(false)

  React.useEffect(() => {
    async function load() {
      const result = await getProfile()
      if (result.success && result.user) {
        setName(result.user.name || "")
        setWalletPointer(result.user.walletPointer || "")
        setBio(result.user.bio || "")
        setPreferredCurrency(result.user.preferredCurrency || "USD")
        setProtectionActivated(result.user.protectionActivated || false)
        setSignatureLocked(result.user.signatureLocked || false)
      }
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    const result = await updateProfile({ name, walletPointer, bio, preferredCurrency })
    
    setLoading(false)
    if (result.success) {
      addToast({
        type: 'success',
        message: 'Profile updated successfully'
      })
      router.push('/dashboard')
      router.refresh()
    } else {
      addToast({
        type: 'error',
        message: result.error || 'Failed to update'
      })
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-text-primary mb-2">Profile Settings</h1>
      <p className="text-text-secondary mb-8">Manage your account and payment configuration.</p>
      
      <div className="bg-bg-secondary border border-border rounded-2xl p-8 mb-8">
        <form onSubmit={handleSave} className="space-y-6">
          <Input 
            label="Display Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Bio</label>
            <textarea 
              className="w-full bg-bg-primary border border-border rounded-lg p-3 text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/25 transition-all text-text-primary placeholder:text-text-muted resize-none"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Preferred Currency</label>
            <select 
              className="w-full h-10 bg-bg-primary border border-border rounded-lg px-3 text-sm focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/25 transition-all text-text-primary"
              value={preferredCurrency}
              onChange={(e) => setPreferredCurrency(e.target.value)}
            >
              <option value="USD">USD ($)</option>
              <option value="NGN">NGN (₦)</option>
            </select>
          </div>
          
          <div className="pt-6 border-t border-border">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Payment Configuration</h3>
            <p className="text-sm text-text-secondary mb-4">
              Set your Open Payments wallet pointer to receive funds.
              <br />
              <a href="https://rafiki.money/" target="_blank" rel="noopener noreferrer" className="text-gold hover:text-gold/80 transition-colors font-medium">
                Get a free testnet wallet from Rafiki →
              </a>
            </p>
            <Input 
              label="Wallet Pointer" 
              placeholder="$wallet.example.com/alice"
              value={walletPointer} 
              onChange={(e) => setWalletPointer(e.target.value)} 
            />
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" loading={loading}>Save Changes</Button>
          </div>
        </form>
      </div>

      <div className="bg-bg-secondary border border-border rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Artwork Protection</h2>
        <p className="text-text-secondary mb-6">
          Activate our Digital Copyright Engine. By registering a master signature, we scan all your future uploads and ensure they match, while embedding an invisible watermark to track your ownership.
        </p>

        {signatureLocked ? (
          <div className="bg-bg-tertiary border border-green-500/30 rounded-xl p-6 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-green-500 flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                Protection Active & Locked
              </h3>
              <p className="text-sm text-text-secondary mt-1">Your master signature is permanently locked to your account. All uploads are now actively scanned.</p>
            </div>
          </div>
        ) : (
          <form 
            onSubmit={async (e) => {
              e.preventDefault()
              if (!signatureFile) return addToast({ type: 'error', message: 'Please select a signature image' })
              setLockingSignature(true)
              
              const formData = new FormData()
              formData.append("signatureFile", signatureFile)
              
              // We'll import this dynamically to avoid top-level issues if needed, or import at top
              const { activateArtworkProtection } = await import("@/actions/protection")
              const res = await activateArtworkProtection(formData)
              
              setLockingSignature(false)
              if (res.success) {
                addToast({ type: 'success', message: 'Master signature locked! Protection activated.' })
                setSignatureLocked(true)
                setProtectionActivated(true)
              } else {
                addToast({ type: 'error', message: res.error || 'Failed to lock signature' })
              }
            }} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Upload Master Signature (Clear background preferred)</label>
              <input 
                type="file" 
                accept="image/*"
                required
                onChange={(e) => setSignatureFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gold file:text-bg-primary hover:file:bg-gold/80 cursor-pointer"
              />
            </div>
            
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm text-red-400 font-medium">⚠️ Important: This action is permanent.</p>
              <p className="text-xs text-text-secondary mt-1">Once you lock this signature, it cannot be changed without contacting support. All future artworks must contain a matching signature to pass automated inspection.</p>
            </div>

            <Button type="submit" loading={lockingSignature} className="w-full">
              Lock Master Signature & Activate Protection
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
