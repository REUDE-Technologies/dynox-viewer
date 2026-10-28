import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { ITEMS as COMPACT_ITEMS, SECTIONS as COMPACT_SECTIONS, MATERIALS } from './catalog.js';
import { PRICES, CURRENCY, REFERENCE } from './bom.js';
import { STANDS, catalogFromMeshes, isFastenerPart, getStructuredExplodeOffset, getStructuredExplodePhase } from './models.js?v=79';
import { qrcode } from './vendor/qr/qrcode.js';
import {
  fetchDesign, uploadDesign, renameDesign, publicFileUrl, shareUrl,
} from './designs-api.js';

const $ = (id) => document.getElementById(id);
const canvas = $('scene');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- renderer / scene ----------
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = studioBackdrop();
const pmrem = new THREE.PMREMGenerator(renderer);

const camera = new THREE.PerspectiveCamera(35, 1, 5, 20000);
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.65;
controls.zoomSpeed = 0.7;
controls.panSpeed = 0.55;
controls.screenSpacePanning = true;
controls.minDistance = 80;
controls.maxDistance = 40000;
controls.maxPolarAngle = Math.PI * 0.49;
controls.zoomToCursor = true;
controls.autoRotateSpeed = 0.4;
controls.keys = { LEFT: 'ArrowLeft', UP: 'ArrowUp', RIGHT: 'ArrowRight', BOTTOM: 'ArrowDown' };
controls.listenToKeyEvents(window);

scene.add(new THREE.HemisphereLight(0xf7f8fa, 0xb7c0c8, 0.42));
const sun = new THREE.DirectionalLight(0xfff6ee, 2.15);
sun.position.set(480, 1400, 640);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -900, right: 900, top: 900, bottom: -900, near: 10, far: 4000 });
sun.shadow.bias = -0.0004;
scene.add(sun, sun.target);
const fill = new THREE.DirectionalLight(0xd7e4f0, 0.65);
fill.position.set(-820, 480, -360);
scene.add(fill);

const ground = new THREE.Mesh(new THREE.CircleGeometry(3200, 96), floorMaterial());
ground.rotation.x = -Math.PI / 2;
ground.position.y = -2;
ground.receiveShadow = true;
scene.add(ground);

const root = new THREE.Group();
scene.add(root);

// ---------- state ----------
let items = COMPACT_ITEMS;
let sections = COMPACT_SECTIONS;
let currentId = 'compact5';
let sharedDesign = null;
let envReady = false;
let loadToken = 0;
const parts = [];
const itemParts = new Map(); // item.n -> parts[]
let spread = 0, spreadTarget = 0;
const rootBase = new THREE.Vector3();
let selected = null, hovered = null, isolate = false;
let showLabels = false, showEdges = false;
let camTween = null;
const insets = { left: 0, bottom: 0, w: 1, h: 1 };

const EXPLODE_SCALE = 0.8;
const COL = new THREE.Vector3(9, 0, -17);
const THR = new THREE.Vector3(0, 197, -17);

// ---------- load ----------
async function loadModelBuffer() {
  if (window.RTS_MODEL_B64) {
    const bin = atob(window.RTS_MODEL_B64);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    $('loadBar').style.width = '100%';
    return out.buffer;
  }
  const res = await fetch(window.RTS_MODEL_URL);
  if (!res.ok) throw new Error(`Model file returned ${res.status}`);
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

function studioBackdrop() {
  const c = document.createElement('canvas');
  c.width = 8;
  c.height = 512;
  const g = c.getContext('2d');
  const grad = g.createLinearGradient(0, 0, 0, 512);
  grad.addColorStop(0, '#fbf8f3');
  grad.addColorStop(0.42, '#f2ece0');
  grad.addColorStop(0.78, '#e5dccf');
  grad.addColorStop(1, '#d8cdbe');
  g.fillStyle = grad;
  g.fillRect(0, 0, 8, 512);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function floorMaterial() {
  const c = document.createElement('canvas');
  c.width = c.height = 1024;
  const g = c.getContext('2d');
  const glow = g.createRadialGradient(512, 512, 30, 512, 512, 490);
  glow.addColorStop(0, 'rgba(251, 248, 243, 0.96)');
  glow.addColorStop(0.42, 'rgba(242, 236, 224, 0.78)');
  glow.addColorStop(0.74, 'rgba(216, 205, 190, 0.28)');
  glow.addColorStop(1, 'rgba(216, 205, 190, 0)');
  g.fillStyle = glow;
  g.fillRect(0, 0, 1024, 1024);
  g.lineWidth = 1;
  for (let i = 64; i < 1024; i += 64) {
    const fade = 1 - Math.abs(i - 512) / 512;
    g.strokeStyle = `rgba(60, 48, 36, ${Math.max(0, fade * fade * 0.055).toFixed(3)})`;
    g.beginPath(); g.moveTo(i + 0.5, 64); g.lineTo(i + 0.5, 960); g.stroke();
    g.beginPath(); g.moveTo(64, i + 0.5); g.lineTo(960, i + 0.5); g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return new THREE.MeshStandardMaterial({
    map: tex, transparent: true, roughness: 1, metalness: 0, depthWrite: false,
  });
}

function studioEnvironment(pmremGen) {
  const env = new THREE.Scene();
  const shell = new THREE.Mesh(
    new THREE.SphereGeometry(14, 40, 28),
    new THREE.MeshBasicMaterial({ color: 0xd5dce3, side: THREE.BackSide })
  );
  env.add(shell);
  const softbox = (w, h, color, x, y, z) => {
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color }));
    panel.position.set(x, y, z);
    panel.lookAt(0, 1.2, 0);
    env.add(panel);
  };
  softbox(8, 4.5, 0xffffff, 5, 6, 5);
  softbox(6, 3, 0xf4f6f8, -6, 3.5, 2);
  softbox(10, 1.6, 0xffffff, 0, 8, 0);
  const tex = pmremGen.fromScene(env, 0.08).texture;
  pmremGen.dispose();
  return tex;
}

function materialHex(key) {
  const color = (MATERIALS[key] || MATERIALS.alu).color;
  return `#${color.toString(16).padStart(6, '0')}`;
}

function makeMaterial(key) {
  const m = MATERIALS[key] || MATERIALS.alu;
  const params = {
    color: m.color, metalness: m.metalness, roughness: m.roughness,
    envMapIntensity: m.env ?? 0.85, side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
  };
  if (key === 'alu' || key === 'sheet' || key === 'cell' || key === 'brass' || key === 'fastener') {
    return new THREE.MeshPhysicalMaterial({ ...params, clearcoat: 0.08, clearcoatRoughness: 0.55 });
  }
  return new THREE.MeshStandardMaterial(params);
}

let edgeTint = '';
function edgeColor() {
  return edgeTint || getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#18222d';
}

function makeEdgeMaterial() {
  const mat = new THREE.LineBasicMaterial({
    color: edgeColor(),
    transparent: true,
    opacity: edgeTint ? 1 : 0.88,
    toneMapped: false,
    depthTest: true,
    depthWrite: false,
  });
  // Lines sit exactly on the triangles, so the depth test hides them.
  // The 20 kg frame is larger and darker, so its lines need a slightly bigger nudge.
  const bias = edgeTint ? '0.0011' : '0.00045';
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <logdepthbuf_fragment>',
      `#include <logdepthbuf_fragment>\n\tgl_FragDepth = max(0.0, gl_FragCoord.z - ${bias});`
    );
  };
  return mat;
}

function findMesh(obj) {
  if (!obj) return null;
  if (obj.isMesh && obj.geometry) return obj;
  let found = null;
  obj.traverse((child) => {
    if (!found && child.isMesh && child.geometry) found = child;
  });
  return found;
}

