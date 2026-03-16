"use client";

import * as React from "react"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, ...props }, ref) => {
        const [showPassword, setShowPassword] = React.useState(false);
        const isPassword = type === "password";
        const currentType = isPassword ? (showPassword ? "text" : "password") : type;

        return (
            <div className="relative w-full">
                <input
                    type={currentType}
                    className={cn(
                        "flex h-10 w-full rounded-md border border-sci-border bg-sci-dark px-3 py-2 text-sm text-sci-silver placeholder:text-sci-metallic focus:outline-none focus:ring-1 focus:ring-sci-accent focus:border-sci-accent disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
                        isPassword && "pr-10",
                        className
                    )}
                    ref={ref}
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sci-metallic hover:text-sci-accent transition-colors focus:outline-none"
                        title={showPassword ? "Ocultar código" : "Ver código"}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                    </button>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
