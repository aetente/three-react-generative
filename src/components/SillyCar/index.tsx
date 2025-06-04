"use client"

import { useEffect, useState } from "react";
import { useThreeContext } from "@/providers/ThreeContext";

import * as CANNON from "cannon";
import * as THREE from "three";

const SillyCar = () => {

  const threeContext = useThreeContext();
  const [car, setCar] = useState<CANNON.RaycastVehicle>(null);
  const [wheels, setWheels] = useState<CANNON.Body[]>([]);
  const [finished, setFinished] = useState(false);

  const carDimensions = { width: 2, height: 1, length: 5 };
  const wheelDimensions = { radius: 0.5, height: 0.25 };

  const wheelsPositions = [
    [1, 0.25, 2.5], // right front wheel
    [-1, 0.25, 2.5], // left front wheel
    [1, 0.25, -2.5], // right back wheel
    [-1, 0.25, -2.5], // left back wheel
  ]

  const testMove = () => {
    if (wheels.length) {
      console.log("MMOOOOOVVE")
      const forceMagnitude = 5000;

      // Define the force vector (e.g., in the positive Y direction)
      const forceVector = new CANNON.Vec3(0, forceMagnitude, 0);

      // Define the point (local to the body) where the force is applied
      // This point must be offset from the center of mass to create torque
      const localPoint = new CANNON.Vec3(0, 0, wheelDimensions.radius);
      wheels[2].applyLocalForce(forceVector, localPoint);
      wheels[3].applyLocalForce(forceVector, localPoint);
      // wheels[2]?.angularVelocity.set(0, 0, 10000);
      // wheels[3]?.angularVelocity.set(0, 0, 10000);
    }
  }

  useEffect(() => {
    if (threeContext?.scene && threeContext?.world && threeContext?.startedScene && !finished && !car && !wheels.length) {
      const body = new CANNON.Body({ mass: 100 });
      const boxShape = new CANNON.Box(new CANNON.Vec3(carDimensions.width / 2, carDimensions.height / 2, carDimensions.length / 2));
      boxShape.updateConvexPolyhedronRepresentation();
      body.addShape(boxShape);

      body.position.set(0, 2, 0);
      threeContext.world.addBody(body);
      setCar(body);

      const wheelsAmount = 4;
      const wheels = [];
      for (let i = 0; i < wheelsAmount; i++) {
        const wheelShape = new CANNON.Cylinder(wheelDimensions.radius, wheelDimensions.radius, wheelDimensions.height, 32);
        const wheelBody = new CANNON.Body({ mass: 1 });
        wheelBody.addShape(wheelShape);
        wheels.push(wheelBody);
      }

      wheels.forEach((wheel, i) => {

        const wheelPosition = new CANNON.Vec3(
          wheelsPositions[i][0],
          wheelsPositions[i][1],
          wheelsPositions[i][2]
        );
        wheel.position.copy(wheelPosition);
        wheel.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
        threeContext.world.addBody(wheel);

        const hinge = new CANNON.HingeConstraint(body, wheel, {
          pivotA: new CANNON.Vec3(wheelPosition.x, wheelPosition.y - 1.4, wheelPosition.z), // position on car body to attach to
          pivotB: new CANNON.Vec3(0, 0, 0), // position on wheel to attach to
          axisA: new CANNON.Vec3(1, 0, 0), // where to rotate car
          axisB: new CANNON.Vec3(0, 0, 1), // where to rotate wheel
          collideConnected: false,
        });
        threeContext.world.addConstraint(hinge);
      });

      setWheels(wheels);
    }
  }, [threeContext])


  useEffect(() => {
    if (car && wheels.length && !finished) {
      console.log(car)
      wheels.forEach((wheel, i) => {
        console.log(wheel)
        const wheelGeometry = new THREE.CylinderGeometry(wheelDimensions.radius, wheelDimensions.radius, wheelDimensions.height, 32);
        // wheelGeometry.rotateZ(Math.PI / 2); // Rotate the cylinder to match the cannon js wheel's orientation
        wheelGeometry.rotateX(Math.PI / 2);
        const wheelMesh = new THREE.Mesh(wheelGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
        wheelMesh.useQuaternion = true;
        threeContext?.scene.add(wheelMesh);
        wheelMesh.position.set(wheel.position.x, wheel.position.y, wheel.position.z);
        wheelMesh.quaternion.set(wheel.quaternion.x, wheel.quaternion.y, wheel.quaternion.z, wheel.quaternion.w);
        threeContext?.addBody(wheel, wheelMesh);
      })

      const carMesh = new THREE.Mesh(new THREE.BoxGeometry(carDimensions.width, carDimensions.height, carDimensions.length), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      carMesh.useQuaternion = true;
      threeContext?.scene.add(carMesh);
      carMesh.position.set(car.position.x, car.position.y, car.position.z);
      carMesh.quaternion.set(car.quaternion.x, car.quaternion.y, car.quaternion.z, car.quaternion.w);
      threeContext?.addBody(car, carMesh);

      setFinished(true);

      setTimeout(() => {
        testMove();
      }, 2000);

    }
  }, [car, wheels])

  return (<></>)
}

export default SillyCar;