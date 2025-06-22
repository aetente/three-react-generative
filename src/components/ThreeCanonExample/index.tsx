"use client"

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
import City from "../City";
import HeightfieldGeometry from "../HeightfieldGeometry";
import HeightfieldShape from "../HeightfieldShape";
import RoadTerrain from "../RoadTerrain";

const ThreeCanonExample = () => {
  return (
    <ThreeCanonScene>
      <Camera position={[0, 0, 20]} />
      <FirstPersonControlsComponent />
      <City>
        <MeshProvider position={[-9, 10, -19]}>
          <MeshStandardMaterial color={[1, 0, 0]} />
          <BoxGeometry />
          <BoxShape />
        </MeshProvider>
      </City>

      <MeshProvider isStatic mass={0} scale={[100, 1, 100]} position={[10, -6, 0]}>
        <MeshStandardMaterial color={[0, 1, 0]} />
        <HeightfieldGeometry />
        <HeightfieldShape
          rows={10}
          cols={10}
          // heightsFunc={() => Math.random() * 1}
          heightsFunc={(row, col) => Math.random() * 2}
          // heightsFunc={(row, col) => Math.sin(row * Math.PI * 4) * Math.cos(col * Math.PI * 3) * 0.5 + 0.5}
          // heightsFunc={(row, col) => 0}
        />
      </MeshProvider>

      <RoadTerrain />

      {/* <Car /> */}

      {/* <SillyCar /> */}

      {/* <RapierCar /> */}
      <VerySillyCar />
      {/* <VerySillyCar />
      <VerySillyCar />
      <VerySillyCar />
      <VerySillyCar />
      <VerySillyCar />
      <VerySillyCar />
      <VerySillyCar />
      <VerySillyCar />
      <VerySillyCar />
      <VerySillyCar />
      <VerySillyCar /> */}

      {/* <MeshProvider isStatic mass={0} scale={[1000, 1, 1000]} position={[0, -2, 0]}>
        <MeshStandardMaterial color={[0, 1, 0]} />
        <BoxGeometry />
        <BoxShape />
      </MeshProvider> */}
    </ThreeCanonScene>
  );
}

export default ThreeCanonExample;