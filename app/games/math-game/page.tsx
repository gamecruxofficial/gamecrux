"use client"

import { useState, useEffect, useRef } from "react"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"

export default function MathGame() {
  const [equation, setEquation] = useState("")
  const [answer, setAnswer] = useState("")
  const [timeLeft, setTimeLeft] = useState(30)
  const [initialTime, setInitialTime] = useState(30)
  const [maxStrikes, setMaxStrikes] = useState(3)
  const [gameStatus, setGameStatus] = useState<"waiting" | "playing" | "won" | "lost">("waiting")
  const [progress, setProgress] = useState(100)
  const inputRef = useRef<HTMLInputElement>(null)
  const correctAnswers = useRef(0)
  const strikes = useRef(0)

  // Generate a random equation
  const generateEquation = () => {
    const operators = ["+", "-"]
    const operator = operators[Math.floor(Math.random() * operators.length)]
    const num1 = Math.floor(Math.random() * 90) + 10 // 10-99
    const num2 = Math.floor(Math.random() * 90) + 10 // 10-99
    const equation = `${num1} ${operator} ${num2}`
    setEquation(equation)
    return equation
  }

  // Calculate the correct answer
  const calculateAnswer = (eq: string) => {
    return eval(eq).toString()
  }

  // Start the game
  const startGame = () => {
    setGameStatus("playing")
    setTimeLeft(initialTime)
    setProgress(100)
    correctAnswers.current = 0
    strikes.current = 0
    generateEquation()
    if (inputRef.current) inputRef.current.focus()
  }

  // Handle input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (answer === calculateAnswer(equation)) {
      correctAnswers.current++

      if (correctAnswers.current === 10) {
        setGameStatus("won")
      } else {
        generateEquation()
        setAnswer("")
      }
    } else {
      strikes.current++
      if (strikes.current >= maxStrikes) {
        setGameStatus("lost")
      } else {
        setAnswer("")
        generateEquation()
      }
    }
  }

  // Timer effect
  useEffect(() => {
    if (gameStatus !== "playing") return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          setGameStatus("lost")
          return 0
        }
        setProgress((prev - 1) * (100 / initialTime)) // Convert time to percentage
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStatus, initialTime])

  return (
    <div className="flex flex-col items-center mt-24">
      <div className="w-full max-w-md p-8 text-center text-white">
        {gameStatus === "waiting" && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-6 flex flex-col items-center">
            <h1 className="text-4xl font-bold mb-8">BYPASS THE SYSTEM</h1>
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-xl">Time Limit: {initialTime} seconds</h2>
                <Slider
                  defaultValue={[30]}
                  min={10}
                  max={60}
                  step={1}
                  onValueChange={(value) => setInitialTime(value[0])}
                  className="w-full"
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-xl">Maximum Strikes: {maxStrikes}</h2>
                <Slider
                  defaultValue={[3]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value) => setMaxStrikes(value[0])}
                  className="w-full"
                />
              </div>
              <button onClick={startGame} className="px-6 py-2 bg-white text-blue-900 rounded">
                Start Game
              </button>
            </div>
          </div>
        )}

        {gameStatus === "playing" && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-6 flex flex-col items-center">
            <h2 className="text-xl mb-8">SOLVE THE EQUATION</h2>
            <div className="text-4xl mb-8">{equation}</div>
            <form onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="number"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-32 text-center text-2xl p-2 bg-transparent border-b-2 border-white text-white mb-4 focus:outline-none"
                autoFocus
              />
              <div className="text-sm mb-4">PRESS ENTER TO SUBMIT</div>
              <div className="text-sm mb-8">
                Strikes: {strikes.current}/{maxStrikes} | Progress: {correctAnswers.current}/10
              </div>
            </form>
            <Progress value={progress} className="h-2" indicatorClassName="bg-cyan-400 transition-all duration-1000" />
          </div>
        )}

        {gameStatus === "won" && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-6 flex flex-col items-center">
            <h2 className="text-2xl mb-4">System Bypassed Successfully!</h2>
            <button onClick={startGame} className="px-6 py-2 bg-white text-blue-900 rounded">
              Play Again
            </button>
          </div>
        )}

        {gameStatus === "lost" && (
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-6 flex flex-col items-center">
            <h2 className="text-2xl mb-4">{timeLeft === 0 ? "Time's up!" : "Too many wrong answers!"}</h2>
            <div className="mb-4">You solved {correctAnswers.current}/10 equations</div>
            <button onClick={startGame} className="px-6 py-2 bg-white text-blue-900 rounded">
              Try Again
            </button>
          </div>
        )}
      </div>
      {gameStatus !== "waiting" && (
        <div className="flex flex-col items-center">
          <button
            onClick={() => setGameStatus("waiting")}
            className="w-32 bg-red-500 hover:opacity-80 transition-all text-white rounded py-2 font-bold"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  )
}

