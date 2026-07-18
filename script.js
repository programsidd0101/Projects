const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speedX: 5,
    speedY: 5,
    maxSpeed: 7
};

const playerPaddle = {
    x: 10,
    y: canvas.height / 2 - 50,
    width: 15,
    height: 100,
    speed: 6,
    dy: 0
};

const computerPaddle = {
    x: canvas.width - 25,
    y: canvas.height / 2 - 50,
    width: 15,
    height: 100,
    speed: 5
};

let playerScore = 0;
let computerScore = 0;
let gameRunning = false;

// Input handling
const keys = {};
let mouseY = canvas.height / 2;

window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning = !gameRunning;
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Update game state
function update() {
    if (!gameRunning) return;

    // Player paddle movement - Arrow keys or mouse
    playerPaddle.dy = 0;
    if (keys['ArrowUp']) {
        playerPaddle.dy = -playerPaddle.speed;
    }
    if (keys['ArrowDown']) {
        playerPaddle.dy = playerPaddle.speed;
    }

    // Also allow mouse control
    const paddleCenter = playerPaddle.y + playerPaddle.height / 2;
    if (Math.abs(mouseY - paddleCenter) > 5) {
        if (mouseY < paddleCenter) {
            playerPaddle.dy = -playerPaddle.speed;
        } else {
            playerPaddle.dy = playerPaddle.speed;
        }
    }

    playerPaddle.y += playerPaddle.dy;

    // Computer paddle AI - follows the ball
    const computerCenter = computerPaddle.y + computerPaddle.height / 2;
    const diff = ball.y - computerCenter;
    
    if (Math.abs(diff) > 35) {
        if (diff > 0) {
            computerPaddle.y += computerPaddle.speed;
        } else {
            computerPaddle.y -= computerPaddle.speed;
        }
    }

    // Boundary collision for paddles
    if (playerPaddle.y < 0) {
        playerPaddle.y = 0;
    }
    if (playerPaddle.y + playerPaddle.height > canvas.height) {
        playerPaddle.y = canvas.height - playerPaddle.height;
    }

    if (computerPaddle.y < 0) {
        computerPaddle.y = 0;
    }
    if (computerPaddle.y + computerPaddle.height > canvas.height) {
        computerPaddle.y = canvas.height - computerPaddle.height;
    }

    // Ball movement
    ball.x += ball.speedX;
    ball.y += ball.speedY;

    // Ball collision with top and bottom walls
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.speedY = -ball.speedY;
        ball.y = ball.y - ball.radius < 0 ? ball.radius : canvas.height - ball.radius;
    }

    // Ball collision with paddles
    if (
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        ball.speedX = -ball.speedX;
        ball.x = playerPaddle.x + playerPaddle.width + ball.radius;

        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (playerPaddle.y + playerPaddle.height / 2);
        collidePoint / (playerPaddle.height / 2);
        ball.speedY = collidePoint * 5;

        // Increase speed slightly
        if (Math.abs(ball.speedX) < ball.maxSpeed) {
            ball.speedX *= 1.05;
        }
    }

    if (
        ball.x + ball.radius > computerPaddle.x &&
        ball.y > computerPaddle.y &&
        ball.y < computerPaddle.y + computerPaddle.height
    ) {
        ball.speedX = -ball.speedX;
        ball.x = computerPaddle.x - ball.radius;

        // Add spin based on where ball hits paddle
        const collidePoint = ball.y - (computerPaddle.y + computerPaddle.height / 2);
        collidePoint / (computerPaddle.height / 2);
        ball.speedY = collidePoint * 5;

        // Increase speed slightly
        if (Math.abs(ball.speedX) < ball.maxSpeed) {
            ball.speedX *= 1.05;
        }
    }

    // Ball out of bounds - scoring
    if (ball.x - ball.radius < 0) {
        computerScore++;
        document.getElementById('computerScore').textContent = computerScore;
        resetBall();
    }

    if (ball.x + ball.radius > canvas.width) {
        playerScore++;
        document.getElementById('playerScore').textContent = playerScore;
        resetBall();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speedX = (Math.random() > 0.5 ? 1 : -1) * 5;
    ball.speedY = (Math.random() > 0.5 ? 1 : -1) * 5;
}

// Draw game elements
function draw() {
    // Clear canvas with dark background
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = '#00ff00';
    ctx.setLineDash([10, 10]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw player paddle
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 10;
    ctx.fillRect(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);

    // Draw computer paddle
    ctx.fillStyle = '#ff00ff';
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 10;
    ctx.fillRect(computerPaddle.x, computerPaddle.y, computerPaddle.width, computerPaddle.height);

    // Draw ball
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw status text
    ctx.fillStyle = '#00ff00';
    ctx.font = '14px Arial';
    ctx.fillText(gameRunning ? 'PLAYING' : 'PAUSED (Press Space to Start)', 10, 20);
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start game loop
gameLoop();
