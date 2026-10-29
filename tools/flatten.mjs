// Flatten a CAD-exported GLB: one scene-root node "p<i>" per mesh instance with its world
// transform baked in (scaled to mm), keep assembly path names, then compress with meshopt.
import fs from 'fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, quantize, meshopt, prune } from '@gltf-transform/functions';
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
const [src, out, namesOut, scaleArg] = process.argv.slice(2);
const SCALE = +(scaleArg || 1000);
await MeshoptDecoder.ready; await MeshoptEncoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(src);
const root = doc.getRoot();
const scene = root.listScenes()[0];
const items = [];
function walk(n, path) {
  const p = [...path, n.getName()];
  if (n.getMesh()) items.push({ mesh: n.getMesh(), path: p, world: n.getWorldMatrix() });
  n.listChildren().forEach((c) => walk(c, p));
}
scene.listChildren().forEach((n) => walk(n, []));
for (const n of root.listNodes()) n.dispose();
root.listCameras().forEach((c) => c.dispose());
const ext = root.listExtensionsUsed().find((e) => e.extensionName === 'KHR_lights_punctual');
if (ext) ext.dispose();
const names = [];
items.forEach((it, i) => {
  const m = it.world.slice();
  for (let k = 0; k < 12; k++) m[k] *= SCALE; // scale rotation/scale columns
  m[12] *= SCALE; m[13] *= SCALE; m[14] *= SCALE;
  const n = doc.createNode('p' + i).setMesh(it.mesh).setMatrix(m);
  scene.addChild(n);
  names.push(it.path.slice(1));
});
await doc.transform(prune(), weld(), quantize({ quantizePosition: 16, quantizeNormal: 10 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }), prune());
await io.write(out, doc);
fs.writeFileSync(namesOut, JSON.stringify(names));
console.log('nodes', items.length, 'bytes', fs.statSync(out).size);
