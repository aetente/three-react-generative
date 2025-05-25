"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import * as THREE from 'three'
import { useThreeContext } from './ThreeContext';

type IMeshContext = {
  mesh?: THREE.Mesh
  geometry?: THREE.BufferGeometry
  material?: THREE.Material
  texture?: THREE.Texture
  setGeometry: (geometry: THREE.BufferGeometry) => void
  setTexture: (texture: THREE.Texture) => void
  setMaterial: (mesh: THREE.Mesh,material: THREE.Material) => void
} | null

const MeshContext = createContext<IMeshContext>(null)

export const useMeshContext = () => useContext(MeshContext)

const MeshProvider = ({
  children,
  position
} : {
  children: React.ReactNode
  position?: [number, number, number]
}) => {

  const threeContext = useThreeContext();

  const [context, setContext] = useState<IMeshContext>(null)


  const setGeometry = (geometry: THREE.BufferGeometry) => {
      const mesh = new THREE.Mesh(geometry);
      threeContext?.scene.add(mesh);
      const actualPosition = position || [0, 0, 0]
      mesh.position.set(actualPosition[0], actualPosition[1], actualPosition[2]);
      setContext(previousContext => ({ ...previousContext, mesh, geometry }))
      // context.mesh.geometry = geometry
    // }
  }

  const setTexture = (texture: THREE.Texture) => {
    setContext(previousContext => ({ ...previousContext, texture }))
  }

  const setMaterial = (mesh: THREE.Mesh, material: THREE.Material) => {
      setContext(previousContext => {
        if (!previousContext?.mesh) return previousContext
        previousContext.mesh.material = material
        return { ...previousContext, material }
      })
  }

  
  useEffect(() => {
    if (threeContext?.scene) {
      const contextVal = {
        setGeometry,
        setTexture,
        setMaterial
      };
      setContext(contextVal);
    }
  }, [threeContext?.scene])

  return (
    <MeshContext.Provider value={context}>{children}</MeshContext.Provider>
  )
}

export default MeshProvider;