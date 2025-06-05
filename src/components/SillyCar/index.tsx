"use client"

import { useEffect, useState } from "react";
import { useThreeContext } from "@/providers/ThreeContext";

import * as CANNON from "cannon";
import * as THREE from "three";

const SillyCar = () => {

  const threeContext = useThreeContext();
  const [car, setCar] = useState<CANNON.RaycastVehicle>(null);
  const [wheels, setWheels] = useState<CANNON.Body[]>([]);
  const [frontWheels, setFrontWheels] = useState<CANNON.Body[]>([]);
  const [finished, setFinished] = useState(false);

  const carDimensions = { width: 2, height: 1, length: 5 };
  const wheelDimensions = { radius: 0.5, height: 0.25 };

  const wheelsPositions = [
    [1, 0.25, 2.5], // left front wheel (red)
    [-1, 0.25, 2.5], // right front wheel (blue)
    [1, 0.25, -2.5], // left back wheel
    [-1, 0.25, -2.5], // right back wheel
  ]

  const testMove = () => {
    if (wheels.length) {
      // console.log("MMOOOOOVVE")
      const forceMagnitude = -50000;

      const forceVector = new CANNON.Vec3(
        -forceMagnitude, //forward
        0, // up
        0 // side
      );

      // Define the point (local to the body) where the force is applied
      // This point must be offset from the center of mass to create torque
      const localPoint = new CANNON.Vec3(0, 0, 0);
      // wheels[2].applyLocalForce(forceVector, localPoint);
      // wheels[3].applyLocalForce(forceVector, localPoint);
      const angularVelocityVal = 100;
      wheels[2]?.angularVelocity.set(angularVelocityVal, 0, 0);
      wheels[3]?.angularVelocity.set(angularVelocityVal, 0, 0);
    }
  }

  const testSteer = () => {
    if (wheels.length) {
      console.log("STEERRRRR")
      const eulerAngle = new CANNON.Vec3(0, Math.PI / 4, 0);
      console.log(eulerAngle);
      const quaternion = new CANNON.Quaternion().setFromEuler(eulerAngle.x, eulerAngle.y, eulerAngle.z);
      console.log(quaternion);
      frontWheels[0]?.quaternion.copy(quaternion);
      frontWheels[1]?.quaternion.copy(quaternion);
    }
  }

  useEffect(() => {
    if (threeContext?.scene && threeContext?.world && threeContext?.startedScene && !finished && !car && !wheels.length) {
      const body = new CANNON.Body({ mass: 200 });
      const boxShape = new CANNON.Box(new CANNON.Vec3(carDimensions.width / 2, carDimensions.height / 2, carDimensions.length / 2));
      boxShape.updateConvexPolyhedronRepresentation();
      body.addShape(boxShape);

      body.position.set(0, 2, 0);
      const eulerAngle = new CANNON.Vec3(0, Math.PI / 4, 0);
      const quaternion = new CANNON.Quaternion().setFromEuler(eulerAngle.x, eulerAngle.y, eulerAngle.z);
      body.quaternion.copy(quaternion);

      threeContext.world.addBody(body);
      setCar(body);

      const holdFrontLeftWheel = new CANNON.Body({ mass: 10 });
      const holdFrontRightWheel = new CANNON.Body({ mass: 10 });
      const frontSteering = [holdFrontLeftWheel, holdFrontRightWheel];
      frontSteering.forEach((part, i) => {
        // part.fixedRotation = true;
        // part.updateMassProperties();
        const hinge = new CANNON.HingeConstraint(
          body,
          // new CANNON.Vec3(
          //   wheelsPositions[i][0],
          //   wheelsPositions[i][1] - 1.4,
          //   wheelsPositions[i][2]
          // ),
          part,
          // new CANNON.Vec3(0, 0, 0),
          {
            pivotA: new CANNON.Vec3(
              wheelsPositions[i][0],
              wheelsPositions[i][1] - 1.4,
              wheelsPositions[i][2]
            ),
            pivotB: new CANNON.Vec3(0, 0, 0),
            axisA: new CANNON.Vec3(1, 1, 1),
            axisB: new CANNON.Vec3(1, 1, 1),
            collideConnected: false
          })
        threeContext.world.addBody(part);
        threeContext.world.addConstraint(hinge);
      })
      setFrontWheels(frontSteering);


      const wheelsAmount = 4;
      const wheels = [];
      for (let i = 0; i < wheelsAmount; i++) {
        const wheelShape = new CANNON.Cylinder(wheelDimensions.radius, wheelDimensions.radius, wheelDimensions.height, 32);
        const wheelBody = new CANNON.Body({ mass: 0.5 });
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

        if (i > 1) {
          const hinge = new CANNON.HingeConstraint(body, wheel, {
            pivotA: new CANNON.Vec3(wheelPosition.x, wheelPosition.y - 1.4, wheelPosition.z), // position on car body to attach to
            pivotB: new CANNON.Vec3(0, 0, 0), // position on wheel to attach to
            axisA: new CANNON.Vec3(1, 0, 0), // where to rotate car
            axisB: new CANNON.Vec3(0, 0, 1), // where to rotate wheel
            collideConnected: false,
          });
          threeContext.world.addConstraint(hinge);
        } else {
          const hinge = new CANNON.HingeConstraint(frontSteering[i], wheel, {
            pivotA: new CANNON.Vec3(0, 0, 0), // position on car body to attach to
            pivotB: new CANNON.Vec3(0, 0, 0), // position on wheel to attach to
            axisA: new CANNON.Vec3(1, 0, 0), // where to rotate car
            axisB: new CANNON.Vec3(0, 0, 1), // where to rotate wheel
            collideConnected: false,
          });
          threeContext.world.addConstraint(hinge);
        }
      });

      setWheels(wheels);
    }
  }, [threeContext])


  useEffect(() => {
    if (car && wheels.length && !finished) {
      console.log(car)
      wheels.forEach((wheel, i) => {
        console.log(wheel)
        const wheelGeometry = new THREE.CylinderGeometry(wheelDimensions.radius, wheelDimensions.radius, wheelDimensions.height, 8);
        // wheelGeometry.rotateZ(Math.PI / 2); // Rotate the cylinder to match the cannon js wheel's orientation
        wheelGeometry.rotateX(Math.PI / 2);
        const wheelMesh = new THREE.Mesh(wheelGeometry, new THREE.MeshStandardMaterial({ color: i == 0 ? 0xff0000 : i == 1 ? 0x0000ff : 0x000000 }));
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
        threeContext?.addFrameFunction(testMove);
        // testMove();
      }, 2000);

      setTimeout(() => {
        testSteer();
      }, 6000)

    }
  }, [car, wheels])

  return (<></>)
}

export default SillyCar;