"use client";

import { FC, useEffect, useState } from "react";
import { cn } from "@/lib/utils"
import "./Chopping.css";
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { CircleUserRound } from 'lucide-react'
import { Letter, LetterState, Letters } from "./utils";
import { isEnvBrowser } from "@/utils/misc";
import { useRouter } from "next/navigation";
import { finishMinigame } from "@/utils/finishMinigame";
import { useNuiEvent } from "../roofrunning/hooks/useNuiEvent";
import { Minigame } from "../roofrunning/hooks/general";

const getRandomLetter = (): Letter => {
  return Letters[Math.floor(Math.random() * Letters.length)];
};

const defaultNumLetters = 15;
const defaultDuration = 7;
const defaultGridCols = 6;

const Chopping: FC = () => {
  const [gameState, setGameState] = useState({
    started: false,
    gameOver: false,
    numbers: [] as Letter[],
    currentIndex: 0,
    stateBoard: [] as LetterState[],
    timeLeft: 0,
    gameWon: false
  });

  const [settings, setSettings] = useState({
    numLetters: defaultNumLetters,
    duration: defaultDuration
  });

  const [configScreen, setConfigScreen] = useState(true);
  const navigate = useRouter();
  const [gameInterval, setGameInterval] = useState<NodeJS.Timeout | null>(null);

  useNuiEvent("playMinigame", (minigame: Minigame) => {
    if (minigame.minigame !== "chopping") return;

    const data = minigame.data as {
      letters: number;
      timer: number;
    };

    setSettings({
      numLetters: data.letters,
      duration: data.timer
    });
    setConfigScreen(true);
  });

  const startGame = () => {
    // Generate random letters
    const newBoard: Letter[] = [];
    for (let i = 0; i < settings.numLetters; i++) {
      newBoard.push(getRandomLetter());
    }

    setGameState({
      started: true,
      gameOver: false,
      numbers: newBoard,
      currentIndex: 0,
      stateBoard: new Array(settings.numLetters).fill(""),
      timeLeft: settings.duration,
      gameWon: false
    });

    setConfigScreen(false);

    // Start countdown timer
    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          clearInterval(interval);
          return {
            ...prev,
            timeLeft: 0,
            gameOver: true,
            gameWon: false
          };
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1
        };
      });
    }, 1000);

    setGameInterval(interval);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!gameState.started || gameState.gameOver) return;

    const key = event.key.toUpperCase();
    if (!Letters.includes(key as Letter)) return;

    const expectedLetter = gameState.numbers[gameState.currentIndex];
    const newStateBoard = [...gameState.stateBoard];

    if (key === expectedLetter) {
      newStateBoard[gameState.currentIndex] = "done";

      if (gameState.currentIndex === settings.numLetters - 1) {
        // Game won
        if (gameInterval) clearInterval(gameInterval);
        setGameState(prev => ({
          ...prev,
          stateBoard: newStateBoard,
          gameOver: true,
          gameWon: true
        }));
      } else {
        // Move to next letter
        setGameState(prev => ({
          ...prev,
          currentIndex: prev.currentIndex + 1,
          stateBoard: newStateBoard
        }));
      }
    } else {
      // Wrong letter - game over
      newStateBoard[gameState.currentIndex] = "fail";
      if (gameInterval) clearInterval(gameInterval);
      setGameState(prev => ({
        ...prev,
        stateBoard: newStateBoard,
        gameOver: true,
        gameWon: false
      }));
    }
  };

  useEffect(() => {
    if (gameState.started && !gameState.gameOver) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [gameState.started, gameState.gameOver, gameState.currentIndex, gameState.numbers]);

  const resetGame = async () => {
    if (isEnvBrowser()) {
      setConfigScreen(true);
      setGameState({
        started: false,
        gameOver: false,
        numbers: [],
        currentIndex: 0,
        stateBoard: [],
        timeLeft: 0,
        gameWon: false
      });
    } else {
      await finishMinigame(gameState.gameWon);
      navigate.push("/");
    }
  };

  // Config screen
  if (configScreen) {
    return (
      <div className="flex flex-col items-center mt-24 text-white p-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-6 flex flex-col items-center">
          <CircleUserRound className="w-16 h-16 mb-4" />
          <span className="text-3xl font-bold mb-2">Alphabet Challenge</span>
          <span className="text-lg mb-8 text-gray-400">Tap the letters in order</span>
          <div className="space-y-4 w-full">
            <div>
              <label className="block text-sm mb-2">Number of letters: {settings.numLetters}</label>
              <Slider
                value={[settings.numLetters]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, numLetters: value }))}
                min={13}
                max={18}
                step={1}
                className="bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Duration: {settings.duration}s</label>
              <Slider
                value={[settings.duration]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, duration: value }))}
                min={5}
                max={30}
                step={1}
                className="bg-gray-800"
              />
            </div>
          </div>
          <Button
            size="lg"
            onClick={startGame}
            className="bg-[#2c465e] hover:bg-[#425e79] mt-6"
          >
            PLAY NOW
          </Button>
          <p className="text-sm mt-2">Press PLAY NOW to start</p>
        </div>
      </div>
    );
  }

  // Game screen
  return (
    <>
      <div className="flex flex-col items-center gap-6 p-4 text-white -mt-4">
        <div className="relative w-[1436px] h-[765px] bg-[#20282e]">
          {!gameState.started ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <CircleUserRound className="w-16 h-16 mb-4" />
              <span className="text-2xl mb-2">Get Ready</span>
              <span className="text-lg mb-8 text-gray-400">Tap the letters in order</span>
              <Button
                size="lg"
                onClick={startGame}
                className="bg-[#2c465e] hover:bg-[#425e79]"
              >
                START GAME
              </Button>
            </div>
          ) : (
            <>
              {/* Timer display */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-2xl font-bold text-white">
                Time: {gameState.timeLeft}s
              </div>

              {/* Game grid */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="game-grid">
                  {Array.from({ length: Math.ceil(settings.numLetters / defaultGridCols) }).map(
                    (_, rowIndex) => (
                      <div
                        key={rowIndex}
                        className="game-grid-row"
                        style={{
                          gridTemplateColumns: `repeat(${Math.min(
                            settings.numLetters - rowIndex * defaultGridCols,
                            defaultGridCols
                          )}, min-content)`,
                        }}
                      >
                        {Array.from({ length: defaultGridCols }).map((_, colIndex) => {
                          const letterIndex = rowIndex * defaultGridCols + colIndex;
                          if (letterIndex < settings.numLetters) {
                            const letter = gameState.numbers[letterIndex];
                            const isActive = letterIndex === gameState.currentIndex;
                            const isDone = gameState.stateBoard[letterIndex] === "done";
                            const isFail = gameState.stateBoard[letterIndex] === "fail";

                            const classes = cn("letter", {
                              "letter-active": isActive,
                              done: isDone,
                              fail: isFail,
                            });

                            return (
                              <div
                                key={colIndex}
                                className={classes}
                                style={{ justifySelf: "center" }}
                              >
                                {letter}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    )
                  )}
                </div>
              </div>
            </>
          )}

          {gameState.gameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black bg-opacity-50 z-50">
              <div className="text-4xl font-bold mb-4 text-white">
                {gameState.gameWon ? "SUCCESS!" : "FAILED!"}
              </div>
              <div className="text-xl mb-8 text-gray-300">
                {gameState.gameWon
                  ? `You completed all ${settings.numLetters} letters!`
                  : gameState.timeLeft === 0
                    ? "Time's up!"
                    : "Wrong letter pressed!"
                }
              </div>
              <Button
                size="lg"
                onClick={resetGame}
                className="bg-[#2c465e] hover:bg-[#425e79] z-50 relative"
              >
                PLAY AGAIN
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Restart Game button below the game screen */}
      {!configScreen && (
        <div className="flex flex-col items-center">
          <Button
            variant="outline"
            size="lg"
            onClick={resetGame}
          className="w-32 bg-red-500 hover:opacity-80 hover:text-white hover:bg-red-500 transition-all text-white"
          >
            Restart
          </Button>
        </div>
      )}
    </>
  );
};

export default Chopping;
