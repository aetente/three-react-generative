"use client"

import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Cube from "../cube/Cube";

export default function ThreeScene() {

  const [camera, setCamera] = useState<THREE.Camera>();

  const threeContext = useThreeContext();

  const containerRef = useRef<HTMLDivElement>(null);

  function animate(camera: THREE.Camera) {
    requestAnimationFrame(() => animate(camera));

    const { scene, renderer } = threeContext;
    renderer.render(scene, camera);
  }

  useEffect(() => {
    if (threeContext?.scene && typeof window !== 'undefined') {
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

      controls.minDistance = 5;
      controls.maxDistance = 5;

      controls.maxPolarAngle = Math.PI / 2;

      animate(cameraThree);
    }
  }, [threeContext])

  return (
    <div ref={containerRef}>
      <Cube />
    </div>
  )
}