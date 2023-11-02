import Cell from "./cell.mjs";
import updateCells from "./update_cells.mjs";
import getConstructs from "./constructs.mjs";

// Grid/game variables.
const cellSize = 20;
const frameRate = 10;
var grid = [];
const gridRows = 30;
const gridColumns = 50;
const gameGrid = document.querySelector("#game-grid");
const sidecar = document.querySelector("#sidecar");
const tipsArea = document.querySelector("#tips");
const templatesArea = document.querySelector("#templates");
var isPaused = true;
var firstCheck = true;
var cellsActivated = 0;
var userClick = false;
// Buttons variables.
const restartButton = document.querySelector("#restart-button");
const playPauseButton = document.querySelector("#pause-and-play-button");
// Cell variables.
const cellRegEx = /cell/;
const cellsAliveAtStart = [
    // Shhh... it's the missing cell!
    // "25,8",
    "26,8",
    "25,9",
    "27,9",
    "20,10",
    "25,10",
    "27,10",
    "28,10",
    "19,11",
    "20,11",
    "26,11",
    "18,12",
    "21,12",
    "18,13",
    "19,13",
    "20,13",
    "28,15",
    "29,15",
    "30,15",
    "27,16",
    "30,16",
    "22,17",
    "28,17",
    "29,17",
    "20,18",
    "21,18",
    "23,18",
    "28,18",
    "21,19",
    "23,19",
    "22,20",
    "23,20"
];
var cellsAliveAtRestart = [
    "25,8",
    "26,8",
    "25,9",
    "27,9",
    "20,10",
    "25,10",
    "27,10",
    "28,10",
    "19,11",
    "20,11",
    "26,11",
    "18,12",
    "21,12",
    "18,13",
    "19,13",
    "20,13",
    "28,15",
    "29,15",
    "30,15",
    "27,16",
    "30,16",
    "22,17",
    "28,17",
    "29,17",
    "20,18",
    "21,18",
    "23,18",
    "28,18",
    "21,19",
    "23,19",
    "22,20",
    "23,20"
];
var cellsAlive = cellsAliveAtStart;
var currentEditedCell;
// Phase variables.
var puzzlePhase = true;
var interactivePhase = false;
// Construct variables.
const constructs = getConstructs();
const constructsIndices = {};
for (let i = 0; i < constructs.length; i++) {
    let name = constructs[i].type;
    constructsIndices[name] = i;
}
const constructButtonRegex = /-button/;

function initializeGridStyle() {
    // Sets up game grid rows and columns based on column and row amounts.
    let gameGrid = document.getElementById("game-grid")
    gameGrid.style.gridTemplateColumns = `${cellSize}px `.repeat(gridColumns);
    gameGrid.style.gridTemplateRows = `${cellSize}px `.repeat(gridRows);
}

function populateGrid(refCellsAlive) {
    // Uses the reference of cells to be alive to put cells into the grid list.
    // This grid is just a 2D array of Cell objects.
    for (let r = 0; r < gridRows; r++) {
        let addRow = [];
        for (let c = 0; c < gridColumns; c++) {
            let number = (r) * gridColumns + (c + 1);
            let position = [c, r];
            let state = "dead";
            if (refCellsAlive.includes(position.toString())) {
                state = "alive";
            }
            let newCell = new Cell(number, state, position, gridColumns, gridRows);
            addRow.push(newCell);
        }
        grid.push(addRow);
    }
}

function pushGridToHTML() {
    // Converts the array of Cells to visual HTML elements in the HTML grid.
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridColumns; c++) {
            let item = grid[r][c];
            let itemHTML = document.createElement("div");
            itemHTML.id = `cell${item.number}`;
            let itemCSS = `width: ${cellSize}px; height: ${cellSize}px; grid-column: ${item.position[0] + 1}/${item.position[0] + 2}; grid-row: ${item.position[1] + 1}/${item.position[1] + 2}; background-color: ${item.color};`;
            itemHTML.style = itemCSS;
            gameGrid.append(itemHTML);
        }
    }
}

function updateCellsAlive() {
    // Updates the cellsAlive array with the coordinates of all currently alive
    // cells.
    let newCellsAlive = [];
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridColumns; c++) {
            if (grid[r][c].state == "alive") {
                newCellsAlive.push(grid[r][c].position.toString());
            }
        }
    }
    cellsAlive = newCellsAlive;
}

function drawScreen() {
    // Clears the game grid HTML and replaces it with the current cells' states.
    gameGrid.innerHTML = "";
    pushGridToHTML();
}

