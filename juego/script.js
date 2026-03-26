const SIZE = 4;
let board = Array(SIZE).fill().map(() => Array(SIZE).fill('blue'));
let currentTurn = 'black'; // 'black' = humano, 'white' = computadora
let gameOver = false;
let computerTimeout = null;

const tableroDiv = document.getElementById('tablero');
const turnoInfo = document.getElementById('turnoInfo');
const resetBtn = document.getElementById('resetBtn');

// Pinta el área 3x3 (celda + 8 vecinos) con el color dado, solo en celdas azules
function paintArea(row, col, color) {
    let changed = false;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE) {
                if (board[nr][nc] === 'blue') {
                    board[nr][nc] = color;
                    changed = true;
                }
            }
        }
    }
    return changed;
}

// Verifica si ya no hay celdas azules
function isBoardFull() {
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (board[i][j] === 'blue') return false;
        }
    }
    return true;
}

// Actualiza la interfaz visual
function renderBoard() {
    const celdas = document.querySelectorAll('.celda');
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const idx = i * SIZE + j;
            const celdaDiv = celdas[idx];
            const estado = board[i][j];
            celdaDiv.classList.remove('blue', 'black', 'white');
            celdaDiv.classList.add(estado);
        }
    }
}

// Finaliza el juego mostrando el ganador
function endGame(winner) {
    gameOver = true;
    if (winner === 'black') {
        turnoInfo.innerHTML = '🎉 ¡HAS GANADO! 🎉';
    } else if (winner === 'white') {
        turnoInfo.innerHTML = '🤖 GANA LA COMPUTADORA 🤖';
    }
    if (computerTimeout) clearTimeout(computerTimeout);
}

// Realiza un movimiento para un jugador en la celda (row, col)
function makeMove(row, col, playerColor) {
    if (gameOver) return false;
    if (board[row][col] !== 'blue') return false;

    const painted = paintArea(row, col, playerColor);
    if (!painted) return false;

    renderBoard();

    if (isBoardFull()) {
        endGame(playerColor);
        return true;
    }
    return true;
}

// Movimiento de la computadora (elige una celda azul al azar)
function computerMove() {
    if (gameOver) return;
    if (currentTurn !== 'white') return;

    // Recopilar celdas azules disponibles
    let blueCells = [];
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            if (board[i][j] === 'blue') {
                blueCells.push([i, j]);
            }
        }
    }

    if (blueCells.length === 0) {
        if (isBoardFull() && !gameOver) {
            // El último movimiento fue del humano, así que gana humano
            endGame('black');
        }
        return;
    }

    // Elegir una aleatoria
    const randomIndex = Math.floor(Math.random() * blueCells.length);
    const [row, col] = blueCells[randomIndex];

    const success = makeMove(row, col, 'white');
    if (success) {
        if (!gameOver && !isBoardFull()) {
            currentTurn = 'black';
            turnoInfo.innerHTML = '🎨 Tu turno (Negro)';
        } else if (isBoardFull() && !gameOver) {
            // La computadora acaba de llenar el tablero
            if (!gameOver) endGame('white');
        }
    } else {
        // Por si algo falla, reintentar tras breve pausa
        if (!gameOver && currentTurn === 'white') {
            if (computerTimeout) clearTimeout(computerTimeout);
            computerTimeout = setTimeout(() => computerMove(), 100);
        }
    }
}

// Movimiento del jugador humano
function humanMove(row, col) {
    if (gameOver) return;
    if (currentTurn !== 'black') return;
    if (board[row][col] !== 'blue') return;

    const success = makeMove(row, col, 'black');
    if (success) {
        renderBoard();
        if (isBoardFull()) {
            if (!gameOver) endGame('black');
            return;
        }
        // Cambiar turno a la computadora
        currentTurn = 'white';
        turnoInfo.innerHTML = '💻 Pensando... (Blanco)';
        if (computerTimeout) clearTimeout(computerTimeout);
        computerTimeout = setTimeout(() => {
            computerMove();
            // Después de mover la computadora, actualizar texto si no terminó
            if (!gameOver && currentTurn === 'black') {
                turnoInfo.innerHTML = '🎨 Tu turno (Negro)';
            }
            renderBoard();
        }, 250);
    }
}

// Construir el tablero visual y asignar eventos
function buildBoard() {
    tableroDiv.innerHTML = '';
    for (let i = 0; i < SIZE; i++) {
        for (let j = 0; j < SIZE; j++) {
            const celda = document.createElement('div');
            celda.classList.add('celda', 'blue');
            celda.addEventListener('click', (function(fila, columna) {
                return function() { humanMove(fila, columna); };
            })(i, j));
            tableroDiv.appendChild(celda);
        }
    }
    renderBoard();
}

// Reiniciar completamente el juego
function resetGame() {
    if (computerTimeout) {
        clearTimeout(computerTimeout);
        computerTimeout = null;
    }
    board = Array(SIZE).fill().map(() => Array(SIZE).fill('blue'));
    currentTurn = 'black';
    gameOver = false;
    turnoInfo.innerHTML = '🎨 Tu turno (Negro)';
    renderBoard();
}

resetBtn.addEventListener('click', resetGame);

// Inicializar
buildBoard();