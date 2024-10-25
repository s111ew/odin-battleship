import "./style.css";

// SHIPS:
// Carrier -> 5
// Battleship -> 4
// Destroyer -> 3
// Submarine -> 3
// Patrol Boat -> 2

// gameBoard = {
// board: [0, 0, 0, 0, 0, 0, 0, 0, 0,
//         0, 0, 1, X, X, 1, 1, 0, 0,
//         0, 0, M, 0, M, 0, 1, 0, 0,
//         0, 0, 0, 0, 0, 0, 1, 0, 0,
//         0, 1, 1, 1, 0, 0, 1, 0, 0,
//         0, 0, 0, 0, 0, 0, 1, 0, 0,
//         0, 0, 0, 1, 1, 1, 0, 0, 0,
//         0, 0, 0, 1, 1, 1, 0, 0, 0,
//         0, 0, 0, 0, 0, 1, 1, 0, 0,],
// ships: [{name: 'Carrier', length: 5, hits: 2, location: [12, 13, 14, 15, 16], isSunk: false},
//         {name: 'Battleship', length: 4, hits: 0, location: [36, 46, 56, 66], isSunk: false},
//         {name: 'Destroyer', length: 3, hits: 0, location: [51, 52, 53], isSunk: false},
//         {name: 'Submarine', length: 3, hits: 0, location: [83, 84, 85], isSunk: false},
//         {name: 'Patrol Boat', length: 2, hits: 0, location: [95, 96], isSunk: false}],
//  }

const ROW_SIZE = 9;

const START_OF_EACH_ROW = Array.from(
  { length: ROW_SIZE },
  (_, i) => i * ROW_SIZE
);

let turn = "player";

const SHIPS = [
  { name: "Carrier", length: 5 },
  { name: "Battleship", length: 4 },
  { name: "Destroyer", length: 3 },
  { name: "Submarine", length: 3 },
  { name: "Patrol Boat", length: 2 },
];

const createShip = (name, length) => {
  return {
    name: name,

    shipID: name.charAt().toLowerCase(),

    length: length,

    hits: 0,

    increaseHits() {
      this.hits++;
    },

    location: [],

    isSunk() {
      return this.length <= this.hits;
    },
  };
};

const createGameBoard = (name) => {
  return {
    name: name,

    board: new Array(ROW_SIZE * ROW_SIZE).fill(0),

    ships: [],

    hitLocations: [],

    hasLost() {
      return this.ships.length === 0;
    },

    generateShips() {
      SHIPS.forEach((ship) => {
        const newShip = createShip(ship.name, ship.length);
        this.generateShipLocation(newShip);
      });
    },

    generateShipLocation(shipObject) {
      const orientation = Math.random() > 0.5 ? "V" : "H";
      const randomLocation = getRandomLocation();
      const locationArray = new Array(shipObject.length);
      locationArray[0] = randomLocation;
      for (let i = 1; i < shipObject.length; i++) {
        locationArray[i] = randomLocation + (orientation === "V" ? i * 9 : i);
      }
      if (!this.isLocationValid(locationArray, this.board, orientation)) {
        return this.generateShipLocation(shipObject);
      }
      this.placeShip(shipObject, locationArray);
    },

    isLocationValid(locationArray, board, orientation) {
      if (orientation === "V") {
        return this.isLocationValidVertical(locationArray, board);
      } else {
        return this.isLocationValidHorizontal(locationArray, board);
      }
    },

    isLocationValidHorizontal(locationArray, board) {
      const locationStart = locationArray[0];
      const filtered = START_OF_EACH_ROW.filter((num) => num <= locationStart);
      const rowEnd = Math.max(...filtered) + 8;

      for (let location of locationArray) {
        if (location > rowEnd || board[location] !== 0) {
          return false;
        }
      }
      return true;
    },

    isLocationValidVertical(locationArray, board) {
      for (let location of locationArray) {
        if (location >= ROW_SIZE * ROW_SIZE || board[location] !== 0) {
          return false;
        }
      }
      return true;
    },

    placeShip(ship, locationArray) {
      for (let location of locationArray) {
        this.board[location] = ship.shipID;
      }
      ship.location = locationArray;
      this.ships.push(ship);
    },

    receiveHit(location) {
      if (this.hitLocations.includes(location)) {
        return;
      }

      const hitShip = this.checkLocation(location, this.ships);

      if (hitShip) {
        hitShip.increaseHits();

        if (hitShip.isSunk()) {
          const index = this.ships.indexOf(hitShip);
          this.ships.splice(index, 1);
        }

        this.hitLocations.push(location);

        renderHit(this.name, location, true);

        return true;
      }

      renderHit(this.name, location, false);

      return false;
    },

    checkLocation(locationToCheck, ships, index = 0) {
      if (index >= ships.length) {
        return null;
      }

      if (ships[index].location.includes(locationToCheck)) {
        return ships[index];
      }

      return this.checkLocation(locationToCheck, ships, index + 1);
    },
  };
};

