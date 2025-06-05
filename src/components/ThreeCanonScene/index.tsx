"use client"

import React, { useCallback, useEffect, useRef } from "react";
import * as THREE from "three";
import { useThreeContext } from "@/providers/ThreeContext";
// import Cube from "../cube/Cube";

export default function ThreeCanonScene({ children }: { children: React.ReactNode }) {

  const threeContext = useThreeContext();

  const containerRef = useRef<HTMLDivElement>(null);

  const threeContextRef = useRef(threeContext);

  let a = 0;

  const animate = () => {
    const { scene, camera, renderer, bodies, frameFunctions, clock, isSimulationPaused } = threeContextRef.current;
    
    requestAnimationFrame(() => animate());

    if (a === 0 && bodies.length == 2) {
      console.log(bodies);
      console.log(bodies[0].body.translation());
      a = 1;
    }

    if (isSimulationPaused) {
        // If paused, don't step the physics world
        renderer.render(scene, camera); // You might still want to render the static scene
        return;
    }

    let delta = clock.getDelta();
    delta = Math.min(delta, 0.1);
    frameFunctions?.forEach((frameFunction) => {
      frameFunction(delta)
    });

    for (const body of bodies) {
      body.mesh.position.x = body.body.translation().x;
      body.mesh.position.y = body.body.translation().y;
      body.mesh.position.z = body.body.translation().z;

      body.mesh.quaternion.copy(body.body.rotation());
      // body.mesh.position.copy(body.body.position);
      // body.mesh.quaternion.copy(body.body.quaternion);
    }

    if (scene && renderer && camera) {
      renderer.render(scene, camera);
    }
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

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // Tab is hidden, pause the simulation
          threeContext.setIsSimulationPaused(true);
          console.log("Simulation paused due to tab inactivity.");
        } else {
          // Tab is visible, resume the simulation
          threeContext.setIsSimulationPaused(false);
          // IMPORTANT: Reset lastTime to current time to avoid a huge deltaTime
          console.log("Simulation resumed.");
        }
      });

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