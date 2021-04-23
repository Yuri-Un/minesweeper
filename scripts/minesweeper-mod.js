//==============================================================
//                  Minesweeper Videogame Module
//      Author: Yuri Un
//      Date: April 2021
//==============================================================

//==============================================================
//                      USER DEFINED TYPES
//==============================================================
export class Board{
    constructor(id, mode){
        if(id.length <= 0 || id === undefined) errorLog("Board DOM id is missing");
        if(mode === undefined) errorLog("Game mode is not defined");

        this.ID = id; //External DOM Element id
        this.domElement = document.getElementById(id); //DOM Element object
        this.width = this.domElement.clientWidth;
        this.height = this.domElement.clientHeight;
        this.aspectRatio = this.width/this.height;

        this.mode = mode; //Game mode
        this.scale = this.initBoardScale();
        this.setupScale();

        this.openCells = 0; //The counter for opened cells from total (rows*columns)
        this.flags = 0; //Flag markers
        this.field = []; //Board objects matrix
        this.gameOver = false; //Lose status
        this.gamePaused = false;
        this.winCondition = false; //Win status
    }

    setupScale(){
        this.rows = this.scale.rows; //Board rows
        this.columns = this.scale.columns; //Board columns
        this.cells = this.scale.cells;
        this.mines = this.scale.mines; //Total amount of mines (game difficulty) 
    }

    initBoardScale(){
        let squareBase = Math.ceil(Math.sqrt(this.mode.difficultyRank));
        let cellSize = 50;
        let rows = 0;
        let columns = 0;
        let mines = 0;

        // document.documentElement.style.setProperty('--ms-height', 'auto');

        let gridGap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ms-grid-gap'));
        let boardMargin = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ms-margin'));
        let boardPaddingTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ms-margin'));
        let boardBorderWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ms-border-width'));


        let boardHeight = docViewProperties.screenHeight - 2*(boardMargin + boardPaddingTop + boardBorderWidth);
        let boardWidth = this.width - 2*boardPaddingTop;
        let gridGapTotal = 0;
        
        if(docViewProperties.aspectRatio >= 1){
            columns = squareBase + Math.ceil(this.aspectRatio);
            cellSize = boardWidth/columns;

            while(rows*cellSize < boardHeight - gridGapTotal - cellSize){
                rows++;
                gridGapTotal = (rows - 1)*gridGap;
            }
        }
        else{
            columns = squareBase;
            cellSize = boardWidth/columns;

            while(rows*cellSize < boardHeight - gridGapTotal - cellSize){
                rows++;
                gridGapTotal = (rows - 1)*gridGap;
            }
        }
        
        let cells = rows*columns;

        switch(this.mode.difficultyMode){
            case 'easy':
                mines = getRandomRangeInt(Math.floor(cells/5), Math.ceil(cells/4));
            break;

            case 'normal':
                mines = getRandomRangeInt(Math.floor(cells/4), Math.ceil(cells/3));
            break;

            case 'hard':
                mines = getRandomRangeInt(Math.floor(cells/3), Math.ceil(cells/2));
            break;

            default:
                mines = getRandomRangeInt(Math.floor(cells/5), Math.ceil(cells/3));
        }

        return {rows: rows, columns: columns, cells: cells, mines: mines};
    }

    incGameDifficulty(){
        if(this.width/50 < Math.sqrt(this.mode.difficultyRank)){
            warningLog("The board difficulty reached its max value");
            return;
        }

        this.mode.difficultyRank += 10;
        this.scale = this.initBoardScale();
        this.setupScale();
    }

    resetStatus(){
        this.gameOver = false;
        this.gamePaused = false;
        this.winCondition = false;
    }
}


class GameMode{
    constructor(customGameMode){
        this.TEST_MODE = this.getEasyMode(); //{rows: 5, columns: 5, mines: 5};
        this.EASY_MODE = this.getEasyMode();
        this.NORMAL_MODE = this.getNormalMode();
        this.HARD_MODE = this.getHardMode();
        this.CUSTOM_MODE = customGameMode;
        this.RANDOM_MODE =this.getRandomMode();
    }

