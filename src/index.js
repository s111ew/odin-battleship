import './style.css'

// ship object:
//   length -> squares taken up by ship
//   hits -> how many times has been hit
//   isSunk -> if hits === length 
//   increaseHits -> hits++

// gameboard object:
//   10x10 squares
//   createShip -> calls ship factory to create ship and passes in squares
//   receiveAttack -> takes co-ordinates of strike.. deactivate square && if ship there, increase hit of ship
//   board hits -> amount of successful hits taken
//   gameOver -> if successful hits === amount of ship squares, end game and declare winner

function createShip(boardIndex, length) {
  return {
    length: length,
    location: boardIndex,
    hits: 0,
    increaseHits: function() {
        this.hits++
      },
    isSunk: this.length === this.hits,
  }
}

function createGameBoard() {
  return {
    board: [],
    populateBoard: function() {
      for (let i = 0; i < 100; i++) {
        this.board[i] = 0
      }
    },
    createShip: function(length, boardIndex, orientation) {
      createShip(boardIndex, length)
      if (orientation === 'horizontal') {
        for (let i = boardIndex; i < boardIndex + length; i++){
         this.board[i] = 1
        }
      }
      if (orientation === 'vertical') {
        for (let i = boardIndex; i < boardIndex + (length * 10); i + 10) {
          this.board[i] = 1
        }
      }
    },
    boardHits: 0,
    increaseBoardHits: function() {
      this.boardHits++
    },
    isGameOver: this.boardHits === 17,
  }
}