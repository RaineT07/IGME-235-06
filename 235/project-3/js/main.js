"use strict";
//variables
const cellWidth = 32;
const cellSpacing = 0;
const container = document.querySelector('#map-container');
const cells = [];
const map = [];


//keyboard inputs
const keyboard = Object.freeze({
    SHIFT: 16, //attack
    SPACE: 32, //use item
    E: 69, //interact
    LEFT: 37, //left
	UP: 38, //right
	RIGHT: 39, //up
	DOWN: 40 //down
});

//possible tiles
const worldTile = Object.freeze({
    FLOOR: 0,
    WALL: 1,
    DOOR: 2,
    WATER: 3,
    GRASS: 4

});

//level data
let levelMap = 
[
    [9]
]; //we need this later when we want to build a map
let currentLevel = 9;
let currentLevelX = 0;
let currentLevelY=0;
let currentGameWorld = undefined; // 2d Array for the tiles
let currentGameObjects = undefined; //1d array for the interactibles on screen

//sound effects
let wallAudio = undefined;
let waterAudio = undefined;
let doorAudio = undefined;

//player!
const player = Object.seal({
    x:-1,
    y:-1,
    element: undefined,
    moveRight(){
        this.x++;
    },
    moveDown(){
        this.y++;
    },
    moveLeft(){
        this.x--;
    },
    moveUp(){
        this.y--;
    },
    currentItem:undefined,
    interact:undefined,
    attack:undefined,
    useItem:undefined,
});

window.onload = () =>{
    currentGameWorld = MapList["world"+currentLevel];
    let numCols = currentGameWorld[0].length;
    let numRows = currentGameWorld.length;
    createGridElements(numRows,numCols);
    drawGrid(currentGameWorld);
    loadLevel(currentLevel, 1,1);
    drawGameObjects(currentGameObjects);
    // console.log("number of spans: " + document.querySelectorAll('span.cell').length);
    wallAudio = document.querySelector("#wallAudio");
    wallAudio.volume = 0.6;
    waterAudio = document.querySelector("#waterAudio");
    waterAudio.volume = 0.6;
    doorAudio = document.querySelector("#doorAudio");
    doorAudio.volume = 0.6;
    setupEvents();
}

function createGridElements(numRows, numCols){
    const span = document.createElement('span');
    span.className = 'cell';
    for(let row=0; row<numRows;row++){
        cells.push([]);
        for(let col=0;col<numCols;col++){
            let cell = span.cloneNode();
            cell.style.left = `${col * (cellWidth+cellSpacing)}px`;
            cell.style.top = `${row * (cellWidth+cellSpacing)}px`;
            container.appendChild(cell);
            cells[row][col] = cell;
        }
    }
}

function loadLevel(levelNum = 9, playerX, playerY){
    //setup 
    currentGameObjects = [];
    const node = document.createElement("span");
    node.className = "gameObject";

    //player
    player.x = playerX;
    player.y = playerY;
    player.element = node.cloneNode(true);
    player.element.classList.add("player");
    container.appendChild(player.element);

    //other objects
    const levelObjects = levelObjectList["level" + levelNum]

    //add this level's objects
    for(let obj of levelObjects){
        const clone = Object.assign({}, obj);
        clone.element = node.cloneNode(true);
        clone.element.classList.add(obj.className);
        currentGameObjects.push(clone);
        container.appendChild(clone.element);
    }
}

function resetGrid(numRows, numCols){

    let cellSpans = document.querySelectorAll("span.cell");
    for(let cell of cellSpans){
        container.removeChild(cell);
    }
}

function drawGrid(array){
    const numCols = array[0].length;
    const numRows = array.length;
    for(let row=0; row<numRows;row++){
        for(let col=0; col<numCols;col++){
            const tile = array[row][col];
            const element = cells[row][col];
            switch(tile){
                case worldTile.FLOOR:
                    element.classList.add("floor");
                    break;
                
                case worldTile.WALL:
                    element.classList.add("wall");
                    break;
                
                case worldTile.DOOR:
                    element.classList.add("door");
                    break;
                
                case worldTile.WATER:
                    element.classList.add("water");
                    break;

                case worldTile.GRASS:
                    element.classList.add("grass");
                    break;
            }
        }
    }
}

function removeGameObjects(array){
    //player
    player.element.remove();

    //game object
    for(let gameObject of array){
        gameObject.element.remove();
    }
}



function drawGameObjects(array){

    //player
    player.element.style.left = `${player.x * (cellWidth + cellSpacing)}px`;
    player.element.style.top = `${player.y * (cellWidth + cellSpacing)}px`;

    //game object
    for(let gameObject of array){
        gameObject.element.style.left = `${gameObject.x * (cellWidth + cellSpacing)}px`;
        gameObject.element.style.top = `${gameObject.y * (cellWidth + cellSpacing)}px`;
    }

}