    getEasyMode(){
        let difficultyRank = getRandomRangeInt(25, 25);
        return {difficultyMode: 'easy', difficultyRank: difficultyRank};
    }

    getNormalMode(){
        let difficultyRank = getRandomRangeInt(500, 1000);
        return {difficultyMode: 'normal', difficultyRank: difficultyRank};
    }

    getHardMode(){
        let difficultyRank = getRandomRangeInt(1500, 2500);
        return {difficultyMode: 'hard', difficultyRank: difficultyRank};
    }

    getRandomMode(){
        let difficultyRank = getRandomRangeInt(90, 2500);
        return {difficultyMode: 'normal', difficultyRank: difficultyRank};
    }
    
}

class Node{
    constructor(row, column){
        this.nodeId = row + ':' + column; //DOM Element id
        this.row = row; //A binding to the matrix row
        this.column = column; //A binding to the matrix column
        this.visited = false;  //True if a node is processed/visited
        this.nodeLinks = []; //Array of links to zero-based sibling nodes
    }
    
    static nodeMap = [];
}

class DocViewProperties{
    constructor(){
        this.refresh();
    }
    
    refresh(){
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
        this.aspectRatio = this.getAspectRatio();
        this.orientation = this.getOrientation();
        this.scrollBarWidth =  this.getScrollbarWidth();
        this. resizeTimer = null;
    }
    
    getAspectRatio(){
        return this.screenWidth/this.screenHeight;
    }
    
    getOrientation(){
        let result = "album";
        
        if(this.aspectRatio < 1) result = 'portrait';
        if(this.aspectRatio === 1) result = 'square';
        if(this.aspectRatio > 1) result = 'album';
        
        return result;
    }
    
    getScrollbarWidth(){
        // Creating invisible container
        const outer = document.createElement('div');
        outer.style.visibility = 'hidden';
        outer.style.overflow = 'scroll';
        outer.style.msOverflowStyle = 'scrollbar';
        document.body.appendChild(outer);
        
        // Creating inner element and placing it in the container
        const inner = document.createElement('div');
        outer.appendChild(inner);
        
        // Calculating difference between container's full width and the child width
        const scrollbarWidth = (outer.offsetWidth - inner.offsetWidth);
        
        // Removing temporary elements from the DOM
        outer.parentNode.removeChild(outer);
        
        return scrollbarWidth;
    }
}

const boardProperties = {
    minRows: 5,
    minColumns: 5,
    maxRows: 100,
    maxColumns: 100,
    isMobileMode: false,
}

//==============================================================
//                      PUBLIC GAME OBJECTS
//==============================================================
let board = {};
let initialBoard = {};
let firstRun = false;

export const docViewProperties = new DocViewProperties();
export const gameMode = new GameMode();

// export const gameMode = {
//     TEST_MODE: {rows: 5, columns: 5, mines: 5},
//     EASY_MODE: {rows: 10, columns: 10, mines: 20},
//     NORMAL_MODE: {rows: 20, columns: 20, mines: 80},
//     HARD_MODE: {rows: 50, columns: 50, mines: 50},
//     CUSTOM_MODE: {},
//     RANDOM_MODE: {rows: 10, columns: 10, mines: 25}
// }

//==============================================================
//                      PUBLIC GAME FUNCTIONS
//==============================================================
export function newGame(gameObject){
    //Singleton emulation
    if(!firstRun){
        board = gameObject;
        initialBoard = JSON.parse(JSON.stringify(gameObject));
    }
    else{
        board = new Board(initialBoard.ID, initialBoard.mode);
    }
    
    console.log(initialBoard);
    console.log(docViewProperties);

    renderBoard(board.ID, initBoard(board));
    firstRun = true; //The only place where the variable is changed
}

