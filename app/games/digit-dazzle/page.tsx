"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils" // Assuming cn utility is available

const DIGITS = "0123456789"
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const PATTERN_LENGTH = 4

export default function DigitDazzle() {
  const [mode, setMode] = useState<"digits" | "letters">("digits")
  const [answer, setAnswer] = useState<string[]>([])
  const [guess, setGuess] = useState<string[]>(Array(PATTERN_LENGTH).fill(""))
  const [result, setResult] = useState<boolean[]>(Array(PATTERN_LENGTH).fill(false))
  const [gameWon, setGameWon] = useState(false)

  // Timer states
  const [timerDuration, setTimerDuration] = useState(60) // Default to 60 seconds
  const [timeLeft, setTimeLeft] = useState(timerDuration)
  const [timerRunning, setTimerRunning] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null) // Ref for the interval ID

  // Create an array of refs for the input elements
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Effect to generate pattern when mode or timerDuration changes
  useEffect(() => {
    generatePattern()
  }, [mode, timerDuration])

  // Effect for the countdown timer
  useEffect(() => {
    if (timerRunning && timeLeft > 0 && !gameWon) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1)
      }, 1000)
    } else if (timeLeft === 0 || gameWon) {
      clearInterval(timerRef.current!)
      setTimerRunning(false)
    }
    return () => clearInterval(timerRef.current!) // Cleanup on unmount or re-render
  }, [timerRunning, timeLeft, gameWon])

  const generatePattern = () => {
    const pool = mode === "digits" ? DIGITS : LETTERS
    const newAnswer = Array.from({ length: PATTERN_LENGTH }, () => pool[Math.floor(Math.random() * pool.length)])
    setAnswer(newAnswer)
    setGuess(Array(PATTERN_LENGTH).fill(""))
    setResult(Array(PATTERN_LENGTH).fill(false))
    setGameWon(false)
    setTimeLeft(timerDuration) // Reset timer to current duration
    setTimerRunning(false) // Stop timer
    // Focus the first input field on new game
    setTimeout(() => inputRefs.current[0]?.focus(), 0)
  }

  const startGame = () => {
    setTimerRunning(true)
  }

  const checkAnswer = () => {
    const newResult = guess.map((char, index) => char === answer[index])
    setResult(newResult)
    const won = newResult.every((r) => r)
    setGameWon(won)
    if (won) {
      setTimerRunning(false) // Stop timer if won
    }
  }

  const handleInput = (index: number, value: string) => {
    const pool = mode === "digits" ? DIGITS : LETTERS
    const upperValue = value.toUpperCase()

    // Only allow valid characters from the pool
    if (upperValue.length > 0 && !pool.includes(upperValue)) {
      return
    }

    const newGuess = [...guess]
    newGuess[index] = upperValue.length > 0 ? upperValue[0] : "" // Take only the first character if multiple are pasted
    setGuess(newGuess)

    // Auto-focus next input if a character was entered and it's not the last box
    if (upperValue.length > 0 && index < PATTERN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    } else if (upperValue.length > 0 && index === PATTERN_LENGTH - 1 && newGuess.every((char) => char !== "")) {
      // If it's the last box and all boxes are filled, check the answer
      checkAnswer()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (guess[index] === "" && index > 0) {
        // If current box is empty, move to previous and clear it
        const newGuess = [...guess]
        newGuess[index - 1] = ""
        setGuess(newGuess)
        inputRefs.current[index - 1]?.focus()
      } else {
        // Clear current box
        const newGuess = [...guess]
        newGuess[index] = ""
        setGuess(newGuess)
      }
      e.preventDefault() // Prevent default backspace behavior (e.g., navigating back in browser)
    } else if (e.key === "ArrowLeft") {
      if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    } else if (e.key === "ArrowRight") {
      if (index < PATTERN_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const isGameOver = gameWon || timeLeft === 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex flex-col items-center justify-center p-4 space-y-8 font-mono">
      <div className="flex flex-col items-center space-y-4 w-full max-w-md">
        <h1 className="text-5xl font-extrabold text-purple-400 drop-shadow-lg">
          DIGIT<span className="text-white">DAZZLE</span>
        </h1>
        <p className="text-gray-300 text-lg text-center">
          Crack the code! {mode === "digits" ? "Numbers 0-9" : "Letters A-Z"}.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 w-full max-w-md">
        <Button
          onClick={() => setMode(mode === "digits" ? "letters" : "digits")}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          disabled={timerRunning && timeLeft > 0}
        >
          Switch to {mode === "digits" ? "Letters" : "Digits"}
        </Button>
        <Button
          onClick={generatePattern}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          Restart Game
        </Button>
        <Button
          onClick={startGame}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105"
          disabled={timerRunning}
        >
          Start Game
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <label htmlFor="timer-input" className="text-gray-300 text-lg">
          Time Limit (seconds):
        </label>
        <input
          id="timer-input"
          type="number"
          min="10" // Minimum time limit
          max="300" // Maximum time limit
          value={timerDuration}
          onChange={(e) => setTimerDuration(Number(e.target.value))}
          className="w-24 h-10 text-center text-lg font-bold rounded-md border-2 bg-gray-800 border-gray-600 text-white outline-none focus:border-purple-500"
          disabled={timerRunning && timeLeft > 0} // Disable input during active game
        />
      </div>

      <div className="text-4xl font-bold text-yellow-400">Time Left: {timeLeft}s</div>

      {gameWon && <div className="text-green-400 text-3xl font-bold animate-bounce">CODE CRACKED! 🎉</div>}
      {timeLeft === 0 && !gameWon && <div className="text-red-400 text-3xl font-bold animate-pulse">TIME&apos;S UP! ⏱️</div>}

      <div className="flex space-x-4 mt-8">
        {Array.from({ length: PATTERN_LENGTH }).map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            maxLength={1}
            value={guess[index]}
            onChange={(e) => handleInput(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className={cn(
              `w-36 h-36 text-center text-6xl font-bold rounded-3xl border-4 outline-none transition-all duration-300
              bg-gray-800 text-white caret-transparent`,
              isGameOver
                ? gameWon
                  ? "bg-green-600 border-green-600 shadow-green-glow"
                  : "bg-red-600 border-red-600"
                : result[index]
                  ? "bg-green-500 border-green-500 shadow-md"
                  : "border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500",
              "placeholder-gray-500",
            )}
            placeholder={mode === "digits" ? "0" : "A"}
            disabled={isGameOver}
          />
        ))}
      </div>

      <Button
        onClick={checkAnswer}
        className="bg-purple-600 hover:bg-purple-700 w-48 py-4 text-xl font-bold rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 mt-8"
        disabled={isGameOver || guess.some((char) => char === "")} // Disable if game over or not all fields filled
      >
        CRACK
      </Button>

      <style jsx global>{`
        @keyframes green-glow {
          0% {
            box-shadow: 0 0 5px rgba(74, 222, 128, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(74, 222, 128, 0.8);
          }
          100% {
            box-shadow: 0 0 5px rgba(74, 222, 128, 0.5);
          }
        }
        .shadow-green-glow {
          animation: green-glow 1.5s infinite alternate;
        }
      `}</style>
    </div>
  )
}
