"use client"

import { usePhysicsMeshContext } from "@/providers/PhysicsMeshContext"
import { useThreeCanonContext } from "@/providers/ThreeCanonProvider"
import { useEffect } from "react"

import * as THREE from "three"

const PhysicsBoxGeometry = ({size} : {size?: [number, number, number]}) => {

  const meshContext = usePhysicsMeshContext()
  const threeContext = useThreeCanonContext();

  useEffect(() => {
    if (threeContext?.scene && meshContext?.setGeometry && !meshContext?.geometry) {
      const actualSize = size || [1, 1, 1]
      meshContext.setGeometry(new THREE.BoxGeometry(actualSize[0], actualSize[1], actualSize[2]));
    }
  }, [threeContext, threeContext?.scene, meshContext])

  return (<></>)

}

export default PhysicsBoxGeometry