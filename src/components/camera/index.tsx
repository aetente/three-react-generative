"use client"

import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect, useState } from "react";
import * as THREE from "three";

const Camera = (props: {
  position?: [number, number, number]
} | null) => {

  const threeContext = useThreeContext();

  const [shouldUpdateCamera, setShouldUpdateCamera] = useState(false);
  const [cameraToAdd, setCameraToAdd] = useState<THREE.Camera>(null);

  useEffect(() => {
    if (threeContext?.scene && threeContext?.addCamera && !threeContext?.camera) {
      const cameraPosition = props?.position || [0, 0, 5]
      const cameraThree = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      cameraThree.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
      // threeContext?.addCamera(cameraThree);
      setCameraToAdd(cameraThree);
      setShouldUpdateCamera(true);
    }
  }, [props?.position, threeContext, threeContext?.renderer, threeContext?.scene])

  useEffect(() => {
    if (shouldUpdateCamera && threeContext?.addCamera && cameraToAdd) {
      threeContext?.addCamera(cameraToAdd);
      setShouldUpdateCamera(false);
      setCameraToAdd(null);
    }
  }, [cameraToAdd, shouldUpdateCamera, threeContext?.addCamera])

  return (<></>)
}

export default Camera;