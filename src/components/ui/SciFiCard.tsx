import * as React from "react"
import { cn } from "@/lib/utils"

const SciFiCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { glowOnHover?: boolean }
>(({ className, glowOnHover = false, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative bg-sci-card/80 backdrop-blur-md border border-sci-border rounded-xl p-6 overflow-hidden print:overflow-visible print:border-gray-200",
      "transition-all duration-300",
      glowOnHover && "hover:border-sci-accent/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.1)]",
      className
    )}
    {...props}
  >
    {/* Subtle top glare effect */}
    <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-sci-accent/20 to-transparent" />
    {props.children}
  </div>
))
SciFiCard.displayName = "SciFiCard"

export { SciFiCard }
