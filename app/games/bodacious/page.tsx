"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Download, Database, Network, Power, HardDrive, Cpu, Server, UserCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

type GameStage = "inactive" | "initializing" | "decrypting" | "verifying" | "complete"

type GameState = {
  active: boolean
  stage: GameStage
  label: string
  progress: number
  numberOfIcons: number
  timeToGuess: number
  currentIcon: number
  success: boolean
  memorizeTime: number
  guessTime: number
}

type GameIcon = {
  icon: React.ReactNode
  color: string
  id: string
  selectedColor: string
}

// colors-ui
const COLORS = {
  blue: "#3059EC",
  green: "#30EC7B",
  red: "#EC3030",
  yellow: "#DDEC30",
  orange: "#EC6830",
  cyan: "#30ECCA",
  purple: "#8330EC",
  pink: "#EC30B4",
}

export default function HackingMinigame() {
  const [gameState, setGameState] = useState<GameState>({
    active: false,
    stage: "inactive",
    label: "Ready to start",
    progress: 0,
    numberOfIcons: 4,
    timeToGuess: 4000,
    currentIcon: 0,
    success: false,
    memorizeTime: 5,
    guessTime: 4,
  })

  const [icons] = useState<GameIcon[]>([
    { icon: <Download className="w-8 h-8" />, color: "white", id: "download", selectedColor: "white" },
    { icon: <Database className="w-8 h-8" />, color: "white", id: "database", selectedColor: "white" },
    { icon: <Network className="w-8 h-8" />, color: "white", id: "network", selectedColor: "white" },
    { icon: <Power className="w-8 h-8" />, color: "white", id: "power", selectedColor: "white" },
    { icon: <HardDrive className="w-8 h-8" />, color: "white", id: "storage", selectedColor: "white" },
    { icon: <Cpu className="w-8 h-8" />, color: "white", id: "chip", selectedColor: "white" },
    { icon: <Server className="w-8 h-8" />, color: "white", id: "server", selectedColor: "white" },
  ])

  const [playableIcons, setPlayableIcons] = useState<GameIcon[]>([])
  const [colorInput, setColorInput] = useState("")
  const [timeLeft, setTimeLeft] = useState(100)
  const [numIcons, setNumIcons] = useState(4)
  const [memorizeTime, setMemorizeTime] = useState(5)
  const [guessTime, setGuessTime] = useState(4)
  const [flickerCount, setFlickerCount] = useState(0)
  const [iconOrder, setIconOrder] = useState<number[]>([])

  const progressInterval = useRef<number | undefined>(undefined)
  const timerInterval = useRef<number | undefined>(undefined)
  const decryptionTimeout = useRef<number | undefined>(undefined)
  const flickerInterval = useRef<number | undefined>(undefined)
  const finalColorsTimeout = useRef<number | undefined>(undefined)

  const shuffle = useCallback(<T,>(array: T[]): T[] => {
    const newArray = [...array]
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
    }
    return newArray
  }, [])

  const clearAllTimers = useCallback(() => {
    if (progressInterval.current) clearInterval(progressInterval.current)
    if (timerInterval.current) clearInterval(timerInterval.current)
    if (decryptionTimeout.current) clearTimeout(decryptionTimeout.current)
    if (flickerInterval.current) clearInterval(flickerInterval.current)
    if (finalColorsTimeout.current) clearTimeout(finalColorsTimeout.current)
  }, [])

  const getColorName = (colorHex: string) => {
    return Object.entries(COLORS).find(([_, value]) => value === colorHex)?.[0] || "white"
  }

  const resetGame = useCallback(() => {
    setGameState((prev) => ({ ...prev, stage: "inactive", active: false, label: "Ready to start" }))
    setColorInput("")
    clearAllTimers()
  }, [clearAllTimers])

  const FLICKER_TIME = 3900; // 13 flickers * 300ms per flicker = 3900ms

  const startDecryption = useCallback(() => {
    setGameState((prev) => ({ ...prev, stage: "decrypting", progress: 0 }));
    setFlickerCount(0);

    const colorValues = Object.values(COLORS);
    const finalColors = shuffle([...colorValues]).slice(0, numIcons);

    // Total duration includes both flickering and last color display time
    const totalPhaseDuration = FLICKER_TIME + (memorizeTime * 1000);
    const progressUpdateInterval = totalPhaseDuration / 100;

    progressInterval.current = window.setInterval(() => {
      setGameState((prev) => {
        const newProgress = prev.progress + 1;
        if (newProgress >= 100) {
          if (progressInterval.current) clearInterval(progressInterval.current);
          return { ...prev, progress: 100 };
        }
        return { ...prev, progress: newProgress };
      });
    }, progressUpdateInterval);

    flickerInterval.current = window.setInterval(() => {
      setFlickerCount((prev) => {
        if (prev >= 13) {
          if (flickerInterval.current) clearInterval(flickerInterval.current);
          setPlayableIcons((prevIcons) =>
            prevIcons.map((icon, i) => ({
              ...icon,
              color: finalColors[i],
            }))
          );

          finalColorsTimeout.current = window.setTimeout(() => {
            setGameState((prev) => ({ ...prev, stage: "verifying" }));
            setTimeLeft(100);
          }, memorizeTime * 1000);

          return prev;
        }
        return prev + 1;
      });

      setPlayableIcons((prev) =>
        prev.map((icon) => {
          const availableColors = colorValues.filter((color) => color !== icon.color);
          const randomColor = availableColors[Math.floor(Math.random() * availableColors.length)];
          return {
            ...icon,
            color: randomColor,
          };
        })
      );
    }, 300);
  }, [memorizeTime, numIcons, shuffle]);

  const startGame = useCallback(() => {
    if (gameState.stage !== "inactive") return

    clearAllTimers()
    setColorInput("")

    setGameState((prev) => ({
      ...prev,
      active: true,
      stage: "initializing",
      label: "Initializing Hack...",
      progress: 0,
      currentIcon: 0,
      success: false,
      numberOfIcons: numIcons,
      timeToGuess: guessTime * 1000,
      memorizeTime: memorizeTime,
      guessTime: guessTime,
    }))

    const shuffledIcons = shuffle([...icons]).slice(0, numIcons)
    const shuffledColors = shuffle(Object.values(COLORS))

    const coloredIcons = shuffledIcons.map((icon, i) => ({
      ...icon,
      color: shuffledColors[i],
      selectedColor: "white",
    }))

    setPlayableIcons(coloredIcons)
    setIconOrder(shuffle([...Array(numIcons).keys()]))

    progressInterval.current = window.setInterval(() => {
      setGameState((prev) => {
        const newProgress = prev.progress + 1
        if (newProgress >= 100) {
          if (progressInterval.current) clearInterval(progressInterval.current)
          decryptionTimeout.current = window.setTimeout(startDecryption, 1000)
          return { ...prev, progress: 100 }
        }
        return { ...prev, progress: newProgress }
      })
    }, 30)
  }, [icons, shuffle, clearAllTimers, startDecryption, numIcons, memorizeTime, guessTime, gameState.stage])

  const handleColorGuess = useCallback(() => {
    const currentIcon = playableIcons[iconOrder[gameState.currentIcon]]
    const guess = colorInput.toLowerCase()
    const actualColor = Object.entries(COLORS).find(([_, value]) => value === currentIcon.color)?.[0]

    if (guess === actualColor) {
      setPlayableIcons((prev) =>
        prev.map((icon, i) => (i === iconOrder[gameState.currentIcon] ? { ...icon, selectedColor: icon.color } : icon)),
      )

      if (gameState.currentIcon === playableIcons.length - 1) {
        if (timerInterval.current) clearInterval(timerInterval.current)
        setGameState((prev) => ({
          ...prev,
          stage: "complete",
          success: true,
          label: "Hack Successful!",
        }))
      } else {
        setColorInput("")
        setGameState((prev) => ({ ...prev, currentIcon: prev.currentIcon + 1 }))
        setTimeLeft(100)
      }
    } else {
      if (timerInterval.current) clearInterval(timerInterval.current)
      setGameState((prev) => ({
        ...prev,
        stage: "complete",
        success: false,
        label: "Hack Failed!",
      }))
    }
    setColorInput("")
  }, [colorInput, gameState.currentIcon, playableIcons, iconOrder])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" && gameState.stage === "inactive") {
        e.preventDefault()
        startGame()
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [startGame, gameState.stage])

  useEffect(() => {
    if (gameState.stage === "verifying") {
      timerInterval.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          const newTimeLeft = prev - 100 / (gameState.guessTime * 10)
          if (newTimeLeft <= 0) {
            if (timerInterval.current) clearInterval(timerInterval.current)
            setGameState((prev) => ({
              ...prev,
              stage: "complete",
              success: false,
              label: "Hack Failed!",
            }))
            return 0
          }
          return newTimeLeft
        })
      }, 100)
    }

    return () => {
      if (timerInterval.current) clearInterval(timerInterval.current)
    }
  }, [gameState.stage, gameState.guessTime])

  const getProgressColor = () => {
    if (gameState.stage === "initializing") return "bg-blue-500"
    if (gameState.stage === "decrypting") return "bg-green-500"
    if (gameState.stage === "verifying") return "bg-yellow-500"
    if (gameState.stage === "complete") return gameState.success ? "bg-green-500" : "bg-red-500"
    return "bg-gray-500"
  }

  return (
    <>
      <div className="flex flex-col mt-24 items-center">
        <div className="w-[600px] bg-gray-900 p-5 rounded-lg">
          <div className="flex flex-col items-center gap-4">
            <div className="text-center">
              <UserCircle2 className="w-10 h-10 mb-2 mx-auto text-white" />
              <div className="text-white text-lg font-medium">{gameState.label}</div>
            </div>

            <Progress
              value={gameState.stage === "verifying" ? timeLeft : gameState.progress}
              className="w-[500px] h-5"
              indicatorClassName={cn("transition-all duration-300", getProgressColor())}
            />

            {gameState.stage === "decrypting" && (
              <div className="flex flex-col items-center gap-4">
                <div className="flex gap-8">
                  {playableIcons.map((icon) => (
                    <div key={icon.id} className="flex flex-col items-center gap-2">
                      <div
                        className="text-white transition-all duration-300 transform hover:scale-110"
                        style={{ color: icon.color }}
                      >
                        {icon.icon}
                      </div>
                      <div className="text-white text-sm">{getColorName(icon.color)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {gameState.stage === "verifying" && (
              <div className="flex flex-col items-center gap-4">
                <div
                  className="text-6xl transition-all duration-300"
                  style={{ color: playableIcons[iconOrder[gameState.currentIcon]]?.selectedColor }}
                >
                  {playableIcons[iconOrder[gameState.currentIcon]]?.icon}
                </div>
                <div className="text-white">Enter the correct color</div>
                <div className="flex gap-2">
                  <Input
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleColorGuess()}
                    className="w-48 border-white bg-white/80 text-black text-center"
                    placeholder="Type color name..."
                    autoFocus
                  />
                  <Button onClick={handleColorGuess}>Submit</Button>
                </div>
              </div>
            )}

            {(gameState.stage === "complete" || gameState.stage === "inactive") && (
              <div className="flex flex-col items-center gap-4 w-full">
                {gameState.stage === "inactive" && (
                  <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-2 flex flex-col gap-4">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white">Number of Icons: {numIcons}</span>
                      <Slider
                        value={[numIcons]}
                        onValueChange={(v) => setNumIcons(v[0])}
                        min={2}
                        max={7}
                        step={1}
                        className="w-48"
                        disabled={gameState.active}
                      />
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white">Memorize Time: {memorizeTime}s</span>
                      <Slider
                        value={[memorizeTime]}
                        onValueChange={(v) => setMemorizeTime(v[0])}
                        min={3}
                        max={10}
                        step={1}
                        className="w-48"
                        disabled={gameState.active}
                      />
                    </div>
                    <div className="flex items-center justify-between w-full">
                      <span className="text-white">Guess Time: {guessTime}s</span>
                      <Slider
                        value={[guessTime]}
                        onValueChange={(v) => setGuessTime(v[0])}
                        min={2}
                        max={8}
                        step={1}
                        className="w-48"
                        disabled={gameState.active}
                      />
                    </div>
                  </div>
                )}
                <Button
                  onClick={gameState.stage === "complete" ? resetGame : startGame}
                  className="mt-4"
                >
                  {gameState.stage === "complete" ? "Play Again" : "Start Game"}
                </Button>
                {gameState.stage === "inactive" && (
                  <div className="text-white text-sm opacity-60">Press spacebar to start</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Restart Game button below the game screen */}
      {gameState.stage !== "inactive" && (
        <div className="flex flex-col items-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={resetGame}
              className="w-32 bg-red-500 hover:bg-red-500 hover:text-white hover:opacity-80 transition-all text-white"
          >
            Restart
          </Button>
        </div>
      )}
    </>
  )
}

