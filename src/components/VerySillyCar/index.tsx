"use client"

import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect, useRef, useState } from "react";

import RAPIER from "@dimforge/rapier3d";
import * as THREE from "three";

const VerySillyCar = () => {

  const threeContext = useThreeContext();

  const [finished, setFinished] = useState(false);
  const [car, setCar] = useState<RAPIER.RigidBody>(null);
  const path = useRef([{ x: Math.random() * 50 - 25, y: 0, z: Math.random() * 50 - 25 }]);

  const forwardRotationDifferenceThreshold = 0.1;

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

  function quaternionLookRotation(forward: { x: number, y: number, z: number }, up: { x: number, y: number, z: number }) {

    // xyz relative to target
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
    const q = { x: 0, y: 0, z: 0, w: 1 };

    if (trace > 0) {
      const s = 0.5 / Math.sqrt(trace + 1.0);
      q.w = 0.25 / s;
      q.x = (m[7] - m[5]) * s;
      q.y = (m[2] - m[6]) * s;
      q.z = (m[3] - m[1]) * s;
    } else if ((m[0] > m[4]) && (m[0] > m[8])) {
      const s = 2.0 * Math.sqrt(1.0 + m[0] - m[4] - m[8]);
      q.w = (m[7] - m[5]) / s;
      q.x = 0.25 * s;
      q.y = (m[1] + m[3]) / s;
      q.z = (m[2] + m[6]) / s;
    } else if (m[4] > m[8]) {
      const s = 2.0 * Math.sqrt(1.0 + m[4] - m[0] - m[8]);
      q.w = (m[2] - m[6]) / s;
      q.x = (m[1] + m[3]) / s;
      q.y = 0.25 * s;
      q.z = (m[5] + m[7]) / s;
    } else {
      const s = 2.0 * Math.sqrt(1.0 + m[8] - m[0] - m[4]);
      q.w = (m[3] - m[1]) / s;
      q.x = (m[2] + m[6]) / s;
      q.y = (m[5] + m[7]) / s;
      q.z = 0.25 * s;
    }

    return q;
  }

  // Vector math helpers
  function cross(a: { x: number, y: number, z: number }, b: { x: number, y: number, z: number }) {
    return {
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x
    };
  }

  function normalize(v: { x: number, y: number, z: number }) {
    const len = Math.hypot(v.x, v.y, v.z);
    return { x: v.x / len, y: v.y / len, z: v.z / len };
  }

  function dotQuat(q1: { x: number, y: number, z: number, w: number }, q2: { x: number, y: number, z: number, w: number }) {
    // dot product
    // how much vectors allign in the same direction
    return q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
  }

  function clamp(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, value));
  }

  function quaternionAngleDifference(q1: { x: number, y: number, z: number, w: number }, q2: { x: number, y: number, z: number, w: number }) {
    const dotProduct = dotQuat(q1, q2);
    const clamped = clamp(Math.abs(dotProduct), -1, 1);
    return 2 * Math.acos(clamped); // in radians
  }

  function quaternionOpposition(q1: { x: number, y: number, z: number, w: number }, q2: { x: number, y: number, z: number, w: number }) {
    // Dot gives cos(θ/2)
    const dot = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
    return 1 - Math.abs(dot); // 0 = same, 1 = fully opposite
  }

  function getForwardVector(body: RAPIER.RigidBody) {
    const rot = body.rotation();
    const { x, y, z, w } = rot;

    // Rotate (0, 0, 1) using quaternion
    // result = q * v * q^-1
    const fx = 2 * (x * z + w * y);
    const fy = 2 * (y * z - w * x);
    const fz = 1 - 2 * (x * x + y * y);

    return { x: fx, y: fy, z: fz }; // forward in world space
  }

  function signOfTarget(body: RAPIER.RigidBody, targetPos: { x: number, y: number, z: number }) {
    const bodyPos = body.translation();
    const toTarget = {
      x: targetPos.x - bodyPos.x,
      y: targetPos.y - bodyPos.y,
      z: targetPos.z - bodyPos.z,
    };

    const forward = getForwardVector(body);
    const normForward = normalize(forward);
    const normToTarget = normalize(toTarget);

    // In horizontal plane (XZ), use a 2D cross product to get signed direction
    const cross = normForward.x * normToTarget.z - normForward.z * normToTarget.x;
    // to check if front or behind
    const dot = normForward.x * normToTarget.x + normForward.z * normToTarget.z;
    // console.log(cross);
    // console.log(dot)

    const threshold = Math.cos(Math.PI / 6);
    const inFront = dot >= threshold;

    // console.log(inFront);

    if (inFront) {
      if (cross > 0) {
        // return 'target is to the LEFT';
        return -1;
      } else if (cross < 0) {
        // return 'target is to the RIGHT';
        return 1;
      } else {
        // return 'target is directly ahead or behind';
        return 0;
      }
    } else {
      return 1;
    };
  }

  function lookAt(body: RAPIER.RigidBody, target: { x: number, y: number, z: number }, delta: number) {
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
    return rotation
    // Apply the rotation
    // body.setRotation({x: 0, y: rotation.y, z: 0, w: rotation.w}, true);
    // body.setRotation(rotation, true);
  }

  const torqToRarget = (body: RAPIER.RigidBody, target: { x: number, y: number, z: number }, delta: number) => {
    const rotation = lookAt(body, target, delta);

    const rotationDifference = quaternionOpposition(rotation, body.rotation());
    const threeQuaternion = new THREE.Quaternion(rotation.x, rotation.y, rotation.z, rotation.w);
    const eulerRotation = new THREE.Euler().setFromQuaternion(threeQuaternion);
    const torqVal = 5000 * delta;
    let torqMultipler = torqVal;

    // if we are not in front of the target
    // we want to rotate faster
    if (rotationDifference > forwardRotationDifferenceThreshold) {
      const angvel = car.angvel();
      const angvelMag = Math.hypot(angvel.x, angvel.y, angvel.z);
      // console.log(angvelMag);
      torqMultipler *= 2000;
    } else {
      torqMultipler *= rotationDifference;
    }
    // console.log(rotationDifference)
    // torqMultipler *= torqMultipler
    if (torqMultipler > torqVal) torqMultipler = torqVal
    const normalizedEuler = new THREE.Vector3().setFromEuler(eulerRotation).normalize().multiplyScalar(torqMultipler);
    // console.log(rotation )
    const sign = signOfTarget(body, target);
    const turnRotation = sign * normalizedEuler.y
    // console.log(turnRotation)
    // console.log(torqVal, rotationDifference, torqMultipler)
    // console.log(sign * normalizedEuler.y)
    body.applyTorqueImpulse({ x: 0, y: turnRotation, z: 0 }, true);
  }

  const testMove = (delta: number) => {
    if (car) {
      const carCollider = car.collider(0);
      threeContext?.world.contactPairsWith(carCollider, (contact) => {
        const pathVal = path.current[0]
        const pos = car.translation(); // current position
        const forward = {
          x: pathVal.x - pos.x,
          y: pathVal.y - pos.y,
          z: pathVal.z - pos.z,
        };

        // Normalize direction
        const len = Math.hypot(forward.x, forward.y, forward.z);
        forward.x /= len;
        forward.y /= len;
        forward.z /= len;

        // Compute quaternion that looks in the direction (assumes Y-up, Z-forward)
        const up = { x: 0, y: 1, z: 0 };
        const rotation = quaternionLookRotation(forward, up);

        const rotationDifference = quaternionOpposition(rotation, car.rotation());

        const v = car.linvel(); // { x, y, z }
        const speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        const moveDirectionBackAndForth = (new Date()).getTime()
        // for some reason the car won't rotate if no force applied
        // so if we are not in direction to the target
        // move car back and forth to be able to rotate
        const distanceToTarger = Math.hypot(pathVal.x - pos.x, pathVal.y - pos.y, pathVal.z - pos.z);
        const triggerDistance = 10;
        const scaledDistance = distanceToTarger <= triggerDistance ? distanceToTarger / triggerDistance : 1;
        const forceWorld = rotationDifference > forwardRotationDifferenceThreshold ?
          { x: 0, y: 0, z: -speed + 200 * Math.sin(moveDirectionBackAndForth * 0.01) } :
          { x: 0, y: 0, z: 10000 * delta * scaledDistance }
        const localForce = worldToLocalVector(forceWorld, car);
        // console.log(speed);
        if (speed > 20) return;
        car.applyImpulse(localForce, true);
        // car.setLinvel(localForce, true);
      })
    }
  }

  const testSteer = (delta: number) => {
    if (car) {
      const carCollider = car.collider(0);
      threeContext?.world.contactPairsWith(carCollider, (contact) => {
        // const steerAngle = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 5);
        // car.setRotation({ x: steerAngle.x, y: steerAngle.y, z: steerAngle.z, w: steerAngle.w }, true);
        const angvel = car.angvel();
        // console.log(angvel)
        const angvelMag = Math.hypot(angvel.x, angvel.y, angvel.z);
        // console.log(angvelMag);
        if (angvelMag < 3) {
          let pathVal = path.current[0]
          const carPos = car.translation();
          const distanceToTarger = Math.hypot(pathVal.x - carPos.x, pathVal.y - carPos.y, pathVal.z - carPos.z);
          console.log(distanceToTarger, pathVal, carPos);  
          if (distanceToTarger < 3) {
            pathVal = { x: Math.random() * 50 - 25, y: 0, z: Math.random() * 50 - 25 }
            path.current = [pathVal];
            // TODO: go from path values, if no values, go to random
          }
          torqToRarget(car, pathVal, delta);
        } else {
          // console.log("AAAAAAAAAAA", angvel.y)
          car.applyTorqueImpulse({ x: 0, y: -angvel.y * 10, z: 0 }, true);
        }
      })
    }
  }

  useEffect(() => {
    if (threeContext?.scene && threeContext?.world && threeContext?.startedScene && !finished && !car) {
      const theShape = new RAPIER.Cuboid(carDimensions.width / 2, carDimensions.height / 2, carDimensions.length / 2);
      const colliderDesc = new RAPIER.ColliderDesc(theShape);
      const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setAdditionalMass(200)
        .setAngularDamping(0);

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