"use client"

import { useMeshContext } from "@/providers/MeshContext";
import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect } from "react";
import RAPIER from "@dimforge/rapier3d";

const BoxShape = () => {


  const meshContext = useMeshContext()
  const threeContext = useThreeContext();

  useEffect(() => {
    if (threeContext?.scene && meshContext?.setShape && meshContext?.mesh && !meshContext?.body) {
      const actualScale = meshContext.scale || [1, 1, 1];
      const theShape = new RAPIER.Cuboid(actualScale[0] / 2, actualScale[1] / 2, actualScale[2] / 2);
      meshContext.setShape(theShape);
    }
  }, [threeContext, threeContext?.scene, meshContext])

  return (
    <></>
  )
}

export default BoxShape;