let edgeMat = null;
function ensureEdges(p) {
  if (p.edges) return p.edges;
  if (!edgeMat) edgeMat = makeEdgeMaterial();
  let edgeGeo = new THREE.EdgesGeometry(p.mesh.geometry, 20);
  const edgePos = edgeGeo.getAttribute('position');
  if (!edgePos || edgePos.count < 2) {
    edgeGeo.dispose();
    edgeGeo = new THREE.EdgesGeometry(p.mesh.geometry, 1);
  }
  const edges = new THREE.LineSegments(edgeGeo, edgeMat);
  edges.raycast = () => {};
  edges.renderOrder = 2;
  edges.visible = false;
  p.mesh.add(edges);
  p.edges = edges;
  return edges;
}

function clearAssembly() {
  selected = null;
  hovered = null;
  isolate = false;
  if ($('dIsolate')) $('dIsolate').setAttribute('aria-pressed', 'false');
  if ($('detail')) $('detail').hidden = true;
  showLabels = false;
  showEdges = false;
  if ($('bLabels')) $('bLabels').setAttribute('aria-pressed', 'false');
  if ($('bEdges')) $('bEdges').setAttribute('aria-pressed', 'false');
  spread = 0;
  spreadTarget = 0;
  if ($('spread')) $('spread').value = '0';
  if ($('bAssembled')) $('bAssembled').setAttribute('aria-pressed', 'true');
  if ($('bExploded')) $('bExploded').setAttribute('aria-pressed', 'false');
  for (const p of parts) {
    if (p.edges) p.edges.geometry.dispose();
    p.mat.dispose();
  }
  if (edgeMat) { edgeMat.dispose(); edgeMat = null; }
  parts.length = 0;
  itemParts.clear();
  root.traverse((obj) => { if (obj.geometry) obj.geometry.dispose(); });
  root.clear();
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  root.scale.set(1, 1, 1);
  rootBase.set(0, 0, 0);
  root.updateMatrixWorld(true);
  $('labels').replaceChildren();
  while ($('leaders').firstChild) $('leaders').removeChild($('leaders').firstChild);
  callouts.length = 0;
  $('partsBody').replaceChildren();
  $('bomBody').replaceChildren();
}

function ensureEnv() {
  if (envReady) return;
  envReady = true;
  requestAnimationFrame(() => {
    try { scene.environment = studioEnvironment(pmrem); }
    catch (err) { console.error(err); }
  });
}

function setSharedBar(design) {
  sharedDesign = design;
  const bar = $('sharedBar');
  if (!bar) return;
  if (!design) {
    bar.hidden = true;
    return;
  }
  bar.hidden = false;
  $('sharedTitle').value = design.title || 'Untitled design';
  $('sharedNote').textContent = '';
}

function checkIsFastener(item, mesh) {
  if (!item && !mesh) return false;
  if (item && (item.s === 'fast' || item.mat === 'fastener' || isFastenerPart(item.name))) return true;
  if (mesh && (isFastenerPart(mesh.name) || isFastenerPart(mesh.userData?.step))) return true;
  return false;
}

