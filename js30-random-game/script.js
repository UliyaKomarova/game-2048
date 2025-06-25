const gameContainer = document.getElementById("gameContainer");
const gameScoreContainer = document.getElementById("gameScore");
const popup = document.getElementById("popup");
const popupMessageContainer = document.querySelector('.popup-message');
const popupWinnerMessage = 'You win!';
const popupLoserMessage = 'Game over!';
const closePopup = document.getElementById("closePopup");
const resultHistoryContainer = document.querySelector('.game__results-history');
const classBlock = "game__block";
const attributeNameCoordinateX = 'data-x';
const attributeNameCoordinateY = 'data-y';
const attributeNameNumber = 'data-number';
const coordinateStep = 25;
const winnerNumber = 2048;
const restartGameButtonClass = 'game__restart-button';
const localStoragePrefix = 'game-score-';
let gameScore = 0;

let cellsArray = [
    [[0, 0, 0], [25, 0, 0], [50, 0, 0], [75, 0, 0]],
    [[0, 25, 0], [25, 25, 0], [50, 25, 0], [75, 25, 0]],
    [[0, 50, 0], [25, 50, 0], [50, 50, 0], [75, 50, 0]],
    [[0, 75, 0], [25, 75, 0], [50, 75, 0], [75, 75, 0]]
];

let availiableCellsArray;
const createAvailiableCellsArray = () => {
    let array = [];

    for (let x = 0; x < cellsArray.length; x++) {
        for (let y = 0; y < cellsArray.length; y++) {
            array.push([x, y]);
        }
    }

    return array;
};
availiableCellsArray = createAvailiableCellsArray();

// let availiableCellsArray = [
//     [0, 0],
//     [0, 1],
//     [0, 2],
//     [0, 3],
//     [1, 0],
//     [1, 1],
//     [1, 2],
//     [1, 3],
//     [2, 0],
//     [2, 1],
//     [2, 2],
//     [2, 3],
//     [3, 0],
//     [3, 1],
//     [3, 2],
//     [3, 3]
// ];


const updateGridArray = (cellIndexes, block = 0) => {
    // cellIndexes must be array, like [0, 2]
    const row = cellIndexes[0];
    const column = cellIndexes[1];
    const cell = cellsArray[row][column];

    if (block) {
        cell[2] = block;
    } else {
        cell[2] = 0;
    }
};

const updateAvailiableCellsArray = (operation, coordinates) => {
    // coordinates must be array, like [0, 2]
    switch (operation) {
        case 'remove':
            for (let i = 0; i < availiableCellsArray.length; i++) {
                if ((availiableCellsArray[i]).toString() === coordinates.toString()) {
                    availiableCellsArray.splice(i, 1)
                }
            }
            break;

        case 'add':
            availiableCellsArray.push(coordinates);
            break;
    }
};

const changeBlockAttribute = (block, attributeName, attributeValue) => {
    block.setAttribute(attributeName, attributeValue);
};

const addNewScore = (score) => {
    let div = document.createElement('div');
    div.innerHTML = score;
    resultHistoryContainer.prepend(div);

    if (resultHistoryContainer.childNodes.length > 10) {
        resultHistoryContainer.removeChild(resultHistoryContainer.lastElementChild);
    }
};

const getLocalStorageScore = () => {
    let localStorageScoreArray = [];
    let key;
    let regexp = /game-score/g;


    if (localStorage.length > 0) {

        for (let i = 0; i < localStorage.length; i++) {
            key = localStorage.key(i);

            if (key.match(regexp)) {
                localStorageScoreArray.push(localStorage.getItem(key));
            }
        }
    }

    return localStorageScoreArray;
};

const addLocalStorageScoreOnPage = () => {
    let localStorageScoreArray = getLocalStorageScore();
    let lastIndex;
    let scoreItem;
    let maxCountLastScores = 10;

    if (localStorageScoreArray.length > 0) {
        lastIndex = localStorageScoreArray.length - 1;

        for (let i = lastIndex; i > (lastIndex - maxCountLastScores); i--) {
            scoreItem = localStorageScoreArray[i];

            if (scoreItem) {
                addNewScore(scoreItem);
            }

        }
    }
};

addLocalStorageScoreOnPage();

const updateGameScore = (mergedNumber) => {
    gameScore = gameScore + mergedNumber;
    gameScoreContainer.innerHTML = gameScore;
};

const preparePopup = (message) => {
    popupMessageContainer.innerHTML = message;
};

