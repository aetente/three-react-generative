"use client"

import { usePhysicsMeshContext } from "@/providers/PhysicsMeshContext";
import { useThreeCanonContext } from "@/providers/ThreeCanonProvider";
import { useEffect } from "react"

import * as THREE from "three"


const PhysicsMeshBasicMaterial = ({color} : {color?: [number, number, number]}) => {
  const meshContext = usePhysicsMeshContext()
  const threeContext = useThreeCanonContext();

  useEffect(() => {
    if (threeContext?.scene && meshContext?.mesh && meshContext?.setMaterial && !meshContext?.material) {
      const colorVal = color ? new THREE.Color(color[0], color[1], color[2]) : new THREE.Color(1, 0, 0);
      const material = new THREE.MeshBasicMaterial({ color: colorVal });
      meshContext.setMaterial(meshContext?.mesh, material)
    }
  }, [threeContext, threeContext?.scene, meshContext])

  return (<></>)
  
}

export default PhysicsMeshBasicMaterial