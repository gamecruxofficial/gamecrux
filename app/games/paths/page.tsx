"use client";

import { useEffect, useState, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { FaRoute } from "react-icons/fa";

// Define the global window interface for our game's functions
declare global {
  interface Window {
    pathsGame?: {
      start: (settings: any) => void;
      cleanup: () => void;
    };
    returnToConfigScreen?: () => void;
  }
}

export default function PathsGamePage() {
  const [configScreen, setConfigScreen] = useState(true);
  const [settings, setSettings] = useState({
    gridSize: 11,
    lives: 3,
    timeLimit: 20
  });

  const initEffectRan = useRef(false);

  const startGame = () => {
    setConfigScreen(false);
  };

  useEffect(() => {
    if (initEffectRan.current) return;
    initEffectRan.current = true;

    // 1. Establish the communication bridge from the game back to React
    // FIX #1: This function now properly cleans up the end-game screen's DOM elements
    // before telling React to show the config screen. This prevents the "Play Again" button
    // and result text from lingering.
    window.returnToConfigScreen = () => {
      const screenElement = document.getElementById('screen');
      const pathContainer = document.getElementById('path-container');

      if (screenElement) screenElement.style.display = 'none';
      if (pathContainer) pathContainer.style.display = 'none';

      // Manually remove the button and clear text to prevent it from appearing on the config screen.
      const playAgainBtn = document.querySelector('.path-play-again-btn');
      if (playAgainBtn) playAgainBtn.remove();
      const screenText = document.querySelector('.screen-text');
      if (screenText) screenText.innerHTML = '';
      const screenIcon = document.querySelector('.screen-icon');
      if (screenIcon) screenIcon.innerHTML = '';

      // Now, tell React to render the config screen.
      setConfigScreen(true);
    };

    // 2. Inject CSS with improved scaling and centering
    const style = document.createElement('style');
    style.id = 'paths-game-styles';
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
        :root { --background-1: #0e111a; --action-1: #23af57; --action-2: #d71f3e; --timer: #d71f3e; }
        body { margin: 0; padding: 0; background-color: var(--background-1); overflow: hidden; font-family: "Roboto", sans-serif; }

        #game-container {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100vw;
            height: 90vh;
        }

        /* FIX #2: Set background-color to 'transparent' to show the animated background behind it. */
        #screen { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); display: none; flex-direction: column; align-items: center; justify-content: center; background-color: transparent; color: white; text-align: center; font-size: 1.5vh; font-weight: 600; padding: 1vh; z-index: 10; }
        .screen-icon { font-size: 4vh; padding-bottom: 1vh; }

        #path-container {
            position: relative;
            width: 85vmin;
            height: 85vmin;
            max-width: 800px;
            max-height: 800px;
            display: none;
            flex-direction: column;
             overflow: hidden;
        }

        #path-grid {
            display: grid;
            background-color: var(--background-1);
            gap: 1px;
            flex-grow: 1;
        }
        .timer-container { padding: 1.4vh 2vh 1.7vh; background-color: var(--background-1); }
        .timer-outer { height: 0.8vh; width: 100%; background-color: rgb(36, 36, 36);}
        .timer-inner { height: 100%; width: 100%; background-color: var(--timer); }

        /* Removed fixed font-size to be set dynamically below */
        .path-grid-square { background-color: white; opacity: 0.05; display: flex; align-items: center; justify-content: center; }

        .path-square { opacity: 0.2; }
        .player { background-color: var(--action-1); opacity: 1; }
        .off-path-player { background-color: var(--action-2); opacity: 1; animation: error-shake 0.3s linear 1; }

        /* NEW: Dynamic icon sizing based on grid size */
        .grid-size-small .path-grid-square { font-size: 1.5vh; }
        .grid-size-medium .path-grid-square { font-size: 1.2vh; }
        .grid-size-large .path-grid-square { font-size: 0.8vh; }

        @keyframes error-shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
        }
        .path-play-again-btn { background-color: #2c465e; color: white; padding: 10px 20px; border: none; cursor: pointer; font-size: 16px; border-radius: 5px; margin-top: 20px; }
    `;
    document.head.appendChild(style);

    // 3. Inject the main game script logic
    const script = document.createElement('script');
    script.id = 'paths-game-script';
    script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js';
    script.onload = () => {
        const fontAwesomeLink = document.createElement('link');
        fontAwesomeLink.id = 'fontawesome-styles';
        fontAwesomeLink.rel = "stylesheet";
        fontAwesomeLink.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.2/css/all.min.css";
        document.head.appendChild(fontAwesomeLink);

        const gameLogicScript = document.createElement('script');
        gameLogicScript.id = 'paths-game-logic';
        gameLogicScript.textContent = `
          (function() {
            // Game state variables
            let playerPos = { x: 1, y: 1, lastMove: null, onPath: true, errorsMade: 0 };
            let currentGridSize, pathLives, activeGame = null;
            let keydownHandler = null;
            const oppositeArrowIcons = { up: '<i class="fa-solid fa-down-long"></i>', down: '<i class="fa-solid fa-up-long"></i>', left: '<i class="fa-solid fa-right-long"></i>', right: '<i class="fa-solid fa-left-long"></i>' };

            // Cleanup function to reset game state
            function cleanup() {
                if (activeGame) {
                    activeGame = null;
                    $("#path-timer-bar-inner").stop();
                    if (keydownHandler) $(document).off("keydown", keydownHandler);
                }
            }

            // --- CORE GAME LOGIC ---

            // Starts a new game with the given settings
            function start(settings) {
                console.log("Starting Path Game with:", settings);
                cleanup();
                activeGame = "path";
                pathLives = settings.lives;
                playerPos.errorsMade = 0;
                playerPos.onPath = true;

                createPathGrid(settings.gridSize);
                generatePath(settings.gridSize);
                setInitialPlayerPosition();

                // NEW: Set grid size class for responsive icon sizing
                const pathGrid = document.getElementById('path-grid');
                if (pathGrid) {
                    pathGrid.className = '';
                    if (settings.gridSize <= 30) {
                        pathGrid.classList.add('grid-size-small');
                    } else if (settings.gridSize <= 50) {
                        pathGrid.classList.add('grid-size-medium');
                    } else {
                        pathGrid.classList.add('grid-size-large');
                    }
                }

                $("#path-container").css('display', 'flex');
                $("#path-timer-bar-inner").css("width", "100%").animate({ width: "0%" }, {
                    duration: settings.timeLimit,
                    easing: 'linear',
                    complete: () => endPathGame(false, "time")
                });

                // Set up the keydown listener for player movement
                keydownHandler = function(e) {
                    if (!activeGame) return;
                    e.preventDefault();
                    if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') tryMove('up');
                    else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') tryMove('down');
                    else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') tryMove('left');
                    else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') tryMove('right');
                };
                $(document).on("keydown", keydownHandler);
            }

            // Handles the end of the game (win or lose)
            function endPathGame(win, reason) {
                if (!activeGame) return;
                cleanup();
                $("#path-container").hide();
                $("#screen .path-play-again-btn").remove();
                $("#screen").show();

                if (win) {
                    $(".screen-icon").html('<i class="fa-solid fa-check"></i>');
                    $(".screen-text").html('Success! You found the path.');
                } else {
                    $(".screen-icon").html('<i class="fa-solid fa-xmark"></i>');
                    $(".screen-text").html(reason === 'time' ? 'You ran out of time!' : 'You made too many errors!');
                }

                let btn = $('<button class="path-play-again-btn">PLAY AGAIN</button>');
                btn.on('click', function() {
                    $("#screen").hide();
                    if (window.returnToConfigScreen) window.returnToConfigScreen();
                });
                $("#screen").append(btn);
            }

            // --- PLAYER MOVEMENT ---

            // Central function to handle all player movement attempts
            function tryMove(direction) {
                if (!activeGame) return;

                let targetX = playerPos.x;
                let targetY = playerPos.y;

                switch (direction) {
                    case 'up':    targetY++; break;
                    case 'down':  targetY--; break;
                    case 'left':  targetX--; break;
                    case 'right': targetX++; break;
                    default: return;
                }

                if (!playerPos.onPath) {
                    const isMovingBack = (direction === 'up' && playerPos.lastMove === 'down') ||
                                        (direction === 'down' && playerPos.lastMove === 'up') ||
                                        (direction === 'left' && playerPos.lastMove === 'right') ||
                                        (direction === 'right' && playerPos.lastMove === 'left');
                    if (!isMovingBack) {
                        return; // Prevent moving further off-path
                    }
                }

                if (targetX < 1 || targetX > currentGridSize || targetY < 1 || targetY > currentGridSize) {
                    return;
                }

                $(".player, .off-path-player").removeClass("player off-path-player").html("");

                playerPos.x = targetX;
                playerPos.y = targetY;
                playerPos.lastMove = direction;

                const targetSquare = $('[data-pathx="' + targetX + '"][data-pathy="' + targetY + '"]');

                if (targetSquare.hasClass("path-square")) {
                    playerPos.onPath = true;
                    targetSquare.addClass("player");
                    if (playerPos.y === currentGridSize) {
                        endPathGame(true); // Win condition
                    }
                } else {
                    playerPos.onPath = false;
                    playerPos.errorsMade++;
                    targetSquare.addClass("off-path-player").html(oppositeArrowIcons[direction]);
                    if (playerPos.errorsMade >= pathLives) {
                        endPathGame(false, "lives"); // Lose condition
                    }
                }
            }

            // --- GRID AND PATH GENERATION ---

            function createPathGrid(gridSize) {
                let addSquare = "";
                let gridTemplate = "1fr ".repeat(gridSize);
                playerPos.x = Math.ceil(gridSize/2);
                playerPos.y = 1;
                currentGridSize = gridSize;

                $("#path-grid").empty();
                for (let y = gridSize; y >= 1; y--) {
                    for (let x = 1; x <= gridSize; x++) {
                        addSquare += '<div class="path-grid-square" data-pathx="' + x + '" data-pathy="' + y + '"></div>';
                    }
                }
                $("#path-grid").append(addSquare).css({"grid-template-columns": gridTemplate, "grid-template-rows": gridTemplate});
            }

            function generatePath(gridSize) {
                const maxMove = 3;
                const currentCoords = { x: playerPos.x, y: playerPos.y };
                const addSquareToPath = (x, y) => {
                    $('[data-pathx="' + x + '"][data-pathy="' + y + '"]').addClass("path-square");
                };
                addSquareToPath(currentCoords.x, currentCoords.y);
                let possibleDirections = ["up", "left", "right"];
                let availableDirection = null;
                let lastDirection = null;
                while (currentCoords.y < gridSize) {
                    const randomDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                    const moveAmt = Math.floor(Math.random() * maxMove) + 1;
                    if (randomDirection === "left" && (currentCoords.x - moveAmt) <= 0) {
                        if (possibleDirections.length === 1) { possibleDirections = ["up"]; }
                        continue;
                    }
                    if (randomDirection === "right" && (currentCoords.x + moveAmt) >= gridSize) {
                        if (possibleDirections.length === 1) { possibleDirections = ["up"]; }
                        continue;
                    }
                    for (let i = 0; i < moveAmt; i++) {
                        if (randomDirection === "up") currentCoords.y++;
                        else if (randomDirection === "down") currentCoords.y--;
                        else if (randomDirection === "left") currentCoords.x--;
                        else if (randomDirection === "right") currentCoords.x++;
                        if (currentCoords.y <= gridSize) {
                            addSquareToPath(currentCoords.x, currentCoords.y);
                        }
                    }
                    if (randomDirection === "up" && moveAmt === 1) {
                        availableDirection = lastDirection;
                    } else {
                        availableDirection = null;
                    }
                    lastDirection = randomDirection;
                    if (randomDirection === "left" || randomDirection === "right") {
                        possibleDirections = ["up"];
                      } else {
                        possibleDirections = availableDirection ? [availableDirection] : ["left", "right"];
                      }
                }
            }

            function setInitialPlayerPosition() {
                $('[data-pathx="' + playerPos.x + '"][data-pathy="' + playerPos.y + '"]').addClass("player");
            }

            window.pathsGame = { start, cleanup };
          })();
        `;
        document.body.appendChild(gameLogicScript);
    };
    document.body.appendChild(script);

    return () => {
      document.getElementById('paths-game-styles')?.remove();
      document.getElementById('paths-game-script')?.remove();
      document.getElementById('fontawesome-styles')?.remove();
      document.getElementById('paths-game-logic')?.remove();
      if (window.pathsGame?.cleanup) {
        window.pathsGame.cleanup();
      }
      initEffectRan.current = false;
    };
  }, []);

  useEffect(() => {
    if (!configScreen) {
      setTimeout(() => {
        if (window.pathsGame?.start) {
          window.pathsGame.start({
            ...settings,
            timeLimit: settings.timeLimit * 1000,
          });
        }
      }, 100);
    } else {
      if (window.pathsGame?.cleanup) {
        window.pathsGame.cleanup();
      }
    }
  }, [configScreen, settings]);

  if (configScreen) {
    return (
      <div className="flex flex-col items-center mt-24 text-white p-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-6 flex flex-col items-center">
          <FaRoute className="w-16 h-16 mb-4 text-[#23af57]" />
          <h1 className="text-3xl font-bold mb-2">Paths Game</h1>
          <p className="text-lg mb-8 text-gray-400">Configure Your Maze</p>
          <div className="w-full space-y-6">
            <div>
              <label className="block text-sm mb-2">Grid Size: {settings.gridSize}x{settings.gridSize}</label>
              <Slider
                value={[settings.gridSize]}
                onValueChange={([val]) => setSettings(s => ({ ...s, gridSize: val % 2 === 0 ? val + 1 : val }))}
                min={5} max={59} step={2}
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Lives: {settings.lives}</label>
              <Slider
                value={[settings.lives]}
                onValueChange={([val]) => setSettings(s => ({ ...s, lives: val }))}
                min={1} max={5} step={1}
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Time Limit: {settings.timeLimit} seconds</label>
              <Slider
                value={[settings.timeLimit]}
                onValueChange={([val]) => setSettings(s => ({ ...s, timeLimit: val }))}
                min={10} max={90} step={5}
              />
            </div>
          </div>
          <Button
            size="lg"
            onClick={startGame}
            className="bg-[#23af57] hover:bg-[#1f9a4c] mt-8 w-full max-w-xs transition-all"
          >
            PLAY NOW
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="game-container" className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 opacity-30 rounded-full blur-3xl animate-pulse z-0" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-to-br from-pink-400 via-indigo-400 to-blue-400 opacity-30 rounded-full blur-3xl animate-pulse z-0" />
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 -z-10" />
        <div id="screen" style={{display: "none"}}>
            <div className="screen-icon"></div>
            <div className="screen-text"></div>
        </div>
        <div id="path-container" className="relative z-10">
            <div id="path-grid"></div>
            <div className="timer-container">
                <div className="timer-outer">
                    <div id="path-timer-bar-inner" className="timer-inner"></div>
                </div>
            </div>
                  <div className="flex flex-col items-center mt-8">
        <button
          className="w-32 bg-red-500 hover:opacity-80 transition-all text-white rounded py-2 font-bold"
          onClick={() => setConfigScreen(true)}
        >
          Restart
        </button>
      </div>
        </div>
      </div>
    </>
  );
}