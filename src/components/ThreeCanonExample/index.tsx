import ThreeCanonScene from "../ThreeCanonScene";
import MeshProvider from "@/providers/MeshContext";
import MeshStandardMaterial from "../MeshStandardMaterial";
import BoxGeometry from "../BoxGeometry";
import BoxShape from "../BoxShape";
import Camera from "../Camera";
import FirstPersonControlsComponent from "../FirstPersonControlsComponent";
import Car from "../Car";
import SillyCar from "../SillyCar";
import RapierCar from "../RapierCar";
import VerySillyCar from "../VerySillyCar";

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

      {/* <RapierCar /> */}
      <VerySillyCar />
      {/* <VerySillyCar />
      <VerySillyCar /> */}

      <MeshProvider isStatic mass={0} scale={[1000, 1, 1000]} position={[0, -2, 0]}>
        <MeshStandardMaterial color={[0, 1, 0]} />
        <BoxGeometry />
        <BoxShape />
      </MeshProvider>
    </ThreeCanonScene>
  );
}

export default ThreeCanonExample;