function clickHandler(event) {
    // Handles what happens when a cell is clicked on.
    // Nothing should happen if the player is still in the puzzle phase and they
    // try to modify a cell while the game is in play.
    // The cell at row 20, column 23 is the only one that can be killed while in
    // the puzzle phase. The player can only choose one cell to revive while in
    // the puzzle phase.
    // While in the interactive phase, the player may update any cell they want.
    if (puzzlePhase && !isPaused) {}
    else {
        userClick = true;
        let cellHTML = event.target;
        let cellId =  cellHTML.id;
        let cellNumber = parseInt(cellId.replace(cellRegEx, ""));
    
        let cellRow = Math.floor((cellNumber - 1) / gridColumns);
        let cellColumn = (cellNumber - (cellRow * gridColumns)) - 1;
        
        if (puzzlePhase) {
            if (cellRow == 20 && cellColumn == 23) {
                grid[cellRow][cellColumn].changeState();
            }
            else if (currentEditedCell == grid[cellRow][cellColumn] && grid[cellRow][cellColumn].state == "alive" || grid[cellRow][cellColumn].state == "dead") {
                cellsActivated += grid[cellRow][cellColumn].changeState();
                if (cellsActivated < 0 || cellsActivated > 1) {
                    cellsActivated += grid[cellRow][cellColumn].changeState();
                }
                else {
                    currentEditedCell = grid[cellRow][cellColumn];
                }
            }
        }
        else {
            grid[cellRow][cellColumn].changeState();
        }
    }
}

function updateGameStatus() {
    // Checks if the user has escaped the puzzle phase or removed the cell at
    // row 20, column 23 and updates their phase accordingly.
    // firstCheck prevents this function from being executed past the first frame
    // the game isn't paused.
    if (firstCheck) {
        if (grid[8][25].state == "alive") {
            exitPuzzlePhase();
        }
        else if (grid[20][23].state == "dead") {
            goodTryPrompt();
        }
        else {
            tryAgainPrompt();
        }
        firstCheck = false;
    }
}

function exitPuzzlePhase() {
    // Puts the game out of the puzzle phase and prepares full interactivity.
    puzzlePhase = false;
    tipsArea.innerText = "Great job! Now you can see the ecosystem will last forever.\n\nYou've unlocked full interactivity! Choose a template from below or do your own thing!";
    interactivePhase = true;
    addTemplates();
    addExtraButtons();
    
    let title = document.getElementById("title");
    title.addEventListener("click", GOL);
    
    function GOL() {
        // ????
        clear();
        let flipFlop;
        for (let r = 0; r < gridRows; r++) {
            for (let c = 0; c < gridColumns; c++) {
                if (c == 0) {
                    flipFlop = (r % 2 == 0);
                }
                if (!flipFlop) {
                    grid[r][c].changeState();
                    flipFlop = true
                }
                else {
                    flipFlop = false;
                }
            }
        }
        updateCellsAlive();
        drawScreen();
    }
}

function goodTryPrompt() {
    // Replaces the current tip with this one.
    tipsArea.innerText = "That was a good guess! However, even though the starting position is symmetrical, it goes stagnant pretty quickly. Remember: you are adding a cell, not removing one.";
}

function tryAgainPrompt() {
    // Picks a random prompt from an array to replace with the current tip. The
    // tip about symmetry is slightly more rare than the others.
    let prompts = [
        "Not quite. Notice how, no matter how long it runs, the ecosystem eventually dies? Try again!",
        "Not quite. Notice how, no matter how long it runs, the ecosystem eventually dies? Try again!",
        "This ecosystem is fine, but eventually it will run out of resources. Try it again!",
        "An ecosystem dies when it expends its resources too rapidly. This one looks nice, but will eventually die!",
        "These cells weren't given the proper starting conditions to last forever. Try again!",
        "Not quite. Notice how, no matter how long it runs, the ecosystem eventually dies? Try again!",
        "This ecosystem is fine, but eventually it will run out of resources. Try it again!",
        "An ecosystem dies when it expends its resources too rapidly. This one looks nice, but will eventually die!",
        "These cells weren't given the proper starting conditions to last forever. Try again!",
        "Remember that symmetry is key. A symmetrical ecosystem is more likely to be stable."
    ]
    tipsArea.innerText = prompts[Math.floor(Math.random() * 10)];
}

