"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from "cannon";

type IThreeContext = {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  world: CANNON.World
  camera?: THREE.Camera
  bodies: { body: CANNON.Body, mesh: THREE.Mesh }[]
  controls?: THREE.FirstPersonControls | THREE.OrbitControls
  frameFunctions?: ((delta?: number) => void)[]
  clock?: THREE.Clock
  startedScene?: boolean
  addBody: (body: CANNON.Body, mesh: THREE.Mesh) => void
  addCamera: (camera: THREE.Camera) => void
  addControls: (controls: THREE.FirstPersonControls | THREE.OrbitControls) => void
  addFrameFunction: (frameFunction: () => void) => void
  setStartedScene: (startedScene: boolean) => void
} | null

const ThreeContext = createContext<IThreeContext>(null)

export const useThreeContext = () => useContext(ThreeContext) as IThreeContext

export const ThreeProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {

  const [context, setContext] = useState<IThreeContext>(null)

  const addBody = (body: CANNON.Body, mesh: THREE.Mesh) => {
    setContext(previousContext => {
      // previousContext?.world.addBody(body);
      return { ...previousContext, bodies: [...previousContext.bodies, { body, mesh }] }
    })
  }

  const addCamera = (camera: THREE.Camera) => setContext(previousContext => ({ ...previousContext, camera }))

  const addControls = (controls: THREE.FirstPersonControls | THREE.OrbitControls) => setContext(previousContext => ({ ...previousContext, controls }))

  const addFrameFunction = (frameFunction: () => void) => setContext(previousContext => ({ ...previousContext, frameFunctions: [...(previousContext?.frameFunctions || []), frameFunction] }))

  const setStartedScene = (startedScene: boolean) => setContext(previousContext => ({ ...previousContext, startedScene }))

  useEffect(() => {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer();
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    const clock = new THREE.Clock();
    const doWorldUpdate = (delta?: number) => world.step(delta);
    setContext({
      scene,
      renderer,
      world,
      bodies: [],
      clock,
      frameFunctions:[doWorldUpdate],
      startedScene: false,
      addBody,
      addCamera,
      addControls,
      addFrameFunction,
      setStartedScene
    })
  }, [])

  return (
    <ThreeContext.Provider value={context}>{children}</ThreeContext.Provider>
  )
}
