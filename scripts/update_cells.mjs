function updateCells(grid, cols, rows) {
    let newGrid = grid;
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let neighbors = 0;
            let cell = newGrid[r][c];
            // 1) Check all around cell for alive cells.
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (cell.checkGrid[i + 1][j + 1] == 1) {
                        if (grid[r + i][c + j].state == "alive") {
                            neighbors++;
                        }
                    }
                }
            }
            // 2) Update neighbors.
            newGrid[r][c].updateNeighbors(neighbors);
        }
    }
    // 3) Check each cell.
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            newGrid[r][c].check();
        }
    }
    return newGrid;
}

export default updateCells;