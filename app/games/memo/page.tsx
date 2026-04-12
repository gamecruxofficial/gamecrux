"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PathfindGame, { type GameConfig } from "./pathfind-game"

// Simple two-screen flow: Config -> Game. Restart button is shown under the Game screen.
export default function Page() {
  const [screen, setScreen] = useState<"config" | "game">("config")
  const [config, setConfig] = useState<GameConfig>({
    iterations: 3,
    numberOfNodes: 6,
    duration: 3500, // ms
  })
  const [restartNonce, setRestartNonce] = useState(0)

  const canStart = useMemo(() => {
    return (
      Number.isFinite(config.iterations) &&
      config.iterations > 0 &&
      Number.isFinite(config.numberOfNodes) &&
      config.numberOfNodes >= 3 &&
      Number.isFinite(config.duration) &&
      config.duration >= 1000
    )
  }, [config])

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-6">
      {screen === "config" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Path Finder – Configuration</CardTitle>
            <CardDescription className="text-pretty">
              Choose your game parameters, then start. You can restart anytime from the game screen.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="iterations" className="whitespace-nowrap">
                  Iterations
                </Label>
                <Input
                  id="iterations"
                  type="number"
                  min={1}
                  value={config.iterations}
                  onChange={(e) => setConfig((c) => ({ ...c, iterations: Number(e.target.value) }))}
                  className="w-32"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="nodes" className="whitespace-nowrap">
                  Number of nodes
                </Label>
                <Input
                  id="nodes"
                  type="number"
                  min={3}
                  value={config.numberOfNodes}
                  onChange={(e) => setConfig((c) => ({ ...c, numberOfNodes: Number(e.target.value) }))}
                  className="w-32"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="duration" className="whitespace-nowrap">
                  Duration (ms)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min={1000}
                  step={250}
                  value={config.duration}
                  onChange={(e) => setConfig((c) => ({ ...c, duration: Number(e.target.value) }))}
                  className="w-32"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button disabled={!canStart} onClick={() => setScreen("game")} className="w-full">
                Start Game
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {screen === "game" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-balance">Path Finder – Game</CardTitle>
            <CardDescription className="text-pretty">
              Click the next closest point in order. Beat the timer each iteration.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <PathfindGame
              key={`${restartNonce}-${config.iterations}-${config.numberOfNodes}-${config.duration}`}
              config={config}
            />

            <div className="flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  // Return to Config screen
                  setScreen("config")
                }}
              >
                Back to Config
              </Button>

              <Button
                onClick={() => {
                  setRestartNonce((n) => n + 1)
                }}
              >
                Restart
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </main>
  )
}