async function loadStand(id, standOverride = null) {
  const stand = standOverride || STANDS.find((entry) => entry.id === id) || STANDS[0];
  const token = ++loadToken;
  currentId = stand.id;
  edgeTint = stand.edgeColor || '';
  if (!standOverride && $('modelPick')) {
    $('modelPick').value = stand.id;
    try {
      const u = new URL(location.href);
      if (u.searchParams.get('stand') !== stand.id) {
        u.searchParams.set('stand', stand.id);
        u.searchParams.delete('m');
        history.replaceState(null, '', u.pathname + (u.search || '') + u.hash);
      }
    } catch {}
  }
  if (standOverride) setSharedBar({ id: stand.designId, title: stand.title });
  else setSharedBar(null);
  $('plateTitle').textContent = stand.title;
  $('plateTag').textContent = stand.tagline;
  const manualBtn = $('manualBtn');
if (manualBtn && stand.manual) {
  manualBtn.href = stand.manual;
  manualBtn.download = stand.manual.split('/').pop();
}
  document.title = `${stand.title} | 3D viewer`;
  canvas.setAttribute('aria-label', `3D model of the ${stand.title}`);
  $('loading').classList.remove('done');
  $('loadText').textContent = 'Loading model';
  $('loadBar').style.width = '0';
  clearAssembly();
  window.RTS_MODEL_URL = stand.url;
  let gltf;
  try {
    const modelPromise = loadModelBuffer();
    const ready = MeshoptDecoder.ready || Promise.resolve();
    await Promise.race([
      ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('the decoder did not start')), 20000)),
    ]);
    if (token !== loadToken) return;
    const buf = await modelPromise;
    if (token !== loadToken) return;
    $('loadText').textContent = 'Building model';
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    gltf = await new Promise((res, rej) => loader.parse(buf, '', res, rej));
  } catch (err) {
    console.error(err);
    if (token !== loadToken) return;
    $('loadText').textContent = `The model could not be loaded. ${err.message}. Reload the page to try again.`;
    return;
  }

  const byName = new Map();
  const named = [];
  gltf.scene.traverse((o) => { if (o.isMesh) byName.set(o.name.replace(/_\d+$/, ''), o); });
  gltf.scene.traverse((o) => {
    if (!/^p\d+$/.test(o.name)) return;
    const mesh = findMesh(o);
    byName.set(o.name, mesh || o);
    named.push({ idx: Number(o.name.slice(1)), stepName: (o.userData && o.userData.step) || '' });
  });
  // Index every mesh when pN nodes are absent (both for custom items and named mode)
  if (!named.length) {
    let i = 0;
    gltf.scene.traverse((o) => {
      if (!o.isMesh || !o.geometry) return;
      byName.set('p' + i, o);
      named.push({ idx: i, stepName: o.name || '' });
      i += 1;
    });
  }
  if (stand.items && stand.sections) {
    items = stand.items;
    sections = stand.sections;
  } else if (stand.mode === 'named') {
    const built = catalogFromMeshes(named, {
      pinElectronics: !!stand.pinElectronics,
      hideElectronics: !!stand.hideElectronics,
      label: stand.title,
    });
    items = built.items;
    sections = built.sections;
    for (const entry of built.hidden || []) {
      const mesh = findMesh(byName.get('p' + entry.idx));
      if (mesh) {
        mesh.visible = false;
        mesh.castShadow = false;
        mesh.receiveShadow = false;
      }
    }
  } else {
    items = COMPACT_ITEMS;
    sections = COMPACT_SECTIONS;
  }

  // Remove embedded CAD export cameras, viewports, and directional lights
  const toRemove = [];
  gltf.scene.traverse((o) => {
    if (o !== gltf.scene && (o.isCamera || o.isLight || /viewport|camera|light|directional|softbox|faded|studio|white/i.test(o.name))) {
      toRemove.push(o);
    }
  });
  toRemove.forEach((o) => o.parent && o.parent.remove(o));

  // Reset CAD wrapper node (e.g. Node0 in 20kg.glb) so geometry coordinates are preserved directly
  const node0 = gltf.scene.getObjectByName('Node0');
  if (node0) {
    node0.position.set(0, 0, 0);
    node0.quaternion.identity();
    node0.scale.set(1, 1, 1);
    node0.updateMatrix();
  }
  // Flatten any nested mesh hierarchies (where a mesh is nested inside another mesh)
  // so each mesh can explode independently without dragging other parts along
  const nestedMeshes = [];
  gltf.scene.traverse((o) => {
    if (o.isMesh && o.parent && o.parent.isMesh) nestedMeshes.push(o);
  });
  for (const m of nestedMeshes) {
    gltf.scene.add(m);
    m.position.set(0, 0, 0);
    m.rotation.set(0, 0, 0);
    m.scale.set(1, 1, 1);
  }

  if (stand.rotation) {
    gltf.scene.rotation.set(...stand.rotation);
  } else {
    gltf.scene.rotation.set(0, 0, 0);
  }

  root.add(gltf.scene);
  // Uploaded glTF files are in metres. Catalog stands are already in millimetres.
  // A stand-sized model under 20 units is metres; scale it so 1 unit = 1 mm.
  if (stand.autoUnits && !(stand.unitScale && stand.unitScale !== 1)) {
    gltf.scene.updateMatrixWorld(true);
    const raw = new THREE.Box3().setFromObject(gltf.scene);
    const rawSize = raw.getSize(new THREE.Vector3());
    const maxDim = Math.max(rawSize.x, rawSize.y, rawSize.z);
    stand.unitScale = maxDim > 0 && maxDim < 20 ? 1000 : 1;
  }
  if (stand.unitScale && stand.unitScale !== 1) {
    gltf.scene.scale.setScalar(stand.unitScale);
  }
  root.updateMatrixWorld(true);
  const assembly = new THREE.Box3().setFromObject(gltf.scene);
  const assemblyCenter = assembly.getCenter(new THREE.Vector3());

  try {
  for (const item of items) {
    const list = [];
    for (const [idx, vec, axis, k, matOverride] of item.parts) {
      const mesh = findMesh(byName.get('p' + idx));
      if (!mesh || !mesh.geometry) continue;
      if (!mesh.geometry.attributes.normal) mesh.geometry.computeVertexNormals();
      const mat = makeMaterial(matOverride || item.mat);
      mesh.material = mat;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      const offset = new THREE.Vector3();
      // Fasteners (screws, bolts, nuts, washers, etc.) do not explode; they are removed in exploded view
      const isFastener = checkIsFastener(item, mesh);
      const hasExplicitVec = Array.isArray(vec) && (vec[0] !== 0 || vec[1] !== 0 || vec[2] !== 0);
      if (isFastener) {
        offset.set(0, 0, 0);
      } else if (hasExplicitVec) {
        offset.set(...vec).multiplyScalar(EXPLODE_SCALE);
      } else {
        const structured = getStructuredExplodeOffset(stand.id, item.name, item.s, [center.x, center.y, center.z], assemblyCenter, mesh.name);
        if (structured[0] !== 0 || structured[1] !== 0 || structured[2] !== 0) {
          offset.set(...structured);
        } else if (axis && k) {
          const r = axis === 'col'
            ? new THREE.Vector3(center.x - COL.x, 0, center.z - COL.z)
            : new THREE.Vector3(0, center.y - THR.y, center.z - THR.z);
          if (r.lengthSq() > 1) offset.add(r.normalize().multiplyScalar(k * EXPLODE_SCALE));
        } else {
          offset.set(0, 0, 0);
        }
      }
      const phase = getStructuredExplodePhase(stand.id, item.name, item.s, [center.x, center.y, center.z], mesh.name);
      // Centers are measured in world mm after unitScale, but mesh.position is local.
      if (stand.unitScale && stand.unitScale !== 1 && offset.lengthSq() > 0) {
        offset.divideScalar(stand.unitScale);
      }
      // Transform world offset to parent local coordinate space so all parts (such as blades and mirrored parts) explode consistently in world space
      if (mesh.parent && offset.lengthSq() > 0) {
        const parentQ = new THREE.Quaternion();
        mesh.parent.getWorldQuaternion(parentQ);
        offset.applyQuaternion(parentQ.invert());
      }
      mesh.geometry.computeBoundingBox();
      const localBox = mesh.geometry.boundingBox.clone();
      const localCenter = localBox.getCenter(new THREE.Vector3());
      const anchor = item.anchor ? new THREE.Vector3(...item.anchor) : null;
      const p = {
        mesh, item, base: mesh.position.clone(), offset, phase, localBox, localCenter,
        worldCenter: new THREE.Vector3(), anchor, edges: null, mat,
        isFastener,
      };
      mesh.userData.part = p;
      parts.push(p); list.push(p);
    }
    itemParts.set(item.n, list);
  }

  // Calculate clean ground seating from visible parts with root at origin
  root.position.set(0, 0, 0);
  root.rotation.set(0, 0, 0);
  root.updateMatrixWorld(true);
  const bb = visibleBox();
  const c = bb.getCenter(new THREE.Vector3());
  root.position.set(-c.x, -bb.min.y, -c.z);
  rootBase.copy(root.position);
  root.updateMatrixWorld(true);

  buildPartsList();
  buildCallouts();
  resize();
  applySpread(0);
  setView('iso', false);
  $('loading').classList.add('done');
  $('hint').classList.remove('gone');
  setTimeout(() => $('hint').classList.add('gone'), 9000);
  ensureEnv();
  } catch (err) {
    console.error(err);
    $('loadText').textContent = `The model could not be loaded. ${err.message}. Reload the page to try again.`;
  }
}

// ---------- explode ----------
const _v = new THREE.Vector3();
const _bb = new THREE.Box3();
const FLOOR_Y = 0;

function partWorldBox(p, target) {
  return target.copy(p.localBox).applyMatrix4(p.mesh.matrixWorld);
}

function smoothStep(t, min, max) {
  if (t <= min) return 0;
  if (t >= max) return 1;
  const x = (t - min) / (max - min);
  return x * x * (3 - 2 * x);
}

function applySpread(t) {
  const isExploded = t > 0.001;
  for (const p of parts) {
    const weight = (p.phase && isExploded) ? smoothStep(t, p.phase[0], p.phase[1]) : t;
    p.mesh.position.copy(p.base).addScaledVector(p.offset, weight);
    if (p.isFastener) {
      p.mesh.visible = !isExploded && !(isolate && selected && p.item !== selected);
      if (p.edges) p.edges.visible = p.mesh.visible && showEdges;
    }
  }
  root.position.copy(rootBase);
  root.updateMatrixWorld(true);
  // Keep the exploded stack seated on the floor. Downward offsets open the
  // assembly upward instead of driving the base through the ground.
  let minY = Infinity;
  for (const p of parts) {
    if (!p.mesh.visible) continue;
    minY = Math.min(minY, partWorldBox(p, _bb).min.y);
  }
  if (Number.isFinite(minY) && minY < FLOOR_Y) {
    root.position.y = rootBase.y + (FLOOR_Y - minY);
    root.updateMatrixWorld(true);
  }
  updateCalloutVisibility();
}

function visibleBox() {
  const box = new THREE.Box3();
  let any = false;
  for (const p of parts) {
    if (!p.mesh.visible) continue;
    box.union(partWorldBox(p, _bb));
    any = true;
  }
  if (!any) box.setFromCenterAndSize(new THREE.Vector3(0, 80, 0), new THREE.Vector3(80, 160, 80));
  return box;
}

