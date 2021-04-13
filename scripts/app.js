import {initBoard, renderBoard, gameMode} from './minesweeper-mod.js';

let b = initBoard(gameMode.TEST_MODE);
renderBoard("minesweeper", b);

console.table(b.field);

console.log(Math.floor(Math.random()*100));