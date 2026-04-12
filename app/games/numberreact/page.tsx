"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { CarFront, Tag, Lock, Squirrel, Coffee, Phone, Star } from "lucide-react"

// intro -> config -> playing -> guess -> result
type Phase = "config" | "intro" | "playing" | "guess" | "result"

// Updated entity types to match Lucide icons
type EntityType = "car" | "tag" | "lock" | "squirrel" | "coffee" | "phone" | "star"
type Entity = {
  id: number
  type: EntityType
  x: number
  y: number
  vy: number
  vx: number
  size: number
  color: string
  rot: number
  rotV: number
  lane?: number // lane index used for overlap-free spawning
}

// Icon name mapping for display
const ICON_NAMES = {
  car: "Car",
  tag: "Tag",
  lock: "Lock",
  squirrel: "Squirrel",
  coffee: "Coffee",
  phone: "Phone",
  star: "Star",
}

// Icon component mapping
const ICON_COMPONENTS = {
  car: CarFront,
  tag: Tag,
  lock: Lock,
  squirrel: Squirrel,
  coffee: Coffee,
  phone: Phone,
  star: Star,
}

const COLORS = {
  // Updated palette for a more vibrant, modern theme with gradients
  primary: "#3b82f6", // blue (targets: hearts)
  neutralDark: "#0f172a", // dark background
  neutralLight: "#f1f5f9", // light text
  accentYellow: "#fbbf24", // distractor
  accentBlue: "#1e40af", // distractor
  gradientStart: "#1e293b", // gradient start
  gradientEnd: "#0f172a", // gradient end
} as const

export default function Page() {
  const [phase, setPhase] = useState<Phase>("config")
  const [duration, setDuration] = useState<number>(30) // configurable
  const [difficulty, setDifficulty] = useState<number>(1) // 1-3, affects spawn rate
  const [actualCount, setActualCount] = useState<number>(0)
  const [guess, setGuess] = useState<string>("")
  const [targetType, setTargetType] = useState<EntityType>("car") // Random target icon
  const [gameKey, setGameKey] = useState(0) // Key to force re-mount on restart

  // Randomize target on mount or restart
  useEffect(() => {
    const types: EntityType[] = ["car", "tag", "lock", "squirrel", "coffee", "phone", "star"]
    setTargetType(types[Math.floor(Math.random() * types.length)])
  }, [gameKey])

  const startGame = useCallback(() => {
    setGuess("")
    setPhase("playing")
  }, [])

  const restartGame = useCallback(() => {
    setPhase("config")
    setGameKey((prev) => prev + 1) // Increment key to re-randomize
  }, [])

  return (
    <main className="text-white flex items-center justify-center p-6 mt-24">
      {" "}
      {/* Added gradient background and min-height */}
      <div className="w-full max-w-lg bg-gray-800/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl animate-fade-in">
        {" "}
        {/* Added backdrop, blur, rounded corners, shadow, and fade-in animation */}
        {phase === "config" && (
          <ConfigScreen
            duration={duration}
            onDurationChange={setDuration}
            difficulty={difficulty}
            onDifficultyChange={setDifficulty}
            onStart={() => setPhase("intro")}
          />
        )}
        {phase === "intro" && <IntroScreen targetType={targetType} onStart={startGame} />}
        {phase === "playing" && (
          <PlayScreen
            duration={duration}
            difficulty={difficulty}
            targetType={targetType}
            onDone={(count) => {
              setActualCount(count)
              setPhase("guess")
            }}
            onRestart={restartGame}
          />
        )}
        {phase === "guess" && (
          <GuessScreen
            value={guess}
            onChange={setGuess}
            targetType={targetType}
            onSubmit={() => setPhase("result")}
            onRestart={restartGame}
          />
        )}
        {phase === "result" && (
          <ResultScreen actual={actualCount} guess={Number(guess)} targetType={targetType} onPlayAgain={restartGame} />
        )}
      </div>
    </main>
  )
}

function IntroScreen({ targetType, onStart }: { targetType: EntityType; onStart: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "e") onStart()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onStart])

  const IconComponent = ICON_COMPONENTS[targetType]

  return (
    <section className="flex flex-col items-center text-center gap-8 animate-fade-in">
      <div className="flex flex-col items-center gap-3">
        <h1 className="text-3xl md:text-4xl font-bold tracking-wide uppercase text-balance text-white drop-shadow-md">
          Manual Authorization Required!
        </h1>
        <p className="text-sm text-slate-300">
          Focus and be ready to count the <IconComponent className="inline w-5 h-5" />.
        </p>
      </div>
      {/* Big green heart button */}
      <button
        onClick={onStart}
        className="group inline-flex items-center justify-center rounded-full p-6 outline-none ring-0 focus:ring-2 focus:ring-primary/60 hover:scale-105 transition-transform duration-200 bg-slate-700/50 hover:bg-slate-600/50"
        aria-label={`Start manual authorization for ${ICON_NAMES[targetType]}`}
      >
        <IconComponent className="w-16 h-16 transition-transform group-active:scale-95" />
      </button>
      <p className="text-xs md:text-sm text-slate-400">Press E to start manual authorization</p>
    </section>
  )
}

