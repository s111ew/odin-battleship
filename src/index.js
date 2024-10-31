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

      let oppositePlayer = this.name === "Player" ? "Computer" : "Player";

      if (hitShip) {
        hitShip.increaseHits();

        if (hitShip.isSunk()) {
          const index = this.ships.indexOf(hitShip);
          this.ships.splice(index, 1);
        }

        this.hitLocations.push(location);

        renderHit(this.name, location, true);

        renderTextUpdate(`${oppositePlayer} fires and hits!`);

        return true;
      }

      renderHit(this.name, location, false);

      renderTextUpdate(`${oppositePlayer} fires and misses...`);

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
  let activePlayer = name === "Player" ? "player" : "cpu";

  const cells = document.querySelectorAll(`.${activePlayer}-grid > div`);

  if (!wasHit) {
    cells[index].classList.add("miss");
  }

  if (wasHit) {
    cells[index].classList.add("hit");
    renderFire(cells[index]);
  }
};

const renderFire = (cell) => {
  let parentCell = cell;

  const fire = document.createElement("div");
  fire.classList.add("fire");

  const flames = document.createElement("div");
  flames.classList.add("flames");
  fire.appendChild(flames);

  for (let i = 0; i <= 4; i++) {
    let flame = document.createElement("div");
    flame.classList.add("flame");
    flames.appendChild(flame);
  }

  parentCell.appendChild(fire);
};

const generateGrids = () => {
  const main = document.querySelector("main");

  const gridContainer = document.createElement("div");
  gridContainer.classList.add("grid-container");

  const playerGridContainer = document.createElement("div");
  playerGridContainer.classList.add("grid");
  playerGridContainer.classList.add("player-grid");
  gridContainer.appendChild(playerGridContainer);

  const cpuGridContainer = document.createElement("div");
  cpuGridContainer.classList.add("grid");
  cpuGridContainer.classList.add("cpu-grid");
  gridContainer.appendChild(cpuGridContainer);

  let gridContainers = [playerGridContainer, cpuGridContainer];

  gridContainers.forEach((gridContainer) => {
    for (let i = 0; i < ROW_SIZE * ROW_SIZE; i++) {
      const gridCell = document.createElement("div");
      gridCell.classList.add("cell");
      gridContainer.appendChild(gridCell);
    }
  });

  main.appendChild(gridContainer);
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
  const main = document.createElement("main");
  const body = document.querySelector("body");
  body.appendChild(main);

  generateGrids();
  renderPlayerInfoBoxes();
  const playerBoard = createGameBoard("Player");
  playerBoard.generateShips();

  const cpuBoard = createGameBoard("Computer");
  cpuBoard.generateShips();

  let boards = [playerBoard, cpuBoard];

  renderPlayerShips(boards);
  addEventListenersToCpuBoard(boards);

  renderTextUpdate("> Player's turn to fire");
  passTurn();
  makeCpuBoardClickable();
};

const renderPlayerInfoBoxes = () => {
  const main = document.querySelector("main");

  const infoBoxContainer = document.createElement("div");
  infoBoxContainer.classList.add("info-container");

  const playerInfoBox = document.createElement("div");
  playerInfoBox.classList.add("player-info");

  const playerName = document.createElement("span");
  playerName.classList.add("player-name");
  playerName.textContent = "Player";

  playerInfoBox.appendChild(playerName);

  const cpuInfoBox = document.createElement("div");
  cpuInfoBox.classList.add("cpu-info");

  const cpuName = document.createElement("span");
  cpuName.classList.add("cpu-name");
  cpuName.textContent = "CPU";

  cpuInfoBox.appendChild(cpuName);

  infoBoxContainer.appendChild(playerInfoBox);
  infoBoxContainer.appendChild(cpuInfoBox);

  main.insertBefore(infoBoxContainer, main.firstChild);
};

const renderPlayerShips = (boards) => {
  const playerBoard = boards[0];

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
    cell.addEventListener("click", (event) => {
      handleClickEvent(index, boards, event);
    });
  });
};

