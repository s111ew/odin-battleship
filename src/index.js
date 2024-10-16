// import './style.css'

// SHIPS:
// Carrier -> 5
// Battleship -> 4
// Destroyer -> 3
// Submarine -> 3
// Patrol Boat -> 2

// gameBoard = {
// board: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//         0, 0, 1, X, X, 1, 1, 0, 0, 0,
//         0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
//         0, 0, M, 0, M, 0, 1, 0, 0, 0,
//         0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
//         0, 1, 1, 1, 0, 0, 1, 0, 0, 0,
//         0, 0, 0, 0, 0, 0, 1, 0, 0, 0,
//         0, 0, 0, 1, 1, 1, 0, 0, 0, 0,
//         0, 0, 0, 0, 0, 1, 1, 0, 0, 0],
// ships: [{name: 'Carrier', length: 5, hits: 2, location: [12, 13, 14, 15, 16], isSunk: false},
//         {name: 'Battleship', length: 4, hits: 0, location: [36, 46, 56, 66], isSunk: false},
//         {name: 'Destroyer', length: 3, hits: 0, location: [51, 52, 53], isSunk: false},
//         {name: 'Submarine', length: 3, hits: 0, location: [83, 84, 85], isSunk: false},
//         {name: 'Patrol Boat', length: 2, hits: 0, location: [95, 96], isSunk: false}],
//  }

// ship = {
//  name: 'Carrier',
//  length: 5,
//  hits: 0,
//  getHit: hits++,
//  location: location,
//  isSunk: length === hits,
// }

const ROW_SIZE = 9;
const BOARD_SIZE = ROW_SIZE * ROW_SIZE

const createShip = (name, length, location) => {
  return {
    name: name,
    length: length,
    hits: 0,
    getHit() {
      this.hits++;
    },
    location: location,
    get isSunk() {
      return this.length === this.hits;
    },
    shipID: name[0],
  };
};

const createBoard = (player) => {
  return {
    board: new Array(BOARD_SIZE).fill(0),
    ships: [],

    populateBoardWithShips() {
      this.createCarrier();
      this.createBattleShip();
      this.createDestroyer();
      this.createSubmarine();
      this.createPatrolBoat();
    },

    createCarrier() {
      this.placeShip("Carrier", 5);
    },

    createBattleShip() {
      this.placeShip("Battleship", 4);
    },

    createDestroyer() {
      this.placeShip("Destroyer", 3);
    },

    createSubmarine() {
      this.placeShip("Submarine", 3);
    },

    createPatrolBoat() {
      this.placeShip("Patrol Boat", 2);
    },

    placeShip(name, length) {
      let placed = false;

      while (!placed) {
        const startIndex = Math.floor(Math.random() * BOARD_SIZE);
        const direction = Math.random() < 0.5 ? 'H' : 'V';

        if (this.isValidPosition(startIndex, length, direction)) {
          const shipLocation = this.getShipLocation(startIndex, length, direction);
          const newShip = createShip(name, length, shipLocation);
          this.ships.push(newShip);

          shipLocation.forEach(index => this.board[index] = newShip.shipID);
          placed = true;
        }
      }
    },

    isValidPosition(startIndex, shipLength, direction) {
      if (direction === 'H') {
        const rowStart = Math.floor(startIndex / ROW_SIZE) * ROW_SIZE;
        const rowEnd = rowStart + ROW_SIZE;

        if (startIndex + shipLength > rowEnd) return false;

        for (let i = 0; i < shipLength; i++) {
          if (this.board[startIndex + i] !== 0) return false;
        }
      } else {
        if (startIndex + (shipLength - 1) * ROW_SIZE >= BOARD_SIZE) return false;

        for (let i = 0; i < shipLength; i++) {
          if (this.board[startIndex + i * ROW_SIZE] !== 0) return false;
        }
      }
      return true;
    },

    getShipLocation(startIndex, shipLength, direction) {
      const location = [];
      if (direction === 'H') {
        for (let i = 0; i < shipLength; i++) {
          location.push(startIndex + i);
        }
      } else {
        for (let i = 0; i < shipLength; i++) {
          location.push(startIndex + i * ROW_SIZE);
        }
      }
      return location;
    },

    receiveHit(location) {
      if (this.board[location] === 0) {
        this.board[location] = 'M';
      } else if (this.board[location] === 'M' || this.board[location] === 'X') {
        console.log('Location already hit, please choose another location'); //Player Chooses again
      } else {
        this.checkHit(location);
        this.board[location] = 'X';
      }
    },

    checkHit(location) {
      function findShip(index, ships) {
        if (index >= ships.length) return null;
        let ship = ships[index];
        if (ship.location.includes(location)) {
          ship.getHit();
          return ship;
        }
        return findShip(index + 1, ships);
      }
      return findShip(0, this.ships);
    },
  };
};

const gameBoard = createBoard('Player 1');
gameBoard.populateBoardWithShips();





//Test
const displayBoardAsTable = () => {
  let table = [];
  for (let i = 0; i < gameBoard.board.length; i += 9) {
    table.push(gameBoard.board.slice(i, i + 9));
  }
  console.table(table);
  console.log(gameBoard.ships)
}

displayBoardAsTable()
