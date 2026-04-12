"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"

// --- Game Configuration ---
const PROGRESS = {
  DURATION: { MIN: 2000, MAX: 7000 },
  SIZE: { MIN: 5, MAX: 25 },
}
const KEYS = {
  Numbers: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
}
const UserSegmentSize = 2

const GetRandomKeyFromSet = (set: keyof typeof KEYS): string => {
  const keySet = KEYS[set]
  return keySet[Math.floor(Math.random() * keySet.length)]
}

// --- Type Definitions ---
interface TTarget {
  size: number
  rotation: number
}
interface TCircleProgressGameState {
  target: TTarget
  duration: number
  key: string
}

// --- SVG Constants ---
const STROKE_WIDTH = 1
const RADIUS = 4
const DIAMETER = RADIUS * 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

// --- Inline Styles Component ---
// This component injects the necessary CSS variables and styles for the game's theme.
const GameStyles = () => (
  <style>{`
    .progress-container {
        font-family: "Roboto", sans-serif;
        --background: 0 0 0;
        --foreground: 250 247 255;
        --primary: 37 37 37;
        --secondary: 60 60 60;
        --tertiary: 250 247 255;
        --accent: 134 133 239;
        --success: 102 231 138;
        --error: 229 40 62;
    }
    .progress-container * { color: rgb(var(--foreground)); font-family: "Roboto", sans-serif; }
    .progress-container .bg-primary { background-color: rgb(var(--primary)); }
    .progress-container .text-muted { color: rgba(var(--foreground), 0.7); }
    .progress-container .primary-shadow { box-shadow: 0 0 2vw 0.05vw rgba(0,0,0,0.75); }
    .progress-container .bg-tertiary { background-color: rgb(var(--tertiary)); }
    .progress-container .text-shadow { text-shadow: 0 0 0.3vw rgba(0,0,0,0.75); }
    .progress-container .glow-accent { filter: drop-shadow(0 0 0.3vw rgb(var(--accent))); }
    .progress-container .glow-success { filter: drop-shadow(0 0 0.3vw rgb(var(--success))); }
    .progress-container .glow-error { filter: drop-shadow(0 0 0.3vw rgb(var(--error))); }
    .progress-container .bg-accent { background-color: rgb(var(--accent)); }
    .progress-container .bg-success { background-color: rgb(var(--success)); }
    .progress-container .bg-error { background-color: rgb(var(--error)); }
    .progress-container .btn-accent { background-color: rgb(var(--accent)); transition: background-color 0.2s; }
    .progress-container .btn-accent:hover { background-color: rgba(var(--accent), 0.8); }
    .progress-container .default-colour-transition { transition: background-color 0.2s, filter 0.2s; }
    .progress-container .stroke-tertiary { stroke: rgb(var(--tertiary)); }
    .progress-container .stroke-accent { stroke: rgb(var(--accent)); }
    .progress-container .stroke-success { stroke: rgb(var(--success)); }
    .progress-container .stroke-error { stroke: rgb(var(--error)); }
    .progress-container .primary-stroke { stroke: white; }
    .progress-container .target-segment { filter: drop-shadow(0 0 0.3vw white); transition: stroke 0.2s, filter 0.2s; }
    .progress-container .user-segment { filter: drop-shadow(0 0 0.3vw rgb(var(--accent))); transition: stroke 0.2s, filter 0.2s; }
    .text-accent { color: rgb(var(--accent)); }
  `}</style>
)

