"use client"

import type React from "react"
import { useReducer, useEffect, useCallback, useRef } from "react"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skull, Trophy, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

type GameState = {
  configScreen: boolean
  started: boolean
  showPattern: boolean
  gameOver: boolean
  positions: number[]
  selectedPositions: number[]
  wrongAttempts: number
  hasWon: boolean
  speed: number
  gridSize: number
  numBlocks: number
  maxWrongClicks: number
  currentTime: number
  wrongClicks: number[]
  countdown: number
  progress: number
}

type Action =
  | { type: "SHOW_CONFIG" }
  | { type: "HIDE_CONFIG" }
  | { type: "START_GAME" }
  | { type: "END_GAME"; payload: { success: boolean } }
  | { type: "SHOW_PATTERN" }
  | { type: "HIDE_PATTERN" }
  | { type: "SELECT_POSITION"; payload: number }
  | { type: "RESET_GAME" }
  | { type: "SET_SPEED"; payload: number }
  | { type: "SET_GRID_SIZE"; payload: number }
  | { type: "SET_NUM_BLOCKS"; payload: number }
  | { type: "SET_MAX_WRONG_CLICKS"; payload: number }
  | { type: "UPDATE_TIME"; payload: number }
  | { type: "UPDATE_PROGRESS"; payload: number | ((prev: number) => number) }
  | { type: "UPDATE_COUNTDOWN"; payload: number | ((prev: number) => number) }

const initialState: GameState = {
  configScreen: true,
  started: false,
  showPattern: false,
  gameOver: false,
  positions: [],
  selectedPositions: [],
  wrongAttempts: 0,
  hasWon: false,
  speed: 10,
  gridSize: 5,
  numBlocks: 5,
  maxWrongClicks: 3,
  currentTime: 0,
  wrongClicks: [],
  countdown: 5,
  progress: 0,
}

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "SHOW_CONFIG":
      return { ...state, configScreen: true }
    case "HIDE_CONFIG":
      return { ...state, configScreen: false }
    case "START_GAME":
      return {
        ...state,
        configScreen: false,
        started: true,
        showPattern: true,
        gameOver: false,
        positions: Array.from({ length: state.gridSize * state.gridSize }, (_, i) => i)
          .sort(() => Math.random() - 0.5)
          .slice(0, state.numBlocks),
        selectedPositions: [],
        wrongAttempts: 0,
        hasWon: false,
        wrongClicks: [],
        countdown: 5,
        progress: 0,
        currentTime: 0,
      }
    case "END_GAME":
      return {
        ...state,
        gameOver: true,
        hasWon: action.payload.success,
      }
    case "SHOW_PATTERN":
      return { ...state, showPattern: true }
    case "HIDE_PATTERN":
      return { ...state, showPattern: false }
    case "SELECT_POSITION":
      if (state.positions.includes(action.payload) && !state.selectedPositions.includes(action.payload)) {
        const newSelectedPositions = [...state.selectedPositions, action.payload]
        return {
          ...state,
          selectedPositions: newSelectedPositions,
          hasWon: newSelectedPositions.length === state.positions.length,
          gameOver: newSelectedPositions.length === state.positions.length,
        }
      } else if (!state.positions.includes(action.payload)) {
        const newWrongAttempts = state.wrongAttempts + 1
        return {
          ...state,
          wrongAttempts: newWrongAttempts,
          wrongClicks: [...state.wrongClicks, action.payload],
          gameOver: newWrongAttempts >= state.maxWrongClicks,
          hasWon: false,
        }
      }
      return state
    case "RESET_GAME":
      return {
        ...initialState,
        speed: state.speed,
        gridSize: state.gridSize,
        numBlocks: state.numBlocks,
        maxWrongClicks: state.maxWrongClicks,
      }
    case "SET_SPEED":
      return { ...state, speed: action.payload }
    case "SET_GRID_SIZE":
      return {
        ...state,
        gridSize: action.payload,
        numBlocks: Math.min(state.numBlocks, action.payload * action.payload),
      }
    case "SET_NUM_BLOCKS":
      return { ...state, numBlocks: action.payload }
    case "SET_MAX_WRONG_CLICKS":
      return { ...state, maxWrongClicks: action.payload }
    case "UPDATE_TIME":
      return { ...state, currentTime: action.payload }
    case "UPDATE_PROGRESS":
      return {
        ...state,
        progress: typeof action.payload === "function" ? action.payload(state.progress) : action.payload,
      }
    case "UPDATE_COUNTDOWN":
      return {
        ...state,
        countdown: typeof action.payload === "function" ? action.payload(state.countdown) : action.payload,
      }
    default:
      return state
  }
}