function getViewDirection(name, standId) {
  if (name === 'top') return new THREE.Vector3(0.0001, 1.2, 0.0001);
  if (name === 'iso') {
    if (standId === 'ultra50') return new THREE.Vector3(1.15, 0.75, -1.15);
    return new THREE.Vector3(1.1, 0.7, 1.2);
  }
  if (standId === 'compact5') {
    // Compact 5: Motor & propeller thrust axis points forward along +X
    if (name === 'front') return new THREE.Vector3(1.2, 0.05, 0);  // Direct head-on view of motor & propeller
    if (name === 'side') return new THREE.Vector3(0, 0.05, 1.2);   // Direct side profile view of stand
  } else if (standId === 'ultra50') {
    // Ultra 50: Motor mount & sensing head points forward along -Z
    if (name === 'front') return new THREE.Vector3(0, 0.05, -1.2); // Direct head-on view of motor mount face
    if (name === 'side') return new THREE.Vector3(1.2, 0.05, 0);   // Direct side profile view of stand
  } else {
    // Pro 20: Motor & propeller thrust axis points forward along +Z
    if (name === 'front') return new THREE.Vector3(0, 0.05, 1.2);  // Direct head-on view of propeller face
    if (name === 'side') return new THREE.Vector3(1.2, 0.05, 0);   // Direct side profile view of stand
  }
  return new THREE.Vector3(1.1, 0.7, 1.2);
}

function fitTo(box, dir, animate = true, pad = 1.35) {
  const sphere = box.getBoundingSphere(new THREE.Sphere());
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const effW = Math.max(200, insets.w - insets.left), effH = Math.max(200, insets.h - insets.bottom - 20);
  const fitH = (sphere.radius / Math.sin(fov / 2)) * (insets.h / effH);
  const fitW = (sphere.radius / Math.sin(fov / 2)) * (insets.h / effH) * Math.max(1, effH / effW);
  const dist = Math.max(fitH, fitW) * pad * 0.72;
  const d = (dir || camera.position.clone().sub(controls.target)).clone().normalize();
  const to = sphere.center.clone().addScaledVector(d, dist);
  moveCamera(to, sphere.center, animate);
}

function moveCamera(pos, target, animate = true) {
  if (!animate || reduceMotion) {
    camera.position.copy(pos); controls.target.copy(target); controls.update(); camTween = null; return;
  }
  camTween = { p0: camera.position.clone(), t0: controls.target.clone(), p1: pos.clone(), t1: target.clone(), k: 0 };
}

function setView(name, animate = true) {
  const dir = getViewDirection(name, currentId || 'compact5');
  fitTo(visibleBox(), dir, animate);
}

function zoomBy(f) {
  const off = camera.position.clone().sub(controls.target).multiplyScalar(f);
  const len = THREE.MathUtils.clamp(off.length(), controls.minDistance, controls.maxDistance);
  moveCamera(controls.target.clone().add(off.setLength(len)), controls.target.clone());
}

// ---------- parts list ----------
function buildPartsList() {
  const body = $('partsBody');
  body.replaceChildren();
  $('partCount').textContent = items.length;
  for (const s of sections) {
    const group = items.filter((i) => i.s === s.id);
    if (!group.length) continue;
    const h = document.createElement('h3'); h.textContent = s.name; body.appendChild(h);
    for (const it of group) {
      const b = document.createElement('button');
      b.className = 'part'; b.dataset.n = it.n;
      b.innerHTML = `<span class="balloon">${it.n}</span><span class="swatch" style="background:${materialHex(it.mat)}"></span><span>${it.name}</span><span class="q">×${it.qty}</span>`;
      b.addEventListener('click', () => select(selected === it ? null : it, true));
      b.addEventListener('mouseenter', () => setHover(it));
      b.addEventListener('mouseleave', () => setHover(null));
      body.appendChild(b);
    }
  }
  if (!dashboardBound) {
    dashboardBound = true;
    $('partsToggle').addEventListener('click', () => {
      const p = $('parts'); const collapsed = p.classList.toggle('collapsed');
      $('partsToggle').setAttribute('aria-expanded', String(!collapsed));
      $('partsToggle').textContent = collapsed ? 'Parts' : 'Hide';
      resize();
    });
    $('tabParts').addEventListener('click', () => showDash('parts'));
    if ($('tabBom')) $('tabBom').addEventListener('click', () => showDash('bom'));
    bindDashResize();
  }
  syncPartsToggle();
  showDash('parts');
  if (!$('parts').classList.contains('no-bom')) buildBom();
}

function syncPartsToggle() {
  const collapsed = $('parts').classList.contains('collapsed');
  $('partsToggle').setAttribute('aria-expanded', String(!collapsed));
  $('partsToggle').textContent = collapsed ? 'Parts' : 'Hide';
}

let dashboardBound = false;

let dashFrac = null;
try {
  const saved = JSON.parse(localStorage.getItem('rts-dash-frac'));
  if (saved && Number.isFinite(saved.wf) && Number.isFinite(saved.hf)) dashFrac = saved;
} catch { dashFrac = null; }

function dashLimits() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const wide = w > 820;
  const plate = document.querySelector('.plate');
  const top = wide ? Math.ceil(plate.getBoundingClientRect().bottom) + 12 : 0;
  const bottomGap = wide ? 96 : 150;
  if (!wide) {
    return { wide, top, minW: 0, maxW: w, minH: 96, maxH: Math.max(96, Math.round(h * 0.36)) };
  }
  return {
    wide,
    top,
    minW: 248,
    maxW: Math.max(210, Math.min(320, Math.round(w * 0.28))),
    minH: 160,
    maxH: Math.max(160, Math.min(Math.round(h * 0.48), h - top - bottomGap)),
  };
}

function applyDashSize(frac) {
  const panel = $('parts');
  const lim = dashLimits();
  panel.style.top = lim.wide ? `${lim.top}px` : '';
  if (panel.classList.contains('collapsed')) {
    panel.style.width = '';
    panel.style.height = '';
    panel.style.maxWidth = '';
    panel.style.maxHeight = '';
    return;
  }
  if (!frac) {
    panel.style.width = '';
    panel.style.height = '';
    panel.style.maxWidth = '';
    panel.style.maxHeight = '';
    return;
  }
  const height = Math.round(THREE.MathUtils.clamp(frac.hf * window.innerHeight, lim.minH, lim.maxH));
  panel.style.height = `${height}px`;
  panel.style.maxHeight = 'none';
  if (lim.wide) {
    const width = Math.round(THREE.MathUtils.clamp(frac.wf * window.innerWidth, lim.minW, lim.maxW));
    panel.style.width = `${width}px`;
    panel.style.maxWidth = 'none';
  } else {
    panel.style.width = '';
    panel.style.maxWidth = '';
  }
}

function rememberDashSize() {
  const panel = $('parts');
  dashFrac = { wf: panel.offsetWidth / window.innerWidth, hf: panel.offsetHeight / window.innerHeight };
  try { localStorage.setItem('rts-dash-frac', JSON.stringify(dashFrac)); } catch { /* keep the size for this session */ }
}

function bindDashResize() {
  const grip = $('dashSize');
  grip.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    grip.setPointerCapture(e.pointerId);
    const panel = $('parts');
    const start = { x: e.clientX, y: e.clientY, w: panel.offsetWidth, h: panel.offsetHeight };
    const move = (ev) => {
      const wide = window.innerWidth > 820;
      const w = wide ? start.w + (ev.clientX - start.x) : start.w;
      const h = wide ? start.h + (ev.clientY - start.y) : start.h - (ev.clientY - start.y);
      dashFrac = { wf: w / window.innerWidth, hf: h / window.innerHeight };
      applyDashSize(dashFrac);
      resize();
    };
    const up = () => {
      grip.removeEventListener('pointermove', move);
      grip.removeEventListener('pointerup', up);
      grip.removeEventListener('pointercancel', up);
      rememberDashSize();
      resize();
    };
    grip.addEventListener('pointermove', move);
    grip.addEventListener('pointerup', up);
    grip.addEventListener('pointercancel', up);
  });
  grip.addEventListener('dblclick', () => {
    dashFrac = null;
    try { localStorage.removeItem('rts-dash-frac'); } catch { /* session reset still applies */ }
    applyDashSize(null);
    resize();
  });
}

