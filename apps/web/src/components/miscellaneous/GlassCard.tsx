import type * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  highlight?: boolean
}

export function GlassCard({ children, className, highlight = false, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-xl",
        highlight && "border-primary/20 bg-primary/5",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
