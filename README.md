# Minesweeper Game Module

I started this project as a private repository just to test the ES6 modules. Finally it turned into a Minesweeper minigame module. ES6 modules are a safe way to add new functionality to any project, because the module scope remains isolated from the core code. The main project idea is to make it cross platform and well supported on any screen modes (portrait or album) and resolutions.

## Contents
* Initialization
* Game Modes
* Game Events
* Audio Files
* Default Colors
* Local Storage
* Todo
* License & Copyright

## Initialization

Minesweeper module components can be imported to any Web project via ES6 import operator:

```javascript
import {Board, gameMode, newGame} from './path-to/minesweeper-mod.js';
```

where './path-to' is a relative path to the module file from the respective .js file.

There are next available in game entities (classes, objects, data structures, variables) for importing: `Board`, `gameMode`, `newGame`, `nextGame`, `restartGame`, `audioFiles`, `colorFiles`. All are explained in the below sections.

At least 3 module entities should be imported to initialize a default game: `Board`, `gameMode` and `newGame`. For example,

```javascript
//[app.js] file
import {Board, gameMode, newGame} from './path-to/minesweeper-mod.js';
const board = new Board("ms-game", gameMode.EASY_MODE);
newGame(board);
```

The game object should be anchored to a block HTML tag. But the best way to do this is to put it into a Flexbox or CSS Grid cell.

```html
//[index.html] file
<head>
    <link rel="stylesheet" href="./path-to/styles/mod-styles.css">
</head>
<body>
    <div id="ms-game" class="minesweeper"></div>

    <script defer type="module" src="./path-to/app.js"></script>
</body>
```

**Note**. Game container must have a `"minesweeper"` class and the document `<head>` tag must contain the `link` element to the module styles.

Where `gameMode.EASY_MODE` initializes a params object (easy game mode) for a new game object (board), `"ms-game"` is an external DOM id block. The `newGame(board)` function initializes game styles and renders the game object. The board object represents the abstract game model, which can be started as `newGame(board)`, `nextGame(board)` and `restartGame(board)`. Where:
1. `newGame(board)` - creates a new game with some random parameters.
2. `restartGame(board)` - restarts the game with the same parameters.
3. `nextGame(board)` - restarts the game with increased difficulty.

**Important**. The module can be cloned to any local project directory like `modules` or `lib`. The `minesweeper-config.json` file should be created in the project root directory, to enable all module functionality, like:

```json
{"path" : "./module"} or {"path": "./lib"} 
```

where `path` is the relative path to the root game module folder (from project root directory). Without the respective configuration file, the module will also work.

## Game Modes

There are 5 available game modes, which are constant properties of `gameMode` object:
1. Easy game mode: `gameMode.EASY_MODE`. 
2. Normal: `gameMode.NORMAL_MODE`.
3. Hard: `gameMode.HARD_MODE`.
4. Random: `gameMode.RANDOM_MODE`.
5. Custom: `gameMode.CUSTOM_MODE`.

The properties can be refreshed by next methods respectively: `getEasyMode()`, `getNormalMode()`, `getHardMode()`, `getCustomMode(gameSettings)`, `getRandomMode()`.

The custom game mode sholud be initialized with the game settings parameters:

```javascript
//default settings
const gameSettings = {
        isDefaultDifficulty = false,
        difficulty = 100, //range: 100..1300
        isDefaultColor = false,
        cellColor = {r: 71, g: 92, b: 108}, //any rgb
        cellStyle = 'Square', //['Square', 'Rounded', 'Circle']
        sounds = 'On' //['On', 'Off']  
}
gameMode.setCustomMode(gameSettings);
const board = new Board("ms-game", gameMode.CUSTOM_MODE);
```

The above `gameMode.CUSTOM_MODE` will contain the respective 'default' parameters. Otherwise, the game settings can be tuned via in game Settings menu (after enabling cookies on the page). If cookies should be disabled on the page by any reasons, the pre-defined settings is a way to set game settigns without in game Settings menu.

## Game Events

The board object is the publisher of the custom game events. These events can be used by 3rd party developers to update UI. There are 3 different in game custom events:
1. *Flag Event*. Is triggered every time when the flag counter is changed in game.
This event can be tracked by the next event listener:

```javascript
board.domElement.addEventListener('ms-flags', flagHandler, false);
function flagHandler(e){
    const flags = e.detail.flags;
    //update UI
    ...
}
```

2. *Mine Event*. Is triggered every time when the mine counter is changed in game.
This event can be tracked by the next event listener:

```javascript
board.domElement.addEventListener('ms-mines', mineHandler, false);
function mineHandler(e){
    const mines = e.detail.mines;
    //update UI
    ...
}
```

3. *Timer Event*. Is triggered every time when the timer counter is incresed by one second in game. This event can be tracked by the next event listener:

```javascript
board.domElement.addEventListener('ms-timer', updateTimerHandler, false);
function updateTimerHandler(e){
    const timer = e.detail.timer;
    //update UI
    ...
}
```

## Audio Files

Audio files are stored in a `Map(key, {file: 'file-path'})` data structure. Supported keys are: 'click', 'open-cell' and 'drop-flag'. To change the default sound effects use this code:

```javascript
import {audioFiles} from './path-to/minesweeper-mod.js';

audioFiles.delete('click');
audioFiles.set('click', {file: 'path/to/your/sounds.mp3'});
```

## Default Colors

Default colors are stored in a `Map(key, {r: xxx, g: yyy, b: zzz})` data structure. To change the default colors use this code before the board initialization (`new Board()`):

```javascript
import {cellColors} from './path-to/minesweeper-mod.js';

cellColors.delete('Blue');
cellColors.set('Blue', {r: 165, g: 181, b: 193});
gameMode.updateMode();
```

To set only one color:

```javascript
Array.from(cellColors.keys()).forEach((key) => {
    cellColors.delete(key);
});
cellColors.set('My-Color', {r: 11, g: 111, b: 211}); //bright blue color
gameMode.updateMode();

const board = new Board("ms-game", gameMode.EASY_MODE);
```

## Local Storage

User defined app settings are stored in the browser's domain `localStorage`. This module doesn't save any user data like tokens, IP etc. The module stores only app configuration data and only on local machine. The feature is enabled by default. To disable this functionality, `storage` should be disabled via internal game options (Main Menu -> About -> Local Storage) or via external object property (3rd party UI):

```javascript
board.storage.enableStorage();
```

To disable storage:

```javascript
board.storage.disableStorage();
```

*Note*. If the module code is modified in a way which collects some user data and sends it to the server, it's important to inform users that this page is using cookies. The 'cookies' can be disabled by disabling the Local Storage. Learn more about it on [CookieLaw](https://www.cookielaw.org/) site.

## Todo
* Bug fixes
* Mobile device support
* Localization

# License & Copyright

[GPLv2](LICENSE)

Copyright (c) 2021 Yuri Un


