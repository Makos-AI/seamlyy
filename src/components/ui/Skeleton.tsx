import * as React from "react"
import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circle' | 'card'
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = 'text', ...props }, ref) => {
    const variants = {
      text: "h-4 w-full rounded",
      circle: "h-12 w-12 rounded-full",
      card: "h-48 w-full rounded-xl"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "animate-shimmer bg-bg-secondary bg-gradient-to-r from-bg-secondary via-bg-tertiary to-bg-secondary",
          variants[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

export { Skeleton }
