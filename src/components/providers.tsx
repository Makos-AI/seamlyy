"use client"
import { SessionProvider } from "@/lib/auth-client"
import { ToastProvider } from "./ui"
import { ThemeProvider } from "next-themes"

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const orig = console.error
  console.error = (...args: any[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) return
    orig.apply(console, args)
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <SessionProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </SessionProvider>
    </ThemeProvider>
  )
}
