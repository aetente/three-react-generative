"use client"

import React, { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import * as CANNON from "cannon";
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { useThreeContext } from "@/providers/ThreeContext";
// import Cube from "../cube/Cube";

export default function ThreeCanonScene({children}: {children: React.ReactNode}) {

  const threeContext = useThreeContext();

  const containerRef = useRef<HTMLDivElement>(null);

  const threeContextRef = useRef(threeContext);


  const animate = () => {
    const { scene, camera, renderer, bodies, frameFunctions, clock } = threeContextRef.current;
    
    const delta = clock.getDelta();
    frameFunctions?.forEach((frameFunction) => {
      frameFunction(delta)
    });

    for (const body of bodies) {
      body.mesh.position.copy(body.body.position);
      body.mesh.quaternion.copy(body.body.quaternion);
    }

    if (scene && renderer && camera) {
      renderer.render(scene, camera);
    }
    requestAnimationFrame(() => animate());
  }

  useEffect(() => {
    if (!threeContext?.startedScene && threeContext?.scene && threeContext?.camera && typeof window !== 'undefined') {
      const { scene, renderer, camera, setStartedScene } = threeContext
      // const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

      renderer.setSize(window.innerWidth, window.innerHeight);
      containerRef.current?.appendChild(renderer.domElement);

      scene.add(camera)

      const light = new THREE.DirectionalLight(0xffffff, 1);
      light.position.set(-200, 200, 200);
      scene.add(light);
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
      scene.add(ambientLight);

      scene.background = new THREE.Color(0.7, 0.7, 0.7);

      animate();
      setStartedScene(true);
    }
  }, [threeContext]);

  useEffect(() => {
    threeContextRef.current = threeContext;
  }, [threeContext]);

  

return (
  <div ref={containerRef}>
    {children}
  </div>
)
}