export function restartGame(board){
    board.resetStatus();
    renderBoard(board.ID, initBoard(board));
}

export function nextGame(board){
    board.resetStatus();
    board.incGameDifficulty();

    renderBoard(board.ID, initBoard(board));
}


//==============================================================
//                      PRIVATE GAME FUNCTIONS
//==============================================================
function initBoard(board){
    //set initial board properties
    Node.nodeMap = [];
    board.flags = 0;
    board.openCells = 0;

    //create Model
    return createBoard(board.rows, board.columns, board.mines);
}

function createBoard(rows, columns, mines){
    board.field = new Array(rows);

    for (let row = 0; row < board.field.length; row++) {
        board.field[row] = new Array(columns);
        board.field[row].fill(0);
    }

    setMines(board, mines);
    setMineRadar(board);

    return board;
}

//Set mines on the board one by one recursively
function setMines(board, mines){
    let minesLeft = mines;
    const maxMinesPerRow = Math.round(board.columns/5);
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
            const element = board.field[row][column];

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

//The View-Controller rendering of the board Model.
//id - is the external HTML-CSS wrapper container id
//board - is the internal user defined object
function renderBoard(id, board){
    //setup the board overlay
    initOverlay(id);

    // board.ID = id;
    // domBoard.innerHTML = '';

    for (let row = 0; row < board.field.length; row++) {
        for (let column = 0; column < board.field[row].length; column++) {
            const nodeValue = board.field[row][column];
           
            const element = createCell(nodeValue, row, column);

            board.domElement.appendChild(element);
        }
    }

    board.domElement.addEventListener("contextmenu", contextMSHandler, false);
    window.addEventListener("resize", resizeMSHandler, false);

    UpdateOverlay(board.domElement, board);
}

function initOverlay(id){
    let domBoard = null;

    if(id.length <= 0){
        errorLog('The component DOM id value is missing');
        return;
    }

    domBoard = document.getElementById(id);
    
    if(domBoard === null){
        errorLog('Incorrect DOM id');
        return;
    }

    board.ID = id;
    board.domElement = domBoard;
    domBoard.innerHTML = '';

    //A hook to remove the scrollbar clipping glitches while the doc is loading.
    //Because CSS Grid and Flex causes multiple overlay changes while the data is appended.
    document.documentElement.style.setProperty('--ms-height', '1vh');

    document.documentElement.style.setProperty('--ms-columns', board.columns);
    document.documentElement.style.setProperty('--ms-rows', board.rows);

    //return domBoard;
}

function UpdateOverlay(element, board, isResized = false){
    let domBoard = element;

    //gets the browser scrollbar width
    let scrollBarWidth = docViewProperties.scrollBarWidth;

    //gets the board overlay properties
    let boardStyle = getComputedStyle(domBoard);
    let boardPaddingTop = parseInt(boardStyle.paddingTop);
    let boardPaddingRight = parseInt(boardStyle.paddingRight);
    let boardPaddingBottom = parseInt(boardStyle.paddingBottom);
    let boardPaddingLeft = parseInt(boardStyle.paddingLeft);
    let boardMarginTop = parseInt(boardStyle.marginTop);

    //gets the board inner size
    let boardInnerWidth = domBoard.clientWidth;
    let boardInnerHeight = domBoard.clientHeight;

     //gets the overall gap width of the Grid element
    let gridGap = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--ms-grid-gap'));
    let gridGapTotalWidth = gridGap*(board.columns - 1);
    let gridGapTotalHeight = gridGap*(board.rows - 1);

    
    let cellWidth = (boardInnerWidth - gridGapTotalWidth - boardPaddingLeft - boardPaddingRight) / board.columns;
    let cellHeight = cellWidth;

    //recomputes the cell size when the scrollbar is active
    let boardHeight = board.rows*cellHeight + gridGapTotalHeight + boardPaddingTop+ boardPaddingBottom + 2*boardMarginTop;
    if(boardHeight > window.innerHeight){
        //A hook to remove the scrollbar clipping glitches while the view is resized.
        boardInnerWidth = isResized?boardInnerWidth + scrollBarWidth: boardInnerWidth;

        cellWidth = (boardInnerWidth - gridGapTotalWidth - boardPaddingLeft - boardPaddingRight - scrollBarWidth) / board.columns;
        cellHeight = cellWidth;
    }
    
    //updates the CSS file vars
    document.documentElement.style.setProperty('--ms-cell-width', cellWidth +  'px');
    document.documentElement.style.setProperty('--ms-cell-height', cellHeight +  'px');

    //Remove the CSS hook setup when the rendering is finished
    document.documentElement.style.setProperty('--ms-height', 'auto');
}

function createCell(value, row, column){
    let spot = document.createElement('div');
    let text = document.createTextNode(value);

    spot.setAttribute('class', 'cell hidden');
    spot.setAttribute('node', row + ':' + column);

    spot.appendChild(text); // a temporary option
    spot.addEventListener('mouseup', clickMSHandler, false);

    return spot;
}

//Open [this] cell and change its status. Check the game win/lose condition.
function openCell(cell){

    if(board.gamePaused) return;
    if(isOpenCell(cell)) return;

    let cellRow = parseInt(cell.getAttribute("node").split(':')[0]);
    let cellColumn = parseInt(cell.getAttribute("node").split(':')[1]);
    let element = board.field[cellRow][cellColumn];
    
    if(element === -1){
        cell.className = "cell mine";
        
        gameOver();
    }

    if(element === 0){
        
        let timerStart = performance.now();
        discoverCellsGraph(null, new Node(cellRow, cellColumn), 0);
        let timerEnd = performance.now();
        
        console.log("Algorithm runtime (ms): " + (timerEnd - timerStart));
        console.log("Open: " + board.openCells);
    }
    else{
        setupFlag(cell, false);

        if(isHiddenCell(cell)) board.openCells++;

        cell.className = "cell open";
        cell.innerText = element !== 0? element: "";
    }
    
    if(board.rows*board.columns - board.openCells <= board.mines){
        gameWon();
    }
}

function isHiddenCell(cell){
    let result = false;

    let classNames = cell.className.split(' ');
    if(classNames.find(s => s === 'hidden') !== undefined)  {
        result = true;
    }

    return result;
}

function isOpenCell(cell){
    let result = false;

    let classNames = cell.className.split(' ');
    if(classNames.find(s => s === 'open') !== undefined)  {
        result = true;
    }

    return result;
}

//Implements the Depth First Traversal and Graph Cycle algorithms.
function discoverCellsGraph(previousNode, currentNode, rank = 0){
    //Exit point
    if(currentNode === null){
        return;
    }

    if(previousNode === currentNode){
        errorLog('Undefined Graph stance');
        return;
    }

    //ignore a visited node and remove its recursion stack
    if(currentNode.visited){
        return;
    }

    //change the current node visual status
    let nodeValue = board.field[currentNode.row][currentNode.column];
    setupCell(currentNode, nodeValue);

    currentNode.visited = true;
    rank++;
    //stop any deep stack allocations in case
    if(rank > 255) return;

    let topNode = new Node(currentNode.row - 1, currentNode.column);
    let rightNode = new Node(currentNode.row, currentNode.column + 1);
    let bottomNode = new Node(currentNode.row + 1, currentNode.column);
    let leftNode = new Node(currentNode.row, currentNode.column - 1);
    
    let siblingNodes = new Array();
    siblingNodes.push(topNode, rightNode, bottomNode, leftNode);
    
    currentNode.nodeLinks = siblingNodes.filter((node) =>{
        let result = false;
        
        if(isNodeAvailable(node)){
            
            let nodeValue = board.field[node.row][node.column];
            let found = false;
            
            for (const subNode of Node.nodeMap) {
                if(node.nodeId === subNode.nodeId){
                    found = true;
                    return result;
                }
            }
            
            result = nodeValue === 0? true: false;
            
            if(!found && result){
                Node.nodeMap.push(node);
            }
            
            if(!result){
                //change the current node visual status
                setupCell(node, nodeValue);
            }
        } 
        
        return result;
    });

    if(currentNode.nodeLinks.length === 0){
        discoverCellsGraph(currentNode, previousNode, rank);
    }
    else{
        currentNode.nodeLinks.forEach((node) => {
            discoverCellsGraph(currentNode, node, rank);
        })
    }
}

function isNodeAvailable(node){
    return node.row >= 0 && node.row <= board.rows - 1 && node.column >= 0 && node.column <= board.columns - 1;
}

function setupCell(node, value){
    const cellElement = document.querySelector("[node='" + node.row + ":" + node.column + "']");

    if(isOpenCell(cellElement)) return;

    if(hasFlag(cellElement)){
        board.flags--;
    }
    if(isHiddenCell(cellElement)) board.openCells++;

    cellElement.className = "cell open";
    cellElement.innerText = value !== 0? value: "";
}

//The flag display handler. 
function setupFlag(cell, marker = true){

    if(isOpenCell(cell)) return;

    switch(marker){
        case true:
            cell.classList.toggle("flag");
            
            setTimeout(() => {
                if(hasFlag(cell)){
                    board.flags++;
                }
                else{
                    board.flags--;
                }
                
                if(board.flags >= board.mines){
                    checkMarkedFlags();
                }
            }, 5);
        break;
            
        case false:
            if(hasFlag(cell)) board.flags--;
        break;
            
        default:
            return;
    }
}

function checkMarkedFlags(){
    let markers = 0;

    for (let row = 0; row < board.field.length; row++) {
        for (let column = 0; column < board.field[row].length; column++) {
            const nodeValue = board.field[row][column];
            const cellElement = document.querySelector("[node='" + row + ":" + column + "']");
            
            if(hasFlag(cellElement) && nodeValue === -1){
                markers++;
            }
            
            if(markers >= board.mines){
                gameWon();
                return;
            }
        }
    }

    gameOver();
    return;
}

function hasFlag(cell){
    let result = false;

    let classNames = cell.className.split(' ');
    if(classNames.find(s => s === 'flag') !== undefined){
        result = true;
    }

    return result;
}

function gameWon(){
    board.winCondition = true;

    setBlurBG();

    let menuWrapper = document.createElement('div');
    menuWrapper.className = "game-menu-wrapper";
    
    let gameWonMenu = document.createElement('div');
    gameWonMenu.className = "game-won-menu";
    
    let menuTitle = document.createElement('div');
    menuTitle.className = "menu-title win-game";
    menuTitle.innerText = "You Won";
    
    let menuNextGameOption = document.createElement('div');
    menuNextGameOption.className = "menu-option next-game";
    menuNextGameOption.innerText = "Next Game";
    menuNextGameOption.addEventListener('click', nextGameMenuHandler, false);
    
    let menuMainOption = document.createElement('div');
    menuMainOption.className = "menu-option exit-game";
    menuMainOption.innerText = "Main Menu";
    menuMainOption.addEventListener('click', mainMenuHandler, false);

    gameWonMenu.appendChild(menuTitle);
    gameWonMenu.appendChild(menuNextGameOption);
    gameWonMenu.appendChild(menuMainOption);
    
    menuWrapper.appendChild(gameWonMenu);

    board.domElement.appendChild(menuWrapper);
}

//The game over handler and new game menu setter
function gameOver(){
    board.gameOver = true;
    let timeDelta = Math.round(100/board.mines);
    
    setBlurBG();

    for (let row = 0; row < board.field.length; row++) {
        for (let column = 0; column < board.field[row].length; column++) {
            const element = board.field[row][column];

            if(element === -1) {
                timeDelta += getRandomRangeInt(5, 10);

                setTimeout(() => {
                    let cell = document.querySelector("[node='"+ row + ":" + column + "']");
                    cell.className = "cell mine";
                }, timeDelta);
            }
        }
    }

    let menuWrapper = document.createElement('div');
    menuWrapper.className = "game-menu-wrapper";
    
    let gameOverMenu = document.createElement('div');
    gameOverMenu.className = "game-over-menu";
    
    let menuTitle = document.createElement('div');
    menuTitle.className = "menu-title lose-game";
    menuTitle.innerText = "Game over";
    
    let menuRestartGameOption = document.createElement('div');
    menuRestartGameOption.className = "menu-option restart-game";
    menuRestartGameOption.innerText = "Restart Game";
    menuRestartGameOption.addEventListener('click', restartGameMenuHandler, false);

    let menuNextGameOption = document.createElement('div');
    menuNextGameOption.className = "menu-option next-game";
    menuNextGameOption.innerText = "Next Game";
    menuNextGameOption.addEventListener('click', nextGameMenuHandler, false);
    
    let menuMainOption = document.createElement('div');
    menuMainOption.className = "menu-option exit-game";
    menuMainOption.innerText = "Main Menu";
    menuMainOption.addEventListener('click', mainMenuHandler, false);

    gameOverMenu.appendChild(menuTitle);
    gameOverMenu.appendChild(menuRestartGameOption);
    gameOverMenu.appendChild(menuNextGameOption);
    gameOverMenu.appendChild(menuMainOption);
    
    menuWrapper.appendChild(gameOverMenu);

    board.domElement.appendChild(menuWrapper);
}

function pauseMenu(){
    setBlurBG();
    board.gamePaused = true;

    let menuWrapper = document.createElement('div');
    menuWrapper.className = "game-menu-wrapper";
    
    let gamePauseMenu = document.createElement('div');
    gamePauseMenu.className = "game-pause-menu";
    
    let menuTitle = document.createElement('div');
    menuTitle.className = "menu-title pause-game";
    menuTitle.innerText = "Paused";
    
    let menuRestoreGameOption = document.createElement('div');
    menuRestoreGameOption.className = "menu-option restore-game";
    menuRestoreGameOption.innerText = "Restore Game";
    menuRestoreGameOption.addEventListener('click', restoreGameMenuHandler, false);

    let menuMainOption = document.createElement('div');
    menuMainOption.className = "menu-option exit-game";
    menuMainOption.innerText = "Main Menu";
    menuMainOption.addEventListener('click', mainMenuHandler, false);

    gamePauseMenu.appendChild(menuTitle);
    gamePauseMenu.appendChild(menuRestoreGameOption);
    gamePauseMenu.appendChild(menuMainOption);
    
    menuWrapper.appendChild(gamePauseMenu);

    board.domElement.appendChild(menuWrapper);
}

function mainMenu(){
    setBlurBG();
    board.gamePaused = true;

    let menuWrapper = document.createElement('div');
    menuWrapper.className = "game-menu-wrapper";
    
    let gameMainMenu = document.createElement('div');
    gameMainMenu.className = "game-main-menu";
    
    let menuTitle = document.createElement('div');
    menuTitle.className = "menu-title main-menu";
    menuTitle.innerText = "Minesweeper";
    
    let menuNewGameOption = document.createElement('div');
    menuNewGameOption.className = "menu-option new-game";
    menuNewGameOption.innerText = "New Game";
    menuNewGameOption.addEventListener('click', newGameMenuHandler, false);

    let menuLoadGameOption = document.createElement('div');
    menuLoadGameOption.className = "menu-option load-game";
    menuLoadGameOption.innerText = "Load Game";
    menuLoadGameOption.addEventListener('click', loadGameMenuHandler, false);
    
    let menuSettingsOption = document.createElement('div');
    menuSettingsOption.className = "menu-option game-settigns";
    menuSettingsOption.innerText = "Settings";
    menuSettingsOption.addEventListener('click', settingsMenuHandler, false);

    gameMainMenu.appendChild(menuTitle);
    gameMainMenu.appendChild(menuNewGameOption);
    gameMainMenu.appendChild(menuLoadGameOption);
    gameMainMenu.appendChild(menuSettingsOption);
    
    menuWrapper.appendChild(gameMainMenu);

    board.domElement.appendChild(menuWrapper);
}

function setBlurBG(){
    let cells = document.querySelectorAll('.cell');

    cells.forEach((element) => {
        element.classList.add("blur");
    });
}

function removeBlurBG(){
    let cells = document.querySelectorAll('.cell');

    cells.forEach((element) => {
        element.classList.remove("blur");
    });
}

function removeMenu(){
    let currentMenu = document.querySelector('.game-menu-wrapper');
    board.domElement.removeChild(currentMenu);
}

function disposeBoard(){
    //let ownObj = document.getElementById(board.ID);
    board.domElement.removeEventListener("contextmenu", contextMSHandler, false);
    window.removeEventListener("resize", resizeMSHandler, false);

    for (let row = 0; row < board.field.length; row++) {
        for (let column = 0; column < board.field[row].length; column++) {
            let element = document.querySelector("[node='"+ row + ":" + column + "']");
            element.removeEventListener('mouseup', clickMSHandler, false);
        }
    }
}

//==============================================================
//                      SUPPORTIVE FUNCTIONS
//==============================================================

//Debouce function wrapper
//It's reserved for future use
function debounce(func, timeout = 300){
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this, args);
        }, timeout);
    };
}

