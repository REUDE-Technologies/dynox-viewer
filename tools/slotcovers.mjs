// Add orange T-slot cover strips to every exposed slot of the aluminium extrusions in a flat
// DynoX GLB (nodes "p<i>"). One cover mesh is appended per extrusion so it moves with that profile.
// Usage: node slotcovers.mjs in.glb out.glb map.json "<comma-separated extrusion node indices>"
import fs from 'fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const [src, out, mapOut, list] = process.argv.slice(2);
const EXT = list.split(',').map(Number);
const PITCH = 40;          // 40-series profiles: one slot per 40 mm of face width
const HALF_W = 4.4;        // strip half-width (series-8 slot opening ~8.2 mm)
const ABOVE = 0.6, BELOW = 1.6, END_GAP = 2, MIN_LEN = 12;

await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(src);
const root = doc.getRoot();
const scene = root.listScenes()[0];
const nodes = root.listNodes();
const byIdx = new Map(nodes.map((n) => [+n.getName().slice(1), n]));
const nextIdx = Math.max(...byIdx.keys()) + 1;

const mulP = (m, x, y, z) => [m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a); return a.map((x) => x / l); };
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];

function worldVerts(node) {
  const m = node.getWorldMatrix();
  const pts = [];
  for (const prim of node.getMesh().listPrimitives()) {
    const acc = prim.getAttribute('POSITION');
    const el = [];
    for (let i = 0; i < acc.getCount(); i++) { acc.getElement(i, el); pts.push(mulP(m, el[0], el[1], el[2])); }
  }
  return pts;
}
function aabb(pts) {
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (const p of pts) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], p[a]); mx[a] = Math.max(mx[a], p[a]); }
  return [mn, mx];
}
function principal(pts) {
  const c = [0, 0, 0]; pts.forEach((p) => { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; }); c.forEach((_, a) => { c[a] /= pts.length; });
  const C = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
  for (const p of pts) { const d = sub(p, c); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) C[i][j] += d[i] * d[j]; }
  let v = [0.577, 0.577, 0.577];
  for (let k = 0; k < 60; k++) v = norm([dot(C[0], v), dot(C[1], v), dot(C[2], v)]);
  return { c, u: v };
}

// Every node's world AABB (occluders)
const boxes = new Map(), verts = new Map();
for (const [i, n] of byIdx) if (n.getMesh()) { const v = worldVerts(n); verts.set(i, v); boxes.set(i, aabb(v)); }

