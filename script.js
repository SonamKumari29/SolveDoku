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

function toggleKeypad(cell) {
    if (currentCell == null) {
        currentCell = cell;
        cell.style.backgroundColor = "red";
        keypad.style.visibility = "visible";
    } else {
        keypad.style.visibility = "hidden";
        currentCell.style.backgroundColor = "";
        currentCell = null;
    }
}

function initializeEventListeners() {
    cell.forEach((cellElement) => {
        cellElement.addEventListener('click', () => toggleKeypad(cellElement));
    });

    solve.addEventListener('click', solveSudokuPuzzle);

    reset.addEventListener('click', () => {
        message.innerText = '';
        cell.forEach(cellElement => cellElement.innerHTML = '');
    });
}

function setupKeypad() {
    key.forEach((keyElement, index) => {
        keyElement.addEventListener('click', () => {
            if (index == 9) {
                if (currentCell) {
                    currentCell.innerHTML = "";
                }
            } else {
                if (currentCell) {
                    currentCell.innerHTML = `<b>${index + 1}</b>`;
                }
            }
            if (currentCell) {
                currentCell.style.backgroundColor = "";
                currentCell = null;
            }
            keypad.style.visibility = "hidden";
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
