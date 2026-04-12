"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Timer, Star, XCircle } from "lucide-react"
import { useCallback } from "react"

// Types and utilities
interface CardData {
  id: number
  icon: string
}

const ICONS = ["💻", "🎮", "⭐", "🐛", "🎯", "🚀", "🎨", "🔥", "💎", "🌟", "🎵", "⚡", "💡", "🤖", "🎉"]

// Fixed generic function syntax for Next.js
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const generateGameBoard = (): CardData[] => {
  const totalCards = 24 // 6x4 grid
  const pairs = totalCards / 2

  // Select random icons for pairs
  const selectedIcons = ICONS.slice(0, pairs)

  // Create pairs of cards
  const cards: CardData[] = []
  selectedIcons.forEach((icon, index) => {
    cards.push({ id: index * 2, icon })
    cards.push({ id: index * 2 + 1, icon })
  })

  // Shuffle the cards
  return shuffleArray(cards)
}

// GameCard component
interface GameCardProps {
  card: CardData
  isFlipped: boolean
  isMatched: boolean
  isRed: boolean
  onClick: () => void
}

const GameCard = ({ card, isFlipped, isMatched, isRed, onClick }: GameCardProps) => {
  const cardBaseClasses =
    "absolute w-full h-full rounded-xl border-2 flex items-center justify-center font-bold backface-hidden transition-all duration-500 shadow-lg"

  const getFrontColor = () => {
    if (isMatched)
      return "bg-gradient-to-br from-emerald-500 to-green-600 border-emerald-400 text-white shadow-emerald-500/25"
    if (isRed) return "bg-gradient-to-br from-red-500 to-red-600 border-red-400 text-white shadow-red-500/25"
    return "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 text-white shadow-slate-500/25"
  }

  const backColor =
    "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 hover:border-blue-400 text-slate-400 hover:shadow-blue-500/20 hover:scale-105"

  return (
    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 cursor-pointer group perspective" onClick={onClick}>
      <div
        className={`relative w-full h-full preserve-3d transition-transform duration-700 ease-out ${isFlipped ? "rotate-y-180" : ""}`}
      >
        {/* Back Face */}
        <div className={`${cardBaseClasses} ${backColor}`}>
          <span className="text-3xl sm:text-4xl lg:text-5xl opacity-70 group-hover:opacity-100 transition-opacity">
            ?
          </span>
        </div>
        {/* Front Face */}
        <div className={`${cardBaseClasses} ${getFrontColor()} rotate-y-180`}>
          <span className="text-xl sm:text-2xl lg:text-3xl">{card.icon}</span>
        </div>
      </div>
    </div>
  )
}

