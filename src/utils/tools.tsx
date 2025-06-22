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

function dotEuler(e1: { x: number, y: number, z: number }, e2: { x: number, y: number, z: number }) {
  // dot product
  // how much vectors allign in the same direction
  return e1.x * e2.x + e1.y * e2.y + e1.z * e2.z;
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

export { quaternionLookRotation, normalize, cross, dotQuat, dotEuler, clamp, quaternionAngleDifference, quaternionOpposition, getForwardVector };