"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Info, Timer, CircleUserRound } from 'lucide-react'
import { cn } from "@/lib/utils"

const BOX_SIZE = 96 // px, w-24/h-24
const CONTAINER_WIDTH = 1436
const CONTAINER_HEIGHT = 765

export default function VARSimulation() {
  const colorClasses = [
    'bg-[#00ffff]', 'bg-[#088f90]', 'bg-[#708fae]', 'bg-[#7392b2]',
    'bg-[#6394ed]', 'bg-[#10487f]', 'bg-[#0047ab]', 'bg-[#1335a3]', 'bg-[#00018b]',
  ]

  const [gameState, setGameState] = useState({
    started: false,
    showingNumbers: false,
    gameOver: false,
    won: false,
    numbers: [] as number[],
    colors: [] as string[],
    currentNumber: 1,
    positions: [] as { top: number; left: number }[],
    clickedSquares: [] as number[],
    removedSquares: [] as number[], // <-- add this
    showHelp: false
  })
  const [settings, setSettings] = useState({
    numberCount: 10,
    speed: 10
  })
  const [stats, setStats] = useState({
    streak: 0,
    maxStreak: 0
  })
  const [configScreen, setConfigScreen] = useState(true)

  const animations = useRef<any[]>([])
  const gameTimeout = useRef<NodeJS.Timeout | null>(null)

  const random = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min)) + min
  }

  const generatePositions = useCallback(() => {
    const positions = []
    for (let i = 0; i < settings.numberCount; i++) {
      positions.push({
        top: random(10, CONTAINER_HEIGHT - BOX_SIZE - 10),
        left: random(10, CONTAINER_WIDTH - BOX_SIZE - 10)
      })
    }
    return positions
  }, [settings.numberCount])

  const startGame = useCallback(() => {
    // Clear any existing timeouts
    if (gameTimeout.current) clearTimeout(gameTimeout.current)
    animations.current.forEach(anim => anim?.pause())
    animations.current = []

    // Generate random numbers and positions
    const numbers = Array.from({ length: settings.numberCount }, (_, i) => i + 1)
      .sort(() => Math.random() - 0.5)

    const positions = generatePositions()

    // Shuffle colors for uniqueness
    const shuffledColors = [...colorClasses].sort(() => Math.random() - 0.5)
    const selectedColors = numbers.map((_, i) => shuffledColors[i % shuffledColors.length])

    setGameState({
      started: true,
      showingNumbers: true,
      gameOver: false,
      won: false,
      numbers,
      colors: selectedColors,
      currentNumber: 1,
      positions,
      clickedSquares: [],
      removedSquares: [], // <-- reset removedSquares
      showHelp: false
    })

    // Hide numbers after speed seconds
    gameTimeout.current = setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        showingNumbers: false
      }))
    }, settings.speed * 1000)

    setConfigScreen(false)
  }, [settings.numberCount, settings.speed, generatePositions])

  const handleSquareClick = (index: number) => {
    if (!gameState.started || gameState.showingNumbers || gameState.gameOver) return

    const clickedNumber = gameState.numbers[index]

    if (clickedNumber === gameState.currentNumber) {
      // Correct number clicked
      if (gameState.currentNumber === settings.numberCount) {
        setStats(prev => ({
          streak: prev.streak + 1,
          maxStreak: Math.max(prev.streak + 1, prev.maxStreak)
        }))
        setGameState(prev => ({
          ...prev,
          gameOver: true,
          won: true,
          clickedSquares: [...prev.clickedSquares, index],
          removedSquares: [...prev.removedSquares, index] // remove last box
        }))
      } else {
        setGameState(prev => ({
          ...prev,
          currentNumber: prev.currentNumber + 1,
          clickedSquares: [...prev.clickedSquares, index],
          removedSquares: [...prev.removedSquares, index] // remove this box
        }))
      }
    } else {
      setStats(prev => ({ ...prev, streak: 0 }))
      setGameState(prev => ({ ...prev, gameOver: true, won: false }))
    }
  }

  const toggleHelp = () => {
    setGameState(prev => ({ ...prev, showHelp: !prev.showHelp }))
  }

  useEffect(() => {
    // Start square animations when game starts
    if (gameState.started && !gameState.gameOver) {
      gameState.positions.forEach((_, index) => {
        const animate = () => {
          const square = document.getElementById(`square-${index}`)
          if (!square) return

          // Use same bounds as generatePositions
          const newTop = random(10, CONTAINER_HEIGHT - BOX_SIZE - 10)
          const newLeft = random(10, CONTAINER_WIDTH - BOX_SIZE - 10)
          const duration = random(1000, 4000)

          const animation = square.animate([
            { transform: `translate(0, 0)` },
            { transform: `translate(${newLeft - parseInt(square.style.left)}px, ${newTop - parseInt(square.style.top)}px)` }
          ], {
            duration,
            easing: 'linear'
          })

          animation.onfinish = () => {
            square.style.top = `${newTop}px`
            square.style.left = `${newLeft}px`
            if (!gameState.gameOver) animate()
          }

          animations.current[index] = animation
        }
        animate()
      })
    }

    return () => {
      animations.current.forEach(anim => anim?.pause())
    }
  }, [gameState.started, gameState.gameOver])

  // Show config screen if configScreen is true
  if (configScreen) {
    return (
      <div className="flex flex-col items-center mt-24 text-white p-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-6 flex flex-col items-center">
          <CircleUserRound className="w-16 h-16 mb-4" />
          <span className="text-3xl font-bold mb-2">VAR Simulation</span>
          <span className="text-lg mb-8 text-gray-400">Proof of Training Required</span>
          <div className="w-full">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Numbers: {settings.numberCount}</label>
                <Slider
                  value={[settings.numberCount]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, numberCount: value }))}
                  min={4}
                  max={15}
                  step={1}
                  className="bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Time: {settings.speed}s</label>
                <Slider
                  value={[settings.speed]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, speed: value }))}
                  min={2}
                  max={15}
                  step={1}
                  className="bg-gray-800"
                />
              </div>
            </div>
          </div>
          <Button
            size="lg"
            onClick={startGame}
            className="bg-[#2c465e] hover:bg-[#425e79] mt-6 w-full"
          >
            PLAY NOW
          </Button>
          <p className="text-sm mt-2">Press PLAY NOW to start</p>
        </div>
      </div>
    )
  }

  // Remove config controls from game screen
  return (
    <>
      <div className="flex flex-col items-center gap-6 p-4 text-white">
        {/* <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">VAR Simulation</h1>
          <Info
            onClick={toggleHelp}
            className="w-6 h-6 cursor-pointer hover:text-gray-300"
          />
        </div> */}

        {gameState.showHelp && (
          <Card className="w-full max-w-md p-4 bg-[#2c465e] text-white">
            <h2 className="text-xl font-bold mb-4">How to Play</h2>
            <p>Click squares in numerical order after numbers hide.</p>
            <p className="mt-2">Strategy Tips:</p>
            <ul className="list-disc pl-5">
              <li>Start at number 1</li>
              <li>Remember number and color combinations</li>
              <li>For 10 squares: Focus on first 5 numbers and color patterns</li>
              <li>Use visual and spatial memory</li>
            </ul>
          </Card>
        )}

        <div className="w-full max-w-sm p-4">
          {/* <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            <span>Streak: {stats.streak} | Max: {stats.maxStreak}</span>
          </div>
        </div> */}
        </div>

        <div className="relative w-[1436px] h-[765px] -mt-16 bg-[#20282e]">
          {!gameState.started ? (
            <div className="absolute inset-0 flex flex-col items-center text-center">
              <CircleUserRound className="w-16 h-16 mb-4" />
              <span className="text-2xl mb-2">Finger Print Not Recognized</span>
              <span className="text-lg mb-8 text-gray-400">Proof of Training Required</span>
              <Button
                size="lg"
                onClick={startGame}
                className="bg-[#2c465e] hover:bg-[#425e79]"
              >
                PLAY NOW
              </Button>
            </div>
          ) : (
            <>
              {gameState.positions.map((pos, index) => (
                // Only render if not removed
                !gameState.removedSquares.includes(index) && (
                  <button
                    key={index}
                    id={`square-${index}`}
                    onClick={() => handleSquareClick(index)}
                    className={cn(
                      "absolute w-24 h-24 text-4xl font-bold transition-colors",
                      "border border-white",
                      gameState.clickedSquares.includes(index)
                        ? 'bg-green-500 text-white'
                        : gameState.colors[index],
                      gameState.showingNumbers ? "text-white" : "text-transparent"
                    )}
                    style={{
                      top: pos.top,
                      left: pos.left
                    }}
                    disabled={gameState.showingNumbers || gameState.gameOver}
                  >
                    {gameState.numbers[index]}
                  </button>
                )
              ))}
            </>
          )}

          {gameState.gameOver && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
              {gameState.won && (
                <div className="text-4xl font-bold text-green-400">You Win!</div>
              )}
              {!gameState.won && (
                <div className="text-4xl font-bold text-red-400">You Lose!</div>
              )}
              <Button
                size="lg"
                onClick={() => {
                  setConfigScreen(true)
                  setGameState(prev => ({
                    ...prev,
                    started: false,
                    showingNumbers: false,
                    gameOver: false,
                    won: false,
                    numbers: [],
                    colors: [],
                    currentNumber: 1,
                    positions: [],
                    clickedSquares: [],
                    removedSquares: [], // <-- reset removedSquares
                    showHelp: false
                  }))
                }}
                className="bg-[#2c465e] hover:bg-[#425e79]"
              >
                PLAY AGAIN
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Restart Game button below the game screen */}
      {!configScreen && (
        <div className="flex flex-col items-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setConfigScreen(true)
              setGameState(prev => ({
                ...prev,
                started: false,
                showingNumbers: false,
                gameOver: false,
                numbers: [],
                colors: [],
                currentNumber: 1,
                positions: [],
                clickedSquares: [],
                removedSquares: [], // <-- reset removedSquares
                showHelp: false
              }))
            }}
            className="w-32 bg-red-500 hover:bg-red-500 hover:text-white hover:opacity-80 transition-all text-white"
          >
            Restart
          </Button>
        </div>
      )}
    </>
  )
}