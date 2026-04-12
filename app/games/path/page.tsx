"use client"

import { useState, useEffect, useCallback } from "react"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"
import { X, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react"

type Position = {
  x: number
  y: number
}

type Direction = "up" | "down" | "left" | "right"

type StrikeInfo = Position & {
  directionToPath: Direction
}

type GameState = {
  started: boolean
  ended: boolean
  success: boolean
  failReason?: "time" | "strikes"
  timeRemaining: number
  strikes: number
  startTime?: number
  strikePositions: StrikeInfo[]
}

// --- REMOVED FUNCTION ---
// The findNearestPathDirection function is no longer needed with the new logic.

export default function PathGame() {
  const [gridSize, setGridSize] = useState(32)
  const [timeLimit, setTimeLimit] = useState(10000)
  const [path, setPath] = useState<Position[]>([])
  const [playerPosition, setPlayerPosition] = useState<Position & { lastMove: Direction | null }>({
    x: 0,
    y: 0,
    lastMove: null,
  })
  const [gameState, setGameState] = useState<GameState>({
    started: false,
    ended: false,
    success: false,
    timeRemaining: timeLimit,
    strikes: 0,
    strikePositions: [],
  })
  const [maxStrikes, setMaxStrikes] = useState(3)

  const generatePath = useCallback((gridSize: number, maxMove = 3) => {
    const newPath: Position[] = []
    const currentCoords: Position & {
      up: () => void
      down: () => void
      left: () => void
      right: () => void
    } = {
      x: Math.floor(gridSize / 2),
      y: gridSize - 1, // Start from bottom row
      up() {
        this.y--
      },
      down() {
        this.y++
      },
      left() {
        this.x--
      },
      right() {
        this.x++
      },
    }

    newPath.push({ x: currentCoords.x, y: currentCoords.y })

    let possibleDirections: Direction[] = ["up", "left", "right"]
    let availableDirection: Direction | null = null
    let lastDirection: Direction | null = null

    while (currentCoords.y > 0) {
      const randomDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)] as Direction
      const moveAmt = Math.floor(Math.random() * maxMove) + 1

      if (randomDirection === "left" && currentCoords.x - moveAmt < 0) {
        if (possibleDirections.length === 1) {
          possibleDirections = ["up"]
        }
        continue
      }
      if (randomDirection === "right" && currentCoords.x + moveAmt >= gridSize) {
        if (possibleDirections.length === 1) {
          possibleDirections = ["up"]
        }
        continue
      }
      if (randomDirection === "up" && currentCoords.y - moveAmt < 0) {
        if (possibleDirections.length === 1) {
          possibleDirections = ["left", "right"]
        }
        continue
      }

      for (let i = 0; i < moveAmt; i++) {
        currentCoords[randomDirection]()
        newPath.push({ x: currentCoords.x, y: currentCoords.y })
      }

      if (randomDirection === "up" && moveAmt === 1) {
        availableDirection = lastDirection as Direction
      } else {
        availableDirection = null
      }

      lastDirection = randomDirection

      if (randomDirection === "left" || randomDirection === "right") {
        possibleDirections = ["up"]
      } else {
        possibleDirections = availableDirection ? [availableDirection] : ["left", "right"]
      }
    }

    setPath(newPath)
    setPlayerPosition({
      x: Math.floor(gridSize / 2),
      y: gridSize - 1,
      lastMove: null,
    })
  }, [])

  const startGame = useCallback(() => {
    generatePath(gridSize)
    setGameState({
      started: true,
      ended: false,
      success: false,
      timeRemaining: timeLimit,
      strikes: 0,
      strikePositions: [],
      startTime: Date.now(),
    })
  }, [generatePath, gridSize, timeLimit])

  const endGame = useCallback((success: boolean, reason?: "time" | "strikes") => {
    setGameState(prev => ({
      ...prev,
      started: false,
      ended: true,
      success,
      failReason: reason,
      timeRemaining: 0,
    }))
  }, [])

  const isOnPath = useCallback(
    (pos: Position) => {
      return path.some(p => p.x === pos.x && p.y === pos.y)
    },
    [path]
  )

  const movePlayer = useCallback(
    (direction: Direction) => {
      if (!gameState.started || gameState.ended) return

      setPlayerPosition(prev => {
        const currentStrikeInfo = gameState.strikePositions.find(
          strike => strike.x === prev.x && strike.y === prev.y
        )

        if (currentStrikeInfo && direction !== currentStrikeInfo.directionToPath) {
          return prev
        }

        const newPos = { ...prev }

        switch (direction) {
          case "down":
            if (prev.y < gridSize - 1) newPos.y++
            break
          case "up":
            if (prev.y > 0) newPos.y--
            break
          case "left":
            if (prev.x > 0) newPos.x--
            break
          case "right":
            if (prev.x < gridSize - 1) newPos.x++
            break
        }

        newPos.lastMove = direction
        return newPos
      })
    },
    [gameState.started, gameState.ended, gridSize, gameState.strikePositions]
  )

  // Effect to handle game logic after a player moves
  useEffect(() => {
    if (!gameState.started || playerPosition.lastMove === null) return

    if (playerPosition.y === 0 && isOnPath(playerPosition)) {
      endGame(true)
      return
    }

    const isAlreadyAStrike = gameState.strikePositions.some(
      pos => pos.x === playerPosition.x && pos.y === playerPosition.y
    )

    if (!isOnPath(playerPosition) && !isAlreadyAStrike) {
      const newStrikeCount = gameState.strikes + 1

      if (newStrikeCount >= maxStrikes) {
        endGame(false, "strikes")
      } else {
        // --- BUG FIX START ---
        // The old logic called findNearestPathDirection, which was unreliable.
        // The new logic simply reverses the last move to guide the player back
        // to the tile they just left, which is guaranteed to be on the path.

        let directionToPath: Direction = "up" // Default fallback

        switch (playerPosition.lastMove) {
          case "up":
            directionToPath = "down"
            break
          case "down":
            directionToPath = "up"
            break
          case "left":
            directionToPath = "right"
            break
          case "right":
            directionToPath = "left"
            break
        }

        setGameState(prev => ({
          ...prev,
          strikes: newStrikeCount,
          strikePositions: [
            ...prev.strikePositions,
            { x: playerPosition.x, y: playerPosition.y, directionToPath },
          ],
        }))
        // --- BUG FIX END ---
      }
    }
  }, [playerPosition, gameState.started, gameState.strikes, maxStrikes, path, isOnPath, endGame])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        startGame()
        return
      }

      switch (e.key) {
        case "ArrowUp":
        case "w":
          movePlayer("up")
          break
        case "ArrowDown":
        case "s":
          movePlayer("down")
          break
        case "ArrowLeft":
        case "a":
          movePlayer("left")
          break
        case "ArrowRight":
        case "d":
          movePlayer("right")
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [movePlayer, startGame])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const updateTimer = () => {
      if (gameState.started && !gameState.ended && gameState.startTime) {
        const currentTime = Date.now()
        const elapsed = currentTime - gameState.startTime
        const remaining = Math.max(0, timeLimit - elapsed)

        if (remaining <= 0) {
          endGame(false, "time")
        } else {
          setGameState(prev => ({
            ...prev,
            timeRemaining: remaining,
          }))
          timeoutId = setTimeout(updateTimer, 50)
        }
      }
    }

    if (gameState.started && !gameState.ended) {
      updateTimer()
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [gameState.started, gameState.ended, gameState.startTime, timeLimit, endGame])

  // ... rest of your JSX remains the same
  return (
    <div className="relative w-full flex flex-col items-center overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Animated Gradient Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-30 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-pink-400 via-indigo-400 to-blue-400 opacity-30 rounded-full blur-3xl animate-pulse z-0" />
      {/* Main Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 -z-10" />
      {/* Main Content */}
      <div className="w-full flex flex-col items-center gap-6 p-4 z-10">
        <div className="w-full max-w-[650px] p-4">
          <div className="flex flex-col gap-4">
            {!gameState.started && (
              <div className="flex flex-row w-full gap-4">
                <div className="space-y-2 w-full">
                  <label className="text-sm text-white font-semibold tracking-wide">Time: {timeLimit / 1000}s</label>
                  <Slider
                    value={[timeLimit]}
                    onValueChange={value => setTimeLimit(value[0])}
                    min={5000}
                    max={30000}
                    step={1000}
                    className="custom-slider"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <label className="text-sm text-white font-semibold tracking-wide">Grid Size: {gridSize}</label>
                  <Slider
                    value={[gridSize]}
                    onValueChange={value => setGridSize(value[0])}
                    min={8}
                    max={60}
                    step={1}
                    className="custom-slider"
                  />
                </div>
                <div className="space-y-2 w-full">
                  <label className="text-sm text-white font-semibold tracking-wide">Max Strikes: {maxStrikes}</label>
                  <Slider
                    value={[maxStrikes]}
                    onValueChange={value => setMaxStrikes(value[0])}
                    min={1}
                    max={5}
                    step={1}
                    className="custom-slider"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {gameState.started && (
          <div className="w-full max-w-[650px] flex items-center justify-between px-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-white">Strikes:</span>
              <div className="flex gap-1">
                {Array.from({ length: maxStrikes }).map((_, i) => (
                  <X
                    key={i}
                    className={cn("w-6 h-6", i < gameState.strikes ? "text-red-500" : "text-gray-600")}
                  />
                ))}
              </div>
            </div>
            <div className="text-white">{maxStrikes - gameState.strikes} attempts remaining</div>
          </div>
        )}

        <div className="relative w-full max-w-[680px] bg-gray-800 p-1 pb-6 rounded-sm">
          <div
            className="grid gap-0.5 h-full"
            style={{
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gridTemplateRows: `repeat(${gridSize}, 1fr)`,
            }}
          >
            {Array.from({ length: gridSize * gridSize }).map((_, i) => {
              const x = i % gridSize
              const y = Math.floor(i / gridSize)
              const isPath = isOnPath({ x, y })
              const isPlayer = playerPosition.x === x && playerPosition.y === y
              const strikeInfo = gameState.strikePositions.find(pos => pos.x === x && pos.y === y)
              const isStrike = !!strikeInfo

              return (
                <div
                  key={i}
                  className={cn(
                    "relative aspect-square transition-colors flex items-center justify-center",
                    isPath && "bg-blue-500/20",
                    isPlayer && (isPath ? "bg-green-500" : "bg-red-500"),
                    isStrike && !isPlayer && "bg-red-700", // Stuck red color for wrong moves
                    !isPath && !isPlayer && !isStrike && "bg-gray-700"
                  )}
                >
                  {isStrike && strikeInfo && (
                    <>
                      {strikeInfo.directionToPath === "up" && (
                        <ArrowUp className="w-1/2 h-1/2 text-white/50" />
                      )}
                      {strikeInfo.directionToPath === "down" && (
                        <ArrowDown className="w-1/2 h-1/2 text-white/50" />
                      )}
                      {strikeInfo.directionToPath === "left" && (
                        <ArrowLeft className="w-1/2 h-1/2 text-white/50" />
                      )}
                      {strikeInfo.directionToPath === "right" && (
                        <ArrowRight className="w-1/2 h-1/2 text-white/50" />
                      )}
                    </>
                  )}
                </div>
              )
            })}

            {gameState.started && (
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width: `${(gameState.timeRemaining / timeLimit) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {!gameState.started && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-lg">
                {gameState.ended ? (
                  <>
                    <span className="text-2xl font-bold text-white mb-4">
                      {gameState.success
                        ? "Success! 🎉"
                        : gameState.failReason === "time"
                          ? "Time's up! ⏱️"
                          : "Too many wrong moves! 💥"}
                    </span>
                    <span className="text-sm text-white mb-4">Press spacebar to try again</span>
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-white mb-4">Path Game</span>
                    <span className="text-sm text-white mb-4">Press spacebar to start</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Custom slider styles */}
      <style jsx global>{`
        .custom-slider .rc-slider-rail {
          background: linear-gradient(90deg, #334155 0%, #6366f1 100%);
          opacity: 0.4;
          height: 8px;
          border-radius: 9999px;
        }
        .custom-slider .rc-slider-track {
          background: linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
          height: 8px;
          border-radius: 9999px;
          box-shadow: 0 0 8px 2px #a78bfa55;
        }
        .custom-slider .rc-slider-handle {
          width: 28px;
          height: 28px;
          margin-top: -10px;
          background: linear-gradient(135deg, #fff 60%, #a78bfa 100%);
          border: 3px solid #6366f1;
          box-shadow: 0 0 0 6px #a78bfa33, 0 2px 8px #0002;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .custom-slider .rc-slider-handle:focus,
        .custom-slider .rc-slider-handle:hover {
          transform: scale(1.15);
          box-shadow: 0 0 0 10px #a78bfa55, 0 2px 12px #0003;
          border-color: #f472b6;
        }
        .custom-slider .rc-slider-dot {
          display: none;
        }
      `}</style>
    </div>
  )
}