function ConfigScreen({
  duration,
  onDurationChange,
  difficulty,
  onDifficultyChange,
  onStart,
}: {
  duration: number
  onDurationChange: (n: number) => void
  difficulty: number
  onDifficultyChange: (n: number) => void
  onStart: () => void
}) {
  return (
    <section className="flex flex-col items-center gap-6 animate-fade-in">
      {" "}
      {/* Added fade-in */}
      <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-center text-white drop-shadow-md">
        {" "}
        {/* Enhanced styling */}
        Configure Game
      </h2>
      <div className="w-full max-w-xs flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          Duration: {duration}s
          <Slider
            value={[duration]}
            onValueChange={([value]) => onDurationChange(value)}
            min={10}
            max={60}
            step={5}
            aria-label="Duration"
            className="w-full"
          />
        </label>
        <label className="flex flex-col gap-2">
          Difficulty: {difficulty}
          <Slider
            value={[difficulty]}
            onValueChange={([value]) => onDifficultyChange(value)}
            min={1}
            max={3}
            step={1}
            aria-label="Difficulty"
            className="w-full"
          />
        </label>
      </div>
      <Button onClick={onStart} className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
        Start
      </Button>{" "}
      {/* Enhanced button styling */}
    </section>
  )
}

function PlayScreen({
  duration,
  difficulty,
  targetType,
  onDone,
  onRestart,
}: {
  duration: number
  difficulty: number
  targetType: EntityType
  onDone: (count: number) => void
  onRestart: () => void
}) {
  const [secondsLeft, setSecondsLeft] = useState(duration)
  const doneRef = useRef(false)

  const handleFinish = useCallback(
    (finalCount: number) => {
      if (doneRef.current) return
      doneRef.current = true
      onDone(finalCount)
    },
    [onDone],
  )

  const IconComponent = ICON_COMPONENTS[targetType]

  return (
    <section className="flex flex-col items-center gap-4 animate-fade-in">
      {" "}
      {/* Added fade-in */}
      <header className="text-center">
        <p className="text-xl md:text-2xl font-bold uppercase tracking-wide text-white drop-shadow-md">
          {" "}
          {/* Enhanced styling */}
          Count: <span title={`target is the ${ICON_NAMES[targetType]}`}><IconComponent className="inline w-6 h-6" /></span>
        </p>
        <p className="text-sm text-slate-300">Timer : {secondsLeft} seconds</p> {/* Improved color */}
      </header>
      <div className="w-full max-w-xl">
        <CanvasField
          secondsLeft={secondsLeft}
          setSecondsLeft={setSecondsLeft}
          difficulty={difficulty}
          targetType={targetType}
          onTimeUp={handleFinish}
        />
      </div>
      <Button
        variant="ghost"
        onClick={onRestart}
        className="w-32 bg-red-500 hover:opacity-80 transition-all text-white rounded py-2 font-bold"
      >
        Restart
      </Button>
      <div className="text-xs text-slate-400">
        Keep your eyes in the box and count only the target <IconComponent className="inline w-4 h-4" />.
      </div>{" "}
      {/* Improved color */}
    </section>
  )
}

function GuessScreen({
  value,
  onChange,
  targetType,
  onSubmit,
  onRestart,
}: {
  value: string
  onChange: (v: string) => void
  targetType: EntityType
  onSubmit: () => void
  onRestart: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter") onSubmit()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onSubmit])

  const IconComponent = ICON_COMPONENTS[targetType]

  return (
    <section className="flex flex-col items-center gap-6 animate-fade-in">
      {" "}
      {/* Added fade-in */}
      <h2 className="text-3xl md:text-4xl font-bold uppercase tracking-wide text-center text-white drop-shadow-md">
        {" "}
        {/* Enhanced styling */}
        Guess the number : <span aria-hidden><IconComponent className="inline w-6 h-6" /></span>
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit()
        }}
        className="w-full max-w-xs flex items-center gap-2"
      >
        <label htmlFor="guess" className="sr-only">
          Your guess
        </label>
        <Input
          id="guess"
          type="number"
          inputMode="numeric"
          placeholder="Enter your guess"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          min={0}
          required
        />
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
          Submit
        </Button>{" "}
        {/* Enhanced button */}
      </form>
    </section>
  )
}

