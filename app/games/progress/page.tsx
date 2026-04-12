"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

// --- Game Configuration ---
const PROGRESS = {
  FALLBACK_DIFFICULTY: 50,
  DURATION: { MIN: 2000, MAX: 7000 },
  SIZE: { MIN: 5, MAX: 25 },
}

const KEYS = {
  Numbers: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
}

const GetRandomKeyFromSet = (set: keyof typeof KEYS): string => {
  const keySet = KEYS[set]
  return keySet[Math.floor(Math.random() * keySet.length)]
}

// --- Type Definitions ---
interface TTarget {
  size: number
  progress: number
}
interface TProgressGameState {
  target: TTarget
  duration: number
  key: string
}

// --- Styles ---
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
        .progress-container .primary-shadow { box-shadow: 0 0 2vw 0.05vw rgba(0, 0, 0, 0.75); }
        .progress-container .bg-tertiary { background-color: rgb(var(--tertiary)); }
        .progress-container .text-shadow { text-shadow: 0 0 0.3vw rgba(0, 0, 0, 0.75); }
        .progress-container .glow-accent { filter: drop-shadow(0 0 0.3vw rgb(var(--accent))); }
        .progress-container .glow-success { filter: drop-shadow(0 0 0.3vw rgb(var(--success))); }
        .progress-container .glow-error { filter: drop-shadow(0 0 0.3vw rgb(var(--error))); }
        .progress-container .bg-accent { background-color: rgb(var(--accent)); }
        .progress-container .bg-success { background-color: rgb(var(--success)); }
        .progress-container .bg-error { background-color: rgb(var(--error)); }
        .progress-container .btn-accent { background-color: rgb(var(--accent)); transition: background-color 0.2s; }
        .progress-container .btn-accent:hover { background-color: rgba(var(--accent), 0.8); }
        .progress-container .default-colour-transition { transition: background-color 0.2s, filter 0.2s; }
    `}</style>
)

export default function Progress() {
  const [progressState, setProgressState] = useState<TProgressGameState | null>(null)
  const [iterationState, setIterationState] = useState<"success" | "fail" | null>(null)
  const [showConfig, setShowConfig] = useState(true)
  const [speed, setSpeed] = useState(50)
  const [zoneSize, setZoneSize] = useState(50)
  const [iterations, setIterations] = useState(3)
  const [currentIteration, setCurrentIteration] = useState(0)
  const [totalIterations, setTotalIterations] = useState(3)
  const [pointerLeft, setPointerLeft] = useState(0)

  // --- Refs for animation and game logic ---
  const progressBarRef = useRef<HTMLDivElement>(null)
  const pointerAnimFrame = useRef<number | null>(null)
  const pointerStartTime = useRef<number>(0)

  const handleGameEnd = useCallback((success: boolean) => {
    setProgressState(null)
    setIterationState(null)
    setShowConfig(true)
  }, [])

  const startGame = useCallback((iterationsRemaining: number, config: { speed: number, zoneSize: number }) => {
    setIterationState(null)
    setCurrentIteration(totalIterations - iterationsRemaining + 1)

    // Speed affects duration (make speed more sensitive)
    const generateDuration = (speedValue: number): number => {
      const { MIN, MAX } = PROGRESS.DURATION
      // Lower speedValue means faster, so invert and make more sensitive
      const duration = MIN + (MAX - MIN) * ((100 - speedValue * 1.5) / 100)
      return Math.max(duration, MIN) + Math.random() * 300 // add some randomness
    }

    // Zone size slider: higher value means smaller zone
    const generateTarget = (zoneSizeValue: number): TTarget => {
      const { MIN, MAX } = PROGRESS.SIZE
      // Invert zone size: higher slider = smaller zone
      const size = MIN + (MAX - MIN) * ((100 - zoneSizeValue) / 100)
      const minProgress = 30
      const maxProgress = 100 - size
      const progress = Math.random() * (maxProgress - minProgress) + minProgress
      return { size, progress }
    }

    setProgressState({
      target: generateTarget(config.zoneSize),
      duration: generateDuration(config.speed),
      key: GetRandomKeyFromSet("Numbers"),
    })
  }, [totalIterations])

  // This single useEffect now controls the entire lifecycle of a game round
  useEffect(() => {
    if (!progressState || showConfig) {
      return
    }

    let isRoundActive = true
    let nextRoundTimeout: NodeJS.Timeout

    const finishRound = (success: boolean) => {
      if (!isRoundActive) return
      isRoundActive = false
      
      window.removeEventListener("keydown", handleKeyPress)
      if (pointerAnimFrame.current) {
        cancelAnimationFrame(pointerAnimFrame.current)
      }

      setIterationState(success ? "success" : "fail")

      nextRoundTimeout = setTimeout(() => {
        const isLastIteration = currentIteration >= totalIterations
        if (success && !isLastIteration) {
          startGame(totalIterations - currentIteration, { speed, zoneSize })
        } else {
          handleGameEnd(success)
        }
      }, 1000)
    }

    const handleKeyPress = (e: KeyboardEvent) => {
      if (!progressState || !isRoundActive || !KEYS.Numbers.includes(e.key)) return
      
      const elapsed = performance.now() - pointerStartTime.current
      const currentProgress = Math.min((elapsed / progressState.duration) * 100, 100)
      
      const { target, key: targetKey } = progressState

      if (e.key === targetKey) {
        const leeway = 1.5
        const targetStart = target.progress
        const targetEnd = target.progress + target.size
        const isInsideTarget = currentProgress >= (targetStart - leeway) && currentProgress <= (targetEnd + leeway)
        finishRound(isInsideTarget)
      } else {
        finishRound(false)
      }
    }
    
    pointerStartTime.current = performance.now()
    window.addEventListener("keydown", handleKeyPress)

    const animatePointer = (now: number) => {
      if (!isRoundActive) return

      const elapsed = now - pointerStartTime.current
      const percent = Math.min((elapsed / progressState.duration) * 100, 100)
      // Only update state if value actually changed to avoid infinite loop
      setPointerLeft(prev => (Math.abs(prev - percent) > 0.01 ? percent : prev))

      if (percent >= 100) {
        finishRound(false)
      } else {
        pointerAnimFrame.current = requestAnimationFrame(animatePointer)
      }
    }

    pointerAnimFrame.current = requestAnimationFrame(animatePointer)
    
    return () => {
      isRoundActive = false
      window.removeEventListener("keydown", handleKeyPress)
      if (pointerAnimFrame.current) {
        cancelAnimationFrame(pointerAnimFrame.current)
      }
      clearTimeout(nextRoundTimeout)
    }
  }, [progressState, showConfig, currentIteration, totalIterations, speed, zoneSize, startGame, handleGameEnd])


  const startConfiguredGame = () => {
    setShowConfig(false)
    setTotalIterations(iterations)
    setCurrentIteration(0)
    startGame(iterations, { speed, zoneSize })
  }

  return (
    <div className="w-full flex flex-col items-center mt-24 bg-black progress-container">
      <GameStyles />
      <AnimatePresence mode="wait">
        {showConfig ? (
          <motion.div
            key="config"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="config-screen bg-primary p-8 rounded-lg max-w-md w-full"
          >
            <h1 className="text-3xl font-bold text-center mb-6">Progress Game</h1>
            <p className="text-muted mb-8 text-center">
              Press the correct number key when the purple pointer is in the white target zone.
            </p>
            {/* Speed slider */}
            <div className="mb-4">
              <label className="block text-muted mb-2">Speed: {speed}</label>
              <input
                type="range" min="1" max="100" value={speed}
                onChange={e => setSpeed(Number.parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            {/* Zone Size slider */}
            <div className="mb-4">
              <label className="block text-muted mb-2">
                Zone Size (higher = smaller zone): {zoneSize}
              </label>
              <input
                type="range" min="1" max="100" value={zoneSize}
                onChange={e => setZoneSize(Number.parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            
            {/* Iterations slider */}
            <div className="mb-8">
              <label className="block text-muted mb-2">Rounds: {iterations}</label>
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
            className="game-screen w-full h-full flex flex-col items-center mt-24"
          >
            {progressState && (
              <div className="mb-8 text-center">
                <p className="text-white text-xl font-bold">
                  Round {currentIteration} of {totalIterations}
                </p>
              </div>
            )}
            {progressState && (
              <div
                ref={progressBarRef}
                className="w-[20vw] h-[0.5vw] bg-primary primary-shadow flex items-center relative progress-bar"
              >
                <div className="h-[2.5vw] aspect-square absolute grid place-items-center center-y primary-shadow bg-primary -translate-x-[130%]">
                  <p className="text-shadow absolute font-bold text-[2vw]">{progressState.key}</p>
                </div>
                <div
                  style={{
                    left: `${progressState.target.progress}%`,
                    width: `${progressState.target.size}%`,
                  }}
                  className="h-[1vw] absolute origin-center bg-tertiary z-0"
                />
                <div
                  style={{ left: `${pointerLeft}%`, width: "4px" }}
                  className={`h-[1vw] absolute origin-center default-colour-transition user-segment ${
                    iterationState === "success"
                      ? "glow-success bg-success"
                      : iterationState === "fail"
                      ? "glow-error bg-error"
                      : "bg-accent glow-accent"
                  }`}
                />
              </div>
            )}
            <div className="mt-8 text-center">
              <p className="text-white text-lg">
                Press <span className="font-bold text-accent">{progressState?.key}</span> when the purple pointer is in
                the white zone!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Restart Game button below the game screen, always visible at the bottom */}
      {!showConfig && (
        <div className="flex flex-col items-center mt-8">
          <button
            className="w-32 bg-red-500 hover:opacity-80 transition-all text-white rounded py-2 font-bold"
            onClick={() => {
              setProgressState(null)
              setIterationState(null)
              setShowConfig(true)
            }}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  )
}