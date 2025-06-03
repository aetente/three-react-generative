"use client"

import { useMeshContext } from "@/providers/MeshContext";
import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect } from "react";

import * as CANNON from "cannon";

const CylinderShape = ({
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
    if (threeContext?.scene && meshContext?.setShape && meshContext?.mesh && !meshContext?.body) {
      const actualRadiusTop = radiusTop || 5;
      const actualRadiusBottom = radiusBottom || 5;
      const actualHeight = height || 10;
      const actualRadialSegments = radialSegments || 8;
      const theShape = new CANNON.Cylinder(actualRadiusTop, actualRadiusBottom, actualHeight, actualRadialSegments);
      meshContext.setShape(theShape);
    }
  }, [threeContext, threeContext?.scene, meshContext])

  return (
    <></>
  )
}

export default CylinderShape;