function ResultScreen({
  actual,
  guess,
  targetType,
  onPlayAgain,
}: {
  actual: number
  guess: number
  targetType: EntityType
  onPlayAgain: () => void
}) {
  const correct = actual === guess
  const diff = Math.abs(actual - (Number.isFinite(guess) ? guess : 0))
  const IconComponent = ICON_COMPONENTS[targetType]

  return (
    <section className="flex flex-col items-center gap-6 animate-fade-in">
      {" "}
      {/* Added fade-in */}
      <h3 className="text-3xl font-bold uppercase tracking-wide text-center text-white drop-shadow-md">
        {" "}
        {/* Enhanced styling */}
        {correct ? "Authorization Granted" : "Authorization Failed"}
      </h3>
      <p className="text-center text-sm md:text-base text-slate-300">
        {" "}
        {/* Improved color */}
        You guessed <span className="font-semibold">{isNaN(guess) ? 0 : guess}</span> <IconComponent className="inline w-5 h-5" />. The
        actual count was <span className="font-semibold">{actual}</span>.
        {!correct && (
          <>
            {" "}
            Off by <span className="font-semibold">{diff}</span>.
          </>
        )}
      </p>
      <Button onClick={onPlayAgain} className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200">
        Play Again
      </Button>{" "}
      {/* Enhanced button */}
    </section>
  )
}

// ================= Canvas Field =================