const checkToEndGame = (number) => {
    if (number === winnerNumber) {
        preparePopup(popupWinnerMessage);
        document.removeEventListener('keydown', getKeyEvent);
        popup.showModal();
    }
};

const mergeBlockNumber = (block) => {
    let currentNumber = block.getAttribute(attributeNameNumber);
    let mergedNumber = currentNumber * 2;

    block.querySelector('span').innerHTML = mergedNumber;

    updateGameScore(mergedNumber);

    return mergedNumber;
};

const checkFreeCell = (gridArrayIndexes) => {
    // gridArrayIndexes must be array, like [0, 2]
    for (let i = 0; i < availiableCellsArray.length; i++) {
        if (availiableCellsArray[i].toString() === gridArrayIndexes.toString()) {
            return 1;
        } else {
            if (i === availiableCellsArray.length - 1) {
                return 0;
            }
        }
    }
};

const checkAbilityToMerge = (currentBlock, occupiedCellBlock) => {
    return currentBlock.getAttribute(attributeNameNumber) === occupiedCellBlock.getAttribute(attributeNameNumber);
}

const addMergeFlag = (cell) => {
    cell[3] = 'merged';
};

const removeMergedFlag = (cell) => {
    cell.splice(3, 1);
};

const mergeBlocks = (currentBlockIndexes, mergedBlockIndexes) => {
    let currentBlock = cellsArray[currentBlockIndexes[0]][currentBlockIndexes[1]][2];
    let mergedCell = cellsArray[mergedBlockIndexes[0]][mergedBlockIndexes[1]];
    let mergedBlock = mergedCell[2];
    let mergedNumber;

    updateGridArray(currentBlockIndexes);
    updateAvailiableCellsArray('add', currentBlockIndexes);
    currentBlock.remove();

    mergedNumber = mergeBlockNumber(mergedBlock);
    addMergeFlag(mergedCell);
    changeBlockAttribute(mergedBlock, attributeNameNumber, mergedNumber);

    setTimeout(() => checkToEndGame(mergedNumber), 300);
};

const moveBlocksUp = () => {
    let cell;
    let block;
    let newBlockRow;
    let isCellFree;
    let canBeMerged;
    let currentRow;

    for (let row = 0; row < cellsArray.length; row++) {
        currentRow = row;

        for (let column = 0; column < cellsArray.length; column++) {
            cell = cellsArray[row][column];
            block = cell[2];
            currentRow = row;

            if (block) {

                do {
                    newBlockRow = currentRow - 1;
    
                    if (newBlockRow < 0) {
                        break;
                    }
    
                    isCellFree = checkFreeCell([newBlockRow, column]);
    
                    if (isCellFree) {
                        updateGridArray([newBlockRow, column], block);
                        updateAvailiableCellsArray('remove', [newBlockRow, column]);
                        updateGridArray([currentRow, column]);
                        updateAvailiableCellsArray('add', [currentRow, column]);
                        changeBlockAttribute(block, attributeNameCoordinateY, cellsArray[newBlockRow][column][1]);
                        currentRow = newBlockRow;
                    } else {
                        canBeMerged = checkAbilityToMerge(block, cellsArray[newBlockRow][column][2]);
                        isAlreadyMerged = cellsArray[newBlockRow][column][3];

                        if (canBeMerged && !isAlreadyMerged) {
                            mergeBlocks([newBlockRow + 1, column],[newBlockRow, column]);
                        } else {
                            break;
                        }
                    }
                } while (newBlockRow > 0);
            }
        }

    }
};

const moveBlockDown = () => {
    let cell;
    let block;
    let newBlockRow;
    let isCellFree;
    let canBeMerged;
    let currentRow;

    for (let row = (cellsArray.length - 1); row >= 0; row--) {
        currentRow = row;

        for (let column = 0; column < cellsArray.length; column++) {
            cell = cellsArray[row][column];
            block = cell[2];
            currentRow = row;

            if (block) {

                do {
                    newBlockRow = currentRow + 1;
    
                    if (newBlockRow >= cellsArray.length) {
                        break;
                    }
    
                    isCellFree = checkFreeCell([newBlockRow, column]);
    
                    if (isCellFree) {
                        updateGridArray([newBlockRow, column], block);
                        updateAvailiableCellsArray('remove', [newBlockRow, column]);

                        updateGridArray([currentRow, column]);
                        updateAvailiableCellsArray('add', [currentRow, column]);

                        changeBlockAttribute(block, attributeNameCoordinateY, cellsArray[newBlockRow][column][1]);
                        currentRow = newBlockRow;
                    } else {
                        canBeMerged = checkAbilityToMerge(block, cellsArray[newBlockRow][column][2]);
                        isAlreadyMerged = cellsArray[newBlockRow][column][3];

                        if (canBeMerged && !isAlreadyMerged) {
                            mergeBlocks([newBlockRow - 1, column],[newBlockRow, column]);
                        } else {
                            break;
                        }
                    }
                } while (newBlockRow <= cellsArray.length);
            }
        }

    }
};

