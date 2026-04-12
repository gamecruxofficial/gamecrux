const gridSizeX = 6;
const gridSizeY = 7;
let activeX = 0;
let activeY = gridSizeY - 1;
let totalTime = null; 
let currentTime = null;
let timerInterval = null;
const canvas = document.getElementById('timerCanvas');
const ctx = canvas.getContext('2d');
const timerText = document.getElementById('timerText');
let currentMission = null;

const $gameGrid = $('#game-grid');

function generateRandomMovableBoxes(boxCount, sameLine = false) {
    let boxes = [];
    
    for (let i = 0; i < boxCount; i++) {
      let xPosition;
      let yPosition;
  
      if (sameLine) {
        yPosition = Math.floor(Math.random() * (gridSizeY - 2)) + 1;  
        do {
          xPosition = Math.floor(Math.random() * (gridSizeX - 2)) + 1;  
        } while (boxes.some(box => box.x === xPosition && box.y === yPosition)); 
      } else {
        do {
          xPosition = Math.floor(Math.random() * (gridSizeX - 2)) + 1;
          yPosition = Math.floor(Math.random() * (gridSizeY - 2)) + 1;
        } while (boxes.some(box => box.x === xPosition && box.y === yPosition)); 
      }
  
      boxes.push({ x: xPosition, y: yPosition });
    }
    
    return boxes;
}

