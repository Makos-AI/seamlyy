import * as React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Authentication - Seamlyy",
  description: "Login or register to Seamlyy",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-heading font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-hover">
            Seamlyy
          </h1>
          <p className="text-text-secondary mt-2 text-sm">
            The open marketplace for digital and physical art
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}
