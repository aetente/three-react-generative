"use client"

import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect, useRef, useState } from "react";

import RAPIER from "@dimforge/rapier3d";
import * as THREE from "three";

const VerySillyCar = () => {

  const threeContext = useThreeContext();

  const [finished, setFinished] = useState(false);
  const [car, setCar] = useState<RAPIER.RigidBody>(null);
  const path = useRef([{x: Math.random() * 50 - 25, y: 0, z: Math.random() * 50 - 25}]);


  const carDimensions = { width: 2, height: 1, length: 5 };

  function worldToLocalVector(worldVec, body) {
    const rot = body.rotation(); // Quaternion
    return rotateVectorByQuaternion(worldVec, rot);
  }

  function rotateVectorByQuaternion(v, q) {
    const x = v.x, y = v.y, z = v.z;
    const qx = q.x, qy = q.y, qz = q.z, qw = q.w;

    // t = 2 * cross(q.xyz, v)
    const tx = 2 * (qy * z - qz * y);
    const ty = 2 * (qz * x - qx * z);
    const tz = 2 * (qx * y - qy * x);

    // v' = v + qw * t + cross(q.xyz, t)
    return {
      x: x + qw * tx + (qy * tz - qz * ty),
      y: y + qw * ty + (qz * tx - qx * tz),
      z: z + qw * tz + (qx * ty - qy * tx),
    };
  }

  function quaternionLookRotation(forward, up) {
    const z = normalize(forward);
    const x = normalize(cross(up, z));
    const y = cross(z, x);

    const m = [
      x.x, y.x, z.x,
      x.y, y.y, z.y,
      x.z, y.z, z.z
    ];

    // Convert 3x3 matrix to quaternion
    const trace = m[0] + m[4] + m[8];
    let q = { x: 0, y: 0, z: 0, w: 1 };

    if (trace > 0) {
      let s = 0.5 / Math.sqrt(trace + 1.0);
      q.w = 0.25 / s;
      q.x = (m[7] - m[5]) * s;
      q.y = (m[2] - m[6]) * s;
      q.z = (m[3] - m[1]) * s;
    } else if ((m[0] > m[4]) && (m[0] > m[8])) {
      let s = 2.0 * Math.sqrt(1.0 + m[0] - m[4] - m[8]);
      q.w = (m[7] - m[5]) / s;
      q.x = 0.25 * s;
      q.y = (m[1] + m[3]) / s;
      q.z = (m[2] + m[6]) / s;
    } else if (m[4] > m[8]) {
      let s = 2.0 * Math.sqrt(1.0 + m[4] - m[0] - m[8]);
      q.w = (m[2] - m[6]) / s;
      q.x = (m[1] + m[3]) / s;
      q.y = 0.25 * s;
      q.z = (m[5] + m[7]) / s;
    } else {
      let s = 2.0 * Math.sqrt(1.0 + m[8] - m[0] - m[4]);
      q.w = (m[3] - m[1]) / s;
      q.x = (m[2] + m[6]) / s;
      q.y = (m[5] + m[7]) / s;
      q.z = 0.25 * s;
    }

    return q;
  }

  // Vector math helpers
  function cross(a, b) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  function normalize(v) {
    const len = Math.hypot(v.x, v.y, v.z);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
  }

  function lookAt(body, target) {
    const pos = body.translation(); // current position
    const forward = {
      x: target.x - pos.x,
      y: target.y - pos.y,
      z: target.z - pos.z,
    };

    // Normalize direction
    const len = Math.hypot(forward.x, forward.y, forward.z);
    forward.x /= len;
    forward.y /= len;
    forward.z /= len;

    // Compute quaternion that looks in the direction (assumes Y-up, Z-forward)
    const up = { x: 0, y: 1, z: 0 };
    const rotation = quaternionLookRotation(forward, up);

    // Apply the rotation
    body.setRotation({x: 0, y: rotation.y, z: 0, w: rotation.w}, true); // true = wake up
  }

  const testMove = (delta) => {
    if (car) {
      const forceWorld = { x: 0, y: 0, z: 5000*delta }
      const localForce = worldToLocalVector(forceWorld, car);
      const carCollider = car.collider(0);
      threeContext?.world.contactPairsWith(carCollider, (contact) => {
        const v = car.linvel(); // { x, y, z }
        const speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        // console.log(speed);
        if (speed > 10) return;
        car.applyImpulse(localForce, true);
        // car.setLinvel(localForce, true);
      })
    }
  }

  const testSteer = () => {
    if (car) {
      // const steerAngle = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 5);
      // car.setRotation({ x: steerAngle.x, y: steerAngle.y, z: steerAngle.z, w: steerAngle.w }, true);
      let pathVal = path.current[0]
      if (Math.random() > 0.99) {
        pathVal = { x: Math.random() * 50 - 25, y: 0, z: Math.random() * 50 - 25 }
        path.current = [pathVal];
      }
      lookAt(car, pathVal);
    }
  }

  useEffect(() => {
    if (threeContext?.scene && threeContext?.world && threeContext?.startedScene && !finished && !car) {
      const theShape = new RAPIER.Cuboid(carDimensions.width / 2, carDimensions.height / 2, carDimensions.length / 2);
      const colliderDesc = new RAPIER.ColliderDesc(theShape);
      const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setAdditionalMass(200);

      const body = threeContext?.world.createRigidBody(bodyDesc);
      const collider = threeContext?.world.createCollider(colliderDesc, body);
      collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

      body.setTranslation({ x: 0, y: 2, z: 0 }, true);

      setCar(body);
    }
  }, [threeContext])

  useEffect(() => {
    if (car && !finished) {

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
      }, 1000);

      setTimeout(() => {
        threeContext?.addFrameFunction(testSteer);
      }, 2000)

    }
  }, [car])

  return <></>
}

export default VerySillyCar