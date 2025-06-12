"use client"

import { useMeshContext } from "@/providers/MeshContext";
import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect } from "react";

import * as THREE from "three";

const HeightfieldGeometry = () => {

  const meshContext = useMeshContext()
  const threeContext = useThreeContext();

  useEffect(() => {
    if (threeContext?.scene && meshContext?.setGeometry && !meshContext?.geometry && meshContext?.shape) {
      const propsScale = meshContext.scale ? { x: meshContext.scale[0], y: meshContext.scale[1], z: meshContext.scale[2] } : { x: 1, y: 1, z: 1 };

      // const geometry = new THREE.Geometry();
      // const heights = meshContext?.body?.heights;
      // const rows = meshContext?.body?.rows;
      // const cols = meshContext?.body?.cols;

      // console.log("sdfsgsgdfh")
      // let vIndex = 0;
      // for (let c = 0; c < cols; c++) {
      //   for (let r = 0; r < rows; r++) {
      //     const height = heights[vIndex];
      //     const v = new THREE.Vector3(c, height, r);
      //     geometry.vertices.push(v);
      //     vIndex++;
      //   }
      // }

      // for (let i = 0; i < cols - 1; i++) {
      //   for (let j = 0; j < rows - 1; j++) {
      //     // Get the indices of the four corners of the current grid cell
      //     const a = i * rows + j;         // Top-left
      //     const b = i * rows + (j + 1);     // Top-right
      //     const c = (i + 1) * rows + j;   // Bottom-left
      //     const d = (i + 1) * rows + (j + 1); // Bottom-right

      //     // Create two triangles for each square
      //     // Triangle 1: Top-left, Bottom-left, Top-right
      //     geometry.faces.push(new THREE.Face3(a, c, b));

      //     // Triangle 2: Top-right, Bottom-left, Bottom-right
      //     geometry.faces.push(new THREE.Face3(b, c, d));
      //   }
      // }

      // geometry.computeVertexNormals();

      const geometry = new THREE.BufferGeometry();
      const heights = meshContext?.shape?.heights;
      const rows = meshContext?.shape?.nrows;
      const cols = meshContext?.shape?.ncols;
      const scale = meshContext?.shape?.scale;

      const positions = [];
      const uvs = []; // For textures
      const indices = [];


      const hmIndex = (x: number, y: number) => x * (rows + 1) + y;

      const pushVertex = (x: number, y: number) => {
        const offsetX = -scale.x / 2;
        const offsetZ = -scale.z / 2;
        const hIndex = hmIndex(x, y)
        const hValue = heights[hIndex];
        if (hValue !== undefined) {
          positions.push(
            (x/5 - 1) / 2,
            heights[hIndex],
            (y/5 - 1) / 2
          );
        } else {

          // console.log(hIndex, x, y, heights)
        }
      };

      for (let y = 0; y < rows + 1; y++) {
        for (let x = 0; x < cols + 1; x++) {
          const index = Math.floor(positions.length / 3);
          pushVertex(x, y);
          pushVertex(x, y + 1);
          pushVertex(x + 1, y);
          pushVertex(x + 1, y);
          pushVertex(x, y + 1);
          pushVertex(x + 1, y + 1);
          indices.push(index, index + 1, index + 2);
          indices.push(index + 3, index + 4, index + 5);
        }
      }

      console.log("positions", positions)

      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setIndex(indices);
      geometry.computeVertexNormals();

      //------------------

      // const xStep = 1 / (cols - 1);
      // const zStep = 1 / (rows - 1); 

      // const offsetX = -1 / 2;
      // const offsetZ = -1 / 2;

      // for (let i = 0; i < rows; ++i) { 
      //   for (let j = 0; j < cols; ++j) { 
      //     const height = heights[i * cols + j];

      //     const x = j * xStep + offsetX;
      //     const y = height * 1
      //     const z = i * zStep + offsetZ;

      //     positions.push(x, y, z);

      //     // UVs (for applying textures later)
      //     // Normalize UVs to range from 0 to 1 across the terrain
      //     uvs.push(j / (cols - 1), i / (rows - 1));
      //   }
      // }
      // console.log("positions", positions, meshContext?.shape, scale )

      // // 2. Generate Indices (Faces)
      // // We iterate through each 'quad' of the grid and create two triangles.
      // for (let i = 0; i < rows - 1; ++i) {
      //   for (let j = 0; j < cols - 1; ++j) {
      //     // Get the indices of the four corners of the current grid cell
      //     const topLeft = i * cols + j;
      //     const topRight = i * cols + (j + 1);
      //     const bottomLeft = (i + 1) * cols + j;
      //     const bottomRight = (i + 1) * cols + (j + 1);

      //     // First triangle (bottom-left, top-right, top-left)
      //     // Winding order matters for face culling. This order generally works for a "top-down" view.
      //     indices.push(bottomLeft, topRight, topLeft);

      //     // Second triangle (bottom-left, bottom-right, top-right)
      //     indices.push(bottomLeft, bottomRight, topRight);
      //   }
      // }

      // // Set attributes for the BufferGeometry
      // geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      // geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
      // geometry.setIndex(indices); // Set the index attribute

      // // Compute normals for proper lighting (crucial!)
      // geometry.computeVertexNormals();

      meshContext.setGeometry(geometry);
    }
  }, [threeContext, threeContext?.scene, meshContext])

  return (<></>)
};

export default HeightfieldGeometry