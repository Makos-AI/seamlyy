import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'premium' | 'gold'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'neutral', ...props }, ref) => {
    const variants = {
      success: "bg-success/15 text-success border-success/20",
      warning: "bg-warning/15 text-warning border-warning/20",
      error: "bg-error/15 text-error border-error/20",
      info: "bg-blue/15 text-blue border-blue/20",
      neutral: "bg-bg-tertiary text-text-secondary border-border",
      premium: "bg-gold/15 text-gold border-gold/20",
      gold: "bg-gold/10 text-gold border-gold/30"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge }
