"use client"

import { useMeshContext } from "@/providers/MeshContext";
import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect } from "react";

import RAPIER from "@dimforge/rapier3d";
import * as THREE from "three";

const HeightfieldShape = ({ rows, cols, heightsFunc }: { rows: number, cols: number, heightsFunc: (row: number, col: number) => number }) => {


  const meshContext = useMeshContext()
  const threeContext = useThreeContext();

  useEffect(() => {
    if (threeContext?.scene && meshContext?.setShape && !meshContext?.body) {
      const actualScale = meshContext.scale ? new RAPIER.Vector3(meshContext.scale[0], meshContext.scale[1], meshContext.scale[2]) : new RAPIER.Vector3(1, 1, 1);
      // const heights = []
      const heights = new Float32Array((rows + 1) * (cols + 1));
      let pIndex = 0
      for (let c = 0; c < cols + 1; c++) {
        for (let r = 0; r < rows + 1; r++) {
          heights[pIndex] = heightsFunc(r, c)
          pIndex++;
        }
      }
      const theShape = new RAPIER.Heightfield(rows, cols, heights, actualScale);
      meshContext.setShape(theShape);
      // const nRows = 50;
      // const nCols = 50;
      // const heights = new Float32Array((nRows + 1) * (nCols + 1));
      // const scalev = new RAPIER.Vector3(10.0, 1.0, 10.0);

      // // for (let i = 0; i < nRows; ++i) {
      // //   for (let j = 0; j < nCols; ++j) {
      // //     const x = j / (nCols - 1);
      // //     const y = i / (nRows - 1);
      // //     const height = Math.sin(x * Math.PI * 4) * Math.cos(y * Math.PI * 3) * 0.5 + 0.5;
      // //     heights[i * nCols + j] = height;
      // //   }
      // // }
      // const hmIndex = (x: number, y: number) => x * (nRows + 1) + y;

      // for (let y = 0; y < nRows + 1; y++) {
      //   for (let x = 0; x < nCols + 1; x++) {
      //     const index = hmIndex(x, y);
      //     let h = 0;
      //     h = Math.sin(x * Math.PI * 4) * Math.cos(y * Math.PI * 3) * 0.5 + 0.5;
      //     heights[index] = h;
      //   }
      // }

      // const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
      // const groundBody = threeContext?.world.createRigidBody(groundBodyDesc);

      // const colliderDesc = RAPIER.ColliderDesc.heightfield(
      //   nRows,
      //   nCols,
      //   heights,
      //   scalev
      // );

      // // You can still chain other methods to the colliderDesc
      // colliderDesc.setFriction(0.7);

      // const heightfieldCollider = threeContext?.world.createCollider(colliderDesc, groundBody);
    }
  }, [threeContext, threeContext?.scene, meshContext])

  return (
    <></>
  )

}

export default HeightfieldShape;