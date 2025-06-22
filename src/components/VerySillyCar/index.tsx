"use client"

import { useThreeContext } from "@/providers/ThreeContext";
import { useEffect, useRef, useState } from "react";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

import RAPIER from "@dimforge/rapier3d";
import * as THREE from "three";
import { quaternionLookRotation, normalize, dotEuler, quaternionOpposition, getForwardVector } from "@/utils/tools";

const VerySillyCar = () => {

  const threeContext = useThreeContext();

  const [finished, setFinished] = useState(false);
  const [car, setCar] = useState<RAPIER.RigidBody>(null);
  const path = useRef([{ x: Math.random() * 50 - 25, y: 0, z: Math.random() * 50 - 25 }]);
  const [pathValue, setPathValue] = useState(path.current);
  const [wheels, setWheels] = useState<RAPIER.RigidBody[]>([]);
  const [motors, setMotors] = useState<RAPIER.RevoluteImpulseJoint[]>([]);

  const upsideDownTimer = useRef<number | null>(null);


  const pathPoint = useRef(null);
  const isLookingAtTarget = useRef(false);

  // TODO: need to come up with some lyfecycle
  // for example next phases:
  // going toward target
  // looking for new target
  // braking
  // idle

  // TODO: car should probably build sub path
  // not just directly go to target
  // but it is probably for future if getting to target will get complex

  const forwardRotationDifferenceThreshold = 0.2;

  const carDimensions = { width: 2, height: 1, length: 5 };
  const wheelDimensions = { radius: 0.5, height: 0.25 };

  const wheelsPositions = [
    [1, -0.4, 1.9], // left front wheel (red)
    [-1, -0.4, 1.9], // right front wheel (blue)
    [1, -0.4, -1.9], // left back wheel
    [-1, -0.4, -1.9], // right back wheel
  ]

  function worldToLocalVector(worldVec: { x: number, y: number, z: number }, body: RAPIER.RigidBody | RAPIER.Collider) {
    const rot = body.rotation(); // Quaternion
    return rotateVectorByQuaternion(worldVec, rot);
  }

  function rotateVectorByQuaternion(v: { x: number, y: number, z: number }, q: { x: number, y: number, z: number, w: number }) {
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

    const threshold = Math.cos(Math.PI / 8);
    const inFront = dot > threshold;

    // console.log(inFront ? "front" : "behind");

    if (inFront) {
      if (cross < 0) {
        // return 'target is to the LEFT';
        // console.log("LEFT");
        return [-1, true];
      } else if (cross > 0) {
        // return 'target is to the RIGHT';
        // console.log("RIGHT");
        return [1, true];
      } else {
        // return 'target is directly ahead or behind';
        return [0, true];
      }
    } else {
      if (cross < 0) {
        // return 'target is to the LEFT';
        return [1, false];
      } else if (cross > 0) {
        // return 'target is to the RIGHT';
        return [-1, false];
      } else {
        // return 'target is directly ahead or behind';
        return [1, false];
      }
      //   return 1;
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

  // it should be that if we don't look at target (threshold)
  // we rotate on spot with default direction
  // otherwise we move forward and rotate towards target
  // and if we are driving we can't rotate too much

  const torqToRarget = (body: RAPIER.RigidBody, target: { x: number, y: number, z: number }, delta: number) => {
    const rotation = lookAt(body, target, delta);

    const rotationDifference = quaternionOpposition(rotation, body.rotation());
    const threeQuaternion = new THREE.Quaternion(rotation.x, -rotation.y, rotation.z, rotation.w);
    const eulerRotation = new THREE.Euler().setFromQuaternion(threeQuaternion);
    const torqVal = 20000 * delta;
    let torqMultipler = 100;
    const [sign, isFront] = signOfTarget(body, target);
    // const notLookingAtTarget = rotationDifference > forwardRotationDifferenceThreshold

    // if we are not in front of the target
    // we want to rotate faster
    // let sign = 1;
    if (!isFront) {
      // console.log(rotationDifference)
      // sign = 1;
      const angvel = car.angvel();
      const angvelMag = Math.hypot(angvel.x, angvel.y, angvel.z);
      // console.log(rotation);
      const v = car.linvel(); // { x, y, z }
      let speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
      if (speed > 1) speed = 1
      torqMultipler = 200 * rotationDifference;
      if (Math.abs(torqMultipler) > 200) torqMultipler = 200 * Math.sign(torqMultipler)
      // console.log(torqMultipler)
      if (isLookingAtTarget.current) {
        isLookingAtTarget.current = false
      }
    } else {
      const pathVal = path.current[0]
      const pos = car.translation(); // current position
      let distanceToTarget = Math.hypot(pathVal.x - pos.x, pathVal.y - pos.y, pathVal.z - pos.z);
      distanceToTarget = distanceToTarget < 1 ? 1 : distanceToTarget
      // torqMultipler *= Math.sqrt(rotationDifference);
      torqMultipler = 4000 / distanceToTarget
      // console.log(torqMultipler)
      if (!isLookingAtTarget.current) {
        body.setAngvel({ x: 0, y: 0, z: 0 }, true);
        isLookingAtTarget.current = true
      }

      // torqMultipler += Math.sign(torqMultipler) * rotationDifference * 1000
    }
    const normalizedEuler = new THREE.Vector3().setFromEuler(eulerRotation).normalize().multiplyScalar(torqMultipler);
    // console.log(rotation )
    // console.log(sign)
    let finalRotationValue = sign * Math.abs(normalizedEuler.y)
    if (!isFront) {
      finalRotationValue = Math.sign(finalRotationValue) * 200
      // console.log(finalRotationValue)
    }
    if (isFront) {
      // console.log(sign, finalRotationValue)
    }
    // console.log(turnRotation)
    // console.log(torqVal, rotationDifference, torqMultipler)
    // console.log(sign * normalizedEuler.y)
    // isFront ? body.resetTorques(true) : body.applyTorqueImpulse({ x: 0, y: finalRotationValue, z: 0 }, true);
    body.applyTorqueImpulse({ x: 0, y: finalRotationValue, z: 0 }, true)
  }

  const testMove = (delta: number) => {
    if (car) {
      const carCollider = car.collider(0);
      threeContext?.world.contactPairsWith(carCollider, (contact) => {
        const contactUp = worldToLocalVector({ x: 0, y: 1, z: 0 }, contact);
        const bodyUp = worldToLocalVector({ x: 0, y: 1, z: 0 }, car);
        const cosBetweenBodayAndGround = dotEuler(bodyUp, contactUp);
        // 1 means aligned (cos(0))
        // 0 means cos(90) perpendicular
        // -1 means cos(180) opposite
        if (cosBetweenBodayAndGround < 0.3) {
          // console.log(cosBetweenBodayAndGround)
          return
        }
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

        // the problem is that we start to move back and forth for angle which is still considere as front
        // const notLookingAtTarget = rotationDifference > forwardRotationDifferenceThreshold;

        const [sign, isFront] = signOfTarget(car, pathVal);

        const v = car.linvel(); // { x, y, z }
        const speed = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
        const moveDirectionBackAndForth = (new Date()).getTime()
        // for some reason the car won't rotate if no force applied
        // so if we are not in direction to the target
        // move car back and forth to be able to rotate
        const distanceToTarger = Math.hypot(pathVal.x - pos.x, pathVal.y - pos.y, pathVal.z - pos.z);
        const triggerDistance = 5;
        const angvel = car.angvel();
        let angvelMag = Math.hypot(angvel.x, angvel.y, angvel.z);
        // if angvelMag > some value -> press breaks
        // angvelMag *= 10;
        // if (angvelMag < 1) angvelMag = 1
        let scaledDistance = distanceToTarger <= triggerDistance ? distanceToTarger / (triggerDistance) : !isFront ? 1 : Math.sqrt(distanceToTarger);
        scaledDistance *= scaledDistance;
        if (scaledDistance < 1) scaledDistance = 1
        const forwardSpeed = (5000 - 100 * angvelMag) * delta * scaledDistance;
        // console.log(forwardSpeed, angvelMag, distanceToTarger)
        // { x: 0, y: 0, z: -speed + 100 * Math.sin(moveDirectionBackAndForth * 0.01) }
        const forceWorld = !isFront ?
          { x: 0, y: 0, z: -speed + 100 * Math.sin(moveDirectionBackAndForth * 0.005) } :
          { x: 0, y: 0, z: forwardSpeed }
        const localForce = worldToLocalVector(forceWorld, car);
        // console.log(speed);
        if (speed > 10) return;
        car.applyImpulse(localForce, true);
        // car.setLinvel(localForce, true);
      })
    }
  }

  const wheelsMove = () => {

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

    // the problem is that we start to move back and forth for angle which is still considere as front
    // const notLookingAtTarget = rotationDifference > forwardRotationDifferenceThreshold;

    const [sign, isFront] = signOfTarget(car, pathVal);
    const moveDirectionBackAndForth = (new Date()).getTime()

    if (isFront) {
      let distanceToTarger = Math.hypot(pathVal.x - pos.x, pathVal.y - pos.y, pathVal.z - pos.z);
      if (distanceToTarger < 1) distanceToTarger = 1
      let wheelVelocity = 10 * distanceToTarger;
      if (wheelVelocity > 100) wheelVelocity = 100;
      motors.forEach((motor) => {
        motor.configureMotorVelocity(wheelVelocity, 4)
      })
    } else {
      motors.forEach((motor) => {
        motor.configureMotorVelocity(100 * Math.round(Math.sin((moveDirectionBackAndForth || 1) * 0.005)), 2)
      })
    }
  }

  const testSteer = (delta: number) => {
    if (car) {
      const carCollider = car.collider(0);
      let isLeftWheelTouchingGround = false
      let isRightWheelTouchingGround = false
      let contactValLeft = null;
      let contactValRight = null;
      // check if front wheels touching ground
      threeContext?.world.contactPairsWith(wheels[0].collider(0), (contact) => {
        if (contact.handle !== carCollider.handle) {
          isLeftWheelTouchingGround = true
          contactValLeft = contact
        }
      })
      threeContext?.world.contactPairsWith(wheels[1].collider(0), (contact) => {
        if (contact.handle !== carCollider.handle) {
          isRightWheelTouchingGround = true
          contactValRight = contact
        }
      })
      // threeContext?.world.contactPairsWith(wheels[0].collider(0), (contact) => {
      // if any wheel touches ground and we have info where they touching
      if ((contactValLeft || contactValRight) && (isLeftWheelTouchingGround || isRightWheelTouchingGround)) {
        // now check that car is up right relative to what front wheels are touching
        // get up vector of car
        const bodyUp = worldToLocalVector({ x: 0, y: 1, z: 0 }, car);
        // set to -2 because -1 will be minimum possible value and less than that means there is no contact
        let cosBetweenBodyAndGroundLeft = -2;
        if (contactValLeft) {
          // get up vector of what left front wheel is touching
          const contactUpLeft = worldToLocalVector({ x: 0, y: 1, z: 0 }, contactValLeft);
          // get dot value (cosine of angle between vectors) between body up and what left front wheel is touching
          cosBetweenBodyAndGroundLeft = dotEuler(bodyUp, contactUpLeft);
        }

        let cosBetweenBodyAndGroundRight = -2;
        if (contactValRight) {
          // get up vector of what right front wheel is touching
          const contactUpRight = worldToLocalVector({ x: 0, y: 1, z: 0 }, contactValRight);
          // get dot value (cosine of angle between vectors) between body up and what right front wheel is touching
          cosBetweenBodyAndGroundRight = dotEuler(bodyUp, contactUpRight);
        }

        // if both angles are more than acos(0.3) (somewhere between 60 and 90 degrees) don't steer the car (don't physically rotate it in this case)
        if (cosBetweenBodyAndGroundLeft < 0.3 && cosBetweenBodyAndGroundRight < 0.3) {
          return
        }
        // TODO: logic above maybe will become redundant after making actual steering wheels
        // but I can use this to rotate car up right if it is upside down

        // const steerAngle = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 5);
        // car.setRotation({ x: steerAngle.x, y: steerAngle.y, z: steerAngle.z, w: steerAngle.w }, true);
        const angvel = car.angvel();
        // console.log(angvel)
        const angvelMag = Math.hypot(angvel.x, angvel.y, angvel.z);
        // console.log(angvelMag);
        if (angvelMag < 3) {
          const pathVal = path.current[0]
          torqToRarget(car, pathVal, delta);
        } else {
          // console.log("AAAAAAAAAAA", angvel.y)
          car.applyTorqueImpulse({ x: 0, y: -angvel.y * 10, z: 0 }, true);
        }
      } else if (!(isLeftWheelTouchingGround || isRightWheelTouchingGround)) {
        let noCollision = true;
        threeContext?.world.contactPairsWith(car.collider(0), (contact) => {
          if (
            contact.handle != wheels[0].collider(0).handle &&
            contact.handle != wheels[1].collider(0).handle &&
            contact.handle != wheels[2].collider(0).handle &&
            contact.handle != wheels[3].collider(0).handle
          ) {
            noCollision = false;
            // get up vector of what left front wheel is touching
            const contactUp = worldToLocalVector({ x: 0, y: 1, z: 0 }, contact);
            const bodyUp = worldToLocalVector({ x: 0, y: 1, z: 0 }, car);
            // get dot value (cosine of angle between vectors) between body up and what left front wheel is touching
            const cosBetweenBodyAndGround = dotEuler(bodyUp, contactUp);
            if (cosBetweenBodyAndGround <= 0) {
              // car is upside down
              if (!upsideDownTimer.current) {
                const newUpsideDownTimer = setTimeout(() => {
                  // console.log("rotate the car")
                  fixUpsideDownCar(car);
                }, 3000)
                upsideDownTimer.current = newUpsideDownTimer;
              }
            } else {
              if (upsideDownTimer.current) {
                // console.log("here?", cosBetweenBodyAndGround)
                clearTimeout(upsideDownTimer.current);
                upsideDownTimer.current = null;
              }
            }
          }
        })
        if (noCollision && upsideDownTimer.current) {
          // console.log("here?")
          clearTimeout(upsideDownTimer.current);
          upsideDownTimer.current = null;
        }
      }
      // })
    }
  }

  const update = (delta: number) => {
    let pathVal = path.current[0]
    const carPos = car.translation();
    const distanceToTarger = Math.hypot(pathVal.x - carPos.x, pathVal.z - carPos.z);
    if (distanceToTarger < 3) {
      console.log("TARGET REACHED");
      pathVal = { x: Math.random() * 50 - 25, y: 0, z: Math.random() * 50 - 25 }
      path.current = [pathVal];
      setPathValue([pathVal]);
      // TODO: go from path values, if no values, go to random
    }
  }

  function resetBodyForces(body: RAPIER.RigidBody) {
    body.setLinvel({ x: 0, y: 0, z: 0 }, false);
    body.setAngvel({ x: 0, y: 0, z: 0 }, false);
    body.resetForces(false);
    body.resetTorques(false);
  }

  function fixUpsideDownCar(body: RAPIER.RigidBody) {
    const currentPosition = body.translation();
    body.setTranslation({ x: currentPosition.x, y: currentPosition.y + 1, z: currentPosition.z }, true);
    body.setRotation({ x: 0, y: 0, z: 0, w: 1 }, true);
    resetBodyForces(body);
  }

  useEffect(() => {
    if (threeContext?.scene && threeContext?.world && threeContext?.startedScene && !finished && !car && !wheels.length) {
      const theShape = new RAPIER.Cuboid(carDimensions.width / 2, carDimensions.height / 2, carDimensions.length / 2);
      const colliderDesc = new RAPIER.ColliderDesc(theShape)
        .setFriction(1);
      const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
        .setAdditionalMass(200);

      const body = threeContext?.world.createRigidBody(bodyDesc);
      const collider = threeContext?.world.createCollider(colliderDesc, body);
      collider.setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);

      body.setTranslation({ x: 0, y: 20, z: 0 }, true);
      // body.setRotation({ x: 0, y: 0, z: Math.PI/3, w: 1 }, true);

      setCar(body);

      const wheelsArray = wheelsPositions.map((wheelPos) => {
        const wheelShape = new RAPIER.Cylinder(wheelDimensions.height / 2, wheelDimensions.radius);
        const wheelColliderDesc = new RAPIER.ColliderDesc(wheelShape)
          .setRotation(new THREE.Quaternion().setFromAxisAngle(new RAPIER.Vector3(0, 0, 1), -Math.PI / 2))
          .setFriction(4);
        const wheelBodyDesc = RAPIER.RigidBodyDesc.dynamic()
          .setAdditionalMass(50)
          .setTranslation(0, 0, 0)
        // .setRotation({ x: Math.PI / 2, y: 0, z: 0, w: 1 });

        const wheelBody = threeContext?.world.createRigidBody(wheelBodyDesc);
        // wheelBody.setRotation({ x: 0, y: 0, z: Math.PI / 2, w: 1 }, true);
        const wheelCollider = threeContext?.world.createCollider(wheelColliderDesc, wheelBody);
        return wheelBody
      });
      setWheels(wheelsArray);

      const motorsArray = []
      wheelsArray.forEach((wheel, i) => {

        const wheelRoatateAxis = { x: i < 2 ? -1 : 1, y: 0, z: 0 };

        // if (i > 1) {
        const anchor1 = {
          x: wheelsPositions[i][0],
          y: wheelsPositions[i][1],
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
        wheelJoint.setContactsEnabled(false);
        if (i > 1) {
          motorsArray.push(wheelJoint);
        }
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
      setMotors(motorsArray);
    }
  }, [threeContext])

  useEffect(() => {
    if (car && wheels.length && !finished) {
      const carBottomGeometry = new THREE.BoxGeometry(carDimensions.width, carDimensions.height, carDimensions.length)
      // carBottomGeometry.translate(0, 0.2, 0);
      const carMesh = new THREE.Mesh(carBottomGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
      carMesh.useQuaternion = true;
      threeContext?.scene.add(carMesh);
      const carMeshUpGeometry = new THREE.BoxGeometry(carDimensions.width, carDimensions.height, carDimensions.length / 2);
      carMeshUpGeometry.translate(0, carDimensions.height, 0);
      const carMeshUp = new THREE.Mesh(carMeshUpGeometry, new THREE.MeshStandardMaterial({ color: 0xffffff }));
      carMeshUp.useQuaternion = true;
      threeContext?.scene.add(carMeshUp);
      threeContext?.addBody(car, carMesh);
      threeContext?.addBody(car, carMeshUp);
      wheels.forEach((wheel) => {
        const wheelGeometry = new THREE.CylinderGeometry(wheelDimensions.radius, wheelDimensions.radius, wheelDimensions.height, 8);
        wheelGeometry.rotateZ(Math.PI / 2);
        // wheelGeometry.translate(wheelPosition.x, wheelPosition.y, wheelPosition.z);
        const wheelMesh = new THREE.Mesh(wheelGeometry, new THREE.MeshStandardMaterial({ color: 0x000000 }));
        threeContext?.scene.add(wheelMesh);
        threeContext?.addBody(wheel, wheelMesh);

        resetBodyForces(wheel);
      });
      // car.resetForces(true);
      // car.resetTorques(true);
      resetBodyForces(car);

      setFinished(true);

      car.sleep()

      threeContext?.addFrameFunction(update);
      setTimeout(() => {
        // threeContext?.addFrameFunction(testMove);
        // testMove();
        // console.log("wheelsMove")
        threeContext?.addFrameFunction(wheelsMove);
      }, 10000);

      setTimeout(() => {
        threeContext?.addFrameFunction(testSteer);
      }, 0)

    }
  }, [car])

  useEffect(() => {
    if (threeContext?.scene && threeContext?.world && threeContext?.startedScene) {
      if (pathPoint.current) {
        threeContext?.scene.remove(pathPoint.current);
      }
      if (path.current) {

        const pathPointerMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 100, 1), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        threeContext?.scene.add(pathPointerMesh);
        pathPointerMesh.position.set(path.current[0].x, path.current[0].y, path.current[0].z);

        pathPoint.current = pathPointerMesh
      }
    }
  }, [threeContext, pathValue])

  return <></>
}

export default VerySillyCar