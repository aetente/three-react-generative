"use client"

import MeshProvider from "@/providers/MeshContext"
import MeshStandardMaterial from "../MeshStandardMaterial"
import BoxGeometry from "../BoxGeometry"
import BoxShape from "../BoxShape"
import { useEffect, useState } from "react"
import { useThreeContext } from "@/providers/ThreeContext"

import * as CANNON from "cannon";
import * as THREE from "three";

const Car = () => {

  const threeContext = useThreeContext();

  const [car, setCar] = useState<CANNON.RaycastVehicle>(null);
  const [wheels, setWheels] = useState<CANNON.Body[]>([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (threeContext?.scene && threeContext?.world && threeContext?.startedScene && !finished && !car && !wheels.length) {
      const chassisShape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2.5));
      const chassisBody = new CANNON.Body({ mass: 100, material: new CANNON.Material({ friction: 0 }) });
      chassisBody.addShape(chassisShape);

      const car = new CANNON.RaycastVehicle({
        chassisBody,
        indexRightAxis: 0, // x-axis
        indexUpAxis: 1,    // y-axis
        indexForwardAxis: 2 // z-axis
      });
      chassisBody.position.set(0, 2, 0);
      car.wheelInfos = [];
      const wheelsOffsets = [
        // Back Right wheel
        new CANNON.Vec3(1.2, -0.5, -2),
        // Back Left wheel
        new CANNON.Vec3(-1.2, -0.5, -2),
        // Front Right wheel
        new CANNON.Vec3(1.2, -0.5, 2),
        // Front Left wheel
        new CANNON.Vec3(-1.2, -0.5, 2),
      ]
      const wheelDirectionLocal = new CANNON.Vec3(0, -1, 0);
      const wheelFriction = 30; //30
      const wheelRotaionVector = new CANNON.Vec3(-1, 0, 0);
      const wheelsRotationVectors = [
        new CANNON.Vec3(0, 0, 1),
        new CANNON.Vec3(0, 0, 1),
        new CANNON.Vec3(0, 0, 1),
        new CANNON.Vec3(0, 0, 1),
      ]
      for (let i = 0; i < wheelsOffsets.length; i++) {
        car.addWheel({
          radius: 0.5,
          directionLocal: wheelDirectionLocal,
          suspensionStiffness: 55,
          suspensionRestLength: 0.5,
          frictionSlip: wheelFriction,
          dampingRelaxation: 2.3,
          dampingCompression: 4.3,
          maxSuspensionForce: 10000,
          rollInfluence: 0.01,
          axleLocal: wheelsRotationVectors[i],
          chassisConnectionPointLocal: wheelsOffsets[i],
          maxSuspensionTravel: 1,
          customSlidingRotationalSpeed: -20,
          useCustomSlidingRotationalSpeed: true
        });
      }
      // console.log(car.wheelInfos)
      car.wheelInfos.forEach(function (wheel) {
        const cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 32)
        const wheelBody = new CANNON.Body({
          mass: 1,
          material: new CANNON.Material({ friction: 0 }),
        })
        const quaternion = new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0)
        wheelBody.addShape(cylinderShape, new CANNON.Vec3(), quaternion)
        wheel.wheelBody = wheelBody;
        // threeContext?.world.addBody(wheelBody);
      }.bind(this));

      // for (let i = 0; i < wheelsOffsets.length; i++) {
      //   const pivotA = wheelsOffsets[i]; // Position on car body relative to car's center
      //   const pivotB = new CANNON.Vec3(0, 0, 0); // Center of the wheel body
      //   const axisA = new CANNON.Vec3(1, 0, 0); // wheels rotate around this axis
      //   const axisB = new CANNON.Vec3(0, 1, 0); // wheel's rotational axis

      //   // The HingeConstraint needs to be created with the two bodies, the pivot points, and the axes.
      //   const hingeConstraint = new CANNON.HingeConstraint(chassisBody, car.wheelInfos[i].wheelBody, {
      //     pivotA: pivotA,
      //     axisA: axisA,
      //     pivotB: pivotB,
      //     axisB: axisB,
      //     collideConnected: false,
      //     // friction: 1,
      //     // restitution: 0.1
      //   });
      //   threeContext?.world.addConstraint(hingeConstraint);
      // }
      setWheels(car.wheelInfos);
      setCar(car);
      car.addToWorld(threeContext?.world);
    }
  }, [threeContext])

  const testMove = () => {
    if (car) {
      car.applyEngineForce(100, 0); // Back Left wheel
      car.applyEngineForce(100, 1);

    }
  }

  const updateWheelTransform = () => {
    if (car) {
      for (let i = 0; i < car.wheelInfos.length; i++) {
        if (car.wheelInfos[i]) {
          car.updateWheelTransform(i);
          // car.wheelInfos[i].wheelBody.position.copy(car.wheelInfos[i].worldTransform.position);
          // car.wheelInfos[i].wheelBody.quaternion.copy(car.wheelInfos[i].worldTransform.quaternion);
        }
      }
    }
  }

  useEffect(() => {
    if (car && wheels.length > 0 && !finished) {
      wheels.forEach((wheel) => {
        const wheelMesh = new THREE.Mesh(new THREE.CylinderGeometry(wheel.radius, wheel.radius, wheel.radius / 2, 8), new THREE.MeshStandardMaterial({ color: 0x000000 }));
        wheelMesh.useQuaternion = true;
        threeContext?.scene.add(wheelMesh);
        wheelMesh.position.set(wheel.chassisConnectionPointLocal.x, wheel.chassisConnectionPointLocal.y, wheel.chassisConnectionPointLocal.z);

        threeContext?.addBody(wheel.wheelBody, wheelMesh);
      });
      const carMesh = new THREE.Mesh(new THREE.BoxGeometry(2, 1, 5), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      carMesh.useQuaternion = true;
      threeContext?.scene.add(carMesh);
      threeContext?.addBody(car.chassisBody, carMesh);
      setFinished(true);
      setTimeout(() => {
        console.log("SPIIN")
        threeContext?.frameFunctions.push(testMove);
      }, 2000)
      // threeContext?.frameFunctions.push(updateWheelTransform);

      // testMove()
    }
  }, [car, wheels])

  return (
    <></>
    // <MeshProvider mass={0} scale={[10, 1, 10]} position={[0, -2, 0]}>
    //   <MeshStandardMaterial color={[0, 1, 0]} />
    //   <BoxGeometry />
    //   <BoxShape />
    // </MeshProvider>
  )
}

export default Car