const moveBlocksRight = () => {
    let cell;
    let block;
    let newBlockColumn;
    let isCellFree;
    let canBeMerged;
    let currentColumn;

    for (let column = (cellsArray.length - 1); column >= 0; column--) {  
        currentColumn = column;  

        for (let row = 0; row < cellsArray.length; row++) {
            cell = cellsArray[row][column];
            block = cell[2];
            currentColumn = column;
            
            if (block) {

                do {
                    newBlockColumn = currentColumn + 1;

                    if (newBlockColumn >= cellsArray.length) {
                        break;
                    }

                    isCellFree = checkFreeCell([row, newBlockColumn]);

                    if (isCellFree) {
                        updateGridArray([row, newBlockColumn], block);
                        updateAvailiableCellsArray('remove', [row, newBlockColumn]);

                        updateGridArray([row, currentColumn]);
                        updateAvailiableCellsArray('add', [row, currentColumn]);

                        changeBlockAttribute(block, attributeNameCoordinateX, cellsArray[row][newBlockColumn][0]);
                        currentColumn = newBlockColumn;
                    } else {
                        canBeMerged = checkAbilityToMerge(block, cellsArray[row][newBlockColumn][2]);
                        isAlreadyMerged = cellsArray[row][newBlockColumn][3];

                        if (canBeMerged && !isAlreadyMerged) {
                            mergeBlocks([row, newBlockColumn - 1],[row, newBlockColumn]);
                        } else {
                            break;
                        }
                    }

                } while (newBlockColumn <= cellsArray.length);

            }

        }

    }
};

const moveBlocksLeft = () => {
    let cell;
    let block;
    let newBlockColumn;
    let isCellFree;
    let canBeMerged;
    let currentColumn;

    for (let column = 0; column < cellsArray.length; column++) {
        currentColumn = column;

        for (let row = 0; row < cellsArray.length; row++) { 
            cell = cellsArray[row][column];
            block = cell[2];
            currentColumn = column;

            if (block) {

                do {
                    newBlockColumn = currentColumn - 1;

                    if (newBlockColumn < 0) {
                        break;
                    }

                    isCellFree = checkFreeCell([row, newBlockColumn]);

                    if (isCellFree) {
                        updateGridArray([row, newBlockColumn], block);
                        updateAvailiableCellsArray('remove', [row, newBlockColumn]);

                        updateGridArray([row, currentColumn]);
                        updateAvailiableCellsArray('add', [row, currentColumn]);

                        changeBlockAttribute(block, attributeNameCoordinateX, cellsArray[row][newBlockColumn][0]);
                        currentColumn = newBlockColumn;
                    } else {
                        canBeMerged = checkAbilityToMerge(block, cellsArray[row][newBlockColumn][2]);
                        isAlreadyMerged = cellsArray[row][newBlockColumn][3];

                        if (canBeMerged && !isAlreadyMerged) {
                            mergeBlocks([row, newBlockColumn + 1],[row, newBlockColumn]);
                        } else {
                            break;
                        }
                    }

                } while (newBlockColumn > 0);

            }

        }

    }

};

const isAvailableStep = () => {
    let cell;
    let nextCell;
    let newIndex;
    let changeIndexArray = [1, -1]

    for (let row = 0; row < cellsArray.length; row++) {
        for (let column = 0; column < cellsArray.length; column++){
            cell = cellsArray[row][column];

            for (let i = 0; i < changeIndexArray.length; i++) {
                newIndex = row + changeIndexArray[i];

                if (newIndex >=0 && newIndex < cellsArray.length) {
                    nextCell = cellsArray[newIndex][column];

                    if (checkAbilityToMerge(cell[2], nextCell[2])) {                       
                        return 1;
                    }
                }

                newIndex = column + changeIndexArray[i];

                if (newIndex >=0 && newIndex < cellsArray.length) {
                    nextCell = cellsArray[row][newIndex];

                    if (checkAbilityToMerge(cell[2], nextCell[2])) {                       
                        return 1;
                    }
                }
            }
        }
    }
};

