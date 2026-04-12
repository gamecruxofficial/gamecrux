var totalSeconds = 25;
var gridCols = 11;
var gridRows = 8;

var noConnectedCubesCount = 0;
var maxNoConnectedCubes = 5; 


var clickSound = new Audio('../sounds/click.mp3');
var winSound = new Audio('../sounds/win.mp3');
var loseSound = new Audio('../sounds/lose.mp3');

    // window.addEventListener('DOMContentLoaded', function () {
    //     window.postMessage({
    //         action: "XOX_GAME_OPEN", 
    //         cols: 11,         // grid sütun sayısı
    //         rows: 8,          // grid satır sayısı
    //         time: 525,         // toplam süre (saniye cinsinden)
    //         header: " Here game description ", // Bilgilendirme başlığı
    //         text: "Here game description." // Bilgilendirme metni
    //     }, "*");
    // });

// window.addEventListener("message", function (e) {
//     const data = e.data;
//     console.log("Received data:", data);  // Tüm gelen veriyi loglayın
//     console.log("data action", data.action , data.action === "XOX_GAME_OPEN");

//     // Eğer gelen mesaj doğruysa
//     if (data.action === "XOX_GAME_OPEN") {
//         console.log("XOX_GAME_OPEN action received");
//         // Burada oyun başlatma veya ilgili işlemleri yapabilirsiniz.
//     }
// });

window.addEventListener('message', function(event) {
    e = event.data
    console.log(JSON.stringify(e))
    gridCols = 11
    gridRows = 8
    totalSeconds = e.time
    $('.info-container p').html(e.header)
    var cssVariables = {
        "--grid-columns": gridCols,
        "--grid-rows": gridRows
    };
    function resetGame() {
        var timerProgress = document.querySelector(".timer-progress-bar");
        timerProgress.style.transition = "width ".concat(totalSeconds, "s cubic-bezier(0.6, 1, 0.7, 0.93)");
        generateCubes();
        runTimer();
    }
    function generateCubes() {
        do {
            var container = document.getElementById("container");
            container.innerHTML = "";
            for (var i = 0; i < gridRows * gridCols; i++) {
                var cube = new Cube();
                container === null || container === void 0 ? void 0 : container.appendChild(cube.element);
            }
        } while (!checkSolvable()); 
    }
    function runTimer() {
        var timerProgress = document.querySelector(".timer-progress-bar");
        setTimeout(function () {
            timerProgress.style.width = "0%";
        }, 100);
        setTimeout(function () {
            endGame("lose");
        }, totalSeconds * 1000);
    }
    for (var _i = 0, _a = Object.entries(cssVariables); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        document.documentElement.style.setProperty(key, String(value));
    }
    console.log(e.action)
    if (e.action == "XOX_GAME_OPEN") {  
     startGame()
     resetGame()
    }
});


