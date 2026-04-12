"use client"

import { memo } from "react"
import { cn } from "@/lib/utils"

export const NodeDot = memo(function NodeDot({
  root,
  selected,
  xPct,
  yPct,
  sizeVh,
  disabled,
  onClick,
}: {
  root: boolean
  selected: boolean
  xPct: number
  yPct: number
  sizeVh: number
  disabled?: boolean
  onClick?: () => void
}) {
  const size = `calc(${sizeVh}vh)`
  return (
    <button
      type="button"
      aria-label={root ? "Start node" : "Node"}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "absolute rounded-full border",
        root
          ? "bg-emerald-500 border-emerald-600"
          : selected
            ? "bg-emerald-400 border-emerald-500"
            : "bg-background/80 border-border hover:bg-background",
        "transition-colors",
      )}
      style={{
        left: `calc(${xPct}% - (${size} / 2))`,
        top: `calc(${yPct}% - (${size} / 2))`,
        width: size,
        height: size,
      }}
    />
  )
})