const MATERIAL_NAME = {
  alu: 'Aluminium, clear anodised',
  sheet: 'Sheet metal',
  cell: 'Beam load cell',
  printed: '3D printed',
  black: 'Black hardware',
  rubber: 'Rubber',
  motor: 'Brushless motor',
  carbon: 'Carbon fibre',
  fastener: 'Steel fastener',
  pcb: 'Printed circuit board',
  brass: 'Brass',
};

function showDash(which) {
  if ($('parts').classList.contains('no-bom')) which = 'parts';
  const bom = which === 'bom';
  $('partsBody').hidden = bom;
  $('bomBody').hidden = !bom;
  $('tabParts').setAttribute('aria-selected', String(!bom));
  if ($('tabBom')) $('tabBom').setAttribute('aria-selected', String(bom));
}

const PRICE_KEY = 'rts-bom-prices';
const bomMoney = new Intl.NumberFormat('en-IN', { style: 'currency', currency: CURRENCY, maximumFractionDigits: 2 });

function savedPrices() {
  try {
    const raw = JSON.parse(localStorage.getItem(PRICE_KEY));
    return raw && typeof raw === 'object' ? raw : {};
  } catch { return {}; }
}

function priceBook() {
  const raw = savedPrices();
  if (raw.compact5 || raw.pro20 || raw.ultra50) return raw;
  return { compact5: raw };
}

function unitPrice(n) {
  const saved = priceBook()[currentId] || {};
  if (Object.prototype.hasOwnProperty.call(saved, String(n))) {
    const value = saved[String(n)];
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }
  if (currentId !== 'compact5') return null;
  const file = PRICES[n];
  return typeof file === 'number' && Number.isFinite(file) ? file : null;
}

