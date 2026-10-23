import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { initQuote, saveBlob } from './quote.js';

const MODELS = {
  'compact-5': { label: 'RTS Compact 5', rating: '5 kgf', load: () => import('./models/compact-5.js') },
  'pro-20': { label: 'RTS Pro 20', rating: '20 kgf', load: () => import('./models/pro-20.js') },
  'ultra-50': { label: 'RTS Ultra 50', rating: '50 kgf', load: () => import('./models/ultra-50.js') },
};
const MANUALS = {
  'compact-5': 'manuals/DynoX-RTS-Compact-5-User-Manual.pdf',
  'pro-20': 'manuals/DynoX-RTS-Pro-20-User-Manual.pdf',
  'ultra-50': 'manuals/DynoX-RTS-Ultra-50-User-Manual.pdf',
};
const DEFAULT_MODEL = 'compact-5';

const MATERIALS = {
  alu:      { color: 0xc3c9cf, metalness: 0.75, roughness: 0.36 },
  bracket:  { color: 0x9aa3ab, metalness: 0.7,  roughness: 0.42 },
  sheet:    { color: 0x8e979f, metalness: 0.7,  roughness: 0.45 },
  cell:     { color: 0xdfe3e7, metalness: 0.9,  roughness: 0.22 },
  printed:  { color: 0x2b6aa8, metalness: 0.0,  roughness: 0.6 },
  black:    { color: 0x2a2d31, metalness: 0.15, roughness: 0.6 },
  dark:     { color: 0x3a3f46, metalness: 0.3,  roughness: 0.5 },
  case:     { color: 0x30353b, metalness: 0.2,  roughness: 0.55 },
  rubber:   { color: 0x3b3e42, metalness: 0.0,  roughness: 0.9 },
  motor:    { color: 0x1d2024, metalness: 0.6,  roughness: 0.35 },
  copper:   { color: 0xb9772e, metalness: 0.7,  roughness: 0.38 },
  carbon:   { color: 0x16181b, metalness: 0.25, roughness: 0.3 },
  fastener: { color: 0x3a3d42, metalness: 0.8,  roughness: 0.4 },
  pcb:      { color: 0x245a3a, metalness: 0.1,  roughness: 0.55 },
  brass:    { color: 0xb8923e, metalness: 0.9,  roughness: 0.3 },
  cover:    { color: 0x1f5c99, metalness: 0.25, roughness: 0.48 },
  steel:    { color: 0xb4b9be, metalness: 0.85, roughness: 0.3 },
  slotcover: { color: 0xe8630a, metalness: 0.0, roughness: 0.55 },
};

const BACKGROUNDS = {
  studio: { mat: 0xdfe4e9, grid: '#b7c0c9', shadow: 0.35 },
  light:  { mat: 0xf6f8fa, grid: '#c9d1d9', shadow: 0.18 },
  white:  { mat: 0xf1f3f5, grid: '#d3d9df', shadow: 0.14 },
};

const $ = (id) => document.getElementById(id);
const canvas = $('scene');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } },
};

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

const camera = new THREE.PerspectiveCamera(32, 1, 5, 40000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.screenSpacePanning = true;
controls.zoomToCursor = true;
controls.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };
controls.listenToKeyEvents(window);

scene.add(new THREE.HemisphereLight(0xf4f7fb, 0x8a939d, 0.65));
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -0.0004;
scene.add(sun, sun.target);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({ opacity: 0.3 }));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Work-table mat that fades in as the parts are laid out.
const matCanvas = document.createElement('canvas');
matCanvas.width = matCanvas.height = 128;
const matTex = new THREE.CanvasTexture(matCanvas);
matTex.wrapS = matTex.wrapT = THREE.RepeatWrapping;
matTex.colorSpace = THREE.SRGBColorSpace;
const tableMat = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1),
  new THREE.MeshStandardMaterial({ map: matTex, roughness: 0.95, metalness: 0, transparent: true, opacity: 0, depthWrite: false }),
);
tableMat.rotation.x = -Math.PI / 2;
tableMat.receiveShadow = true;
tableMat.renderOrder = -1;
scene.add(tableMat);

function paintMat(gridColor) {
  const c = matCanvas.getContext('2d');
  c.fillStyle = '#ffffff'; c.fillRect(0, 0, 128, 128);
  c.strokeStyle = gridColor; c.lineWidth = 2;
  c.strokeRect(0, 0, 128, 128);
  c.globalAlpha = 0.45; c.lineWidth = 1;
  c.beginPath(); c.moveTo(64, 0); c.lineTo(64, 128); c.moveTo(0, 64); c.lineTo(128, 64); c.stroke();
  matTex.needsUpdate = true;
}

let root = null;         // THREE.Group holding the current model
let cfg = null;          // current model config
let pieces = [];         // { id, pivot, c0, ex, q, T, local: Box3, meshes }
let items = [];          // catalog items with runtime fields
let meshes = [];         // every mesh in the model
let floorY = 0;
let layoutBox = new THREE.Box3();
let e = 0, eT = 0, s = 0, sT = 0;
let selected = null, hovered = null, isolate = false;
let showLabels = false, showEdges = true;
let camTween = null, pendingFit = null;
let loadToken = 0;
const insets = { left: 0, right: 0, top: 0, bottom: 0, w: 1, h: 1 };
let viewName = 'iso';
let captureMode = false;
let labelFilter = null;

// ---------- loading ----------
async function fetchWithProgress(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`the model file returned ${res.status}`);
  const total = +res.headers.get('content-length') || 0;
  if (!res.body || !total) return res.arrayBuffer();
  const reader = res.body.getReader();
  const chunks = []; let got = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); got += value.length;
    $('loadBar').style.width = `${Math.min(100, (got / total) * 100)}%`;
  }
  const buf = new Uint8Array(got); let o = 0;
  for (const c of chunks) { buf.set(c, o); o += c.length; }
  return buf.buffer;
}

function disposeModel() {
  if (!root) return;
  root.traverse((o) => {
    if (o.geometry) o.geometry.dispose();
    if (o.material && o.material !== edgeMaterial) o.material.dispose();
  });
  scene.remove(root);
  root = null; pieces = []; items = []; meshes = [];
  $('labels').replaceChildren(); $('leaders').replaceChildren(); $('partsBody').replaceChildren();
  callouts.length = 0;
}

