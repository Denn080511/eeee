const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Screen elements
const startScreen = document.getElementById('startScreen');
const settingsScreen = document.getElementById('settingsScreen');
const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');
const pauseOverlay = document.getElementById('pauseOverlay');

// Buttons
const continueBtn = document.getElementById('continueBtn');
const settingsBtn = document.getElementById('settingsBtn');
const backBtn = document.getElementById('backBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const menuBtn = document.getElementById('menuBtn');

// Settings buttons
const settingsEasyBtn = document.getElementById('settingsEasyBtn');
const settingsMediumBtn = document.getElementById('settingsMediumBtn');
const settingsHardBtn = document.getElementById('settingsHardBtn');
const difficultyInfo = document.getElementById('difficultyInfo');

// Game variables
const paddleWidth = 12;
const paddleHeight = 90;
const ballSize = 8;

const player = {
    x: 20,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    speed: 7,
    velocityY: 0
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
let gameActive = false;
let cursorLocked = true;
let gameLoopRunning = false;

const difficultyLevels = {
    easy: { speed: 1.5, zone: 120 },
    medium: { speed: 3, zone: 50 },
    hard: { speed: 4, zone: 35 }
};

const keys = {};
let mouseY = canvas.height / 2;

// Event Listeners
continueBtn.addEventListener('click', startGame);
settingsBtn.addEventListener('click', () => showScreen(settingsScreen));
backBtn.addEventListener('click', () => showScreen(startScreen));
playAgainBtn.addEventListener('click', resetGame);
menuBtn.addEventListener('click', () => {
    playerScore = 0;
    computerScore = 0;
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    gameActive = false;
    showScreen(startScreen);
});

settingsEasyBtn.addEventListener('click', () => setSetting('easy'));
settingsMediumBtn.addEventListener('click', () => setSetting('medium'));
settingsHardBtn.addEventListener('click', () => setSetting('hard'));

document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        if (gameActive) togglePause();
    }
    if (e.key === 'Shift') {
        e.preventDefault();
        cursorLocked = !cursorLocked;
        updateCursorIndicator();
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
    let rawMouseY = e.clientY - rect.top;
    
    if (cursorLocked) {
        rawMouseY = Math.max(0, Math.min(rawMouseY, canvas.height));
    }
    
    mouseY = rawMouseY;
});

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');
}

function setSetting(level) {
    difficulty = level;
    computer.speed = difficultyLevels[level].speed;
    settingsEasyBtn.classList.remove('active');
    settingsMediumBtn.classList.remove('active');
    settingsHardBtn.classList.remove('active');
    
    if (level === 'easy') {
        settingsEasyBtn.classList.add('active');
        difficultyInfo.textContent = 'AI Speed: Slow';
    } else if (level === 'medium') {
        settingsMediumBtn.classList.add('active');
        difficultyInfo.textContent = 'AI Speed: Medium';
    } else if (level === 'hard') {
        settingsHardBtn.classList.add('active');
        difficultyInfo.textContent = 'AI Speed: Fast';
    }
}

function updateCursorIndicator() {
    const indicator = document.getElementById('cursorIndicator');
    if (indicator) {
        if (cursorLocked) {
            indicator.textContent = '🔒 Cursor Locked (Press SHIFT to unlock)';
            indicator.style.color = '#00ff88';
        } else {
            indicator.textContent = '🔓 Cursor Unlocked (Press SHIFT to lock)';
            indicator.style.color = '#ff6600';
        }
    }
}

function startGame() {
    playerScore = 0;
    computerScore = 0;
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    resetBall();
    // Reset paddles to center
    player.y = canvas.height / 2 - paddleHeight / 2;
    computer.y = canvas.height / 2 - paddleHeight / 2;
    showScreen(gameScreen);
    gameActive = true;
    cursorLocked = true;
    updateCursorIndicator();
    document.getElementById('difficultyDisplay').textContent = difficulty.toUpperCase();
    if (!gameLoopRunning) {
        gameLoopRunning = true;
        gameLoop();
    }
}

function resetGame() {
    playerScore = 0;
    computerScore = 0;
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    resetBall();
    // Reset paddles to center
    player.y = canvas.height / 2 - paddleHeight / 2;
    computer.y = canvas.height / 2 - paddleHeight / 2;
    showScreen(gameScreen);
    gameActive = true;
    cursorLocked = true;
    updateCursorIndicator();
    if (!gameLoopRunning) {
        gameLoopRunning = true;
        gameLoop();
    }
}

function togglePause() {
    isPaused = !isPaused;
    pauseOverlay.classList.toggle('active');
}

function updatePlayer() {
    // Mouse control (locked to canvas)
    if (cursorLocked) {
        let targetY = mouseY - paddleHeight / 2;
        targetY = Math.max(0, Math.min(targetY, canvas.height - paddleHeight));
        player.y = targetY;
    }
    
    // Keyboard control with smooth movement
    if (keys['ArrowUp']) {
        player.velocityY = -player.speed;
    } else if (keys['ArrowDown']) {
        player.velocityY = player.speed;
    } else {
        player.velocityY = 0;
    }
    
    player.y += player.velocityY;
    
    // Keep player in bounds
    if (player.y < 0) player.y = 0;
    if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
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

    // Ball collision with top/bottom
    if (ball.y - ball.size <= 0 || ball.y + ball.size >= canvas.height) {
        ball.dy = -ball.dy;
    }

    // Ball collision with player paddle
    if (
        ball.x - ball.size <= player.x + player.width &&
        ball.y >= player.y &&
        ball.y <= player.y + player.height
    ) {
        ball.dx = -ball.dx;
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy = hitPos * 4;
    }

    // Ball collision with computer paddle
    if (
        ball.x + ball.size >= computer.x &&
        ball.y >= computer.y &&
        ball.y <= computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy = hitPos * 4;
    }

    // Scoring
    if (ball.x < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        checkWinCondition();
        if (gameActive) resetBall();
    }
    if (ball.x > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        checkWinCondition();
        if (gameActive) resetBall();
    }
}

function checkWinCondition() {
    const minPoints = 11;
    const pointDifference = Math.abs(playerScore - computerScore);
    
    if (playerScore >= minPoints && pointDifference >= 2) {
        endGame(true);
    } else if (computerScore >= minPoints && pointDifference >= 2) {
        endGame(false);
    }
}

function endGame(playerWon) {
    gameActive = false;
    const resultText = document.getElementById('resultText');
    const resultScore = document.getElementById('resultScore');
    
    if (playerWon) {
        resultText.textContent = 'YOU WIN!';
        resultText.style.color = '#00ff88';
    } else {
        resultText.textContent = 'YOU LOSE!';
        resultText.style.color = '#ff6600';
    }
    
    resultScore.textContent = `Player: ${playerScore} - Computer: ${computerScore}`;
    resultScore.style.color = '#fff';
    
    showScreen(resultScreen);
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

    if (!isPaused && gameActive) {
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

// Initialize
setSetting('medium');