function getKeyEvent(event) {
    let currentAvailableCellsArray;
    let isLeftAvailableStep;

    if (!(event.code === 'ArrowUp' ||
        event.code === 'ArrowDown' ||
        event.code === 'ArrowRight' ||
        event.code === 'ArrowLeft'
    )) {
        return;
    }

    currentAvailableCellsArray = JSON.stringify(availiableCellsArray);

    switch (event.code) {
        case 'ArrowUp':
            moveBlocksUp();
            break;
        case 'ArrowDown':
            moveBlockDown();
            break;
        case 'ArrowRight':
            moveBlocksRight();
            break;
        case 'ArrowLeft':
            moveBlocksLeft();
            break;
    }

    for (let row = 0; row < cellsArray.length; row++) {
        for (let column = 0; column < cellsArray.length; column++) {
            removeMergedFlag(cellsArray[row][column]);
        }
    }

    if (currentAvailableCellsArray !== JSON.stringify(availiableCellsArray)) {
        setTimeout(() => createNewBlock(), 300);
    }

    if (availiableCellsArray.length === 0) {
        isLeftAvailableStep = isAvailableStep();

        if (!isLeftAvailableStep) {
            preparePopup(popupLoserMessage);
            document.removeEventListener('keydown', getKeyEvent);
            popup.showModal();
        }
    }
};

document.querySelector('.' + restartGameButtonClass).addEventListener('click', () => restartGame());

closePopup.addEventListener('click', function(){
    popup.close();
    restartGame();
});

const getRandomIndex = () => {
    // if (availiableCellsArray.length === 0) {
    //     preparePopup(popupLoserMessage);
    //     document.removeEventListener('keydown', getKeyEvent);
    //     popup.showModal();
    //     return;
    // }

    if (availiableCellsArray.length > 0) {
        return Math.floor(Math.random() * availiableCellsArray.length);
    } else {
        return;
    }
};

const getFreeCell = () => {
    let index = getRandomIndex();
    let availableCellIndexes;
    
    if (index || index === 0) {
        availableCellIndexes = availiableCellsArray[index];
        updateAvailiableCellsArray('remove', availableCellIndexes);
        return availableCellIndexes;
    } else {
        return;
    }
};

const createBlock = (number, coordinateX, coordinateY) => {
    let div = document.createElement('div');
    div.classList.add(classBlock);
    div.setAttribute(attributeNameCoordinateX, coordinateX);
    div.setAttribute(attributeNameCoordinateY, coordinateY);
    div.setAttribute(attributeNameNumber, number);
    div.innerHTML = `<span>${number}</span>`;

    return div;
};

const addBlockOnPage = (html) => {
    gameContainer.appendChild(html);
};

const createNewBlock = (blocksCount = 1) => {
    let numberForBlock = 2;
    let cellIndexes;
    let cell;
    let blockCoordinateX;
    let blockCoordinateY;
    let newBlock;

    for (let i = 0; i < blocksCount; i++) {
        cellIndexes = getFreeCell();

        if (!cellIndexes) {
            return;
        }

        cell = cellsArray[cellIndexes[0]][cellIndexes[1]];
        blockCoordinateX = cell[0];
        blockCoordinateY = cell[1];

        newBlock = createBlock(numberForBlock, blockCoordinateX, blockCoordinateY);

        updateGridArray(cellIndexes, newBlock);
        addBlockOnPage(newBlock);
    }
}

const startGame = () => {
    createNewBlock(2);
    document.addEventListener('keydown', getKeyEvent);
};

startGame();

function restartGame(){
    let localStorageScoreArray = getLocalStorageScore();

    if (gameScore) {
        addNewScore(gameScore);
        localStorage.setItem(`${localStoragePrefix}${localStorageScoreArray.length}`, gameScore);
    }
    gameContainer.innerHTML = '';
    gameScoreContainer.innerHTML = '0';
    gameScore = 0;

    for (let row = 0; row < cellsArray.length; row++) {
        for (let column = 0; column < cellsArray.length; column++) {
            cellsArray[row][column][2] = 0;
        }
    }

    availiableCellsArray = createAvailiableCellsArray();

    startGame();
};
