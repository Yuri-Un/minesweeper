export function createBoard(rows, columns, mines){
    let board = new Array(rows);

    for (let row = 0; row < board.length; row++) {
        board[row] = new Array(columns);

        for (let column = 0; column < columns; column++) {
            board[row][column] = 0;
        }
    }

    return board;
}

function getRandomInt(max = 10){
    return Math.floor(Math.random());
}

function setMines(board, mines){
    let minesLeft = mines;
    const maxMinesPerRow = Math.round(columns/2);
    
}