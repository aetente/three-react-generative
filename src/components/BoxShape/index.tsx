"use client"

import { useMeshContext } from "@/providers/MeshContext";
import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect } from "react";

import * as CANNON from "cannon";

const BoxShape = () => {


  const meshContext = useMeshContext()
  const threeContext = useThreeContext();

  useEffect(() => {
    if (threeContext?.scene && meshContext?.setShape && meshContext?.mesh && !meshContext?.body) {
      const theShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
      meshContext.setShape(theShape);
    }
  }, [threeContext, threeContext?.scene, meshContext])

  return (
    <></>
  )
}

export default BoxShape;