"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { NodeDot } from "./pathfind-node"

// Types closely mirroring the original Svelte logic
export type GameConfig = {
  iterations: number
  numberOfNodes: number
  duration: number // ms
}

type TargetPoint = { x: number; y: number; selected: boolean }
type IterationState = "success" | "fail" | null
type PathFindState = {
  targets: TargetPoint[]
  activeIndex: number
  duration: number
  currentIteration: number
}

const ROOT_SIZE_VH = 2.5
const POINT_SIZE_VH = 2

// Utilities ported from the Svelte version
function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function distanceBetween(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1
  const dy = y2 - y1
  return Math.hypot(dx, dy)
}

function sortPoints(points: TargetPoint[]) {
  const sorted: TargetPoint[] = [points[0]]
  const remaining = points.slice(1)
  for (let i = 0; i < points.length - 1; i++) {
    const last = sorted[i]
    let nearestIndex = 0
    let nearestDist = Number.POSITIVE_INFINITY
    for (let j = 0; j < remaining.length; j++) {
      const d = distanceBetween(last.x, last.y, remaining[j].x, remaining[j].y)
      if (d < nearestDist) {
        nearestDist = d
        nearestIndex = j
      }
    }
    sorted.push(remaining[nearestIndex])
    remaining.splice(nearestIndex, 1)
  }
  return sorted
}

function generateTargets(numberOfNodes: number): TargetPoint[] {
  const pts: TargetPoint[] = []
  for (let i = 0; i < numberOfNodes; i++) {
    pts.push({
      x: randomBetween(3, 97),
      y: randomBetween(3, 97),
      selected: i === 0,
    })
  }
  return sortPoints(pts)
}

