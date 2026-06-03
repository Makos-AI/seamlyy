"use client"
import * as React from "react"
import { usePathname } from "next/navigation"

export function SplashScreen() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [showSplash, setShowSplash] = React.useState(isHome)

  React.useEffect(() => {
    if (!isHome) return
    
    // Only show once per session
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash")
    if (hasSeenSplash) {
      setShowSplash(false)
      return
    }

    const timer = setTimeout(() => {
      setShowSplash(false)
      sessionStorage.setItem("hasSeenSplash", "true")
    }, 1500)

    return () => clearTimeout(timer)
  }, [isHome])

  if (!showSplash) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg-primary transition-opacity duration-500" style={{ animation: "fadeOut 0.5s ease-in-out 1s forwards" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeOut {
          to { opacity: 0; visibility: hidden; }
        }
        @keyframes pulseLogo {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}} />
      <img 
        src="/logo.png" 
        alt="Seamlyy Logo" 
        className="w-48 h-auto"
        style={{ animation: "pulseLogo 1.5s ease-in-out infinite" }}
      />
    </div>
  )
}