var Cube = /** @class */ (function () {
    function Cube() {
        this.container = document.getElementById("container");
        this.color = this.getRandomColorClass();
        this.element = document.createElement("div");
        this.element.className = "cube";
        this.element.classList.add(this.color);
        this.element.addEventListener("click", this.squareClick.bind(this));
    }
    Cube.prototype.cubeLeftShift = function () {
        var _a;
        var containerCopy = Array.from(this.container.childNodes);
        var isEmptyColumn = new Array(gridCols).fill(true);
        for (var i = 0; i < gridRows; i++) {
            for (var j = 0; j < gridCols; j++) {
                if (!containerCopy[i * gridCols + j].classList.contains("empty")) {
                    isEmptyColumn[j] = false;
                }
            }
        }
        for (var col = 0; col < gridCols; col++) {
            if (isEmptyColumn[col]) {
                for (var row = 0; row < gridRows; row++) {
                    for (var shiftCol = col; shiftCol < gridCols - 1; shiftCol++) {
                        var currentIndex = row * gridCols + shiftCol;
                        var nextIndex = row * gridCols + shiftCol + 1;
                        _a = [containerCopy[nextIndex], containerCopy[currentIndex]], containerCopy[currentIndex] = _a[0], containerCopy[nextIndex] = _a[1];
                    }
                }
                isEmptyColumn.splice(col, 1);
                isEmptyColumn.push(false); 
                col--; 
            }
        }
        this.updateContainer(containerCopy);
    };
    Cube.prototype.cubeGravity = function (idx) {
        var _a;
        var containerCopy = Array.from(this.container.childNodes);
        var row = Math.floor(idx / gridCols);
        for (var i = 0; i < row; i++) {
            _a = [containerCopy[idx - gridCols * (i + 1)], containerCopy[idx - gridCols * i]], containerCopy[idx - gridCols * i] = _a[0], containerCopy[idx - gridCols * (i + 1)] = _a[1];
        }
        this.updateContainer(containerCopy);
    };
    Cube.prototype.updateContainer = function (containerCopy) {
        var _this = this;
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
        containerCopy.forEach(function (node) {
            _this.container.appendChild(node);
        });
    };
    Cube.prototype.getAdjacentCubes = function (cube) {
        var idx = Array.from(this.container.childNodes).indexOf(cube);
        var adjacentCubes = [];
        var row = Math.floor(idx / gridCols);
        var col = idx % gridCols;
        if (col - 1 >= 0)
            adjacentCubes.push(this.container.childNodes[idx - 1]);
        if (col + 1 < gridCols)
            adjacentCubes.push(this.container.childNodes[idx + 1]);
        if (row - 1 >= 0)
            adjacentCubes.push(this.container.childNodes[idx - gridCols]);
        if (row + 1 < gridRows)
            adjacentCubes.push(this.container.childNodes[idx + gridCols]);
        return adjacentCubes;
    };
    Cube.prototype.removeConnectedCubes = function () {
        var _this = this;
        var connectedCubes = this.getConnectedCubes();
        
        if (connectedCubes.size === 1) {
            console.log("No connected cubes");
            
            sound = new Audio('../sounds/lose.mp3');
            sound.play().catch(function(error) {
                console.error("Ses dosyası oynatılamıyor:", error);
            });

            noConnectedCubesCount++;
            
            if (noConnectedCubesCount >= maxNoConnectedCubes) {
                endGame("lose"); 
            }
        } else {

            sound = new Audio('../sounds/click.mp3');

            sound.play().catch(function(error) {
                console.error("Ses dosyası oynatılamıyor:", error);
            })

            console.log("Connected cubes removed");
            noConnectedCubesCount = 0; 
            
            connectedCubes.forEach(function (cube) {
                cube.classList.remove(_this.color);
                cube.classList.add("empty");
                cube.removeEventListener("click", _this.squareClick);
                cube.innerHTML = "";
                _this.cubeGravity(Array.from(_this.container.childNodes).indexOf(cube)); 
            });
            this.cubeLeftShift();
        }
    };
    Cube.prototype.getRandomColorClass = function () {
        var colors = ["cuber", "cubeg", "cubeb"];
        var randomIndex = Math.floor(Math.random() * colors.length);
        return colors[randomIndex];
    };
    Cube.prototype.getConnectedCubes = function () {
        var _this = this;
        var connectedCubes = new Set();
        var queue = [this.element];
        while (queue.length > 0) {
            var currentCube = queue.shift();
            connectedCubes.add(currentCube);
            var neighbors = this.getAdjacentCubes(currentCube);
            neighbors.forEach(function (neighbor) {
                if (!connectedCubes.has(neighbor) && neighbor.classList.contains(_this.color)) {
                    queue.push(neighbor);
                    connectedCubes.add(neighbor);
                }
            });
        }
        return connectedCubes;
    };
    Cube.prototype.checkwin = function () {
        var container = document.getElementById("container");
        var divsInsideContainer = container.querySelectorAll('.empty');
        if (divsInsideContainer.length === gridRows * gridCols) {
            endGame("win");
        }
    };
    Cube.prototype.squareClick = function () {
        this.removeConnectedCubes();
        this.checkwin();
    };
    return Cube;
}());

