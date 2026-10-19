
const road = document.getElementById("road");
const player = document.getElementById("player");
const enemiesBox = document.getElementById("enemies");

const scoreText = document.getElementById("score");
const bestText = document.getElementById("best");

const overlay = document.getElementById("overlay");
const title = document.getElementById("title");
const info = document.getElementById("info");
const startButton = document.getElementById("start");

let playerX = 0;
let score = 0;
let best = 0;
let running = false;
let keys = {};
let enemies = [];
let lastSpawn = 0;
let previousTime = 0;
let animationId = 0;

try {
    best = Number(localStorage.getItem("carRaceBest")) || 0;
} catch (error) {}

bestText.textContent = best;

function setPlayerPosition() {
    const maxX = road.clientWidth - player.offsetWidth;

    playerX = Math.max(0, Math.min(maxX, playerX));
    player.style.left = playerX + "px";
    player.style.transform = "none";
}

function startGame() {
    cancelAnimationFrame(animationId);

    enemies = [];
    enemiesBox.innerHTML = "";

    score = 0;
    lastSpawn = 0;
    previousTime = 0;

    scoreText.textContent = "0";

    playerX = road.clientWidth / 2 - player.offsetWidth / 2;
    setPlayerPosition();

    running = true;

    overlay.classList.add("hidden");
    road.classList.add("running");

    animationId = requestAnimationFrame(gameLoop);
}

function createEnemy() {
    const car = document.createElement("div");
    car.className = "car enemy";

    const roadWidth = road.clientWidth;
    const laneWidth = roadWidth / 3;

    const lane = Math.floor(Math.random() * 3);

    const x = lane * laneWidth +
        (laneWidth - 42) / 2;

    car.style.left = x + "px";

    enemiesBox.appendChild(car);

    enemies.push({
        element: car,
        x: x,
        y: -85
    });
}

function isCollision(a, b) {
    return (
        a.x + 7 < b.x + b.w - 7 &&
        a.x + a.w - 7 > b.x + 7 &&
        a.y + 8 < b.y + b.h - 8 &&
        a.y + a.h - 8 > b.y + 8
    );
}

function gameOver() {
    running = false;

    road.classList.remove("running");

    overlay.classList.remove("hidden");

    title.textContent = "O‘YIN TUGADI!";
    info.textContent = "Siz " + score + " ball to‘pladingiz!";
    startButton.textContent = "QAYTA O‘YNASH";

    if (score > best) {
        best = score;
        bestText.textContent = best;

        try {
            localStorage.setItem("carRaceBest", best);
        } catch (error) {}
    }
}

function gameLoop(time) {
    if (!running) return;

    const delta = previousTime
        ? Math.min((time - previousTime) / 16.67, 2)
        : 1;

    previousTime = time;

    const moveSpeed = 5 * delta;

    if (keys.ArrowLeft || keys.a || keys.A) {
        playerX -= moveSpeed;
    }

    if (keys.ArrowRight || keys.d || keys.D) {
        playerX += moveSpeed;
    }

    setPlayerPosition();

    const enemySpeed = (4 + score / 150) * delta;

    if (time - lastSpawn > Math.max(400, 1000 - score)) {
        createEnemy();
        lastSpawn = time;
    }

    const playerBox = {
        x: playerX,
        y: player.offsetTop,
        w: player.offsetWidth,
        h: player.offsetHeight
    };

    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];

        enemy.y += enemySpeed;
        enemy.element.style.top = enemy.y + "px";

        const enemyBox = {
            x: enemy.x,
            y: enemy.y,
            w: enemy.element.offsetWidth,
            h: enemy.element.offsetHeight
        };

        if (isCollision(playerBox, enemyBox)) {
            gameOver();
            return;
        }

        if (enemy.y > road.clientHeight) {
            enemy.element.remove();
            enemies.splice(i, 1);

            score += 10;
            scoreText.textContent = score;
        }
    }

    animationId = requestAnimationFrame(gameLoop);
}

document.addEventListener("keydown", event => {
    if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
    ) {
        event.preventDefault();
    }

    keys[event.key] = true;

    if (!running && event.key === "Enter") {
        startGame();
    }
});

document.addEventListener("keyup", event => {
    keys[event.key] = false;
});

function holdButton(id, key) {
    const button = document.getElementById(id);

    button.addEventListener("pointerdown", event => {
        event.preventDefault();
        keys[key] = true;
        button.setPointerCapture(event.pointerId);
    });

    function release() {
        keys[key] = false;
    }

    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
    button.addEventListener("lostpointercapture", release);
}

holdButton("left", "ArrowLeft");
holdButton("right", "ArrowRight");

startButton.addEventListener("click", startGame);

document.getElementById("restart").addEventListener(
    "click",
    startGame
);

window.addEventListener("resize", setPlayerPosition);

playerX = road.clientWidth / 2 - player.offsetWidth / 2;
setPlayerPosition();
