"use client";

import { useCallback, useState, useEffect } from "react";
import { generate } from "random-words";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CircleUserRound } from "lucide-react";
import { isEnvBrowser } from "@/utils/misc";
import { useRouter } from "next/navigation";
import { finishMinigame } from "@/utils/finishMinigame";
import { useNuiEvent } from "../roofrunning/hooks/useNuiEvent";
import { Minigame } from "../roofrunning/hooks/general";

const defaultMaxRounds = 25;
const defaultDuration = 25;

export default function WordMemory() {
  const [gameState, setGameState] = useState({
    started: false,
    gameOver: false,
    currentRound: 0,
    currentWord: "",
    seenWords: [] as string[],
    availableWords: [] as string[],
    timeLeft: 0,
    gameWon: false,
  });

  const [settings, setSettings] = useState({
    maxRounds: defaultMaxRounds,
    duration: defaultDuration,
  });

  const [configScreen, setConfigScreen] = useState(true);
  const navigate = useRouter();
  const [gameInterval, setGameInterval] = useState<NodeJS.Timeout | null>(null);

  useNuiEvent("playMinigame", (minigame: Minigame) => {
    if (minigame.minigame !== "wordmemory") return;

    const data = minigame.data as {
      rounds: number;
      timer: number;
    };

    setSettings({
      maxRounds: data.rounds,
      duration: data.timer,
    });
    setConfigScreen(true);
  });

  const getRandomWords = useCallback(() => {
    return generate(Math.floor(settings.maxRounds / 2)) as string[];
  }, [settings.maxRounds]);

  const setRandomWord = useCallback(() => {
    const availableWords = gameState.availableWords;
    const randomWord =
      availableWords[Math.floor(Math.random() * availableWords.length)];

    setGameState((prev) => ({
      ...prev,
      currentWord: randomWord,
    }));
  }, [gameState.availableWords]);

  const startGame = () => {
    const words = getRandomWords();
    const firstWord = words[Math.floor(Math.random() * words.length)];

    setGameState({
      started: true,
      gameOver: false,
      currentRound: 1,
      currentWord: firstWord,
      seenWords: [],
      availableWords: words,
      timeLeft: settings.duration,
      gameWon: false,
    });

    setConfigScreen(false);

    // Start countdown timer
    const interval = setInterval(() => {
      setGameState((prev) => {
        if (prev.timeLeft <= 1) {
          clearInterval(interval);
          return {
            ...prev,
            timeLeft: 0,
            gameOver: true,
            gameWon: false,
          };
        }
        return {
          ...prev,
          timeLeft: prev.timeLeft - 1,
        };
      });
    }, 1000);

    setGameInterval(interval);
  };

  const nextRound = () => {
    if (gameState.currentRound >= settings.maxRounds) {
      // Game won
      if (gameInterval) clearInterval(gameInterval);
      setGameState((prev) => ({
        ...prev,
        gameOver: true,
        gameWon: true,
      }));
    } else {
      // Add current word to seen words and generate next word
      setGameState((prev) => {
        const newSeenWords = [...prev.seenWords, prev.currentWord];
        const nextWord =
          prev.availableWords[Math.floor(Math.random() * prev.availableWords.length)];

        return {
          ...prev,
          currentRound: prev.currentRound + 1,
          seenWords: newSeenWords,
          currentWord: nextWord,
        };
      });
    }
  };

  const handleSeen = () => {
    if (gameState.seenWords.includes(gameState.currentWord)) {
      nextRound();
    } else {
      // Wrong choice - game over
      if (gameInterval) clearInterval(gameInterval);
      setGameState((prev) => ({
        ...prev,
        gameOver: true,
        gameWon: false,
      }));
    }
  };

  const handleNew = () => {
    if (!gameState.seenWords.includes(gameState.currentWord)) {
      nextRound();
    } else {
      // Wrong choice - game over
      if (gameInterval) clearInterval(gameInterval);
      setGameState((prev) => ({
        ...prev,
        gameOver: true,
        gameWon: false,
      }));
    }
  };

  const resetGame = async () => {
    if (isEnvBrowser()) {
      setConfigScreen(true);
      setGameState({
        started: false,
        gameOver: false,
        currentRound: 0,
        currentWord: "",
        seenWords: [],
        availableWords: [],
        timeLeft: 0,
        gameWon: false,
      });
      if (gameInterval) clearInterval(gameInterval);
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
          <span className="text-3xl font-bold mb-2">Word Memory</span>
          <span className="text-lg mb-8 text-gray-400">Memorize the words seen</span>
          <div className="w-full">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">
                  Max Rounds: {settings.maxRounds}
                </label>
                <Slider
                  value={[settings.maxRounds]}
                  onValueChange={([value]) =>
                    setSettings((prev) => ({ ...prev, maxRounds: value }))
                  }
                  min={15}
                  max={40}
                  step={5}
                  className="bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">
                  Duration: {settings.duration}s
                </label>
                <Slider
                  value={[settings.duration]}
                  onValueChange={([value]) =>
                    setSettings((prev) => ({ ...prev, duration: value }))
                  }
                  min={15}
                  max={60}
                  step={5}
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
      <div className="flex flex-col items-center gap-6 p-4 text-white -mt-4">
        <div className="relative w-[1436px] h-[765px] bg-[#20282e]">
          {!gameState.started ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <CircleUserRound className="w-16 h-16 mb-4" />
              <span className="text-2xl mb-2">Get Ready</span>
              <span className="text-lg mb-8 text-gray-400">
                Memorize the words seen
              </span>
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
              {/* Timer and Round display */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-2xl font-bold text-white">
                Time: {gameState.timeLeft}s
              </div>
              <div className="absolute top-4 left-4 text-xl font-bold text-white">
                Round: {gameState.currentRound}/{settings.maxRounds}
              </div>

              {/* Word display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="h-32 w-[750px] max-w-full rounded-lg bg-[rgb(22_40_52)] flex items-center justify-center text-white text-5xl mb-8">
                  <p>{gameState.currentWord}</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-6">
                  <Button
                    size="lg"
                    onClick={handleSeen}
                    className="bg-purple-600 hover:bg-purple-700 px-8 py-4 text-xl"
                    disabled={gameState.gameOver}
                  >
                    SEEN
                  </Button>
                  <Button
                    size="lg"
                    onClick={handleNew}
                    className="bg-green-600 hover:bg-green-700 px-8 py-4 text-xl"
                    disabled={gameState.gameOver}
                  >
                    NEW
                  </Button>
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
                  ? `You completed all ${settings.maxRounds} rounds!`
                  : gameState.timeLeft === 0
                  ? "Time's up!"
                  : "Wrong choice!"}
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
}