export default function CircleProgress() {
  const [gameState, setGameState] = useState<TCircleProgressGameState | null>(null)
  const [iterationState, setIterationState] = useState<"success" | "fail" | null>(null)
  const [showConfig, setShowConfig] = useState(true)
  const [speed, setSpeed] = useState(50) // New: speed variable
  const [arcSize, setArcSize] = useState(50) // New: arc size variable
  const [iterations, setIterations] = useState(3)
  const [currentIteration, setCurrentIteration] = useState(0)
  const [totalIterations, setTotalIterations] = useState(3)
  const [userRotation, setUserRotation] = useState(0)

  const pointerAnimFrame = useRef<number | null>(null)
  const pointerStartTime = useRef<number>(0)
  const pointerDuration = useRef<number>(0)
  const roundActive = useRef(false)

  // --- Utility Functions ---
  // Speed affects duration (make speed more sensitive)
  const generateDuration = (speedValue: number): number => {
    const { MIN, MAX } = PROGRESS.DURATION
    // Lower speedValue means faster, so invert and make more sensitive
    const duration = MIN + (MAX - MIN) * ((100 - speedValue * 1.5) / 100)
    return Math.max(duration, MIN) + Math.random() * 300 // add some randomness
  }

  // Arc size slider: higher value means smaller arc
  const generateTargetSegment = (arcSizeValue: number): TTarget => {
    arcSizeValue = arcSizeValue >= 100 ? 99 : arcSizeValue <= 0 ? 5 : arcSizeValue
    const { MIN, MAX } = PROGRESS.SIZE
    // Invert arc size: higher slider = smaller arc
    const size = MIN + (MAX - MIN) * ((100 - arcSizeValue) / 100)
    let rotation = 90 + Math.random() * 120
    if (size * 3.6 + rotation > 360) {
      rotation -= size * 3.6 + rotation - 360
    }
    return { size, rotation }
  }

  // --- Game Lifecycle ---
  const handleGameEnd = useCallback((success: boolean) => {
    setGameState(null)
    setIterationState(null)
    setShowConfig(true)
  }, [])

  const startGame = useCallback((iterationsRemaining: number, config: { speed: number, arcSize: number }) => {
    setIterationState(null)
    setCurrentIteration(totalIterations - iterationsRemaining + 1)
    setGameState({
      target: generateTargetSegment(config.arcSize),
      duration: generateDuration(config.speed),
      key: GetRandomKeyFromSet("Numbers"),
    })
  }, [totalIterations])

  // This useEffect contains the correct, original game loop logic.
  useEffect(() => {
    if (!gameState || showConfig) return

    // This local variable is the key. A new one is created for each round,
    // preventing state from previous rounds from causing issues.
    let isRoundActive = true
    let nextRoundTimeout: NodeJS.Timeout

    const finishRound = (success: boolean) => {
      if (!isRoundActive) return
      isRoundActive = false
      roundActive.current = false
      window.removeEventListener("keydown", handleKeyPress)
      if (pointerAnimFrame.current) cancelAnimationFrame(pointerAnimFrame.current)
      setIterationState(success ? "success" : "fail")
      nextRoundTimeout = setTimeout(() => {
        const isLastIteration = currentIteration >= totalIterations
        if (success && !isLastIteration) {
          startGame(totalIterations - currentIteration, { speed, arcSize })
        } else {
          handleGameEnd(success)
        }
      }, 1000)
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState || !isRoundActive || !KEYS.Numbers.includes(e.key)) return
      const elapsed = performance.now() - pointerStartTime.current
      const progress = Math.min((elapsed / gameState.duration) * 100, 100)
      const userRotDeg = (progress / 100) * 360
      const { target, key: targetKey } = gameState
      if (e.key === targetKey) {
        const targetRotDeg = target.rotation
        const targetSize = target.size * 3.6
        const userSize = UserSegmentSize * 3.6
        const inZone =
          userRotDeg > targetRotDeg - userSize &&
          userRotDeg < targetRotDeg + targetSize
        finishRound(inZone)
      } else {
        finishRound(false)
      }
    }

    pointerStartTime.current = performance.now()
    pointerDuration.current = gameState.duration
    roundActive.current = true
    window.addEventListener("keydown", handleKeyPress)

    const animatePointer = (now: number) => {
      if (!isRoundActive) return
      const elapsed = now - pointerStartTime.current
      const percent = Math.min((elapsed / pointerDuration.current) * 100, 100)
      setUserRotation(percent)
      if (percent >= 100) {
        finishRound(false)
      } else {
        pointerAnimFrame.current = requestAnimationFrame(animatePointer)
      }
    }
    pointerAnimFrame.current = requestAnimationFrame(animatePointer)

    // The cleanup function ensures that when the component re-renders
    // for the next round, the old round's logic is fully deactivated.
    return () => {
      isRoundActive = false
      roundActive.current = false
      window.removeEventListener("keydown", handleKeyPress)
      if (pointerAnimFrame.current) cancelAnimationFrame(pointerAnimFrame.current)
      clearTimeout(nextRoundTimeout)
    }
  }, [gameState, showConfig, currentIteration, totalIterations, speed, arcSize, startGame, handleGameEnd])

  const startConfiguredGame = () => {
    setShowConfig(false)
    setTotalIterations(iterations)
    setCurrentIteration(0)
    startGame(iterations, { speed, arcSize })
  }

  // --- SVG Styles ---
  const sizeStyles = {
    width: `${DIAMETER}vw`,
    height: `${DIAMETER}vw`,
  }
  const sizeStylesHalf = {
    width: `${DIAMETER / 2}vw`,
    height: `${DIAMETER / 2}vw`,
  }

  return (
    <div className="w-full flex flex-col items-center mt-24 progress-container bg-black">
      <GameStyles />
      <AnimatePresence mode="wait">
        {showConfig ? (
          <motion.div
            key="config"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="config-screen bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center"
          >
            <h1 className="text-3xl font-bold text-center mb-2 text-white">Circle Progress Game</h1>
            <p className="mb-6 text-center text-gray-300">
              Press the correct number key when the purple pointer is in the white target arc.
            </p>
            {/* Speed slider */}
            <div className="mb-4 w-full">
              <label className="block text-gray-300 mb-2">Speed: {speed}</label>
              <input
                type="range" min="1" max="100" value={speed}
                onChange={e => setSpeed(Number.parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            {/* Arc Size slider */}
            <div className="mb-4 w-full">
              <label className="block text-gray-300 mb-2">
                Arc Size (higher = smaller arc): {arcSize}
              </label>
              <input
                type="range" min="1" max="100" value={arcSize}
                onChange={e => setArcSize(Number.parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            {/* Iterations slider */}
            <div className="mb-8 w-full">
              <label className="block text-gray-300 mb-2">Rounds: {iterations}</label>
              <input
                type="range" min="1" max="5" value={iterations}
                onChange={e => setIterations(Number.parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <button onClick={startConfiguredGame} className="w-full btn-accent text-white p-3 rounded font-bold">
              Start Game
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="game-screen w-full h-full flex flex-col items-center "
          >
            {gameState && (
              <div className="mb-8 text-center">
                <p className="text-white text-xl font-bold">
                  Round {currentIteration} of {totalIterations}
                </p>
              </div>
            )}
            {gameState && (
              <div
                style={sizeStyles}
                className="grid place-items-center primary-shadow rounded-full relative"
              >
                <div
                  style={sizeStylesHalf}
                  className="absolute primary-shadow grid place-items-center bg-primary rounded-full"
                >
                  <p className="text-shadow absolute font-bold text-[2vw]">{gameState.key}</p>
                </div>
                <svg
                  style={sizeStyles}
                  version="1.1"
                  className="z-0 absolute overflow-visible"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    style={{ strokeWidth: "0.5vw" }}
                    className="absolute fill-none stroke-gray-500"
                    cx="50%"
                    cy="50%"
                    r={`${RADIUS * 0.95}vw`}
                  />
                  <circle
                    style={{
                      transform: `rotate(${-90 + gameState.target.rotation}deg)`,
                      strokeDasharray: `${CIRCUMFERENCE}vw`,
                      strokeDashoffset: `${CIRCUMFERENCE * ((100 - gameState.target.size) / 100)}vw`,
                      strokeWidth: "0.6vw",
                    }}
                    className="absolute origin-center stroke-tertiary target-segment"
                    fillOpacity={0}
                    cx="50%"
                    cy="50%"
                    r={`${RADIUS * 0.9}vw`}
                  />
                  <circle
                    style={{
                      transform: `rotate(${-90 + (userRotation / 100) * 360}deg)`,
                      strokeDasharray: `${CIRCUMFERENCE}vw`,
                      strokeDashoffset: `${CIRCUMFERENCE * ((100 - UserSegmentSize) / 100)}vw`,
                      strokeWidth: "0.7vw",
                    }}
                    className={`absolute origin-center default-colour-transition user-segment ${
                      iterationState === "success"
                        ? "glow-success stroke-success"
                        : iterationState === "fail"
                        ? "glow-error stroke-error"
                        : "stroke-accent glow-accent"
                    }`}
                    fillOpacity={0}
                    cx="50%"
                    cy="50%"
                    r={`${RADIUS * 0.9}vw`}
                  />
                </svg>
              </div>
            )}
            {gameState && (
                 <div className="mt-8 text-center">
                    <p className="text-white text-lg">
                        Press <span className="font-bold text-accent">{gameState?.key}</span> when the pointer is in the white arc!
                    </p>
                </div>
            )}
             {!showConfig && (
                <div className="flex flex-col items-center mt-8">
                <button
                    className="w-32 bg-red-500 hover:opacity-80 transition-all text-white rounded py-2 font-bold"
                    onClick={() => handleGameEnd(false)}
                >
                    Restart
                </button>
                </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
