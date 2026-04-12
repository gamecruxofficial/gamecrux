"use client"

import { useEffect, useState, useCallback } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"

export default function NumberGame() {
  const [grid, setGrid] = useState<number[][]>([])
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 })
  const [targetNumbers, setTargetNumbers] = useState<number[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [maxTime, setMaxTime] = useState(25)
  const [timeLeft, setTimeLeft] = useState(maxTime)
  const [gameActive, setGameActive] = useState(false)
  const [cellStates, setCellStates] = useState<{ [key: string]: string }>({})
  const [targetCount, setTargetCount] = useState(6)
  const [shuffleSpeed, setShuffleSpeed] = useState(5)
  const [configScreen, setConfigScreen] = useState(true)

  const generateGrid = useCallback(() => {
    const allNumbers = Array.from({ length: 96 }, (_, i) => {
      const num = i + 1
      return num < 10 ? `${num}` : `${num}`
    })

    for (let i = allNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]]
    }

    const grid = Array(6)
      .fill(0)
      .map((_, rowIndex) =>
        Array(16)
          .fill(0)
          .map((_, colIndex) => {
            return parseInt(allNumbers[rowIndex * 16 + colIndex])
          }),
      )

    return grid
  }, [])

  const generateTargetsAndGrid = useCallback(() => {
    const allNumbers = Array.from({ length: 96 }, (_, i) => {
      const num = i + 1
      return num < 10 ? `${num}` : `${num}`
    })
    const targets: number[] = []
    for (let i = 0; i < targetCount; i++) {
      const randomIndex = Math.floor(Math.random() * allNumbers.length)
      targets.push(parseInt(allNumbers.splice(randomIndex, 1)[0]))
    }

    const remainingNumbers = allNumbers.sort(() => Math.random() - 0.5)

    const grid = Array(6)
      .fill(0)
      .map(() => Array(16).fill(0))

    // Place target numbers randomly in the grid
    targets.forEach((target) => {
      let placed = false
      while (!placed) {
        const row = Math.floor(Math.random() * 6)
        const col = Math.floor(Math.random() * 16)
        if (grid[row][col] === 0) {
          grid[row][col] = target
          placed = true
        }
      }
    })

    // Fill the rest of the grid with remaining numbers
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 16; col++) {
        if (grid[row][col] === 0) {
          grid[row][col] = remainingNumbers.pop()
        }
      }
    }

    return { grid, targets }
  }, [targetCount])

  const startGame = useCallback(() => {
    const { grid, targets } = generateTargetsAndGrid()
    setGrid(grid)
    setTargetNumbers(targets)
    setTimeLeft(maxTime)
    setGameActive(true)
    setCellStates({})
    setCurrentIndex(0)
    setCurrentPos({ x: 0, y: 0 })
    setConfigScreen(false)
  }, [generateTargetsAndGrid, maxTime])

  useEffect(() => {
    setGrid(generateGrid())
  }, [generateGrid])

  useEffect(() => {
    if (!gameActive) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameActive(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameActive])

  useEffect(() => {
    if (!gameActive) return
    const shuffleInterval = setInterval(() => {
      setGrid((prevGrid) => {
        const newGrid = prevGrid.map((row) => [...row])
        const flatGrid = newGrid.flat()

        // Keep track of target numbers positions
        interface TargetPosition {
          num: number;
          idx: number;
        }

        const targetPositions: TargetPosition[] = []
        flatGrid.forEach((num, idx) => {
          if (targetNumbers.includes(Number(num))) {
            targetPositions.push({ num, idx })
          }
        })

        // Shuffle
        for (let i = flatGrid.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[flatGrid[i], flatGrid[j]] = [flatGrid[j], flatGrid[i]]
        }

        // Restore target numbers to their positions
        targetPositions.forEach(({ num, idx }) => {
          const currentIdx = flatGrid.findIndex((n) => n === num)
          ;[flatGrid[currentIdx], flatGrid[idx]] = [flatGrid[idx], flatGrid[currentIdx]]
        })

        // Convert back to 2D grid
        return Array(6)
          .fill(0)
          .map((_, i) => flatGrid.slice(i * 16, (i + 1) * 16))
      })
    }, shuffleSpeed * 1000)

    return () => clearInterval(shuffleInterval)
  }, [gameActive, shuffleSpeed, targetNumbers])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && !gameActive) {
        e.preventDefault()
        startGame()
        return
      }

      if (!gameActive) return

      switch (e.key.toLowerCase()) {
        case "w":
          setCurrentPos((prev) => ({
            ...prev,
            y: Math.max(0, prev.y - 1),
          }))
          break
        case "s":
          setCurrentPos((prev) => ({
            ...prev,
            y: Math.min(5, prev.y + 1),
          }))
          break
        case "a":
          setCurrentPos((prev) => ({
            ...prev,
            x: Math.max(0, prev.x - 1),
          }))
          break
        case "d":
          setCurrentPos((prev) => ({
            ...prev,
            x: Math.min(15, prev.x + 1),
          }))
          break
        case "enter":
          const selectedNumber = grid[currentPos.y][currentPos.x]
          const targetNum = targetNumbers[currentIndex]
          const isCorrect = selectedNumber === targetNum

          setCellStates((prev) => ({
            ...prev,
            [`${currentPos.y}-${currentPos.x}`]: isCorrect ? "correct" : "incorrect",
          }))

          if (isCorrect) {
            if (currentIndex < targetCount - 1) {
              setTimeout(() => {
                setCurrentIndex((prev) => prev + 1)
                setCellStates((prev) => {
                  const newState = { ...prev }
                  delete newState[`${currentPos.y}-${currentPos.x}`]
                  return newState
                })
              }, 500)
            } else {
              setGameActive(false)
            }
          } else {
            setTimeout(() => {
              setCellStates((prev) => {
                const newState = { ...prev }
                delete newState[`${currentPos.y}-${currentPos.x}`]
                return newState
              })
            }, 500)
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameActive, grid, currentPos, targetNumbers, currentIndex, targetCount, startGame])

  const getCellBackground = (y: number, x: number) => {
    const state = cellStates[`${y}-${x}`]
    if (state === "incorrect") return
    return currentPos.y === y && currentPos.x === x ? "text-white font-bold" : "text-gray-500 font-bold"
  }

  // Config screen
  if (configScreen) {
    return (
      <div className="flex flex-col items-center mt-24 text-white p-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-6 flex flex-col items-center">
          <span className="text-3xl font-bold mb-2">Enter Game</span>
          <span className="text-lg mb-8 text-gray-300">Find the numbers in order</span>
          <div className="mb-8 flex flex-col gap-4 w-full">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <span>Numbers: {targetCount}</span>
              </div>
              <Slider
                value={[targetCount]}
                onValueChange={(v) => setTargetCount(v[0])}
                min={5}
                max={10}
                step={1}
                className="bg-gray-700"
                disabled={false}
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <span>Time: {maxTime}</span>
              </div>
              <Slider
                value={[maxTime]}
                onValueChange={(v) => setMaxTime(v[0])}
                min={10}
                max={30}
                step={1}
                className="bg-gray-700"
                disabled={false}
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <span>Shuffle: {shuffleSpeed}</span>
              </div>
              <Slider
                value={[shuffleSpeed]}
                onValueChange={(v) => setShuffleSpeed(v[0])}
                min={3}
                max={10}
                step={1}
                className="bg-gray-700"
                disabled={false}
              />
            </div>
          </div>
          <Button
            size="lg"
            onClick={startGame}
            className="rounded-md bg-blue-500 hover:bg-blue-600 w-full"
          >Start Game</Button>
        </div>
      </div>
    )
  }

  // Game screen
  return (
    <>
      <div className="text-gray-300 p-8 font-poppins">
        <div className="max-w-xl mx-auto mt-24">
          {/* Target Numbers */}
          <div className="text-center mb-4">
            <div className="text-4xl font-bold flex justify-center gap-0">
              {targetNumbers.map((num, idx) => (
                <div key={idx} className="flex items-center">
                  <span className={idx < currentIndex ? "text-[#16d51f]" : "text-gray-500"}>
                    {num < 10 ? `0${num}` : num}
                  </span>
                  {idx < targetNumbers.length - 1 && (
                    <span className="text-gray-500 -mx-[px]">.</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {/* Timer Bar */}
          <div className="mb-2 flex justify-center w-full gap-[6px]">
            {Array.from({ length: 50 }).map((_, index) => (
              <div
                key={index}
                className={`h-4 w-1 transition-colors rotate-45 duration-100 ${
                  index < (timeLeft / maxTime) * 50 ? "bg-[#4dca56]" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
          {/* Grid */}
          <div className="max-w-[450px] mx-auto grid grid-cols-16 gap-y-3 mb-8 p-4">
            {grid.map((row, y) =>
              row.map((num, x) => (
                <div
                  key={`${y}-${x}`}
                  className={`text-center transition-colors duration-200 ${getCellBackground(y, x)}`}
                >
                  {num < 10 ? `0${num}` : num}
                </div>
              ))
            )}
          </div>
          {/* Controls */}
          <div className="text-center text-sm mb-4">
            <span className="text-green-500">W S A D</span> TO NAVIGATE <span className="text-green-500">ENTER</span> TO
            CONFIRM
          </div>
          {/* Game Status */}
          {!gameActive && (
            <div className="text-center">
              <p className="mb-4">Press SPACEBAR to start</p>
            </div>
          )}
        </div>
      </div>
      {/* Restart Game button below the game screen */}
      {!configScreen && (
        <div className="flex flex-col items-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setConfigScreen(true)}
            className="w-32 bg-red-500 hover:bg-red-500 hover:text-white hover:opacity-80 transition-all text-white"
          >
            Restart
          </Button>
        </div>
      )}
    </>
  )
}