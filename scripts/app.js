import {createBoard} from './minesweeper-mod.js';

let b = createBoard(5, 5, 5);

console.table(b);
console.log(Math.floor(Math.random()*100));