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
    }, 2000)

    return () => clearTimeout(timer)
  }, [isHome])

  if (!showSplash) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1020] transition-opacity duration-500" style={{ animation: "fadeOut 0.6s cubic-bezier(0.4, 0, 0.2, 1) 1.4s forwards" }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeOut {
          0% { pointer-events: auto; }
          1% { pointer-events: none; }
          100% { opacity: 0; visibility: hidden; pointer-events: none; }
        }
        @keyframes fadeInLogo {
          from { opacity: 0; transform: scale(0.92); filter: blur(4px); }
          to { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes pulseLogo {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.03); opacity: 0.9; }
        }
      `}} />
      <img 
        src="/logo.png" 
        alt="Seamlyy Logo" 
        className="w-96 h-auto"
        style={{ 
          animation: "fadeInLogo 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards, pulseLogo 2.5s ease-in-out infinite 0.8s" 
        }}
      />
    </div>
  )
}
