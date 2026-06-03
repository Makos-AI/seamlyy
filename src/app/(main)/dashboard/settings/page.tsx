"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { Card, Input, Button, ToastProvider, useToast } from "@/components/ui"

export default function SettingsPage() {
  const { data: session } = useSession()
  const { addToast } = useToast()
  
  const [name, setName] = React.useState(session?.user?.name || "")
  const [walletPointer, setWalletPointer] = React.useState("")
  const [bio, setBio] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // In a real app, this would call a server action
    // await updateProfile({ name, walletPointer, bio })
    
    setTimeout(() => {
      setLoading(false)
      addToast({
        type: 'success',
        message: 'Profile updated successfully'
      })
    }, 1000)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold text-text-primary mb-8">Profile Settings</h1>
      
      <Card className="p-8" hoverable={false}>
        <form onSubmit={handleSave} className="space-y-6">
          <Input 
            label="Display Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Bio</label>
            <textarea 
              className="w-full bg-bg-secondary border border-border rounded-xl p-3 text-sm focus:outline-none focus:border-accent transition-colors text-text-primary"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
            />
          </div>

          <div className="pt-4 border-t border-border">
            <h3 className="text-lg font-medium text-text-primary mb-2">Payment Configuration</h3>
            <p className="text-sm text-text-secondary mb-4">
              Set your Open Payments wallet pointer to receive funds.
              <br />
              <a href="https://rafiki.money/" target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover transition-colors font-medium">
                Get a free testnet wallet pointer from Rafiki
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
      </Card>
    </div>
  )
}
