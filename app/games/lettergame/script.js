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
  $('.item').empty();
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
    $('.header').text(data.header);
    $('.desc').text(data.text);

    scrollSpeed = data.speed;

    resetGame();  
    $('body').fadeIn();
    $('body').css('display', 'flex');
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
    $.post('https://frkn-lettergame/error', JSON.stringify({}));
    $('body').css('display', 'none');
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
        letter.style.transform = `translate3d(${offset}px, 0, 0)`;
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

// updateLocks();

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
      $('body').css('display', 'none');
      $.post('https://frkn-lettergame/complete', JSON.stringify({}));
    }, 1500);
  } else if (errorCount > 1) {
    clearInterval(timerInterval);
    setTimeout(() => {
      $('body').css('display', 'none');
      $.post('https://frkn-lettergame/error', JSON.stringify({}));
    }, 1500);
  }
}

function checkPosition(itemIndex) {
  updateItemBackgrounds();

  const ss = $('.selector');
  const topValue = ss.css('top');
  const parentHeight = ss.parent().height();
  const topPercent = (parseFloat(topValue) / parentHeight) * 100;
  const newTopPercent = topPercent + 10.3;

  const container = document.querySelectorAll('.item')[itemIndex];
  const lettersMy = container.querySelectorAll('.letter .text');
  const selector = document.querySelector('.selector');

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
  
      ss.css('top', newTopPercent + '%');
  
      if (currentItemIndex >= document.querySelectorAll('.item').length) {
        ss.css('top', '36.1%');
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
      $('.selector').css('box-shadow', 'inset 0 0 3vh rgba(255, 255, 255, 0.3)');
      window.removeEventListener('keydown', handleKeyPress);
      window.addEventListener('keydown', handleKeyPress, { once: true });
    } else {
      $('.selector').css('box-shadow', 'none');
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

// addLettersToContainer();