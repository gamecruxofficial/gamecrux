'use client';

import { useEffect } from 'react';
import Head from 'next/head';
import Script from 'next/script';

export default function HouseRobberyGame() {
  useEffect(() => {
    // Check if jQuery is loaded before running the game logic
    if (!window.jQuery) {
      console.error("jQuery is not available.");
      return;
    }

    // --- GAME LOGIC START ---
    const $ = window.jQuery;
    const gridSizeX = 6;
    const gridSizeY = 7;
    let activeX = 0;
    let activeY = gridSizeY - 1;
    let totalTime = 30; // Default time
    let currentTime = 30;
    let timerInterval: NodeJS.Timeout | null = null;
    let currentMission: any = null; // Use 'any' for simplicity with mixed mission structures

    const canvas = document.getElementById('timerCanvas') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    const timerText = document.getElementById('timerText');
    const $gameGrid = $('#game-grid');
    const $gameWrapper = $('#game-wrapper');
    const $startButton = $('#start-button');

    // --- MISSION AND BOX SETUP ---
    function generateRandomMovableBoxes(boxCount: number) {
      const boxes: { x: number; y: number }[] = [];
      // Generate boxes away from the edges (within a 4x5 inner grid)
      while (boxes.length < boxCount) {
        const xPosition = Math.floor(Math.random() * (gridSizeX - 2)) + 1; // 1 to 4
        const yPosition = Math.floor(Math.random() * (gridSizeY - 2)) + 1; // 1 to 5
        // Ensure no duplicate box positions
        if (!boxes.some(box => box.x === xPosition && box.y === yPosition)) {
          boxes.push({ x: xPosition, y: yPosition });
        }
      }
      return boxes;
    }

    const missions = [
      {
        name: 'Horizontal Line',
        boxCount: 3,
        check: function () {
          const rows: { [key: number]: number[] } = {};
          this.movableBoxes.forEach((box: { x: number, y: number }) => {
            rows[box.y] = rows[box.y] || [];
            rows[box.y].push(box.x);
          });
          for (const y in rows) {
            if (rows[y].length >= 3) {
              const sorted = rows[y].sort((a, b) => a - b);
              for (let i = 0; i <= sorted.length - 3; i++) {
                if (sorted[i] + 1 === sorted[i + 1] && sorted[i + 2] === sorted[i + 1] + 1) return true;
              }
            }
          }
          return false;
        }
      },
      {
        name: 'Vertical Line',
        boxCount: 3,
        check: function () {
          const cols: { [key: number]: number[] } = {};
          this.movableBoxes.forEach((box: { x: number, y: number }) => {
            cols[box.x] = cols[box.x] || [];
            cols[box.x].push(box.y);
          });
          for (const x in cols) {
            if (cols[x].length >= 3) {
              const sorted = cols[x].sort((a, b) => a - b);
              for (let i = 0; i <= sorted.length - 3; i++) {
                if (sorted[i] + 1 === sorted[i + 1] && sorted[i + 2] === sorted[i + 1] + 1) return true;
              }
            }
          }
          return false;
        }
      },
      {
        name: 'Plus Shape',
        boxCount: 5,
        check: function () {
            for (const box of this.movableBoxes) {
                const hasCenter = this.movableBoxes.some((b: {x:number, y:number}) => b.x === box.x && b.y === box.y);
                const hasUp = this.movableBoxes.some((b: {x:number, y:number}) => b.x === box.x && b.y === box.y - 1);
                const hasDown = this.movableBoxes.some((b: {x:number, y:number}) => b.x === box.x && b.y === box.y + 1);
                const hasLeft = this.movableBoxes.some((b: {x:number, y:number}) => b.x === box.x - 1 && b.y === box.y);
                const hasRight = this.movableBoxes.some((b: {x:number, y:number}) => b.x === box.x + 1 && b.y === box.y);
                if (hasCenter && hasUp && hasDown && hasLeft && hasRight) return true;
            }
            return false;
        }
      },
      {
        name: 'L Shape',
        boxCount: 4,
        check: function () {
            for (const box of this.movableBoxes) {
                const isCorner = this.movableBoxes.some((b: {x:number, y:number}) => b.x === box.x && b.y === box.y);
                const hasUp = this.movableBoxes.some((b: {x:number, y:number}) => b.x === box.x && b.y === box.y - 1);
                const hasUp2 = this.movableBoxes.some((b: {x:number, y:number}) => b.x === box.x && b.y === box.y - 2);
                const hasRight = this.movableBoxes.some((b: {x:number, y:number}) => b.x === box.x + 1 && b.y === box.y);
                if (isCorner && hasUp && hasUp2 && hasRight) return true;
            }
            return false;
        }
      },
    ];

    // --- GAME STATE & UI FUNCTIONS ---
    function setActiveBox(x: number, y: number) {
      $('.grid').removeClass('active').empty();
      $(`.grid[data-x='${x}'][data-y='${y}']`)
        .addClass('active')
        .html(`<img src="/images/icon.svg" alt="player icon" />`);
    }

    function setMovableBoxes() {
      // Clear previous movable boxes first
      $('.grid').removeClass('movable');
      currentMission.movableBoxes.forEach((box: { x: number; y: number; }) => {
        $(`.grid[data-x='${box.x}'][data-y='${box.y}']`).addClass('movable');
      });
    }

    function resetGame() {
      if (timerInterval) clearInterval(timerInterval);

      const missionIndex = Math.floor(Math.random() * missions.length);
      currentMission = { ...missions[missionIndex] }; // Create a fresh copy
      currentMission.movableBoxes = generateRandomMovableBoxes(currentMission.boxCount);

      $('#target-shape, .shape').text(currentMission.name);

      activeX = 0;
      activeY = gridSizeY - 1;

      setMovableBoxes();
      setActiveBox(activeX, activeY);

      currentTime = totalTime;
      timerText!.textContent = currentTime.toString().padStart(2, '0');
      drawTimer(1); // Full circle
      timerInterval = setInterval(updateTimer, 1000);
    }

    function completeGame(isWin: boolean) {
      if (timerInterval) clearInterval(timerInterval);
      $(document).off('keydown', keydownHandler); // Disable controls

      const resultText = isWin ? "You Win!" : "Time's Up!";
      const icon = isWin ? 'success' : 'error';

      if(isWin) {
         $('.movable').addClass('win');
      }

      // Use SweetAlert2 for a nice modal popup
      setTimeout(() => {
        (window as any).Swal.fire({
            title: resultText,
            text: "The game will restart.",
            icon: icon,
            timer: 3000,
            showConfirmButton: false,
            willClose: () => {
                $gameWrapper.hide();
                $startButton.show();
            }
        });
      }, isWin ? 1000 : 100); // Shorter delay if lost
    }

    // --- TIMER FUNCTIONS ---
    function drawTimer(fraction: number) {
      if (!ctx) return;
      const startAngle = -Math.PI / 2;
      const endAngle = (fraction * 2 * Math.PI) + startAngle;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Background circle
      ctx.beginPath();
      ctx.arc(50, 50, 35, 0, 2 * Math.PI);
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#444';
      ctx.stroke();
      // Foreground timer arc
      ctx.beginPath();
      ctx.arc(50, 50, 35, startAngle, endAngle);
      ctx.lineWidth = 6;
      ctx.strokeStyle = 'white';
      ctx.stroke();
    }

    function updateTimer() {
      currentTime--;
      timerText!.textContent = currentTime.toString().padStart(2, '0');
      drawTimer(currentTime / totalTime);

      if (currentTime <= 0) {
        completeGame(false);
      }
    }

    // --- CORE MOVEMENT AND WIN-CHECK LOGIC ---
    const keydownHandler = (e: JQuery.KeyDownEvent) => {
      let dx = 0, dy = 0;
      if (e.key === 'ArrowUp') dy = -1;
      if (e.key === 'ArrowDown') dy = 1;
      if (e.key === 'ArrowLeft') dx = -1;
      if (e.key === 'ArrowRight') dx = 1;

      if (dx === 0 && dy === 0) return; // Not an arrow key

      const nextX = activeX + dx;
      const nextY = activeY + dy;

      // Check grid boundaries
      if (nextX < 0 || nextX >= gridSizeX || nextY < 0 || nextY >= gridSizeY) {
        return;
      }

      const isTargetMovable = currentMission.movableBoxes.some((box: {x: number, y:number}) => box.x === nextX && box.y === nextY);

      let canMove = false;
      if (isTargetMovable) {
        // Trying to push a box
        const boxNextX = nextX + dx;
        const boxNextY = nextY + dy;

        // Check if space beyond the box is within bounds and not occupied
        const canPush = (
          boxNextX >= 0 && boxNextX < gridSizeX && boxNextY >= 0 && boxNextY < gridSizeY &&
          !currentMission.movableBoxes.some((box: {x: number, y:number}) => box.x === boxNextX && box.y === boxNextY)
        );

        if (canPush) {
            // Find the box and update its position
            const boxToPush = currentMission.movableBoxes.find((box: {x: number, y:number}) => box.x === nextX && box.y === nextY);
            boxToPush.x = boxNextX;
            boxToPush.y = boxNextY;
            canMove = true;
        }
      } else {
        // Moving into an empty space
        canMove = true;
      }

      if (canMove) {
        activeX = nextX;
        activeY = nextY;
        setMovableBoxes();
        setActiveBox(activeX, activeY);

        if (currentMission.check()) {
          completeGame(true);
        }
      }
    };

    // --- INITIALIZATION ---
    function init() {
      // Create grid cells if they don't exist
      if ($gameGrid.children().length === 0) {
        for (let y = 0; y < gridSizeY; y++) {
          for (let x = 0; x < gridSizeX; x++) {
            $gameGrid.append($(`<div class="grid" data-x="${x}" data-y="${y}"></div>`));
          }
        }
      }

      $startButton.on('click', () => {
        $startButton.hide();
        $gameWrapper.show();
        resetGame();
        // Attach keydown listener only when game starts
        $(document).on('keydown', keydownHandler);
      });
    }

    init();

    // Cleanup function to remove listeners when the component unmounts
    return () => {
      $(document).off('keydown', keydownHandler);
      $startButton.off('click');
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []); // Empty array ensures this runs only once on component mount

  return (
    <>
      <Head>
        <title>House Robbery Minigame</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&display=swap" rel="stylesheet" />
      </Head>

      <Script src="https://code.jquery.com/jquery-3.6.0.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/sweetalert2@11" strategy="lazyOnload" />

      <main id="page-wrapper">
        <button id="start-button">Start Game</button>

        <div id="game-wrapper" style={{ display: 'none' }}>
          <div className="container">
            <div className="timer-container">
              <canvas id="timerCanvas" width="100" height="100"></canvas>
              <div className="timer-text" id="timerText">30</div>
              <div className="timer-unit">SEC</div>
            </div>

            <img src="/images/bg2.png" className="bg" alt="background" />
            <img src="/images/user.png" className="user" alt="user icon" />

            <div className="header-text">
              <h1>HOUSE<span style={{ fontWeight: '400' }}>ROBBERY</span></h1>
              <p>SHAPE TO MAKE: <span id="target-shape"></span></p>
            </div>

            <div className="shape-display-container">
                <div className="shape" id="shape"></div>
            </div>

            <div id="game-grid">
              {/* Grid cells are generated by script */}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        /* --- General Setup --- */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Montserrat', sans-serif;
          background-color: #1a1a1a;
          color: #fff;
          overflow: hidden; /* Prevent scrollbars from appearing */
        }
        #page-wrapper {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100vw;
          position: absolute;
          top: 0;
          left: 0;
        }
        #start-button {
          padding: 15px 30px;
          font-size: 1.2rem;
          font-weight: bold;
          cursor: pointer;
          background-color: #52E8BD;
          border: none;
          border-radius: 8px;
          color: #1a1a1a;
          text-transform: uppercase;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
        #start-button:hover {
            transform: translate(-50%, -50%) scale(1.05);
            box-shadow: 0 0 15px #52E8BD;
        }

        /* --- Game Container & Layout --- */
        #game-wrapper {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .container {
          position: relative;
          width: 550px;
          height: 650px;
        }
        .container .bg {
          position: absolute;
          width: 100%;
          height: 100%;
          user-select: none;
          z-index: -1;
        }
        .container .user {
          position: absolute;
          width: 30px;
          height: auto;
          left: 25px;
          top: 25px;
        }
        .header-text {
          position: absolute;
          left: 70px;
          top: 20px;
          line-height: 1.2;
        }
        .header-text h1 {
          font-size: 1.1rem;
          font-weight: 900;
        }
        .header-text p {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
        }
        .shape-display-container {
            position: absolute;
            right: 35px;
            top: 28px;
            color: #52E8BD;
            font-weight: bold;
            font-size: 0.8rem;
            text-transform: uppercase;
        }

        /* --- Game Grid --- */
        #game-grid {
          position: absolute;
          display: grid;
          grid-template-columns: repeat(6, 70px);
          grid-template-rows: repeat(7, 70px);
          gap: 5px;
          left: 50%;
          top: 53%; /* Fine-tuned for alignment with bg */
          transform: translate(-50%, -50%);
        }
        .grid {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 5px;
          transition: transform 0.2s ease, background 0.2s ease, border 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .grid img {
          width: 40px;
          height: 40px;
        }

        /* --- Active and Movable States --- */
        .active {
          border: 2px solid #52E8BD;
          background: rgba(82, 232, 189, 0.15);
          transform: scale(1.05);
        }
        .movable {
          background: radial-gradient(circle, #52E8BD 0%, #2E826A 100%);
          transition: background 0.5s;
        }
        .win {
            animation: winAnimation 1s ease-in-out;
        }
        @keyframes winAnimation {
          50% { transform: scale(0.8) rotate(15deg); }
          100% { transform: scale(1); }
        }

        /* --- Timer --- */
        .timer-container {
          position: absolute;
          width: 100px;
          height: 100px;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        #timerCanvas {
          position: absolute;
          top: 0;
          left: 0;
        }
        .timer-text {
          font-size: 1.5rem;
          font-weight: 900;
          z-index: 2;
        }
        .timer-unit {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          z-index: 2;
        }
      `}</style>
    </>
  );
}