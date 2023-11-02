class Cell {
    constructor(number, state, position, cols, rows) {
        this.number = number;
        this.state = state;
        if (this.state == "alive") {
            this.color = "white";
        }
        else {
            this.color = "black"
        }
        this.position = position;
        this.leftEdge = false;
        this.topEdge = false;
        this.rightEdge = false;
        this.bottomEdge = false;
        if (this.position[0] == 0) {
            this.leftEdge = true;
        }
        if (this.position[0] == cols - 1) {
            this.rightEdge = true;
        }
        if (this.position[1] == 0) {
            this.topEdge = true;
        }
        if (this.position[1] == rows - 1) {
            this.bottomEdge = true;
        }
        this.aliveNeighbors = 0;
        this.checkGrid = getCheckGrid(this);
    }
    check() {
        if (this.state == "alive") {
            if (willDie(this)) {
                die(this);
            }
        }
        else if (this.state == "dead") {
            if (willAlive(this)) {
                alive(this);
            }
        }
    }
    updateNeighbors(newNeigbors) {
        this.aliveNeighbors = newNeigbors;
    }
    changeState() {
        if (this.state == "alive") {
            die(this);
            return -1;
        }
        else if (this.state == "dead") {
            alive(this);
            return 1;
        }
    }
}

function willDie(cell) {
    if (cell.aliveNeighbors == 2 || cell.aliveNeighbors == 3) {
        return false;
    }
    else {
        return true;
    }
}

function die(cell) {
    cell.color = "black";
    cell.state = "dead";
}

function willAlive(cell) {
    if (cell.aliveNeighbors == 3) {
        return true;
    }
    else {
        return false;
    }
}

function alive(cell) {
    cell.color = "white";
    cell.state = "alive";
}

function getCheckGrid(cell) {
    // A 1 tells us that we need to check that neighbor. A 0 says not to.
    // Index [1][1] is already 0 because we do not check ourselves.
    let checkNeighborsGrid = [
        [1, 1, 1],
        [1, 0, 1],
        [1, 1, 1]
    ];
    if (cell.leftEdge) {
        checkNeighborsGrid[0][0] = 0;
        checkNeighborsGrid[1][0] = 0;
        checkNeighborsGrid[2][0] = 0;
    }
    if (cell.rightEdge) {
        checkNeighborsGrid[0][2] = 0;
        checkNeighborsGrid[1][2] = 0;
        checkNeighborsGrid[2][2] = 0;
    }
    if (cell.topEdge) {
        checkNeighborsGrid[0][0] = 0;
        checkNeighborsGrid[0][1] = 0;
        checkNeighborsGrid[0][2] = 0;
    }
    if (cell.bottomEdge) {
        checkNeighborsGrid[2][0] = 0;
        checkNeighborsGrid[2][1] = 0;
        checkNeighborsGrid[2][2] = 0;
    }
    return checkNeighborsGrid;
}

export default Cell;