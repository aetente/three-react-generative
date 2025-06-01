import ThreeCanonScene from "../ThreeCanonScene";
import MeshProvider from "@/providers/MeshContext";
import MeshStandardMaterial from "../MeshStandardMaterial";
import BoxGeometry from "../BoxGeometry";
import BoxShape from "../BoxShape";

const ThreeCanonExample = () => {
  return (
    <ThreeCanonScene>
      <MeshProvider position={[4.5, 10, 0]}>
        <MeshStandardMaterial color={[1, 0, 0]} />
        <BoxGeometry />
        <BoxShape />
      </MeshProvider>

      <MeshProvider mass={0} scale={[10, 1, 10]} position={[0, -2, 0]}>
        <MeshStandardMaterial color={[0, 1, 0]} />
        <BoxGeometry />
        <BoxShape />
      </MeshProvider>
    </ThreeCanonScene>
  );
}

export default ThreeCanonExample;