// Main component
export default function MemoryGame() {
  const [cards, setCards] = useState<CardData[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [matchedCards, setMatchedCards] = useState<number[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [timeLimit, setTimeLimit] = useState(5) // Default 5 minutes
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)


  const initializeGame = useCallback(() => {
    const newCards = generateGameBoard()
    setCards(newCards)
    setFlippedCards([])
    setMatchedCards([])
    setIsProcessing(false)
    setGameStarted(false)
    setGameOver(false)
    setTimeRemaining(timeLimit * 60) // Convert minutes to seconds
  }, [timeLimit])

  useEffect(() => {
    initializeGame()
  }, [initializeGame])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (gameStarted && timeRemaining > 0 && !gameOver) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setGameOver(true)
            setGameStarted(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [gameStarted, timeRemaining, gameOver])

  // Removed duplicate initializeGame function to avoid redeclaration error

  const startGame = () => {
    setGameStarted(true)
    setTimeRemaining(timeLimit * 60)
    setGameOver(false)
  }

  const handleCardClick = (index: number) => {
    // Don't allow clicks if game is over, not started, during processing, or if card is already matched
    if (gameOver || !gameStarted || isProcessing || matchedCards.includes(index) || flippedCards.includes(index)) {
      return
    }

    // Don't allow more than 3 cards to be flipped (excluding matched cards)
    const currentlyFlipped = flippedCards.filter((cardIndex) => !matchedCards.includes(cardIndex))
    if (currentlyFlipped.length >= 3) {
      return
    }

    const newFlippedCards = [...flippedCards, index]
    setFlippedCards(newFlippedCards)

    // Check for matches when we have flipped cards
    const activeFlipped = newFlippedCards.filter((cardIndex) => !matchedCards.includes(cardIndex))
    if (activeFlipped.length >= 2) {
      setIsProcessing(true)

      setTimeout(() => {
        checkForMatches(newFlippedCards)
      }, 500) // Reduced delay for quicker check
    }
  }

  const checkForMatches = (currentFlipped: number[]) => {
    const activeFlipped = currentFlipped.filter((cardIndex) => !matchedCards.includes(cardIndex))
    const matches: number[] = []
    const nonMatches: number[] = []

    // Check each flipped card against others
    activeFlipped.forEach((cardIndex, i) => {
      const card = cards[cardIndex]
      let foundMatch = false

      // Look for matching pairs
      activeFlipped.forEach((otherIndex, j) => {
        if (i !== j && cards[otherIndex].icon === card.icon && !matches.includes(cardIndex)) {
          matches.push(cardIndex, otherIndex)
          foundMatch = true
        }
      })

      if (!foundMatch && !matches.includes(cardIndex)) {
        nonMatches.push(cardIndex)
      }
    })

    // Update matched cards
    if (matches.length > 0) {
      setMatchedCards((prev) => [...prev, ...matches])
    }

    // Remove non-matching cards from flipped after red highlight
    setTimeout(() => {
      setFlippedCards((prev) => prev.filter((index) => matchedCards.includes(index) || matches.includes(index)))
      setIsProcessing(false)
    }, 500) // Card visibility time reduced to 0.5 second
  }

  const isCardFlipped = (index: number) => {
    return flippedCards.includes(index) || matchedCards.includes(index)
  }

  const isCardMatched = (index: number) => {
    return matchedCards.includes(index)
  }

  const isCardRed = (index: number) => {
    return flippedCards.includes(index) && !matchedCards.includes(index) && isProcessing
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const currentlyFlippedCount = flippedCards.filter((index) => !matchedCards.includes(index)).length
  const isGameWon = matchedCards.length > 0 && matchedCards.length === cards.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-2 sm:p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-4">
            Memory Matrix
          </h1>
          <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto">
            Test your memory with this beautiful card matching game
          </p>
        </div>

        <div className="flex flex-col items-center gap-6 sm:gap-8">
          <Card className="w-full max-w-lg bg-slate-900/80 backdrop-blur-sm border-slate-700/50 shadow-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Game Controls
              </CardTitle>
              {gameStarted && (
                <CardDescription className="text-slate-300 flex items-center justify-center gap-2 pt-2 text-lg">
                  <Timer className="w-5 h-5 text-blue-400" />
                  <span className="font-mono text-blue-400">{formatTime(timeRemaining)}</span>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              {!gameStarted && !gameOver && (
                <>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="timeLimit" className="text-white text-lg">
                      Time Limit:
                    </Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="1"
                      max="60"
                      value={timeLimit}
                      onChange={(e) => setTimeLimit(Number(e.target.value))}
                      disabled={gameStarted}
                      className="w-20 bg-slate-800/80 text-white border-slate-600 focus:border-blue-400 text-center"
                    />
                    <span className="text-slate-400">minutes</span>
                  </div>
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 text-lg shadow-lg hover:shadow-green-500/25 transition-all duration-300"
                  >
                    Start Game
                  </Button>
                </>
              )}

              {(gameOver || isGameWon) && (
                <Alert
                  variant={isGameWon ? "default" : "destructive"}
                  className={`text-white border-2 ${isGameWon ? "bg-green-500/20 border-green-500/50" : "bg-red-500/20 border-red-500/50"}`}
                >
                  {isGameWon ? (
                    <Star className="h-5 w-5 text-green-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400" />
                  )}
                  <AlertTitle className={`text-xl ${isGameWon ? "text-green-400" : "text-red-400"}`}>
                    {isGameWon ? "🎉 Congratulations! You Won!" : "⏰ Time's Up!"}
                  </AlertTitle>
                  <AlertDescription className="text-slate-300 text-lg">
                    {isGameWon ? "You've matched all the cards perfectly!" : "Better luck next time. Keep practicing!"}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          <div className="md:w-[800px] w-full bg-slate-900/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-4 sm:p-4 shadow-2xl">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4 lg:gap-3 justify-items-center">
              {cards.map((card, index) => (
                <GameCard
                  key={index}
                  card={card}
                  isFlipped={isCardFlipped(index)}
                  isMatched={isCardMatched(index)}
                  isRed={isCardRed(index)}
                  onClick={() => handleCardClick(index)}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-4 sm:gap-6">
            <div className="text-white text-center bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 px-6 py-3 rounded-xl shadow-lg">
              <p className="text-lg font-semibold">
                <span className="text-blue-400">Flipped:</span> {currentlyFlippedCount}/3
              </p>
            </div>
            <div className="text-white text-center bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 px-6 py-3 rounded-xl shadow-lg">
              <p className="text-lg font-semibold">
                <span className="text-purple-400">Matched:</span> {matchedCards.length / 2} / {cards.length / 2}
              </p>
            </div>
            <Button
              onClick={initializeGame}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:border-slate-500 bg-slate-900/80 backdrop-blur-sm px-6 py-3 text-lg font-semibold transition-all duration-300"
            >
              New Game
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
