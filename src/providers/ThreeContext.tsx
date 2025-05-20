"use client"

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'

type IAppContext = {
  scene: any
  renderer: any
}

const ThreeContext = createContext<IAppContext>(null)

export const useThreeContext = () => useContext(ThreeContext) as IAppContext

export const ThreeProvider: React.FC<{
  children: any
}> = ({ children }) => {

  const [context, setContext] = useState({})

  useEffect(() => {
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer();
    setContext({ scene, renderer })
  }, [])

  return (
    <ThreeContext.Provider value={context}>{children}</ThreeContext.Provider>
  )
}
