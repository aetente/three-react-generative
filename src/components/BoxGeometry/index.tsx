"use client"

import { useMeshContext } from "@/providers/MeshContext"
import { useThreeContext } from "@/providers/ThreeContext"
import { useEffect } from "react"

import * as THREE from "three"

const BoxGeometry = ({size} : {size?: [number, number, number]}) => {

  const meshContext = useMeshContext()
  const threeContext = useThreeContext();

  useEffect(() => {
    if (threeContext?.scene && meshContext?.setGeometry && !meshContext?.geometry) {
      const actualSize = size || [1, 1, 1]
      meshContext.setGeometry(new THREE.BoxGeometry(actualSize[0], actualSize[1], actualSize[2]));
    }
  }, [threeContext, threeContext?.scene, meshContext])

  return (<></>)

}

export default BoxGeometry