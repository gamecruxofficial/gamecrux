"use client";

import { useState, useEffect } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CircleUserRound } from 'lucide-react';

export default function StickGamePage() {
  const [configScreen, setConfigScreen] = useState(true);
  const [gameSettings, setGameSettings] = useState({
    level: 7,
    time: 60,
    speed: 1.5
  });

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: Arial, sans-serif;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #000000;
        overflow: hidden; /* Prevent scrollbars */
      }

      #game-container {
        position: absolute;
        width: 100vw;
        height: 100vh;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .game-container {
        width: 30%;
        height: 65%;
        position: absolute;
        top: 50%;
        left: 50%;
        text-align: center;
        display: flex;
        transform: translate(-50%, -50%) rotate(90deg);
        justify-content: center;
        align-items: center ;
      }

      .game-container .bg{
        width: 95%;
        position: absolute;
        height: 100%;
        left: 0%;
        transform: rotate(-90deg);
        top: 0%;
        z-index: -1;
      }

      .game-container .user{
        position: absolute;
        width: 3.5%;
        height: 3.5%;
        left: -7%;
        transform: rotate(-90deg);
        top: 81%;
        z-index: 1;
      }

      .game-header h1 {
        font-size: 1.6vh;
        position: absolute;
        top: 71%;
        left: -16.5%;
        transform: rotate(-90deg);
      }

      .game-header p {
        font-size: 1vh;
        position: absolute;
        top: 66%;
        left: -20%;
        transform: rotate(-90deg);
        color: rgb(119, 119, 119,0.5);
      }

      .game-circle {
        position: relative;
        margin: 20px auto;
        width: 10vh;
        height: 10vh;
        transform: rotate(140deg);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        left: -3%;
        align-items: center;
        z-index: 1;
      }

      .zort-circle {
        position: absolute;
        margin: 20px auto;
        left: 33%;
        width: 15vh;
        height: 15vh;
        background: radial-gradient(circle, #FFD700 20%, #FFFACD 100%); /* Changed from #52E8BD to yellow */
        box-shadow: 0 0 30px #FFD700; /* Changed from #52E8BD to yellow */
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        z-index: 2;
      }

      .circle-number {
        z-index: 3;
        position: absolute;
        font-size: 4.5vh;
        font-weight: bold;
        transform: rotate(-90deg);
        color: black;
      }

      .circle{
        z-index: 9999999;
        width: 50%;
        height: 50%;
        position: absolute;
      }

      .circle-links {
        position: absolute;
        width: 100%;
        height: 100%;
        z-index: 1;
      }

      .circles-container {
        display: flex;
        justify-content: start;
        flex-direction: column;
        position: absolute;
        top: 32.5%;
        left: 70%;
        transform: rotate(-90deg);
        width: 5vh;
        height: 20vh;
        overflow: hidden;
      }

      .circle-option {
        position: relative;
        top: 74%;
        border: 0.3vh solid #FFD700; /* Changed from #41ffcb to yellow */
        background-color: #8B7300; /* Changed from #4B8171 to darker yellow */
        width: 2vh;
        height: 2vh;
        z-index: 5;
        border-radius: 50%;
        margin-top: 10%;
        color: black;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1vh;
      }

      .circle-option:hover {
        background-color: #FFD700; /* Changed from #34d2a0 to yellow */
      }

      .spoke-container {
        position: absolute;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        transform-origin: center;
      }

      .dot {
        width: 2vh;
        height: 2vh;
        border: 0.3vh solid #FFD700; /* Changed from #41ffcb to yellow */
        background-color: #8B7300; /* Changed from #4B8171 to darker yellow */
        border-radius: 50%;
        position: absolute;
        z-index: 5;
        transform: translate(-50%, -50%);
      }

      .line {
        height: 1vh;
        background-color: #FFD700; /* Changed from #52E8BD to yellow */
        position: absolute;
        transform-origin: 0 50%;
        left: 50%;
        top: 50%;
        z-index: 1;
      }

      .timer-container {
        background: rgba(255, 255, 255, 0.14);
        display: flex;
        width: 80%;
        height: 1vh;
        position: absolute;
        margin-top: auto;
        overflow: hidden;
        transform: rotate(-90deg);
        left: 61%;
        border-radius: 0.2vh;
      }

      .timer-progress-bar {
        transition: width 1s linear;
        background-color: #E85261; /* Changed from #52E8BD to red */
        width: 100%;
        height: 100%;
      }

      .play-again-btn {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #2c465e;
        color: white;
        padding: 10px 20px;
        font-size: 1.2em;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        z-index: 999;
      }

      .play-again-btn:hover {
        background-color: #425e79;
      }
    `;
    document.head.appendChild(style);

    function initStickGame() {
      // Inject HTML
      const gameContainer = document.getElementById('game-container');

      if (gameContainer && !configScreen) {
        gameContainer.innerHTML = `
          <div class="game-container">
            <div class="zort-circle">
              <div class="circle-number">0</div>
            </div>
            <div class="game-header">
              <div class="timer-container">
                <div class="timer-progress-bar"></div>
              </div>
            </div>
            <div class="game-circle" id="gameCircle">
              <div class="circle-links" id="circleLinks"></div>
            </div>
            <div class="game-info"></div>
            <div class="circles-container"></div>
          </div>
        `;

        // Inject JavaScript with proper error handling
        let occupiedPositions: number[] = [];
        let totalPositions = 36;
        let rotationAngle = 160;
        const circleLinks = document.getElementById("circleLinks");
        const gameCircle = document.getElementById("gameCircle");
        let direction = 1;
        let totalSeconds = gameSettings.time;
        let level = gameSettings.level;
        let isGameRunning = true;
        let canClick = true;
        let interval: NodeJS.Timeout | null = null;
        let rotationSpeed = gameSettings.speed;
        let animationFrameId: number | null = null;

        // Define clickHandler first
        const clickHandler = () => {
          if (canClick) {
            const circlesContainer = document.querySelector(".circles-container");

            if (circlesContainer && circlesContainer.children.length > 0) {
              const firstChild = circlesContainer.firstChild as HTMLElement;

              firstChild.style.transition = 'transform 0.1s ease, opacity 0.1s ease';
              firstChild.style.transform = 'translateY(-50px)';
              firstChild.style.opacity = '0';

              setTimeout(() => {
                sendCircle(circlesContainer.children.length);
                if (firstChild.parentNode) {
                  circlesContainer.removeChild(firstChild);
                }
              }, 100);
            }
          }
        };

        // Now define returnToConfigScreen after all variables are declared
        const returnToConfigScreen = () => {
          // Clear the game container first
          if (gameContainer) {
            gameContainer.innerHTML = '';
          }

          // Clean up any running processes
          if (interval) {
            clearInterval(interval);
            interval = null;
          }

          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
          }

          document.removeEventListener('click', clickHandler);

          // Then set the config screen state to true
          setConfigScreen(true);
        };

        function startGame(data: any) {
          data = data || { level: gameSettings.level, time: gameSettings.time, speed: gameSettings.speed };
          level = data.level;
          totalSeconds = data.time;
          rotationSpeed = data.speed;

          resetGame();
          runTimer(totalSeconds);
        }

        function initLevelCircles() {
          const circlesContainer = document.querySelector(".circles-container");
          if (!circlesContainer) return;
          circlesContainer.innerHTML = '';

          for (let i = level; i >= 1; i--) {
            const circleOption = document.createElement('div');
            circleOption.classList.add('circle-option');
            circleOption.textContent = i.toString();
            circlesContainer.appendChild(circleOption);
          }
        }

        function sendCircle(currentLevel: number) {
          const currentRotation = rotationAngle % 360;
          const adjustedPosition = Math.round(currentRotation / (360 / totalPositions)) % totalPositions;

          if (occupiedPositions.includes(adjustedPosition)) {
            isGameRunning = false;
            canClick = false;

            if (animationFrameId) {
              cancelAnimationFrame(animationFrameId);
              animationFrameId = null;
            }

            // Stop the timer
            if (interval) {
              clearInterval(interval);
              interval = null;
            }

            // Check if jQuery is available before using it
            if (typeof (window as any).$ !== 'undefined') {
              const $ = (window as any).$;
              $('.line').css('background', '#E85261');
              // Timer is already red, so no need to change
              $('.zort-circle').css({'background':'radial-gradient(circle, #E85261 40%, #D9FFFF 100%)','box-shadow':'0 0 30px #E85261'});
              $('.circle-number').text('FAIL');
              $('.dot').css({'background':'#682A30','border':'0.3vh solid #E85261'});
              $('.circle-option').css({'background':'#682A30','border':'0.3vh solid #E85261'});
            }

            // Add play again button
            const playAgainButton = document.createElement('button');
            playAgainButton.innerText = "PLAY AGAIN";
            playAgainButton.classList.add('play-again-btn');
            playAgainButton.addEventListener('click', returnToConfigScreen);
            gameContainer.appendChild(playAgainButton);

            return;
          }

          occupiedPositions.push(adjustedPosition);

          if (!circleLinks) return;

          const dot = document.createElement('div');
          dot.classList.add('dot');

          const line = document.createElement('div');
          line.classList.add('line');

          const angle = (360 / totalPositions) * adjustedPosition;
          const radius = 180;

          let angleValue = angle < 0 ? Math.abs(angle) + "deg" : "-" + angle + "deg";

          line.style.position = 'absolute';
          line.style.width = `${radius}px`;
          line.style.height = '0.5vh';
          line.style.backgroundColor = '#FFD700'; // Changed from #52E8BD to yellow
          line.style.transformOrigin = '0 50%';
          line.style.transform = `rotate(${angleValue})`;
          line.style.left = '50%';
          line.style.top = '50%';
          line.style.zIndex = '1';

          const x = radius * Math.cos((angle * Math.PI) / 180);
          const y = radius * Math.sin((angle * Math.PI) / 180);

          dot.style.position = 'absolute';
          dot.style.left = `calc(50% + ${x}px)`;
          dot.style.top = `calc(50% - ${y}px)`;

          circleLinks.appendChild(line);
          circleLinks.appendChild(dot);

          direction = -direction;

          if (typeof (window as any).$ !== 'undefined') {
            const $ = (window as any).$;
            $('.circle-number').text(occupiedPositions.length);

            if (currentLevel === 1) {
              isGameRunning = false;
              canClick = false;

              if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
              }

              // Stop the timer
              if (interval) {
                clearInterval(interval);
                interval = null;
              }

              $('.line').css('background', '#FFD700'); // Changed from #34d2a0 to yellow
              // Timer remains red
              $('.zort-circle').css({'background':'radial-gradient(circle, #FFD700 40%, #FFFACD 100%)','box-shadow':'0 0 30px #FFD700'}); // Changed to yellow
              $('.circle-number').text('WIN');
              $('.dot').css({'background':'#FFD700','border':'0.3vh solid #FFD700'}); // Changed to yellow
              $('.circle-option').css({'background':'#FFD700','border':'0.3vh solid #FFD700'}); // Changed to yellow

              // Add play again button
              const playAgainButton = document.createElement('button');
              playAgainButton.innerText = "PLAY AGAIN";
              playAgainButton.classList.add('play-again-btn');
              playAgainButton.addEventListener('click', returnToConfigScreen);
              gameContainer.appendChild(playAgainButton);
            }
          }
        }

        function updateRotation() {
          if (isGameRunning && gameCircle) {
            rotationAngle += direction * rotationSpeed;
            gameCircle.style.transform = `rotate(${rotationAngle}deg)`;
            animationFrameId = requestAnimationFrame(updateRotation);
          }
        }

        function runTimer(seconds: number) {
          const timerProgress = document.querySelector(".timer-progress-bar") as HTMLElement;
          if (!timerProgress) return;

          const timeInterval = 1000;

          if (interval) {
            clearInterval(interval);
          }

          interval = setInterval(() => {
            if (seconds > 0) {
              seconds--;
              const percentage = (seconds / totalSeconds) * 100;
              timerProgress.style.width = percentage + "%";
            } else {
              if (interval) clearInterval(interval);
              timerProgress.style.width = "0%";

              // Time's up - game over
              isGameRunning = false;
              canClick = false;

              if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
              }

              if (typeof (window as any).$ !== 'undefined') {
                const $ = (window as any).$;
                $('.line').css('background', '#E85261');
                $('.timer-progress-bar').css('background', '#E85261');
                $('.zort-circle').css({'background':'radial-gradient(circle, #E85261 40%, #D9FFFF 100%)','box-shadow':'0 0 30px #E85261'});
                $('.circle-number').text('FAIL');
                $('.dot').css({'background':'#682A30','border':'0.3vh solid #E85261'});
                $('.circle-option').css({'background':'#682A30','border':'0.3vh solid #E85261'});
              }

              // Add play again button
              const playAgainButton = document.createElement('button');
              playAgainButton.innerText = "PLAY AGAIN";
              playAgainButton.classList.add('play-again-btn');
              playAgainButton.addEventListener('click', returnToConfigScreen);
              gameContainer.appendChild(playAgainButton);
            }
          }, timeInterval);
        }

        function resetGame() {
          if (typeof (window as any).$ !== 'undefined') {
            const $ = (window as any).$;
            $('.line').remove();
            $('.dot').remove();
            $('.circle-option').remove();
            $('.circle-number').text('0');
            // Timer remains red
            $('.zort-circle').css({'background':'radial-gradient(circle, #FFD700 40%, #FFFACD 100%)','box-shadow':'0 0 30px #FFD700'}); // Changed to yellow
            $('.play-again-btn').remove();
          }

          occupiedPositions = [];
          initLevelCircles();
          isGameRunning = true;
          canClick = true;
          updateRotation();
        }

        document.addEventListener('click', clickHandler);

        // Auto-start the game
        startGame(gameSettings);
        updateRotation();

        // Cleanup event listener
        return () => {
          document.removeEventListener('click', clickHandler);
          if (interval) clearInterval(interval);
        };
      }
    }

    // Include jQuery if not already loaded
    if (typeof (window as any).$ === 'undefined') {
      const jqueryScript = document.createElement('script');
      jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.js';
      jqueryScript.onload = () => initStickGame();
      document.head.appendChild(jqueryScript);
    } else {
      initStickGame();
    }

    // Cleanup function
    return () => {
      const styles = document.querySelectorAll('style');
      const scripts = document.querySelectorAll('script');
      styles.forEach(style => {
        if (style.textContent && style.textContent.includes('.game-container')) {
          try {
            document.head.removeChild(style);
          } catch (e) {
            // Element might already be removed
          }
        }
      });
      scripts.forEach(script => {
        if (script.src && script.src.includes('jquery')) {
          try {
            document.head.removeChild(script);
          } catch (e) {
            // Element might already be removed
          }
        }
      });
    };
  }, [configScreen, gameSettings]);

  const startGame = () => {
    setConfigScreen(false);
  };

  if (configScreen) {
    return (
      <div className="flex flex-col items-center mt-24 text-white p-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg mb-6 flex flex-col items-center">
          <CircleUserRound className="w-16 h-16 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Stick Game</h1>
          <span className="text-lg mb-8 text-gray-400">Proof of Training Required</span>
          <div className="w-full">
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Sticks: {gameSettings.level}</label>
                <Slider
                  value={[gameSettings.level]}
                  onValueChange={([value]) => setGameSettings(prev => ({ ...prev, level: value }))}
                  min={3}
                  max={15}
                  step={1}
                  className="bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Time: {gameSettings.time}s</label>
                <Slider
                  value={[gameSettings.time]}
                  onValueChange={([value]) => setGameSettings(prev => ({ ...prev, time: value }))}
                  min={10}
                  max={120}
                  step={5}
                  className="bg-gray-800"
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Speed: {gameSettings.speed}</label>
                <Slider
                  value={[gameSettings.speed]}
                  onValueChange={([value]) => setGameSettings(prev => ({ ...prev, speed: value }))}
                  min={0.5}
                  max={3}
                  step={0.1}
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

  return <div id="game-container"></div>;
}
