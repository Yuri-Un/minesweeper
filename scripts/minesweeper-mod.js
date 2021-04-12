//The generic board object
const board = {
    mines: 0,
    rows: 0,
    columns: 0,
    field: Array()
}

const boardStats = {
    minRows: 5,
    minColumns: 5,
    maxRows: 100,
    maxColumns: 100,
    isMobileMode: false
}

export const gameMode = {
    TEST_MODE: {rows: 5, columns: 5, mines: 5},
    EASY_MODE: {rows: 10, columns: 10, mines: 20},
    NORMAL_MODE: {rows: 20, columns: 20, mines: 80},
    HARD_MODE: {rows: 50, columns: 50, mines: 50},
    CUSTOM_MODE: {},
    RANDOM_MODE: {}
}

export function initBoard(mode = gameMode.TEST_MODE){

    if(mode.rows < boardStats.minRows || mode.columns < boardStats.minColumns){
        errorLog('The board is too small');
        return;
    }

    if(mode.rows > boardStats.maxRows || mode.columns > boardStats.maxColumns){
        errorLog('The board is too big');
        return;
    }

    if(mode.mines < Math.round(mode.rows * mode.columns / 5)){
        errorLog('Not enought mines on the board');
        return;
    }

    if(mode.mines > Math.round(mode.rows * mode.columns / 2)){
        errorLog('There are too many mines on the board');
        return;
    }

    return createBoard(mode.rows, mode.columns, mode.mines);

}

function createBoard(rows, columns, mines){
    board.mines = mines;
    board.rows = rows;
    board.columns = columns;
    board.field = new Array(rows);

    for (let row = 0; row < board.field.length; row++) {
        board.field[row] = new Array(columns);

        for (let column = 0; column < board.field[row].length; column++) {
            board.field[row][column] = 0;
        }
    }

    setMines(board, mines);
    setMineRadar(board);

    return board;
}

//needs to be improved
export function renderBoard(id, board){
    if(id.length <= 0){
        errorLog('The board DOM id value is missing');
        return;
    }

    const domBoard = document.getElementById(id);

    //let cssColumns = getComputedStyle(document.documentElement).getPropertyValue('--ms-columns');
    domBoard.innerHTML = '';
    document.documentElement.style.setProperty('--ms-columns', board.columns);

    if(domBoard === null){
        errorLog('Incorrect board DOM id');
        return;
    }
    
    for (let row = 0; row < board.field.length; row++) {
        for (let column = 0; column < board.field[row].length; column++) {
            const element = board.field[row][column];

            let spot = document.createElement('div');
            let text = document.createTextNode(element);
            spot.setAttribute('class', 'box');
            spot.setAttribute('cell', row + ':' + column)
            spot.appendChild(text);

            domBoard.appendChild(spot);
        }
    }
}


function errorLog(msg){
    console.log('ERROR: ' + msg);
}

function getRandomInt(max = 100){
    return Math.floor(Math.random() * max);
}

//Set mines on the board one by one recursively
function setMines(board, mines){
    let minesLeft = mines;
    const maxMinesPerRow = Math.round(board.columns/3);
    let minesPerRowCounter = 0;

    for (let row = 0; row < board.field.length; row++) {
        for (let column = 0; column < board.field[row].length; column++) {
            let element = board.field[row][column];

            if(element === -1) continue;

            if(getRandomInt() > 90 && minesPerRowCounter < maxMinesPerRow){
                board.field[row][column] = -1;
                minesLeft--;
                minesPerRowCounter++;

                if(minesLeft <= 0) return;
            }
        }
        minesPerRowCounter = 0;
    }

    setMines(board, minesLeft);
}

//Set mines proximity map overlay
function setMineRadar(board){
    for (let row = 0; row < board.field.length; row++) {
        for (let column = 0; column < board.field[row].length; column++) {
            let element = board.field[row][column];

            if(element !== -1){
                board.field[row][column] = countNearbyMines(board, row, column);
            }
        }
    }
}

//A sub-processor for setMineRadar()
function countNearbyMines(board, row, column){
    let result = 0;
    let leftOffsetColumn = column - 1;
    let rightOffsetColumn = column + 1;
    let upperOffsetRow = row - 1;
    let bottomOffsetRow = row + 1;

    if(leftOffsetColumn < 0) leftOffsetColumn = 0;
    if(rightOffsetColumn >= board.field[row].length) rightOffsetColumn = column;
    if(upperOffsetRow < 0) upperOffsetRow = 0;
    if(bottomOffsetRow >= board.field.length) bottomOffsetRow = row;

    for (let i = upperOffsetRow; i <= bottomOffsetRow; i++) {
        for (let j = leftOffsetColumn; j <= rightOffsetColumn; j++) {
            const element = board.field[i][j];

            if(i === row && j === column) continue;
            if(element === -1) result++;
        }
    }    

    return result;
}