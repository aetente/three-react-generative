"use client"

import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import Cube from "../cube/Cube";

export default function ThreeScene () {

  const threeContext = useThreeContext();

  const containerRef =  useRef(null);

  useEffect(() => {
    console.log(threeContext)
     if (threeContext.scene && typeof window !== 'undefined') {
      const {scene, renderer} = threeContext
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      
      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current?.appendChild(renderer.domElement);
      camera.position.z = 5;

      const geometry = new THREE.BoxGeometry();
      const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
      const cube = new THREE.Mesh(geometry, material);
      scene.add(cube);

      renderer.render(scene, camera);
    }
  }, [threeContext])

  return (
    <div ref={containerRef}>
      <Cube />  
    </div>
  )
}