function showNoSolutionMessage() {
    message.innerText = 'No Solution Found!!';
    message.style.color = "red";
}

function fillGridWithSolution(solution) {
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (cell[i * 9 + j].innerText == '') {
                cell[i * 9 + j].innerText = solution[i][j];
            }
        }
    }
    message.innerHTML = "Solution Found!";
    message.style.color = "green";
}

function solveSudokuPuzzle() {
    function backtrack() {
        if (pendingCells.length == 0) {
            fillGridWithSolution(grid);
            return true;
        }
        let [row, col] = pendingCells.pop();
        for (let num = 0; num < 9; num++) {
            if (rowConstraints[row][num] == 0 && colConstraints[col][num] == 0 
                && boxConstraints[Math.floor(row / 3)][Math.floor(col / 3)][num] == 0) {
                rowConstraints[row][num] = 1;
                colConstraints[col][num] = 1;
                boxConstraints[Math.floor(row / 3)][Math.floor(col / 3)][num] = 1;
                grid[row][col] = num + 1;
                if (backtrack() == true) {
                    return true;
                }
                rowConstraints[row][num] = 0;
                colConstraints[col][num] = 0;
                boxConstraints[Math.floor(row / 3)][Math.floor(col / 3)][num] = 0;
                grid[row][col] = 0;
            }
        }
        pendingCells.push([row, col]);
        return false;
    }

    let grid = [];
    let pendingCells = [];
    let rowConstraints = [];
    let colConstraints = [];
    let boxConstraints = [[], [], []];
    for (let i = 0; i < 9; i++) {
        grid.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
        rowConstraints.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
        colConstraints.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
        const boxIndex = Math.floor(i / 3);
        boxConstraints[boxIndex].push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
    }

    let maxConstraintCount = 0;
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            if (cell[i * 9 + j].innerText == '') {
                pendingCells.push([i, j]);
            } else {
                const value = Number(cell[i * 9 + j].innerText);
                grid[i][j] = value;
                rowConstraints[i][value - 1] += 1;
                colConstraints[j][value - 1] += 1;
                boxConstraints[Math.floor(i / 3)][Math.floor(j / 3)][value - 1] += 1;
                maxConstraintCount = Math.max(maxConstraintCount, rowConstraints[i][value - 1], colConstraints[j][value - 1],
                    boxConstraints[Math.floor(i / 3)][Math.floor(j / 3)][value - 1]);
            }
        }
    }
    if (maxConstraintCount > 1) {
        showNoSolutionMessage();
        console.log("No");
        return;
    }
    if (backtrack() == false) {
        showNoSolutionMessage();
        console.log('No');
    }
}

function showMessage(text, type = false) {
    message.innerText = text;
    message.classList.add('visible');
    message.classList.remove('warning', 'error');
    if (type === 'warning') {
        message.classList.add('warning');
    } else if (type === true || type === 'error') {
        message.classList.add('error');
    }
    setTimeout(() => {
        message.classList.remove('visible', 'warning', 'error');
    }, 3000);
}

function toggleKeypad(cell) {
    if (currentCell === cell) {
        keypad.style.visibility = "hidden";
        keypad.classList.remove('visible');
        currentCell.style.backgroundColor = "";
        currentCell = null;
    } else {
        if (currentCell) {
            currentCell.style.backgroundColor = "";
        }
        currentCell = cell;
        document.querySelectorAll('.sudoku td').forEach(td => {
            td.classList.remove('selected', 'related');
        });
        cell.classList.add('selected');
        keypad.style.visibility = "visible";
        keypad.classList.add('visible');
    }
}

function initializeEventListeners() {
    cell.forEach((cellElement) => {
        cellElement.addEventListener('click', () => {
            toggleKeypad(cellElement);
        });
    });

    solve.addEventListener('click', () => {
        if (validatePuzzle()) {
            solveSudokuPuzzle();
        }
    });

    reset.addEventListener('click', () => {
        message.innerText = '';
        message.classList.remove('visible');
        cell.forEach(cellElement => {
            cellElement.innerHTML = '';
            cellElement.classList.remove('selected', 'related', 'error');
        });
    });
}