function readPrice(raw) {
  if (raw === '' || raw == null) return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

function refreshBomTotals() {
  const body = $('bomBody');
  let sum = 0;
  let open = 0;
  body.querySelectorAll('.bom-line').forEach((row) => {
    const item = items.find((entry) => entry.n === Number(row.dataset.n));
    const price = readPrice(row.querySelector('input').value);
    const material = MATERIAL_NAME[item.mat] || item.mat;
    const ref = currentId === 'compact5' && REFERENCE.has(item.n) ? ' · Reference' : '';
    const line = price == null ? null : price * item.qty;
    if (line == null) open += 1;
    else sum += line;
    row.querySelector('.bom-meta').textContent = line == null
      ? `${material} · ×${item.qty}${ref}`
      : `${material} · ×${item.qty}${ref} · ${bomMoney.format(line)}`;
  });
  $('bomNote').textContent = open
    ? `Priced total ${bomMoney.format(sum)}. ${open} ${open === 1 ? 'price' : 'prices'} left blank.`
    : `Priced total ${bomMoney.format(sum)}.`;
}

function storePrices() {
  const book = priceBook();
  const stored = {};
  $('bomBody').querySelectorAll('.bom-line').forEach((row) => {
    stored[row.dataset.n] = readPrice(row.querySelector('input').value);
  });
  book[currentId] = stored;
  try { localStorage.setItem(PRICE_KEY, JSON.stringify(book)); } catch { /* totals still update this session */ }
}

function buildBom() {
  const body = $('bomBody');
  const rows = sections.map((section) => {
    const lines = items.filter((item) => item.s === section.id).map((item) => {
      const price = unitPrice(item.n);
      const value = price == null ? '' : String(price);
      return `<div class="bom-line" data-n="${item.n}">
        <span class="balloon">${item.n}</span>
        <button type="button" class="bom-copy">
          <span class="bom-name">${item.name}</span>
          <span class="bom-meta"></span>
        </button>
        <label class="bom-price">₹<input type="number" min="0" step="0.01" inputmode="decimal" placeholder="price" aria-label="Unit price for ${item.name}" value="${value}"></label>
      </div>`;
    }).join('');
    return `<h3>${section.name}</h3>${lines}`;
  }).join('');
  body.innerHTML = `<div class="bom-scroll">${rows}</div><p class="bom-note" id="bomNote"></p>`;
  body.querySelectorAll('.bom-line').forEach((row) => {
    const item = items.find((entry) => entry.n === Number(row.dataset.n));
    row.querySelector('.bom-copy').addEventListener('click', () => select(selected === item ? null : item, true));
    const field = row.querySelector('input');
    field.addEventListener('input', () => { storePrices(); refreshBomTotals(); });
    field.addEventListener('click', (event) => event.stopPropagation());
  });
  refreshBomTotals();
}

// ---------- callouts ----------
const callouts = [];
function buildCallouts() {
  const svgNS = 'http://www.w3.org/2000/svg';
  for (const it of items) {
    if (it.fixed || it.s === 'fast' || it.mat === 'fastener' || isFastenerPart(it.name)) continue;
    const el = document.createElement('div');
    el.className = 'callout';
    el.innerHTML = `<span class="balloon">${it.n}</span><span class="nm">${it.name}</span>`;
    el.addEventListener('click', () => select(selected === it ? null : it, true));
    el.addEventListener('mouseenter', () => setHover(it));
    el.addEventListener('mouseleave', () => setHover(null));
    $('labels').appendChild(el);
    const line = document.createElementNS(svgNS, 'polyline');
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('r', '3.2');
    $('leaders').append(line, dot);
    callouts.push({ it, el, line, dot, w: 0, h: 0, x: 0, y: 0, pts: [] });
  }
  updateCalloutVisibility();
}

function updateCalloutVisibility() {
  for (const c of callouts) {
    const vis = showLabels && itemParts.get(c.it.n).some((p) => p.mesh.visible);
    c.visible = vis;
    c.el.style.display = vis ? '' : 'none';
    c.line.style.display = c.dot.style.display = vis ? '' : 'none';
    c.el.classList.toggle('compact', window.innerWidth < 700);
  }
  requestAnimationFrame(() => { for (const c of callouts) { const r = c.el.getBoundingClientRect(); c.w = r.width; c.h = r.height; } });
}

const _proj = new THREE.Vector3();
const _anchor = new THREE.Vector3();

function projectToScreen(v, W, H) {
  _proj.copy(v).applyMatrix4(camera.matrixWorldInverse);
  const inFront = _proj.z < 0;
  _proj.applyMatrix4(camera.projectionMatrix);
  return {
    x: (_proj.x * 0.5 + 0.5) * W,
    y: (-_proj.y * 0.5 + 0.5) * H,
    z: _proj.z,
    inFront,
  };
}

function modelScreenBounds(W, H) {
  const box = visibleBox();
  const xs = [box.min.x, box.max.x];
  const ys = [box.min.y, box.max.y];
  const zs = [box.min.z, box.max.z];
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity, any = false;
  for (const x of xs) for (const y of ys) for (const z of zs) {
    const s = projectToScreen(_v.set(x, y, z), W, H);
    if (!s.inFront) continue;
    any = true;
    minX = Math.min(minX, s.x); maxX = Math.max(maxX, s.x);
    minY = Math.min(minY, s.y); maxY = Math.max(maxY, s.y);
  }
  if (!any || maxX - minX > W * 3) return null;
  return { minX, maxX, minY, maxY };
}

function packCalloutColumn(list, top, bottom, gap) {
  if (!list.length) return;
  list.sort((a, b) => a.ay - b.ay || a.it.n - b.it.n);
  const slots = list.map((c) => ({ c, y: c.ay - c.h / 2 }));
  for (let i = 1; i < slots.length; i++) {
    const min = slots[i - 1].y + slots[i - 1].c.h + gap;
    if (slots[i].y < min) slots[i].y = min;
  }
  const last = slots[slots.length - 1];
  const overflow = last.y + last.c.h - bottom;
  if (overflow > 0) for (const slot of slots) slot.y -= overflow;
  if (slots[0].y < top) {
    const total = slots.reduce((sum, slot) => sum + slot.c.h, 0) + gap * (slots.length - 1);
    const room = bottom - top;
    if (total <= room) {
      const shift = top - slots[0].y;
      for (const slot of slots) slot.y += shift;
      const over = slots[slots.length - 1].y + slots[slots.length - 1].c.h - bottom;
      if (over > 0) for (const slot of slots) slot.y -= over;
    } else {
      let y = top;
      for (const slot of slots) { slot.y = y; y += slot.c.h + gap; }
    }
  }
  for (const slot of slots) slot.c.y = slot.y;
}

function layoutCallouts() {
  if (!showLabels) return;
  const W = canvas.clientWidth, H = canvas.clientHeight;
  const wide = W > 820;
  const leftBound = wide ? Math.max(12, insets.left + 10) : 10;
  const rightInset = wide && !$('detail').hidden ? 356 : 14;
  const rightBound = W - rightInset;
  const topBound = wide ? 112 : 62;
  const botBound = H - Math.max(insets.bottom + 10, 78);
  const model = modelScreenBounds(W, H);
  const live = [];

  for (const c of callouts) {
    const hide = () => {
      c.el.style.visibility = 'hidden';
      c.line.style.visibility = 'hidden';
      c.dot.style.visibility = 'hidden';
    };
    if (!c.visible) { hide(); continue; }
    const group = itemParts.get(c.it.n) || [];
    c.pts = [];
    _anchor.set(0, 0, 0);
    for (const p of group) {
      if (!p.mesh.visible) continue;
      if (p.anchor) {
        p.worldCenter.copy(p.anchor);
        if (p.offset && spread > 0) {
          const s = STANDS.find((entry) => entry.id === currentId);
          const scale = s && s.unitScale && s.unitScale !== 1 ? s.unitScale : 1;
          p.worldCenter.addScaledVector(p.offset, spread * scale);
        }
      } else {
        p.worldCenter.copy(p.localCenter).applyMatrix4(p.mesh.matrixWorld);
      }
      _anchor.add(p.worldCenter);
      c.pts.push(p);
    }
    if (!c.pts.length) { hide(); continue; }
    _anchor.multiplyScalar(1 / c.pts.length);
    const mid = projectToScreen(_anchor, W, H);
    if (!mid.inFront) { hide(); continue; }
    c.cx = mid.x;
    c.cy = mid.y;
    c.w = c.el.offsetWidth || c.w || 28;
    c.h = c.el.offsetHeight || c.h || 28;
    c.el.style.visibility = '';
    c.line.style.visibility = '';
    c.dot.style.visibility = '';
    live.push(c);
  }

  const midX = model ? (model.minX + model.maxX) / 2 : W / 2;
  const left = [];
  const right = [];
  for (const c of live) {
    const nearCenter = Math.abs(c.cx - midX) < Math.max(36, (model ? (model.maxX - model.minX) : W) * 0.08);
    const side = nearCenter ? (c.it.n % 2 ? -1 : 1) : (c.cx < midX ? -1 : 1);
    c.side = side;
    let best = null;
    let bestX = side < 0 ? Infinity : -Infinity;
    for (const p of c.pts) {
      const s = projectToScreen(p.worldCenter, W, H);
      if (!s.inFront) continue;
      const better = side < 0 ? s.x < bestX : s.x > bestX;
      if (better) { bestX = s.x; best = s; }
    }
    if (!best) best = { x: c.cx, y: c.cy };
    c.ax = best.x;
    c.ay = best.y;
    (side < 0 ? left : right).push(c);
  }

  const gap = 6;
  packCalloutColumn(left, topBound, botBound, gap);
  packCalloutColumn(right, topBound, botBound, gap);

  for (const c of live) {
    if (c.side < 0) {
      const outside = model ? model.minX - 18 - c.w : c.ax - 36 - c.w;
      const beside = c.ax - 20 - c.w;
      let x = Math.min(outside, beside);
      x = Math.max(leftBound, Math.min(x, c.ax - 12 - c.w));
      c.x = Math.max(8, Math.min(x, W - c.w - 8));
    } else {
      const outside = model ? model.maxX + 18 : c.ax + 36;
      const beside = c.ax + 20;
      let x = Math.max(outside, beside);
      x = Math.min(rightBound - c.w, Math.max(x, c.ax + 12));
      c.x = Math.max(8, Math.min(x, W - c.w - 8));
    }
    c.y = THREE.MathUtils.clamp(c.y, topBound, Math.max(topBound, botBound - c.h));
    c.el.style.transform = `translate(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px)`;
    const ex = c.side < 0 ? c.x + c.w : c.x;
    const ey = c.y + c.h / 2;
    const elbow = c.side < 0
      ? Math.max(ex + 10, Math.min(ex + 28, c.ax - 4))
      : Math.min(ex - 10, Math.max(ex - 28, c.ax + 4));
    c.line.setAttribute('points', `${ex.toFixed(1)},${ey.toFixed(1)} ${elbow.toFixed(1)},${ey.toFixed(1)} ${c.ax.toFixed(1)},${c.ay.toFixed(1)}`);
    c.dot.setAttribute('cx', c.ax.toFixed(1));
    c.dot.setAttribute('cy', c.ay.toFixed(1));
  }
}

// ---------- selection / highlight ----------
const ORANGE = new THREE.Color(0xe8630a);
function refreshLook() {
  const isExploded = spread > 0.001;
  for (const p of parts) {
    const isSel = selected && p.item === selected;
    const isHov = hovered && p.item === hovered;
    p.mat.emissive.copy(ORANGE);
    p.mat.emissiveIntensity = isSel ? 0.55 : isHov ? 0.28 : 0;
    const ghost = selected && !isSel && !isolate;
    p.mat.transparent = !!ghost;
    p.mat.opacity = ghost ? 0.22 : 1;
    p.mat.depthWrite = !ghost;
    p.mesh.castShadow = !ghost;
    if (p.isFastener && isExploded) {
      p.mesh.visible = false;
    } else {
      p.mesh.visible = !(isolate && selected && !isSel);
    }
    if (showEdges) ensureEdges(p).visible = !ghost && p.mesh.visible;
    else if (p.edges) p.edges.visible = false;
    p.mat.needsUpdate = true;
  }
  document.body.classList.toggle('has-sel', !!selected);
  document.querySelectorAll('.part, .bom-line').forEach((b) => b.classList.toggle('on', selected && +b.dataset.n === selected.n));
  for (const c of callouts) {
    const on = selected === c.it || hovered === c.it;
    c.el.classList.toggle('on', on);
    c.line.classList.toggle('on', on); c.dot.classList.toggle('on', on);
  }
  updateCalloutVisibility();
}

function select(it, fromList = false) {
  selected = it;
  if (!it) { isolate = false; $('dIsolate').setAttribute('aria-pressed', 'false'); }
  const d = $('detail');
  if (it) {
    d.hidden = false;
    $('dNum').textContent = it.n;
    $('dName').textContent = it.name;
    $('dMeta').textContent = `${sections.find((s) => s.id === it.s).name}. Quantity ${it.qty}.`;
    $('dDesc').textContent = it.desc;
    if (fromList && window.innerWidth <= 820) {
      $('parts').classList.add('collapsed'); $('partsToggle').setAttribute('aria-expanded', 'false');
    }
  } else d.hidden = true;
  refreshLook();
}

function setHover(it) {
  if (hovered === it) return;
  hovered = it; refreshLook();
}

function focusItem(it) {
  const list = itemParts.get(it.n) || [];
  if (!list.length) return;
  const box = new THREE.Box3();
  for (const p of list) box.union(partWorldBox(p, _bb));
  const size = box.getSize(new THREE.Vector3()).length();
  if (size < 80) box.expandByScalar((80 - size) / 2);
  fitTo(box, null, true, 1.6);
}

// ---------- picking ----------
const ray = new THREE.Raycaster();
const ndc = new THREE.Vector2();
function pick(ev) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(parts.filter((p) => p.mesh.visible).map((p) => p.mesh), false);
  return hits.length ? hits[0].object.userData.part.item : null;
}

