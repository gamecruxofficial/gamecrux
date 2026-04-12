"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useKeyDown } from "./useKeyDown"
import { useInterval } from "./useInterval"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function RepairKit() {
  const [gameStatus, setGameStatus] = useState(0) // 0=Stopped,1=Running,2=Failed,3=Win
  const [currentPosition, setCurrentPosition] = useState(0)
  const [slotPosition, setSlotPosition] = useState<number | null>(null)
  const resetTimeout = useRef<NodeJS.Timeout | undefined>(undefined)
  const [allowKeyDown, setAllowKeyDown] = useState(true)
  const [tickSpeed, setTickSpeed] = useState(5000) // Block Speed at 5 (showing as 5 seconds)
  const [gameMessage, setGameMessage] = useState("")

  const handleWin = () => {
    setGameMessage("You Won!")
    setGameStatus(3)
  }

  const handleLose = () => {
    setGameMessage("Game Over!")
    setGameStatus(2)
  }

  const handleGameOver = (result?: boolean) => {
    if (gameStatus !== 1) return
    if (slotPosition === null) return

    if (result === undefined) {
      const deviation = Math.abs(currentPosition - slotPosition)
      if (deviation <= 2) {
        handleWin()
      } else {
        handleLose()
      }
    } else {
      if (result) {
        handleWin()
      } else {
        handleLose()
      }
    }
    // Removed auto-restart
  }

    const resetGame = useCallback(() => {
    setCurrentPosition(0)
    randomSlotPosition()
    setGameStatus(0)
    setGameMessage("")
  }, [])
  
  const handleKeyDown = () => {
    if (gameStatus === 0) {
      startGame()
    } else if (gameStatus === 1) {
      handleGameOver()
    } else if (gameStatus === 2 || gameStatus === 3) {
      resetGame()
    }
  }

  const startGame = () => {
    setGameMessage("")
    setCurrentPosition(0)
    randomSlotPosition()
    setGameStatus(1)
  }



  const tick = () => {
    if (gameStatus !== 1) return
    if (slotPosition === null) throw new Error("null slot position during tick update")

    setCurrentPosition((v) => v + 1)

    if (currentPosition > Math.min(slotPosition + 7, 94)) {
      handleGameOver(false)
    }
  }

  function randomSlotPosition() {
    const maxPos = 90
    const minPos = 15
    setSlotPosition(Math.floor(Math.random() * (maxPos - minPos) + minPos))
  }

  useKeyDown(handleKeyDown, ["e", "E", " "], allowKeyDown)

  // Remove the auto-start useEffect and replace with initialization
  useEffect(() => {
    randomSlotPosition()
  }, [])

  // Convert tickSpeed to actual interval (inverse relationship - higher speed = lower interval)
  const interval = Math.max(10, (11000 - tickSpeed) / 100)
  // Add pause flag to useInterval
  useInterval(tick, interval, gameStatus !== 1)

  const handleSpeedChange = (value: number[]) => {
    setTickSpeed(value[0] * 1000)
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 mt-32">
      <div className="w-full max-w-3xl space-y-8">
        {/* Game Track */}
        <div className="relative h-16 bg-[#1a1a1a] rounded-lg overflow-hidden">
          {/* Moving Block */}
          <div
            className="absolute h-full aspect-square transition-all duration-100 ease-linear"
            style={{ left: `${currentPosition}%` }}
          >
            <div
              className={cn(
                "h-full w-full flex items-center justify-center transition-colors duration-300",
                gameStatus === 3
                  ? "bg-[#4ADE80] animate-pulse"
                  : gameStatus === 2
                    ? "bg-red-500 animate-shake"
                    : "bg-[#4ADE80]",
              )}
            />
          </div>
          {/* Target Zone */}
          {slotPosition !== null && (
            <div
              className="absolute h-full aspect-square flex items-center justify-center"
              style={{ left: `${slotPosition}%` }}
            >
              <div
                className={cn(
                  "h-full aspect-square border flex items-center justify-center transition-colors duration-300",
                  gameStatus === 3
                    ? "border-[#4ADE80] text-[#4ADE80] animate-pulse"
                    : gameStatus === 2
                      ? "border-red-500 text-red-500"
                      : "border-[#4ADE80] text-[#4ADE80]",
                )}
              >
                E
              </div>
            </div>
          )}
        </div>

        {/* Game Message */}
        <div
          className={cn(
            "text-center transition-opacity duration-300 text-2xl font-bold",
            gameMessage ? "opacity-100" : "opacity-0",
            gameStatus === 3 ? "text-[#4ADE80]" : "text-red-500",
          )}
        >
          {gameMessage}
        </div>

        {/* Speed Control */}
        <div className="space-y-2">
          <div className="text-[#4ADE80] text-sm">Block Speed</div>
          <Slider
            min={0}
            max={10}
            step={1}
            value={[tickSpeed / 1000]}
            onValueChange={handleSpeedChange}
            className="w-full"
          />
          <div className="text-[#4ADE80] text-sm">
            Current speed: {(tickSpeed / 1000).toFixed(1)} seconds
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex flex-col items-center gap-2">
          {gameStatus === 0 && (
            <Button
              onClick={startGame}
              variant="outline"
              className="bg-transparent border-[#4ADE80] text-[#4ADE80] hover:bg-[#4ADE80] hover:text-black transition-colors"
            >
              Start Game
            </Button>
          )}
          {(gameStatus === 2 || gameStatus === 3) && (
            <Button
              onClick={resetGame}
              variant="outline"
              className="bg-transparent border-[#4ADE80] text-[#4ADE80] hover:bg-[#4ADE80] hover:text-black transition-colors"
            >
              Restart Game
            </Button>
          )}
          <span className="text-[#4ADE80] text-sm">
            {gameStatus === 0
              ? "Press Space to start the game"
              : gameStatus === 1
                ? "Press E to stop the block"
                : "Press Space to restart the game"}
          </span>
        </div>
      </div>
    </div>
  )
}

