// Regenerate model/rts-compact-5.glb from the SolidWorks STEP export.
// Usage:  cd tools && npm install && node convert-step.mjs "../path/to/assembly.STEP"
// Node order of the STEP tree defines the p<i> indices used in catalog.js.
// If the CAD assembly structure changes, re-check the indices printed below against catalog.js.
import fs from 'fs';
import occtImport from 'occt-import-js';
import { Document, NodeIO } from '@gltf-transform/core';
import { EXTMeshoptCompression, KHRMeshQuantization } from '@gltf-transform/extensions';
import { quantize, meshopt, weld, prune } from '@gltf-transform/functions';
import { MeshoptEncoder } from 'meshoptimizer';

const src = process.argv[2];
if (!src) { console.error('Pass the STEP file path.'); process.exit(1); }
const occt = await occtImport();
const r = occt.ReadStepFile(new Uint8Array(fs.readFileSync(src)), {
  linearUnit: 'millimeter', linearDeflectionType: 'bounding_box_ratio',
  linearDeflection: 0.0015, angularDeflection: 0.4,
});
if (!r.success) { console.error('STEP read failed'); process.exit(1); }

const doc = new Document(); const buf = doc.createBuffer();
const scene = doc.createScene('RTS_Compact_5');
r.meshes.forEach((m, i) => {
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(m.attributes.position.array)).setBuffer(buf))
    .setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(m.index.array)).setBuffer(buf));
  if (m.attributes.normal) prim.setAttribute('NORMAL', doc.createAccessor().setType('VEC3').setArray(new Float32Array(m.attributes.normal.array)).setBuffer(buf));
  prim.setMaterial(doc.createMaterial('m' + i));
  scene.addChild(doc.createNode('p' + i).setMesh(doc.createMesh('p' + i).addPrimitive(prim)));
  console.log(String(i).padStart(3), m.name || '(unnamed body)');
});
await MeshoptEncoder.ready;
await doc.transform(weld(), quantize({ quantizePosition: 16, quantizeNormal: 10 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }), prune());
const io = new NodeIO().registerExtensions([EXTMeshoptCompression, KHRMeshQuantization]).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
await io.write('../model/rts-compact-5.glb', doc);
console.log('Wrote ../model/rts-compact-5.glb', fs.statSync('../model/rts-compact-5.glb').size, 'bytes');
