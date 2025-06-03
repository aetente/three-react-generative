"use client"

import { useMeshContext } from "@/providers/MeshContext"
import { useThreeContext } from "@/providers/ThreeContext"
import { useEffect } from "react"

import * as THREE from "three"

const CylinderGeometry = ({
  radiusTop,
  radiusBottom,
  height,
  radialSegments
}: {
  radiusTop?: number,
  radiusBottom?: number,
  height?: number,
  radialSegments?: number
}) => {

  const meshContext = useMeshContext()
  const threeContext = useThreeContext();

  useEffect(() => {
    if (threeContext?.scene && meshContext?.setGeometry && !meshContext?.geometry) {
      const actualRadiusTop = radiusTop || 5;
      const actualRadiusBottom = radiusBottom || 5;
      const actualHeight = height || 10;
      const actualRadialSegments = radialSegments || 8;
      meshContext.setGeometry(new THREE.CylinderGeometry(actualRadiusTop, actualRadiusBottom, actualHeight, actualRadialSegments));
    }
  }, [threeContext, threeContext?.scene, meshContext])

  return (<></>)

}

export default CylinderGeometry