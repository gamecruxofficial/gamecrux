"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

type Outcome = "idle" | "running" | "success" | "fail"

type Token = {
  id: string
  digit: string // "0".."9"
  startDelay: number // ms
}

const NUMBERS = Array.from({ length: 10 }, (_, i) => String(i))
const DURATION_MIN = 2000
const DURATION_MAX = 7000

function mapSpeedToDuration(speed: number) {
  // speed 1..100, higher = faster => shorter duration
  const s = Math.max(1, Math.min(100, speed))
  const t = DURATION_MAX - ((s - 1) / 99) * (DURATION_MAX - DURATION_MIN)
  return Math.round(t)
}

// --- Styles to mirror the Progress game look & feel ---
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
    .progress-container .text-success { color: rgb(var(--success)); }
    .progress-container .text-error { color: rgb(var(--error)); }
  `}</style>
)

export default function NumberSliderGame() {
  // Screen/state
  const [showConfig, setShowConfig] = useState(true)
  const [outcome, setOutcome] = useState<Outcome>("idle")

  // Config
  const [speed, setSpeed] = useState(50)
  const [keysCount, setKeysCount] = useState(3)

  // Game
  const [tokens, setTokens] = useState<Token[]>([])
  const [hitIds, setHitIds] = useState<Set<string>>(new Set())
  const [now, setNow] = useState(0)
  const [wrongId, setWrongId] = useState<string | null>(null)

  // Animation refs
  const rafRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)

  // Zone placement (centered)
  const zoneWidthPct = 16
  const zoneStart = 50 - zoneWidthPct / 2
  const zoneEnd = 50 + zoneWidthPct / 2

  const duration = useMemo(() => mapSpeedToDuration(speed), [speed])

  const canStart = useMemo(() => {
    return keysCount >= 1
  }, [keysCount])

  const shuffle = (arr: string[]) => {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }

  const startGame = useCallback(() => {
    if (!canStart) return
    setShowConfig(false)
    setOutcome("running")
    setHitIds(new Set())
    setWrongId(null)

    // Randomly select keysCount digits from NUMBERS
    const availableDigits = shuffle([...NUMBERS])
    const selectedDigits = availableDigits.slice(0, keysCount)

    // Build one pass for each selected digit (random order)
    const seq = shuffle(selectedDigits)
    const spawnInterval = Math.floor(duration / (seq.length + 1))
    const built: Token[] = seq.map((digit, i) => ({
      id: `${i}-${digit}-${Date.now()}`,
      digit,
      startDelay: (i + 1) * spawnInterval,
    }))
    setTokens(built)

    // Start animation clock
    startTimeRef.current = performance.now()
    setNow(0)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    const tick = () => {
      const t = performance.now() - startTimeRef.current
      setNow(t)
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [canStart, keysCount, duration])

  const stopAnim = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  // Compute token positions
  const positions = useMemo(() => {
    return tokens.map((t) => {
      const elapsed = now - t.startDelay
      const pct = elapsed < 0 ? 0 : elapsed > duration ? 100 : (elapsed / duration) * 100
      return { id: t.id, digit: t.digit, pct, elapsed }
    })
  }, [tokens, now, duration])

  // Determine if any non-hit token is currently in the center zone
  const currentInZone = useMemo(() => {
    if (outcome !== "running") return null
    for (const p of positions) {
      if (hitIds.has(p.id)) continue
      if (p.pct >= zoneStart && p.pct <= zoneEnd) {
        return p
      }
    }
    return null
  }, [positions, hitIds, outcome, zoneStart, zoneEnd])

  // Miss detection: if a token fully passes and wasn't hit => fail
  useEffect(() => {
    if (outcome !== "running") return
    for (const p of positions) {
      if (hitIds.has(p.id)) continue
      if (p.elapsed > duration + 10) {
        stopAnim()
        setOutcome("fail")
        break
      }
    }
  }, [positions, duration, outcome, hitIds, stopAnim])

  // Success detection: all tokens hit
  useEffect(() => {
    if (outcome !== "running") return
    if (tokens.length > 0 && hitIds.size === tokens.length) {
      stopAnim()
      setOutcome("success")
    }
  }, [hitIds, tokens.length, outcome, stopAnim])

  // Key handling: early/wrong => fail, correct in-zone => mark hit
  useEffect(() => {
    if (outcome !== "running") return
    const onKey = (e: KeyboardEvent) => {
      if (!NUMBERS.includes(e.key)) return
      // Early press (no token in center zone)
      if (!currentInZone) {
        stopAnim()
        setOutcome("fail")
        return
      }
      // Check correctness
      if (e.key === currentInZone.digit) {
        setHitIds((prev) => new Set(prev).add(currentInZone.id))
      } else {
        setWrongId(currentInZone.id)
        stopAnim()
        setOutcome("fail")
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [outcome, currentInZone, stopAnim])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const resetToConfig = () => {
    stopAnim()
    setOutcome("idle")
    setTokens([])
    setHitIds(new Set())
    setNow(0)
    setWrongId(null)
    setShowConfig(true)
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
            <h1 className="text-3xl font-bold text-center mb-6">Number Slider</h1>
            <p className="text-muted mb-8 text-center">
              Select how fast tokens move and choose exactly N digits. Each selected digit will pass once this round.
            </p>

            {/* Speed slider */}
            <div className="mb-4">
              <label className="block text-muted mb-2">Speed: {speed}</label>
              <input
                type="range"
                min={1}
                max={100}
                value={speed}
                onChange={(e) => setSpeed(Number.parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Keys Count */}
            <div className="mb-2">
              <label className="block text-muted mb-2">Number of keys: {keysCount}</label>
              <input
                type="range"
                min={1}
                max={10}
                value={keysCount}
                onChange={(e) => {
                  const v = Number.parseInt(e.target.value)
                  setKeysCount(v)
                }}
                className="w-full"
              />
            </div>

            <button
              onClick={startGame}
              disabled={!canStart}
              className={`w-full btn-accent text-white p-3 rounded font-bold ${!canStart ? "opacity-60" : ""}`}
            >
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
            {/* Track */}
            <div className="w-[40vw] max-w-[720px] min-w-[280px] h-[0.5vw] bg-primary primary-shadow flex items-center relative">
              {/* Center zone */}
              <div
                style={{ left: `${zoneStart}%`, width: `${zoneWidthPct}%` }}
                className="h-[1vw] absolute origin-center bg-tertiary z-0"
              />

              {/* Tokens moving left -> right */}
              {positions.map(({ id, digit, pct }) => {
                const isHit = hitIds.has(id)
                const isWrong = wrongId === id
                // For hit tokens, only render if still in or before the zone end
                if (isHit && pct > zoneEnd) return null
                return (
                  // render digit text only, positioned over the track
                  <div
                    key={id}
                    className="absolute -translate-x-1/2"
                    style={{ left: `${pct}%`, top: "50%", transform: "translate(-50%, -50%)" }}
                  >
                    <p
                      className={`text-shadow font-bold text-[2vw] ${
                        isHit ? "text-success glow-success" : isWrong ? "text-error glow-error" : ""
                      }`}
                    >
                      {digit}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Instruction */}
            <div className="mt-8 text-center">
              {outcome === "running" ? (
                <p className="text-white text-lg">Press the matching digit when it is inside the white center zone.</p>
              ) : outcome === "success" ? (
                <p className="text-success text-lg font-bold">Great! You hit all digits correctly.</p>
              ) : outcome === "fail" ? (
                <p className="text-error text-lg font-bold">Game over. You pressed early, wrong, or missed a digit.</p>
              ) : null}
            </div>

            {/* Controls */}
            <div className="flex flex-col items-center mt-8 gap-3">
              {(outcome === "success" || outcome === "fail") && (
                <button
                  className="w-32 bg-red-500 hover:opacity-80 transition-all text-white rounded py-2 font-bold"
                  onClick={resetToConfig}
                >
                  Restart
                </button>
              )}
              {outcome === "running" && (
                <button
                  className="w-32 bg-red-500 hover:opacity-80 transition-all text-white rounded py-2 font-bold"
                  onClick={resetToConfig}
                >
                  Restart
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
