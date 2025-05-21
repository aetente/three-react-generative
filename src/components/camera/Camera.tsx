"use client"

import { useThreeContext } from "@/providers/ThreeContext";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import * as THREE from "three";

const Camera = forwardRef((props: {
  position?: [number, number, number]
} | null, ref) => {

  const [camera, setCamera] = useState<THREE.Camera>();

  const threeContext = useThreeContext();

  useEffect(() => {
    if (threeContext?.scene) {
      const cameraPosition = props?.position || [0, 0, 5]
      const cameraThree = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      cameraThree.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
      setCamera(cameraThree);
      threeContext?.renderer.render(threeContext?.scene, cameraThree);
    }
  }, [props?.position, threeContext, threeContext?.renderer, threeContext?.scene])

  useImperativeHandle(ref, () => {
    return {camera}
  }, [camera]);

  return (<></>)
})

Camera.displayName = "Camera";

export default Camera;