"use client"

import * as React from "react"

const SessionContext = React.createContext<{
  session: any
  status: "loading" | "authenticated" | "unauthenticated"
  refresh: () => void
} | null>(null)

function getCookie(name: string) {
  if (typeof window === "undefined") return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null
  return null
}

function eraseCookie(name: string) {
  if (typeof window === "undefined") return
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<any>(null)
  const [status, setStatus] = React.useState<"loading" | "authenticated" | "unauthenticated">("loading")

  const refresh = React.useCallback(() => {
    const cookie = getCookie("seamlyy_session")
    if (cookie) {
      try {
        const parsed = JSON.parse(decodeURIComponent(cookie))
        setSession({ user: parsed })
        setStatus("authenticated")
      } catch {
        setSession(null)
        setStatus("unauthenticated")
      }
    } else {
      setSession(null)
      setStatus("unauthenticated")
    }
  }, [])

  React.useEffect(() => {
    refresh()

    // Add visibility and focus listeners to refresh session
    window.addEventListener("focus", refresh)
    window.addEventListener("visibilitychange", refresh)
    return () => {
      window.removeEventListener("focus", refresh)
      window.removeEventListener("visibilitychange", refresh)
    }
  }, [refresh])

  return (
    <SessionContext.Provider value={{ session, status, refresh }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const context = React.useContext(SessionContext)
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return {
    data: context.session,
    status: context.status,
    update: context.refresh
  }
}

export async function signOut() {
  eraseCookie("seamlyy_session")
  window.location.href = "/"
}
