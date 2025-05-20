import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect } from "react";
import * as THREE from "three";

const Cube = () => {

  const threeContext = useThreeContext();

  useEffect(() => {
    if (threeContext.scene) {
      const geometry = new THREE.BoxGeometry( 2, 2, 2 ); 
      const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} ); 
      const cube = new THREE.Mesh( geometry, material );  
      threeContext.scene.add( cube );
    }
  }, [threeContext])

  return (<></>)
}

export default Cube;