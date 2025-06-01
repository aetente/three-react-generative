import { useMeshContext } from "@/providers/MeshContext";
import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect } from "react"

import * as THREE from "three"


const MeshBasicMaterial = ({color} : {color?: [number, number, number]}) => {
  const meshContext = useMeshContext()
  const threeContext = useThreeContext();

  useEffect(() => {
    if (threeContext?.scene && meshContext?.mesh && meshContext?.setMaterial && !meshContext?.material) {
      const colorVal = color ? new THREE.Color(color[0], color[1], color[2]) : new THREE.Color(1, 0, 0);
      const material = new THREE.MeshBasicMaterial({ color: colorVal });
      meshContext.setMaterial(meshContext?.mesh, material)
    }
  }, [threeContext, threeContext?.scene, meshContext])

  return (<></>)
  
}

export default MeshBasicMaterial