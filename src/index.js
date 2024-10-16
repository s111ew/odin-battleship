import './style.css'

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
//         {name: 'Patrol Boat', length: 2, hits: 0, location: [95, 96], isSunk: false},]
//  }