// Graft parts from one flat DynoX GLB into another, drop unwanted nodes, simplify heavy meshes.
// Usage: node graft.mjs spec.json
// spec: { target, out, remove: [idx], grafts: [{ src, nodes: [idx], matrix: [16], startIdx }],
//         simplify: { minTris, ratio, error }, map: "path for {srcIdx: newIdx} json" }
import fs from 'fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { mergeDocuments, dequantize, weld, simplifyPrimitive, quantize, meshopt, prune, unpartition } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';

const spec = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
await MeshoptDecoder.ready; await MeshoptEncoder.ready; await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

const doc = await io.read(spec.target);
await doc.transform(dequantize());
const root = doc.getRoot();
const scene = root.listScenes()[0];
const byName = (d) => new Map(d.getRoot().listNodes().filter((n) => /^p\d+$/.test(n.getName())).map((n) => [+n.getName().slice(1), n]));

const tgt = byName(doc);
for (const i of spec.remove || []) tgt.get(i)?.dispose();

const mul = (a, b) => { // column-major 4x4: a*b
  const o = new Array(16).fill(0);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) o[c * 4 + r] += a[k * 4 + r] * b[c * 4 + k];
  return o;
};
const map = {};
const grafted = new Set();
for (const g of spec.grafts || []) {
  const src = await io.read(g.src);
  await src.transform(dequantize());
  const keep = new Set(g.nodes);
  // Drop everything we do not need before merging, so the merge stays small.
  for (const [i, n] of byName(src)) if (!keep.has(i)) n.dispose();
  await src.transform(prune());
  const before = new Set(root.listNodes());
  mergeDocuments(doc, src);
  const added = root.listNodes().filter((n) => !before.has(n) && /^p\d+$/.test(n.getName()));
  added.sort((a, b) => +a.getName().slice(1) - +b.getName().slice(1));
  let next = g.startIdx;
  for (const n of added) {
    const old = +n.getName().slice(1);
    const m = mul(g.matrix, n.getMatrix());
    for (const p of n.listParents()) if (p !== root && p.removeChild) p.removeChild(n);
    n.setMatrix(m).setName('p' + next);
    scene.addChild(n);
    map[old] = next; grafted.add(n.getMesh());
    next++;
  }
  // Remove the extra scene created by the merge.
  for (const s of root.listScenes()) if (s !== scene) s.dispose();
}
// Merging keeps one buffer per source document; glTF binary needs a single buffer.
await doc.transform(unpartition());
await doc.transform(prune(), weld());
if (spec.simplify) {
  const { minTris = 3000, ratio = 0.3, error = 0.0008, onlyGrafted = false } = spec.simplify;
  // Simplify only the heavy meshes (PCB parts dominate the triangle count).
  const heavy = new Set(root.listMeshes().filter((m) => {
    if (onlyGrafted && !grafted.has(m)) return false;
    let t = 0; m.listPrimitives().forEach((p) => { const ix = p.getIndices(); t += (ix ? ix.getCount() : p.getAttribute('POSITION').getCount()) / 3; });
    return t >= minTris;
  }));
  for (const m of heavy) for (const p of m.listPrimitives()) simplifyPrimitive(p, { simplifier: MeshoptSimplifier, ratio, error });
}
// Stronger simplification for listed node ranges (e.g. PCB internals hidden under a lid), and
// removal of tiny parts (SMD resistors and the like) that are invisible at viewing distance.
for (const r of spec.reduce || []) {
  const want = new Set(r.nodes);
  for (const n of root.listNodes()) {
    if (!/^p\d+$/.test(n.getName()) || !want.has(+n.getName().slice(1)) || !n.getMesh()) continue;
    if (r.dropBelow) {
      const pos = n.getMesh().listPrimitives()[0].getAttribute('POSITION');
      const mn = pos.getMin([]), mx = pos.getMax([]);
      const s = n.getWorldMatrix(); const sc = Math.hypot(s[0], s[1], s[2]);
      if (Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) * sc < r.dropBelow) { n.dispose(); continue; }
    }
    for (const p of n.getMesh().listPrimitives()) simplifyPrimitive(p, { simplifier: MeshoptSimplifier, ratio: r.ratio, error: r.error });
  }
}
await doc.transform(prune(), quantize({ quantizePosition: 16, quantizeNormal: 10 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }), prune());
await io.write(spec.out, doc);
if (spec.map) fs.writeFileSync(spec.map, JSON.stringify(map));
let tris = 0; root.listMeshes().forEach((m) => m.listPrimitives().forEach((p) => { const ix = p.getIndices(); tris += (ix ? ix.getCount() : 0) / 3; }));
console.log('wrote', spec.out, fs.statSync(spec.out).size, 'bytes, nodes', root.listNodes().length, 'tris', tris, 'map', JSON.stringify(map).slice(0, 120));
