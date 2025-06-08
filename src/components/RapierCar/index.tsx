"use client"


import { useEffect, useState } from "react";
import { useThreeContext } from "@/providers/ThreeContext";

import RAPIER from "@dimforge/rapier3d";
import * as THREE from "three";


const RapierCar = () => {

  const threeContext = useThreeContext();
  const [car, setCar] = useState<RAPIER.RigidBody>(null);
  const [wheels, setWheels] = useState<RAPIER.RigidBody[]>([]);
  const [frontWheels, setFrontWheels] = useState<RAPIER.RigidBody[]>([]);
  const [finished, setFinished] = useState(false);

  const carDimensions = { width: 2, height: 1, length: 5 };
  const wheelDimensions = { radius: 0.5, height: 0.25 };

  const wheelsPositions = [
    [1.2, 0.25, 2.5], // left front wheel (red)
    [-1.2, 0.25, 2.5], // right front wheel (blue)
    [1.2, 0.25, -2.5], // left back wheel
    [-1.2, 0.25, -2.5], // right back wheel
  ]

  function rotateVectorByQuat(v, q) {
    // Quaternion-vector multiplication
    const qx = q.x, qy = q.y, qz = q.z, qw = q.w;
    const vx = v.x, vy = v.y, vz = v.z;

    // t = 2 * cross(q.xyz, v)
    const tx = 2 * (qy * vz - qz * vy);
    const ty = 2 * (qz * vx - qx * vz);
    const tz = 2 * (qx * vy - qy * vx);

    // v' = v + qw * t + cross(q.xyz, t)
    const result = {
      x: vx + qw * tx + (qy * tz - qz * ty),
      y: vy + qw * ty + (qz * tx - qx * tz),
      z: vz + qw * tz + (qx * ty - qy * tx),
    };

    return result;
  }

  const testMove = () => {
    if (wheels.length) {
      // console.log("MMOOOOOVVE") 
      // const forceMagnitude = -50000;

      // const forceVector = new CANNON.Vec3(
      //   -forceMagnitude, //forward
      //   0, // up
      //   0 // side
      // );

      // Define the point (local to the body) where the force is applied
      // This point must be offset from the center of mass to create torque
      // const localPoint = new CANNON.Vec3(0, 0, 0);
      // wheels[2].applyLocalForce(forceVector, localPoint);
      // wheels[3].applyLocalForce(forceVector, localPoint);
      // const angularVelocityVal = new RAPIER.Vector3(100, 0, 0);
      // const wheel1Rotation = wheels[2]?.rotation();
      // const wheel2Rotation = wheels[3]?.rotation();
      // const threeWheel1Rotation = new THREE.Quaternion(wheel1Rotation.x, wheel1Rotation.y, wheel1Rotation.z, wheel1Rotation.w);
      // const threeWheel2Rotation = new THREE.Quaternion(wheel2Rotation.x, wheel2Rotation.y, wheel2Rotation.z, wheel2Rotation.w);
      // const wheel1Euler = new THREE.Euler().setFromQuaternion(threeWheel1Rotation);
      // const wheel2Euler = new THREE.Euler().setFromQuaternion(threeWheel2Rotation);
      // const wheel1Norm = new THREE.Vector3().setFromEuler(wheel1Euler).normalize().multiplyScalar(10);
      // const wheel2Norm = new THREE.Vector3().setFromEuler(wheel2Euler).normalize().multiplyScalar(10);
      // const absWheel1Norm = new THREE.Vector3(Math.abs(wheel1Norm.x), Math.abs(wheel1Norm.y), Math.abs(wheel1Norm.z));
      // const absWheel2Norm = new THREE.Vector3(Math.abs(wheel2Norm.x), Math.abs(wheel2Norm.y), Math.abs(wheel2Norm.z));
      // // console.log(wheel1Rotation, absWheel1Norm);    
      // wheels[2]?.setAngvel(absWheel1Norm, true);
      // wheels[3]?.setAngvel(absWheel2Norm, true);
      const worldVector = new RAPIER.Vector3(10, 0, 0);

      const quat1 = wheels[2].rotation();
      const inverseQuat1 = {
        x: -quat1.x,
        y: -quat1.y,
        z: -quat1.z,
        w: quat1.w,
      };

      const quat2 = wheels[3].rotation();
      const inverseQuat2 = {
        x: -quat2.x,
        y: -quat2.y,
        z: -quat2.z,
        w: quat2.w,
      };

      const localVector1 = rotateVectorByQuat(worldVector, inverseQuat1);
      const localVector2 = rotateVectorByQuat(worldVector, inverseQuat2);

      // console.log(localVector1)

      wheels[2].addTorque(localVector1, true);
      wheels[3].addTorque(localVector2, true);
    }
  }

  const testSteer = () => {
    if (wheels.length) {
      console.log("STEERRRRR")
      const steerAngle = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 5);
      wheels[0]?.setRotation({ x: steerAngle.x, y: steerAngle.y, z: steerAngle.z, w: steerAngle.w }, true);
      wheels[1]?.setRotation({ x: steerAngle.x, y: steerAngle.y, z: steerAngle.z, w: steerAngle.w }, true);
    }
  }

  useEffect(() => {
    if (threeContext?.scene && threeContext?.world && threeContext?.startedScene && !finished && !car && !wheels.length) {

      const theShape = new RAPIER.Cuboid(carDimensions.width / 2, carDimensions.height / 2, carDimensions.length / 2);
      const colliderDesc = new RAPIER.ColliderDesc(theShape);
      const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setAdditionalMass(200);

      const body = threeContext?.world.createRigidBody(bodyDesc);
      const collider = threeContext?.world.createCollider(colliderDesc, body);

      body.setTranslation({ x: 0, y: 2, z: 0 }, true);
      // const eulerAngle = new CANNON.Vec3(0, Math.PI / 4, 0);
      // const quaternion = new CANNON.Quaternion().setFromEuler(eulerAngle.x, eulerAngle.y, eulerAngle.z);
      // body.quaternion.copy(quaternion);

      setCar(body);

      // const zeroShape = new RAPIER.Ball(0.1);
      // const zeroColliderDesc = new RAPIER.ColliderDesc(zeroShape);
      // const zeroBodyDesc = RAPIER.RigidBodyDesc.dynamic()
      //   .setAdditionalMass(0.1);

      // const holdFrontLeftWheel = threeContext?.world.createRigidBody(zeroBodyDesc);
      // const holdFrontRightWheel = threeContext?.world.createRigidBody(zeroBodyDesc);

      // const frontSteering = [holdFrontLeftWheel, holdFrontRightWheel];
      // frontSteering.forEach((part, i) => {
      //   const anchor1 = {
      //     x: wheelsPositions[i][0],
      //     y: wheelsPositions[i][1] - 1.4,
      //     z: wheelsPositions[i][2]
      //   }
      //   const anchor2 = {
      //     x: 0,
      //     y: 0,
      //     z: 0
      //   }
      //   const axis = { x: 1.0, y: 0.0, z: 0.0 };
      //   const rotateJoint = RAPIER.JointData.spherical(
      //     anchor1,
      //     // { w: 1.0, x: 1.0, y: 1.0, z: 1.0 },
      //     anchor2,
      //     // { w: 1.0, x: 1.0, y: 1.0, z: 1.0 }
      //   );
      //   const steerJoin = threeContext?.world.createImpulseJoint(rotateJoint, body, part, true);
      //   console.log("steerJoin", steerJoin)
      // })
      // setFrontWheels(frontSteering);


      const wheelsAmount = 4;
      const wheels = [];
      for (let i = 0; i < wheelsAmount; i++) {
        // const wheelShape = new RAPIER.Cylinder(wheelDimensions.radius, wheelDimensions.height/2);
        const wheelShape = new RAPIER.Ball(wheelDimensions.radius);
        const wheelColliderDesc = new RAPIER.ColliderDesc(wheelShape);


        const wheelAngle = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);
        const wheelBodyDesc = RAPIER.RigidBodyDesc.dynamic()
          .setAdditionalMass(10)
          .setTranslation(wheelsPositions[i][0], wheelsPositions[i][1], wheelsPositions[i][2])
          .setRotation(new RAPIER.Quaternion(wheelAngle.x, wheelAngle.y, wheelAngle.z, wheelAngle.w));

        const wheelBody = threeContext?.world.createRigidBody(wheelBodyDesc);
        const wheelCollider = threeContext?.world.createCollider(wheelColliderDesc, wheelBody);
        wheelBody.setRotation(new RAPIER.Quaternion(wheelAngle.x, wheelAngle.y, wheelAngle.z, wheelAngle.w), true);

        // const wheelShape = new CANNON.Cylinder(wheelDimensions.radius, wheelDimensions.radius, wheelDimensions.height, 32);
        // const wheelBody = new CANNON.Body({ mass: 0.5 });
        // wheelBody.addShape(wheelShape);
        wheels.push(wheelBody);
      }

      wheels.forEach((wheel, i) => {

        console.log(wheel)
        const wheelRoatateAxis = { x: 1, y: 0, z: 0 };
        const wheelAngle = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);

        // if (i > 1) {
          const anchor1 = {
            x: wheelsPositions[i][0],
            y: wheelsPositions[i][1] - 1.4,
            z: wheelsPositions[i][2]
          }
          const anchor2 = {
            x: 0,
            y: 0,
            z: 0
          }
          const rotateJoint = RAPIER.JointData.revolute(
            anchor1,
            anchor2,
            wheelRoatateAxis
          );
          const wheelJoint = threeContext?.world.createImpulseJoint(rotateJoint, body, wheel, true);
        // } else {
        //   const anchor1 = {
        //     x: 0,
        //     y: 0,
        //     z: 0
        //   }
        //   const anchor2 = {
        //     x: 0,
        //     y: 0,
        //     z: 0
        //   }
        //   const rotateJoint = RAPIER.JointData.revolute(
        //     anchor1,
        //     anchor2,
        //     wheelRoatateAxis
        //   );
        //   const wheelJoint = threeContext?.world.createImpulseJoint(rotateJoint, frontSteering[i], wheel, true);
        // }
        // wheel.setRotation(wheelAngle, true);
      });

      setWheels(wheels);
    }
  }, [threeContext])


  useEffect(() => {
    if (car && wheels.length && !finished) {
      wheels.forEach((wheel, i) => {
        const wheelGeometry = new THREE.CylinderGeometry(wheelDimensions.radius, wheelDimensions.radius, wheelDimensions.height, 8);
        wheelGeometry.rotateZ(Math.PI / 2);
        // wheelGeometry.rotateY(Math.PI / 2);
        // wheelGeometry.rotateX(Math.PI / 2);
        const wheelMesh = new THREE.Mesh(wheelGeometry, new THREE.MeshStandardMaterial({ color: i == 0 ? 0xff0000 : i == 1 ? 0x0000ff : 0x000000 }));
        wheelMesh.useQuaternion = true;
        threeContext?.scene.add(wheelMesh);
        console.log(wheel.rotation())
        wheelMesh.position.set(wheel.translation().x, wheel.translation().y, wheel.translation().z);
        wheelMesh.quaternion.set(wheel.rotation().x, wheel.rotation().y, wheel.rotation().z, wheel.rotation().w);
        threeContext?.addBody(wheel, wheelMesh);
      })

      const carMesh = new THREE.Mesh(new THREE.BoxGeometry(carDimensions.width, carDimensions.height, carDimensions.length), new THREE.MeshStandardMaterial({ color: 0xffffff }));
      carMesh.useQuaternion = true;
      threeContext?.scene.add(carMesh);
      carMesh.position.set(car.translation().x, car.translation().y, car.translation().z);
      carMesh.quaternion.set(car.rotation().x, car.rotation().y, car.rotation().z, car.rotation().w);
      threeContext?.addBody(car, carMesh);

      setFinished(true);

      setTimeout(() => {
        threeContext?.addFrameFunction(testMove);
        // testMove();
      }, 2000);

      // setTimeout(() => {
      //   testSteer();
      // }, 4000)

    }
  }, [car, wheels])

  return (<></>)
}

export default RapierCar;