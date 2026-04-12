let occupiedPositions = [];
let totalPositions = 36; 
let rotationAngle = 160; 
const circleLinks = document.getElementById("circleLinks");
const gameCircle = document.getElementById("gameCircle");
let direction = 1;
let totalSeconds = 500;
let level = 7; 
let isGameRunning = true;
let rotationSpeed = 1.5;
let canClick = true;
let interval = null;


window.addEventListener("message", function (e) {
    $("body").fadeIn(500);
    $("body").css("display", "flex");
    const data = e.data;
    console.log("data action", data.action , data.action==="STICK_GAME_OPEN");
    switch (data.action) {
        case "STICK_GAME_OPEN":
            startGame(data);
        default:
        break;
    }
})


function startGame(data) {
    level = data.level;
    totalSeconds = data.time;
    rotationSpeed = data.speed;

    // $('h1').text(data.header);
    // $('p').text(data.text);


    resetGame();
    runTimer(totalSeconds);
}


function initLevelCircles() {
    const circlesContainer = document.querySelector(".circles-container");
    circlesContainer.innerHTML = ''; 

    for (let i = level; i >= 1; i--) {
        const circleOption = document.createElement('div');
        circleOption.classList.add('circle-option');
        circleOption.textContent = i;
        // circleOption.onclick = () => sendCircle(i); 
        circlesContainer.appendChild(circleOption);
    }
}

function sendCircle(level) {
    const currentRotation = rotationAngle % 360;
    const adjustedPosition = Math.round(currentRotation / (360 / totalPositions)) % totalPositions;

    if (occupiedPositions.includes(adjustedPosition)) {
        isGameRunning = false;
        canClick = false;
        $('.line').css('background', '#E85261');
        $('.timer-progress-bar').css('background', '#E85261');
        $('.zort-circle').css({'background':'radial-gradient(circle, #E85261 40%, #D9FFFF 100%)','box-shadow':'0 0 30px #E85261'});
        $('.circle-number').text('FAIL');
        $('.dot').css({'background':'#682A30','border':'0.3vh solid #E85261'});
        $('.circle-option').css({'background':'#682A30','border':'0.3vh solid #E85261'});

        
        setTimeout(() => {
            $.post('https://frkn-stickgame/error', JSON.stringify({}));
            $('body').fadeOut(500);
            resetGame();
        }, 2000);

        return;
    }

    occupiedPositions.push(adjustedPosition);

    const dot = document.createElement('div');
    dot.classList.add('dot');

    const line = document.createElement('div');
    line.classList.add('line');

    const angle = (360 / totalPositions) * adjustedPosition;
    const radius = 180;

    let angleValue = angle;
    
    if (angle < 0) {
        angleValue = Math.abs(angle) + "deg";
    } else {
        angleValue = "-" + angle + "deg";
    }

    line.style.position = 'absolute';
    line.style.width = `${radius}px`; 
    line.style.height = '0.5vh';
    line.style.backgroundColor = '#52E8BD';
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

    $('.circle-number').text(occupiedPositions.length);

    if (level === 1) {
        isGameRunning = false;
        canClick = false;
        $('.line').css('background', '#34d2a0');
        $('.timer-progress-bar').css('background', '#34d2a0');
        $('.zort-circle').css({'background':'radial-gradient(circle, #34d2a0 40%, #D9FFFF 100%)','box-shadow':'0 0 30px #34d2a0'});
        $('.circle-number').text('WIN');
        $('.dot').css({'background':'#34d2a0','border':'0.3vh solid #34d2a0'});
        $('.circle-option').css({'background':'#34d2a0','border':'0.3vh solid #34d2a0'});

        setTimeout(() => {
            $.post('https://frkn-stickgame/complete', JSON.stringify({}));
            $('body').fadeOut(500);
            resetGame();
        }, 2000);
    }
}

document.addEventListener('click', function () {
    if (canClick) {
        const circlesContainer = document.querySelector(".circles-container");

        if (circlesContainer.children.length > 0) {
            const firstChild = circlesContainer.firstChild;

            firstChild.style.transition = 'transform 0.1s ease, opacity 0.1s ease';
            firstChild.style.transform = 'translateY(-50px)'; 
            firstChild.style.opacity = '0'; 

            setTimeout(() => {
                sendCircle(circlesContainer.children.length); 
                circlesContainer.removeChild(firstChild);
            }, 100); 
        }
    }
});

function updateRotation() {
    if (isGameRunning) {
        rotationAngle += direction * rotationSpeed;
        gameCircle.style.transform = `rotate(${rotationAngle}deg)`;
        requestAnimationFrame(updateRotation);
    }
}

updateRotation();

function runTimer(totalSeconds) {
    var timerProgress = document.querySelector(".timer-progress-bar");
    var initialWidth = 100; 
    var timeInterval = 1000; 

    // Eğer daha önce başlatılmış bir interval varsa, onu temizle
    if (interval) {
        clearInterval(interval);
    }

    // Yeni interval başlat
    interval = setInterval(function () {
        if (totalSeconds > 0) {
            totalSeconds--; 
            var percentage = (totalSeconds / 60) * 100; 

            timerProgress.style.width = percentage + "%"; 
        } else {
            clearInterval(interval);  // Zamanlayıcıyı durdur
            timerProgress.style.width = "0%"; 
        }
    }, timeInterval); 
}

function resetGame() {
    $('.line').remove();
    $('.dot').remove();
    $('.circle-option').remove();
    $('.circle-number').text('0');
    occupiedPositions = [];
    initLevelCircles();
    $('.timer-progress-bar').css('background', '#52E8BD');
    $('.zort-circle').css({'background':'radial-gradient(circle, #52E8BD 40%, #D9FFFF 100%)','box-shadow':'0 0 30px #52E8BD'});
    isGameRunning = true;
    canClick = true;
    updateRotation();

    // $.post('https://frkn-stickgame/close', JSON.stringify({})); 
}

// runTimer(60);
// initLevelCircles();
