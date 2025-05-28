import { randInRange } from "./loadTexture";

class BuildingPart {
  public x;
  public y;
  public z;
  public width;
  public length;
  public isValid;
  public hasRoof;
  constructor(xValue: number, yValue: number, zValue: number,widthValue: number, lengthValue: number, isValidValue?: boolean) {
    this.x = xValue;
    this.y = yValue;
    this.z = zValue;
    this.width = widthValue;
    this.length = lengthValue;
    if (typeof isValidValue === 'undefined') {
      this.isValid = true;
    } else {
      this.isValid = isValidValue;
    }
    this.hasRoof = false;
  }

  public setRoof() {
    this.hasRoof = true;
  }
}

const generateBuilding = () => {
  const areaSize = { x: 10, y: 10 };
  const floors = 5;
  const cellsPerRow = 10;

  const generateCellsPositions = (maxDistance: number) => {
    const arr = [];
    const minCellSize = maxDistance / cellsPerRow;
    const cellSizeDiff = minCellSize / 1.2;

    let currentCellSize = minCellSize + randInRange(-1, 1, Math.random()) * cellSizeDiff;
    let currentPosition = 0;
    let cellEnd = currentPosition + currentCellSize;
    while (cellEnd < maxDistance) {
      arr.push(currentPosition);
      currentPosition = cellEnd;
      currentCellSize = minCellSize + randInRange(-1, 1, Math.random()) * cellSizeDiff;
      cellEnd += currentCellSize;
    }
    return arr;
  }

  const generateBuildingParts = (rows:number[], columns:number[]) => {
    const placedPartsPositions : { [key: string]: BuildingPart } = {};
    for (let floor = 0; floor < floors; floor++) {
      for (let i = 1; i < columns.length; i++) {
        for (let j = 1; j < rows.length; j++) {
          let b;
          const putPart = Math.random() > 0.3;
          if ((floor === 0 ||
            ((placedPartsPositions[`${floor - 1}-${i}-${j}`] &&
              !placedPartsPositions[`${floor - 1}-${i}-${j}`]?.hasRoof
            ))) &&
            putPart
          ) {
            const x = columns[i - 1];
            const y = rows[j - 1];
            const z = floor;

            const width = columns[i] - x;
            const length = rows[j] - y;

            b = new BuildingPart(x, y, z, width, length);
            if (floor == floors - 1) b.setRoof();
            
            placedPartsPositions[`${floor}-${i}-${j}`] = b;

          } else {
            if (placedPartsPositions[`${floor - 1}-${i}-${j}`]) {
              placedPartsPositions[`${floor - 1}-${i}-${j}`].setRoof();
            }
          }
        }
      }
    }


    return Object.values(placedPartsPositions);


  }

  const columnsPositions = generateCellsPositions(areaSize.x);
  const rowsPositions = generateCellsPositions(areaSize.y);
  const buildingParts = generateBuildingParts(rowsPositions, columnsPositions);
  return buildingParts;
}

export { generateBuilding, BuildingPart }