const map = {};
let k = 0;
for (const ei of EXT) {
  const node = byIdx.get(ei);
  const pts = worldVerts(node);
  const { c, u } = principal(pts);
  const axes = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  const a2 = norm(sub(axes.reduce((best, a) => (Math.abs(dot(a, u)) < Math.abs(dot(best, u)) ? a : best)), [0, 0, 0]));
  const a2o = norm(add(a2, u, -dot(a2, u)));
  const a3 = norm(cross(u, a2o));
  let t0 = Infinity, t1 = -Infinity, p0 = Infinity, p1 = -Infinity, q0 = Infinity, q1 = -Infinity;
  for (const p of pts) {
    const d = sub(p, c);
    const t = dot(d, u), pp = dot(d, a2o), q = dot(d, a3);
    t0 = Math.min(t0, t); t1 = Math.max(t1, t); p0 = Math.min(p0, pp); p1 = Math.max(p1, pp); q0 = Math.min(q0, q); q1 = Math.max(q1, q);
  }
  // Use the straight section only: for 45° braces the bevelled ends shorten the usable length.
  const w2 = p1 - p0, w3 = q1 - q0;
  const bevel = Math.abs(dot(u, [0, 1, 0])) > 0.3 && Math.abs(dot(u, [0, 1, 0])) < 0.9 ? Math.max(w2, w3) : 0;
  const faces = [];
  const slotsAlong = (w, lo) => Array.from({ length: Math.max(1, Math.round(w / PITCH)) }, (_, j) => lo + PITCH / 2 + j * PITCH);
  for (const [n, off, lat, wl, lo] of [[a2o, p1, a3, w3, q0], [a2o.map((x) => -x), -p0, a3, w3, q0], [a3, q1, a2o, w2, p0], [a3.map((x) => -x), -q0, a2o, w2, p0]]) {
    if (n[1] < -0.9 && c[1] + n[1] * off < 5) continue; // face lying on the floor
    for (const s of slotsAlong(wl, lo)) faces.push({ n, off, lat, s });
  }
  const P = [], Nn = [], I = [];
  const ebox = boxes.get(ei);
  const near = [...boxes].filter(([j, b]) => j !== ei && b[0].every((v, a) => v < ebox[1][a] + 12) && b[1].every((v, a) => v > ebox[0][a] - 12));
  for (const f of faces) {
    const base = add(c, f.n, f.off);
    const lineC = add(base, f.lat, f.s);
    const occ = [];
    const oblique = Math.max(...u.map(Math.abs)) < 0.99;
    if (oblique) {
      // Slanted profile: test real vertices of nearby parts against the slot slab.
      const ts = [];
      for (const [j] of near) for (const p of verts.get(j)) {
        const d = sub(p, lineC);
        const l = dot(d, f.lat), nn = dot(d, f.n);
        if (Math.abs(l) < HALF_W + 2 && nn > -BELOW - 6 && nn < ABOVE + 3) ts.push(dot(d, u));
      }
      ts.sort((a, b) => a - b);
      for (let i = 0; i < ts.length; i++) {
        let j = i; while (j + 1 < ts.length && ts[j + 1] - ts[j] < 15) j++;
        occ.push([ts[i] - 2, ts[j] + 2]); i = j;
      }
    }
    for (const [, b] of oblique ? [] : near) {
      let lmin = Infinity, lmax = -Infinity, nmin = Infinity, nmax = -Infinity, tmin = Infinity, tmax = -Infinity;
      for (let q = 0; q < 8; q++) {
        const p = [q & 1 ? b[1][0] : b[0][0], q & 2 ? b[1][1] : b[0][1], q & 4 ? b[1][2] : b[0][2]];
        const d = sub(p, lineC);
        const l = dot(d, f.lat), nn = dot(d, f.n), t = dot(d, u);
        lmin = Math.min(lmin, l); lmax = Math.max(lmax, l); nmin = Math.min(nmin, nn); nmax = Math.max(nmax, nn); tmin = Math.min(tmin, t); tmax = Math.max(tmax, t);
      }
      if (lmax > -HALF_W - 1 && lmin < HALF_W + 1 && nmax > -BELOW - 6 && nmin < ABOVE + 2) occ.push([tmin - 1, tmax + 1]);
    }
    // free intervals along u (relative to c, so subtract the face offset projection: lineC lies at t = 0 of c)
    let segs = [[t0 + END_GAP + bevel, t1 - END_GAP - bevel]];
    for (const [a, b] of occ.sort((x, y) => x[0] - y[0])) {
      segs = segs.flatMap(([s0, s1]) => (b <= s0 || a >= s1 ? [[s0, s1]] : [[s0, a], [b, s1]].filter(([x, y]) => y - x > 0)));
    }
    for (const [s0, s1] of segs) {
      if (s1 - s0 < MIN_LEN) continue;
      // box corners
      const vb = P.length / 3;
      const corner = (t, l, nn) => add(add(add(lineC, u, t), f.lat, l), f.n, nn);
      const quads = [
        [f.n, [[s0, -HALF_W, ABOVE], [s1, -HALF_W, ABOVE], [s1, HALF_W, ABOVE], [s0, HALF_W, ABOVE]]],
        [f.lat, [[s0, HALF_W, -BELOW], [s0, HALF_W, ABOVE], [s1, HALF_W, ABOVE], [s1, HALF_W, -BELOW]]],
        [f.lat.map((x) => -x), [[s0, -HALF_W, -BELOW], [s1, -HALF_W, -BELOW], [s1, -HALF_W, ABOVE], [s0, -HALF_W, ABOVE]]],
        [u, [[s1, -HALF_W, -BELOW], [s1, HALF_W, -BELOW], [s1, HALF_W, ABOVE], [s1, -HALF_W, ABOVE]]],
        [u.map((x) => -x), [[s0, -HALF_W, -BELOW], [s0, -HALF_W, ABOVE], [s0, HALF_W, ABOVE], [s0, HALF_W, -BELOW]]],
      ];
      let v = vb;
      for (const [nrm, qd] of quads) {
        for (const [t, l, nn] of qd) { P.push(...corner(t, l, nn)); Nn.push(...nrm); }
        // orient triangles to face the normal
        const A = qd.map(([t, l, nn]) => corner(t, l, nn));
        const fwd = dot(cross(sub(A[1], A[0]), sub(A[2], A[0])), nrm) > 0;
        I.push(...(fwd ? [v, v + 1, v + 2, v, v + 2, v + 3] : [v, v + 2, v + 1, v, v + 3, v + 2]));
        v += 4;
      }
    }
  }
  if (!I.length) continue;
  const buf = root.listBuffers()[0];
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(P)).setBuffer(buf))
    .setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(Nn)).setBuffer(buf))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(I)).setBuffer(buf))
    .setMaterial(doc.createMaterial('slotcover').setBaseColorFactor([0.91, 0.39, 0.04, 1]));
  const idx = nextIdx + k++;
  scene.addChild(doc.createNode('p' + idx).setMesh(doc.createMesh('p' + idx).addPrimitive(prim)));
  map[ei] = idx;
  console.log(`p${ei} -> p${idx}: ${faces.length} slots, ${I.length / 30} strips`);
}
await io.write(out, doc);
fs.writeFileSync(mapOut, JSON.stringify(map));
console.log('wrote', out, fs.statSync(out).size);