function CanvasField({
  secondsLeft,
  setSecondsLeft,
  difficulty,
  targetType,
  onTimeUp,
}: {
  secondsLeft: number
  setSecondsLeft: (n: number) => void
  difficulty: number
  targetType: EntityType
  onTimeUp: (finalCount: number) => void
}) {
  const [icons, setIcons] = useState<Entity[]>([])
  const iconsRef = useRef<Entity[]>([])
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const lastTsRef = useRef<number | null>(null)
  const elapsedRef = useRef(0)
  const nextIdRef = useRef(1)
  const rafRef = useRef<number | null>(null)
  const totalSecondsRef = useRef<number>(0)
  const lastWholeSecondRef = useRef<number>(0)
  const heartCountRef = useRef<number>(0)
  const spawnAccumulatorRef = useRef<number>(0)
  const spawnRateRef = useRef<number>(0)
  const desiredTargetCountRef = useRef<number>(0)
  const spawnSystemInitializedRef = useRef<boolean>(false)
  const lanePadRef = useRef<number>(24)
  const laneGapRef = useRef<number>(8)
  const laneCountRef = useRef<number>(0)
  const laneXsRef = useRef<number[]>([])
  const laneSpeedsRef = useRef<number[]>([])

  const spawn = useCallback(
    (type: EntityType, lane: number) => {
      const id = nextIdRef.current++
      const s = 48
      const pad = lanePadRef.current
      const xs = laneXsRef.current
      const x = xs[lane] ?? pad
      const y = -s
      const vy = laneSpeedsRef.current[lane] ?? 220 // per-lane constant to prevent catch-up
      const vx = 0
      const rot = 0
      const rotV = 0
      const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`

      const e: Entity = { id, type, x, y, vy, vx, size: s, color, rot, rotV, lane }
      setIcons((prev) => {
        const newIcons = [...prev, e]
        iconsRef.current = newIcons
        return newIcons
      })
      if (type === targetType) heartCountRef.current += 1
    },
    [targetType],
  )

  const step = useCallback(
    (ts: number) => {
      const wrap = wrapRef.current
      if (!wrap) return
      const w = wrap.clientWidth
      const h = Math.max(220, Math.floor(w * 0.75))

      if (lastTsRef.current == null) lastTsRef.current = ts
      const dt = (ts - lastTsRef.current) / 1000
      lastTsRef.current = ts
      elapsedRef.current += dt

      if (!spawnSystemInitializedRef.current) {
        desiredTargetCountRef.current = Math.floor(Math.random() * (60 - 20 + 1)) + 20

        const s = 48
        const pad = lanePadRef.current
        const laneGap = laneGapRef.current
        const maxLeft = Math.max(pad, w - pad - s)
        const laneWidth = s + laneGap
        const laneCount = Math.max(1, Math.floor((maxLeft - pad) / laneWidth) + 1)
        laneCountRef.current = laneCount
        const xs: number[] = []
        for (let i = 0; i < laneCount; i++) {
          const xi = pad + i * laneWidth
          xs.push(Math.min(xi, maxLeft))
        }
        laneXsRef.current = xs
        laneSpeedsRef.current = Array.from(
          { length: laneCount },
          () => Math.floor(Math.random() * (260 - 190 + 1)) + 190,
        )

        const widthScale = Math.max(0.6, w / 360)
        const baseRate = 3.5 * widthScale * (1 + 0.5 * (difficulty - 1))
        const laneCapacityCap = laneCount * 6
        spawnRateRef.current = Math.min(baseRate, laneCapacityCap)

        spawnAccumulatorRef.current = 0
        spawnSystemInitializedRef.current = true
      }

      const whole = Math.floor(elapsedRef.current)
      if (whole > lastWholeSecondRef.current) {
        const delta = whole - lastWholeSecondRef.current
        lastWholeSecondRef.current = whole
        setSecondsLeft((prev) => Math.max(0, prev - delta))
      }

      spawnAccumulatorRef.current += dt * spawnRateRef.current

      const usedLanes = new Set<number>()
      const s = 48
      const minVerticalGap = 8
      const maxSpawnsThisFrame = laneCountRef.current

      let spawnsThisFrame = 0
      while (spawnAccumulatorRef.current >= 1 && spawnsThisFrame < maxSpawnsThisFrame) {
        const desired = desiredTargetCountRef.current
        const currentTargets = heartCountRef.current
        const remainingTargets = Math.max(0, desired - currentTargets)
        const remainingTime = Math.max(0, totalSecondsRef.current - elapsedRef.current)
        const remainingSpawns = Math.max(1, Math.round(spawnRateRef.current * remainingTime))
        let pTarget = remainingTargets / remainingSpawns
        if (currentTargets >= desired) pTarget = 0
        pTarget = Math.max(0, Math.min(1, pTarget))

        let chosenType: EntityType
        if (Math.random() < pTarget) {
          chosenType = targetType
        } else {
          const others: EntityType[] = ["car", "tag", "lock", "squirrel", "coffee", "phone", "star"].filter(
            (t) => t !== targetType,
          ) as EntityType[]
          chosenType = others[Math.floor(Math.random() * others.length)]
        }

        const freeLanes: number[] = []
        for (let i = 0; i < laneCountRef.current; i++) {
          if (usedLanes.has(i)) continue
          const blocked = iconsRef.current.some((e) => e.lane === i && e.y < s + minVerticalGap)
          if (!blocked) freeLanes.push(i)
        }
        if (freeLanes.length === 0) break

        const laneIndex = freeLanes[Math.floor(Math.random() * freeLanes.length)]
        spawn(chosenType, laneIndex)
        usedLanes.add(laneIndex)
        spawnsThisFrame += 1
        spawnAccumulatorRef.current -= 1
      }

      setIcons((prev) => {
        const newIcons = prev.map((e) => ({
          ...e,
          y: e.y + e.vy * dt,
          x: e.x + e.vx * dt,
          rot: e.rot + e.rotV * dt,
        }))
        const kept = newIcons.filter((e) => e.y < h + e.size + 10)
        iconsRef.current = kept
        return kept
      })

      if (elapsedRef.current >= totalSecondsRef.current) {
        onTimeUp(heartCountRef.current)
        cancel()
        return
      }
      rafRef.current = requestAnimationFrame(step)
    },
    [difficulty, onTimeUp, setSecondsLeft, spawn, targetType],
  )

  const cancel = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = null
  }, [])

  useEffect(() => {
    totalSecondsRef.current = secondsLeft
    lastWholeSecondRef.current = 0
    setIcons([])
    iconsRef.current = []
    lastTsRef.current = null
    elapsedRef.current = 0
    nextIdRef.current = 1
    heartCountRef.current = 0
    spawnAccumulatorRef.current = 0
    spawnSystemInitializedRef.current = false
    rafRef.current = requestAnimationFrame(step)
    return () => cancel()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={wrapRef} className="relative w-full h-96 bg-neutral-900 rounded-lg overflow-hidden">
      {icons.map((e) => {
        const IconComponent = ICON_COMPONENTS[e.type]
        return (
          <div
            key={e.id}
            className="absolute"
            style={{
              left: e.x,
              top: e.y,
              transform: `rotate(${e.rot}rad)`,
              color: e.color,
            }}
          >
            <IconComponent size={e.size} />
          </div>
        )
      })}
    </div>
  )
}

// Add the rand function back
function rand(min: number, max: number) {
  if (min > max) [min, max] = [max, min]
  return Math.random() * (max - min) + min
}
