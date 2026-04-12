"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Terminal, Clock, Zap, Target, Shield, Cpu } from "lucide-react"

type CharacterSet = "numeric" | "alphabet" | "alphanumeric" | "greek" | "braille" | "runes" | "symbols"
type ShowType = "0" | "1" | "2"

const CHARACTER_SETS: Record<CharacterSet, string> = {
  numeric: "0123456789",
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  greek: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
  braille: "⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏⡐⡑⡒⡓⡔⡕⡖⡗⡘⡙⡚⡛⡜⡝⡞⡟⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿",
  runes: "ᚠᚥᚧᚨᚩᚬᚭᚻᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛤ",
  symbols: "☎☚☛☜☞☟☠☢☣☮☯♨♩♪♫♬Ψ♆✂✄෧✆✉✦✧✿❀",
}

export default function HackingMinigame() {
  const [gameStarted, setGameStarted] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [bestTime, setBestTime] = useState(99.999)
  const [currentTime, setCurrentTime] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showFailure, setShowFailure] = useState(false)

  // Game state
  const [codes, setCodes] = useState<string[]>([])
  const [codesPos, setCodesPos] = useState(0)
  const [currentPos, setCurrentPos] = useState(43)
  const [correctPos, setCorrectPos] = useState(0)
  const [targetSequence, setTargetSequence] = useState<string[]>([])

  // Settings
  const [selectedCharSets, setSelectedCharSets] = useState<CharacterSet[]>(["symbols"])
  const [showType, setShowType] = useState<ShowType>("0")
  const [timeout, setTimeoutValue] = useState(15)
  const [hideChars, setHideChars] = useState(true)
  const [hideTarget, setHideTarget] = useState(false)

  // Refs for stable references
  const gameStateRef = useRef({
    gameStarted: false,
    currentPos: 43,
    codesPos: 0,
    correctPos: 0,
    streak: 0,
    maxStreak: 0,
    bestTime: 99.999,
    currentTime: 0,
    selectedCharSets: ["symbols"] as CharacterSet[],
  })

  // Refs for timers
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null)
  const moveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null)
  const timeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const gameTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number | undefined>(undefined)

  // Update refs when state changes
  useEffect(() => {
    gameStateRef.current = {
      gameStarted,
      currentPos,
      codesPos,
      correctPos,
      streak,
      maxStreak,
      bestTime,
      currentTime,
      selectedCharSets,
    }
  }, [gameStarted, currentPos, codesPos, correctPos, streak, maxStreak, bestTime, currentTime, selectedCharSets])

  // Load saved data from localStorage
  useEffect(() => {
    const savedMaxStreak = localStorage.getItem("hacking-max-streak")
    const savedBestTime = localStorage.getItem("hacking-best-time")

    if (savedMaxStreak) setMaxStreak(Number.parseInt(savedMaxStreak))
    if (savedBestTime) setBestTime(Number.parseFloat(savedBestTime))
  }, [])

  const random = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min)) + min
  }

  const shuffle = <T,>(arr: T[]): T[] => {
    const shuffled = [...arr]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const randomSetChar = (charSet: CharacterSet) => {
    const str = CHARACTER_SETS[charSet]
    return str.charAt(random(0, str.length))
  }

  const getGroupFromPos = (pos: number, count = 4) => {
    const group = [pos]
    for (let i = 1; i < count; i++) {
      group.push((pos + i) % 80)
    }
    return group
  }

  const generateCodes = (charSets: CharacterSet[]) => {
    if (charSets.length === 0) return []

    const shuffledSets = shuffle(charSets)
    const selectedSet = shuffledSets[0]

    const newCodes = []
    for (let i = 0; i < 80; i++) {
      newCodes.push(randomSetChar(selectedSet) + randomSetChar(selectedSet))
    }
    return newCodes
  }

  const startTimer = () => {
    startTimeRef.current = Date.now()
    timeTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current!) / 1000
      setCurrentTime(elapsed)
      setTimeLeft(Math.max(0, timeout - elapsed))
    }, 10)
  }

  const stopTimer = () => {
    if (timeTimerRef.current) {
      clearInterval(timeTimerRef.current)
    }
  }

  const clearAllTimers = () => {
    if (gameTimerRef.current) clearTimeout(gameTimerRef.current)
    if (moveTimerRef.current) clearInterval(moveTimerRef.current)
    if (hideTimerRef.current) clearInterval(hideTimerRef.current)
    if (timeTimerRef.current) clearInterval(timeTimerRef.current)
    if (gameTimeoutRef.current) clearTimeout(gameTimeoutRef.current)
  }

  const resetGame = () => {
    setGameStarted(false)
    setPreparing(false)
    setCurrentTime(0)
    setTimeLeft(0)
    setCodesPos(0)
    setCurrentPos(43)
    setHideTarget(false)
    setShowSuccess(false)
    setShowFailure(false)
    clearAllTimers()
  }

  const checkAnswer = (isTimeout = false) => {
    const state = gameStateRef.current
    stopTimer()

    if (!isTimeout) {
      const currentAttempt = (state.currentPos + state.codesPos) % 80

      if (state.gameStarted && currentAttempt === state.correctPos) {
        // Correct answer
        setShowSuccess(true)
        const newStreak = state.streak + 1
        setStreak(newStreak)

        if (newStreak > state.maxStreak) {
          setMaxStreak(newStreak)
          localStorage.setItem("hacking-max-streak", newStreak.toString())
        }

        if (state.currentTime < state.bestTime) {
          setBestTime(state.currentTime)
          localStorage.setItem("hacking-best-time", state.currentTime.toString())
        }

        // Start new round after delay
        setTimeout(() => {
          setShowSuccess(false)
          if (state.selectedCharSets.length > 0) {
            startNewGame()
          }
        }, 1500)
      } else {
        // Wrong answer
        setShowFailure(true)
        setStreak(0)
        setTimeout(() => {
          setShowFailure(false)
          if (state.selectedCharSets.length > 0) {
            startNewGame()
          }
        }, 2000)
      }
    } else {
      // Timeout
      setShowFailure(true)
      setStreak(0)
      setTimeout(() => {
        setShowFailure(false)
        if (state.selectedCharSets.length > 0) {
          startNewGame()
        }
      }, 2000)
    }
  }

  const startNewGame = () => {
    const state = gameStateRef.current
    if (state.selectedCharSets.length === 0) return

    resetGame()
    setPreparing(true)

    const newCodes = generateCodes(state.selectedCharSets)
    const newCorrectPos = random(0, 80)
    const targetGroup = getGroupFromPos(newCorrectPos)
    const newTargetSequence = targetGroup.map((pos) => newCodes[pos])

    setCodes(newCodes)
    setCorrectPos(newCorrectPos)
    setTargetSequence(newTargetSequence)
    setCurrentPos(43)
    setCodesPos(0)

    gameTimerRef.current = setTimeout(() => {
      setPreparing(false)
      setGameStarted(true)
      startTimer()

      // Start moving codes
      moveTimerRef.current = setInterval(() => {
        setCodesPos((prev) => (prev + 1) % 80)
      }, 1500)

      // Hide characters randomly
      if (hideChars && random(1, 4) === 1) {
        hideTimerRef.current = setInterval(() => {
          setHideTarget(true)
          window.setTimeout(() => setHideTarget(false), 500)
        }, 3500)
      }

      // Game timeout
      gameTimeoutRef.current = setTimeout(() => {
        setGameStarted(false)
        checkAnswer(true)
      }, timeout * 1000)
    }, 2000)
  }

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = gameStateRef.current
      if (!state.gameStarted) return

      const validKeys = ["w", "s", "a", "d", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"]
      if (!validKeys.includes(e.key)) return

      e.preventDefault()

      switch (e.key) {
        case "w":
        case "ArrowUp":
          setCurrentPos((prev) => (prev - 10 < 0 ? prev + 70 : prev - 10))
          break
        case "s":
        case "ArrowDown":
          setCurrentPos((prev) => (prev + 10) % 80)
          break
        case "a":
        case "ArrowLeft":
          setCurrentPos((prev) => (prev - 1 < 0 ? 79 : prev - 1))
          break
        case "d":
        case "ArrowRight":
          setCurrentPos((prev) => (prev + 1) % 80)
          break
        case "Enter":
          checkAnswer(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, []) // Empty dependency array since we use refs

  const getDisplayedCodes = () => {
    if (codes.length === 0) return []

    const shifted = [...codes]
    for (let i = 0; i < codesPos; i++) {
      shifted.push(shifted[i])
    }
    shifted.splice(0, codesPos)

    return shifted
  }

  const isHighlighted = (index: number) => {
    const targetPositions = getGroupFromPos(currentPos)
    return targetPositions.includes(index)
  }

  const isCorrectPosition = (index: number) => {
    const correctPositions = getGroupFromPos((correctPos - codesPos + 80) % 80)
    return correctPositions.includes(index)
  }

  const handleCharSetChange = (charSet: CharacterSet, checked: boolean) => {
    if (checked) {
      setSelectedCharSets((prev) => [...prev, charSet])
    } else {
      setSelectedCharSets((prev) => prev.filter((set) => set !== charSet))
    }
    setStreak(0)
  }

  const handleTimeoutChange = (value: number[]) => {
    setTimeoutValue(value[0])
    setStreak(0)
    resetGame()
  }

  const handleRestart = () => {
    setStreak(0)
    resetGame()
  }

  const isMirrored = showType === "2" || (showType === "1" && Math.random() > 0.5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Success/Failure overlays */}
      {showSuccess && (
        <div className="fixed inset-0 bg-emerald-500/20 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="text-center animate-in zoom-in duration-500">
            <Shield className="w-24 h-24 mx-auto mb-4 text-emerald-400 animate-pulse" />
            <h2 className="text-4xl font-bold text-emerald-400 mb-2">ACCESS GRANTED</h2>
            <p className="text-xl text-emerald-300">Sequence matched successfully!</p>
          </div>
        </div>
      )}

      {showFailure && (
        <div className="fixed inset-0 bg-red-500/20 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
          <div className="text-center animate-in zoom-in duration-500">
            <Terminal className="w-24 h-24 mx-auto mb-4 text-red-400 animate-pulse" />
            <h2 className="text-4xl font-bold text-red-400 mb-2">ACCESS DENIED</h2>
            <p className="text-xl text-red-300">Security breach detected!</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-in slide-in-from-top duration-1000">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-4 animate-pulse">
            HACKING DEVICE
          </h1>
          <div className="flex items-center justify-center gap-2 text-emerald-400 mb-4">
            <Cpu className="w-6 h-6 animate-spin" />
            <span className="text-lg font-mono">SECURITY SYSTEM INTERFACE</span>
            <Cpu className="w-6 h-6 animate-spin" />
          </div>
          <p className="text-gray-300 text-lg max-w-3xl mx-auto leading-relaxed">
            Infiltrate the security system by matching character sequences.
            <br />
            <span className="text-emerald-400 font-semibold">Use WASD or arrow keys to navigate • Enter to select</span>
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="mb-8 animate-in slide-in-from-left duration-1000 delay-200">
          <Card className="bg-gradient-to-r from-emerald-900/50 to-cyan-900/50 border-emerald-500/30 backdrop-blur-sm shadow-2xl shadow-emerald-500/20">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center group">
                  <div className="flex items-center justify-center mb-2">
                    <Zap className="w-8 h-8 text-yellow-400 group-hover:animate-bounce" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-400 mb-1 font-mono">{streak}</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wider">Current Streak</div>
                </div>
                <div className="text-center group">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="w-8 h-8 text-emerald-400 group-hover:animate-spin" />
                  </div>
                  <div className="text-3xl font-bold text-emerald-400 mb-1 font-mono">{maxStreak}</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wider">Max Streak</div>
                </div>
                <div className="text-center group">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-8 h-8 text-cyan-400 group-hover:animate-pulse" />
                  </div>
                  <div className="text-3xl font-bold text-cyan-400 mb-1 font-mono">{currentTime.toFixed(3)}s</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wider">Current Time</div>
                </div>
                <div className="text-center group">
                  <div className="flex items-center justify-center mb-2">
                    <Shield className="w-8 h-8 text-purple-400 group-hover:animate-pulse" />
                  </div>
                  <div className="text-3xl font-bold text-purple-400 mb-1 font-mono">{bestTime.toFixed(3)}s</div>
                  <div className="text-sm text-gray-300 uppercase tracking-wider">Best Time</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 animate-in slide-in-from-right duration-1000 delay-400">
          {/* Character Sets */}
          <Card className="bg-slate-800/80 border-slate-600/50 backdrop-blur-sm hover:bg-slate-800/90 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4 text-emerald-400 text-lg flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Character Sets
              </h3>
              <div className="space-y-3">
                {Object.keys(CHARACTER_SETS).map((charSet) => (
                  <div key={charSet} className="flex items-center space-x-3 group">
                    <Checkbox
                      id={charSet}
                      checked={selectedCharSets.includes(charSet as CharacterSet)}
                      onCheckedChange={(checked) => handleCharSetChange(charSet as CharacterSet, checked as boolean)}
                      className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                    />
                    <Label
                      htmlFor={charSet}
                      className="capitalize cursor-pointer text-gray-300 group-hover:text-white transition-colors"
                    >
                      {charSet}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Display Options */}
          <Card className="bg-slate-800/80 border-slate-600/50 backdrop-blur-sm hover:bg-slate-800/90 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4 text-cyan-400 text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Display Mode
              </h3>
              <RadioGroup
                value={showType}
                onValueChange={(value) => setShowType(value as ShowType)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 group">
                  <RadioGroupItem value="0" id="normal" className="border-cyan-400 text-cyan-400" />
                  <Label htmlFor="normal" className="text-gray-300 group-hover:text-white transition-colors">
                    Only Normal
                  </Label>
                </div>
                <div className="flex items-center space-x-3 group">
                  <RadioGroupItem value="1" id="mixed" className="border-cyan-400 text-cyan-400" />
                  <Label htmlFor="mixed" className="text-gray-300 group-hover:text-white transition-colors">
                    Normal + Mirrored
                  </Label>
                </div>
                <div className="flex items-center space-x-3 group">
                  <RadioGroupItem value="2" id="mirrored" className="border-cyan-400 text-cyan-400" />
                  <Label htmlFor="mirrored" className="text-gray-300 group-hover:text-white transition-colors">
                    Only Mirrored
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Game Settings */}
          <Card className="bg-slate-800/80 border-slate-600/50 backdrop-blur-sm hover:bg-slate-800/90 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
            <CardContent className="p-6">
              <h3 className="font-bold mb-4 text-purple-400 text-lg flex items-center gap-2">
                <Cpu className="w-5 h-5" />
                Game Settings
              </h3>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="timeout-slider" className="text-gray-300 mb-2 block">
                    Timeout: <span className="text-purple-400 font-bold">{timeout}s</span>
                  </Label>
                  <Slider
                    id="timeout-slider"
                    min={5}
                    max={30}
                    step={5}
                    value={[timeout]}
                    onValueChange={handleTimeoutChange}
                    className="mt-2"
                  />
                </div>
                <div className="flex items-center space-x-3 group">
                  <Checkbox
                    id="hide-chars"
                    checked={hideChars}
                    onCheckedChange={(checked) => setHideChars(checked as boolean)}
                    className="data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                  />
                  <Label htmlFor="hide-chars" className="text-gray-300 group-hover:text-white transition-colors">
                    Randomly hide characters
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Game Area */}
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-emerald-500/30 backdrop-blur-sm shadow-2xl shadow-emerald-500/20 mb-8 animate-in slide-in-from-bottom duration-1000 delay-600">
          <CardContent className="p-8">
            {preparing ? (
              <div className="text-center py-16 animate-in fade-in duration-1000">
                <div className="relative">
                  <Terminal className="w-24 h-24 mx-auto mb-6 text-emerald-400 animate-pulse" />
                  <div className="absolute inset-0 w-24 h-24 mx-auto border-4 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></div>
                </div>
                <p className="text-2xl font-bold text-emerald-400 mb-4 animate-pulse">
                  INITIALIZING SECURITY INTERFACE
                </p>
                <div className="flex justify-center space-x-1">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    ></div>
                  ))}
                </div>
              </div>
            ) : !gameStarted ? (
              <div className="text-center py-16 animate-in zoom-in duration-1000">
                <Terminal className="w-24 h-24 mx-auto mb-6 text-gray-400" />
                <p className="text-2xl font-bold mb-6 text-gray-300">SECURITY SYSTEM READY</p>
                <Button
                  onClick={startNewGame}
                  disabled={selectedCharSets.length === 0}
                  className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold py-4 px-8 text-lg rounded-lg shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Shield className="w-6 h-6 mr-2" />
                  INITIATE HACK
                </Button>
                {selectedCharSets.length === 0 && (
                  <p className="text-red-400 mt-4 animate-pulse">Select at least one character set to begin</p>
                )}
              </div>
            ) : (
              <div className={`transition-all duration-500 ${isMirrored ? "transform scale-x-[-1] scale-y-[-1]" : ""}`}>
                {/* Target sequence */}
                <div className="text-center mb-8 animate-in slide-in-from-top duration-500">
                  <div className="text-sm text-emerald-400 mb-2 uppercase tracking-wider">TARGET SEQUENCE</div>
                  <div className="text-3xl font-mono mb-4 min-h-[60px] flex items-center justify-center">
                    {!hideTarget ? (
                      <div className="flex gap-2 animate-in fade-in duration-300">
                        {targetSequence.map((char, i) => (
                          <span
                            key={i}
                            className="px-4 py-2 bg-gradient-to-br from-emerald-600 to-cyan-600 text-white rounded-lg shadow-lg border border-emerald-400/50 animate-pulse"
                            style={{ animationDelay: `${i * 0.1}s` }}
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-red-400 animate-pulse">SIGNAL INTERFERENCE</div>
                    )}
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-emerald-400 text-lg font-mono">TIME: {Math.ceil(timeLeft)}s</div>
                    <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-red-500 transition-all duration-100 ease-linear"
                        style={{ width: `${(timeLeft / timeout) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Character grid */}
                <div className="grid grid-cols-10 gap-2 max-w-4xl mx-auto animate-in fade-in duration-1000">
                  {getDisplayedCodes().map((code, index) => (
                    <div
                      key={index}
                      className={`
                        text-center p-3 font-mono text-lg border-2 rounded-lg transition-all duration-200 transform hover:scale-105
                        ${
                          isHighlighted(index)
                            ? "bg-gradient-to-br from-red-600 to-red-700 border-red-400 text-white shadow-lg shadow-red-500/50 animate-pulse scale-110"
                            : !gameStarted && isCorrectPosition(index)
                              ? "bg-gradient-to-br from-emerald-600 to-emerald-700 border-emerald-400 text-white shadow-lg shadow-emerald-500/50"
                              : "bg-slate-800/80 border-slate-600/50 text-gray-300 hover:bg-slate-700/80 hover:border-slate-500/70"
                        }
                      `}
                    >
                      {code}
                    </div>
                  ))}
                </div>

                {/* Movement indicator */}
                <div className="text-center mt-6 text-cyan-400 animate-pulse">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                    <span className="text-sm font-mono">GRID SHIFTING</span>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping delay-500"></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="text-center animate-in slide-in-from-bottom duration-1000 delay-800">
          <div className="flex justify-center gap-4 mb-6">
            <Button
              onClick={handleRestart}
              variant="outline"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400 transition-all duration-300 transform hover:scale-105"
            >
              <Terminal className="w-4 h-4 mr-2" />
              RESET SYSTEM
            </Button>
            <Button
              onClick={startNewGame}
              disabled={selectedCharSets.length === 0}
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
            >
              <Shield className="w-4 h-4 mr-2" />
              NEW SEQUENCE
            </Button>
          </div>

          <div className="text-gray-400 text-sm space-y-2">
            <div className="flex items-center justify-center gap-4 text-xs uppercase tracking-wider">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                WASD / Arrow Keys: Navigate
              </span>
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                Enter: Select
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
