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

  React.useEffect(() => {
    async function load() {
      const result = await getProfile()
      if (result.success && result.user) {
        setName(result.user.name || "")
        setWalletPointer(result.user.walletPointer || "")
        setBio(result.user.bio || "")
        setPreferredCurrency(result.user.preferredCurrency || "USD")
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
      
      <div className="bg-bg-secondary border border-border rounded-2xl p-8">
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
    </div>
  )
}
