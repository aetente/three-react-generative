"use client"

import MeshProvider from "@/providers/MeshContext";
import { BuildingPart, generateBuilding } from "@/utils/generate_building";
import React, { useEffect, useState } from "react";
import BoxGeometry from "../BoxGeometry/BoxGeometry";
import MeshStandardMaterial from "../MeshStandardMaterial/MeshStandardMaterial";
import ThreeScene from "../threescene/ThreeScene";

const GeneratedBuilding = () => {

  const [buildingParts, setBuildingParts] = useState<BuildingPart[]>([]);

  useEffect(() => {
    setBuildingParts(generateBuilding())
  }, []);

  const mapBuildingParts = (buildingParts: BuildingPart[]) => {
    const cubes = []
    const buidlingMinHeight = 1;
    console.log(buildingParts)
    for (let i = 0; i < buildingParts.length; i++) {

      const scale: [number, number, number] = [buildingParts[i].width, buidlingMinHeight, buildingParts[i].length];
      const position: [number, number, number] = [
        buildingParts[i].x + buildingParts[i].width / 2,
        buildingParts[i].z,
        buildingParts[i].y + buildingParts[i].length / 2,
      ];
      const isSmallWall = scale[0] < 0.4 || scale[1] < 0.4 || scale[2] < 0.4;
      if (!isSmallWall) {
        console.log(scale)
      }

      const textureIndex = isSmallWall || Math.random() > 0.5 ? 0 : 3;

      cubes.push((
        <React.Fragment key={`${i}`}>
          <MeshProvider scale={scale} position={position}>
            <BoxGeometry />
            <MeshStandardMaterial texture={`/textures/generated_building/brick_wall${textureIndex}.png`} />
          </MeshProvider>
        </React.Fragment>
      ))

      if (buildingParts[i].hasRoof) {

        const roofScale: [number, number, number] = [buildingParts[i].width + 0.2, 0.1, buildingParts[i].length + 0.2];
        const roofPosition: [number, number, number] = [
          buildingParts[i].x + buildingParts[i].width / 2,
          buildingParts[i].z + buidlingMinHeight / 2,
          buildingParts[i].y + buildingParts[i].length / 2,
        ];

        cubes.push((
          <React.Fragment key={`roof-${i}`}>
            <MeshProvider scale={roofScale} position={roofPosition}>
              <BoxGeometry />
              <MeshStandardMaterial color={[0, 0, 0]} />
            </MeshProvider>
          </React.Fragment>
        ))

      }
    }

    return cubes
  }

  return (
    <ThreeScene>
      {mapBuildingParts(buildingParts)}
    </ThreeScene>
  )
}

export default GeneratedBuilding;