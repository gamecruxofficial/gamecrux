"use client"

import { useState, useEffect, useCallback } from "react"
import { BotIcon as Robot } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface GameState {
  isPlaying: boolean
  score: number
  strikes: number
  maxStrikes: number
  target: number
  timeLeft: number
  maxTime: number
  currentInput: string | null
  dotPosition: { x: number; y: number }
  dotSize: number
  showLetter: boolean
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    score: 0,
    strikes: 0,
    maxStrikes: 3,
    target: 25,
    timeLeft: 60,
    maxTime: 60,
    currentInput: null,
    dotPosition: { x: 0, y: 0 },
    dotSize: 0,
    showLetter: false,
  })

  const LETTER_WIDTH = 60
  const LETTER_MARGIN = 20

  const generateRandomInput = () => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    return characters[Math.floor(Math.random() * characters.length)]
  }

  const generateDotPosition = useCallback(() => {
    const size = Math.floor(Math.random() * (30 - 10 + 1)) + 10
    return {
      x: LETTER_WIDTH + LETTER_MARGIN + Math.random() * (400 - LETTER_WIDTH - LETTER_MARGIN - size),
      y: Math.random() * (300 - size),
      size,
    }
  }, [])

  const spawnNewRound = useCallback(() => {
    const { x, y, size } = generateDotPosition()

    setGameState((prev) => ({
      ...prev,
      currentInput: null,
      dotPosition: { x, y },
      dotSize: size,
      showLetter: false,
    }))
  }, [generateDotPosition])

  const handleDotClick = () => {
    if (gameState.showLetter) return

    setGameState((prev) => ({
      ...prev,
      showLetter: true,
      currentInput: generateRandomInput(),
    }))
  }

  const handleMiss = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      strikes: prev.strikes + 1,
      showLetter: false,
    }))

    if (gameState.strikes + 1 >= gameState.maxStrikes) {
      setGameState((prev) => ({
        ...prev,
        isPlaying: false,
      }))
    } else {
      spawnNewRound()
    }
  }, [gameState.strikes, gameState.maxStrikes, spawnNewRound])

  const startGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isPlaying: true,
      score: 0,
      strikes: 0,
      timeLeft: prev.maxTime,
      currentInput: null,
      dotPosition: { x: 0, y: 0 },
      dotSize: 0,
      showLetter: false,
    }))
    spawnNewRound()
  }, [spawnNewRound])

  useEffect(() => {
    if (gameState.isPlaying) {
      const timer = setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }))
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameState.isPlaying])

  useEffect(() => {
    if (gameState.timeLeft <= 0) {
      setGameState((prev) => ({
        ...prev,
        isPlaying: false,
      }))
    }
  }, [gameState.timeLeft])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space" && !gameState.isPlaying) {
        event.preventDefault()
        startGame()
      } else if (gameState.isPlaying && gameState.showLetter && gameState.currentInput) {
        const pressedKey = event.key.toUpperCase()
        if (pressedKey === gameState.currentInput) {
          setGameState((prev) => ({
            ...prev,
            score: prev.score + 1,
          }))
          if (gameState.score + 1 >= gameState.target) {
            setGameState((prev) => ({
              ...prev,
              isPlaying: false,
            }))
          } else {
            spawnNewRound()
          }
        } else {
          handleMiss()
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)

    return () => {
      window.removeEventListener("keydown", handleKeyPress)
    }
  }, [
    gameState.isPlaying,
    gameState.showLetter,
    gameState.currentInput,
    gameState.score,
    gameState.target,
    spawnNewRound,
    handleMiss,
    startGame,
  ])

  if (!gameState.isPlaying) {
    return (
      <div className="flex flex-col items-center mt-24 text-white p-4">
        <Robot className="w-16 h-16 mb-6" />
        {/* <h1 className="text-2xl font-bold mb-4">MANUAL AUTHORIZATION REQUIRED!</h1> */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-80 mb-6 flex flex-col items-center">
          <div className="mb-4 w-full">
            <label className="block mb-2">Max Strikes:</label>
            <Slider
              value={[gameState.maxStrikes]}
              onValueChange={(value) => setGameState((prev) => ({ ...prev, maxStrikes: value[0] }))}
              max={5}
              min={1}
              step={1}
            />
            <span>{gameState.maxStrikes}</span>
          </div>
          <div className="mb-4 w-full">
            <label className="block mb-2">Time Limit (seconds):</label>
            <Slider
              value={[gameState.maxTime]}
              onValueChange={(value) => setGameState((prev) => ({ ...prev, maxTime: value[0] }))}
              max={120}
              min={30}
              step={10}
            />
            <span>{gameState.maxTime}</span>
          </div>
          <Button onClick={startGame} className="w-full text-white px-8 py-2 rounded hover:bg-gray-900 mb-4">
            Start Game
          </Button>
          <p className="text-sm text-gray-300">Press SPACEBAR to start</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center mt-24 text-white p-4">
      <div className="text-center mb-4">
        <p>
          STRIKES : {gameState.strikes}/{gameState.maxStrikes} | SCORE : {gameState.score} | TARGET : {gameState.target}
        </p>
        <p>TIME : {gameState.timeLeft} SECONDS</p>
      </div>
      <div className="relative w-[400px] h-[300px] bg-gray-900" onClick={handleMiss}>
        {gameState.showLetter && gameState.currentInput && (
          <div
            className="absolute text-green-500 text-8xl font-bold"
            style={{
              left: LETTER_MARGIN,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            {gameState.currentInput}
          </div>
        )}
        <button
          className="absolute rounded-full bg-pink-300 cursor-pointer"
          style={{
            left: gameState.dotPosition.x,
            top: gameState.dotPosition.y,
            width: gameState.dotSize,
            height: gameState.dotSize,
          }}
          onClick={(e) => {
            e.stopPropagation()
            handleDotClick()
          }}
        />
      </div>
      <Button
        onClick={() => setGameState((prev) => ({ ...prev, isPlaying: false }))}
        className="mt-4 bg-red-500 text-white px-8 py-2 rounded hover:bg-red-600"
      >
        END GAME
      </Button>
    </div>
  )
}

