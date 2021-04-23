import {Board, gameMode, newGame} from './minesweeper-mod.js';

let board = new Board("minesweeper", gameMode.TEST_MODE);
newGame(board);