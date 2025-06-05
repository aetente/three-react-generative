"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d';

type IThreeContext = {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  world: RAPIER.World
  camera?: THREE.Camera
  bodies: { body: RAPIER.RigidBody, mesh: THREE.Mesh }[]
  controls?: THREE.FirstPersonControls | THREE.OrbitControls
  frameFunctions?: ((delta?: number) => void)[]
  clock?: THREE.Clock
  startedScene?: boolean
  isSimulationPaused?: boolean
  addBody: (body: RAPIER.RigidBody, mesh: THREE.Mesh) => void
  addCamera: (camera: THREE.Camera) => void
  addControls: (controls: THREE.FirstPersonControls | THREE.OrbitControls) => void
  addFrameFunction: (frameFunction: () => void) => void
  setStartedScene: (startedScene: boolean) => void
  setIsSimulationPaused: (isSimulationPaused: boolean) => void
} | null

const ThreeContext = createContext<IThreeContext>(null)

export const useThreeContext = () => useContext(ThreeContext) as IThreeContext

export const ThreeProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {

  const [context, setContext] = useState<IThreeContext>(null)

  const addBody = (body: RAPIER.RigidBody, mesh: THREE.Mesh) => {
    setContext(previousContext => {
      // previousContext?.world.addBody(body);
      return { ...previousContext, bodies: [...previousContext.bodies, { body, mesh }] }
    })
  }

  const addCamera = (camera: THREE.Camera) => setContext(previousContext => ({ ...previousContext, camera }))

  const addControls = (controls: THREE.FirstPersonControls | THREE.OrbitControls) => setContext(previousContext => ({ ...previousContext, controls }))

  const addFrameFunction = (frameFunction: () => void) => setContext(previousContext => ({ ...previousContext, frameFunctions: [...(previousContext?.frameFunctions || []), frameFunction] }))

  const setStartedScene = (startedScene: boolean) => setContext(previousContext => ({ ...previousContext, startedScene }))

  const setIsSimulationPaused = (isSimulationPaused: boolean) => setContext(previousContext => ({ ...previousContext, isSimulationPaused }))

  const initContext = async () => {
    // const RAPIER = await import('@dimforge/rapier3d');
    console.log(RAPIER);
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer();
    const world = new RAPIER.World({ x: 0.0, y: -9.82, z: 0.0 });
    const clock = new THREE.Clock();
    const doWorldUpdate = (delta?: number) => {
      world.timestep = delta || 1/60;
      world.step()
    };
    setContext({
      scene,
      renderer,
      world,
      bodies: [],
      clock,
      frameFunctions:[doWorldUpdate],
      startedScene: false,
      isSimulationPaused: false,
      addBody,
      addCamera,
      addControls,
      addFrameFunction,
      setStartedScene,
      setIsSimulationPaused
    })
  }

  useEffect(() => {
    initContext()
  }, [])

  return (
    <ThreeContext.Provider value={context}>{children}</ThreeContext.Provider>
  )
}
