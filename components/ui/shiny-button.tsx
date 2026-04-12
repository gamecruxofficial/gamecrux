"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  className?: string
}

export const ShinyButton = React.forwardRef<HTMLButtonElement, ShinyButtonProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        className={cn(
          "group relative inline-flex items-center justify-center overflow-hidden rounded-md bg-slate-900 px-8 py-3 text-white transition duration-300 ease-out hover:scale-105",
          className,
        )}
        ref={ref}
        {...props}
      >
        <span className="absolute inset-0 h-full w-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></span>
        <span className="ease absolute inset-0 h-full w-full transition duration-300 group-hover:scale-105">
          <span className="absolute inset-0 h-full w-full bg-slate-900 scale-[0.96]"></span>
        </span>
        <span className="relative">{children}</span>
      </button>
    )
  },
)
ShinyButton.displayName = "ShinyButton"

