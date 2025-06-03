"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import * as THREE from 'three';
import * as CANNON from "cannon";
import { useThreeContext } from './ThreeContext';

type IMeshContext = {
  mesh?: THREE.Mesh
  geometry?: THREE.BufferGeometry
  material?: THREE.Material
  texture?: THREE.Texture
  body?: CANNON.Body
  setGeometry: (geometry: THREE.BufferGeometry) => void
  setTexture: (texture: THREE.Texture) => void
  setMaterial: (mesh: THREE.Mesh, material: THREE.Material) => void
  setShape: (shape: CANNON.Shape) => void
} | null

const MeshContext = createContext<IMeshContext>(null)

export const useMeshContext = () => useContext(MeshContext)

const MeshProvider = ({
  children,
  position,
  scale,
  mass
}: {
  children: React.ReactNode
  position?: [number, number, number]
  scale?: [number, number, number]
  mass?: number
}) => {

  const threeContext = useThreeContext();

  const [context, setContext] = useState<IMeshContext>(null)

  // to fix warning "Cannot update a component while rendering a different component"
  // and to probably fix addBody function being called twice
  const [shouldUpdateBodies, setShouldUpdateBodies] = useState(false);
  const [bodyToAdd, setBodyToAdd] = useState<{ body: CANNON.Body, mesh: THREE.Mesh }>({ body: null, mesh: null });


  const setGeometry = (geometry: THREE.BufferGeometry) => {
    const mesh = new THREE.Mesh(geometry);
    threeContext?.scene.add(mesh);
    const actualPosition = position || [0, 0, 0]
    mesh.position.set(actualPosition[0], actualPosition[1], actualPosition[2]);
    const actualScale = scale || [1, 1, 1]
    mesh.scale.set(actualScale[0], actualScale[1], actualScale[2]);
    setContext(previousContext => ({ ...previousContext, mesh, geometry }))
  }

  const setShape = (shape: CANNON.Shape) => {

    const actualScale = scale || [1, 1, 1];
    const actualMass = mass || mass === 0 ? mass : 1;
    const actualPosition = position || [0, 0, 0];

    shape.halfExtents.set(actualScale[0] / 2, actualScale[1] / 2, actualScale[2] / 2);
    shape.updateConvexPolyhedronRepresentation();
    if (typeof shape.boundingSphereRadius === 'function') {
      shape?.computeBoundingSphereRadius();
    }
    const body = new CANNON.Body({ mass: actualMass });

    body.addShape(shape)
    body.position.x = actualPosition[0];
    body.position.y = actualPosition[1];
    body.position.z = actualPosition[2];
    threeContext?.world.addBody(body);
    setContext(previousContext => {
      setShouldUpdateBodies(true);
      setBodyToAdd({ body, mesh: previousContext?.mesh });
      return { ...previousContext, body }
    });
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
    // to fix warning "Cannot update a component while rendering a different component"
    // and to probably fix addBody function being called twice
    if (shouldUpdateBodies && bodyToAdd?.body && bodyToAdd?.mesh && threeContext?.addBody) {
      threeContext?.addBody(bodyToAdd.body, bodyToAdd.mesh);
      setShouldUpdateBodies(false);
      setBodyToAdd({ body: null, mesh: null });
    }
  }, [shouldUpdateBodies, bodyToAdd, threeContext?.addBody])


  useEffect(() => {
    if (threeContext?.scene) {
      const contextVal = {
        setGeometry,
        setTexture,
        setMaterial,
        setShape
      };
      setContext(contextVal);
    }
  }, [threeContext?.scene])

  return (
    <MeshContext.Provider value={context}>{children}</MeshContext.Provider>
  )
}

export default MeshProvider;