let down = null;
canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; $('hint').classList.add('gone'); });
canvas.addEventListener('pointerup', (e) => {
  if (!down) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
  down = null;
  if (moved > 5) return;
  const it = pick(e);
  select(it && it !== selected ? it : null);
});
let hoverQueued = null;
canvas.addEventListener('pointermove', (e) => {
  if (e.pointerType !== 'mouse' || e.buttons) { $('tip').hidden = true; return; }
  hoverQueued = e;
});
canvas.addEventListener('pointerleave', () => { hoverQueued = null; $('tip').hidden = true; setHover(null); });
function processHover() {
  if (!hoverQueued) return;
  const e = hoverQueued; hoverQueued = null;
  const it = pick(e);
  setHover(it);
  const tip = $('tip');
  if (it) {
    tip.textContent = `${it.n}  ${it.name}`;
    tip.hidden = false;
    const r = canvas.getBoundingClientRect();
    tip.style.left = `${e.clientX - r.left + 14}px`;
    tip.style.top = `${e.clientY - r.top + 14}px`;
    canvas.style.cursor = 'pointer';
  } else { tip.hidden = true; canvas.style.cursor = ''; }
}

// ---------- UI wiring ----------
function setExploded(on) {
  spreadTarget = on ? 1 : 0;
  $('bExploded').setAttribute('aria-pressed', String(on));
  $('bAssembled').setAttribute('aria-pressed', String(!on));
  if (on && !showLabels) toggleLabels(true);
  pendingRefit = true;
}
let pendingRefit = false;
$('bAssembled').addEventListener('click', () => setExploded(false));
$('bExploded').addEventListener('click', () => setExploded(true));
$('spread').addEventListener('input', (e) => {
  spreadTarget = spread = e.target.value / 100;
  applySpread(spread);
  const on = spread > 0.02;
  $('bExploded').setAttribute('aria-pressed', String(on));
  $('bAssembled').setAttribute('aria-pressed', String(!on));
});
$('spread').addEventListener('change', () => fitTo(visibleBox(), null));
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
$('bFit').addEventListener('click', () => fitTo(visibleBox(), null));
$('dClose').addEventListener('click', () => select(null));
$('dFocus').addEventListener('click', () => selected && focusItem(selected));
$('dIsolate').addEventListener('click', () => {
  isolate = !isolate; $('dIsolate').setAttribute('aria-pressed', String(isolate)); refreshLook();
});
function closeShotMenu() {
  $('shotPop').hidden = true;
  $('bShot').setAttribute('aria-expanded', 'false');
}
function quotePageUrl() {
  return new URL('quote.html', location.href).href;
}
function showQuote() {
  const qr = qrcode(0, 'M');
  qr.addData(quotePageUrl());
  qr.make();
  $('qr').innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true, alt: 'QR code for the quote form' });
  $('quoteOpen').href = quotePageUrl();
  $('quoteDlg').showModal();
}
$('bQuote').addEventListener('click', (e) => { e.stopPropagation(); closeShotMenu(); showQuote(); });
$('quoteClose').addEventListener('click', () => $('quoteDlg').close());
$('quoteDlg').addEventListener('click', (e) => { if (e.target === $('quoteDlg')) $('quoteDlg').close(); });

$('bShot').addEventListener('click', (e) => {
  e.stopPropagation();
  saveCurrentImage();
});
if ($('shotPop')) {
  $('shotPop').addEventListener('click', (e) => {
    e.stopPropagation();
    closeShotMenu();
    saveCurrentImage();
  });
}
document.addEventListener('click', closeShotMenu);

// Capture the exact visible 3D model view with current camera, angle, zoom, rotation,
// exploded/assembled state, and current model selection.
function saveCurrentImage() {
  try {
    // 1. Force a synchronous render so the canvas has the exact current frame
    renderer.render(scene, camera);

    // 2. Identify the active model and state for the exported file name
    const stand = STANDS.find((s) => s.id === currentId) || { id: currentId, title: 'DynoX-Model' };
    const safeTitle = (stand.title || 'Model').replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
    const stateStr = spread > 0.05 ? 'exploded' : 'assembled';
    const filename = `${safeTitle}-${stateStr}.png`;

    const srcCanvas = renderer.domElement;
    const W = srcCanvas.width;
    const H = srcCanvas.height;

    // 3. Composite the WebGL scene with the viewer vignette overlay so the exported
    // image matches the exact visible composition
    const outCanvas = document.createElement('canvas');
    outCanvas.width = W;
    outCanvas.height = H;
    const ctx = outCanvas.getContext('2d');

    if (ctx) {
      ctx.drawImage(srcCanvas, 0, 0);

      // Vignette radial gradient matching #vignette CSS
      const radial = ctx.createRadialGradient(W * 0.58, H * 0.46, Math.min(W, H) * 0.23, W * 0.58, H * 0.46, Math.max(W, H) * 0.7);
      radial.addColorStop(0, 'rgba(0, 0, 0, 0)');
      radial.addColorStop(0.46, 'rgba(0, 0, 0, 0)');
      radial.addColorStop(1, 'rgba(20, 32, 44, 0.08)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, W, H);

      // Top/bottom linear gradient matching #vignette CSS
      const linear = ctx.createLinearGradient(0, 0, 0, H);
      linear.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
      linear.addColorStop(0.18, 'rgba(255, 255, 255, 0)');
      linear.addColorStop(0.72, 'rgba(255, 255, 255, 0)');
      linear.addColorStop(1, 'rgba(24, 34, 45, 0.06)');
      ctx.fillStyle = linear;
      ctx.fillRect(0, 0, W, H);

      exportCanvas(outCanvas, filename);
    } else {
      exportCanvas(srcCanvas, filename);
    }
  } catch (err) {
    console.error('Save Image error:', err);
    try {
      exportCanvas(renderer.domElement, 'model-view.png');
    } catch (fallbackErr) {
      console.error('Fallback export error:', fallbackErr);
    }
  }
}

function exportCanvas(targetCanvas, filename) {
  if (targetCanvas.toBlob) {
    targetCanvas.toBlob((blob) => {
      if (blob) {
        triggerDownload(URL.createObjectURL(blob), filename, true);
      } else {
        triggerDownload(targetCanvas.toDataURL('image/png'), filename, false);
      }
    }, 'image/png');
  } else {
    triggerDownload(targetCanvas.toDataURL('image/png'), filename, false);
  }
}

function triggerDownload(url, filename, revoke) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  if (revoke) {
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
}

function downloadShot(exploded) {
  saveCurrentImage();
}

window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'Escape') {
    if (!$('shotPop').hidden) { closeShotMenu(); return; }
    select(null);
    return;
  }
  if (e.key === 'e' || e.key === 'E') setExploded(spreadTarget < 0.5);
  if (e.key === 'f' || e.key === 'F') fitTo(visibleBox(), null);
  if (e.key === 'l' || e.key === 'L') toggleLabels();
});

