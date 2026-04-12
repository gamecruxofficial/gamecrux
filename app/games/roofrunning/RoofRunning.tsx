"use client";

import React, { FC, useEffect, useState } from "react";
import { cn } from "@/lib/utils"
import { CircleUserRound, Timer } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"
import {
  getCluster,
  getRandomIcon,
  handleGravity,
  handleLeftShift,
  SquareIcon,
  squareIcons,
  SquareValue,
} from "./utils";
import useGame from "./hooks/useGame";
import { useNuiEvent } from "./hooks/useNuiEvent";
import { Minigame } from "./hooks/general";
import { isEnvBrowser } from "@/utils/misc";
import { finishMinigame } from "@/utils/finishMinigame";
import { useRouter } from "next/navigation";

const defaultRows = 8;
const defaultColumns = 11;
const defaultDuration = 25;
const defaultMaxStrikes = 3;

const RoofRunning: FC = () => {
  const [configScreen, setConfigScreen] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [strikes, setStrikes] = useState(0);

  const [settings, setSettings] = useState({
    rows: defaultRows,
    columns: defaultColumns,
    timer: defaultDuration,
    maxStrikes: defaultMaxStrikes
  });

  const [stats, setStats] = useState({
    streak: 0,
    maxStreak: 0
  });

  const [board, setBoard] = useState<SquareValue[]>([]);
  const gameGridRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();

const statusUpdateHandler = React.useCallback((newStatus: number) => {
    switch (newStatus) {
      case 2:
        setGameOver(true);
        setGameWon(false);
        setStats(prev => ({ ...prev, streak: 0 }));
        break;
      case 3:
        setGameOver(true);
        setGameWon(true);
        setStats(prev => ({
          streak: prev.streak + 1,
          maxStreak: Math.max(prev.streak + 1, prev.maxStreak)
        }));
        break;
    }
  // The dependencies are the state setters, which are guaranteed to be stable.
  }, [setGameOver, setGameWon, setStats]);

  const [gameStatus, setGameStatus] = useGame(
    settings.timer * 1000,
    statusUpdateHandler
  );

  useNuiEvent("playMinigame", (minigame: Minigame) => {
    if (minigame.minigame !== "roof-running") return;

    const data = minigame.data as {
      rows: number;
      columns: number;
      timer: number;
    };

    setSettings(prev => ({
      rows: data.rows,
      columns: data.columns,
      timer: data.timer,
      maxStrikes: prev.maxStrikes
    }));
    startGame();
  });

  const resetBoard = () => {
    const newBoard: SquareValue[] = [];
    for (let i = 0; i < settings.rows * settings.columns; i++) {
      newBoard.push(getRandomIcon());
    }
    setBoard(newBoard);
  };

  const startGame = () => {
    resetBoard();
    setConfigScreen(false);
    setGameStarted(true);
    setGameOver(false);
    setGameWon(false);
    setGameOverReason("");
    setTimeRemaining(settings.timer * 1000);
    setStartTime(Date.now());
    setStrikes(0);
    setGameStatus(1);
  };

  const handleWin = React.useCallback((message: string) => {
    console.log(`Win: ${message}`);
    setGameStatus(3);
  }, [setGameStatus]);

  const handleLose = React.useCallback((message: string) => {
    console.log(`Lose: ${message}`);
    setGameOverReason(message);
    setGameStatus(2);
  }, [setGameStatus, setGameOverReason]);

  // This improved version more explicitly checks each position for valid clusters
  const hasValidMoves = React.useCallback((boardToCheck: SquareValue[]) => {
    const rows = settings.rows;
    const columns = settings.columns;

    // For each position on the board
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        const index = row * columns + col;
        const currentTile = boardToCheck[index];

        // Skip empty tiles
        if (currentTile === "empty") continue;

        // Check adjacent tiles (right and down are enough to catch all clusters)

        // Check right
        if (col + 1 < columns) {
          const rightIndex = row * columns + (col + 1);
          if (boardToCheck[rightIndex] === currentTile) {
            return true; // Found a valid move
          }
        }

        // Check down
        if (row + 1 < rows) {
          const downIndex = (row + 1) * columns + col;
          if (boardToCheck[downIndex] === currentTile) {
            return true; // Found a valid move
          }
        }
      }
    }

    return false; // No valid moves found
  }, [settings.rows, settings.columns]);

  // Add debug logging to help identify why the game might be detecting false unsolvable states
  const checkStatus = React.useCallback((newBoard: SquareValue[]) => {
    console.log("Checking board status...");

    if (newBoard.every((value) => value === "empty")) {
      console.log("Board cleared - WIN!");
      handleWin("All tiles cleared");
      return;
    }

    // Get unique icon types that actually exist on the board (excluding "empty")
    const iconTypesOnBoard = [...new Set(newBoard.filter(icon => icon !== "empty"))];
    console.log("Icon types on board:", iconTypesOnBoard);

    // Check for single remaining icons of any type on the board
    for (const iconType of iconTypesOnBoard) {
      const count = newBoard.filter((value) => value === iconType).length;
      console.log(`${iconType} count:`, count);

      // Instead of ending game here, just log it - we'll only end when there are no valid moves
      if (count === 1) {
        console.log(`Found single tile: 1 ${iconType} tile (continuing play)`);
      }
    }

    // Check if there are any valid moves left
    const hasValidMovesLeft = hasValidMoves(newBoard);
    console.log("Has valid moves:", hasValidMovesLeft);

    if (!hasValidMovesLeft) {
      console.log("No valid moves remaining");
      handleLose("No matching groups remain");
      return;
    }
  }, [handleWin, handleLose, hasValidMoves]);

  const handleClick = (index: number) => {
    if (gameStatus !== 1 || gameOver) {
      return;
    }
    const cluster = getCluster(board, index, settings.rows, settings.columns);

    if (cluster.length > 1) {
      let newBoard = [...board];
      cluster.forEach((i) => {
        newBoard[i] = "empty";
      });
      newBoard = handleGravity(newBoard, settings.rows, settings.columns);
      newBoard = handleLeftShift(newBoard, settings.rows, settings.columns);
      setBoard(newBoard);
      checkStatus(newBoard);
    } else {
      // Player clicked on a tile that doesn't have a matching pair
      const newStrikes = strikes + 1;
      setStrikes(newStrikes);

      if (newStrikes >= settings.maxStrikes) {
        handleLose(`Too many strikes (${newStrikes}/${settings.maxStrikes})`);
      }
    }
  };

  const handlePlayAgain = async () => {
    if (isEnvBrowser()) {
      setConfigScreen(true);
      setGameStarted(false);
      setGameOver(false);
      setGameWon(false);
      setGameOverReason("");
      setTimeRemaining(0);
      setStartTime(null);
      setGameStatus(0);
    } else {
      const result = gameWon;
      await finishMinigame(result);
      router.push("/");
    }
  };

  // Timer effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const updateTimer = () => {
      if (gameStarted && !gameOver && startTime) {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;
        const remaining = Math.max(0, (settings.timer * 1000) - elapsed);

        if (remaining <= 0) {
          handleLose("Time's up"); // Use handleLose instead of setGameStatus
        } else {
          setTimeRemaining(remaining);
          timeoutId = setTimeout(updateTimer, 50);
        }
      }
    };

    if (gameStarted && !gameOver && startTime) {
      updateTimer();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [gameStarted, gameOver, startTime, settings.timer, handleLose]); // Added handleLose to dependencies

  // Config screen
  if (configScreen) {
    return (
      <div className="flex flex-col items-center mt-24 text-white p-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-6 flex flex-col items-center">
          <CircleUserRound className="w-16 h-16 mb-4" />
          <span className="text-3xl font-bold mb-2">Roof Running</span>
          <span className="text-lg mb-8 text-gray-400">Click on matching groups of blocks</span>
          <div className="w-full">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Rows: {settings.rows}</label>
                <Slider
                  value={[settings.rows]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, rows: value }))}
                  min={5}
                  max={10}
                  step={1}
                  className="bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Columns: {settings.columns}</label>
                <Slider
                  value={[settings.columns]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, columns: value }))}
                  min={5}
                  max={15}
                  step={1}
                  className="bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Timer: {settings.timer}s</label>
                <Slider
                  value={[settings.timer]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, timer: value }))}
                  min={5}
                  max={100}
                  step={1}
                  className="bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Max Strikes: {settings.maxStrikes}</label>
                <Slider
                  value={[settings.maxStrikes]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, maxStrikes: value }))}
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
            onClick={startGame}
            className="bg-[#2c465e] hover:bg-[#425e79] mt-6 w-full"
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
      <div className="flex flex-col items-center gap-6 p-4 text-white -mt-8">
        <div className="relative bg-[#20282e] p-8 rounded-lg">
          {!gameStarted ? (
            <div className="flex flex-col items-center justify-center text-center p-8">
              <CircleUserRound className="w-16 h-16 mb-4" />
              <span className="text-2xl mb-2">Game Loading...</span>
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
              <div
                ref={gameGridRef}
                className={cn(
                  `
                    grid
                    gap-x-0.5 gap-y-1
                    mx-auto
                    mb-4
                    *:aspect-square
                    *:bg-[#1a1a1a]
                    *:border
                    *:border-gray-600
                    *:overflow-hidden
                    *:*:size-full
                    *:*:flex
                    *:*:items-center
                    *:*:justify-center
                    *:data-[icon=empty]:*:hidden
                  `,

                  gameOver ? "blur" : ""
                )}
                style={{
                  maxWidth: `calc(calc(calc(calc(calc(100vh - 208px) - ${
                    4 * (settings.rows - 1)
                  }px) / ${settings.rows}) * ${settings.columns}) + ${2 * (settings.columns - 1)}px)`,
                  width: `calc(100vw - 64px)`,
                  gridTemplateRows: `repeat(${settings.rows}, minmax(0, 1fr))`,
                  gridTemplateColumns: `repeat(${settings.columns}, minmax(0, 1fr))`,
                }}
              >
                {board.map((icon, index) => {
                  return (
                    <div
                      key={index}
                      data-icon={icon}
                      onClick={() => handleClick(index)}
                      className="cursor-pointer"
                    >
                      <div className="w-full h-full flex items-center justify-center">
                        {icon === "triangle" && (
                          <img src="/images/image1.png" alt="Triangle" className="w-full h-full object-cover" />
                        )}
                        {icon === "cross" && (
                          <img src="/images/image2.png" alt="Cross" className="w-full h-full object-cover" />
                        )}
                        {icon === "circle" && (
                          <img src="/images/image3.png" alt="Circle" className="w-full h-full object-cover" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Timer Progress Bar and Strike counter positioned based on game grid width */}
              {gameStarted && !gameOver && (
                <div
                  className="absolute bottom-2 mx-auto left-0 right-0 flex flex-col items-center space-y-1"
                  style={{
                    width: gameGridRef.current ? `${gameGridRef.current.offsetWidth}px` : '100%'
                  }}
                >
                  <div className="w-full bg-gray-700 h-2 overflow-hidden mt-4">
                    <div
                      className="h-full bg-red-500 transition-all duration-75"
                      style={{
                        width: `${(timeRemaining / (settings.timer * 1000)) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Strike counter below progress bar */}
                  <div className="flex justify-between items-center w-full px-1 text-xs text-gray-300">
                    <span>Strikes: {strikes}/{settings.maxStrikes}</span>
                    <span>{Math.ceil(timeRemaining / 1000)}s</span>
                  </div>
                </div>
              )}

              {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-lg">
                  <div className="text-center mb-4">
                    <h2 className="text-2xl font-bold mb-2">
                      {gameWon ? "Victory!" : "Game Over"}
                    </h2>
                    <p className="text-lg text-gray-300">
                      {gameWon ? "All blocks cleared!" : gameOverReason || "Game ended"}
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={handlePlayAgain}
                    className="bg-[#2c465e] hover:bg-[#425e79]"
                  >
                    PLAY AGAIN
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Restart Game button below the game screen */}
      {!configScreen && (
        <div className="flex flex-col items-center">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              setConfigScreen(true);
              setGameStarted(false);
              setGameOver(false);
              setGameWon(false);
              setGameOverReason("");
              setTimeRemaining(0);
              setStartTime(null);
              setGameStatus(0);
              setStrikes(0);
            }}
             className="w-32 bg-red-500 hover:opacity-80 hover:text-white hover:bg-red-500 transition-all text-white"
          >
            Restart
          </Button>
        </div>
      )}
    </>
  );
};

export default RoofRunning;
