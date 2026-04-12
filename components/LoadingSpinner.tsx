"use client"

import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  className?: string
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={cn("grid place-items-center p-4 -mt-60", className)}>
      <svg className="w-24 h-48" viewBox="0 0 128 256" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="spinner-grad1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(223,90%,55%)" />
            <stop offset="100%" stopColor="hsl(253,90%,55%)" />
          </linearGradient>
          <linearGradient id="spinner-grad2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(193,90%,55%)" />
            <stop offset="50%" stopColor="hsl(223,90%,55%)" />
            <stop offset="100%" stopColor="hsl(253,90%,55%)" />
          </linearGradient>
        </defs>
        <circle
          className="dark:stroke-zinc-800 stroke-zinc-200"
          r="56"
          cx="64"
          cy="192"
          fill="none"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <circle
          className="origin-[64px_192px] animate-worm1"
          r="56"
          cx="64"
          cy="192"
          fill="none"
          stroke="url(#spinner-grad1)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray="87.96 263.89"
          style={{ transformOrigin: "64px 192px" }}
        />
        <path
          className="origin-[64px_192px] animate-worm2"
          d="M120,192A56,56,0,0,1,8,192C8,161.07,16,8,64,8S120,161.07,120,192Z"
          fill="none"
          stroke="url(#spinner-grad2)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray="87.96 494"
          style={{ transformOrigin: "64px 192px" }}
        />
      </svg>
    </div>
  )
}
