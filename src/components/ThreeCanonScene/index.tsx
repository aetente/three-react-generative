"use client"

import { useThreeCanonContext } from "@/providers/ThreeCanonProvider";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as CANNON from "cannon";
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
// import Cube from "../cube/Cube";

export default function ThreeCanonScene({children}: {children: React.ReactNode}) {

  const [camera, setCamera] = useState<THREE.Camera>();

  const threeCanonContext = useThreeCanonContext();

  const containerRef = useRef<HTMLDivElement>(null);

  function animate(world: CANNON.World, camera: THREE.Camera, controls: FirstPersonControls, clock: THREE.Clock) {
    requestAnimationFrame(() => animate(world, camera, controls, clock));

    const delta = clock.getDelta();
    controls.update(delta);

    world.step(delta);

    const { scene, renderer, bodies } = threeCanonContext;

    for (const body of bodies) {
      body.mesh.position.copy(body.body.position);
      body.mesh.quaternion.copy(body.body.quaternion);
    }

    renderer.render(scene, camera);
  }

  useEffect(() => {
    if (threeCanonContext?.scene && typeof window !== 'undefined') {

      const { scene, renderer, world } = threeCanonContext
      const cameraThree = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current?.appendChild(renderer.domElement);

      // TODO: separate component for camera
      scene.add(cameraThree)
      cameraThree.position.set(0, 0, 5);
      setCamera(cameraThree);

      // TODO: separate component for controls (includes clock)
      const controls = new FirstPersonControls(cameraThree, renderer.domElement);
      controls.movementSpeed = 5; // How fast the camera moves
      controls.lookSpeed = 0.1;  // How fast the camera rotates with mouse movement
      controls.noFly = false;      // If true, disables movement along the y-axis
      controls.constrainVertical = true; // Limits vertical look angle
      controls.verticalMin = 0.5;  // Lower limit for vertical look (radians)
      controls.verticalMax = 2.5;  // Upper limit for vertical look (radians)
      controls.lon = -90;          // Initial horizontal look angle (degrees)
      controls.lat = 0; // Initial vertical look angle (degrees)

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(-200, 200, 200);
      scene.add(light);
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
      scene.add(ambientLight);

      scene.background = new THREE.Color(0.7, 0.7, 0.7);

      const clock = new THREE.Clock();

      // TODO: make some callback which could be used to animate the scene
      // like for example how would I animate moving cube? 
      animate(world, cameraThree, controls, clock);
    }
  }, [threeCanonContext])

  

return (
  <div ref={containerRef}>
    {children}
  </div>
)
}