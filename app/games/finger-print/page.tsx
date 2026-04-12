"use client"

import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface GameState {
  status: "intro" | "playing" | "success" | "failed"
  message: string
}

interface Time {
  min: number
  sec: number
  ms: number
}

interface MatchPopup {
  show: boolean
  digit: number | null
}

export default function FingerprintHack() {
  // Game state hooks remain the same
  const [gameState, setGameState] = useState<GameState>({ status: "intro", message: "" })
  const [time, setTime] = useState<Time>({ min: 3, sec: 37, ms: 44 })
  const [attempts, setAttempts] = useState(6)
  const [scrambleProgress, setScrambleProgress] = useState(31)
  const [matchPopup, setMatchPopup] = useState<MatchPopup>({ show: false, digit: null })
  const [pattern, setPattern] = useState<number[]>([])
  const [displayPattern, setDisplayPattern] = useState<number[]>([])
  const [selectedNodes, setSelectedNodes] = useState<number[]>([])
  const [incorrectNodes, setIncorrectNodes] = useState<number[]>([])
  const [currentColumn, setCurrentColumn] = useState(0)
  const [patternPhase, setPatternPhase] = useState<"none" | "showing" | "input">("none")
  const [patternBlink, setPatternBlink] = useState(false)
  const [solution] = useState(() => {
    const digits = Array.from({ length: 9 }, (_, i) => i + 1)
    return [...digits, 0].sort(() => Math.random() - 0.5).slice(0, 4)
  })
  const [sequence, setSequence] = useState<number[]>([])
  const [matchedDigits, setMatchedDigits] = useState<number[]>([])
  const keypadSymbols = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"]

  // Track current selected row for keyboard navigation
  const [selectedRow, setSelectedRow] = useState(0)

  // All game logic functions remain exactly the same
  const resetGame = useCallback(() => {
    setSelectedNodes([])
    setIncorrectNodes([])
    setCurrentColumn(0)
    setPatternPhase("none")
    setPatternBlink(false)
    setScrambleProgress(31)
  }, [])

  const generatePattern = useCallback(() => {
    return Array(6)
      .fill(0)
      .map((_, col) => {
        const row = Math.floor(Math.random() * 6)
        return row * 6 + col + 1
      })
  }, [])

  const startNewPattern = useCallback(async () => {
    const finalPattern = generatePattern()
    setPattern(finalPattern)
    setPatternPhase("showing")

    for (let i = 0; i < 3; i++) {
      setDisplayPattern(generatePattern())
      setPatternBlink(true)
      await new Promise((r) => setTimeout(r, 500))
      setPatternBlink(false)
      await new Promise((r) => setTimeout(r, 500))
    }

    for (let i = 0; i < 2; i++) {
      setDisplayPattern(finalPattern)
      setPatternBlink(true)
      await new Promise((r) => setTimeout(r, 750))
      setPatternBlink(false)
      await new Promise((r) => setTimeout(r, 500))
    }

    setPatternPhase("input")
  }, [generatePattern])

  const handleNodeClick = useCallback(
    (value: number) => {
      if (gameState.status !== "playing" || patternPhase !== "input") return

      const clickedColumn = (value - 1) % 6
      if (clickedColumn !== currentColumn) return

      const expectedNode = pattern[clickedColumn]

      if (value === expectedNode) {
        setSelectedNodes((prev) => [...prev, value])

        if (clickedColumn === 5) {
          const availableDigits = solution.filter((d) => !matchedDigits.includes(d))
          if (availableDigits.length > 0) {
            const newDigit = availableDigits[0]
            setMatchPopup({ show: true, digit: newDigit })

            setSequence((prev) => {
              const newSequence = [...prev, newDigit]
              if (newSequence.length === 4) {
                if (newSequence.join("") === solution.join("")) {
                  setGameState({ status: "success", message: "ACCESS GRANTED" })
                }
              }
              return newSequence
            })

            setTimeout(() => {
              setMatchedDigits((prev) => [...prev, newDigit])
              resetGame()
              setMatchPopup({ show: false, digit: null })
            }, 2000)
          }
        } else {
          setCurrentColumn((prev) => prev + 1)
        }
      } else {
        setIncorrectNodes((prev) => [...prev, value])
        setAttempts((prev) => {
          const newAttempts = prev - 1
          if (newAttempts <= 0) {
            setGameState({ status: "failed", message: "ACCESS DENIED" })
            resetGame()
          }
          return newAttempts
        })
        setTimeout(() => {
          setIncorrectNodes((prev) => prev.filter((node) => node !== value))
        }, 500)
      }
    },
    [gameState.status, patternPhase, currentColumn, pattern, matchedDigits, solution, resetGame],
  )

  useEffect(() => {
    if (gameState.status !== "playing") return

    const timer = setInterval(() => {
      setTime((prev) => {
        if (prev.ms > 0) {
          return { ...prev, ms: prev.ms - 1 }
        } else if (prev.sec > 0) {
          return { ...prev, sec: prev.sec - 1, ms: 99 }
        } else if (prev.min > 0) {
          return { min: prev.min - 1, sec: 59, ms: 99 }
        } else {
          setGameState({ status: "failed", message: "TIME EXPIRED" })
          return prev
        }
      })
    }, 10)

    return () => clearInterval(timer)
  }, [gameState.status])

  useEffect(() => {
    if (gameState.status !== "playing" || patternPhase !== "input") return

    const scrambleTimer = setInterval(() => {
      setScrambleProgress((prev) => {
        if (prev <= 0) {
          setGameState({ status: "failed", message: "ACCESS DENIED" })
          resetGame()
          return 31
        }
        return prev - 0.5
      })
    }, 1000)

    return () => clearInterval(scrambleTimer)
  }, [gameState.status, patternPhase, resetGame])

  useEffect(() => {
    if (gameState.status !== "playing") return

    if (scrambleProgress === 31 && patternPhase === "none") {
      startNewPattern()
    }
  }, [scrambleProgress, gameState.status, patternPhase, startNewPattern])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && gameState.status !== "playing") {
        e.preventDefault()
        setGameState({ status: "playing", message: "" })
        setAttempts(6)
        setScrambleProgress(31)
        setSequence([])
        setMatchedDigits([])
        resetGame()
        startNewPattern()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameState.status, resetGame, startNewPattern])

  // Update selectedRow when column changes or game resets
  useEffect(() => {
    setSelectedRow(0)
  }, [currentColumn, gameState.status, patternPhase])

  // Keyboard navigation for grid (one button per column/row)
  useEffect(() => {
    if (gameState.status !== "playing" || patternPhase !== "input") return

    const handleGridKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== "playing" || patternPhase !== "input") return

      let col = currentColumn
      let row = selectedRow

      if ((e.key === "ArrowRight" || e.key.toLowerCase() === "d") && col < 5) {
        // Check if current column has a selected node
        const hasSelectedInColumn = selectedNodes.some((node) => (node - 1) % 6 === col)
        if (hasSelectedInColumn) {
          setCurrentColumn(col + 1)
          setSelectedRow(0)
        }
      }
      // Disable left movement to prevent going back
      if ((e.key === "ArrowUp" || e.key.toLowerCase() === "w") && row > 0) {
        setSelectedRow(row - 1)
      }
      if ((e.key === "ArrowDown" || e.key.toLowerCase() === "s") && row < 5) {
        setSelectedRow(row + 1)
      }
      if (e.key === "Enter") {
        // Simulate click on the selected tile
        const nodeNumber = row * 6 + col + 1
        handleNodeClick(nodeNumber)
      }
    }

    window.addEventListener("keydown", handleGridKeyDown)
    return () => window.removeEventListener("keydown", handleGridKeyDown)
  }, [gameState.status, patternPhase, currentColumn, selectedRow, selectedNodes, handleNodeClick])

  const restartGame = () => {
    setGameState({ status: "intro", message: "" })
    setTime({ min: 3, sec: 37, ms: 44 })
    setAttempts(6)
    setScrambleProgress(31)
    setSequence([])
    setMatchedDigits([])
    resetGame()
  }

  return (
    <div className=" bg-black text-white flex flex-col items-center justify-center font-mono">
      <div className="w-[1150px] h-[750px] relative border border-[#222] p-4">
        {/* Top Section */}
        <div className="grid grid-cols-2 gap-8 mb-2">
          {/* Timer Display */}
          <div className="border border-[#222]">
            <div className="border-b border-[#222] px-4 py-1">
              <span className="text-xs tracking-wider">CONNECTION TIMEOUT</span>
            </div>
            <div className="p-2">
              <div className="text-3xl text-red-500 tracking-wider">
                {String(time.min).padStart(2, "0")}:{String(time.sec).padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* Attempts Display */}
          <div className="border border-[#222]">
            <div className="border-b border-[#222] px-4 py-1">
              <span className="text-xs tracking-wider">ACCESS ATTEMPTS</span>
            </div>
            <div className="p-2">
              <div className="flex gap-2">
                {Array(6)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className={`h-8 w-8 border ${i < attempts ? "bg-red-600" : "border-[#222]"}`} />
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-[1fr_350px] gap-8 h-[635px] overflow-hidden">
          {/* Signal Repeater Section */}
          <div className="border border-[#222] relative overflow-hidden">
            <div className="border-b border-[#222] px-4 py-1">
              <span className="text-xs tracking-wider">SIGNAL REPEATER</span>
            </div>

            {/* Grid Container */}
            <div className="p-8 h-[calc(100%-2rem)] overflow-hidden">
              <div
                className="grid grid-cols-6 h-full relative -mt-8"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              >
                {Array(36)
                  .fill(null)
                  .map((_, i) => {
                    const nodeNumber = i + 1
                    const nodeColumn = (nodeNumber - 1) % 6
                    const nodeRow = Math.floor((nodeNumber - 1) / 6)
                    const isActive = nodeColumn === currentColumn
                    const isSelectedRow = nodeRow === selectedRow && isActive
                    const isPatternNode = displayPattern.includes(nodeNumber)
                    const isSelected = selectedNodes.includes(nodeNumber)
                    const isIncorrect = incorrectNodes.includes(nodeNumber)

                    return (
                      <button
                        key={i}
                        onClick={() => {
                          // Only allow click if this is the selected node in current column/row
                          if (isSelectedRow) handleNodeClick(nodeNumber)
                        }}
                        className={`h-20 w-20 rounded-full transition-all duration-200
                      scale-90 hover:scale-95 mt-2
                      ${
                        patternPhase === "showing" && isPatternNode && patternBlink
                          ? "bg-[#00ffff] border-[#00ffff]"
                          : isSelected
                          ? "bg-[#00ffff] border-[#00ffff]"
                          : isIncorrect
                          ? "bg-red-500 border-red-500"
                          : isSelectedRow
                          ? "border-2 border-blue-400 bg-transparent"
                          : isActive
                          ? "border-2 border-[#444] bg-transparent"
                          : "border-2 border-[#222] bg-transparent"
                      }
                      ${
                        gameState.status !== "playing" ||
                        patternPhase !== "input" ||
                        !isSelectedRow
                          ? "pointer-events-none"
                          : "hover:border-[#444]"
                      }
                    `}
                      />
                    )
                  })}
              </div>
            </div>

            {/* Rest of the code remains the same */}
            <div className="absolute bottom-0 left-0 right-0 border-t border-[#222]">
              <div className="px-4 py-1">
                <span className="text-xs tracking-wider">SCRAMBLE COUNTDOWN</span>
              </div>
              <div className="px-4 py-2">
                <div className="h-1 bg-[#111]">
                  <div
                    className="h-full bg-red-600 transition-all duration-100"
                    style={{ width: `${(scrambleProgress / 31) * 100}%` }}
                  />
                </div>
              </div>
            </div>
            {/* <div className="absolute bottom-0 left-0 right-0 border-t border-[#222]">
              <div className="px-4 py-1">
              <span className="text-xs tracking-wider">SCRAMBLE COUNTDOWN</span>
              </div>
              <div className="px-4 py-2">
              <div className="flex gap-1">
                {Array(61).fill(null).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 transition-all duration-100 ${
                  i < Math.ceil(scrambleProgress * 2)
                  ? 'bg-red-600'
                  : 'bg-[#111]'
                  }`}
                />
                ))}
              </div>
              </div>
            </div> */}
          </div>

          {/* Decrypted Digits Panel - remains the same */}
          <div className="border border-[#222] overflow-hidden">
            <div className="border-b border-[#222] px-4 py-1">
              <span className="text-xs tracking-wider">DECRYPTED DIGITS</span>
            </div>

            <div className="p-8 h-[calc(100%-2rem)] overflow-auto">
              <div className="grid grid-cols-3 gap-4">
                {keypadSymbols.map((symbol, i) => {
                  const isMatched = matchedDigits.includes(i + 1)
                  return (
                    <div
                      key={i}
                      className={`aspect-square border-2 flex items-center justify-center text-2xl
                ${isMatched ? "border-[#00ffff] text-[#00ffff]" : "border-[#222] text-[#333]"}
                `}
                    >
                      {symbol}
                    </div>
                  )
                })}
              </div>

              <div className="mt-12 grid grid-cols-4 gap-4">
                {Array(4)
                  .fill(null)
                  .map((_, i) => (
                    <div
                      key={i}
                      className={`aspect-square border-2 flex items-center justify-center text-2xl
                ${sequence[i] ? "border-[#00ffff] text-[#00ffff]" : "border-[#222]"}
              `}
                    >
                      {sequence[i] ? keypadSymbols[sequence[i] - 1] : ""}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Match Found Popup */}
        <AnimatePresence>
          {matchPopup.show && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                        bg-[#00ffff] text-black px-8 py-4 z-50 text-2xl font-bold
                        flex flex-col items-center gap-4 border-2 border-black"
            >
              <div>MATCH FOUND</div>
              <div className="text-4xl">{matchPopup.digit}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Game Status Overlay */}
        {gameState.status !== "playing" && (
          <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
            <div className="text-4xl text-[#00ff00] tracking-widest">
              {gameState.status === "intro" ? "PRESS SPACE TO START" : gameState.message}
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center mt-4">
        <button
          onClick={restartGame}
          className="w-32 bg-red-500 hover:opacity-80 transition-all text-white rounded py-2 font-bold"
        >
          Restart
        </button>
      </div>
    </div>
  )
}