const missions = [
  {
    name: 'Horizontal Line',
    type: 'horizontalLine',
    movableBoxes: generateRandomMovableBoxes(3, true),
    check: function () {
      let rows = {};

      this.movableBoxes.forEach(box => {
        if (!rows[box.y]) {
          rows[box.y] = [];
        }
        rows[box.y].push(box.x);
      });

      for (let y in rows) {
        const xPositions = rows[y].sort();
        const hasMovableBoxes = this.movableBoxes.filter(box => box.y === parseInt(y)).length >= 3;

        if (hasMovableBoxes) {
          for (let i = 0; i < xPositions.length - 2; i++) {
            if (xPositions[i] + 1 === xPositions[i + 1] && xPositions[i] + 2 === xPositions[i + 2]) {
              return true;
            }
          }
        }
      }

      return false;
    }
  },
  {
    name: 'Vertical Line',
    type: 'verticalLine',
    movableBoxes: generateRandomMovableBoxes(3, true),
    check: function () {
      let columns = {};

      this.movableBoxes.forEach(box => {
        if (!columns[box.x]) {
          columns[box.x] = [];
        }
        columns[box.x].push(box.y);
      });

      for (let x in columns) {
        const yPositions = columns[x].sort();
        const hasMovableBoxes = this.movableBoxes.filter(box => box.x === parseInt(x)).length >= 3;

        if (hasMovableBoxes) {
          for (let i = 0; i < yPositions.length - 2; i++) {
            if (yPositions[i] + 1 === yPositions[i + 1] && yPositions[i] + 2 === yPositions[i + 2]) {
              return true;
            }
          }
        }
      }

      return false;
    }
  },
  {
    name: 'Square (Hollow)',
    type: 'largeSquareEmpty',
    movableBoxes: generateRandomMovableBoxes(8),
    check: function () {
      let largeSquares = [];
  
      for (let y = 1; y < gridSizeY - 2; y++) {
        for (let x = 1; x < gridSizeX - 2; x++) {
          const largeSquare = [
            { x: x, y: y },        
            { x: x + 1, y: y },    
            { x: x + 2, y: y },    
            { x: x, y: y + 1 },    
            { x: x + 2, y: y + 1 },
            { x: x, y: y + 2 },    
            { x: x + 1, y: y + 2 },
            { x: x + 2, y: y + 2 }
          ];
  
          const center = { x: x + 1, y: y + 1 };  
  
          largeSquares.push({ square: largeSquare, center: center });
        }
      }

      for (let i = 0; i < largeSquares.length; i++) {
        const largeSquare = largeSquares[i].square;
        const center = largeSquares[i].center;
  
        const hasMovableBoxes = largeSquare.every(pos => 
          this.movableBoxes.some(box => box.x === pos.x && box.y === pos.y)
        );
  
        const isCenterEmpty = !this.movableBoxes.some(box => box.x === center.x && box.y === center.y);
  
        if (hasMovableBoxes && isCenterEmpty) {
          return true;
        }
      }
  
      return false;
    }
  },
  {
    name: 'Inverted L Shape',
    type: 'invertedLShape',
    movableBoxes: generateRandomMovableBoxes(4),
    check: function () {
      let columns = {};
  
      this.movableBoxes.forEach(box => {
        if (!columns[box.x]) {
          columns[box.x] = [];
        }
        columns[box.x].push(box.y);
      });
  
      for (let x in columns) {
        const yPositions = columns[x].sort((a, b) => a - b);
  
        const hasVerticalLine = yPositions.length >= 3 && 
                                yPositions[0] + 1 === yPositions[1] && 
                                yPositions[1] + 1 === yPositions[2];
  
        if (hasVerticalLine) {
          const topY = yPositions[0];
          const hasHorizontalBox = this.movableBoxes.some(box => box.x === parseInt(x) + 1 && box.y === topY);
  
          if (hasHorizontalBox) {
            return true; 
          }
        }
      }
  
      return false; 
    }
  },
  // {
  //   name: 'Inverted T Shape',
  //   type: 'invertedTShape',
  //   movableBoxes: generateRandomMovableBoxes(5),
  //   check: function () {
  //     let rows = {};
  
  //     this.movableBoxes.forEach(box => {
  //       if (!rows[box.y]) {
  //         rows[box.y] = [];
  //       }
  //       rows[box.y].push(box.x);
  //     });
  
  //     const yPositions = Object.keys(rows).sort();
  //     const topY = Math.min(...yPositions);
  //     const hasHorizontalTop = rows[topY].length === 3 && Math.abs(rows[topY][0] - rows[topY][1]) === 1 && Math.abs(rows[topY][1] - rows[topY][2]) === 1;
  
  //     const centerX = rows[topY][1];
  //     const hasVerticalCenter = this.movableBoxes.some(box => box.x === centerX && box.y === topY + 1) && this.movableBoxes.some(box => box.x === centerX && box.y === topY + 2);
  
  //     if (hasHorizontalTop && hasVerticalCenter) {
  //       return true;
  //     }
  
  //     return false;
  //   }
  // },
  {
    name: 'L Shape',
    type: 'lShape',
    movableBoxes: generateRandomMovableBoxes(4),
    check: function () {
      let columns = {};
    
      this.movableBoxes.forEach(box => {
        if (!columns[box.x]) {
          columns[box.x] = [];
        }
        columns[box.x].push(box.y);
      });
    
      for (let x in columns) {
        const yPositions = columns[x].sort((a, b) => a - b);
    
        const hasVerticalLine = yPositions.length >= 3 && 
                                yPositions[0] + 1 === yPositions[1] && 
                                yPositions[1] + 1 === yPositions[2];
    
        if (hasVerticalLine) {
          const bottomY = yPositions[2]; 
          const hasHorizontalBox = this.movableBoxes.some(box => box.x === parseInt(x) + 1 && box.y === bottomY);
    
          if (hasHorizontalBox) {
            return true; 
          }
        }
      }
    
      return false; 
    }
  },
  {
    name: 'Plus Shape',
    type: 'plusShape',
    movableBoxes: generateRandomMovableBoxes(5),
    check: function () {
        let centerX, centerY;
        let horizontalCount = 0;
        let verticalCount = 0;

        this.movableBoxes.forEach(box => {
            const hasLeft = this.movableBoxes.some(b => b.x === box.x - 1 && b.y === box.y);
            const hasRight = this.movableBoxes.some(b => b.x === box.x + 1 && b.y === box.y);
            const hasUp = this.movableBoxes.some(b => b.x === box.x && b.y === box.y - 1);
            const hasDown = this.movableBoxes.some(b => b.x === box.x && b.y === box.y + 1);

            if (hasLeft && hasRight && hasUp && hasDown) {
                centerX = box.x;
                centerY = box.y;
            }
        });

        if (centerX !== undefined && centerY !== undefined) {
            horizontalCount = this.movableBoxes.filter(box => 
                (box.x === centerX - 1 || box.x === centerX || box.x === centerX + 1) && box.y === centerY
            ).length;

            verticalCount = this.movableBoxes.filter(box => 
                (box.y === centerY - 1 || box.y === centerY || box.y === centerY + 1) && box.x === centerX
            ).length;

            if (horizontalCount === 3 && verticalCount === 3) {
                return true; 
            }
        }

        return false; 
    }
 },

];

for (let y = 0; y < gridSizeY; y++) {
  for (let x = 0; x < gridSizeX; x++) {
    const $div = $('<div class="grid"></div>').attr({ 'data-x': x, 'data-y': y });
    $gameGrid.append($div);
  }
}