const App: React.FC = () => {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const timerInterval = useRef<NodeJS.Timeout | null>(null)
  const gameTimeout = useRef<NodeJS.Timeout | null>(null)
  const countdownInterval = useRef<NodeJS.Timeout | null>(null)
  const progressInterval = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  const clearAllIntervals = useCallback(() => {
    ;[timerInterval, gameTimeout, countdownInterval, progressInterval].forEach((interval) => {
      if (interval.current) {
        clearInterval(interval.current)
        clearTimeout(interval.current)
        interval.current = null
      }
    })
  }, [])

  const startMainGame = useCallback(() => {
    clearAllIntervals()

    dispatch({ type: "HIDE_PATTERN" })
    dispatch({ type: "UPDATE_PROGRESS", payload: 0 })
    dispatch({ type: "UPDATE_TIME", payload: 0 })

    startTimeRef.current = Date.now()

    timerInterval.current = setInterval(() => {
      dispatch({ type: "UPDATE_TIME", payload: (Date.now() - startTimeRef.current) / 1000 })
    }, 100)

    progressInterval.current = setInterval(() => {
      dispatch({ type: "UPDATE_PROGRESS", payload: (prev) => Math.min(prev + 100 / (state.speed * 20), 100) })
    }, 50)

    gameTimeout.current = setTimeout(() => {
      dispatch({ type: "END_GAME", payload: { success: false } })
    }, state.speed * 1000)
  }, [state.speed, clearAllIntervals])

  const startGameFromConfig = useCallback(() => {
    if (
      state.gridSize < 5 ||
      state.speed < 4 ||
      state.numBlocks < 1 ||
      state.numBlocks > state.gridSize * state.gridSize
    )
      return

    clearAllIntervals()
    dispatch({ type: "START_GAME" })

    countdownInterval.current = setInterval(() => {
      dispatch({ type: "UPDATE_COUNTDOWN", payload: (prev) => prev - 1 })
      dispatch({ type: "UPDATE_PROGRESS", payload: (prev) => prev + 20 })
    }, 1000)

    setTimeout(() => {
      clearInterval(countdownInterval.current as NodeJS.Timeout)
      startMainGame()
    }, 5000)
  }, [state.gridSize, state.speed, state.numBlocks, clearAllIntervals, startMainGame])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        if (!state.started || state.gameOver) {
          startGameFromConfig()
        } else {
          dispatch({ type: "RESET_GAME" })
          startGameFromConfig()
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [state.started, state.gameOver, startGameFromConfig])

  useEffect(() => {
    return () => {
      clearAllIntervals()
    }
  }, [clearAllIntervals])

  useEffect(() => {
    if (state.gameOver) {
      clearAllIntervals()
    }
  }, [state.gameOver, clearAllIntervals])

  const handleSquareClick = useCallback(
    (index: number) => {
      if (!state.started || state.showPattern || state.gameOver) {
        console.log("Square click ignored. Game state:", state) // Debug log
        return
      }

      dispatch({ type: "SELECT_POSITION", payload: index })
    },
    [state],
  )

  console.log("Current game state:", state) // Debug log

  const renderGameGrid = () => (
    <div
      className="grid gap-2 h-full"
      style={{
        gridTemplateColumns: `repeat(${state.gridSize}, 1fr)`,
      }}
    >
      {Array.from({ length: state.gridSize * state.gridSize }).map((_, i) => (
        <button
          key={i}
          onClick={() => handleSquareClick(i)}
          className={cn("aspect-square rounded transition-all duration-300", "bg-gray-700", {
            "hover:bg-gray-600": !state.positions.includes(i) && !state.wrongClicks.includes(i),
            "bg-blue-500 hover:bg-blue-600": state.showPattern && state.positions.includes(i),
            "bg-green-500 hover:bg-green-600": !state.showPattern && state.selectedPositions.includes(i),
            "bg-red-500 hover:bg-red-600": state.wrongClicks.includes(i),
          })}
          disabled={!state.started || state.showPattern || state.gameOver}
        />
      ))}
    </div>
  )

  const renderGameOver = () => (
    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm bg-black/70">
      {state.hasWon ? (
        <>
          <Trophy className="w-16 h-16 mb-4 text-yellow-400" />
          <span className="text-4xl font-bold text-green-400">Victory!</span>
          <span className="text-xl mt-2">Time: {state.currentTime.toFixed(3)}s</span>
          <span className="text-sm mt-4 text-gray-400">Press Space or click buttons below to play again</span>
        </>
      ) : (
        <>
          <Skull className="w-16 h-16 mb-4 text-red-400" />
          <span className="text-4xl font-bold text-red-400">Game Over</span>
          <span className="text-xl mt-2">
            Wrong clicks: {state.wrongAttempts}/{state.maxWrongClicks}
          </span>
          <span className="text-sm mt-4 text-gray-400">Press Space or click buttons below to try again</span>
        </>
      )}
    </div>
  )

  // Show config screen if configScreen is true
  if (state.configScreen) {
    return (
      <div className="flex flex-col items-center mt-24 text-white p-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-6 flex flex-col items-center">
          <Zap className="w-16 h-16 mb-4" />
          <span className="text-3xl font-bold mb-2">Thermite Game</span>
          <span className="text-lg mb-8 text-gray-400">Configure Your Memory Challenge</span>
          <div className="w-full">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Time: {state.speed}s</label>
                <Slider
                  value={[state.speed]}
                  onValueChange={([value]) => dispatch({ type: "SET_SPEED", payload: value })}
                  min={4}
                  max={30}
                  step={1}
                  className="bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Grid: {state.gridSize}x{state.gridSize}</label>
                <Slider
                  value={[state.gridSize]}
                  onValueChange={([value]) => dispatch({ type: "SET_GRID_SIZE", payload: value })}
                  min={5}
                  max={10}
                  step={1}
                  className="bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Blocks: {state.numBlocks}</label>
                <Slider
                  value={[state.numBlocks]}
                  onValueChange={([value]) => dispatch({ type: "SET_NUM_BLOCKS", payload: value })}
                  min={1}
                  max={state.gridSize * state.gridSize}
                  step={1}
                  className="bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Max Wrong Clicks: {state.maxWrongClicks}</label>
                <Slider
                  value={[state.maxWrongClicks]}
                  onValueChange={([value]) => dispatch({ type: "SET_MAX_WRONG_CLICKS", payload: value })}
                  min={1}
                  max={10}
                  step={1}
                  className="bg-gray-800"
                />
              </div>
            </div>
          </div>
          <Button
            size="lg"
            onClick={startGameFromConfig}
            className="bg-[#2c465e] hover:bg-[#425e79] mt-6 w-full"
          >
            PLAY NOW
          </Button>
          <p className="text-sm mt-2">Press PLAY NOW to start</p>
        </div>
      </div>
    )
  }

  if (state.gameOver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {state.hasWon ? '🏆' : '💀'}
          </div>
          <h2 className="text-3xl font-bold mb-4">
            {state.hasWon ? 'Victory!' : 'Game Over!'}
          </h2>
          <p className="text-lg mb-2 text-gray-400">
            {state.hasWon ? 'You remembered the pattern!' : `Wrong clicks: ${state.wrongAttempts}/${state.maxWrongClicks}`}
          </p>
          {state.hasWon && (
            <p className="text-lg mb-8 text-green-400">
              Time: {state.currentTime.toFixed(3)}s
            </p>
          )}
          <Button
            size="lg"
            onClick={() => dispatch({ type: "RESET_GAME" })}
            className="bg-[#2c465e] hover:bg-[#425e79] w-full max-w-xs transition-all"
          >
            PLAY AGAIN
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col mt-16 items-center gap-6 max-w-2xl mx-auto text-white">
      {/* Game Status */}
      {state.started && (
        <div className="text-center">
          <p className="text-xl font-bold">
            {state.gameOver
              ? state.hasWon
                ? "You won!"
                : "Game Over!"
              : state.showPattern
                ? "Memorize the pattern!"
                : "Reproduce the pattern!"}
          </p>
        </div>
      )}

      {/* Game Grid */}
      <div className="relative w-full max-w-[540px] backdrop-blur-lg bg-gray-800/60 rounded-lg p-4">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square">
            {renderGameGrid()}
            {state.gameOver && renderGameOver()}
          </div>
          {state.started && (
            <div className="w-full h-4 flex items-center gap-4">
              <Progress
                value={state.progress}
                className="h-2"
                indicatorClassName={cn(
                  "transition-all duration-300",
                  {
                    "bg-blue-500": state.showPattern,
                    "bg-green-500": state.gameOver && state.hasWon,
                    "bg-red-500": (!state.showPattern && !state.gameOver) || (state.gameOver && !state.hasWon)
                  }
                )}
              />
              {state.showPattern ? (
                <span className="text-2xl font-bold">{state.countdown}</span>
              ) : (
                <span className="text-2xl font-bold">{state.currentTime.toFixed(1)}s</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Game Control Buttons */}
      <div className="flex gap-4">
        <Button
          size="lg"
          onClick={() => dispatch({ type: "RESET_GAME" })}
          className="bg-red-500 hover:bg-red-600 w-32"
        >
          Back
        </Button>
        {/* <Button
          size="lg"
          onClick={() => {
            if (state.started && !state.gameOver) {
              dispatch({ type: "END_GAME", payload: { success: false } })
            } else {
              startGameFromConfig()
            }
          }}
          className={cn(
            "w-32",
            state.started && !state.gameOver ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600",
          )}
        >
          {state.started && !state.gameOver ? (
            <>
              <Skull className="mr-2 h-4 w-4" />
              End Game
            </>
          ) : (
            "Restart Game"
          )}
        </Button> */}
      </div>

      {/* Keyboard Controls Info */}
      <div className="text-sm text-gray-400 text-center">
        Press <kbd className="px-2 py-1 bg-gray-700 rounded">Space</kbd> to{" "}
        {state.started && !state.gameOver ? "restart" : "start"} the game
      </div>
    </div>
  )
}

export default App

