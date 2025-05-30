"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from 'cannon';
import { useThreeCanonContext } from './ThreeCanonProvider';

type IPhysicsMeshContext = {
  mesh?: THREE.Mesh
  geometry?: THREE.BufferGeometry
  material?: THREE.Material
  texture?: THREE.Texture
  body?: CANNON.Body
  setGeometry: (geometry: THREE.BufferGeometry) => void
  setTexture: (texture: THREE.Texture) => void
  setMaterial: (mesh: THREE.Mesh,material: THREE.Material) => void
} | null

const PhysicsMeshContext = createContext<IPhysicsMeshContext>(null)

export const usePhysicsMeshContext = () => useContext(PhysicsMeshContext)

const PhysicsMeshProvider = ({
  children,
  position,
  scale,
  mass,
} : {
  children: React.ReactNode
  position?: [number, number, number]
  scale?: [number, number, number]
  mass?: number
}) => {

  const threeContext = useThreeCanonContext();

  const [context, setContext] = useState<IPhysicsMeshContext>(null)


  const setGeometry = (geometry: THREE.BufferGeometry) => {
      const mesh = new THREE.Mesh(geometry);
      threeContext?.scene.add(mesh);
      const actualPosition = position || [0, 0, 0]
      mesh.position.set(actualPosition[0], actualPosition[1], actualPosition[2]);
      const actualScale = scale || [1, 1, 1]
      mesh.scale.set(actualScale[0], actualScale[1], actualScale[2]);
      
      let shape;
      if (geometry instanceof THREE.SphereGeometry) {
        const radius = geometry.parameters.radius;
        shape = new CANNON.Sphere(radius);
      } else if (geometry instanceof THREE.CylinderGeometry) {
        const radius = geometry.parameters.radius;
        const height = geometry.parameters.height;
        shape = new CANNON.Cylinder(radius, radius, height, 8);
      } else if (geometry instanceof THREE.PlaneGeometry) {
        const width = geometry.parameters.width;
        const height = geometry.parameters.height;
        shape = new CANNON.Plane(width, height);
      } else {
        // WHY DOES IT WORK WITH DIVIDED BY 2?
        shape = new CANNON.Box(new CANNON.Vec3(actualScale[0]/2, actualScale[1]/2, actualScale[2]/2));
      }
      const actualMass = mass || mass === 0 ? mass : 1;
      const body = new CANNON.Body({ mass: actualMass });
      body.addShape(shape)
      body.position.x = actualPosition[0];
      body.position.y = actualPosition[1];
      body.position.z = actualPosition[2];
      threeContext?.world.addBody(body);

      threeContext?.addBody(body, mesh);

      setContext(previousContext => ({ ...previousContext, mesh, geometry, body }))
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
    <PhysicsMeshContext.Provider value={context}>{children}</PhysicsMeshContext.Provider>
  )
}

export default PhysicsMeshProvider;