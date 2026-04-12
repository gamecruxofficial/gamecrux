"use client";

import { useEffect, useState, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CircleUserRound } from 'lucide-react';

// Define the global window interface for our game's functions
declare global {
  interface Window {
    spotGame?: {
      start: (settings: any) => void;
      reset: () => void;
    };
    showConfigScreen?: () => void;
  }
}

export default function SpotPage() {
  const [configScreen, setConfigScreen] = useState(true);
  const [settings, setSettings] = useState({
    gridSize: 5,
    charSet: 'alphabet',
    timeLimit: 10,
    required: 5
  });

  // This ref ensures the setup effect runs only once
  const initEffectRan = useRef(false);

  const charSetOptions = {
    'alphabet': 'Alphabet',
    'numeric': 'Numbers',
    'alphanumeric': 'Mixed',
    'greek': 'Greek',
    'runes': 'Runes',
    'braille': 'Braille'
  };

  const startGame = () => {
    setConfigScreen(false);
  };

  // This useEffect runs only ONCE to inject the game's styles and logic.
  useEffect(() => {
    if (initEffectRan.current || typeof window === 'undefined') return;
    initEffectRan.current = true;

    // --- 1. Inject CSS ---
    const style = document.createElement('style');
    style.id = 'spot-game-styles';
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&family=Roboto:wght@400;500;700&display=swap');
        :root {
            --background-1: #0e111a;
            --background-2: #0e111bcc;
            --action-1: #23af57;
            --action-2: #d71f3e;
            --timer: #d71f3e;
        }
        #screen {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: var(--background-1);
            color: white;
            font-family: "Roboto", sans-serif;
            font-size: 1.5vh;
            font-weight: 600;
            height: 63.3vmin;
            width: 60vmin;
            padding: 1vh;
            z-index: 10;
        }
        #spot-container {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            font-family: "Roboto", sans-serif;
            text-transform: uppercase;
        }
        #spot-target {
            background-color: var(--background-2);
            border: 2px solid white;
            color: white;
            font-size: 7vh;
            font-weight: 600;
            text-align: center;
            margin: auto;
            margin-bottom: 1vh;
            width: 8.5vh;
            height: 8.5vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #spot-grid {
            display: grid;
            background-color: var(--background-1);
            gap: 0.5vmin;
            height: 60vmin;
            width: 60vmin;
            padding: 1vh;
        }
        .timer-container {
            padding: 1.4vh 2vh 1.7vh;
            background-color: var(--background-1);
        }
        .timer-outer {
            height: 0.6vh;
            width: 100%;
            background-color: rgb(36, 36, 36);
            border-radius: 2vh;
        }
        .timer-inner {
            height: 100%;
            width: 100%;
            background-color: var(--timer);
            border-radius: 2vh;
        }
        .spot-grid-square {
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgb(25, 25, 25);
            color: white;
            font-size: 3.5vh;
            transition: background-color 0.2s;
        }
        .spot-grid-square:hover {
            background-color: var(--action-2);
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    // --- 2. Inject jQuery and then the Game Logic ---
    const jqueryScript = document.createElement('script');
    jqueryScript.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js';
    jqueryScript.onload = () => {
        const gameScript = document.createElement('script');
        gameScript.id = 'spot-game-logic';
        gameScript.textContent = `
          (function() {
            const charSets = {
              numeric: "0123456789",
              alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
              alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
              greek: "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ",
              runes: "ᚠᚥᚧᚨᚩᚬᚭᚻᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛤ",
              braille: "⡀⡁⡂⡃⡄⡅⡆⡇⡈⡉⡊⡋⡌⡍⡎⡏⡐⡑⡒⡓⡔⡕⡖⡗⡘⡙⡚⡛⡜⡝⡞⡟⡠⡡⡢⡣⡤⡥⡦⡧⡨⡩⡪⡫⡬⡭⡮⡯⡰⡱⡲⡳⡴⡵⡶⡷⡸⡹⡺⡻⡼⡽⡾⡿⢀⢁⢂⢃⢄⢅⢆⢇⢈⢉⢊⢋⢌⢍⢎⢏⢐⢑⢒⢓⢔⢕⢖⢗⢘⢙⢚⢛⢜⢝⢞⢟⢠⢡⢢⢣⢤⢥⢦⢧⢨⢩⢪⢫⢬⢭⢮⢯⢰⢱⢲⢳⢴⢵⢶⢷⢸⢹⢺⢻⢼⢽⢾⢿⣀⣁⣂⣃⣄⣅⣆⣇⣈⣉⣊⣋⣌⣍⣎⣏⣐⣑⣒⣓⣔⣕⣖⣗⣘⣙⣚⣛⣜⣝⣞⣟⣠⣡⣢⣣⣤⣥⣦⣧⣨⣩⣪⣫⣬⣭⣮⣯⣰⣱⣲⣳⣴⣵⣶⣷⣸⣹⣺⣻⣼⣽⣾⣿"
            };
            const state = {
                gridSize: 5,
                charSet: charSets.alphabet,
                targetChar: null,
                timerDuration: 5000,
                required: 10,
                currentScore: 0,
                spotInterval: null,
                preventClick: false,
                activeGame: false,
                currentSpot: null
            };

            function createGrid(gridSize) {
                const squares = gridSize * gridSize;
                const gridTemplate = \`1fr \`.repeat(gridSize);
                $("#spot-grid").empty().append(
                    Array.from({ length: squares }, (_, i) =>
                        \`<div class="spot-grid-square" data-spot="\${i}"><div class="spot-square-text">?</div></div>\`
                    ).join('')
                ).css({"grid-template-columns": gridTemplate, "grid-template-rows": gridTemplate});
            }

            function updateSpotSquares() {
                clearInterval(state.spotInterval);
                state.spotInterval = setInterval(() => {
                    const randomSquare = Math.floor(Math.random() * state.gridSize * state.gridSize);
                    if (randomSquare === state.currentSpot) return;
                    let randomChar;
                    do {
                        randomChar = state.charSet[Math.floor(Math.random() * state.charSet.length)];
                    } while (randomChar === state.targetChar);
                    $('[data-spot=' + randomSquare + '] .spot-square-text').fadeOut(300, function() {
                        $(this).text(randomChar).fadeIn(300);
                    });
                }, 30);
            }

            function resetTimer() {
                $("#spot-timer-bar-inner").stop().css("width", "100%").animate({
                    width: "0%",
                }, {
                    duration: state.timerDuration,
                    easing: 'linear',
                    complete: () => endGame(false)
                });
            }

            function start(settings) {
                state.activeGame = true;
                state.gridSize = settings.gridSize > 10 ? 10 : settings.gridSize;
                state.charSet = charSets[settings.charSet];
                state.timerDuration = settings.timeLimit;
                state.required = settings.required;
                state.currentScore = 0;
                state.targetChar = state.charSet[Math.floor(Math.random() * state.charSet.length)];
                createGrid(state.gridSize);
                $("#spot-container, #spot-grid, #spot-timer-container, #spot-target").show();
                $("#screen").hide();
                newTarget(true);
            }

            function newTarget(isFirst = false) {
                let newSpot;
                do {
                    newSpot = Math.floor(Math.random() * state.gridSize * state.gridSize);
                } while (newSpot === state.currentSpot);
                state.currentSpot = newSpot;
                $("#spot-target").text(state.targetChar);
                $('[data-spot=' + state.currentSpot + '] .spot-square-text')
                    .stop(true, true)
                    .css({ 'opacity': 1 })
                    .text(state.targetChar);
                for (let i = 0; i < state.gridSize * state.gridSize; i++) {
                    if (i === state.currentSpot) continue;
                    let randomChar;
                    do {
                        randomChar = state.charSet[Math.floor(Math.random() * state.charSet.length)];
                    } while (randomChar === state.targetChar);
                    $('[data-spot=' + i + '] .spot-square-text').text(randomChar);
                }
                updateSpotSquares();
                resetTimer();
                state.preventClick = false;
            }

            function endGame(win) {
                if (!state.activeGame) return;
                reset();
                $("#spot-container").hide();
                $("#screen").show();
                if (win) {
                    $(".screen-text").text("SUCCESS!");
                    $(".screen-icon").text("🎉");
                } else {
                    $(".screen-text").text("TIME'S UP!");
                    $(".screen-icon").text("⏰");
                }
                $("#play-again-btn").show();
            }

            function reset() {
                state.activeGame = false;
                clearInterval(state.spotInterval);
                $("#spot-timer-bar-inner").stop();
                $("#spot-container, #screen").hide();
                $("#play-again-btn").hide();
            }

            $("#spot-grid").on("click", ".spot-grid-square", function() {
                if (state.preventClick || !state.activeGame) return;
                if ($(this).data("spot") == state.currentSpot) {
                    state.preventClick = true;
                    state.currentScore++;
                    if (state.currentScore >= state.required) {
                        endGame(true);
                        return;
                    }
                    newTarget();
                }
            });

            $("#play-again-btn").on('click', function() {
                if (window.showConfigScreen) {
                    window.showConfigScreen();
                }
            });

            window.spotGame = { start, reset };
          })();
        `;
        document.head.appendChild(gameScript);
    };
    document.head.appendChild(jqueryScript);

    // --- 3. Setup Bridge from Game to React ---
    window.showConfigScreen = () => {
      setConfigScreen(true);
    };

    // --- 4. Cleanup ---
    return () => {
      if (window.spotGame?.reset) window.spotGame.reset();
      document.getElementById('spot-game-styles')?.remove();
      document.getElementById('spot-game-logic')?.remove();
      const jquery = document.querySelector('script[src*="jquery"]');
      if (jquery) jquery.remove();
      initEffectRan.current = false;
    };
  }, []);

  // This useEffect syncs the game state with the React state.
  useEffect(() => {
    if (initEffectRan.current) {
      if (!configScreen) {
        setTimeout(() => {
          if (window.spotGame?.start) {
            window.spotGame.start({
              ...settings,
              timeLimit: settings.timeLimit * 1000
            });
          }
        }, 50);
      } else {
        if (window.spotGame?.reset) {
          window.spotGame.reset();
        }
      }
    }
  }, [configScreen, settings]);

  return (
    <>
      {configScreen && (
        <div className="flex flex-col items-center justify-center mt-24 text-white p-4">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-6 flex flex-col items-center">
            <CircleUserRound className="w-16 h-16 mb-4" />
            <h1 className="text-3xl font-bold mb-2">Spot Game</h1>
            <p className="text-lg mb-8 text-gray-400">Configure Your Challenge</p>
            <div className="w-full space-y-6">
              <div>
                <label className="block text-sm mb-2">Grid Size: {settings.gridSize}x{settings.gridSize}</label>
                <Slider value={[settings.gridSize]} onValueChange={([v]) => setSettings(s => ({ ...s, gridSize: v }))} min={3} max={10} step={1} />
              </div>
              <div>
                <label className="block text-sm mb-2">Time Limit: {settings.timeLimit}s</label>
                <Slider value={[settings.timeLimit]} onValueChange={([v]) => setSettings(s => ({ ...s, timeLimit: v }))} min={3} max={30} step={1} />
              </div>
              <div>
                <label className="block text-sm mb-2">Targets Required: {settings.required}</label>
                <Slider value={[settings.required]} onValueChange={([v]) => setSettings(s => ({ ...s, required: v }))} min={3} max={20} step={1} />
              </div>
              <div>
                <label className="block text-sm mb-2">Character Set: {charSetOptions[settings.charSet]}</label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {Object.entries(charSetOptions).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setSettings(s => ({ ...s, charSet: key }))}
                      className={`p-2 text-sm rounded transition-colors ${settings.charSet === key ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <Button onClick={startGame} size="lg" className="bg-[#23af57] hover:bg-[#1f9a4c] mt-8 w-full max-w-xs transition-all">
              PLAY NOW
            </Button>
          </div>
        </div>
      )}

      {/* --- Game View Container: Always rendered, but hidden via CSS --- */}
      <div className={`${configScreen ? 'hidden' : 'flex flex-col items-center w-full mt-12'}`}>
        
        {/* Game Wrapper: takes up space and provides positioning context */}
        <div className="spot-game-wrapper relative h-[75vmin] w-[65vmin]">
          <div id="spot-container" style={{ display: 'none' }}>
            <div id="spot-target" style={{ display: 'none' }}></div>
            <div id="spot-grid" style={{ display: 'none' }}></div>
            <div id="spot-timer-container" className="timer-container" style={{ display: 'none' }}>
              <div id="spot-timer-bar-outer" className="timer-outer">
                <div id="spot-timer-bar-inner" className="timer-inner"></div>
              </div>
            </div>
          </div>
          <div id="screen" style={{ display: 'none' }}>
            <div className="screen-icon"></div>
            <div className="screen-text"></div>
            <button id="play-again-btn" style={{ display: 'none', marginTop: '2vh', padding: '1vh 2vh', backgroundColor: '#2c465e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1.5vh', fontWeight: 600 }}>
              PLAY AGAIN
            </button>
          </div>
        </div>
        
        {/* Restart Button: now correctly positioned below the game container */}
        <div className="flex flex-col items-center mt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={() => {
              if (window.spotGame?.reset) window.spotGame.reset();
              setConfigScreen(true);
            }}
            className="w-32 bg-red-500 hover:bg-red-500 hover:text-white hover:opacity-80 transition-all text-white"
          >
            Restart 
          </Button>
        </div>
      </div>
    </>
  );
}