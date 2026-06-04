const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

const paddleWidth = 12;
const paddleHeight = 90;
const ballSize = 8;

const player = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 7
};

const computer = {
    x: canvas.width - 32,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 3
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 4,
    dy: 4,
    size: ballSize
};

let playerScore = 0;
let computerScore = 0;
let difficulty = 'medium';
let isPaused = false;

const difficultyLevels = {
    easy: { speed: 1, zone: 100 },
    medium: { speed: 3, zone: 50 },
    hard: { speed: 5, zone: 30 }
};

const easyBtn = document.getElementById('easyBtn');
const mediumBtn = document.getElementById('mediumBtn');
const hardBtn = document.getElementById('hardBtn');
const pauseBtn = document.getElementById('pauseBtn');
const pauseOverlay = document.getElementById('pauseOverlay');
const difficultyDisplay = document.getElementById('difficultyDisplay');

easyBtn.addEventListener('click', () => setDifficulty('easy'));
mediumBtn.addEventListener('click', () => setDifficulty('medium'));
hardBtn.addEventListener('click', () => setDifficulty('hard'));
pauseBtn.addEventListener('click', togglePause);

function setDifficulty(level) {
    difficulty = level;
    computer.speed = difficultyLevels[level].speed;
    easyBtn.classList.remove('active');
    mediumBtn.classList.remove('active');
    hardBtn.classList.remove('active');
    if (level === 'easy') easyBtn.classList.add('active');
    if (level === 'medium') mediumBtn.classList.add('active');
    if (level === 'hard') hardBtn.classList.add('active');
    difficultyDisplay.textContent = level.toUpperCase();
}

function togglePause() {
    isPaused = !isPaused;
    pauseOverlay.classList.toggle('active');
    pauseBtn.classList.toggle('paused');
    pauseBtn.textContent = isPaused ? 'RESUME' : 'PAUSE';
}

const keys = {};
let mouseY = canvas.height / 2;

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        togglePause();
    }
    if (e.key === 'ArrowUp') keys['ArrowUp'] = true;
    if (e.key === 'ArrowDown') keys['ArrowDown'] = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keys['ArrowUp'] = false;
    if (e.key === 'ArrowDown') keys['ArrowDown'] = false;
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

function updatePlayer() {
    if (mouseY - paddleHeight / 2 > 0 && mouseY + paddleHeight / 2 < canvas.height) {
        player.y = mouseY - paddleHeight / 2;
    }
    if (keys['ArrowUp'] && player.y > 0) player.y -= player.speed;
    if (keys['ArrowDown'] && player.y < canvas.height - player.height) player.y += player.speed;
}

function updateComputer() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const zone = difficultyLevels[difficulty].zone;

    if (computerCenter < ballCenter - zone) {
        if (computer.y < canvas.height - computer.height) computer.y += computer.speed;
    } else if (computerCenter > ballCenter + zone) {
        if (computer.y > 0) computer.y -= computer.speed;
    }
}

function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y - ball.size <= 0 || ball.y + ball.size >= canvas.height) {
        ball.dy = -ball.dy;
    }

    if (
        ball.x - ball.size <= player.x + player.width &&
        ball.y >= player.y &&
        ball.y <= player.y + player.height
    ) {
        ball.dx = -ball.dx;
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy = hitPos * 4;
    }

    if (
        ball.x + ball.size >= computer.x &&
        ball.y >= computer.y &&
        ball.y <= computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy = hitPos * 4;
    }

    if (ball.x < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    }
    if (ball.x > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
    ball.dy = (Math.random() - 0.5) * 4;
}

function drawPaddle(paddle, isPlayer) {
    ctx.fillStyle = isPlayer ? '#00ff88' : '#ff6600';
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.strokeStyle = isPlayer ? '#00ff88' : '#ff6600';
    ctx.lineWidth = 2;
    ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
    ctx.fillStyle = '#ff00ff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawCenter() {
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.3)';
    ctx.setLineDash([10, 15]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

function gameLoop() {
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!isPaused) {
        updatePlayer();
        updateComputer();
        updateBall();
    }

    drawCenter();
    drawPaddle(player, true);
    drawPaddle(computer, false);
    drawBall();

    requestAnimationFrame(gameLoop);
}

setDifficulty('medium');
gameLoop();