const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x18222d, transparent: true, opacity: 0.26, depthWrite: false });

async function loadModel(id) {
  const token = ++loadToken;
  const entry = MODELS[id] || MODELS[DEFAULT_MODEL];
  $('loading').classList.remove('done');
  $('loadBar').style.width = '0%';
  $('loadText').textContent = `Loading ${entry.label}`;
  document.querySelectorAll('[data-model]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.model === id)));

  let config, gltf;
  try {
    config = (await entry.load()).default;
    await MeshoptDecoder.ready;
    let buf;
    if (window.RTS_EMBED?.[config.id]) buf = decodeB64(window.RTS_EMBED[config.id]);
    else {
      try { buf = await fetchWithProgress(config.url); }
      catch (err) {
        // Hosts that cannot serve .glb get a base64 copy as a JavaScript module next to it.
        try { buf = decodeB64((await import(/* @vite-ignore */ `./${config.url}.js`)).default); }
        catch { throw err; }
      }
    }
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    gltf = await new Promise((res, rej) => loader.parse(buf, '', res, rej));
  } catch (err) {
    if (token === loadToken) $('loadText').textContent = `The model could not be loaded because ${err.message}. Reload the page to try again.`;
    return;
  }
  if (token !== loadToken) return;

  disposeModel();
  select(null);
  cfg = config;
  e = eT = s = sT = 0;
  build(gltf);
  $('plateTitle').textContent = cfg.title;
  $('plateSub').textContent = cfg.subtitle;
  document.title = `${cfg.title} | 3D viewer`;
  syncButtons();
  resize();
  setView('iso', false);
  setAutoRotate(true);
  updateManualLink();
  $('loading').classList.add('done');
}

function updateManualLink() {
  const a = $('bManual');
  const embedded = window.RTS_MANUALS?.[cfg.id];
  if (embedded) {
    if (!embedded.url) embedded.url = URL.createObjectURL(new Blob([decodeB64(embedded.b64)], { type: 'application/pdf' }));
    a.href = embedded.url;
  } else a.href = MANUALS[cfg.id];
  a.setAttribute('download', `DynoX-${cfg.title.replace(/\s+/g, '-')}-User-Manual.pdf`);
}

// ---------- auto-rotate: slow turntable when a design is opened, stops on interaction ----------
function setAutoRotate(on) {
  controls.autoRotate = on && !reduceMotion;
  controls.autoRotateSpeed = 0.45;
  $('bRotate').setAttribute('aria-pressed', String(controls.autoRotate));
}
function stopAutoRotate() { if (controls.autoRotate) setAutoRotate(false); }

function decodeB64(b64) {
  const bin = atob(b64); const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

// ---------- build ----------
const _v = new THREE.Vector3(), _q = new THREE.Quaternion(), _box = new THREE.Box3();
const AXES = { x: new THREE.Vector3(1, 0, 0), y: new THREE.Vector3(0, 1, 0), z: new THREE.Vector3(0, 0, 1) };
const qAxis = (ax, deg) => new THREE.Quaternion().setFromAxisAngle(AXES[ax], THREE.MathUtils.degToRad(deg));

function build(gltf) {
  root = new THREE.Group();
  scene.add(root);
  const byIdx = new Map();
  gltf.scene.updateMatrixWorld(true);
  gltf.scene.traverse((o) => {
    if (!o.isMesh) return;
    const name = /^p\d+$/.test(o.name) ? o.name : o.parent?.name;
    const m = /^p(\d+)$/.exec(name || '');
    if (m) byIdx.set(+m[1], o);
  });
  for (const i of cfg.hidden || []) { byIdx.get(i)?.removeFromParent(); byIdx.delete(i); }
  root.add(gltf.scene);
  root.updateMatrixWorld(true);

  // Items: runtime node sets and primary ownership (the most specific item wins).
  items = cfg.items.map((it, k) => ({ ...it, n: k + 1, kind: it.kind || 'part', meshes: [] }));
  const owner = new Map();
  for (const it of [...items].sort((a, b) => b.nodes.length - a.nodes.length)) {
    for (const i of it.nodes) owner.set(i, it);
  }
  const matKeyFor = (i) => {
    if (cfg.matOverrides?.[i]) return cfg.matOverrides[i];
    for (const it of items) if (it.matOverrides?.[i] && it.nodes.includes(i)) return it.matOverrides[i];
    return owner.get(i)?.mat || 'alu';
  };

  // Pieces: each becomes a pivot group so it can translate and rotate as one block.
  const assigned = new Set();
  const defs = cfg.pieces.map((p) => ({ ...p }));
  const loose = [...byIdx.keys()].filter((i) => !defs.some((p) => p.nodes.includes(i)));
  if (loose.length) defs.push({ id: '_loose', nodes: loose, ex: [0, 0, 0] });

  for (const def of defs) {
    const ms = def.nodes.map((i) => byIdx.get(i)).filter((m) => m && !assigned.has(m));
    if (!ms.length) continue;
    ms.forEach((m) => assigned.add(m));
    const box = new THREE.Box3();
    ms.forEach((m) => box.expandByObject(m));
    const pivot = new THREE.Group();
    pivot.position.copy(box.getCenter(new THREE.Vector3()));
    root.add(pivot);
    pivot.updateMatrixWorld(true);
    ms.forEach((m) => pivot.attach(m));
    const local = new THREE.Box3();
    ms.forEach((m) => { m.geometry.computeBoundingBox(); local.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrix)); });
    pieces.push({ id: def.id, def, pivot, meshes: ms, c0: pivot.position.clone(), ex: new THREE.Vector3(...(def.ex || [0, 0, 0])), local, q: new THREE.Quaternion(), T: new THREE.Vector3() });
  }

  // Materials, edges and picking data, per mesh.
  for (const [i, m] of byIdx) {
    const key = matKeyFor(i);
    const spec = MATERIALS[key] || MATERIALS.alu;
    m.material = new THREE.MeshStandardMaterial({ color: spec.color, metalness: spec.metalness, roughness: spec.roughness, envMapIntensity: 0.9, side: THREE.DoubleSide });
    m.castShadow = true; m.receiveShadow = true;
    m.userData.idx = i;
    m.userData.item = owner.get(i) || null;
    m.geometry.computeBoundingSphere();
    const r = m.geometry.boundingSphere.radius * m.scale.x;
    if (r > 4 && m.geometry.index && m.geometry.index.count < 30000) {
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), edgeMaterial);
      edges.raycast = () => {};
      m.add(edges);
      m.userData.edges = edges;
    }
    meshes.push(m);
  }
  for (const it of items) {
    it.meshes = it.nodes.map((i) => byIdx.get(i)).filter(Boolean);
    let best = null, bv = -1;
    for (const m of it.meshes) {
      const b = m.geometry.boundingBox || (m.geometry.computeBoundingBox(), m.geometry.boundingBox);
      const sz = b.getSize(_v).multiply(m.scale); const vol = sz.x * sz.y * Math.max(sz.z, 1);
      if (vol > bv) { bv = vol; best = m; }
    }
    it.anchor = best;
    it.anchorLocal = best ? best.geometry.boundingBox.getCenter(new THREE.Vector3()) : null;
  }

  // Ground the model at y = 0 and centre it on the origin.
  const bb = new THREE.Box3().setFromObject(root);
  floorY = bb.min.y;
  const c = bb.getCenter(new THREE.Vector3());
  root.position.set(-c.x, -bb.min.y, -c.z);
  root.updateMatrixWorld(true);

  computeTableLayout(bb);
  const size = bb.getSize(new THREE.Vector3()).length();
  controls.minDistance = size * 0.08;
  controls.maxDistance = size * 6;
  const span = Math.max(size, layoutBox.getSize(_v).length()) * 1.2;
  ground.scale.set(span * 3, span * 3, 1);
  sun.position.set(span * 0.5, span * 1.1, span * 0.7);
  Object.assign(sun.shadow.camera, { left: -span, right: span, top: span, bottom: -span, near: 1, far: span * 4 });
  sun.shadow.camera.updateProjectionMatrix();

  buildPartsList();
  buildCallouts();
  applyState();
  refreshLook();
}