const handleClickEvent = (index, boards, event) => {
  if (event.target.classList.contains("miss")) {
    return;
  }
  if (turn === "player") {
    let cpuBoard = boards[1];
    if (cpuBoard.hitLocations.includes(index)) {
      return;
    }
    const hit = cpuBoard.receiveHit(index);
    if (boards[1].hasLost()) {
      endGame(boards[0]);
      return;
    }

    if (!hit) {
      makeCpuBoardUnlickable();
      renderTextUpdate("> Computer's turn to fire");
      turn = "cpu";
      passTurn();
      cpuTurn(boards);
    }
  }
};

const endGame = (winningBoard) => {
  renderTextUpdate(`${winningBoard.name} has won!`);

  const cpuBoardCells = document.querySelectorAll(".cpu-grid > div");
  cpuBoardCells.forEach((cell) => {
    const clonedCell = cell.cloneNode(true);
    cell.replaceWith(clonedCell);
  });

  renderTextUpdate(" ");
  renderTextUpdate("Press [Enter] to play again");

  initialiseRestart();
};

const makeCpuBoardUnlickable = () => {
  const cpuBoardCells = document.querySelectorAll(".cpu-grid > div");
  cpuBoardCells.forEach((cell) => {
    if (cell.classList.contains("clickable")) {
      cell.classList.remove("clickable");
    }
  });
};

const makeCpuBoardClickable = () => {
  const cpuBoardCells = document.querySelectorAll(".cpu-grid > div");
  cpuBoardCells.forEach((cell) => {
    if (!cell.classList.contains("clickable")) {
      cell.classList.add("clickable");
    }
  });
};

const initialiseRestart = () => {
  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      restartGame();
      document.removeEventListener("keydown", onKeyDown);
    }
  };

  document.addEventListener("keydown", onKeyDown);
};

const restartGame = () => {
  const main = document.querySelector("main");
  main.innerHTML = "";

  generateGrids();
  renderPlayerInfoBoxes();
  const playerBoard = createGameBoard("Player");
  playerBoard.generateShips();

  const cpuBoard = createGameBoard("Computer");
  cpuBoard.generateShips();

  let boards = [playerBoard, cpuBoard];

  renderPlayerShips(boards);
  addEventListenersToCpuBoard(boards);

  turn = "player";
  passTurn();
  makeCpuBoardClickable();

  renderTextUpdate("> Player's turn to fire");
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
    renderTextUpdate("> Player's turn to fire");
    makeCpuBoardClickable();
    turn = "player";
    passTurn();
  }, 1000);
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

const renderTextUpdate = (message) => {
  const textBox = document.querySelector(".textbox");
  const messages = document.querySelectorAll(".textbox > span");

  messages[0].remove();

  const newMessage = document.createElement("span");
  newMessage.textContent = message;

  textBox.appendChild(newMessage);
};

const addMouseListeners = () => {
  const coords = document.querySelector(".coords");
  window.addEventListener("mousemove", function (event) {
    const x = ((event.clientX * event.clientX) / 10000).toString().slice(0, 6);
    const y = ((event.clientY * event.clientY) / 10000).toString().slice(0, 6);
    coords.textContent = `${x}, ${y}`;
  });
};

const liveDate = () => {
  setInterval(() => {
    const date = document.querySelector(".datetime");

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const formattedTime = `${hours}:${minutes}:${seconds}`;

    date.textContent = formattedTime;
  }, 1000);
};

const passTurn = () => {
  const playerName = document.querySelector(".player-name");
  const cpuName = document.querySelector(".cpu-name");

  if (turn === "player") {
    cpuName.classList.remove("bordered");
    playerName.classList.add("bordered");
  } else {
    playerName.classList.remove("bordered");
    cpuName.classList.add("bordered");
  }
};

window.onload = () => {
  addMouseListeners();
  liveDate();
  initialiseStart();
};
