// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameRunning = true;
let gamePaused = false;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let level = 1;

// Snake
let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };

// Food
let food = generateFood();

// Game settings
const gridSize = 20;
const gameSpeed = 100;
let lastRenderTime = 0;

// Gesture detection
let currentGesture = 'up';
let gestureConfidence = 0;

// Initialize
document.getElementById('highScore').textContent = highScore;
document.addEventListener('keydown', handleKeyPress);

// Game loop
function update(currentTime) {
    if (!gameRunning) return;

    const secondsSinceLastRender = (currentTime - lastRenderTime) / 1000;
    if (secondsSinceLastRender < 1 / gameSpeed) {
        requestAnimationFrame(update);
        return;
    }

    lastRenderTime = currentTime;

    if (!gamePaused) {
        // Apply gesture direction
        direction = nextDirection;

        // Move snake
        const head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

        // Check wall collision
        if (head.x < 0 || head.x >= canvas.width / gridSize ||
            head.y < 0 || head.y >= canvas.height / gridSize) {
            gameOver();
            return;
        }

        // Check self collision
        if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            gameOver();
            return;
        }

        snake.unshift(head);

        // Check food collision
        if (head.x === food.x && head.y === food.y) {
            score += 10;
            document.getElementById('score').textContent = score;
            
            // Increase level every 50 points
            if (score % 50 === 0) {
                level++;
                document.getElementById('level').textContent = level;
            }

            food = generateFood();
        } else {
            snake.pop();
        }
    }

    draw();
    requestAnimationFrame(update);
}

function draw() {
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= canvas.width; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head
            ctx.fillStyle = '#00ff00';
            ctx.shadowColor = '#00ff00';
            ctx.shadowBlur = 10;
        } else {
            // Body
            ctx.fillStyle = '#00cc00';
            ctx.shadowColor = 'none';
            ctx.shadowBlur = 0;
        }
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
    });

    // Draw food
    ctx.fillStyle = '#ff0000';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(
        food.x * gridSize + gridSize / 2,
        food.y * gridSize + gridSize / 2,
        gridSize / 2 - 1,
        0,
        Math.PI * 2
    );
    ctx.fill();
    ctx.shadowBlur = 0;
}

function generateFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * (canvas.width / gridSize)),
            y: Math.floor(Math.random() * (canvas.height / gridSize))
        };
    } while (snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
}

function handleKeyPress(e) {
    if (e.key === 'Escape') {
        gamePaused = !gamePaused;
    } else if (e.key === 'ArrowUp' || e.key === 'w') {
        if (direction.y === 0) nextDirection = { x: 0, y: -1 };
    } else if (e.key === 'ArrowDown' || e.key === 's') {
        if (direction.y === 0) nextDirection = { x: 0, y: 1 };
    } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (direction.x === 0) nextDirection = { x: -1, y: 0 };
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        if (direction.x === 0) nextDirection = { x: 1, y: 0 };
    }
}

function setGestureDirection(gesture) {
    if (direction.x === 1 && gesture === 'left') return; // Can't go left if going right
    if (direction.x === -1 && gesture === 'right') return; // Can't go right if going left
    if (direction.y === 1 && gesture === 'up') return; // Can't go up if going down
    if (direction.y === -1 && gesture === 'down') return; // Can't go down if going up

    switch (gesture) {
        case 'up':
            if (direction.y === 0) nextDirection = { x: 0, y: -1 };
            break;
        case 'down':
            if (direction.y === 0) nextDirection = { x: 0, y: 1 };
            break;
        case 'left':
            if (direction.x === 0) nextDirection = { x: -1, y: 0 };
            break;
        case 'right':
            if (direction.x === 0) nextDirection = { x: 1, y: 0 };
            break;
    }

    currentGesture = gesture;
    updateGestureDisplay(gesture);
}

function updateGestureDisplay(gesture) {
    const arrowMap = {
        'up': '⬆',
        'down': '⬇',
        'left': '⬅',
        'right': '➡'
    };
    document.getElementById('gestureArrow').textContent = arrowMap[gesture] || '⬆';
}

function gameOver() {
    gameRunning = false;
    const gameOverlay = document.getElementById('gameOverlay');
    const gameMessage = document.getElementById('gameMessage');
    
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        document.getElementById('highScore').textContent = highScore;
        gameMessage.textContent = `🎉 New High Score: ${score}!`;
    } else {
        gameMessage.textContent = `Game Over! Score: ${score}`;
    }

    gameOverlay.classList.add('show');
}

function restartGame() {
    // Reset variables
    snake = [{ x: 10, y: 10 }];
    direction = { x: 1, y: 0 };
    nextDirection = { x: 1, y: 0 };
    score = 0;
    level = 1;
    food = generateFood();
    gameRunning = true;
    gamePaused = false;

    // Update UI
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('gameOverlay').classList.remove('show');

    // Start game loop
    requestAnimationFrame(update);
}

// Start the game
requestAnimationFrame(update);

// Gesture control handler (for future integration with gesture detection)
function initGestureControl() {
    // This will be called when gesture detection is ready
    console.log('Gesture control initialized');
}

// Example: Call this function with detected gesture
function onGestureDetected(gesture) {
    setGestureDirection(gesture);
}