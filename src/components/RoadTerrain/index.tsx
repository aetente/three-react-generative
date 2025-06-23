import MeshProvider from "@/providers/MeshContext";
import { generateCellsPositions } from "@/utils/generate_building";
import { useEffect, useState, Fragment } from "react";

import * as THREE from "three";
import MeshStandardMaterial from "../MeshStandardMaterial";
import BoxGeometry from "../BoxGeometry";
import BoxShape from "../BoxShape";
import { quaternionLookRotation } from "@/utils/tools";

type Road = {
  start: { x: number, y: number, z: number };
  end: { x: number, y: number, z: number };
}

const RoadTerrain = () => {

  const [roads, setRoads] = useState<Road[]>([]);

  const generateRoads = () => {
    // const columnsPositions = generateCellsPositions(100, 5); // 10 positions of columns in range 0-10
    const columnsPositions = [0,10,40,60];
    // const rowsPositions = generateCellsPositions(100, 5); // 10 positions of rows in range 0-10
    const rowsPositions = [0,20,40,60];
    const roadsArr = [];
    

    for (let i = 0; i < columnsPositions.length - 1; i++) {
      for (let j = 0; j < rowsPositions.length - 1; j++) {
        const roadData1: Road = {
          start: { x: columnsPositions[i], y: 0, z: rowsPositions[j] },
          end: { x: columnsPositions[i + 1], y: 0, z: rowsPositions[j] },
        }
        roadsArr.push(roadData1);
        const roadData2: Road = {
          start: { x: columnsPositions[i], y: 0, z: rowsPositions[j] },
          end: { x: columnsPositions[i], y: 0, z: rowsPositions[j + 1] },
        }
        roadsArr.push(roadData2);
      }
    }

    
    for (let i = 0; i < columnsPositions.length; i++) {
      const lastRow = rowsPositions[rowsPositions.length - 1];
      const roadData: Road = {
        start: { x: columnsPositions[i], y: 0, z: lastRow },
        end: { x: columnsPositions[i+1], y: 0, z: lastRow },
      }
      roadsArr.push(roadData);
    }

    for (let i = 0; i < rowsPositions.length; i++) {
      const lastColumn = columnsPositions[columnsPositions.length - 1];
      const roadData: Road = {
        start: { x: lastColumn, y: 0, z: rowsPositions[i] },
        end: { x: lastColumn, y: 0, z: rowsPositions[i+1] },
      }
      roadsArr.push(roadData);
    }


    setRoads(roadsArr);
  }

  const directionToLookAt = (pos: { x: number, y: number, z: number }, target: { x: number, y: number, z: number }) => {
    const forward = {
      x: target.x - pos.x,
      y: target.y - pos.y,
      z: target.z - pos.z,
    };

    // Normalize direction
    const len = Math.hypot(forward.x, forward.y, forward.z);
    forward.x /= len;
    forward.y /= len;
    forward.z /= len;

    // Compute quaternion that looks in the direction (assumes Y-up, Z-forward)
    const up = { x: 0, y: 1, z: 0 };
    const rotation = quaternionLookRotation(forward, up);
    return rotation
  }

  const mapRoads = (road: Road, i: number) => {
    const { start, end } = road;
    // const meshSize = { x: end.x - start.x, y: end.y - start.y};
    // const meshPosition = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2};
    const startVector = new THREE.Vector3(start.x, start.y, start.z);
    const endVector = new THREE.Vector3(end.x, end.y, end.z);
    const midpoint = new THREE.Vector3().addVectors(startVector, endVector).multiplyScalar(0.5);
    const direction = new THREE.Vector3().subVectors(endVector, startVector);

    // const length = startVector.distanceTo(endVector);
    const length = direction.length();
    if (length < 10) {
      console.log(length, start, end);
    }

    const roadPosition = {
      x: startVector.x + direction.x / 2,
      y: startVector.y + direction.y / 2,
      z: startVector.z + direction.z / 2
    }

    const lookAtAngle = directionToLookAt(startVector, endVector);
    console.log("=======================")
    console.log("length", length)

    console.log("START")
    console.log(startVector.x, startVector.y, startVector.z);
    console.log(roadPosition.x - direction.x / 2, roadPosition.y - direction.y / 2, roadPosition.z - direction.z / 2);

    console.log("END")
    console.log(endVector.x, endVector.y, endVector.z);
    console.log(roadPosition.x + direction.x / 2, roadPosition.y + direction.y / 2, roadPosition.z + direction.z / 2);

    return (
      <Fragment key={`${start.x}-${start.y}-${end.x}-${end.y}-${i}`}>
        <MeshProvider
          isStatic
          rotation={lookAtAngle}
          position={[roadPosition.z, roadPosition.y, roadPosition.x]}
          scale={[length, 1, 5]}
        >
          <MeshStandardMaterial color={[i / roads.length, 0, (1 - i / roads.length)]} />
          <BoxGeometry />
          <BoxShape />
        </MeshProvider>
      </Fragment>
    )
  }

  useEffect(() => {
    generateRoads();
  }, [])

  return <>
    {roads.map(mapRoads)}
  </>
};

export default RoadTerrain;