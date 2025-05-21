"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import * as THREE from 'three'

type IThreeContext = {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
} | null

const ThreeContext = createContext<IThreeContext>(null)

export const useThreeContext = () => useContext(ThreeContext) as IThreeContext

export const ThreeProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {

  const [context, setContext] = useState<IThreeContext>(null)

  useEffect(() => {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer();
    setContext({ scene, renderer })
  }, [])

  return (
    <ThreeContext.Provider value={context}>{children}</ThreeContext.Provider>
  )
}