export default function PathfindGame({ config }: { config: GameConfig }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const durationTimeoutRef = useRef<number | null>(null)

  const [dims, setDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 })
  const [visible, setVisible] = useState(true)
  const [iterationState, setIterationState] = useState<IterationState>(null)
  const [progress, setProgress] = useState(0)
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [clickedWrongNode, setClickedWrongNode] = useState(false)

  const [pathState, setPathState] = useState<PathFindState | null>(null)

  const [remainingIterations, setRemainingIterations] = useState(config.iterations)

  // Measure container
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      setDims({ w: el.clientWidth, h: el.clientHeight })
    }
    update()
    const obs = new ResizeObserver(update)
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Helper to clear timers/raf
  const clearTimers = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (durationTimeoutRef.current) {
      window.clearTimeout(durationTimeoutRef.current)
      durationTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  // Start a new game flow
  useEffect(() => {
    setVisible(true)
    setIterationState(null)
    setRemainingIterations(config.iterations)
    setPathState(null)
    setProgress(0)

    // small delay to ensure dimensions are ready
    const t = window.setTimeout(() => {
      startGame(config.iterations, config.duration, config.numberOfNodes)
    }, 150)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.iterations, config.duration, config.numberOfNodes])

  function startGame(iterations: number, duration: number, numberOfNodes: number) {
    if (!visible) return
    setClickedWrongNode(false)
    setIterationState(null)
    setProgress(0)

    const targets = generateTargets(numberOfNodes)
    const state: PathFindState = {
      targets,
      activeIndex: 0,
      duration,
      currentIteration: config.iterations - iterations,
    }
    setPathState(state)

    // Play a single iteration after a brief pause
    timeoutRef.current = window.setTimeout(() => {
      playIteration(state)
    }, 300)
  }

  function playIteration(state: PathFindState) {
    if (!visible) return

    // Animate progress with raf until duration; also hard-stop after duration + 500ms
    const start = performance.now()
    const total = state.duration
    const animate = (t: number) => {
      const elapsed = t - start
      const pct = Math.max(0, Math.min(100, (elapsed / total) * 100))
      setProgress(pct)
      drawTick()
      if (elapsed < total && !iterationState) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }
    rafRef.current = requestAnimationFrame(animate)

    durationTimeoutRef.current = window.setTimeout(() => {
      finish(false)
    }, total + 500)

    function finish(ok: boolean) {
      // Stop timer/progress
      clearTimers()
      setProgress((p) => p) // freeze current progress
      setIterationState(ok ? "success" : "fail")

      // Proceed after a short delay
      timeoutRef.current = window.setTimeout(() => {
        setIterationState(null)
        setProgress(0)

        if (ok) {
          if (remainingIterations - 1 <= 0) {
            // Win
            setVisible(true)
            setPathState(null)
            setRemainingIterations(0)
            // No more iterations; show final state
          } else {
            // Continue
            setRemainingIterations((n) => n - 1)
            startGame(remainingIterations - 1, config.duration, config.numberOfNodes)
          }
        } else {
          // Lose
          setPathState(null)
        }
      }, 800)
    }
    // Store finish so handlers can call it
    ;(finishRef as any).current = finish
  }

  // Finish function ref accessible to events
  const finishRef = useRef<(ok: boolean) => void>(() => {})
  const handleFinish = useCallback((ok: boolean) => {
    finishRef.current?.(ok)
  }, [])

  // Handle container mouse move to update mousePos in canvas space
  const onContainerMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current
    const rect = canvas?.getBoundingClientRect()
    if (!rect) return
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }, [])

  // Node click handling
  const onNodeClick = useCallback(
    (idx: number) => {
      if (!pathState || iterationState) return
      const { activeIndex, targets } = pathState
      // Must click next node (activeIndex + 1)
      if (idx !== activeIndex + 1) {
        setClickedWrongNode(true)
        handleFinish(false)
        return
      }

      const next = structuredClone(pathState)
      next.activeIndex++
      next.targets[idx].selected = true
      setPathState(next)

      if (next.activeIndex >= next.targets.length - 1) {
        handleFinish(true)
      }
    },
    [handleFinish, iterationState, pathState],
  )

  // Canvas drawing
  const drawTick = useCallback(() => {
    if (!canvasRef.current || !pathState) return
    if (iterationState) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const { targets, activeIndex } = pathState
    const length = activeIndex < targets.length - 1 ? activeIndex : targets.length - 1

    const vh = window.innerHeight / 100
    const getPoint = (x: number, y: number, root = false) => {
      const diff = ((root ? ROOT_SIZE_VH : POINT_SIZE_VH) * vh) / 2
      return [x + diff, y + diff] as const
    }

    const first = targets[0]
    let [finalX, finalY] = getPoint((first.x / 100) * dims.w, (first.y / 100) * dims.h, true)

    ctx.beginPath()
    for (let i = 0; i < length; i++) {
      const t = targets[i]
      const nx = (targets[i + 1].x / 100) * dims.w
      const ny = (targets[i + 1].y / 100) * dims.h

      const [xP, yP] = getPoint((t.x / 100) * dims.w, (t.y / 100) * dims.h)
      const [xN, yN] = getPoint(nx, ny)

      ctx.moveTo(xP, yP)
      ctx.lineTo(xN, yN)

      if (i === length - 1) {
        finalX = xN
        finalY = yN
      }
    }

    if (activeIndex !== targets.length - 1 && finalX && finalY) {
      ctx.moveTo(finalX, finalY)
      ctx.lineTo(mousePos.x, mousePos.y)
    }

    ctx.strokeStyle = "rgba(34,197,94,1)" // green-500 akin to tertiary accent
    ctx.lineWidth = (vh * ROOT_SIZE_VH) / 4
    ctx.lineCap = "round"
    ctx.stroke()
  }, [dims.h, dims.w, iterationState, mousePos.x, mousePos.y, pathState])

  // Redraw when essentials change
  useEffect(() => {
    drawTick()
  }, [drawTick])

  const targets = useMemo(() => pathState?.targets ?? [], [pathState?.targets])

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Iteration:{" "}
        {pathState ? pathState.currentIteration + 1 : Math.max(1, config.iterations - remainingIterations + 1)} /{" "}
        {config.iterations} • Nodes: {config.numberOfNodes} • Time: {config.duration}ms
      </div>

      <Progress value={progress} aria-label="Iteration time remaining" />

      <div
        ref={containerRef}
        onMouseMove={onContainerMouseMove}
        className={cn(
          "relative aspect-square w-[60vh] max-w-full bg-secondary/90 border border-border overflow-hidden rounded-md",
        )}
      >
        <canvas ref={canvasRef} width={dims.w} height={dims.h} className="absolute inset-0 h-full w-full" />
        {targets.map((t, i) => {
          const sizeVh = i === 0 ? ROOT_SIZE_VH : POINT_SIZE_VH
          return (
            <NodeDot
              key={i}
              root={i === 0}
              selected={t.selected}
              xPct={t.x}
              yPct={t.y}
              sizeVh={sizeVh}
              disabled={!!iterationState}
              onClick={() => onNodeClick(i)}
            />
          )
        })}
      </div>

      {iterationState && (
        <div
          className={cn(
            "text-center text-sm font-medium",
            iterationState === "success" ? "text-emerald-600" : "text-red-600",
          )}
        >
          {iterationState === "success" ? "Nice! Continuing…" : "Missed! Game over."}
        </div>
      )}
    </div>
  )
}