window.addEventListener("message", function(event) {
  const data = event.data;

  if (data.action === "START_GRID_GAME") {
    clearInterval(timerInterval);
    currentTime = data.time;
    totalTime = data.time;
    timerInterval = setInterval(updateTimer, 1000);
    drawTimer(currentTime);
    resetGame();
    $('body').show();
    $('body').css('display', 'flex');
  }
});




function setMovableBoxes() {
  $('.grid').removeClass('movable');
  currentMission.movableBoxes.forEach(box => {
    const $boxDiv = $(`.grid[data-x='${box.x}'][data-y='${box.y}']`);
    $boxDiv.addClass('movable');
  });
}

function setActiveBox(x, y) {
  $('.grid').removeClass('active').html('');
  
  const $activeBox = $(`.grid[data-x='${x}'][data-y='${y}']`);
  if ($activeBox) {
    $activeBox.addClass('active').html(`<img src="../images/icon.svg" width="30" height="30" />`);
  }
}

function moveMovableBox(targetX, targetY, dirX, dirY) {
  const boxIndex = currentMission.movableBoxes.findIndex(box => box.x === targetX && box.y === targetY);
  
  if (boxIndex !== -1) {
    const newBoxX = targetX + dirX;
    const newBoxY = targetY + dirY;

    if (newBoxX >= 0 && newBoxX < gridSizeX && newBoxY >= 0 && newBoxY < gridSizeY) {
      const isOccupied = currentMission.movableBoxes.some(box => box.x === newBoxX && box.y === newBoxY);
      if (!isOccupied) {
        currentMission.movableBoxes[boxIndex].x = newBoxX;
        currentMission.movableBoxes[boxIndex].y = newBoxY;
        setMovableBoxes();
        return true;
      }
    }
  }

  return false;
}

function checkWinCondition() {
    if (currentMission.check()) {
      $('.movable').addClass('win');
      setTimeout(() => {
        $('.movable').removeClass('win');
        resetGame();
        $.post('https://frkn-riddlegame/complete', JSON.stringify({}));
        $('body').hide();
      }, 1500);
    }
}

function resetGame() {
  $('body').hide();
  activeX = 0;
  activeY = gridSizeY - 1;
  
  currentMission = missions[Math.floor(Math.random() * missions.length)];
  $('#target-shape, .shape').text(currentMission.name);

  
  setActiveBox(activeX, activeY);
  currentMission.movableBoxes = generateRandomMovableBoxes(currentMission.movableBoxes.length); 
  setMovableBoxes();
}


$(document).on('keydown', function(e) {
  let moved = false;

  if (e.key === 'ArrowUp' && activeY > 0) {
    if (moveMovableBox(activeX, activeY - 1, 0, -1)) {
      activeY--;
    } else {
      activeY--;
    }
    moved = true;
  } else if (e.key === 'ArrowDown' && activeY < gridSizeY - 1) {
    if (moveMovableBox(activeX, activeY + 1, 0, 1)) {
      activeY++;
    } else {
      activeY++;
    }
    moved = true;
  } else if (e.key === 'ArrowLeft' && activeX > 0) {
    if (moveMovableBox(activeX - 1, activeY, -1, 0)) {
      activeX--;
    } else {
      activeX--;
    }
    moved = true;
  } else if (e.key === 'ArrowRight' && activeX < gridSizeX - 1) {
    if (moveMovableBox(activeX + 1, activeY, 1, 0)) {
      activeX++;
    } else {
      activeX++;
    }
    moved = true;
  }

  if (moved) {
    setActiveBox(activeX, activeY);
    checkWinCondition();
  }
});


function drawTimer(remainingTime) {
  const startAngle = -Math.PI / 2;
  const endAngle = ((2 * Math.PI) * (remainingTime / totalTime)) - Math.PI / 2;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.beginPath();
  ctx.arc(35, 35, 25, 0, 2 * Math.PI);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#444';
  ctx.stroke();
  
  ctx.beginPath();
  ctx.arc(35, 35, 25, startAngle, endAngle);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'white';
  ctx.stroke();
}

function updateTimer() {
if (currentTime > 0) {
  currentTime--;
  timerText.textContent = currentTime;
  drawTimer(currentTime);
} else {
  $.post('https://frkn-riddlegame/error', JSON.stringify({}));
  $('body').hide();
  clearInterval(timerInterval);
}
}
