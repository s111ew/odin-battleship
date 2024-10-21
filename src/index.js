// import './style.css'

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

const ROW_STARTS = Array.from({ length: ROW_SIZE }, (_, i) => i * ROW_SIZE);

const SHIPS = [
  {name: 'Carrier', length: 5}, 
  {name: 'Battleship', length: 4}, 
  {name: 'Destroyer', length: 3},
  {name: 'Submarine', length: 3},
  {name: 'Patrol Boat', length: 2}
]

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
    }
  }
}

const createGameBoard = () => {
  return {
    board: new Array(ROW_SIZE * ROW_SIZE).fill(0),

    ships: [],

    generateShips() {
      SHIPS.forEach(ship => {
        const newShip = createShip(ship.name, ship.length)
        this.generateShipLocation(newShip)
      })
    },

    generateShipLocation(shipObject) {
      const orientation = Math.random() > 0.5 ? 'V' : 'H';
      const randomLocation = +(Math.random() * (ROW_SIZE * ROW_SIZE - 1)).toFixed(0)
      const locationArray = new Array(shipObject.length)
      locationArray[0] = randomLocation
      for (let i = 1; i < shipObject.length; i++) {
        locationArray[i] = randomLocation + (orientation === 'V' ? i * 9 : i)
      }
      if(!this.isLocationValid(locationArray, this.board, orientation)) {
        return this.generateShipLocation(shipObject)
      }
      this.placeShip(shipObject, locationArray)
    },

    isLocationValid(locationArray, board, orientation) {
      if (orientation === 'V') {
        return this.isLocationValidVertical(locationArray, board)
      } else {
        return this.isLocationValidHorizontal(locationArray, board)
      }
    },

    isLocationValidHorizontal(locationArray, board) {
      const locationStart = locationArray[0];
      const filtered = ROW_STARTS.filter(num => num <= locationStart);
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
        if (location >= (ROW_SIZE * ROW_SIZE) || board[location] !== 0) {
          return false;
        }
      }
      return true;
    },

    placeShip(ship, locationArray) {
      for (let location of locationArray) {
        this.board[location] = ship.shipID
      }
      ship.location = locationArray
      this.ships.push(ship)
    },

    receiveHit(location) {
      const hitShip = this.checkLocation(location, this.ships)
      if (hitShip) {
        hitShip.increaseHits()
        // IF SHIP HAS SUNK THEN ???
      } else {
        this.board[location] = 'm'
      }
    },

    checkLocation(locationOfHit, ships, index = 0) {
      if (index >= ships.length) {
        return null;
      }

      if (ships[index].location.includes(value)) {
        return ships[index];
      }

      return this.checkLocation(locationOfHit, ships, index + 1)
  },
}
}




//--------------TESTING OUTPUT---------------------------

// function displayBoard(board, chunkSize) {
//     let result = [];
    
//     for (let i = 0; i < board.length; i += chunkSize) {
//         result.push(board.slice(i, i + chunkSize));
//     }
    
//     console.table(result)
// }


// const newGameBoard = createGameBoard()
// newGameBoard.generateShips()

// displayBoard(newGameBoard.board, 9)
// console.table(newGameBoard.ships)