const renderHit = (name, index, wasHit) => {
  const cells = document.querySelectorAll(`.${name}-grid > div`);

  const classToAdd = wasHit ? "hit" : "miss";

  const possibleShipClasses = ['c', 'd', 'b', 's', 'p']

  if (wasHit) {
    possibleShipClasses.forEach(shipClass => {
      if (cells[index].classList.contains(shipClass)) {
        cells[index].classList.remove(shipClass)
      }
    })
  }

  cells[index].classList.add(classToAdd);
};

const generateGrids = () => {
  const gridContainers = document.querySelectorAll(".grid");

  gridContainers.forEach((gridContainer) => {
    for (let i = 0; i < ROW_SIZE * ROW_SIZE; i++) {
      const gridCell = document.createElement("div");
      gridCell.classList.add("cell");
      gridContainer.appendChild(gridCell);
    }
  });
};

const initialiseStartButton = () => {
  const startButton = document.querySelector(".start");
  startButton.addEventListener("click", () => {
    startButton.remove();
    startGame();
  });
};

const startGame = () => {
  generateGrids();
  const playerBoard = createGameBoard("player");
  playerBoard.generateShips();

  const cpuBoard = createGameBoard("cpu");
  cpuBoard.generateShips();

  let boards = [playerBoard, cpuBoard];

  renderPlayerShips(boards);
  addEventListenersToCpuBoard(boards);
};

const renderPlayerShips = (boards) => {
  const playerBoard = boards[0];

  const playerBoardCells = document.querySelectorAll(".player-grid > div");

  playerBoardCells.forEach((cell, index) => {
    const shipAtLocation = playerBoard.checkLocation(index, playerBoard.ships);
    if (shipAtLocation) {
      cell.classList.add(shipAtLocation.shipID);
    }
  });
};

const addEventListenersToCpuBoard = (boards) => {
  const cpuBoardCells = document.querySelectorAll(".cpu-grid > div");

  cpuBoardCells.forEach((cell, index) => {
    cell.addEventListener("click", () => {
      handleClickEvent(index, boards);
    });
  });
};

const handleClickEvent = (index, boards) => {
  if (turn === "player") {
    let cpuBoard = boards[1];
    const hit = cpuBoard.receiveHit(index);
    if (boards[1].hasLost()) {
      endGame(boards[0]);
      return;
    }

    if (!hit) {
      turn = "cpu";
      cpuTurn(boards);
    }
  }
};

const endGame = (winningBoard) => {
  const main = document.querySelector("main");
  const winningMessage = document.createElement("h1");
  winningMessage.textContent = `${winningBoard.name} has won!`;
  main.appendChild(winningMessage);

  const cpuBoardCells = document.querySelectorAll(".cpu-grid > div");
  cpuBoardCells.forEach((cell) => {
    const clonedCell = cell.cloneNode(true);
    cell.replaceWith(clonedCell);
  });
};

const cpuTurn = (boards) => {
  if (boards[0].hasLost()) {
    endGame(boards[1]);
    return;
  }

  let playerBoard = boards[0];
  let hitLocation = findValidHitLocation(playerBoard);

  const hit = playerBoard.receiveHit(hitLocation);

  if (hit) {
    if (boards[0].hasLost()) {
      endGame(boards[1]);
      return;
    }
    return cpuTurn(boards);
  }

  turn = "player";
};

const getRandomLocation = () => {
  return Math.round(Math.random() * (ROW_SIZE * ROW_SIZE - 1));
};

const findValidHitLocation = (board) => {
  let locationToTry;

  do {
    locationToTry = getRandomLocation();
  } while (board.hitLocations.includes(locationToTry));

  return locationToTry;
};

window.onload = () => {
  initialiseStartButton();
};

// --------------TESTING OUTPUT---------------------------

// function displayBoard(board, chunkSize) {
//   let result = [];

//   for (let i = 0; i < board.length; i += chunkSize) {
//     result.push(board.slice(i, i + chunkSize));
//   }

//   console.table(result);
// }

// const newGameBoard = createGameBoard();
// newGameBoard.generateShips();

// displayBoard(newGameBoard.board, 9);
// console.table(newGameBoard.ships);
