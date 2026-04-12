"use client";

import { useEffect, useState, useRef } from 'react';
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { CircleUserRound } from 'lucide-react';

export default function HackingDevicePage() {
  const [configScreen, setConfigScreen] = useState(true);
  const [settings, setSettings] = useState({
    timeout: 15,
    hideChars: false, // Changed default to false
    charGroups: ["symbols"],
    showType: "0"
  });
  // Add a state to track win/loss for overlay text
  const [gameResult, setGameResult] = useState<null | 'win' | 'lose'>(null);

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
        const gameScript = document.getElementById('hacking-device-script');
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
        setGameResult(null); // Reset result on config screen
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
    if (typeof window === 'undefined') return;

    // Inject CSS (SCOPED to #game-container so it doesn't affect the whole site)
    const style = document.createElement('style');
    style.textContent = `
      /* Scoped to the game container to avoid global styles */
      #game-container {
          font-family: sans-serif;
          margin-top: 64px;
      }

      #game-container .title{
          text-align: center;
          color: white;
      }
      #game-container .description{
          text-align: center;
          color: gray;
      }

      #game-container .streaks {
          display: block;
          margin: 40px auto;
          text-align: center;
          font-size: 30px;
          font-weight: bold;
          text-transform: uppercase;
          color: white;
          width: -moz-fit-content;
          width: fit-content;
          padding: 12px;
          border-radius: 18px;
      }
      #game-container .best_time,
      #game-container .time {
          display: inline-block;
          width: 100px;
      }
      #game-container .streaks .fa {
          padding: 0 10px;
      }
      #game-container .options{
          font-weight: bold;
          text-align: center;
          margin: 0 auto 10px;
          cursor: default;
          user-select: none;
      }
      #game-container .option{
          display: inline-block;
          color: white;
          font-weight: bold;
          text-align: center;
          width: -moz-fit-content;
          width: fit-content;
          height: 20px;
          background-color: #20282e;
          padding: 10px 20px;
          margin: 0 auto 10px;
          border-radius: 6px;
      }
      #game-container .option.setting{
          display: inline-flex;
          height: 32px;
          padding: 0;
      }
      #game-container .option.setting label{
          font-size: 12px;
          padding: 6px 10px 6px 6px;
          cursor: pointer;
      }
      #game-container .option.setting input{
          vertical-align: -2px;
          cursor: pointer;
      }
      #game-container .option.timeout label{
          padding: 9px;
      }
      #game-container .option.timeout input{
          vertical-align: text-top;
      }
      #game-container .timeout_value{
          font-size: 12px;
          display: inline-block;
          width: 18px;
          text-align: right;
          padding: 9px 12px 9px 5px;
      }
      #game-container .minigame{
          margin: 0 auto 20px;
          width: 540px;
          min-width: 540px;
          max-width: 540px;
          background-color: #232832;
          padding: 30px 0;
          position: relative;
      }
      #game-container .splash{
          display: inline-block;
          width: 100%;
          text-align: center;
          color: white;
          font-size: 16px;
      }
      #game-container .splash .hacker{
          font-size: 65px;
          margin-bottom: 30px;
      }
      #game-container .splash .text{
          font-weight: bold;
      }
      #game-container .minigame .find{
          text-align: center;
          color: white;
          font-size: 30px;
          user-select: none;
          margin-top: 10px;
      }
      #game-container .minigame .find > div{
          display: inline-block;
      }
      #game-container .minigame .timer{
          text-align: center;
          color: green;
          font-size: 14px;
          margin-bottom: 15px;
      }
      #game-container .minigame .codes {
          display: flex;
          flex-wrap: wrap;
          width: 400px;
          margin: auto;
      }
      #game-container .minigame .codes > div{
          flex: 1 0 10%;
          margin: 7px 0;
          color: white;
          text-align: center;
          font-size: 18px;
      }
      #game-container .minigame .codes > div.red{
          color: red;
      }
      #game-container .minigame .codes > div.green{
          color: green;
      }
      #game-container .minigame .mirrored .find > div,
      #game-container .minigame .mirrored .codes > div {
          -moz-transform: scale(-1, -1);
          -o-transform: scale(-1, -1);
          -webkit-transform: scale(-1, -1);
          transform: scale(-1, -1);
      }
      #game-container .hidden {
          display: none;
      }
      #game-container .restart{
          text-align: center;
      }
      #game-container .btn_again {
          padding: 6px 15px;
          font-weight: bold;
          color: white;
          background-color: #028000;
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
        overflow: hidden;
        position: absolute;
        bottom: 15px;
        left: 5%;
        right: 5%;
      }
      #game-container .progress-bar {
        height: 100%;
        background: #ff0000; /* Changed to solid red from gradient */
        transition: width 0.05s linear;
        width: 100%;
      }

      #game-container .game-bottom-nav {
        margin-top: 20px;
        text-align: center;
      }

      #game-container .btn-config-back {
        padding: 10px 20px;
        font-weight: bold;
        color: white;
        background-color: #2c465e;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
      }

      #game-container .btn-config-back:hover {
        background-color: #425e79;
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      if (document.head.contains(style)) {
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

    // Inject HTML
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.innerHTML = `
        <div class="options settings" style="display: none;">
          <div class="option setting">
            <label><input name="char_group[]" value="numeric" type="checkbox" ${settings.charGroups.includes('numeric') ? 'checked' : ''}>Numeric</label>
          </div>
          <div class="option setting">
            <label><input name="char_group[]" value="alphabet" type="checkbox" ${settings.charGroups.includes('alphabet') ? 'checked' : ''}>Alphabet</label>
          </div>
          <div class="option setting">
            <label><input name="char_group[]" value="alphanumeric" type="checkbox" ${settings.charGroups.includes('alphanumeric') ? 'checked' : ''}>Alphanumeric</label>
          </div>
          <div class="option setting">
            <label><input name="char_group[]" value="greek" type="checkbox" ${settings.charGroups.includes('greek') ? 'checked' : ''}>Greek</label>
          </div>
          <div class="option setting">
            <label><input name="char_group[]" value="runes" type="checkbox" ${settings.charGroups.includes('runes') ? 'checked' : ''}>Runes</label>
          </div>
          <div class="option setting">
            <label><input name="char_group[]" value="symbols" type="checkbox" ${settings.charGroups.includes('symbols') ? 'checked' : ''}>Symbols</label>
          </div>
        </div>

        <div class="options settings" style="display: none;">
          <div class="option setting">
            <label><input name="show_type" value="0" type="radio" ${settings.showType === '0' ? 'checked' : ''}>Only Normal</label>
          </div>
          <div class="option setting">
            <label><input name="show_type" value="1" type="radio" ${settings.showType === '1' ? 'checked' : ''}>Normal + Mirrored</label>
          </div>
          <div class="option setting">
            <label><input name="show_type" value="2" type="radio" ${settings.showType === '2' ? 'checked' : ''}>Only Mirrored</label>
          </div>
        </div>

        <div class="options settings" style="display: none;">
          <div class="option setting timeout">
            <label for="timeout">Timeout:</label>
            <input id="timeout" type="range" value="${settings.timeout}" min="5" max="30" step="5" autocomplete="off">
            <div class="timeout_value">${settings.timeout}s</div>
          </div>
          <div class="option setting">
            <label><input id="hide_chars" value="1" type="checkbox" ${settings.hideChars ? 'checked' : ''}>Randomly hides characters</label>
          </div>
        </div>

        <div class="minigame">
          <div class="splash"><div class="fa hacker">⚡</div><span class="text">PREPARING INTERFACE...</span></div>
          <div class="hack hidden">
            <div class="find"></div>
            <div class="codes"></div>
          </div>
          <div class="progress-container">
            <div class="progress-bar"></div>
          </div>
        </div>

        <div class="restart"><button class="btn_back">RESTART</button></div>
      `;

      // Add CSS for progress bar (SCOPED, do not concatenate global style)
      const style = document.createElement('style');
      style.textContent = `
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
      `;
      document.head.appendChild(style);

      // Inject JavaScript
      const script = document.createElement('script');
      script.id = 'hacking-device-script';
      script.textContent = `
        (function() {
          let timer_start, timer_game, timer_finish, timer_time, timer_hide, correct_pos, to_find, codes, sets, timerStart;
          let game_started = false;
          let streak = 0;
          let max_streak = 0;
          let best_time = 99.999;
          let current_pos = 43; // displayed index (0..79)

          const sleep = (ms, fn) => { return setTimeout(fn, ms); };

          // Inclusive random: returns integer between min and max (both inclusive)
          const random = (min, max) => {
            return Math.floor(Math.random() * (max - min + 1)) + min;
          };

          const shuffle = (arr) => {
            for (let i = arr.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              const temp = arr[i];
              arr[i] = arr[j];
              arr[j] = temp;
            }
          };

          const randomSetChar = () => {
            let str = '?';
            switch(sets){
              case 'numeric': str = "0123456789"; break;
              case 'alphabet': str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; break;
              case 'alphanumeric': str = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; break;
              case 'greek': str = "ΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ"; break;
              case 'runes': str = "ᚠᚥᚧᚨᚩᚬᚭᚻᛐᛑᛒᛓᛔᛕᛖᛗᛘᛙᛚᛛᛜᛝᛞᛟᛤ"; break;
              case 'symbols': str = "☎☚☛☜☞☟☠☢☣☮☯♨♩♪♫♬Ψ♆✂✄෧✆✉✦✧✿❀"; break;
            }
            return str.charAt(random(0, Math.max(0, str.length - 1)));
          };

          // expose stop function
          window.stopAllGameTimers = function() { stopAllTimers(); };

          // Back button
          document.querySelector('.btn_back').addEventListener('click', function(){
            stopAllTimers();
            if (typeof window.returnToConfigScreen === 'function') {
              window.returnToConfigScreen();
            }
          });

          document.addEventListener("keydown", function(ev) {
            let key_pressed = ev.key;
            let valid_keys = ['a','w','s','d','ArrowUp','ArrowDown','ArrowRight','ArrowLeft','Enter'];

            if(game_started && valid_keys.includes(key_pressed) ){
              ev.preventDefault();
              switch(key_pressed){
                case 'w':
                case 'ArrowUp':
                  current_pos -= 10;
                  if(current_pos < 0) current_pos += 80;
                  break;
                case 's':
                case 'ArrowDown':
                  current_pos += 10;
                  current_pos %= 80;
                  break;
                case 'a':
                case 'ArrowLeft':
                  current_pos--;
                  if(current_pos < 0) current_pos = 79;
                  break;
                case 'd':
                case 'ArrowRight':
                  current_pos++;
                  current_pos %= 80;
                  break;
                case 'Enter':
                  check();
                  return;
              }
              drawPosition();
            }
          });

          // Add a callback to communicate win/loss to React
          function setReactGameResult(result) {
            if (window.dispatchEvent) {
              window.dispatchEvent(new CustomEvent('hackingdevice-game-result', { detail: result }));
            }
          }

          function check(){
            stopTimer();

            // direct comparison: current_pos is a displayed index, correct_pos is displayed index too
            let current_attempt = current_pos;

            if(game_started && current_attempt === correct_pos){
              streak++;
              if(streak > max_streak){
                max_streak = streak;
                document.cookie = "max-streak_hackingdevice="+max_streak;
              }
              showPlayAgainButton();
              setReactGameResult('win');
            }else{
              // Game over - show play again button
              reset(false);

              // Show correct displayed position
              current_pos = correct_pos;
              drawPosition('green', false);

              showPlayAgainButton();
              setReactGameResult('lose');
            }
          }

          function showPlayAgainButton() {
            const existingBtn = document.getElementById('play-again-btn');
            if (existingBtn) existingBtn.remove();

            // Overlay text for win/loss
            let overlayText = document.getElementById('result-overlay');
            if (!overlayText) {
              overlayText = document.createElement('div');
              overlayText.id = 'result-overlay';
              overlayText.style.position = 'absolute';
              overlayText.style.top = '65%'; // Adjusted to bring it down a little
              overlayText.style.left = '50%';
              overlayText.style.transform = 'translate(-50%, -50%)';
              overlayText.style.fontSize = '32px';
              overlayText.style.fontWeight = 'bold';
              overlayText.style.color = '#fff';
              overlayText.style.textShadow = '0 2px 8px #000';
              overlayText.style.zIndex = '10';
              document.querySelector('.minigame').appendChild(overlayText);
            }
            // Text will be set by React via event

            const playAgainBtn = document.createElement('button');
            playAgainBtn.id = 'play-again-btn';
            playAgainBtn.className = 'play-again-btn';
            playAgainBtn.style.position = 'absolute';
            playAgainBtn.style.top = '55%';
            playAgainBtn.style.left = '50%';
            playAgainBtn.style.transform = 'translate(-50%, -50%)';
            playAgainBtn.style.padding = '10px 20px';
            playAgainBtn.style.backgroundColor = '#028000';
            playAgainBtn.style.color = 'white';
            playAgainBtn.style.border = 'none';
            playAgainBtn.style.borderRadius = '4px';
            playAgainBtn.style.fontSize = '18px';
            playAgainBtn.style.cursor = 'pointer';
            playAgainBtn.textContent = 'PLAY AGAIN';
            playAgainBtn.onclick = function() { 
              if (overlayText) overlayText.remove();
              reset(); 
            };
            document.querySelector('.minigame').appendChild(playAgainBtn);
          }

          let moveCodes = () => {
            // rotate displayed array: take first element to end
            const first = codes.shift();
            codes.push(first);

            let codesElem = document.querySelector('.minigame .codes');
            if (!codesElem) return;

            codesElem.innerHTML = '';
            for(let i=0; i<80; i++){
              let div = document.createElement('div');
              div.innerHTML = codes[i];
              codesElem.append(div);
            }

            // when display rotates left, the index of the target shifts left by 1
            correct_pos = (correct_pos - 1 + 80) % 80;

            // Update the displayed target to match current view and then highlight cursor
            updateFindDisplay();
            drawPosition();
          };

          // get group of indices starting at a displayed index
          let getGroupFromPos = (pos, count = 4) => {
            let group = [pos];
            for(let i=1; i<count; i++){
              let idx = pos + i;
              if( idx >= 80 ) idx -= 80;
              group.push(idx);
            }
            return group;
          };

          // drawPosition treats 'pos' values as displayed indices
          let drawPosition = (className = 'red', deleteClass = true) => {
            let toDraw = getGroupFromPos(current_pos);
            let codesElem = document.querySelectorAll('.minigame .codes > div');
            if (!codesElem.length) return;

            if(deleteClass){
              codesElem.forEach((el) => {
                el.classList.remove('red');
                el.classList.remove('green');
              });
            }

            toDraw.forEach((displayedIndex) => {
              if(displayedIndex < 0) displayedIndex += 80;
              if (codesElem[displayedIndex]) {
                codesElem[displayedIndex].classList.add(className);
              }
            });
          };

          // Build the "find" target based on the current codes array (displayed order)
          function updateFindDisplay() {
            const hackElem = document.querySelector('.minigame .hack');
            const mirrored = hackElem && hackElem.classList.contains('mirrored');

            // pick four consecutive displayed items starting at correct_pos
            let group = getGroupFromPos(correct_pos);
            let items = group.map(i => codes[i]);

            if (mirrored) items = items.slice().reverse();

            const html = items.map(s => '<div>' + s + '</div>').join(' ');
            to_find = html;
            const findElem = document.querySelector('.minigame .hack .find');
            if (findElem) findElem.innerHTML = html;
          }

          let charGroupsSelected = () => {
            return ${JSON.stringify(settings.charGroups)};
          };

          function stopAllTimers() {
            stopTimer();
            if (timer_start) clearTimeout(timer_start);
            if (timer_game) clearTimeout(timer_game);
            if (timer_finish) clearTimeout(timer_finish);
            if (timer_hide) clearInterval(timer_hide);
          }

          function reset(restart = true){
            game_started = false;

            resetTimer();
            clearTimeout(timer_start);
            clearTimeout(timer_game);
            clearTimeout(timer_finish);
            if (timer_hide) clearInterval(timer_hide);

            const playAgainBtn = document.getElementById('play-again-btn');
            if (playAgainBtn) playAgainBtn.remove();
            const overlayText = document.getElementById('result-overlay');
            if (overlayText) overlayText.remove();

            if(restart){
              document.querySelector('.minigame .hack').classList.add('hidden');
              start();
            }
          }

          function start(){
            // reset displayed cursor
            current_pos = 43;

            let charGroups = charGroupsSelected();
            if(charGroups.length === 0) sets = -1;
            else { shuffle(charGroups); sets = charGroups[0]; }

            let show_type = "${settings.showType}";
            let hack = document.querySelector('.minigame .hack');
            if (!hack) return;

            switch(show_type){
              case '0': hack.classList.remove('mirrored'); break;
              case '1':
                if( Math.round(Math.random()) === 1 ) hack.classList.add('mirrored');
                else hack.classList.remove('mirrored');
                break;
              case '2': hack.classList.add('mirrored'); break;
            }

            document.querySelector('.splash .text').innerHTML = 'PREPARING INTERFACE...';

            // build displayed codes array
            codes = [];
            for(let i = 0; i < 80; i++){
              codes.push(randomSetChar() + randomSetChar());
            }

            // pick correct_pos in displayed coords (0..79)
            correct_pos = random(0, 79);

            let codesElem = document.querySelector('.minigame .codes');
            if (!codesElem) return;

            codesElem.innerHTML = '';
            for(let i=0; i<80; i++){
              let div = document.createElement('div');
              div.innerHTML = codes[i];
              codesElem.append(div);
            }

            // initial target built from current displayed codes
            updateFindDisplay();

            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) progressBar.style.width = '100%';

            drawPosition();

            timer_start = sleep(1000, function(){
              let splashTextElem = document.querySelector('.splash .text');
              if (splashTextElem) splashTextElem.innerHTML = 'CONNECTING TO THE HOST';

              let hackElem = document.querySelector('.minigame .hack');
              if (hackElem) hackElem.classList.remove('hidden');

              timer_game = setInterval(moveCodes, 1500);

              game_started = true;

              let timeout = ${settings.timeout};
              startTimer(timeout);
              timeout *= 1000;

              if(${settings.hideChars} && random(1,4) === 1){
                timer_hide = setInterval(function(){
                  let findElem = document.querySelector('.minigame .hack .find');
                  if (findElem) {
                    findElem.dataset.hiddenFor = '1';
                    findElem.innerHTML = '';
                    setTimeout(function(){
                      if (findElem && findElem.dataset.hiddenFor === '1') {
                        updateFindDisplay(); // rebuild from current codes array
                        delete findElem.dataset.hiddenFor;
                      }
                    }, 700);
                  }
                }, 3500);
              }

              timer_finish = sleep(timeout, function(){
                game_started = false;
                streak = 0;
                check();
              });
            });
          }

          function startTimer(timeout){
            timerStart = new Date();
            timer_time = setInterval(timer, 50, timeout);
          }

          function timer(timeout){
            if (!game_started) return;
            let timerNow = new Date();
            let timerDiff = new Date();
            timerDiff.setTime(timerNow - timerStart);
            let ms = timerDiff.getMilliseconds();
            let sec = timerDiff.getSeconds();

            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) {
              const timeElapsed = (sec * 1000 + ms) / 1000;
              const percentRemaining = Math.max(0, (timeout - timeElapsed) / timeout * 100);
              progressBar.style.width = \`\${percentRemaining}%\`;
            }

            let timerHackElem = document.querySelector('.hack .timer');
            if (!timerHackElem) return;

            let ms2 = (999-ms);
            if (ms2 > 99) ms2 = Math.floor(ms2/10);
            if (ms2 < 10) ms2 = "0"+ms2;
            timerHackElem.innerHTML = (timeout-1-sec)+"."+ms2;
            timerHackElem.style.display = 'none';
          }

          function stopTimer(){
            if (timer_time !== null) {
              clearInterval(timer_time);
              timer_time = null;
            }
          }

          function resetTimer(){
            stopTimer();
            const progressBar = document.querySelector('.progress-bar');
            if (progressBar) progressBar.style.width = '100%';
          }

          // Start
          start();
        })();
      `;
      document.head.appendChild(script);

      // Listen for win/loss events from injected script
      const handleGameResult = (e) => {
        if (e.detail === 'win') setGameResult('win');
        else if (e.detail === 'lose') setGameResult('lose');
        else setGameResult(null);
        // Set overlay text in DOM
        const overlayText = document.getElementById('result-overlay');
        if (overlayText) {
          overlayText.textContent = e.detail === 'win' ? 'You Win' : 'You Lost';
        }
      };
      window.addEventListener('hackingdevice-game-result', handleGameResult);
    }

    // Cleanup function for game mode
    return () => {
      if (!configScreen) {
        // Only clean up if we're in game mode and leaving
        const gameScript = document.getElementById('hacking-device-script');
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
      // Cleanup event listener
      window.removeEventListener('hackingdevice-game-result', handleGameResult);
    };
  }, [configScreen, settings]);

  const startGame = () => {
    setConfigScreen(false);
  };

  const toggleCharGroup = (group) => {
    setSettings(prev => ({
      ...prev,
      charGroups: prev.charGroups.includes(group)
        ? prev.charGroups.filter(g => g !== group)
        : [...prev.charGroups, group]
    }));
  };

  // Only allow one character group selection at a time
  const selectCharGroup = (group) => {
    setSettings(prev => ({
      ...prev,
      charGroups: [group]
    }));
  };

  // Show config screen if configScreen is true
  if (configScreen) {
return (
  <div>
    <div className="flex flex-col items-center mt-18 text-white p-4">
      <CircleUserRound className="w-16 h-16 mb-4" />
      <span className="text-3xl font-bold mb-2">Hacking Device</span>
      <span className="text-lg mb-8 text-gray-400">Find the highlighted characters in the grid</span>
      <div className="w-full max-w-md p-4">
        <div className="space-y-6">
          <div>
            <label className="block text-sm mb-2">Character Groups</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'numeric', label: 'Numeric' },
                { id: 'alphabet', label: 'Alphabet' },
                { id: 'alphanumeric', label: 'Alphanumeric' },
                { id: 'greek', label: 'Greek' },
                { id: 'runes', label: 'Runes' },
                { id: 'symbols', label: 'Symbols' }
              ].map(group => (
                <div
                  key={group.id}
                  className={`p-2 rounded cursor-pointer border text-center ${
                    settings.charGroups.includes(group.id)
                      ? 'bg-[#2c465e] border-blue-500'
                      : 'bg-gray-800 border-transparent'
                  }`}
                  onClick={() => selectCharGroup(group.id)}
                >
                  {group.label}
                </div>
              ))}
            </div>
            {settings.charGroups.length === 0 && (
              <p className="text-red-500 text-sm mt-2">Select one character group</p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-2">Display Mode</label>
            <div className="grid grid-cols-1 gap-2">
              {[
                { id: '0', label: 'Normal' },
                { id: '1', label: 'Normal + Mirrored' },
                { id: '2', label: 'Mirrored' }
              ].map(option => (
                <div
                  key={option.id}
                  className={`p-2 rounded cursor-pointer border text-center ${
                    settings.showType === option.id
                      ? 'bg-[#2c465e] border-blue-500'
                      : 'bg-gray-800 border-transparent'
                  }`}
                  onClick={() => setSettings(prev => ({ ...prev, showType: option.id }))}
                >
                  {option.label}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2">Timeout: {settings.timeout}s</label>
            <Slider
              value={[settings.timeout]}
              onValueChange={([value]) => setSettings(prev => ({ ...prev, timeout: value }))}
              min={5}
              max={30}
              step={5}
              aria-label="Timeout"
              className="w-full"
            />
          </div>

          <div>
            <label htmlFor="hide-chars" className="block text-sm mb-2">Randomly hide characters</label>
            <input
              id="hide-chars"
              type="checkbox"
              checked={settings.hideChars}
              onChange={e => setSettings(prev => ({ ...prev, hideChars: e.target.checked }))}
              className="rounded"
            />
          </div>
        </div>
      </div>
      <Button
        size="lg"
        onClick={startGame}
        disabled={settings.charGroups.length === 0}
        className="bg-[#2c465e] hover:bg-[#425e79] disabled:bg-gray-700 disabled:cursor-not-allowed"
      >
        PLAY NOW
      </Button>
      <p className="text-sm mt-2">Press PLAY NOW to start</p>
    </div>
  </div>
);
  }

  // When not on config screen, render the game container
  return <div id="game-container"></div>;
}