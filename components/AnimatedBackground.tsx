// components/AnimatedBackground.tsx
"use client"
import { useRef } from 'react'
import { gsap } from "gsap"
import { useGSAP } from "@gsap/react"

interface AnimatedBackgroundProps {
  opacity?: number
  gridSize?: number
  animationDuration?: number
  gridColor?: string
  backgroundColor?: string
}

export default function AnimatedBackground({
  opacity = 0.6,
  gridSize = 20,
  animationDuration = 4,
  gridColor = "#333",
  backgroundColor = "transparent"
}: AnimatedBackgroundProps) {
  const backgroundRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (backgroundRef.current) {
      gsap.to(backgroundRef.current, {
        backgroundPosition: `${gridSize * 2}px ${gridSize * 2}px`,
        duration: animationDuration,
        repeat: -1,
        ease: "linear",
      })
    }
  }, [gridSize, animationDuration])

  return (
    <div
      ref={backgroundRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none transition-opacity duration-300"
      style={{
        opacity,
        zIndex: 0,
        backgroundColor,
        backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }}
    />
  )
}

interface LayoutWithAnimatedBackgroundProps {
  children: React.ReactNode
  className?: string
  backgroundProps?: AnimatedBackgroundProps
}

export function LayoutWithAnimatedBackground({
  children,
  className = "",
  backgroundProps
}: LayoutWithAnimatedBackgroundProps) {
  return (
    // Add bg-black directly to base div to prevent flash
    <div className={`bg-black relative min-h-screen overflow-hidden ${className}`}
         style={{ backgroundColor: 'black' }}> {/* Inline style for immediate effect */}
      <AnimatedBackground {...backgroundProps} />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}