"use client"

import { useThreeContext } from "@/providers/ThreeContext";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// import Cube from "../cube/Cube";
import MeshProvider from "@/providers/MeshContext";
import BoxGeometry from "../BoxGeometry/BoxGeometry";
// import MeshBasicMaterial from "../MeshBasicMaterial/MeshBasicMaterial";
import MeshStandardMaterial from "../MeshStandardMaterial/MeshStandardMaterial";
import { BuildingPart, generateBuilding } from "@/utils/generate_building";

export default function ThreeScene() {

  const [camera, setCamera] = useState<THREE.Camera>();
  const [buildingParts, setBuildingParts] = useState<BuildingPart[][][]>([]);

  const threeContext = useThreeContext();

  const containerRef = useRef<HTMLDivElement>(null);

  function animate(camera: THREE.Camera) {
    requestAnimationFrame(() => animate(camera));

    const { scene, renderer } = threeContext;
    renderer.render(scene, camera);
  }

  useEffect(() => {
    if (threeContext?.scene && typeof window !== 'undefined') {
      setBuildingParts(generateBuilding())

      const { scene, renderer } = threeContext
      const cameraThree = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current?.appendChild(renderer.domElement);

      scene.add(cameraThree)
      cameraThree.position.set(0, 0, 5);
      setCamera(cameraThree);

      const controls = new OrbitControls(cameraThree, renderer.domElement);
      controls.listenToKeyEvents(window); // optional

      //controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

      controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
      controls.dampingFactor = 0.05;

      controls.screenSpacePanning = false;

      controls.minDistance = 10;
      controls.maxDistance = 10;

      controls.maxPolarAngle = Math.PI / 2;

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(-200, 200, 200);
      scene.add(light);
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
      scene.add(ambientLight);

      scene.background = new THREE.Color(0.7, 0.7, 0.7);

      animate(cameraThree);
    }
  }, [threeContext])

  const mapBuildingParts = (buildingParts: BuildingPart[][][]) => {
    const cubes = []
    const buidlingMinHeight = 1;
    for (let floor = 0; floor < buildingParts.length; floor++) {
      for (let i = 0; i < buildingParts[floor].length; i++) {
        for (let j = 0; j < buildingParts[floor][i].length; j++) {

          if (buildingParts[floor][i][j].isValid) {
            if (
              (i == 0 || !buildingParts[floor][i - 1][j].isValid) &&
              (j == 0 || !buildingParts[floor][i][j - 1].isValid) &&
              (i == buildingParts[floor].length - 1 || !buildingParts[floor][i + 1][j].isValid) &&
              (j == buildingParts[floor][i].length - 1 || !buildingParts[floor][i][j + 1].isValid)
            ) {
              buildingParts[floor][i][j].isValid = false;
            }
            else {

              const scale : [number, number, number] = [buildingParts[floor][i][j].width, buidlingMinHeight, buildingParts[floor][i][j].length];
              const position: [number, number, number] = [
                buildingParts[floor][i][j].x + buildingParts[floor][i][j].width / 2,
                buidlingMinHeight / 2 * (2 * floor + 1),
                buildingParts[floor][i][j].y + buildingParts[floor][i][j].length / 2
              ];
              const isSmallWall = scale[0] < 0.4 || scale[1] < 0.4 || scale[2] < 0.4;

              const textureIndex = isSmallWall || Math.random() > 0.5 ? 0 : 3;

              cubes.push((
                <React.Fragment key={`${floor}-${i}-${j}`}>
                  <MeshProvider scale={scale} position={position}>
                    <BoxGeometry />
                    <MeshStandardMaterial texture={`/textures/generated_building/brick_wall${textureIndex}.png`} />
                  </MeshProvider>
                </React.Fragment>
              ))

              const roofScale : [number, number, number] = [buildingParts[floor][i][j].width + 0.5, 0.1, buildingParts[floor][i][j].length + 0.5];
              const roofPosition : [number, number, number] = [
                buildingParts[floor][i][j].x + buildingParts[floor][i][j].width / 2,
                buidlingMinHeight * (floor + 1),
                buildingParts[floor][i][j].y + buildingParts[floor][i][j].length / 2
              ];

              cubes.push((
                <React.Fragment key={`roof-${floor}-${i}-${j}`}>
                  <MeshProvider scale={roofScale} position={roofPosition}>
                    <BoxGeometry />
                    <MeshStandardMaterial color={[0,0,0]} />
                  </MeshProvider>
                </React.Fragment>
              ))



            }
          }
        }
      }
    }
    return cubes
  }

  return (
    <div ref={containerRef}>
      {/* <Cube /> */}
      {/* <MeshProvider>
        <BoxGeometry />
        <MeshStandardMaterial texture="/textures/generated_building/brick_wall3.png" />
      </MeshProvider>

      <MeshProvider position={[1, 1, 1]}>
        <BoxGeometry />
        <MeshBasicMaterial color={[0, 1, 0]} />
      </MeshProvider> */}
      {mapBuildingParts(buildingParts)}
    </div>
  )
}