import ThreeCanonScene from "../ThreeCanonScene";
import MeshProvider from "@/providers/MeshContext";
import MeshStandardMaterial from "../MeshStandardMaterial";
import BoxGeometry from "../BoxGeometry";
import BoxShape from "../BoxShape";
import Camera from "../Camera";
import FirstPersonControlsComponent from "../FirstPersonControlsComponent";
import Car from "../Car";
import SillyCar from "../SillyCar";

const ThreeCanonExample = () => {
  return (
    <ThreeCanonScene>
      <Camera position={[0, 0, 20]} />
      <FirstPersonControlsComponent />
      <MeshProvider position={[4.5, 10, 0]}>
        <MeshStandardMaterial color={[1, 0, 0]} />
        <BoxGeometry />
        <BoxShape />
      </MeshProvider>

      {/* <Car /> */}

      {/* <SillyCar /> */}

      <MeshProvider isStatic mass={0} scale={[100, 1, 100]} position={[0, -2, 0]}>
        <MeshStandardMaterial color={[0, 1, 0]} />
        <BoxGeometry />
        <BoxShape />
      </MeshProvider>
    </ThreeCanonScene>
  );
}

export default ThreeCanonExample;