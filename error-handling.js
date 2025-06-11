const cells = document.querySelectorAll(".sudoku td");
const solveButton = document.querySelector(".solve");
const resetButton = document.querySelector(".reset");
const messageElement = document.querySelector(".message");
const keypadElement = document.querySelector(".keypad");

function solveSudokuPuzzle() {
  console.log("solveSudokuPuzzle called (placeholder)");
}

solveButton.addEventListener("click", (e) => {
  e.stopPropagation();
  clearErrors();
  if (validatePuzzle()) {
    solveSudokuPuzzle();
  }
});

resetButton.addEventListener("click", () => {
  clearErrors();
});

function validatePuzzle() {
  let isValid = true;
  let errorMessage = "";
  const grid = createGridFromUI();

  // Clear previous errors
  clearErrors();

  // Check rows
  for (let row = 0; row < 9; row++) {
    const rowErrors = checkDuplicatesInRow(grid, row);
    if (rowErrors.length > 0) {
      highlightErrors(rowErrors);
      errorMessage = "Duplicate numbers in row " + (row + 1);
      isValid = false;
      showMessage(errorMessage, true);
      return false;
    }
  }

  // Check columns
  for (let col = 0; col < 9; col++) {
    const colErrors = checkDuplicatesInColumn(grid, col);
    if (colErrors.length > 0) {
      highlightErrors(colErrors);
      errorMessage = "Duplicate numbers in column " + (col + 1);
      isValid = false;
      showMessage(errorMessage, true);
      return false;
    }
  }

  // Check boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const boxErrors = checkDuplicatesInBox(grid, boxRow, boxCol);
      if (boxErrors.length > 0) {
        highlightErrors(boxErrors);
        errorMessage = "Duplicate numbers in box at position " + (boxRow * 3 + boxCol + 1);
        isValid = false;
        showMessage(errorMessage, true);
        return false;
      }
    }
  }

  return isValid;
}

function createGridFromUI() {
  const grid = Array(9).fill().map(() => Array(9).fill(0));

  cells.forEach((cell, index) => {
    const row = Math.floor(index / 9);
    const col = index % 9;
    if (cell.innerText !== "") {
      grid[row][col] = Number.parseInt(cell.innerText);
    }
  });

  return grid;
}

function checkDuplicatesInRow(grid, row) {
  const seen = {};
  const errors = [];

  for (let col = 0; col < 9; col++) {
    const value = grid[row][col];
    if (value !== 0) {
      if (seen[value]) {
        errors.push({ row, col });
        errors.push({ row, col: seen[value] - 1 });
      } else {
        seen[value] = col + 1;
      }
    }
  }

  return errors;
}

function checkDuplicatesInColumn(grid, col) {
  const seen = {};
  const errors = [];

  for (let row = 0; row < 9; row++) {
    const value = grid[row][col];
    if (value !== 0) {
      if (seen[value]) {
        errors.push({ row, col });
        errors.push({ row: seen[value] - 1, col });
      } else {
        seen[value] = row + 1;
      }
    }
  }

  return errors;
}

function checkDuplicatesInBox(grid, boxRow, boxCol) {
  const seen = {};
  const errors = [];

  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      const r = boxRow * 3 + row;
      const c = boxCol * 3 + col;
      const value = grid[r][c];

      if (value !== 0) {
        if (seen[value]) {
          errors.push({ row: r, col: c });
          const prevPos = seen[value];
          errors.push({ row: prevPos.row, col: prevPos.col });
        } else {
          seen[value] = { row: r, col: c };
        }
      }
    }
  }

  return errors;
}

function highlightErrors(errors) {
  errors.forEach((error) => {
    const cellIndex = error.row * 9 + error.col;
    cells[cellIndex].classList.add("error");
    // Add shake animation
    cells[cellIndex].style.animation = "shake 0.5s cubic-bezier(.36,.07,.19,.97) both";
  });
}

function clearErrors() {
  cells.forEach((cell) => {
    cell.classList.remove("error");
    cell.style.animation = "";
  });
  messageElement.innerText = "";
  messageElement.classList.remove("visible");
}

// Add shake animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        10%, 90% { transform: translate3d(-1px, 0, 0); }
        20%, 80% { transform: translate3d(2px, 0, 0); }
        30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
        40%, 60% { transform: translate3d(4px, 0, 0); }
    }
`;
document.head.appendChild(style);

cells.forEach((cell) => {
  cell.addEventListener("input", function () {
    const value = this.innerText.trim();
    if (value !== "" && (!/^[1-9]$/.test(value) || value.length > 1)) {
      this.innerText = "";
    }
  });
});

const originalToggleKeypad = window.toggleKeypad;
window.toggleKeypad = (cell) => {
  cell.classList.remove("error");
  if (typeof originalToggleKeypad === "function") {
    originalToggleKeypad(cell);
  }
};