function helpFunct(container, queue, path) {
    if (path === void 0) { path = []; }
    if (getColorCount(container).includes(1)) {
        return false;
    }
    var c = 0;
    container.forEach(function (cube) {
        if (cube.classList.contains("empty")) {
            c++;
        }
    });
    if (c === gridRows * gridCols) {
        return true;
    }
    else if (queue.length === 0) {
        return false;
    }
    while (queue.length > 0) {
        var connectedCubes = queue.shift();
        var _a = cubesUpdate(container, connectedCubes), updatedContainer = _a[0], possibleClick = _a[1];
        var updatedQueue = updateQueue(updatedContainer);
        var newPath = path.concat(possibleClick);
        if (helpFunct(updatedContainer, updatedQueue, newPath)) {
            return true;
        }
    }
    return false;
}
function cubesUpdate(container, connectedCubes) {
    var _a;
    var possibleClicks = -1;
    connectedCubes.forEach(function (cube) {
        var _a;
        var idx = container.indexOf(cube);
        cube.classList.remove(cube.classList.item(1));
        cube.classList.add("empty");
        possibleClicks = idx;
        var row = Math.floor(idx / gridCols);
        for (var i = 0; i < row; i++) {
            _a = [container[idx - gridCols * (i + 1)], container[idx - gridCols * i]], container[idx - gridCols * i] = _a[0], container[idx - gridCols * (i + 1)] = _a[1];
        }
    });
    var isEmptyColumn = new Array(gridCols).fill(true);
    for (var i = 0; i < gridRows; i++) {
        for (var j = 0; j < gridCols; j++) {
            if (!container[i * gridCols + j].classList.contains("empty")) {
                isEmptyColumn[j] = false;
            }
        }
    }
    for (var col = 0; col < gridCols; col++) {
        if (isEmptyColumn[col]) {
            for (var row = 0; row < gridRows; row++) {
                for (var shiftCol = col; shiftCol < gridCols - 1; shiftCol++) {
                    var currentIndex = row * gridCols + shiftCol;
                    var nextIndex = row * gridCols + shiftCol + 1;
                    _a = [container[nextIndex], container[currentIndex]], container[currentIndex] = _a[0], container[nextIndex] = _a[1];
                }
            }

            isEmptyColumn.splice(col, 1);
            isEmptyColumn.push(false);
            col--; 
        }
    }
    return [container, possibleClicks];
}
function updateQueue(container) {
    var queue = [];
    var visited = new Set();
    container.forEach(function (cube) {
        if (!cube.classList.contains("empty")) {
            var connectedCubes = getConnectedCubes(container, cube);
            for (var i = 0; i < connectedCubes.size; i++) {
                var connectedCube = connectedCubes[i];
                if (!visited.has(connectedCube)) {
                    visited.add(connectedCube);
                    queue.push(connectedCubes);
                }
                else {
                    continue;
                }
            }
        }
    });
    return queue;
}
function checkSolvable() {
    var container = document.getElementById("container");
    var containerCopy = Array.from(container.childNodes).map(function (node) { return node.cloneNode(true); });
    var queue = updateQueue(containerCopy);
    return helpFunct(containerCopy, queue);
}
function getConnectedCubes(container, cube) {
    var connectedCubes = new Set();
    var queue = [cube];
    while (queue.length > 0) {
        var currentCube = queue.shift();
        connectedCubes.add(currentCube);
        var neighbors = getAdjacentCubes(container, currentCube);
        neighbors.forEach(function (neighbor) {
            if (!connectedCubes.has(neighbor) && neighbor.classList.contains(cube.classList.item(1))) {
                connectedCubes.add(neighbor);
                queue.push(neighbor);
            }
        });
    }
    if (connectedCubes.size === 1) {
        connectedCubes.clear();
    }
    return connectedCubes;
}
function getAdjacentCubes(container, cube) {
    var idx = container.indexOf(cube);
    var adjacentCubes = [];
    var row = Math.floor(idx / gridCols);
    var col = idx % gridCols;
    if (col - 1 >= 0)
        adjacentCubes.push(container[idx - 1]);
    if (col + 1 < gridCols)
        adjacentCubes.push(container[idx + 1]);
    if (row - 1 >= 0)
        adjacentCubes.push(container[idx - gridCols]);
    if (row + 1 < gridRows)
        adjacentCubes.push(container[idx + gridCols]);
    return adjacentCubes;
}
function getColorCount(container) {
    var colorCount = [0, 0, 0];
    container.forEach(function (cube) {
        if (cube.classList.contains("cuber")) {
            colorCount[0]++;
        }
        else if (cube.classList.contains("cubeg")) {
            colorCount[1]++;
        }
        else if (cube.classList.contains("cubeb")) {
            colorCount[2]++;
        }
    });
    return colorCount;
}
function endGame(outcome) {
    var timerProgress = document.querySelector(".timer-progress-bar");
    var overlay = document.querySelector(".overlay");
    timerProgress.style.transition = "none";
    timerProgress.style.display = "none";
    timerProgress.style.width = "100%";
    overlay.style.display = "block";

    if (outcome === "win") {
        console.log("You won!");
        winSound.play();
        $("body").fadeOut(500);
        $.post('https://frkn-sosgame/complete', JSON.stringify({}));
        window.location.reload();
    } else if (outcome === "lose") {
        console.log("You lost!");
        loseSound.play();
        $("body").fadeOut(500);
        $.post('https://frkn-sosgame/error', JSON.stringify({}));
        window.location.reload();
    }

    setTimeout(function () {
        timerProgress.style.display = "block";
        overlay.style.display = 'none';
        $.post('https://frkn-sosgame/error', JSON.stringify({}));
        $.post('https://frkn-sosgame/close', JSON.stringify({}));
        resetGame();
    }, 2000);
}

function startGame() {
    console.log("Game Started");
    $('body').css('display', 'block');
    var instructionsToggle = document.getElementById('instructions-toggle');
    var instructionsContent = document.getElementById('instructions-content');
    
    if (instructionsToggle) {
        instructionsToggle.addEventListener('click', function () {
            instructionsContent.classList.toggle('active');
        });
    }
    
    console.log("Game Started");
    setTimeout(() => {

        document.querySelectorAll('.cube').forEach(function(cube) {
            console.log("cube");

            var img = document.createElement('img'); 
        
            if (cube.classList.contains('cuber')) {
                img.src = '../images/image1.svg'; 
            } else if (cube.classList.contains('cubeg')) {
                img.src = '../images/image2.svg'; 
            } else if (cube.classList.contains('cubeb')) {
                img.src = '../images/image3.svg'; 
            }
            img.alt = 'Cube Image';  
            img.style.width = '100%'; 
            img.style.height = '100%';
            img.style.objectFit = 'cover'; 
        
            cube.appendChild(img);

            
        });
    }, 500);
}
