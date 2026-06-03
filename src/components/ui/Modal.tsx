"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div 
        className={cn(
          "relative w-full rounded-2xl bg-bg-card border border-border shadow-2xl animate-slide-up p-6 overflow-hidden",
          sizes[size]
        )}
      >
        <div className="absolute top-4 right-4">
          <button 
            onClick={onClose}
            className="rounded-full p-1 text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        {title && (
          <h2 className="text-xl font-heading font-semibold text-text-primary mb-4">{title}</h2>
        )}
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  )
}