function errorLog(msg){
    console.log('ERROR: ' + msg);
}

function warningLog(msg){
    console.log('Warning: ' + msg);
}

function getRandomInt(max = 100){
    return Math.floor(Math.random() * max);
}

function getRandomRangeInt(min, max){
    let result = -1;

    if(min === max) return min;

    while(result < min || result > max) {
        result = getRandomInt(max);
    }

    return result;
}

//==============================================================
//                          EVENT HANDLERS
//==============================================================
function clickMSHandler(e){
    if(board.gameOver || board.winCondition){
        return;
    }

    e.preventDefault();
    e.stopPropagation();

    if(typeof e === 'object'){
        switch(e.button){
            case 0: //left mouse button click
                openCell(this);
            break;

            case 1: //middle mouse button click
                pauseMenu(this);
            break;

            case 2: //right mouse button click
                setupFlag(this);
            break;

            default: //no action otherwise
                return;
        }
    }
}

function nextGameMenuHandler(e){
    setTimeout(() => {
        disposeBoard(); 
        nextGame(board);
    }, 200);
}

function restartGameMenuHandler(e){
    setTimeout(() => {
        disposeBoard();       
        restartGame(board);
    }, 200);
}

function restoreGameMenuHandler(e){
    setTimeout(() => {
        removeMenu();
        removeBlurBG();
        board.gamePaused = false;
    }, 200);
}

function mainMenuHandler(e){
    setTimeout(() => {
        removeMenu()
        mainMenu();
    }, 200);
}

function newGameMenuHandler(e){
    setTimeout(() => {
        disposeBoard();       
        newGame(board);
    }, 200);

}

function loadGameMenuHandler(e){
    console.log('Load game');
}

function settingsMenuHandler(e){
    console.log('Settings menu');
}

//disable the context menu of [this] Element
function contextMSHandler(e){
    e.preventDefault();
    e.stopPropagation();

    return false;
}

function resizeMSHandler(e){
    clearTimeout(docViewProperties.resizeTimer);
    docViewProperties.resizeTimer = setTimeout(() => {
        UpdateOverlay(board.domElement, board, true);
        }, 100);
}