// ---------- table layout: every piece laid flat on the work table ----------
function rotatedExtents(piece, q) {
  const min = new THREE.Vector3(Infinity, Infinity, Infinity), max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  const m4 = new THREE.Matrix4();
  for (const m of piece.meshes) {
    m4.makeRotationFromQuaternion(q).multiply(m.matrix);
    const pos = m.geometry.attributes.position;
    const step = pos.count > 20000 ? 4 : pos.count > 4000 ? 2 : 1;
    for (let i = 0; i < pos.count; i += step) {
      _v.fromBufferAttribute(pos, i).applyMatrix4(m4);
      min.min(_v); max.max(_v);
    }
  }
  return { min, max };
}

function computeTableLayout(modelBox) {
  const cands = [new THREE.Quaternion(), qAxis('x', 90), qAxis('z', 90)];
  const rows = [];
  let row = null;
  const entries = pieces.map((p) => {
    let q;
    if (p.def.flat) {
      q = new THREE.Quaternion();
      for (const [ax, deg] of p.def.flat) q.premultiply(qAxis(ax, deg));
    } else {
      let bestH = Infinity;
      for (const c of cands) {
        const b = p.local.clone().applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(c));
        const h = b.max.y - b.min.y;
        if (h < bestH - 2) { bestH = h; q = c.clone(); }
      }
    }
    let ext = rotatedExtents(p, q);
    if (ext.max.z - ext.min.z > (ext.max.x - ext.min.x) * 1.05) {
      q.premultiply(qAxis('y', 90));
      ext = rotatedExtents(p, q);
    }
    p.q.copy(q);
    return { p, ext, dx: ext.max.x - ext.min.x, dz: ext.max.z - ext.min.z };
  });

  const footprint = modelBox.getSize(new THREE.Vector3());
  const maxDx = Math.max(...entries.map((en) => en.dx));
  const W = Math.max(maxDx, Math.max(footprint.x, footprint.z) * 1.05);
  const gap = THREE.MathUtils.clamp(W * 0.035, 12, 55);
  let z = 0;
  for (const en of entries) {
    if (!row || row.x + en.dx > W + 0.5) {
      if (row) z += row.depth + gap;
      row = { x: 0, z, depth: 0, list: [] };
      rows.push(row);
    }
    en.slot = new THREE.Vector3(row.x, 0, row.z);
    row.x += en.dx + gap;
    row.depth = Math.max(row.depth, en.dz);
    row.list.push(en);
  }
  // Centre each row and the whole layout on the model's footprint centre.
  const totalZ = z + (row ? row.depth : 0);
  const cx = (modelBox.min.x + modelBox.max.x) / 2, cz = (modelBox.min.z + modelBox.max.z) / 2;
  layoutBox.makeEmpty();
  for (const r of rows) {
    const used = r.x - gap;
    for (const en of r.list) {
      const x0 = cx - used / 2 + en.slot.x;
      const z0 = cz - totalZ / 2 + en.slot.z + (r.depth - en.dz) / 2;
      en.p.T.set(x0 - en.ext.min.x, floorY - en.ext.min.y, z0 - en.ext.min.z);
      layoutBox.expandByPoint(_v.set(x0, floorY, z0)).expandByPoint(_v.set(x0 + en.dx, floorY + (en.ext.max.y - en.ext.min.y), z0 + en.dz));
    }
  }
  // Table mat in world space (root offset applied later each frame).
  const sz = layoutBox.getSize(new THREE.Vector3());
  const margin = Math.max(sz.x, sz.z) * 0.06;
  tableMat.scale.set(sz.x + margin * 2, sz.z + margin * 2, 1);
  matTex.repeat.set((sz.x + margin * 2) / 200, (sz.z + margin * 2) / 200);
}

// ---------- state ----------
const _I = new THREE.Quaternion();
function poseOf(p, ev, sv, pos, quat) {
  pos.copy(p.c0).addScaledVector(p.ex, ev);
  pos.lerp(p.T, sv);
  quat.slerpQuaternions(_I, p.q, sv);
}

