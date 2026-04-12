"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { PHRASES } from "@/constants/constants"

function scrambleWord(word: string): string {
  if (word.length <= 1) return word

  const letters = word.split("")
  for (let i = letters.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[letters[i], letters[j]] = [letters[j], letters[i]]
  }

  const scrambled = letters.join("")
  return scrambled === word ? scrambleWord(word) : scrambled
}

function scramblePhrase(phrase: string): string {
  return phrase
    .split(" ")
    .map((word) => scrambleWord(word))
    .join(" ")
}

export default function Game() {
  const [gameStarted, setGameStarted] = useState(false)
  const [currentPhrase, setCurrentPhrase] = useState("")
  const [scrambledPhrase, setScrambledPhrase] = useState("")
  const [userInput, setUserInput] = useState("")
  const [gameOver, setGameOver] = useState(false)

  // Customizable parameters
  const [maxTime, setMaxTime] = useState(60)
  const [maxScore, setMaxScore] = useState(8)
  const [maxAttempts, setMaxAttempts] = useState(5)

  // Game state
  const [timeLeft, setTimeLeft] = useState(maxTime)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(maxAttempts)

  // Game timer
  useEffect(() => {
    if (gameStarted && !gameOver) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameOver(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [gameStarted, gameOver])

  const startGame = () => {
    const randomPhrase = PHRASES[Math.floor(Math.random() * PHRASES.length)]
    setCurrentPhrase(randomPhrase)
    setScrambledPhrase(scramblePhrase(randomPhrase))
    setTimeLeft(maxTime)
    setAttempts(maxAttempts)
    setScore(0)
    setGameOver(false)
    setUserInput("")
    setGameStarted(true)
  }

  const checkAnswer = () => {
    if (userInput.toUpperCase() === currentPhrase) {
      setScore((prev) => prev + 1)
      if (score + 1 >= maxScore) {
        setGameOver(true)
      }
    } else {
      setAttempts((prev) => {
        if (prev <= 1) setGameOver(true)
        return prev - 1
      })
    }
    const newPhrase = PHRASES[Math.floor(Math.random() * PHRASES.length)]
    setCurrentPhrase(newPhrase)
    setScrambledPhrase(scramblePhrase(newPhrase))
    setUserInput("")
  }

  const GameSettings = () => (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-6 flex flex-col items-center">
      <h1 className="text-white text-3xl mb-8 font-mono">WORD SCRAMBLE GAME</h1>
      {gameOver && (
        <div className="text-white text-xl mb-8 font-mono text-center">
          <p>Game Over!</p>
          <p>
            Final Score: {score}/{maxScore}
          </p>
        </div>
      )}
      <div className="w-full space-y-6 font-mono">
        <div className="space-y-2">
          <label htmlFor="timeSlider" className="text-white">
            Time (seconds): {maxTime}
          </label>
          <Slider
            id="timeSlider"
            value={[maxTime]}
            onValueChange={(value) => setMaxTime(value[0])}
            min={30}
            max={180}
            step={10}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="scoreSlider" className="text-white">
            Score to win: {maxScore}
          </label>
          <Slider
            id="scoreSlider"
            value={[maxScore]}
            onValueChange={(value) => setMaxScore(value[0])}
            min={1}
            max={20}
            step={1}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="attemptsSlider" className="text-white">
            Attempts: {maxAttempts}
          </label>
          <Slider
            id="attemptsSlider"
            value={[maxAttempts]}
            onValueChange={(value) => setMaxAttempts(value[0])}
            min={1}
            max={10}
            step={1}
          />
        </div>
        <button
          onClick={startGame}
          className="w-full text-white border border-white/20 px-8 py-2 rounded hover:bg-white/10 transition-colors font-mono mt-4"
        >
          {gameStarted ? "Play Again" : "Start Game"}
        </button>
      </div>
    </div>
  )

  if (!gameStarted || gameOver) {
    return (
      <div className="flex flex-col items-center mt-24 p-4">
        <GameSettings />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center mt-24 p-4">
      <div className="w-full max-w-2xl space-y-6 font-mono bg-gray-800 rounded-lg shadow-lg p-12">
        <div className="text-center space-y-2">
          <h2 className="text-white text-2xl tracking-wide">PHRASE:</h2>
          <p className="text-white text-4xl font-bold tracking-[0.2em] leading-relaxed">{scrambledPhrase}</p>
        </div>

        <div className="text-white text-xl text-center tracking-wide">
          ATTEMPTS : {attempts}/{maxAttempts}
        </div>

        <div className="text-center">
          <label htmlFor="answerInput" className="text-white text-xl mb-2 tracking-wide">
            ANSWER
          </label>
          <Input
            id="answerInput"
            className="bg-gray-800 text-white border-white/20 text-center text-xl tracking-wide font-mono"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && checkAnswer()}
            autoFocus
          />
        </div>

        <div className="text-white text-xl text-center tracking-wide">
          TIME : {timeLeft} SECONDS | SCORE : {score}/{maxScore}
        </div>

      </div>
      {gameStarted && !gameOver && (
        <div className="flex flex-col items-center mt-8">
          <button
            onClick={() => {
              setGameStarted(false)
              setGameOver(false)
              setScore(0)
              setAttempts(maxAttempts)
              setTimeLeft(maxTime)
              setUserInput("")
            }}
            className="w-32 bg-red-500 hover:opacity-80 transition-all text-white rounded py-2 font-bold"
          >
            Restart
          </button>
        </div>
      )}
    </div>
  )
}

