"use client"
import { SessionProvider } from "@/lib/auth-client"
import { ToastProvider } from "./ui"
import { ThemeProvider } from "next-themes"

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
