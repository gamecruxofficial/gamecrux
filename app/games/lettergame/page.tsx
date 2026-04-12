"use client";

import { useEffect } from 'react';

export default function LetterGamePage() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Inject CSS
    const style = document.createElement('style');
    style.id = 'lettergame-styles';
    style.textContent = `
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      #game-container {
        display: flex;
        font-family: Arial, sans-serif;
        color: white;
        text-align: center;
        height: 100vh;
        width: 100vw;
        justify-content: center;
        align-items: center;
        background: #000;
      }

      .box{
        position: relative;
        width: 50vw;
        height: 60vh;
        min-width: 800px;
        min-height: 600px;
      }

      .box .bg{
        width: 100%;
        height: 100%;
      }

      .box .user{
        position: absolute;
        width: 3%;
        height: 4.5%;
        left: 3.5%;
        top: 6%;
      }

      .box .header{
        position: absolute;
        top: 5.5%;
        left: 7%;
        font-size: 1.8vh;
        font-weight: bold;
      }

      .box .desc{
        position: absolute;
        color: rgba(255, 255, 255, 0.22);
        top: 9%;
        left: 7%;
        font-size: 1.1vh;
      }

      .box .controller-box{
        background: radial-gradient(50% 50% at 50% 50%, rgba(217, 217, 217, 0.08) 0%, rgba(115, 115, 115, 0.08) 100%);  position: absolute;
        width: 50%;
        border-radius: 0.5vh;
        height: 13%;
        left: 3.5%;
        top: 14.5%;
        display: flex;
        flex-direction: row;
        justify-content: start;
      }

      .box .controller-box .controller-item{
        width: 15%;
        height: 80%;
        display: flex;
        margin: 1.5% 1.5%;
        justify-content: center;
        align-items: center;
        font-size: 1.5em;
        cursor: pointer;
        border-radius: 0.5vh;
        background: rgba(255, 255, 255, 0.10);
      }

      .box .controller-box .controller-item img{
        width: 50%;
        height: 50%;
        position: absolute;
      }

      .box .letter-box {
        position: absolute;
        width: 27%;
        height: 22%;
        left: 70%;
        top: 5.5%;
        border-radius: 0.5vh;
        background: radial-gradient(50% 50% at 50% 50%, rgba(217, 217, 217, 0.08) 0%, rgba(115, 115, 115, 0.08) 100%);
      }

      .box .flex-box{
        position: absolute;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        z-index: 5;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;
      }

      .box .letter-box::-webkit-scrollbar {
        width: 2vh;
      }

      .box .letter-box .letter-item {
        width: 28%;
        height: 40%;
        display: flex;
        left: 0%;
        margin-top: 0%;
        margin-left: 2%;
        font-size: 1.5em;
        cursor: pointer;
        border-radius: 0.3vh;
        background: rgba(255, 255, 255, 0.10);
        justify-content: center;
        align-items: center;
        position: relative;
        text-align: center;
      }

      .box .letter-box .letter-item img{
        width: 50%;
        height: 50%;
        position: absolute;
      }

      .box .letter-box .letter-item .letter{
        position: absolute;
        font-size: 1.5em;
      }

      .timer-container {
        position: absolute;
        width: 10%;
        height: 10%;
        top: 12%;
        left: 56.5%;
        display: flex;
        text-align: center;
        justify-content: center;
        align-items: center;
      }

      #timerCanvas {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 1;
        display: flex;
        text-align: center;
        justify-content: center;
        align-items: center;
      }

      .timer-text {
        position: absolute;
        top: 40%;
        font-size: 3vh;
        z-index: 2;
      }

      .timer-unit {
        position: absolute;
        top: 100%;
        font-size: 1vh;
        z-index: 2;
      }

      .main-box{
        position: absolute;
        width: 98%;
        height: 62%;
        left: 1%;
        top: 34%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        z-index: 2;
      }

      .main-box .item {
        width: 96%;
        height: 40%;
        min-height: 10%;
        min-width: 10%;
        margin-top: 1.5%;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
        flex-direction: row;
        overflow: hidden;
        background: #0b0b0b;
        border-bottom: 0.5vh solid rgba(255, 255, 255, 0.08);
        border-radius: 0.5vh;
        font-size: 1.5em;
        cursor: pointer;
      }

      .main-box .item .light{
        position: absolute;
        width: 3%;
        border-radius: 0.5vh;
        height: 1%;
        left: -0.5%;
        transform: rotate(90deg);
        background: rgba(255, 255, 255, 0.05);
        z-index: 3;
      }

      .main-box .item .letter {
        position: relative;
        font-size: 1.5em;
        width: 100%;
        height: 100%;
        min-height: 10%;
        min-width: 10%;
        background-color: rgb(90, 89, 89,0.40);
        color: rgba(255, 255, 255, 0.15);
        text-transform: uppercase;
        z-index: 5;
      }

      .main-box .item .letter img{
        width: 100%;
        height: 100%;
        position: absolute;
        top: 40%;
        left: 0%;
        z-index: 6;
      }

      .main-box .item .letter .text{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 6;
      }

      .main-box .item .letter::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 0.2vh;
        height: 100%;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.00), rgba(255, 255, 255, 0.1));
      }

      .selector {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        z-index: 10;
        min-height: 8.2%;
        min-width: 9.35%;
        top: 36.1%;
        background: radial-gradient(100% 100% at 50% 90.32%, rgba(35, 35, 35, 0.68) 0%, rgba(0, 0, 0, 0.20) 100%);
        border-bottom: 0.5vh solid rgba(255, 255, 255, 0.08);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 999;
      }

      .selector img {
        width: 97%;
        height: 20%;
        position: absolute;
        top: 90%;
      }

      .selector::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 0.2vh;
        height: 100%;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.00), rgba(255, 255, 255, 0.1));
      }

      .selector::after {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 0.2vh;
        height: 100%;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.00), rgba(255, 255, 255, 0.1));
      }

      @keyframes scroll {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-100%);
        }
      }
    `;
    document.head.appendChild(style);

    // Inject HTML
    const gameContainer = document.getElementById('game-container');
    if (gameContainer) {
      gameContainer.innerHTML = `
        <div class="box">
          <img src="../images/bg.png" class="bg" alt="">
          <img src="../images/user.svg" class="user" alt="">
          <div class="header">HOUSE<span style="font-weight: lighter;">ROBBERY</span> </div>
          <div class="desc">Lorem ipsum dolor sit amet consectetur adipisicing elit. Animi, impedit.</div>

          <div class="timer-container">
            <canvas id="timerCanvas" width="100" height="100"></canvas>
            <div class="timer-text" id="timerText">00</div>
            <div class="timer-unit">SN</div>
          </div>

          <div class="controller-box">
            <div class="controller-item"></div>
            <div class="controller-item"></div>
            <div class="controller-item"></div>
            <div class="controller-item"></div>
            <div class="controller-item"></div>
            <div class="controller-item"></div>
          </div>

          <div class="letter-box">
            <div class="flex-box">
              <div class="letter-item">
                <img src="../images/lock.svg" alt="">
              </div>
              <div class="letter-item" style="border: 0.1vh solid white;background: rgba(255, 255, 255, 0.22);">
                <div class="my-letter">4</div>
              </div>
              <div class="letter-item">
                <img src="../images/lock.svg" alt="">
              </div>
              <div class="letter-item">
                <img src="../images/lock.svg" alt="">
              </div>
              <div class="letter-item">
                <img src="../images/lock.svg" alt="">
              </div>
              <div class="letter-item">
                <img src="../images/lock.svg" alt="">
              </div>
            </div>
          </div>

          <div class="main-box">
            <div class="item">
              <div class="light"></div>
              <div class="light" style="left: 97.5%;"></div>
            </div>
            <div class="item">
              <div class="light"></div>
              <div class="light" style="left: 97.5%;"></div>
            </div>
            <div class="item">
              <div class="light"></div>
              <div class="light" style="left: 97.5%;"></div>
            </div>
            <div class="item">
              <div class="light"></div>
              <div class="light" style="left: 97.5%;"></div>
            </div>
            <div class="item">
              <div class="item">
              <div class="light"></div>
              <div class="light" style="left: 97.5%;"></div>
            </div>
            <div class="item">
              <div class="light"></div>
              <div class="light" style="left: 97.5%;"></div>
            </div>
          </div>

          <div class="selector">
            <img src="../images/select.svg" alt="selector">
          </div>
        </div>
      `;

      // Inject JavaScript
      const script = document.createElement('script');
      script.id = 'lettergame-script';
      script.textContent = `
        // Initialize game on load for testing
        setTimeout(() => {
          const canvas = document.getElementById('timerCanvas');
          const ctx = canvas.getContext('2d');
          const timerText = document.getElementById('timerText');

          let totalTime = 200;
          let currentTime = totalTime;
          let currentItemIndex = 0;
          let wrongAttempts = 0;
          let rightAttempts = 0;
          let stopScrolls = [];
          let timerInterval;
          let scrollSpeed = 1;
          const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          const numbers = '0123456789';
          const symbols = '!@#$%^&*()_+-={}[]|:;<>,.?/';

          function initializeStopScrolls(items) {
            for (let i = 0; i < items.length; i++) {
              stopScrolls[i] = true;
            }
          }

          const randomItems = [
            { type: 'letter', char: getRandomChars(alphabet, 1), found: false },
            { type: 'number', char: getRandomChars(numbers, 1), found: false },
            { type: 'symbol', char: getRandomChars(symbols, 1), found: false },
            { type: 'mixed', char: getRandomChars(alphabet + numbers + symbols, 1), found: false },
            { type: 'number', char: getRandomChars(numbers, 1), found: false },
            { type: 'letter', char: getRandomChars(alphabet, 1), found: false }
          ];

          let itemsStatus = randomItems.map(() => false);

          function resetGame() {
            currentItemIndex = 0;
            wrongAttempts = 0;
            rightAttempts = 0;
            itemsStatus = randomItems.map(() => false);
            document.querySelectorAll('.item').forEach(item => item.innerHTML = '');
            clearInterval(timerInterval);
            timerInterval = setInterval(updateTimer, 1000);
            drawTimer(currentTime);
            updateLocks();
          }

          window.addEventListener("message", function(event) {
            const data = event.data;

            if (data.action === "START_LETTER_GAME") {
              currentTime = data.time;
              scrollSpeed = data.speed;
              totalTime = data.time;
              document.querySelector('.header').textContent = data.header;
              document.querySelector('.desc').textContent = data.text;

              scrollSpeed = data.speed;

              resetGame();
              document.body.style.display = 'flex';
              document.body.style.opacity = '1';
              addLettersToContainer();
            }
          });

          function drawTimer(remainingTime) {
              const startAngle = -Math.PI / 2;
              const endAngle = ((2 * Math.PI) * (remainingTime / totalTime)) - Math.PI / 2;

              ctx.clearRect(0, 0, canvas.width, canvas.height);

              ctx.beginPath();
              ctx.arc(50, 50, 40, 0, 2 * Math.PI);
              ctx.lineWidth = 5;
              ctx.strokeStyle = '#444';
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(50, 50, 40, startAngle, endAngle);
              ctx.lineWidth = 5;
              ctx.strokeStyle = 'white';
              ctx.stroke();
          }

          function updateTimer() {
            if (currentTime > 0) {
              currentTime--;
              timerText.textContent = currentTime;
              drawTimer(currentTime);
            } else {
              // Game timeout
              document.body.style.display = 'none';
              clearInterval(timerInterval);
            }
          }

          function scrollLetters(itemIndex) {
              let offset = 0;
              const container = document.querySelectorAll('.item')[itemIndex];

              function scroll() {
                if (stopScrolls[itemIndex]) return;

                const letters = container.querySelectorAll('.letter');
                const firstLetter = letters[0];
                const itemWidth = firstLetter.offsetWidth;

                letters.forEach((letter) => {
                  letter.style.transform = \`translate3d(\${offset}px, 0, 0)\`;
                });

                offset -= scrollSpeed;

                if (firstLetter.getBoundingClientRect().right < container.getBoundingClientRect().left) {
                  container.appendChild(firstLetter);
                  offset += itemWidth;
                }

                requestAnimationFrame(scroll);
              }

              scroll();
          }

          function updateLocks() {
            const flexBox = document.querySelector('.flex-box');
            flexBox.innerHTML = '';

            randomItems.forEach((item, index) => {
              const letterItem = document.createElement('div');
              letterItem.classList.add('letter-item');
              if (itemsStatus[index]) {
                const letterDiv = document.createElement('div');
                letterDiv.classList.add('my-letter');
                letterDiv.textContent = item.char;
                letterItem.style.border = '1px solid white';
                letterItem.appendChild(letterDiv);
              } else {
                const lockImg = document.createElement('img');
                lockImg.src = "../images/lock.svg";
                letterItem.appendChild(lockImg);
              }
              flexBox.appendChild(letterItem);
            });
          }

          function checkAndUpdateLocks(itemIndex, correctLetter) {
            if (!itemsStatus[itemIndex]) {
              itemsStatus[itemIndex] = true;
              randomItems[itemIndex].char = correctLetter;
              updateLocks();
              checkGameStatus();
            }
          }

          let currentControllerIndex = 0;

          function updateController(isCorrect) {
            const controllerItems = document.querySelectorAll('.controller-item');

            const errorCount = document.querySelectorAll('.controller-item img[src="../images/error.svg"]').length;

            if (errorCount > 1) {
              alert('Oyunu kaybettiniz!');
              return;
            }

            if (currentControllerIndex < controllerItems.length) {
              const controllerItem = controllerItems[currentControllerIndex];

              if (isCorrect) {
                controllerItem.style.background = 'rgba(82, 232, 189, 0.10)';
                controllerItem.innerHTML = '<img src="../images/correct.svg" alt="">';
              } else {
                controllerItem.style.background = 'rgba(232, 82, 97, 0.15)';
                controllerItem.innerHTML = '<img src="../images/error.svg" alt="">';
              }

              currentControllerIndex++;
              checkGameStatus()
            }
          }

          function checkGameStatus() {
            const allCorrectOrOneWrong = itemsStatus.filter(status => status === true).length === randomItems.length - 1;
            const errorCount = document.querySelectorAll('.controller-item img[src="../images/error.svg"]').length;

            if (allCorrectOrOneWrong && errorCount <= 1) {
              clearInterval(timerInterval);
              setTimeout(() => {
                document.body.style.display = 'none';
                // Game completed
              }, 1500);
            } else if (errorCount > 1) {
              clearInterval(timerInterval);
              setTimeout(() => {
                document.body.style.display = 'none';
                // Game failed
              }, 1500);
            }
          }

          function checkPosition(itemIndex) {
            updateItemBackgrounds();

            const selector = document.querySelector('.selector');
            const selectorStyle = window.getComputedStyle(selector);
            const topValue = selectorStyle.getPropertyValue('top');
            const parentHeight = selector.parentElement.offsetHeight;
            const topPercent = (parseFloat(topValue) / parentHeight) * 100;
            const newTopPercent = topPercent + 10.3;

            const container = document.querySelectorAll('.item')[itemIndex];
            const lettersMy = container.querySelectorAll('.letter .text');

            let randomIndex = Math.floor(Math.random() * lettersMy.length);
            let randomLetter = lettersMy[randomIndex];
            randomLetter.style.color = 'green';

            function handleKeyPress(event) {
              const keyPressed = event.key.toUpperCase();

              const rect = randomLetter.getBoundingClientRect();
              const selectorRect = selector.getBoundingClientRect();

              const isFullyInside =
                rect.left >= selectorRect.left &&
                rect.right <= selectorRect.right &&
                rect.top >= selectorRect.top &&
                rect.bottom <= selectorRect.bottom;

              if (keyPressed === randomLetter.innerText && isFullyInside) {
                randomLetter.style.color = '#FFF';
                randomLetter.style.transition = 'color 0.5s';

                stopScrolls[itemIndex] = true;
                checkAndUpdateLocks(itemIndex, randomLetter.innerText);
                window.removeEventListener('keydown', handleKeyPress);

                updateController(true);

                currentItemIndex++;
                updateItemBackgrounds();

                selector.style.top = newTopPercent + '%';

                if (currentItemIndex >= document.querySelectorAll('.item').length) {
                  selector.style.top = '36.1%';
                  return;
                }

                stopScrolls[currentItemIndex] = false;
                scrollLetters(currentItemIndex);
                checkPosition(currentItemIndex);
              } else if (keyPressed !== randomLetter.innerText && isFullyInside) {
                randomLetter.style.color = 'red';
                randomLetter.style.transition = 'color 0.5s';

                updateController(false);
              }
            }

            function check() {
              if (stopScrolls[itemIndex]) return;

              const rect = randomLetter.getBoundingClientRect();
              const selectorRect = selector.getBoundingClientRect();

              const isFullyInside =
                rect.left >= selectorRect.left &&
                rect.right <= selectorRect.right &&
                rect.top >= selectorRect.top &&
                rect.bottom <= selectorRect.bottom;

              if (isFullyInside) {
                randomLetter.style.color = 'white';
                selector.style.boxShadow = 'inset 0 0 3vh rgba(255, 255, 255, 0.3)';
                window.removeEventListener('keydown', handleKeyPress);
                window.addEventListener('keydown', handleKeyPress, { once: true });
              } else {
                selector.style.boxShadow = 'none';
                randomLetter.style.color = 'rgba(255, 255, 255, 0.15)';
              }

              requestAnimationFrame(check);
            }

            check();
          }

          function updateItemBackgrounds() {
            const items = document.querySelectorAll('.item');

            items.forEach((item, index) => {
              item.style.background = '#0b0b0b';

              const lightElements = item.querySelectorAll('.light');

              lightElements.forEach((lightElement) => {
                lightElement.style.background = 'rgba(255, 255, 255, 0.05)';
              });

              if (index === currentItemIndex) {
                item.style.background = 'rgba(255, 255, 255, 0.10)';

                lightElements.forEach((lightElement) => {
                  lightElement.style.background = '#FFF';
                });
              }
            });
          }

          function getRandomChars(charSet, count) {
            let result = '';
            for (let i = 0; i < count; i++) {
              result += charSet[Math.floor(Math.random() * charSet.length)];
            }
            return result;
          }

          function addMultipleLettersToItem(item, charSet, letterCount) {
            if (!item) return;

            for (let i = 0; i < letterCount; i++) {
              const letterDiv = document.createElement('div');
              letterDiv.classList.add('letter');

              const textDiv = document.createElement('div');
              textDiv.classList.add('text');
              const randomChar = getRandomChars(charSet, 1);
              textDiv.innerText = randomChar;

              letterDiv.appendChild(textDiv);
              item.appendChild(letterDiv);
            }
          }

          function addLettersToContainer() {
            const items = document.querySelectorAll('.item');
            const letterCount = 15;

            addMultipleLettersToItem(items[5], alphabet, letterCount);
            addMultipleLettersToItem(items[4], numbers, letterCount);
            addMultipleLettersToItem(items[3], numbers + alphabet, letterCount);
            addMultipleLettersToItem(items[2], numbers +  alphabet, letterCount);
            addMultipleLettersToItem(items[1], alphabet + numbers, letterCount);
            addMultipleLettersToItem(items[0], alphabet, letterCount);

            initializeStopScrolls(items);

            stopScrolls[0] = false;
            scrollLetters(currentItemIndex);
            checkPosition(currentItemIndex);
          }
        }, 100);
      `;
      document.body.appendChild(script);
    }

    // Cleanup function
    return () => {
      const existingStyle = document.getElementById('lettergame-styles');
      const existingScript = document.getElementById('lettergame-script');
      if (existingStyle) document.head.removeChild(existingStyle);
      if (existingScript) document.body.removeChild(existingScript);

      // Clear game container
      const container = document.getElementById('game-container');
      if (container) container.innerHTML = '';
    };
  }, []);

  return <div id="game-container"></div>;
}
