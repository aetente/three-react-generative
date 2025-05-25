import { useEffect } from "react";
import * as THREE from "three";
import { loadTextureF } from "@/utils/loadTexture";
import { useMeshContext } from "@/providers/MeshContext";
import { useThreeContext } from "@/providers/ThreeContext";


const MeshStandardMaterial = ({
  color,
  texture
}: {
  color?: [number, number, number],
  texture?: string
}) => {
  const meshContext = useMeshContext()
  const threeContext = useThreeContext();

  const initMeshStandardMaterial = async () => {
    if (threeContext?.scene && meshContext?.mesh && meshContext?.setMaterial && !meshContext?.material) {
      const colorVal = color ? new THREE.Color(color[0], color[1], color[2]) : new THREE.Color(1, 1, 1);
      const material = new THREE.MeshStandardMaterial({ color: colorVal });
      let textureVal = null;
      if (texture) {
        textureVal = await loadTextureF(texture);
        if (textureVal) {
          material.map = textureVal;
          material.transparent = true;
          material.side = THREE.DoubleSide;
          material.needsUpdate = true;
          meshContext.setTexture(textureVal);
        }
      }
      meshContext.setMaterial(meshContext?.mesh, material);
      
    }
  }

  useEffect(() => {
    initMeshStandardMaterial()
  }, [threeContext, threeContext?.scene, meshContext])

  return (<></>)
}

export default MeshStandardMaterial