// ---------- resize / loop ----------
function syncModelLabels() {
  const narrow = window.innerWidth <= 820;
  document.querySelectorAll('#modelPick option').forEach((opt) => {
    const full = opt.dataset.full || opt.textContent;
    if (!opt.dataset.full) opt.dataset.full = full;
    const next = narrow && opt.dataset.short ? opt.dataset.short : opt.dataset.full;
    if (opt.textContent !== next) opt.textContent = next;
  });
}

function resize() {
  syncModelLabels();
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  applyDashSize(dashFrac);
  const wide = w > 820;
  const panel = $('parts');
  const panelOpen = wide && panel && !panel.classList.contains('collapsed');
  const left = panelOpen ? Math.ceil(panel.getBoundingClientRect().right) + 16 : 0;
  const bottom = wide ? 80 : 110;
  insets.left = left; insets.bottom = bottom; insets.w = w; insets.h = h;
  camera.setViewOffset(w, h, -left / 2, bottom / 2, w, h);
  camera.updateProjectionMatrix();
  $('leaders').setAttribute('viewBox', `0 0 ${w} ${h}`);
  updateCalloutVisibility();
}
window.addEventListener('resize', resize);
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (edgeMat) edgeMat.color.set(edgeColor());
});

let userActive = false;
let idleFor = 0;
controls.addEventListener('start', () => { userActive = true; idleFor = 0; controls.autoRotate = false; });
controls.addEventListener('end', () => { userActive = false; idleFor = 0; });

const clock = new THREE.Clock();
function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!reduceMotion && !userActive && !camTween) idleFor += dt;
  else idleFor = 0;
  controls.autoRotate = !reduceMotion && !userActive && !camTween && idleFor > 1.6;
  if (Math.abs(spread - spreadTarget) > 0.0005) {
    spread = reduceMotion ? spreadTarget : THREE.MathUtils.damp(spread, spreadTarget, 4.5, dt);
    if (Math.abs(spread - spreadTarget) < 0.002) spread = spreadTarget;
    applySpread(spread);
    $('spread').value = Math.round(spread * 100);
    if (pendingRefit && spread === spreadTarget) { pendingRefit = false; fitTo(visibleBox(), null); }
  }
  if (camTween) {
    camTween.k = Math.min(1, camTween.k + dt / 0.7);
    const e = 1 - Math.pow(1 - camTween.k, 3);
    camera.position.lerpVectors(camTween.p0, camTween.p1, e);
    controls.target.lerpVectors(camTween.t0, camTween.t1, e);
    if (camTween.k >= 1) camTween = null;
  }
  controls.update();
  processHover();
  renderer.render(scene, camera);
  layoutCallouts();
  requestAnimationFrame(tick);
}

async function loadSharedDesign(id) {
  $('loadText').textContent = 'Loading shared design';
  $('loading').classList.remove('done');
  const design = await fetchDesign(id);
  const stand = {
    id: `shared-${design.id}`,
    designId: design.id,
    title: design.title || 'Shared design',
    tagline: 'Shared design · anyone with the link can view',
    url: publicFileUrl(design.file_path),
    mode: 'named',
    edgeColor: '#f4f7fb',
    explodeDistance: 120,
    autoUnits: true,
  };
  history.replaceState(null, '', shareUrl(design.id));
  await loadStand(stand.id, stand);
}

function wireUploadUi() {
  const dlg = $('uploadDlg');
  if (!dlg) return;

  const bUpload = $('bUpload');
  if (bUpload) {
    bUpload.addEventListener('click', (e) => {
      e.stopPropagation();
      closeShotMenu();
      $('uploadStatus').textContent = '';
      $('uploadShare').hidden = true;
      $('uploadLink').value = '';
      $('uploadName').value = '';
      $('uploadFile').value = '';
      dlg.showModal();
    });
  }
  $('uploadClose').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  $('uploadFile').addEventListener('change', () => {
    const file = $('uploadFile').files && $('uploadFile').files[0];
    if (file && !$('uploadName').value.trim()) {
      $('uploadName').value = file.name.replace(/\.glb$/i, '');
    }
  });

  $('uploadGo').addEventListener('click', async () => {
    const file = $('uploadFile').files && $('uploadFile').files[0];
    const title = $('uploadName').value.trim();
    const status = $('uploadStatus');
    const go = $('uploadGo');
    go.disabled = true;
    status.textContent = 'Starting upload…';
    try {
      const design = await uploadDesign(file, title, (frac, label) => {
        status.textContent = `${label}… ${Math.round(frac * 100)}%`;
      });
      const link = shareUrl(design.id);
      $('uploadShare').hidden = false;
      $('uploadLink').value = link;
      status.textContent = 'Uploaded. Opening viewer…';
      dlg.close();
      await loadSharedDesign(design.id);
    } catch (err) {
      console.error(err);
      status.textContent = err.message || 'Upload failed';
    } finally {
      go.disabled = false;
    }
  });

  $('uploadCopy').addEventListener('click', async () => {
    const link = $('uploadLink').value;
    try {
      await navigator.clipboard.writeText(link);
      $('uploadStatus').textContent = 'Link copied';
    } catch {
      $('uploadLink').select();
      $('uploadStatus').textContent = 'Select the link and copy it';
    }
  });

  $('sharedSave').addEventListener('click', async () => {
    if (!sharedDesign) return;
    const note = $('sharedNote');
    note.textContent = 'Saving…';
    try {
      const updated = await renameDesign(sharedDesign.id, $('sharedTitle').value);
      sharedDesign = updated;
      $('plateTitle').textContent = updated.title;
      document.title = `${updated.title} | 3D viewer`;
      note.textContent = 'Name saved';
    } catch (err) {
      console.error(err);
      note.textContent = err.message || 'Could not save name';
    }
  });

  $('sharedCopy').addEventListener('click', async () => {
    if (!sharedDesign) return;
    const link = shareUrl(sharedDesign.id);
    try {
      await navigator.clipboard.writeText(link);
      $('sharedNote').textContent = 'Link copied';
    } catch {
      $('sharedNote').textContent = link;
    }
  });
}

wireUploadUi();

$('modelPick')?.addEventListener('change', () => {
  const url = new URL(location.href);
  url.searchParams.delete('m');
  url.searchParams.set('stand', $('modelPick').value);
  history.replaceState(null, '', url.pathname + (url.search || '') + url.hash);
  loadStand($('modelPick').value);
});

const params = new URLSearchParams(location.search);
const bootStand = params.get('stand') || location.hash.replace('#', '') || 'compact5';
const bootSharedId = params.get('m');
requestAnimationFrame(tick);
(bootSharedId
  ? loadSharedDesign(bootSharedId).catch((err) => {
    console.error(err);
    $('loadText').textContent = `${err.message}. Loading catalog stand instead.`;
    return loadStand(bootStand);
  })
  : loadStand(bootStand)
);

window.__rts = {
  loadStand, setExploded, setView, select, get items() { return items; }, toggleLabels, focusItem, downloadShot,
  get spread() { return spread; },
  get partsCount() { return parts.length; },
  get fixedOffsetMax() {
    let m = 0;
    for (const p of parts) if (p.item && p.item.fixed) m = Math.max(m, p.offset.length());
    return m;
  },
  get movingOffsetMax() {
    let m = 0;
    for (const p of parts) if (!p.item || !p.item.fixed) m = Math.max(m, p.offset.length());
    return m;
  },
  visibleBox, get camera() { return camera; }, get controls() { return controls; },
};
