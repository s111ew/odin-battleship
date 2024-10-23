import { ROW_SIZE } from "./index";

export const generateGrids = () => {
  const gridContainers = document.querySelectorAll(".grid");

  gridContainers.forEach((gridContainer) => {
    for (let i = 0; i < ROW_SIZE * ROW_SIZE; i++) {
      const gridCell = document.createElement("div");
      gridCell.classList.add("cell");
      gridContainer.appendChild(gridCell);
    }
  });
};

export const initialiseStartButton = () => {
  const startButton = document.querySelector(".start");
  startButton.addEventListener("click", generateGrids);
};
