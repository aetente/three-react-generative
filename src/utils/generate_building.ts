import { randInRange } from "./loadTexture";

class BuildingPart {
  public x;
  public y;
  public width;
  public length;
  public isValid;
  constructor(xValue: number, yValue: number, widthValue: number, lengthValue: number, isValidValue?: boolean) {
    this.x = xValue;
    this.y = yValue;
    this.width = widthValue;
    this.length = lengthValue;
    if (typeof isValidValue === 'undefined') {
      this.isValid = true;
    } else {
      this.isValid = isValidValue;
    }
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
    const buildingFloors = [];
    let arr = [];
    let buildingPartsRow = [];
    const placedPartsPositions : { [key: string]: boolean } = {};
    for (let floor = 0; floor < floors; floor++) {
      for (let i = 1; i < columns.length; i++) {
        for (let j = 1; j < rows.length; j++) {
          let b;
          const putPart = Math.random() > 0.3;
          if ((floor === 0 || placedPartsPositions[`${i}-${j}`]) && putPart) {
            placedPartsPositions[`${i}-${j}`] = true;
            const x = columns[i - 1];
            const y = rows[j - 1];

            const width = columns[i] - x;
            const length = rows[j] - y;

            b = new BuildingPart(x, y, width, length);

          } else {
            if (placedPartsPositions[`${i}-${j}`]) {
              placedPartsPositions[`${i}-${j}`] = false;
            }
            b = new BuildingPart(0, 0, 0, 0, false);
          }
          buildingPartsRow.push(b);
        }
        arr.push(buildingPartsRow);
        buildingPartsRow = [];
      }
      buildingFloors.push(arr);
      arr = [];
    }


    return buildingFloors;


  }

  const columnsPositions = generateCellsPositions(areaSize.x);
  const rowsPositions = generateCellsPositions(areaSize.y);
  const buildingParts = generateBuildingParts(rowsPositions, columnsPositions);
  return buildingParts;
}

export { generateBuilding, BuildingPart }