function applyState() {
  for (const p of pieces) poseOf(p, e, s, p.pivot.position, p.pivot.quaternion);
  root.updateMatrixWorld(true);
  const c = layoutBox.getCenter(_v);
  tableMat.position.set(c.x + root.position.x, 0.6, c.z + root.position.z);
  tableMat.material.opacity = s;
  tableMat.visible = s > 0.001;
  // Keep the floor shadow under the lowest part when sub-assemblies drop below the base.
  ground.position.y = Math.min(0, boxAt(e, s, false).min.y - 0.5);
  $('spreadVal').textContent = `${Math.round(s * 100)}%`;
}

const _p = new THREE.Vector3(), _qq = new THREE.Quaternion(), _m = new THREE.Matrix4(), _one = new THREE.Vector3(1, 1, 1);
function boxAt(ev, sv, onlyVisible = true) {
  const box = new THREE.Box3();
  for (const p of pieces) {
    if (onlyVisible && !p.meshes.some((m) => m.visible)) continue;
    poseOf(p, ev, sv, _p, _qq);
    _m.compose(_p, _qq, _one).premultiply(root.matrixWorld);
    box.union(_box.copy(p.local).applyMatrix4(_m));
  }
  return box;
}

// ---------- camera ----------
function fitTo(box, dir, animate = true, pad = 1.08) {
  if (box.isEmpty()) return;
  const d = (dir ? new THREE.Vector3(...dir) : camera.position.clone().sub(controls.target)).normalize();
  const f = d.clone().negate();
  let r = new THREE.Vector3().crossVectors(f, new THREE.Vector3(0, 1, 0));
  if (r.lengthSq() < 1e-6) r.set(1, 0, 0);
  r.normalize();
  const u = new THREE.Vector3().crossVectors(r, f).normalize();
  const bc = box.getCenter(new THREE.Vector3());
  let minR = Infinity, maxR = -Infinity, minU = Infinity, maxU = -Infinity;
  const corners = [];
  for (let i = 0; i < 8; i++) {
    const p = new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z);
    corners.push(p);
    const q = p.clone().sub(bc);
    const pr = q.dot(r), pu = q.dot(u);
    minR = Math.min(minR, pr); maxR = Math.max(maxR, pr); minU = Math.min(minU, pu); maxU = Math.max(maxU, pu);
  }
  const target = bc.clone().addScaledVector(r, (minR + maxR) / 2).addScaledVector(u, (minU + maxU) / 2);
  let depth = 0;
  for (const p of corners) depth = Math.max(depth, p.clone().sub(target).dot(d));
  const effW = Math.max(200, insets.w - insets.left - insets.right - 40), effH = Math.max(200, insets.h - insets.bottom - insets.top - 40);
  const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2), tanH = tanV * camera.aspect;
  const hw = ((maxR - minR) / 2) * pad, hh = ((maxU - minU) / 2) * pad;
  const dist = Math.max(hh / (tanV * effH / insets.h), hw / (tanH * effW / insets.w)) + depth;
  moveCamera(target.clone().addScaledVector(d, dist), target, animate);
}

function moveCamera(pos, target, animate = true) {
  if (!animate || reduceMotion) {
    camera.position.copy(pos); controls.target.copy(target); controls.update(); camTween = null; return;
  }
  camTween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos.clone(), t1: target.clone(), k: 0 };
}

function targetBox() { return boxAt(eT, sT); }
function setView(name, animate = true) { if (cfg) { viewName = name; fitTo(targetBox(), cfg.views[name], animate); } }

function zoomBy(f) {
  const off = camera.position.clone().sub(controls.target).multiplyScalar(f);
  const len = THREE.MathUtils.clamp(off.length(), controls.minDistance, controls.maxDistance);
  moveCamera(controls.target.clone().add(off.setLength(len)), controls.target.clone());
}

// ---------- parts list ----------
function buildPartsList() {
  const body = $('partsBody');
  const parts = items.filter((i) => i.kind !== 'hw').length;
  $('partCount').textContent = `${parts} components`;
  for (const sec of cfg.sections) {
    const list = items.filter((i) => i.s === sec.id);
    if (!list.length) continue;
    const h = document.createElement('h3');
    h.innerHTML = `<span>${sec.name}</span>${sec.note ? `<small>${sec.note}</small>` : ''}`;
    body.appendChild(h);
    for (const it of list) {
      const b = document.createElement('button');
      b.className = 'part' + (it.kind === 'hw' ? ' hw' : '');
      b.dataset.n = it.n;
      b.innerHTML = `<span class="balloon">${it.n}</span><span class="nm">${it.name}</span><span class="q">×${it.qty}</span>`;
      b.addEventListener('click', () => select(selected === it ? null : it, true));
      b.addEventListener('mouseenter', () => setHover(it));
      b.addEventListener('mouseleave', () => setHover(null));
      body.appendChild(b);
    }
  }
}

// ---------- callouts ----------
const callouts = [];
function buildCallouts() {
  const svgNS = 'http://www.w3.org/2000/svg';
  for (const it of items) {
    if (it.kind === 'hw' || !it.anchor) continue;
    const el = document.createElement('div');
    el.className = 'callout';
    el.innerHTML = `<span class="balloon">${it.n}</span><span class="nm">${it.name}</span>`;
    el.addEventListener('click', () => select(selected === it ? null : it, true));
    el.addEventListener('mouseenter', () => setHover(it));
    el.addEventListener('mouseleave', () => setHover(null));
    $('labels').appendChild(el);
    const line = document.createElementNS(svgNS, 'line');
    const dot = document.createElementNS(svgNS, 'circle'); dot.setAttribute('r', '2.5');
    $('leaders').append(line, dot);
    callouts.push({ it, el, line, dot, w: 0, h: 0, x: 0, y: 0 });
  }
  updateCalloutVisibility();
}

function updateCalloutVisibility() {
  const compact = window.innerWidth < 700 || compactLabels;
  for (const c of callouts) {
    const vis = showLabels && c.it.anchor?.visible && (!labelFilter || labelFilter.has(c.it));
    c.visible = vis;
    c.el.style.display = vis ? '' : 'none';
    c.line.style.display = c.dot.style.display = vis ? '' : 'none';
    c.el.classList.toggle('compact', compact);
  }
  requestAnimationFrame(() => {
    for (const c of callouts) {
      const r = c.el.getBoundingClientRect(); c.w = r.width; c.h = r.height;
      if (!compact && r.width) c.fullW = r.width;
    }
  });
}

