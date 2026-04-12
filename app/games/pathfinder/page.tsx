"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Play, RotateCcw, Settings, Trophy, X } from "lucide-react"
import { FaRoute } from "react-icons/fa"

interface Dot {
  id: number
  x: number
  y: number
  connected: boolean
}

interface Connection {
  from: number
  to: number
}

const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 600
const DOT_RADIUS = 12

export default function Component() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dots, setDots] = useState<Dot[]>([])
  const [connections, setConnections] = useState<Connection[]>([])
  const [selectedDot, setSelectedDot] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [gameState, setGameState] = useState<"setup" | "playing" | "won" | "lost">("setup")
  const [timeLeft, setTimeLeft] = useState(60)
  const [dotCount, setDotCount] = useState(5)
  const [gameTime, setGameTime] = useState(30)

  // Calculate distance between two dots
  const calculateDistance = (dot1: { x: number; y: number }, dot2: { x: number; y: number }) => {
    return Math.sqrt(Math.pow(dot2.x - dot1.x, 2) + Math.pow(dot2.y - dot1.y, 2))
  }

  // Draw everything on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas with dark background
    ctx.fillStyle = "#1a1a1a" // Dark background for the game board
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    // Draw permanent connections
    ctx.strokeStyle = "#4CAF50" // Green for connected lines
    ctx.lineWidth = 4
    connections.forEach((connection) => {
      const fromDot = dots.find((d) => d.id === connection.from)
      const toDot = dots.find((d) => d.id === connection.to)
      if (fromDot && toDot) {
        ctx.beginPath()
        ctx.moveTo(fromDot.x, fromDot.y)
        ctx.lineTo(toDot.x, toDot.y)
        ctx.stroke()
      }
    })

    // Draw dynamic line from selected dot to mouse cursor
    if (selectedDot !== null && gameState === "playing") {
      const selectedDotObj = dots.find((d) => d.id === selectedDot)
      if (selectedDotObj) {
        ctx.strokeStyle = "#FFD700" // Gold for active line
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.moveTo(selectedDotObj.x, selectedDotObj.y)
        ctx.lineTo(mousePos.x, mousePos.y)
        ctx.stroke()
      }
    }

    // Draw dots
    dots.forEach((dot) => {
      ctx.beginPath()
      ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, 2 * Math.PI)
      ctx.fillStyle = "#22c55e" // Green dots
      ctx.fill()

      // Add slight border for better visibility
      ctx.strokeStyle = "#16a34a"
      ctx.lineWidth = 2
      ctx.stroke()

      // Highlight selected dot
      if (selectedDot === dot.id) {
        ctx.strokeStyle = "#FFD700" // Gold highlight for selected dot
        ctx.lineWidth = 3
        ctx.stroke()
      }
    })

    // Draw hover effect for dots near mouse cursor
    if (gameState === "playing") {
      dots.forEach((dot) => {
        const distanceToMouse = calculateDistance(dot, mousePos)
        if (distanceToMouse <= DOT_RADIUS * 1.5) {
          // Draw hover ring
          ctx.beginPath()
          ctx.arc(dot.x, dot.y, DOT_RADIUS + 4, 0, 2 * Math.PI)
          ctx.strokeStyle = "#ffffff"
          ctx.lineWidth = 2
          ctx.stroke()
        }
      })
    }

    // Draw game info
    if (gameState === "playing") {
      ctx.fillStyle = "#ffffff"
      ctx.font = "18px 'Press Start 2P', cursive" // Use a pixel-art font if available, otherwise a clear sans-serif
      ctx.textAlign = "left"
      ctx.textBaseline = "top"

      const instruction = "PATHFIND - Connect the closest dot!"
      ctx.fillText(instruction, 10, 10)

      // Draw remaining time (top-right)
      const minutes = Math.floor(timeLeft / 60)
      const seconds = (timeLeft % 60).toString().padStart(2, "0")
      const timeText = `${minutes}:${seconds}`
      ctx.font = "18px Inter, sans-serif"
      ctx.textAlign = "right"
      // small background for readability
      const padding = 2
      const metrics = ctx.measureText(timeText)
      const boxWidth = metrics.width + padding * 2
      const boxHeight = 28
      const boxX = CANVAS_WIDTH - 10 - boxWidth
      const boxY = 10
      ctx.fillStyle = "rgba(0,0,0,0.6)"
      ctx.fillRect(boxX, boxY, boxWidth, boxHeight)
      ctx.fillStyle = "#FFD700"
      ctx.textBaseline = "middle"
      ctx.fillText(timeText, CANVAS_WIDTH - 10, boxY + boxHeight / 2)
      // restore baseline/alignment for other drawings
      ctx.textAlign = "left"
      ctx.textBaseline = "top"

      // Progress indicator
      const progress = (connections.length / (dotCount - 1)) * 100
      ctx.fillStyle = "#4CAF50" // Green progress bar
      ctx.fillRect(10, CANVAS_HEIGHT - 20, (CANVAS_WIDTH - 20) * (progress / 100), 10)
      ctx.strokeStyle = "#16a34a"
      ctx.strokeRect(10, CANVAS_HEIGHT - 20, CANVAS_WIDTH - 20, 10)
    }
  }, [dots, connections, selectedDot, mousePos, gameState, dotCount, timeLeft])

  // Generate dots scattered across the canvas
  const generateDots = useCallback(() => {
    const newDots: Dot[] = []

    const marginX = 50
    const marginY = 60
    const usableWidth = CANVAS_WIDTH - 2 * marginX
    const usableHeight = CANVAS_HEIGHT - 2 * marginY
    const minDistance = DOT_RADIUS * 2.5

    for (let i = 0; i < dotCount; i++) {
      let attempts = 0
      let validPosition = false
      let newDot: Dot

      do {
        const verticalProgress = i / (dotCount - 1)
        const baseY = CANVAS_HEIGHT - marginY - verticalProgress * usableHeight

        const horizontalVariation = (Math.random() - 0.5) * (usableWidth * 0.9)
        const baseX = CANVAS_WIDTH / 2 + horizontalVariation

        const offsetX = (Math.random() - 0.5) * 80
        const offsetY = (Math.random() - 0.5) * 50

        newDot = {
          id: i,
          x: Math.max(marginX, Math.min(CANVAS_WIDTH - marginX, baseX + offsetX)),
          y: Math.max(marginY, Math.min(CANVAS_HEIGHT - marginY, baseY + offsetY)),
          connected: false,
        }

        validPosition = newDots.every((existingDot) => calculateDistance(newDot, existingDot) >= minDistance)

        attempts++
      } while (!validPosition && attempts < 100)

      if (!validPosition && attempts >= 100) {
        let bestDistance = 0
        let bestPosition = newDot

        for (let attempt = 0; attempt < 50; attempt++) {
          const verticalProgress = i / (dotCount - 1)
          const baseY = CANVAS_HEIGHT - marginY - verticalProgress * usableHeight
          const horizontalVariation = (Math.random() - 0.5) * usableWidth
          const baseX = CANVAS_WIDTH / 2 + horizontalVariation
          const offsetX = (Math.random() - 0.5) * 100
          const offsetY = (Math.random() - 0.5) * 70

          const testDot = {
            id: i,
            x: Math.max(marginX, Math.min(CANVAS_WIDTH - marginX, baseX + offsetX)),
            y: Math.max(marginY, Math.min(CANVAS_HEIGHT - marginY, baseY + offsetY)),
            connected: false,
          }

          const minDistanceToOthers = Math.min(...newDots.map((existingDot) => calculateDistance(testDot, existingDot)))

          if (minDistanceToOthers > bestDistance) {
            bestDistance = minDistanceToOthers
            bestPosition = testDot
          }
        }
        newDot = bestPosition
      }

      newDots.push(newDot)
    }

    setDots(newDots)
    setConnections([])
    setSelectedDot(null)
  }, [dotCount])

  // Handle mouse move
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    setMousePos({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    })
  }

  // Start the game
  const startGame = () => {
    setConnections([])
    setSelectedDot(null)
    setGameState("playing")
    setTimeLeft(gameTime)
    setTimeout(() => {
      generateDots()
    }, 100)
  }

  // Reset the game
  const resetGame = () => {
    setGameState("setup")
    setConnections([])
    setSelectedDot(null)
    setDots([])
  }

  // Handle dot click
  const handleDotClick = (dotId: number) => {
    if (gameState !== "playing") return

    if (selectedDot === null) {
      // First click - allow starting from either the bottom-most OR top-most dot
      const bottomDot = dots.reduce((b, d) => (d.y > b.y ? d : b), dots[0])
      const topDot = dots.reduce((t, d) => (d.y < t.y ? d : t), dots[0])
      if (dotId === bottomDot.id || dotId === topDot.id) {
        setSelectedDot(dotId)
      }
      return
    }

    if (selectedDot === dotId) {
      // Click same dot again — keep it selected (do not deactivate on double-click)
      return
    }

    // Second click - try to connect
    const fromDot = dots.find((d) => d.id === selectedDot)!
    // Only consider dots that are not already part of a connection
    const unconnected = dots.filter((d) => d.id !== selectedDot && !connections.some((c) => c.from === d.id || c.to === d.id))

    let closestDot: Dot | null = null
    let minDist = Number.POSITIVE_INFINITY
    unconnected.forEach((d) => {
      const dist = calculateDistance(fromDot, d)
      if (dist < minDist) {
        minDist = dist
        closestDot = d
      }
    })

    if (closestDot && dotId === closestDot.id) {
      // Correct connection
      const newConnection = { from: selectedDot, to: dotId }
      setConnections((prev) => [...prev, newConnection])
      setDots((prev) =>
        prev.map((dot) => (dot.id === selectedDot || dot.id === dotId ? { ...dot, connected: true } : dot)),
      )
      setSelectedDot(dotId)
      // Check if all dots are connected (connections = dotCount - 1)
      if (connections.length + 1 === dotCount - 1) {
        setSelectedDot(null)
        setGameState("won")
      }
    } else {
      // Wrong connection - game over
      setGameState("lost")
    }
  }

  // Timer effect
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (gameState === "playing" && timeLeft === 0) {
      setGameState("lost")
    }
  }, [gameState, timeLeft])

  // Draw canvas whenever state changes
  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    // Find clicked dot - make clickable area larger than visual dot
    const clickedDot = dots.find((dot) => {
      const distance = Math.sqrt(Math.pow(x - dot.x, 2) + Math.pow(y - dot.y, 2))
      return distance <= DOT_RADIUS * 1.5 // Increased clickable area by 50%
    })

    if (clickedDot) {
      handleDotClick(clickedDot.id)
    }
  }

  return (
    <div className="flex flex-col items-center mt-24 text-white p-4">
      {gameState === "setup" ? (
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-6 flex flex-col items-center">
        {/* Replace FaRoute with Lucide icon for consistency */}
        <FaRoute className="w-16 h-16 mb-4 text-[#23af57]" />
        <h1 className="text-3xl font-bold mb-2">Pathfinder Game</h1>
        <p className="text-lg mb-8 text-gray-400">Configure Your Maze</p>
        <div className="w-full space-y-6">
        <div>
          <label className="block text-sm mb-2">
          Number of Dots: {dotCount}
          </label>
          <input
          type="range"
          min={3}
          max={10}
          value={dotCount}
          onChange={(e) => setDotCount(Number(e.target.value))}
          className="w-full accent-[#23af57]"
          />
        </div>
        <div>
          <label className="block text-sm mb-2">
          Time Limit: {gameTime} seconds
          </label>
          <input
          type="range"
          min={10}
          max={120}
          step={5}
          value={gameTime}
          onChange={(e) => setGameTime(Number(e.target.value))}
          className="w-full accent-[#23af57]"
          />
        </div>
        </div>
        <Button
        size="lg"
        onClick={startGame}
        className="bg-[#23af57] hover:bg-[#1f9a4c] mt-8 w-full max-w-xs transition-all"
        >
        PLAY NOW
        </Button>
      </div>
      ) : (
        <div>
      <Card className="w-full max-w-2xl -mt-12 bg-gray-800 border-gray-700 shadow-2xl rounded-xl overflow-hidden">
        <CardContent className="p-6">
        <div className="space-y-6">
          <div className="relative flex justify-center"> {/* make container relative for overlay */}
           <canvas
             ref={canvasRef}
             width={CANVAS_WIDTH}
             height={CANVAS_HEIGHT}
             className="border-4 border-gray-600 rounded-lg cursor-crosshair shadow-xl bg-gray-900"
             onClick={handleCanvasClick}
             onMouseMove={handleMouseMove}
           />
          {/* Win / Lose overlay */}
          {(gameState === "won" || gameState === "lost") && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-lg pointer-events-auto">
              <div className="text-center">
                <div className="text-4xl text-white font-extrabold mb-4">
                  {gameState === "won" ? "You Won!" : "You Lost!"}
                </div>
                <div className="mb-6 text-gray-200">
                  {gameState === "won"
                    ? "Great job — you connected all dots."
                    : "Oops — that connection was incorrect or time ran out."}
                </div>
                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      // restart the game immediately
                      startGame()
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold"
                  >
                    Play Again
                  </Button>
                </div>
              </div>
            </div>
          )}
           </div>
         </div>
         </CardContent>
       </Card>
        {/* Restart / go back to config button below the game screen */}
          <div className="flex justify-center mt-4">
            <button
              className="w-32 bg-red-500 hover:opacity-80 transition-all text-white rounded py-2 font-bold"
              onClick={resetGame}
            >
              Restart
            </button>
          </div>
       </div>
       )}
     </div>
   )
 }
