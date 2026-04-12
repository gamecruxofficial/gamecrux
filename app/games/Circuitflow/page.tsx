"use client";

import { useEffect, useState, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CircleUserRound } from 'lucide-react';

export default function CircuitFlowPage() {
  const [configScreen, setConfigScreen] = useState(true);
  const [settings, setSettings] = useState({
    difficulty: "hard", // Default difficulty
    strikes: 3 // Default number of strikes allowed
  });

  // Create refs to track component state and script injection
  const isMounted = useRef(true);
  const scriptInjected = useRef(false);

  // Set up global callback once
  useEffect(() => {
    // Set up a global callback that can be called from the injected script
    window.returnToConfigScreen = () => {
      if (isMounted.current) {
        // First, stop all timers immediately
        if (window.stopAllGameTimers && typeof window.stopAllGameTimers === 'function') {
          try {
            window.stopAllGameTimers();
          } catch (e) {
            console.log('Error stopping timers:', e);
          }
        }

        // Clean up scripts
        const gameScript = document.getElementById('circuitflow-script');
        if (gameScript && document.head.contains(gameScript)) {
          document.head.removeChild(gameScript);
        }

        // Clear the game container immediately before changing React state
        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
          gameContainer.innerHTML = '';
        }

        // Reset the script injection flag
        scriptInjected.current = false;

        // Finally, update React state
        setConfigScreen(true);
      }
    };

    return () => {
      // Cleanup when component unmounts
      isMounted.current = false;
      delete window.returnToConfigScreen;
      delete window.stopAllGameTimers;
    };
  }, []);

  // Handle CSS injection separately from script injection
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined' || !document.head) return;

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
      /* Remove global body styling that affects the entire page */
      /* Only style elements within #game-container */
      #game-container {
          font-family: sans-serif;
      }

      #game-container .title{
          text-align: center;
          color: white;
      }
      #game-container .description{
          text-align: center;
          color: gray;
      }

      #game-container .minigame{
          margin: 0 auto 20px;
          width: 640px;
          min-width: 640px;
          max-width: 640px;
          height: 640px;
          min-height: 640px;
          max-height: 640px;
          background-color: #232832;
          padding: 0;
          position: relative;
      }
      #game-container .splash{
          display: inline-block;
          width: 100%;
          text-align: center;
          color: white;
          font-size: 16px;
          margin-top: 240px;
      }
      #game-container .splash .hacker{
          font-size: 65px;
          margin-bottom: 30px;
      }
      #game-container .minigame > .hack > .bar {
          background-color: #1a5026;
          width: 100%;
          height: 64px;
          margin-top: 64px;
          display: inline-block;
          position: absolute;
      }
      #game-container .minigame .letters {
          position: absolute;
      }

      #game-container .minigame .letter {
          position: absolute;
          color: white;
          font-size: 60px;
          top: 590px;
          text-transform: uppercase;
      }
      #game-container .letters .letter.pos1 {
          margin-left: 60px;
      }
      #game-container .letters .letter.pos2 {
          margin-left: 220px;
      }
      #game-container .letters .letter.pos3 {
          margin-left: 387px;
      }
      #game-container .letters .letter.pos4 {
          margin-left: 540px;
      }
      #game-container .letters .letter.red{
          color: red;
      }
      #game-container .letters .letter.green{
          color: #0ee00e;
      }
      #game-container .hidden {
          display: none;
      }
      #game-container .restart{
          text-align: center;
      }
      #game-container .btn_back {
          padding: 6px 15px;
          font-weight: bold;
          color: white;
          background-color: #028000;
      }

      #game-container .progress-container {
        width: 90%;
        margin: 15px auto 0;
        background-color: #232832;
        height: 8px;
        border-radius: 4px;
        overflow: hidden;
        position: absolute;
        bottom: 15px;
        left: 5%;
        right: 5%;
      }
      #game-container .progress-bar {
        height: 100%;
        background: #ff0000;
        border-radius: 4px;
        transition: width 0.05s linear;
        width: 100%;
      }

      #game-container .result-message {
          position: absolute;
          top: 40%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(0, 0, 0, 0.7);
          padding: 15px;
          border-radius: 5px;
          color: white;
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          width: 80%;
      }

      #game-container .result-success {
          color: #00ff00;
      }

      #game-container .result-failure {
          color: #ff0000;
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      if (document.head && document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Handle game initialization when config screen changes
  useEffect(() => {
    // Only initialize game when not in config screen
    if (configScreen || typeof window === 'undefined') return;

    // Avoid re-injecting script if it's already injected
    if (scriptInjected.current) return;

    // Mark script as injected
    scriptInjected.current = true;

    // Load MoJS library
    const loadMoJS = new Promise((resolve) => {
      if (!document.head) return resolve();
      const mojsScript = document.createElement('script');
      mojsScript.src = 'https://cdn.jsdelivr.net/npm/@mojs/core@1.2.1/dist/mo.umd.min.js';
      mojsScript.async = false;
      mojsScript.onload = () => resolve();
      document.head.appendChild(mojsScript);
    });

    loadMoJS.then(() => {
      // Inject HTML
      const gameContainer = document.getElementById('game-container');
      if (!gameContainer) return; // Prevent error if container is missing

      gameContainer.innerHTML = `
        <div class="minigame">
          <div class="splash"><div class="fa hacker">⌨️</div><span class="text">Pattern recognition required...</span></div>
          <div class="hack hidden">
            <div class="bar"></div>
            <div class="letters"></div>
          </div>
          <div class="progress-container">
            <div class="progress-bar"></div>
          </div>
        </div>
        <div class="restart"><button class="btn_back">BACK</button></div>
      `;

      // Inject JavaScript
      if (!document.head) return; // Prevent error if head is missing
      const script = document.createElement('script');
      script.id = 'circuitflow-script';
      script.textContent = `
        // Make sure global variables are scoped to avoid redeclaration issues
        (function() {
          let timer_start, timer_game, timer_finish, timer_time, timer_hide, letters, difficulty, valid_keys, timerStart;
          let game_started = false;
          let streak = 0;
          let max_streak = 0;
          let best_time = 0;
          let maxTime = 30; // Max time in seconds
          let strikesAllowed = ${settings.strikes}; // Max number of strikes allowed
          let currentStrikes = 0; // Current number of strikes

          // Define these helper functions at the top before using them
          const random = (min, max) => {
              return Math.floor(Math.random() * (max - min + 1)) + min;
          }

          const sleep = (ms, fn) => {return setTimeout(fn, ms)};

          // Create strikes and streak indicator
          function createGameIndicators() {
            // Create strikes indicator
            const existingStrikesIndicator = document.getElementById('strikes-indicator');
            if (existingStrikesIndicator) existingStrikesIndicator.remove();

            const strikesIndicator = document.createElement('div');
            strikesIndicator.id = 'strikes-indicator';
            strikesIndicator.style.position = 'absolute';
            strikesIndicator.style.top = '10px';
            strikesIndicator.style.right = '10px';
            strikesIndicator.style.color = 'white';
            strikesIndicator.style.fontSize = '20px';
            strikesIndicator.style.fontWeight = 'bold';
            strikesIndicator.style.padding = '10px';
            strikesIndicator.style.background = 'rgba(0, 0, 0, 0.5)';
            strikesIndicator.style.borderRadius = '5px';

            // Create streak indicator
            const existingStreakIndicator = document.getElementById('streak-indicator');
            if (existingStreakIndicator) existingStreakIndicator.remove();

            const streakIndicator = document.createElement('div');
            streakIndicator.id = 'streak-indicator';
            streakIndicator.style.position = 'absolute';
            streakIndicator.style.top = '10px';
            streakIndicator.style.left = '10px';
            streakIndicator.style.color = 'white';
            streakIndicator.style.fontSize = '20px';
            streakIndicator.style.fontWeight = 'bold';
            streakIndicator.style.padding = '10px';
            streakIndicator.style.background = 'rgba(0, 0, 0, 0.5)';
            streakIndicator.style.borderRadius = '5px';
            streakIndicator.textContent = 'Streak: 0 | Best: 0';

            // Add to minigame
            const minigame = document.querySelector('.minigame');
            if (minigame) {
              minigame.appendChild(strikesIndicator);
              minigame.appendChild(streakIndicator);
            }

            updateStrikesDisplay(strikesIndicator);
          }

          // Update the strikes display
          function updateStrikesDisplay(element = null) {
            const strikesElem = element || document.getElementById('strikes-indicator');
            if (!strikesElem) return;

            let strikesText = 'Strikes: ';
            for (let i = 0; i < strikesAllowed; i++) {
              strikesText += i < currentStrikes ? '❌' : '⭕';
            }
            strikesElem.textContent = strikesText;
          }

          // Update the streak display
          function updateStreakDisplay() {
            const streakElem = document.getElementById('streak-indicator');
            if (!streakElem) return;

            streakElem.textContent = \`Streak: \${streak} | Best: \${max_streak}\`;
          }

          // Expose a global function to stop all timers
          window.stopAllGameTimers = function() {
            stopAllTimers();
          };

          // Back button - return to config
          document.querySelector('.btn_back').addEventListener('click', function(){
              stopAllTimers();

              // Call the global function to return to config screen
              if (typeof window.returnToConfigScreen === 'function') {
                  window.returnToConfigScreen();
              }
          });

          // Get difficulty values based on setting
          const getDifficulty = () => {
              let difficulty_selected = "${settings.difficulty}";

              switch(difficulty_selected){
                  case 'easy':
                      return ["asd", 2000, 1000, 'easy'];
                  case 'medium':
                      return ["asdjkl", 1500, 750, 'medium'];
                  case 'hard':
                      return ["awsdgjikl", 1200, 500, 'hard'];
                  default:
                      return ["awsdgjikl", 1200, 500, 'hard'];
              }
          }

          document.addEventListener("keydown", function(ev) {
              let key_pressed = ev.key;
              // Add a check to ensure letters array has elements before accessing them
              if(game_started && valid_keys.includes(key_pressed) && letters.length > 0 && letters[0] && letters[0].el){
                  let element = letters[0].el;
                  let top = -590 * element.dataset.progress;

                  // Check if the letter is in the correct zone (matching original game logic)
                  if(top < -475 && top > -580 && key_pressed === element.textContent){
                      letters[0].el.classList.add('green');
                      streak++;
                      if(streak > max_streak){
                          max_streak = streak;
                      }
                      updateStreakDisplay();
                  } else {
                      // Increase strikes counter
                      currentStrikes++;
                      updateStrikesDisplay();

                      // Reset streak as in original game
                      streak = 0;
                      updateStreakDisplay();
                      letters[0].el.classList.add('red');

                      // Only fail the game if all strikes are used
                      if (currentStrikes >= strikesAllowed) {
                        resetTimer();
                        startTimer();
                        showResultMessage(false);
                      }
                  }

                  letters[0].stop();

                  new mojs.Html({
                      el: element,
                      y: top,
                      opacity: {
                          1:0,
                          duration: 500,
                      },
                      duration: 500,
                      onComplete() {
                          element.remove();
                      },
                  }).play();
                  letters.splice(0,1);
              }
          });

          function showResultMessage(isSuccess = false) {
              // Remove any existing result message
              const existingMsg = document.getElementById('result-container');
              if (existingMsg) existingMsg.remove();

              // Create a container for both the message and button
              const resultContainer = document.createElement('div');
              resultContainer.id = 'result-container';
              resultContainer.style.position = 'absolute';
              resultContainer.style.top = '50%';
              resultContainer.style.left = '50%';
              resultContainer.style.transform = 'translate(-50%, -50%)';
              resultContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
              resultContainer.style.padding = '15px';
              resultContainer.style.borderRadius = '5px';
              resultContainer.style.textAlign = 'center';
              resultContainer.style.width = '80%';
              resultContainer.style.display = 'flex';
              resultContainer.style.flexDirection = 'column';
              resultContainer.style.alignItems = 'center';
              resultContainer.style.gap = '15px';

              // Create result message with streak info
              const resultMessage = document.createElement('div');
              resultMessage.id = 'result-message';
              resultMessage.className = isSuccess ? 'result-success' : 'result-failure';
              let resultText = isSuccess ? 'SUCCESS!' : \`FAILED! (\${currentStrikes}/\${strikesAllowed} strikes)\`;
              resultText += \`<br>Final Streak: \${streak} | Best Streak: \${max_streak}\`;
              resultMessage.innerHTML = resultText;
              resultMessage.style.color = isSuccess ? '#00ff00' : '#ff0000';
              resultMessage.style.fontSize = '24px';
              resultMessage.style.fontWeight = 'bold';

              // Create play again button
              const playAgainBtn = document.createElement('button');
              playAgainBtn.id = 'play-again-btn';
              playAgainBtn.className = 'play-again-btn';
              playAgainBtn.style.padding = '10px 20px';
              playAgainBtn.style.backgroundColor = '#028000';
              playAgainBtn.style.color = 'white';
              playAgainBtn.style.border = 'none';
              playAgainBtn.style.borderRadius = '4px';
              playAgainBtn.style.fontSize = '18px';
              playAgainBtn.style.cursor = 'pointer';
              playAgainBtn.textContent = 'PLAY AGAIN';
              playAgainBtn.onclick = function() {
                  reset();
              };

              // Add elements to container
              resultContainer.appendChild(resultMessage);
              resultContainer.appendChild(playAgainBtn);

              // Add container to minigame
              const minigameContainer = document.querySelector('.minigame');
              minigameContainer.appendChild(resultContainer);

              // Pause the game
              game_started = false;
          }

          let createLetter = () => {
              let lettersElem = document.querySelector('.minigame .letters');

              // Add this check!
              if (!lettersElem) {
                  return; // Exit if the container isn't ready
              }

              // Match the original game logic for position (1-4)
              let pos = random(1, 4);
              let div = document.createElement('div');
              div.classList.add('letter', 'pos' + pos);
              // Choose random character from the current difficulty set
              div.innerHTML = difficulty[0].charAt(random(0, difficulty[0].length - 1));
              lettersElem.append(div);
              let duration = difficulty[1];
              let lettersCnt = letters.length;
              letters.push(new mojs.Html({
                  el: div,
                  y: {
                      0: -590,
                      duration: duration,
                      easing: 'linear.none',
                      onProgress(p) {
                          div.dataset.progress = p;
                      },
                  },
                  opacity: {
                      0: 1,
                      duration: 200,
                      easing: 'linear.none'
                  },
                  duration: duration,
                  onComplete() {
                      // If player missed the letter completely
                      div.classList.add('red');
                      currentStrikes++;
                      updateStrikesDisplay();
                      // Reset streak on miss (as in original)
                      streak = 0;
                      updateStreakDisplay();

                      if (currentStrikes >= strikesAllowed) {
                          resetTimer();
                          startTimer();
                          showResultMessage(false);
                      }
                      letters.splice(0, 1);
                  },
                  onUpdate() {
                      if (game_started === false) this.pause();
                  }
              }));
              letters[lettersCnt].then({
                  opacity: 0,
                  duration: 500,
                  onComplete() {
                      div.remove();
                  },
              }).play()
          }

          // Helper function to stop all timers
          function stopAllTimers() {
              stopTimer();
              if (timer_start) clearTimeout(timer_start);
              if (timer_game) clearInterval(timer_game);
              if (timer_finish) clearTimeout(timer_finish);
              if (timer_hide) clearTimeout(timer_hide);
          }

          function reset(restart = true){
              game_started = false;
              currentStrikes = 0; // Reset strikes
              streak = 0; // Reset streak on game restart

              resetTimer();
              clearTimeout(timer_start);
              clearInterval(timer_game);
              clearTimeout(timer_finish);
              clearTimeout(timer_hide);

              // Remove result container if it exists
              const resultContainer = document.getElementById('result-container');
              if (resultContainer) resultContainer.remove();

              if(restart){
                  document.querySelector('.minigame .hack').classList.add('hidden');
                  document.querySelector('.minigame .splash').classList.remove('hidden');
                  document.querySelector('.minigame .letters').innerHTML = '';
                  start();
              }
          }

          function start(){
              timer_start = sleep(1000, function(){
                document.querySelector('.minigame .splash').classList.add('hidden');
                document.querySelector('.minigame .hack').classList.remove('hidden');

                difficulty = getDifficulty();

                valid_keys = difficulty[0].split('');
                letters = [];
                game_started = true;

                // Create indicators
                createGameIndicators();

                // Start creating letters at the interval specified by difficulty
                timer_game = setInterval(createLetter, difficulty[2]);

                // Reset progress bar
                const progressBar = document.querySelector('.progress-bar');
                if (progressBar) progressBar.style.width = '100%';

                startTimer();

                // Set a timer to end the game after maxTime seconds
                timer_finish = setTimeout(function() {
                  if (streak >= 5) {
                      showResultMessage(true); // Success
                  } else {
                      showResultMessage(false); // Failure
                  }
                  game_started = false;
                }, maxTime * 1000);
              });
          }

          function startTimer(){
              timerStart = new Date();
              // Use 1ms like the original for more precise timing
              timer_time = setInterval(timer, 1);
          }

          function timer(){
              if (!game_started) return; // Don't update if game is not active

              let timerNow = new Date();
              let timerDiff = new Date();
              timerDiff.setTime(timerNow - timerStart);
              let ms = timerDiff.getMilliseconds();
              let sec = timerDiff.getSeconds();

              // Format display like original (though we don't show this)
              if (ms < 10) {ms = "00"+ms;} else if (ms < 100) {ms = "0"+ms;}

              // Update progress bar
              const progressBar = document.querySelector('.progress-bar');
              if (progressBar) {
                  const percentRemaining = Math.max(0, ((maxTime * 1000) - (sec * 1000 + parseInt(ms))) / (maxTime * 1000) * 100);
                  progressBar.style.width = \`\${percentRemaining}%\`;
              }
          }

          function stopTimer(){
              if (timer_time) {
                  clearInterval(timer_time);
                  timer_time = null;
              }
          }

          function resetTimer(){
              stopTimer();
              // Reset progress bar
              const progressBar = document.querySelector('.progress-bar');
              if (progressBar) {
                  progressBar.style.width = '100%';
              }
          }

          // Start the game
          start();
        })();
      `;
      document.head.appendChild(script);
    });

    // Cleanup function for game mode
    return () => {
      if (!configScreen && typeof window !== 'undefined' && document.head) {
        // Only clean up if we're in game mode and leaving
        const gameScript = document.getElementById('circuitflow-script');
        if (gameScript && document.head.contains(gameScript)) {
          document.head.removeChild(gameScript);
        }

        if (window.stopAllGameTimers && typeof window.stopAllGameTimers === 'function') {
          try {
            window.stopAllGameTimers();
          } catch (e) {
            console.log('Error stopping timers:', e);
          }
        }
      }
    };
  }, [configScreen, settings]);

  const setDifficulty = (difficulty) => {
    setSettings(prev => ({ ...prev, difficulty }));
  };

  const startGame = () => {
    setConfigScreen(false);
  };

  // Show config screen if configScreen is true
  if (configScreen) {
    return (
      <div className="flex flex-col items-center mt-24 text-white p-4">
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mb-6 flex flex-col items-center">
          <CircleUserRound className="w-16 h-16 mb-4" />
          <span className="text-3xl font-bold mb-2">Circuit Flow</span>
          <span className="text-lg mb-8 text-gray-400">Press the correct key when it touches the green bar</span>
          <div className="w-full">
            <div className="space-y-6">
              <div>
                <label className="block text-sm mb-2 text-white">Difficulty</label>
                <div className="grid grid-cols-1 gap-2">
                  <div
                    className={`p-2 rounded cursor-pointer border text-center font-bold transition-colors ${
                      settings.difficulty === 'easy'
                        ? 'bg-green-700 border-green-400 text-white'
                        : 'bg-gray-800 border-transparent text-green-400'
                    }`}
                    onClick={() => setDifficulty('easy')}
                  >
                    Easy
                  </div>
                  <div
                    className={`p-2 rounded cursor-pointer border text-center font-bold transition-colors ${
                      settings.difficulty === 'medium'
                        ? 'bg-yellow-700 border-yellow-400 text-white'
                        : 'bg-gray-800 border-transparent text-yellow-400'
                    }`}
                    onClick={() => setDifficulty('medium')}
                  >
                    Medium
                  </div>
                  <div
                    className={`p-2 rounded cursor-pointer border text-center font-bold transition-colors ${
                      settings.difficulty === 'hard'
                        ? 'bg-red-700 border-red-400 text-white'
                        : 'bg-gray-800 border-transparent text-red-400'
                    }`}
                    onClick={() => setDifficulty('hard')}
                  >
                    Hard
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2 text-white">Strikes Allowed: {settings.strikes}</label>
                <Slider
                  value={[settings.strikes]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, strikes: value }))}
                  min={1}
                  max={5}
                  step={1}
                  aria-label="Strikes"
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>1 Strike</span>
                  <span>5 Strikes</span>
                </div>
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
          <p className="text-sm mt-2 text-gray-300">Press PLAY NOW to start</p>
        </div>
      </div>
    );
  }

  // Game screen
  return (

      <div id="game-container"></div>
  );
}