function setupKeypad() {
    key.forEach((keyElement, index) => {
        keyElement.addEventListener('click', () => {
            if (currentCell) {
                if (index === 9) {
                    currentCell.innerHTML = "";
                } else {
                    currentCell.innerHTML = `<b>${index + 1}</b>`;
                }
                currentCell.classList.remove('error');
                validatePuzzle();
            }
            if (currentCell) {
                currentCell.style.backgroundColor = "";
                currentCell = null;
            }
            keypad.style.visibility = "hidden";
            keypad.classList.remove('visible');
        });
    });
}

// All elements
const cell = document.querySelectorAll(".sudoku td");
const keypad = document.querySelector(".keypad");
const key = document.querySelectorAll(".keypad td");
const solve = document.querySelector(".solve");
const message = document.querySelector(".message");
const reset = document.querySelector(".reset");

let currentCell = null;

initializeEventListeners();
setupKeypad();

// Theme switcher logic
const themeToggle = document.getElementById('theme-toggle');
function setTheme(dark) {
    if (dark) {
        document.body.classList.add('dark');
        themeToggle.textContent = '☀️';
    } else {
        document.body.classList.remove('dark');
        themeToggle.textContent = '🌙';
    }
}
// Load theme preference
const userTheme = localStorage.getItem('theme');
setTheme(userTheme === 'dark');
themeToggle.addEventListener('click', () => {
    const isDark = !document.body.classList.contains('dark');
    setTheme(isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// --- HINT SYSTEM, PUZZLE GENERATOR, ERROR DETECTION ---

// Utility: Deep copy a 2D array
function deepCopyGrid(grid) {
    return grid.map(row => row.slice());
}

// Sudoku Generator (simple backtracking with randomization)
function generateFullGrid() {
    let grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    function isSafe(row, col, num) {
        for (let x = 0; x < 9; x++) {
            if (grid[row][x] === num || grid[x][col] === num) return false;
        }
        let startRow = row - row % 3, startCol = col - col % 3;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
            if (grid[startRow + i][startCol + j] === num) return false;
        }
        return true;
    }
    function fill() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    let nums = [1,2,3,4,5,6,7,8,9].sort(() => Math.random() - 0.5);
                    for (let num of nums) {
                        if (isSafe(row, col, num)) {
                            grid[row][col] = num;
                            if (fill()) return true;
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    fill();
    return grid;
}

// Remove cells for difficulty
function generatePuzzle(difficulty) {
    let full = generateFullGrid();
    let puzzle = deepCopyGrid(full);
    let attempts = { easy: 35, medium: 45, hard: 55 }[difficulty] || 35;
    while (attempts > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        if (puzzle[row][col] !== 0) {
            let backup = puzzle[row][col];
            puzzle[row][col] = 0;
            attempts--;
        }
    }
    return { puzzle, solution: full };
}

// Fill grid in UI
function setGridUI(grid) {
    cell.forEach((c, idx) => {
        let row = Math.floor(idx / 9);
        let col = idx % 9;
        c.innerHTML = grid[row][col] ? `<b>${grid[row][col]}</b>` : '';
    });
}

// --- HINT SYSTEM ---
let currentSolution = null;
let hintCount = 0;
const MAX_HINTS = 5;
function updateHintCounter() {
    const icons = document.querySelectorAll('.hint-counter .hint-icon');
    for (let i = 0; i < icons.length; i++) {
        if (i < MAX_HINTS - hintCount) {
            icons[i].classList.remove('used');
        } else {
            icons[i].classList.add('used');
        }
    }
}

function giveHint() {
    if (!currentSolution) {
        showMessage('No solution available for hint!', 'warning');
        return;
    }
    if (hintCount >= MAX_HINTS) {
        showMessage('No more hints available!', 'warning');
        hintBtn.disabled = true;
        return;
    }
    // Find all empty cells
    let emptyCells = [];
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let idx = i * 9 + j;
            if (cell[idx].innerText === '') {
                emptyCells.push({ row: i, col: j, idx });
            }
        }
    }
    if (emptyCells.length === 0) {
        showMessage('No empty cells for hint!', 'warning');
        return;
    }
    // Pick a random empty cell
    const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    cell[randomCell.idx].innerHTML = `<b>${currentSolution[randomCell.row][randomCell.col]}</b>`;
    hintCount++;
    if (hintCount >= MAX_HINTS) hintBtn.disabled = true;
    showMessage(`Hint used! (${hintCount}/${MAX_HINTS})`);
    updateHintCounter();
    validatePuzzle();
}

// --- EVENT LISTENERS FOR NEW BUTTONS ---
const newPuzzleBtn = document.querySelector('.new-puzzle');
const hintBtn = document.querySelector('.hint');
const difficultySelect = document.getElementById('difficulty');
const solveBtn = document.querySelector('.solve');

newPuzzleBtn.addEventListener('click', () => {
    resetTimer();
    startTimer();
    const diff = difficultySelect.value;
    const { puzzle, solution } = generatePuzzle(diff);
    setGridUI(puzzle);
    currentSolution = solution;
    hintCount = 0;
    hintBtn.disabled = false;
    updateHintCounter();
    showMessage(`New ${diff} puzzle!`);
    validatePuzzle();
});

difficultySelect.addEventListener('change', () => {
    // Only affects new puzzle, not current one
    showMessage(`Difficulty set to ${difficultySelect.value}. Click 'New Puzzle' to generate.`, 'warning');
});

hintBtn.addEventListener('click', () => {
    giveHint();
});

solveBtn.addEventListener('click', () => {
    if (currentSolution) {
        setGridUI(currentSolution);
        stopTimer();
        const min = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
        const sec = String(timerSeconds % 60).padStart(2, '0');
        showMessage(`You completed the puzzle in ${min}:${sec}!`);
        validatePuzzle();
    } else {
        showMessage('No solution available!', 'error');
    }
});

// On page load, generate an easy puzzle
window.addEventListener('DOMContentLoaded', () => {
    resetTimer();
    startTimer();
    const { puzzle, solution } = generatePuzzle('easy');
    setGridUI(puzzle);
    currentSolution = solution;
    hintCount = 0;
    hintBtn.disabled = false;
    updateHintCounter();
    validatePuzzle();
});

// --- TIMER SYSTEM ---
let timerInterval = null;
let timerSeconds = 0;
const timerDisplay = document.querySelector('.timer');

function updateTimerDisplay() {
    const min = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
    const sec = String(timerSeconds % 60).padStart(2, '0');
    timerDisplay.textContent = `${min}:${sec}`;
}

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timerSeconds++;
        updateTimerDisplay();
    }, 1000);
}

function stopTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
}

function resetTimer() {
    stopTimer();
    timerSeconds = 0;
    updateTimerDisplay();
}

// --- HOW TO PLAY MODAL LOGIC ---
const howToPlayBtn = document.getElementById('how-to-play');
const howToPlayModal = document.getElementById('how-to-play-modal');
const closeModalBtn = document.querySelector('.close-modal');

howToPlayBtn.addEventListener('click', () => {
    howToPlayModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    closeModalBtn.focus();
});
closeModalBtn.addEventListener('click', () => {
    howToPlayModal.classList.remove('open');
    document.body.style.overflow = '';
    howToPlayBtn.focus();
});
howToPlayModal.addEventListener('click', (e) => {
    if (e.target === howToPlayModal) {
        howToPlayModal.classList.remove('open');
        document.body.style.overflow = '';
        howToPlayBtn.focus();
    }
});
document.addEventListener('keydown', (e) => {
    if (howToPlayModal.classList.contains('open') && (e.key === 'Escape' || e.key === 'Esc')) {
        howToPlayModal.classList.remove('open');
        document.body.style.overflow = '';
        howToPlayBtn.focus();
    }
});
