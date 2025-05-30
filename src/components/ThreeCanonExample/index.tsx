import PhysicsMeshProvider from "@/providers/PhysicsMeshContext";
import ThreeCanonScene from "../ThreeCanonScene";
import PhysicsMeshBasicMaterial from "../PhysicsMeshBasicMaterial/PhysicsMeshBasicMaterial";
import PhysicsBoxGeometry from "../PhysicsBoxGeometry/PhysicsBoxGeometry";

const ThreeCanonExample = () => {
  return (<ThreeCanonScene>
    <PhysicsMeshProvider position={[4.5, 10, 0]}>
      <PhysicsMeshBasicMaterial color={[1, 0, 0]} />
      <PhysicsBoxGeometry />
    </PhysicsMeshProvider>
    
    <PhysicsMeshProvider mass={0} scale={[10,1,10]} position={[0, -2, 0]}>
      <PhysicsMeshBasicMaterial color={[0, 1, 0]} />
      <PhysicsBoxGeometry />
    </PhysicsMeshProvider>
  </ThreeCanonScene>)
}

export default ThreeCanonExample;