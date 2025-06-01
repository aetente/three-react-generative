import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect } from "react";
import * as THREE from "three";

const Cube = (props: {
  size?: [number, number, number]
  position?: [number, number, number]
  color?: [number, number, number]
} | null) => {

  const threeContext = useThreeContext();

  useEffect(() => {
    const scene = threeContext?.scene;
    if (scene) {
      const position = props?.position || [0, 0, 0]
      const size = props?.size || [1, 1, 1]
      const color = props?.color || [1, 0, 0]
      const geometry = new THREE.BoxGeometry( size[0], size[1], size[2] ); 
      const colorVal = new THREE.Color( color[0], color[1], color[2] );
      const material = new THREE.MeshBasicMaterial({ color: colorVal });
      // const material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0.2, 0.6, 0.8) });
      const cube = new THREE.Mesh( geometry, material ); 
      scene.add( cube );
      material.color.setRGB( colorVal.r, colorVal.g, colorVal.b ); 
      cube.position.set(position[0], position[1], position[2]); 
    }
  }, [threeContext?.scene])

  return (<></>)
}

export default Cube;