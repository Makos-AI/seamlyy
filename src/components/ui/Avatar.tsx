import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, fallback = '?', size = 'md', ...props }, ref) => {
    const sizes = {
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-14 w-14 text-base",
      xl: "h-20 w-20 text-lg"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full ring-1 ring-border bg-bg-tertiary",
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || "Avatar"}
            className="aspect-square h-full w-full object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center font-medium text-text-secondary uppercase">
            {fallback.substring(0, 2)}
          </span>
        )}
      </div>
    )
  }
)
Avatar.displayName = "Avatar"

export { Avatar }
