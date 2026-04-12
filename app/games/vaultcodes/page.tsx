"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { cn } from "@/lib/utils"

export default function MemoryGame() {
  // Speed: how long the number is displayed (in seconds)
  const [displayDurationSeconds, setDisplayDurationSeconds] = useState(1.5) // Default 1.5 seconds
  // Numbers: how many digits the number has
  const [numDigits, setNumDigits] = useState(4) // Default 4 digits
  const [currentNumber, setCurrentNumber] = useState("")
  const [userInput, setUserInput] = useState("")
  const [gameState, setGameState] = useState("initial") // 'initial', 'displaying', 'inputting', 'feedback'
  const [message, setMessage] = useState("")

  const inputRef = useRef<HTMLInputElement>(null)
  const displayTimerRef = useRef<NodeJS.Timeout | null>(null)
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null)

  const generateRandomNumber = useCallback((digits: number) => {
    if (digits <= 0) return ""
    const min = Math.pow(10, digits - 1)
    const max = Math.pow(10, digits) - 1
    return String(Math.floor(Math.random() * (max - min + 1)) + min)
  }, [])

  const displayNextNumber = useCallback(() => {
    const newNumber = generateRandomNumber(numDigits)
    setCurrentNumber(newNumber)
    setUserInput("") // Clear previous input
    setMessage("") // Clear previous message
    setGameState("displaying")

    if (displayTimerRef.current) clearTimeout(displayTimerRef.current)

    displayTimerRef.current = setTimeout(() => {
      setGameState("inputting")
      // Focus the input field after the number disappears
      setTimeout(() => inputRef.current?.focus(), 50) // Small delay for animation to complete
    }, displayDurationSeconds * 1000) // Convert seconds to milliseconds
  }, [generateRandomNumber, numDigits, displayDurationSeconds])

  const handleSubmit = useCallback(() => {
    if (gameState !== "inputting") return

    if (userInput === currentNumber) {
      setMessage("Correct!")
    } else {
      setMessage(`Incorrect! The number was ${currentNumber}.`)
    }
    setGameState("feedback")

    if (messageTimerRef.current) clearTimeout(messageTimerRef.current)

    messageTimerRef.current = setTimeout(() => {
      setMessage("") // Clear message after a short delay
    }, 1500) // Show message for 1.5 seconds
  }, [userInput, currentNumber, gameState])

  const handleAction = useCallback(() => {
    if (gameState === "initial" || gameState === "feedback") {
      displayNextNumber()
    } else if (gameState === "inputting") {
      handleSubmit()
    }
  }, [gameState, displayNextNumber, handleSubmit])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && gameState === "inputting") {
        handleSubmit()
      }
    },
    [gameState, handleSubmit],
  )

  useEffect(() => {
    // Cleanup timers on component unmount
    return () => {
      if (displayTimerRef.current) clearTimeout(displayTimerRef.current)
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current)
    }
  }, [])

  const getButtonText = () => {
    if (gameState === "initial") return "START"
    if (gameState === "inputting") return "SUBMIT"
    if (gameState === "feedback") return "AGAIN!"
    return "..." // Should not happen
  }

  // Responsive dynamic width for the number box
  const getNumberBoxWidth = () => {
    // On mobile, use vw units for responsiveness
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      return `min(95vw, max(220px, ${numDigits * 7}vw))`
    }
    // On desktop, always reserve enough width for 15 digits (~60px per digit + padding)
    const maxDigits = 15
    const digitWidth = 60
    const padding = 80
    return Math.max(320, Math.min(numDigits * digitWidth + padding, maxDigits * digitWidth + padding))
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 p-2 sm:p-4 text-white transition-colors duration-500">
      {/* Logo / Title */}
      <div className="mb-6 sm:mb-8 flex flex-col items-center">
        <div className="rounded-full bg-gradient-to-tr from-blue-400 via-purple-400 to-pink-400 p-1 shadow-lg">
          <div className="flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-dark-bg-primary bg-opacity-80 backdrop-blur-md">
            <span className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg">🔢</span>
          </div>
        </div>
        <h1 className="mt-3 sm:mt-4 text-2xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-lg text-center">Number Memory</h1>
        <p className="mt-1 sm:mt-2 text-base sm:text-lg text-blue-200 font-medium opacity-80 text-center">How many digits can you remember?</p>
      </div>
      <div className="w-full max-w-full sm:max-w-5xl space-y-6 sm:space-y-8 px-1 sm:px-0">
        {/* Top Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 rounded-2xl bg-white/10 backdrop-blur-md p-3 sm:p-6 shadow-2xl border border-white/20">
          <div className="flex flex-1 items-center gap-2 sm:gap-3">
            <span className="text-base sm:text-lg font-semibold text-blue-200">Speed:</span>
            <Slider
              min={0.5}
              max={10}
              step={0.1}
              value={[displayDurationSeconds]}
              onValueChange={(val) => setDisplayDurationSeconds(val[0])}
              className="flex-1 accent-blue-400"
              disabled={gameState !== "initial" && gameState !== "feedback"}
            />
            <span className="text-base sm:text-lg font-semibold w-10 sm:w-12 text-right text-blue-100">{displayDurationSeconds.toFixed(1)}s</span>
          </div>
          <div className="flex flex-1 items-center gap-2 sm:gap-3 mt-2 sm:mt-0">
            <span className="text-base sm:text-lg font-semibold text-purple-200">Numbers:</span>
            <Slider
              min={1}
              max={15}
              step={1}
              value={[numDigits]}
              onValueChange={(val) => setNumDigits(val[0])}
              className="flex-1 accent-purple-400"
              disabled={gameState !== "initial" && gameState !== "feedback"}
            />
            <span className="text-base sm:text-lg font-semibold w-10 sm:w-12 text-right text-purple-100">{numDigits}</span>
          </div>
        </div>

        {/* Main Number Display / Input Area */}
        <div
          className="relative flex h-40 sm:h-72 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-lg shadow-2xl border border-white/20 transition-all duration-300 mx-auto"
          style={{
            minWidth: "0",
            width: typeof getNumberBoxWidth() === "string" ? getNumberBoxWidth() : `${getNumberBoxWidth()}px`,
            maxWidth: "100vw",
          }}
        >
          {gameState === "displaying" && (
            <span className="text-4xl sm:text-8xl font-extrabold text-white drop-shadow-2xl animate-fade-in-up tracking-widest select-none break-keep whitespace-nowrap px-2 w-full text-center">
              {currentNumber}
            </span>
          )}
          {(gameState === "inputting" || gameState === "feedback") && (
            <Input
              ref={inputRef}
              type="number"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter number"
              className="bg-white/20 text-white text-3xl sm:text-6xl text-center py-3 sm:py-5 rounded-xl border-2 border-blue-400/40 focus:border-pink-400 focus:ring-0 shadow-lg backdrop-blur-md transition-all duration-200 placeholder:text-blue-200 w-[95%] sm:w-[90%] mx-auto"
              style={{
                letterSpacing: "0.2em",
                minWidth: `${Math.max(120, numDigits * 36)}px`,
                maxWidth: "900px",
              }}
              disabled={gameState === "feedback"}
            />
          )}
          {message && (
            <p
              className={cn(
                "absolute bottom-3 sm:bottom-6 text-lg sm:text-2xl font-bold transition-opacity duration-300 drop-shadow-lg w-full text-center",
                message.includes("Correct") ? "text-green-300 animate-pulse" : "text-pink-300 animate-shake",
              )}
            >
              {message}
            </p>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleAction}
          className={cn(
            "w-full py-3 sm:py-5 text-xl sm:text-2xl font-extrabold rounded-xl shadow-xl transition-all duration-200 border-2 border-white/30",
            gameState === "displaying"
              ? "bg-gray-300/30 text-gray-200 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-white hover:from-pink-400 hover:to-blue-400 hover:scale-105"
          )}
          disabled={gameState === "displaying"}
        >
          {getButtonText()}
        </Button>
        <div className="flex justify-center pt-2">
          <span className="text-xs sm:text-sm text-blue-200/70">Made with ❤️ for memory training</span>
        </div>
      </div>
    </div>
  )
}
