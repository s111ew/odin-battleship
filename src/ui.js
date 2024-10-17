import { createBoard } from "./index"

export const initialiseStartButton = () => {
  const button = document.querySelector('button')
  button.addEventListener('click', ()=> {
    renderUI()
    button.remove()
  })
}

const renderUI = () => {
  // create two gameboards, one for player and one for computer
  // add event listeners to each square that passes a hit/location to each board
  const grids = document.querySelectorAll('.grid')
  createCells(grids)

  const playerBoard = createBoard('player');
  playerBoard.populateBoardWithShips();
  renderPlayerShips(playerBoard.board)

  const cpuBoard = createBoard('computer');
  cpuBoard.populateBoardWithShips();
}

const findPlayerShips = (playerGameBoard) => {
  const shipsArr = []
  playerGameBoard.forEach((cell, index) => {
    if (cell === 0) {
      return
    }
    const shipObject = {
      index: index,
      shipID: cell,
    }
    shipsArr.push(shipObject)
  })
  return shipsArr
}

const renderPlayerShips = (playerGameBoard) => {
  const shipsArr = findPlayerShips(playerGameBoard)
  const playerBoardUI = document.querySelectorAll('.player-grid > div')

  playerBoardUI.forEach((cell, index) => {

    const matchingShip = shipsArr.find(ship => ship.index === index)
    if(matchingShip) {
      cell.classList.add('ship')
      cell.classList.add(matchingShip.shipID)
    }
  })
}

const createCells = (grids) => {
  grids.forEach(grid => {
    for (let i = 0; i <= 81; i++) {
      const cell = document.createElement('div')
      cell.classList.add('cell')

      grid.appendChild(cell)
    }
  })
}