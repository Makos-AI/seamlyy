import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hoverable = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-border bg-bg-card text-text-primary shadow-sm transition-all",
          hoverable && "hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 hover:border-border-hover cursor-pointer",
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

export { Card }
