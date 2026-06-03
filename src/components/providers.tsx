"use client"
import { SessionProvider } from "next-auth/react"
import { ToastProvider } from "./ui"
import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
