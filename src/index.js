import "./style.css";
import carrier from "./img/carrier.svg";
import battleship from "./img/battleship.svg";
import destroyer from "./img/destroyer.svg";
import submarine from "./img/submarine.svg";
import patrolBoat from "./img/speed-boat.svg";

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

    potentialTargets: [],

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
        locationArray[i] =
          randomLocation + (orientation === "V" ? i * ROW_SIZE : i);
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
      const rowEnd = Math.max(...filtered) + (ROW_SIZE - 1);

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

    addAdjacentCells(hitLocation) {
      const adjacentOffsets = [-1, 1, -ROW_SIZE, ROW_SIZE];

      adjacentOffsets.forEach((offset) => {
        const adjacentLocation = hitLocation + offset;

        if (
          adjacentLocation >= 0 &&
          adjacentLocation < ROW_SIZE * ROW_SIZE &&
          !this.hitLocations.includes(adjacentLocation) &&
          !this.potentialTargets.includes(adjacentLocation) &&
          this.isValidAdjacent(hitLocation, adjacentLocation)
        ) {
          this.potentialTargets.push(adjacentLocation);
        }
      });
    },

    isValidAdjacent(hitLocation, adjacentLocation) {
      const hitRow = Math.floor(hitLocation / ROW_SIZE);
      const adjacentRow = Math.floor(adjacentLocation / ROW_SIZE);

      if (Math.abs(hitLocation - adjacentLocation) === 1) {
        return hitRow === adjacentRow;
      }
      return true;
    },
  };
};

const renderHit = (name, index, wasHit) => {
  const cells = document.querySelectorAll(`.${name}-grid > div`);

  const classToAdd = wasHit ? "hit" : "miss";

  const possibleShipClasses = ["c", "d", "b", "s", "p"];

  if (wasHit) {
    possibleShipClasses.forEach((shipClass) => {
      if (cells[index].classList.contains(shipClass)) {
        cells[index].classList.remove(shipClass);
      }
    });
  }

  cells[index].classList.add(classToAdd);
};

const generateGrids = () => {
  const main = document.querySelector("main");

  const playerGridContainer = document.createElement("div");
  playerGridContainer.classList.add("grid");
  playerGridContainer.classList.add("player-grid");
  main.appendChild(playerGridContainer);

  const cpuGridContainer = document.createElement("div");
  cpuGridContainer.classList.add("grid");
  cpuGridContainer.classList.add("cpu-grid");
  main.appendChild(cpuGridContainer);

  let gridContainers = [playerGridContainer, cpuGridContainer];

  gridContainers.forEach((gridContainer) => {
    for (let i = 0; i < ROW_SIZE * ROW_SIZE; i++) {
      const gridCell = document.createElement("div");
      gridCell.classList.add("cell");
      gridContainer.appendChild(gridCell);
    }
  });
};

const initialiseStart = () => {
  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      startGame();
      document.removeEventListener("keydown", onKeyDown);
    }
  };

  document.addEventListener("keydown", onKeyDown);
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

  playerBoard.ships.forEach((ship) => {
    let startingCell = ship.location[0];
    let isHorizontal = startingCell + 1 === ship.location[1];

    if (isHorizontal) {
      placeShipSvg(startingCell, ship.shipID, true);
    } else {
      placeShipSvg(startingCell, ship.shipID, false);
    }
  });
};

const placeShipSvg = (startingPosition, shipID, isHorizontal) => {
  const playerGrid = document.querySelectorAll(".player-grid > div");
  const cellToPlaceShip = playerGrid[startingPosition];

  const shipSvg = document.createElement("img");
  shipSvg.classList.add("boat-img");

  switch (shipID) {
    case "c":
      shipSvg.src = carrier;
      break;
    case "b":
      shipSvg.src = battleship;
      break;
    case "d":
      shipSvg.src = destroyer;
      break;
    case "s":
      shipSvg.src = submarine;
      break;
    case "p":
      shipSvg.src = patrolBoat;
      break;
  }

  if (isHorizontal) {
    shipSvg.classList.add("ship-horizontal");
  }

  cellToPlaceShip.appendChild(shipSvg);
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
  setTimeout(() => {
    const playerBoard = boards[0];

    if (playerBoard.hasLost()) {
      endGame(boards[1]);
      return;
    }

    let hitLocation;

    if (playerBoard.potentialTargets.length > 0) {
      hitLocation = playerBoard.potentialTargets.shift();
    } else {
      hitLocation = findValidHitLocation(playerBoard);
    }

    const hit = playerBoard.receiveHit(hitLocation);

    if (hit) {
      playerBoard.addAdjacentCells(hitLocation);

      if (playerBoard.hasLost()) {
        endGame(boards[1]);
        return;
      }
      return cpuTurn(boards);
    }

    playerBoard.potentialTargets = [];
    turn = "player";
  }, 700);
};

const getRandomLocation = () => {
  return Math.round(Math.random() * (ROW_SIZE * ROW_SIZE - 1));
};

const findValidHitLocation = (board) => {
  let locationToTry;

  do {
    locationToTry = getRandomLocation();
  } while (
    board.hitLocations.includes(locationToTry) ||
    board.potentialTargets.includes(locationToTry)
  );

  return locationToTry;
};

window.onload = () => {
  initialiseStart();
};