function playerAction(e){
    let nextX;
    let nextY;
    switch(e.keyCode){
        case keyboard.RIGHT:
            // console.log('right');
            nextX = player.x + 1;
            nextY = player.y;
            if(checkIsLegalMove(nextX, nextY)) player.moveRight();
            break;

        case keyboard.DOWN:
            // console.log('down');
            nextX = player.x;
            nextY = player.y + 1;
            if(checkIsLegalMove(nextX,nextY)) player.moveDown();
            break;

        case keyboard.LEFT:
            // console.log('Left');
            nextX = player.x - 1;
            nextY = player.y;
            if(checkIsLegalMove(nextX,nextY)) player.moveLeft();
            break;

        case keyboard.UP:
            // console.log('up');
            nextX = player.x;
            nextY = player.y - 1;
            if(checkIsLegalMove(nextX,nextY)) player.moveUp();
            break;
    }

    function checkIsLegalMove(nextX, nextY){
        // console.log("is legal?");
        try{
            let nextTile = currentGameWorld[nextY][nextX];
            // console.log("next Tile: " + nextTile);
            if(nextTile != worldTile.WATER && nextTile != worldTile.WALL & nextTile != undefined){
                // console.log("yes, is legal!");
                // console.log(nextTile);
                return true;
            }else if(nextTile==worldTile.DOOR){
                // console.log("no, it's not legal.");
                // console.log(player.x + ", " + player.y);
            }else{
                if(nextTile == worldTile.WALL){
                    wallAudio.play();
                }
                if(nextTile == worldTile.WATER){
                    waterAudio.play();
                }
                return false;
            }
        }
        catch{}
    }
}

function setupEvents(){
    window.onmouseup = (e) =>{
        e.preventDefault();
        gridClicked(e);
    };

    window.onkeydown = (e) =>{
        var char = String.fromCharCode(e.keyCode);
        // console.log(char);
        if(char == " " && currentGameWorld[player.y][player.x] == 2){
            // console.log("door activated!");
            doorAudio.play();
            LevelChange();
        }
        playerAction(e);
        drawGameObjects(currentGameObjects);
    };
}

function gridClicked(e){
    try{
        let rect = container.getBoundingClientRect();
        let mouseX = e.clientX - rect.x;
        let mouseY = e.clientY - rect.y;
        let columnWidth = cellWidth+cellSpacing;
        let col = Math.floor(mouseX/columnWidth);
        let row = Math.floor(mouseY/columnWidth);
        let selectedCell = cells[row][col];
        
        console.log(`${col},${row}`);
    }
    catch{
        console.log("click was out of bounds");
    }
    
}

function LevelChange(){
        let doorEntered = "";
        if(player.x==0){
            console.log("left door hit");
            currentLevel = levelMap[currentLevelY][currentLevelX-1];
            if(currentLevelX!=0){
                currentLevelX--;
            }
            doorEntered = "l";
        }else if(player.y==0){
            console.log("top door hit");
            try{currentLevel = levelMap[currentLevelY-1][currentLevelX];}
            catch{ currentLevel = undefined;}
            if(currentLevelY != 0){
                currentLevelY--;
            }
            doorEntered = "t";
        }else if(player.x==29){
            console.log("right door hit");
            currentLevel = levelMap[currentLevelY][currentLevelX+1];
            currentLevelX++;
            doorEntered = "r";
        }else if(player.y==19){
            console.log("bottom door hit");
            try{currentLevel = levelMap[currentLevelY+1][currentLevelX];}
            catch{currentLevel = undefined;}
            currentLevelY++;
            doorEntered = "b";
        }
        console.log(currentLevel);
        if(currentLevel==undefined || currentLevel==0){MakeNewLevel(doorEntered);}
        else{
            currentGameWorld = MapList["world" + currentLevel];
            displayLevel(currentLevel);
        }
    console.log(levelMap);
}

function MakeNewLevel(doorEntered){
    // console.log("new level being made");
    let randLevel = Math.floor(Math.random() * (4 - 1 + 1)) + 1;
    if(currentLevel==0){
        currentLevel = randLevel;
        currentGameWorld = MapList["world" + currentLevel];
        levelMap[currentLevelY][currentLevelX] = currentLevel;
        displayLevel(currentLevel);
    }
    else
    {
        currentLevel = randLevel;
        currentGameWorld = MapList["world" + currentLevel];
        if(doorEntered =="l"){
            levelMap[currentLevelY].unshift(currentLevel);
            currentLevelX = 0;
        }
        if(doorEntered =="r"){
            levelMap[currentLevelY].push(currentLevel);

        }
        if(doorEntered == "t"){
            levelMap.unshift([]);
            levelMap[0].push(currentLevel);
        }
        if(doorEntered == "b"){
            levelMap.push([]);
            levelMap[currentLevelY].push(currentLevel);
        }
        displayLevel(currentLevel);
        SquareMap(doorEntered);
    } 
}

function SquareMap(doorEntered){
    let LargestX = 0;
    for(let level of levelMap){
        if(level.length > LargestX) {LargestX = level.length;}
    }
    if(doorEntered == "t" || doorEntered == "b"){
        if(LargestX!=1){     
            for(let i=0;i<levelMap.length;i++){
                let addX = 0;
                while(levelMap[i].length < LargestX){
                    if(addX<currentLevelX){
                        levelMap[i].unshift(0);
                    }else{}
                    if(addX>currentLevelX){
                        levelMap[i].push(0);
                    }
                    addX++;
                }
            }
        }
    }
    if(doorEntered == "l" || doorEntered == "r"){
        if(levelMap.length!=1){
            for(let i=0;i<levelMap.length;i++){
                while(levelMap[i].length < LargestX){
                    if(doorEntered == "l"){levelMap[i].unshift(0);}
                    if(doorEntered == "r"){levelMap[i].push(0);}
                }
            }
        }
    }
}

function displayLevel(currentLevel){
    let numRows = currentGameWorld.length;
    let numCols = currentGameWorld[currentLevelY].length;
    removeGameObjects(currentGameObjects);
    resetGrid(numRows, numCols);
    createGridElements(numRows, numCols);
    drawGrid(currentGameWorld);
    loadLevel(currentLevel, player.x, player.y);
    drawGameObjects(currentGameObjects);
    // console.log("number of spans: " + document.querySelectorAll('span.cell').length);
}