const _a = new THREE.Vector3();
let compactLabels = false;
function layoutCallouts() {
  if (!showLabels || !cfg) return;
  const W = canvas.clientWidth, H = canvas.clientHeight;
  // Screen rectangle of the model in its current state.
  const bx = boxAt(e, s);
  let rl = Infinity, rr = -Infinity;
  for (let i = 0; i < 8; i++) {
    _a.set(i & 1 ? bx.max.x : bx.min.x, i & 2 ? bx.max.y : bx.min.y, i & 4 ? bx.max.z : bx.min.z).project(camera);
    const x = (_a.x * 0.5 + 0.5) * W;
    rl = Math.min(rl, x); rr = Math.max(rr, x);
  }
  const mid = (rl + rr) / 2;
  const detailOpen = !$('detail').hidden && W > 820;
  const leftMin = (W > 820 ? insets.left + 14 : 6);
  const rightMax = W - 8 - (detailOpen ? 390 : 0);
  const top = insets.top + 6, bottom = H - insets.bottom - 10;
  const cols = { '-1': [], '1': [] };
  for (const c of callouts) {
    if (!c.visible) continue;
    _a.copy(c.it.anchorLocal).applyMatrix4(c.it.anchor.matrixWorld).project(camera);
    if (_a.z > 1) { c.el.style.display = 'none'; continue; }
    c.el.style.display = '';
    c.ax = (_a.x * 0.5 + 0.5) * W; c.ay = (-_a.y * 0.5 + 0.5) * H;
    if (!c.h) { const r = c.el.getBoundingClientRect(); c.w = r.width || 120; c.h = r.height || 32; }
    c.side = c.ax < mid ? -1 : 1;
    cols[c.side].push(c);
  }
  let overflow = false;
  for (const side of [-1, 1]) {
    const col = cols[side].sort((a, b) => a.ay - b.ay);
    const total = col.reduce((t, c) => t + c.h + 4, 0);
    if (total > bottom - top) overflow = true;
    for (const c of col) {
      c.x = side < 0 ? Math.max(leftMin, rl - 26 - c.w) : Math.min(rr + 26, rightMax - c.w);
      c.y = c.ay - c.h / 2;
    }
    for (let i = 1; i < col.length; i++) col[i].y = Math.max(col[i].y, col[i - 1].y + col[i - 1].h + 4);
    if (col.length) {
      const last = col[col.length - 1];
      const over = last.y + last.h - bottom;
      if (over > 0) for (let i = col.length - 1; i >= 0; i--) {
        const lim = i === col.length - 1 ? bottom - col[i].h : col[i + 1].y - col[i].h - 4;
        col[i].y = Math.min(col[i].y, lim);
      }
      if (col[0].y < top) { col[0].y = top; for (let i = 1; i < col.length; i++) col[i].y = Math.max(col[i].y, col[i - 1].y + col[i - 1].h + 4); }
    }
    for (const c of col) {
      c.x = Math.max(4, Math.min(c.x, W - c.w - 4));
      c.el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`;
      const ex = side < 0 ? c.x + c.w : c.x, ey = c.y + c.h / 2;
      c.line.setAttribute('x1', c.ax); c.line.setAttribute('y1', c.ay);
      c.line.setAttribute('x2', ex); c.line.setAttribute('y2', ey);
      c.dot.setAttribute('cx', c.ax); c.dot.setAttribute('cy', c.ay);
    }
  }
  // Number-only chips when full names cannot fit beside the model (decided on full-size widths, so it cannot flicker).
  const fullW = Math.max(0, ...callouts.filter((c) => c.visible).map((c) => c.fullW || 0));
  const noRoom = fullW > 0 && (rl - 26 - fullW < leftMin - 40 || rr + 26 + fullW > rightMax + 40);
  const wantCompact = !captureMode && (window.innerWidth < 700 || overflow || noRoom);
  if (wantCompact !== compactLabels) { compactLabels = wantCompact; updateCalloutVisibility(); }
}

// ---------- selection / highlight ----------
const ORANGE = new THREE.Color(0xe8630a);
function refreshLook() {
  const selSet = selected ? new Set(selected.meshes) : null;
  const hovSet = hovered ? new Set(hovered.meshes) : null;
  for (const m of meshes) {
    const isSel = selSet?.has(m);
    const isHov = hovSet?.has(m);
    const mat = m.material;
    mat.emissive.copy(ORANGE);
    mat.emissiveIntensity = isSel ? 0.55 : isHov ? 0.3 : 0;
    const ghost = !!selSet && !isSel && !isolate;
    if (mat.transparent !== ghost) mat.needsUpdate = true;
    mat.transparent = ghost;
    mat.opacity = ghost ? 0.18 : 1;
    mat.depthWrite = !ghost;
    m.castShadow = !ghost;
    m.visible = !(isolate && selSet && !isSel);
    if (m.userData.edges) m.userData.edges.visible = showEdges && !ghost;
  }
  document.body.classList.toggle('has-sel', !!selected);
  document.querySelectorAll('.part').forEach((b) => b.classList.toggle('on', !!selected && +b.dataset.n === selected.n));
  for (const c of callouts) {
    const on = selected === c.it || hovered === c.it;
    c.el.classList.toggle('on', on);
    c.line.classList.toggle('on', on); c.dot.classList.toggle('on', on);
  }
  updateCalloutVisibility();
}

function esc(t) { return String(t).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch])); }

function select(it, fromList = false) {
  selected = it;
  if (!it) { isolate = false; $('dIsolate').setAttribute('aria-pressed', 'false'); }
  const d = $('detail');
  if (it) {
    d.hidden = false;
    $('dNum').textContent = it.n;
    $('dName').textContent = it.name;
    $('dCode').textContent = it.code || '';
    $('dSummary').textContent = it.summary || '';
    const lvl = (it.level || 'Standard').toLowerCase();
    $('dSpecs').innerHTML = [
      ['Size', it.size], ['Material', it.material], ['Quantity', it.qty],
      ['Importance', `<span class="lvl lvl-${lvl}">${esc(it.level || 'Standard')}</span>`],
    ].filter(([, v]) => v !== undefined && v !== '').map(([k, v]) => `<dt>${k}</dt><dd>${k === 'Importance' ? v : esc(v)}</dd>`).join('');
    $('dWhy').textContent = it.why || '';
    $('dWhyWrap').hidden = !it.why;
    $('dSteps').innerHTML = (it.steps || []).map((t) => `<li>${esc(t)}</li>`).join('');
    $('dStepsWrap').hidden = !(it.steps || []).length;
    $('detailBody').scrollTop = 0;
    if (fromList && window.innerWidth <= 820) collapseParts(true);
  } else d.hidden = true;
  refreshLook();
}

function setHover(it) {
  if (hovered === it) return;
  hovered = it; refreshLook();
}

function focusItem(it) {
  const box = new THREE.Box3();
  for (const m of it.meshes) box.expandByObject(m);
  const size = box.getSize(_v).length();
  const min = 60;
  if (size < min) box.expandByScalar((min - size) / 2);
  fitTo(box, null, true, 1.5);
}

// ---------- picking ----------
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function pick(ev) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(meshes.filter((m) => m.visible && !(selected && m.material.transparent)), false);
  return hits.length ? hits[0].object.userData.item : null;
}

let down = null;
canvas.addEventListener('pointerdown', (ev) => { down = { x: ev.clientX, y: ev.clientY }; $('hint').classList.add('gone'); stopAutoRotate(); });
canvas.addEventListener('wheel', stopAutoRotate, { passive: true });
controls.addEventListener('start', () => { viewName = 'custom'; });
$('toolbar').addEventListener('click', (ev) => { if (ev.target.closest('button') && ev.target.closest('button').id !== 'bRotate') stopAutoRotate(); });
$('bRotate').addEventListener('click', () => setAutoRotate(!controls.autoRotate));
$('bSave').addEventListener('click', () => saveImage());
canvas.addEventListener('pointerup', (ev) => {
  if (!down) return;
  const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y);
  down = null;
  if (moved > 5) return;
  const it = pick(ev);
  select(it && it !== selected ? it : null);
});
let hoverQueued = null;
canvas.addEventListener('pointermove', (ev) => {
  if (ev.pointerType !== 'mouse' || ev.buttons) { $('tip').hidden = true; return; }
  hoverQueued = ev;
});
canvas.addEventListener('pointerleave', () => { hoverQueued = null; $('tip').hidden = true; setHover(null); });
function processHover() {
  if (!hoverQueued || !cfg) return;
  const ev = hoverQueued; hoverQueued = null;
  const it = pick(ev);
  setHover(it);
  const tip = $('tip');
  if (it) {
    tip.textContent = `${it.n}  ${it.name}`;
    tip.hidden = false;
    const r = canvas.getBoundingClientRect();
    tip.style.left = `${ev.clientX - r.left + 14}px`;
    tip.style.top = `${ev.clientY - r.top + 14}px`;
    canvas.style.cursor = 'pointer';
  } else { tip.hidden = true; canvas.style.cursor = ''; }
}

// ---------- UI wiring ----------
function syncButtons() {
  const assembled = eT === 0 && sT === 0, exploded = eT === 1 && sT === 0;
  $('bAssembled').setAttribute('aria-pressed', String(assembled));
  $('bExploded').setAttribute('aria-pressed', String(exploded));
  $('spread').value = Math.round(sT * 100);
}

function goAssembled() {
  eT = 0; sT = 0; syncButtons();
  pendingFit = { view: null, at: 0.4 };
}
function goExploded() {
  eT = 1; sT = 0; syncButtons();
  if (!showLabels) toggleLabels(true);
  pendingFit = { view: cfg.explodeView, at: 0 };
}
$('bAssembled').addEventListener('click', goAssembled);
$('bExploded').addEventListener('click', goExploded);

$('spread').addEventListener('input', (ev) => {
  sT = s = ev.target.value / 100;
  applyState();
  syncButtons();
});
$('spread').addEventListener('change', () => {
  if (s > 0.5 && !showLabels) toggleLabels(true);
  fitTo(targetBox(), s > 0.5 ? cfg.views.table : null);
});

function toggleLabels(force) {
  showLabels = typeof force === 'boolean' ? force : !showLabels;
  $('bLabels').setAttribute('aria-pressed', String(showLabels));
  updateCalloutVisibility();
}
$('bLabels').addEventListener('click', () => toggleLabels());
$('bEdges').addEventListener('click', () => {
  showEdges = !showEdges; $('bEdges').setAttribute('aria-pressed', String(showEdges)); refreshLook();
});
document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
$('bZoomIn').addEventListener('click', () => zoomBy(0.75));
$('bZoomOut').addEventListener('click', () => zoomBy(1.33));
$('bFit').addEventListener('click', () => fitTo(targetBox(), null));
$('dClose').addEventListener('click', () => select(null));
$('dFocus').addEventListener('click', () => selected && focusItem(selected));
$('dIsolate').addEventListener('click', () => {
  isolate = !isolate; $('dIsolate').setAttribute('aria-pressed', String(isolate)); refreshLook();
});

function collapseParts(on) {
  $('parts').classList.toggle('collapsed', on);
  $('partsToggle').setAttribute('aria-expanded', String(!on));
  $('partsToggle').title = on ? 'Show the components list' : 'Hide the components list';
  // On wide screens the model re-centres into the space the list frees up.
  const before = insets.left;
  resize();
  if (cfg && insets.left !== before) fitTo(targetBox(), null);
}
$('partsToggle').addEventListener('click', () => collapseParts(!$('parts').classList.contains('collapsed')));
if (matchMedia('(max-width: 820px)').matches) collapseParts(true);

document.querySelectorAll('[data-model]').forEach((b) => b.addEventListener('click', () => {
  const id = b.dataset.model;
  if (cfg?.id === id) return;
  const url = new URL(location.href);
  url.searchParams.set('model', id);
  history.replaceState(null, '', url);
  loadModel(id);
}));

function setBackground(name) {
  const bg = BACKGROUNDS[name] ? name : 'studio';
  document.documentElement.dataset.bg = bg;
  document.querySelectorAll('[data-bg]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.bg === bg)));
  tableMat.material.color.set(BACKGROUNDS[bg].mat);
  paintMat(BACKGROUNDS[bg].grid);
  ground.material.opacity = BACKGROUNDS[bg].shadow;
  store.set('rts-bg', bg);
}
document.querySelectorAll('button[data-bg]').forEach((b) => b.addEventListener('click', () => setBackground(b.dataset.bg)));
setBackground(store.get('rts-bg') || 'studio');

window.addEventListener('keydown', (ev) => {
  if (/^(INPUT|SELECT|TEXTAREA)$/.test(ev.target.tagName) || !cfg || !$('quote').hidden) return;
  if (ev.key === 'Escape') select(null);
  if (ev.key === 'e' || ev.key === 'E') (eT === 1 && sT === 0 ? goAssembled : goExploded)();
  if (ev.key === 't' || ev.key === 'T') { sT = sT > 0.5 ? 0 : 1; syncButtons(); if (sT && !showLabels) toggleLabels(true); pendingFit = { view: sT ? 'table' : null, at: 0.4 }; }
  if (ev.key === 'f' || ev.key === 'F') fitTo(targetBox(), null);
  if (ev.key === 'l' || ev.key === 'L') toggleLabels();
});

// ---------- resize / loop ----------
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const wide = w > 820;
  const tb = $('toolbar').offsetHeight || 60;
  document.documentElement.style.setProperty('--tb', `${tb}px`);
  const top = captureMode ? 0 : (document.querySelector('.topbar')?.offsetHeight || 60) + 8;
  const listOpen = !$('parts').classList.contains('collapsed');
  const left = captureMode ? 0 : (wide && listOpen) ? 330 : 0, bottom = captureMode ? 0 : tb + (wide ? 24 : 16);
  Object.assign(insets, { left, right: 0, top, bottom, w, h });
  camera.setViewOffset(w, h, -left / 2, (bottom - top) / 2, w, h);
  camera.updateProjectionMatrix();
  $('leaders').setAttribute('viewBox', `0 0 ${w} ${h}`);
  updateCalloutVisibility();
}
window.addEventListener('resize', resize);

const clock = new THREE.Clock();
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (cfg && (Math.abs(e - eT) > 1e-4 || Math.abs(s - sT) > 1e-4)) {
    const k = reduceMotion ? 1 : 1 - Math.exp(-5 * dt);
    e += (eT - e) * k; s += (sT - s) * k;
    if (Math.abs(e - eT) < 0.002) e = eT;
    if (Math.abs(s - sT) < 0.002) s = sT;
    applyState();
    $('spread').value = Math.round(s * 100);
  }
  if (pendingFit && cfg) {
    fitTo(targetBox(), pendingFit.view ? cfg.views[pendingFit.view] : null);
    pendingFit = null;
  }
  if (camTween) {
    camTween.k = Math.min(1, camTween.k + dt / 0.8);
    const t = 1 - Math.pow(1 - camTween.k, 3);
    camera.position.lerpVectors(camTween.p0, camTween.p1, t);
    controls.target.lerpVectors(camTween.t0, camTween.t1, t);
    if (camTween.k >= 1) camTween = null;
  }
  controls.update();
  processHover();
  renderer.render(scene, camera);
  layoutCallouts();
  requestAnimationFrame(tick);
}

// ---------- save image: current view, labels and branding as a PNG ----------
const lockupImg = new Image();
lockupImg.src = window.RTS_ASSETS?.lockup || 'assets/reude-lockup.png';

function stateLabel() {
  if (s > 0.98) return ['table-layout', 'Components on the table'];
  if (s > 0.02) return [`spread-${Math.round(s * 100)}`, `Spread ${Math.round(s * 100)}%`];
  if (e > 0.98) return ['exploded', 'Exploded view'];
  return ['assembled', 'Assembled view'];
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}

async function saveImage() {
  if (!cfg) return;
  const W = canvas.clientWidth, H = canvas.clientHeight, k = 2;
  const prev = renderer.getPixelRatio();
  renderer.setPixelRatio(k); renderer.setSize(W, H, false);
  renderer.render(scene, camera);
  const out = document.createElement('canvas');
  out.width = W * k; out.height = H * k;
  const c = out.getContext('2d');
  const bg = document.documentElement.dataset.bg;
  if (bg === 'white') { c.fillStyle = '#fff'; c.fillRect(0, 0, out.width, out.height); }
  else if (bg === 'light') { const g = c.createLinearGradient(0, 0, 0, out.height); g.addColorStop(0, '#eef1f4'); g.addColorStop(1, '#d5dce3'); c.fillStyle = g; c.fillRect(0, 0, out.width, out.height); }
  else { const g = c.createRadialGradient(out.width * 0.55, out.height * 0.35, 0, out.width * 0.55, out.height * 0.35, out.width * 0.75); g.addColorStop(0, '#3a4b5e'); g.addColorStop(0.45, '#26323f'); g.addColorStop(1, '#141b23'); c.fillStyle = g; c.fillRect(0, 0, out.width, out.height); }
  c.drawImage(renderer.domElement, 0, 0);
  renderer.setPixelRatio(prev); renderer.setSize(W, H, false);
  const dark = bg !== 'white' && bg !== 'light';
  // labels
  if (showLabels) {
    c.scale(k, k);
    for (const cl of callouts) {
      if (!cl.visible || cl.el.style.display === 'none') continue;
      const on = selected === cl.it;
      c.strokeStyle = on ? '#e8630a' : (dark ? 'rgba(236,241,246,0.85)' : 'rgba(24,34,45,0.6)'); c.lineWidth = on ? 1.5 : 1;
      const ex = cl.side < 0 ? cl.x + cl.w : cl.x, ey = cl.y + cl.h / 2;
      c.beginPath(); c.moveTo(cl.ax, cl.ay); c.lineTo(ex, ey); c.stroke();
      c.fillStyle = c.strokeStyle; c.beginPath(); c.arc(cl.ax, cl.ay, 2.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff'; c.strokeStyle = on ? '#e8630a' : '#d3d9df';
      roundRect(c, cl.x, cl.y, cl.w, cl.h, cl.h / 2); c.fill(); c.stroke();
      const r = 12, bx = cl.x + 3 + r, by = cl.y + cl.h / 2;
      c.fillStyle = on ? '#e8630a' : '#fff'; c.strokeStyle = on ? '#e8630a' : '#18222d'; c.lineWidth = 1.5;
      c.beginPath(); c.arc(bx, by, r - 0.75, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = on ? '#fff' : '#18222d'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = '600 13px "Barlow Condensed", Arial, sans-serif'; c.fillText(String(cl.it.n), bx, by + 0.5);
      if (!cl.el.classList.contains('compact')) {
        c.textAlign = 'left'; c.fillStyle = '#18222d'; c.font = '500 13px Barlow, Arial, sans-serif';
        c.fillText(cl.it.name, bx + r + 6, by + 0.5);
      }
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
  }
  // title block
  const [slug, stateText] = stateLabel();
  const view = viewName === 'custom' ? 'custom angle' : `${viewName} view`;
  const pad = 24 * k, boxW = 380 * k, boxH = 96 * k;
  c.fillStyle = 'rgba(255,255,255,0.94)'; roundRect(c, pad, pad, boxW, boxH, 6 * k); c.fill();
  c.fillStyle = '#e8630a'; c.fillRect(pad, pad, 5 * k, boxH);
  if (lockupImg.complete && lockupImg.naturalWidth) {
    const lh = 30 * k, lw = lockupImg.naturalWidth * lh / lockupImg.naturalHeight;
    c.drawImage(lockupImg, pad + boxW - lw - 14 * k, pad + 12 * k, lw, lh);
  }
  c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = '#18222d';
  c.font = `700 ${26 * k}px "Barlow Condensed", Arial, sans-serif`;
  c.fillText(`DynoX ${cfg.title}`, pad + 18 * k, pad + 36 * k);
  c.font = `500 ${14 * k}px Barlow, Arial, sans-serif`; c.fillStyle = '#5b6875';
  c.fillText(cfg.subtitle, pad + 18 * k, pad + 58 * k);
  c.fillStyle = '#1f5c99'; c.font = `600 ${14 * k}px Barlow, Arial, sans-serif`;
  c.fillText(`${stateText} · ${view}`, pad + 18 * k, pad + 80 * k);
  c.font = `500 ${12 * k}px Barlow, Arial, sans-serif`; c.fillStyle = dark ? 'rgba(230,236,242,0.8)' : '#5b6875';
  c.textAlign = 'right';
  c.fillText('REUDE Technologies · reude.tech · business@reude.tech', out.width - pad, out.height - pad);
  out.toBlob((b) => saveBlob(b, `DynoX-${cfg.title.replace(/\s+/g, '-')}_${slug}_${viewName}.png`), 'image/png');
  toast('Image saved');
}

let toastTimer = 0;
function toast(text) {
  const t = $('toast'); t.textContent = text; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, 2200);
}

initQuote(() => cfg?.id);

// ---------- capture helpers (used to render manual figures) ----------
function capture(opts = {}) {
  const show = opts.show ? new Set(opts.show) : null;
  const hl = new Set(opts.hl || []);
  stopAutoRotate();
  select(null);
  e = eT = opts.explode || 0; s = sT = opts.spread || 0;
  applyState();
  for (const p of pieces) {
    const vis = !show || show.has(p.id);
    for (const m of p.meshes) {
      m.visible = vis;
      if (!m.userData.base) m.userData.base = { color: m.material.color.getHex(), metalness: m.material.metalness };
      const on = hl.has(p.id);
      m.material.color.setHex(on ? 0xf08a3c : m.userData.base.color);
      m.material.metalness = on ? 0.25 : m.userData.base.metalness;
      m.material.emissive.set(0xe8630a);
      m.material.emissiveIntensity = on ? 0.18 : 0;
      if (m.userData.edges) m.userData.edges.visible = showEdges;
    }
  }
  const hlMeshes = new Set(pieces.filter((p) => hl.has(p.id)).flatMap((p) => p.meshes));
  // Item-level options: hide an item (e.g. slot covers before they are fitted) or highlight one.
  for (const it of items) {
    if ((opts.hideItems || []).includes(it.name)) it.meshes.forEach((m) => { m.visible = false; });
    if ((opts.hlItems || []).includes(it.name)) it.meshes.forEach((m) => {
      if (!m.visible) return;
      m.material.color.setHex(0xf08a3c); m.material.emissiveIntensity = 0.25; hlMeshes.add(m);
    });
  }
  showLabels = !!opts.labels;
  compactLabels = false;
  labelFilter = opts.labels === 'all' ? null : new Set(callouts.filter((c) => c.it.meshes.some((m) => hlMeshes.has(m))).map((c) => c.it));
  updateCalloutVisibility();
  const box = boxAt(e, s, true);
  fitTo(box, opts.dir || cfg.views[opts.view || 'iso'], false, opts.pad || 1.05);
}
function project(pt) {
  const v = new THREE.Vector3(...pt).add(root.position).project(camera);
  return [(v.x * 0.5 + 0.5) * canvas.clientWidth, (-v.y * 0.5 + 0.5) * canvas.clientHeight];
}

resize();
const startId = new URLSearchParams(location.search).get('model');
loadModel(MODELS[startId] ? startId : DEFAULT_MODEL).then(() => {
  requestAnimationFrame(tick);
  setTimeout(() => $('hint').classList.add('gone'), 10000);
});
window.__rts = {
  goExploded, goAssembled, setView, select, loadModel, toggleLabels, capture, project, saveImage,
  dbg: () => ({ box: [boxAt(e, s, true).min.toArray(), boxAt(e, s, true).max.toArray()], cam: camera.position.toArray(), target: controls.target.toArray(), insets: { ...insets }, aspect: camera.aspect, view: camera.view }),
  setCaptureMode: (on) => { captureMode = on; document.body.classList.toggle('capture', on); resize(); },
  pieceBox: (id) => { const p = pieces.find((q) => q.id === id); const b = p.local.clone().translate(p.c0); return [b.min.toArray(), b.max.toArray()]; },
  setSpread: (v) => { sT = s = v; applyState(); syncButtons(); },
  get items() { return items; }, get pieces() { return pieces; }, get state() { return { e, s }; },
};
