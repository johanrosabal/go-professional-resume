import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
}

const GlowingButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sci-accent disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-sci-accent text-sci-dark hover:bg-white hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]": variant === "primary",
                        "bg-sci-card border border-sci-border text-sci-silver hover:border-sci-accent/50 hover:text-white": variant === "secondary",
                        "hover:bg-sci-border hover:text-white text-sci-silver": variant === "ghost",
                        "h-10 px-6 py-2": size === "default",
                        "h-8 rounded-md px-3 text-xs": size === "sm",
                        "h-12 rounded-md px-8 text-base": size === "lg",
                        "h-10 w-10": size === "icon",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
GlowingButton.displayName = "GlowingButton"

export { GlowingButton }