function addTemplates() {
    // References the constructs.mjs module to create buttons for all the
    // built-in constructs.
    templatesArea.style.height = "25%";
    templatesArea.style.gridTemplateColumns = "1fr 1fr 1fr";
    templatesArea.style.gridTemplateRows = "1fr 1fr";
    for (let i = 0; i < constructs.length; i++) {
        let construct = constructs[i];
        let type = construct.type;
        // Add the button
        let constructButton = document.createElement("button");
        constructButton.id = `${type}-button`;
        constructButton.innerText = type;
        constructButton.style.gridRow = `${Math.floor(i / 3) + 1}/${Math.floor(i / 3) + 2}`;
        constructButton.style.gridColumn = `${(i + 1) % 3}/${(i + 1) % 3 + 1}`;
        
        templatesArea.append(constructButton);
    }
    templatesArea.addEventListener("click", loadConstruct);
}

function loadConstruct(event) {
    // Replaces the current cells with the target construct's.
    let id = event.target.id;
    if (!isPaused) {
        playPause();
    }
    let constructType = id.replace(constructButtonRegex, "");
    let constructIndex = constructsIndices[constructType];
    grid = [];
    populateGrid(constructs[constructIndex].coords);
    cellsAliveAtRestart = constructs[constructIndex].coords;
    drawScreen();
}

function addExtraButtons() {
    // Once they exit the puzzle phase, the user gets more buttons to control
    // the game. This adds them all.
    let leftButtons = document.getElementById("left-buttons");
    leftButtons.style.gridTemplateColumns = "1fr 1fr";
    
    let rightButtons = document.getElementById("right-buttons");
    rightButtons.style.gridTemplateColumns = "1fr 1fr";
    rightButtons.style.gridTemplateRows = "1fr 1fr";
    
    // Get the other buttons' styles ready.
    restartButton.style.gridColumn = "1/2";
    playPauseButton.style.gridColumn = "1/2";
    playPauseButton.style.gridRow = "1/3";
    
    // Add the CLEAR button
    let clearButton = document.createElement("button");
    clearButton.id = "clear-button";
    clearButton.innerText = "Clear";
    clearButton.style.gridColumn = "2/3";
    leftButtons.append(clearButton);
    clearButton.addEventListener("click", clear);
    
    // Add the STEP button
    let stepButton = document.createElement("button");
    stepButton.id = "step-button";
    stepButton.innerText = "Step";
    stepButton.style.gridColumn = "2/3";
    stepButton.style.gridRow = "1/2";
    rightButtons.append(stepButton);
    stepButton.addEventListener("click", step);
    
    // Add the SAVE button
    let saveButton = document.createElement("button");
    saveButton.id = "save-button";
    saveButton.innerText = "Save";
    saveButton.style.gridColumn = "2/3";
    saveButton.style.gridRow = "2/3";
    rightButtons.append(saveButton);
    saveButton.addEventListener("click", save);
}

function restart() {
    // Resets the grid to the proper construct.
    cellsActivated = 0;
    if (!isPaused) {
        playPause();
    }
    grid = [];
    if (puzzlePhase) {
        populateGrid(cellsAliveAtStart);
    }
    else {
        populateGrid(cellsAliveAtRestart);
    }
    drawScreen();
    firstCheck = true;
    if (puzzlePhase) {
        tipsArea.innerText = "";
    }
}

function playPause() {
    // Plays the game is currently paused, and vice versa.
    if (isPaused) {
        playPauseButton.innerText = "Pause";
        isPaused = false;
    }
    else {
        playPauseButton.innerText = "Play";
        isPaused = true;
    }
}

function clear() {
    // Clear the grid.
    if (!isPaused) {
        playPause();
    }
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridColumns; c++) {
            if (grid[r][c].state == "alive") {
                grid[r][c].changeState();
            }
        }
    }
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridColumns; c++) {
        }
    }
    cellsAliveAtRestart = [];
    cellsAlive = [];
    updateCells(grid, gridColumns. gridRows);
    updateCellsAlive();
    drawScreen();
}

function step() {
    // Go forward one generation.
    if (!isPaused) {
        playPause();
    }
    grid = updateCells(grid, gridColumns, gridRows);
    updateCellsAlive();
    drawScreen();
}

function save() {
    // Save the state of the board.
    cellsAliveAtRestart = cellsAlive;
}

function gameLoop() {
    // This is called every tick (controlled by framerate).
    if (isPaused) {
        if (userClick) {
            updateCellsAlive();
            drawScreen();
            userClick = false;
        }
    }
    else {
        grid = updateCells(grid, gridColumns, gridRows);
        updateCellsAlive();
        drawScreen();
        if (puzzlePhase) {
            updateGameStatus();
        }
    }
}

initializeGridStyle();
populateGrid(cellsAliveAtStart);
pushGridToHTML(grid);
gameGrid.addEventListener("click", clickHandler);
document.getElementById("restart-button").addEventListener("click", restart);
playPauseButton.addEventListener("click", playPause);
setInterval(gameLoop, (1 / frameRate) * 1000);