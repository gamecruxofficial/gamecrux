"use client";

import React, { useState, useEffect, useCallback } from "react";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";

// Sound playback helper function
const playSound = (soundName: string) => {
  const soundMap: Record<string, string> = {
    "TUMBLER_PIN_FALL": "/pin-fall.mp3",
    "TUMBLER_PIN_FALL_FINAL": "/pin-fall-final.mp3",
    "SAFE_DOOR_OPEN": "/safe-close.mp3",
    "SAFE_DOOR_CLOSE": "/safe-close.mp3",
    "TUMBLER_TURN": "/safe-open.mp3",
  };

  const soundUrl = soundMap[soundName];

  if (soundUrl) {
    const audio = new Audio(soundUrl);
    audio.play().catch((err) => console.warn(`Error playing sound: ${err.message}`));
  } else {
    console.warn(`Sound ${soundName} not found in soundMap.`);
  }
};

// Helper function to generate a random combination
const generateRandomCombination = (length: number = 3): number[] => {
  const combination: number[] = [];
  while (combination.length < length) {
    const randomNumber = Math.floor(Math.random() * 100);
    if (!combination.includes(randomNumber)) {
      combination.push(randomNumber);
    }
  }
  return combination;
};

export default function SafeCrackingGame() {
  const [dialRotation, setDialRotation] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "success">("idle");
  const [lockStates, setLockStates] = useState([true, true, true]);
  const [currentLockIndex, setCurrentLockIndex] = useState(0);
  const [shakeAnimation, setShakeAnimation] = useState(false);
  const [combination, setCombination] = useState<number[]>(generateRandomCombination());
  const [lastNumber, setLastNumber] = useState(0);

  const getCurrentNumber = useCallback(() => {
    return Math.round((dialRotation / 360) * 100) % 100;
  }, [dialRotation]);

  const checkCombination = useCallback(() => {
    const currentNumber = getCurrentNumber();

    // Check if we reached the number by rotating clockwise
    const isClockwise = (currentNumber - lastNumber + 100) % 100 <= 50;

    if (currentNumber === combination[currentLockIndex] && isClockwise) {
      if (currentLockIndex === combination.length - 1) {
        playSound("TUMBLER_PIN_FALL_FINAL");
      } else {
        playSound("TUMBLER_PIN_FALL");
      }

      const newLockStates = [...lockStates];
      newLockStates[currentLockIndex] = false;
      setLockStates(newLockStates);

      if (currentLockIndex === combination.length - 1) {
        setGameState("success");
        playSound("SAFE_DOOR_OPEN");
        setTimeout(() => {
          alert("Congratulations! You cracked the safe!");
          startGame();
        }, 1000);
      } else {
        setCurrentLockIndex((prev) => prev + 1);
      }
    } else {
      setShakeAnimation(true);
      setTimeout(() => setShakeAnimation(false), 500);
    }
  }, [combination, currentLockIndex, getCurrentNumber, lockStates, lastNumber]);

  const rotateDial = useCallback((direction: "clockwise" | "anticlockwise") => {
    playSound("TUMBLER_TURN");

    setLastNumber(getCurrentNumber());

    setDialRotation((prev) => {
      let newRotation = direction === "clockwise" ? prev + 3.6 : prev - 3.6;
      if (newRotation < 0) newRotation += 360;
      if (newRotation >= 360) newRotation -= 360;
      return newRotation;
    });

    const currentNumber = getCurrentNumber();
    const targetNumber = combination[currentLockIndex];

    // Only play the pin fall sound if we're rotating clockwise and hit the number
    if (direction === "clockwise" &&
        ((currentNumber + 1) % 100 === targetNumber)) {
      playSound("TUMBLER_PIN_FALL");
    }
  }, [getCurrentNumber, combination, currentLockIndex]);

  const startGame = useCallback(() => {
    playSound("SAFE_DOOR_CLOSE");
    setGameState("playing");
    setDialRotation(0);
    setLockStates([true, true, true]);
    setCurrentLockIndex(0);
    setLastNumber(0);
    setCombination(generateRandomCombination());
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        if (gameState === "idle" || gameState === "success") {
          startGame();
        }
        return;
      }

      if (gameState !== "playing") return;

      if (e.key === "ArrowLeft") {
        rotateDial("anticlockwise");
      } else if (e.key === "ArrowRight") {
        rotateDial("clockwise");
      } else if (e.key === "Enter") {
        checkCombination();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState, rotateDial, checkCombination, startGame]);

  return (
    <div className="flex flex-col items-center mt-24">
      <div className={`relative w-96 h-96 ${shakeAnimation ? "animate-shake" : ""}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: "#666666", stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: "#999999", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#666666", stopOpacity: 1 }} />
            </linearGradient>
            <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style={{ stopColor: "#333333", stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: "#1a1a1a", stopOpacity: 1 }} />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#dialGradient)" />
          <circle cx="50" cy="50" r="40" fill="url(#centerGradient)" />
          {Array.from({ length: 100 }, (_, i) => {
            const angle = i * 3.6;
            const isNumber = i % 10 === 0;
            const tickLength = isNumber ? 6 : 3;
            const numberRadius = 34;
            const tickStart = 38;

            return (
              <g key={i} transform={`rotate(${angle} 50 50)`}>
                <line
                  x1="50"
                  y1={50 - tickStart}
                  x2="50"
                  y2={50 - tickStart - tickLength}
                  stroke="#ffffff"
                  strokeWidth={isNumber ? 0.5 : 0.3}
                  opacity={isNumber ? 1 : 0.7}
                />
                {isNumber && (
                  <text
                    x="50"
                    y={50 - numberRadius}
                    fill="#ffffff"
                    fontSize="3"
                    textAnchor="middle"
                    transform={`rotate(${-angle} 50 ${50 - numberRadius})`}
                  >
                    {i}
                  </text>
                )}
              </g>
            );
          })}
          <g transform={`rotate(${dialRotation} 50 50)`}>
            <path d="M 50 15 L 48 25 L 52 25 Z" fill="#ffffff" />
          </g>
        </svg>
      </div>
      <div className="mt-8 flex justify-center space-x-4">
        {lockStates.map((locked, index) =>
          locked ? (
            <LockKeyhole key={index} className="w-8 h-8 text-red-500" />
          ) : (
            <LockKeyholeOpen key={index} className="w-8 h-8 text-green-500" />
          )
        )}
      </div>
      <div className="mt-8 text-center text-white">
        {gameState === "idle" && <p>Press SPACE to start the game</p>}
        {gameState === "playing" && (
          <p>
            Use ← and → arrow keys to rotate the dial
            <br />
            Press ENTER to check the combination
          </p>
        )}
        {gameState === "success" && (
          <p>
            Congratulations! You cracked the safe!
            <br />
            Press SPACE to play again
          </p>
        )}
      </div>
      <div className="mt-4 text-sm text-gray-600">Current Number: {getCurrentNumber()}</div>
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}