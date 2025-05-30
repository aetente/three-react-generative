"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import * as THREE from 'three'
import * as CANNON from "cannon";

type IThreeCanonContext = {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  world: CANNON.World
  bodies: { body: CANNON.Body, mesh: THREE.Mesh }[]
  addBody: (body: CANNON.Body, mesh: THREE.Mesh) => void
} | null

const ThreeCanonContext = createContext<IThreeCanonContext>(null)

export const useThreeCanonContext = () => useContext(ThreeCanonContext) as IThreeCanonContext

export const ThreeCanonProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {

  const [context, setContext] = useState<IThreeCanonContext>(null)

  const addBody = (body: CANNON.Body, mesh: THREE.Mesh) => {
    setContext(previousContext => ({ ...previousContext, bodies: [...previousContext.bodies, { body, mesh }] }))
  }

  useEffect(() => {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer();
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    setContext({ scene, renderer, world, bodies: [], addBody })
  }, [])

  return (
    <ThreeCanonContext.Provider value={context}>{children}</ThreeCanonContext.Provider>
  )
}
