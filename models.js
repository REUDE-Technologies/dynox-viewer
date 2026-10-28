// Stands shown in the viewer dropdown.
import { COMPACT5_ITEMS, COMPACT5_SECTIONS, PRO20_ITEMS, PRO20_SECTIONS } from './catalog.js';

export const NAMED_SECTIONS = [
  { id: 'frame', name: 'Frame and base' },
  { id: 'head', name: 'Force-sensing head' },
  { id: 'prop', name: 'Motor and propeller' },
  { id: 'sense', name: 'Sensors and electronics' },
  { id: 'fast', name: 'Fasteners' },
];

export const PRO20_STAND_ITEMS = [
  {
    n: 1, s: 'prop', name: 'Carbon fiber propeller blade (CW)', qty: 1, mat: 'carbon',
    desc: 'Lightweight high-aspect carbon fiber propeller blade generating dynamic axial thrust.',
    anchor: [0, 1480, 180],
    parts: [[1, [0, 0, 320]]],
  },
  {
    n: 2, s: 'prop', name: 'Carbon fiber propeller blade (CCW)', qty: 1, mat: 'carbon',
    desc: 'Matched counter-rotating counter-balanced carbon fiber propeller blade.',
    anchor: [0, 1000, 180],
    parts: [[8, [0, 0, 320]]],
  },
  {
    n: 3, s: 'prop', name: 'Propeller hub locking adapter', qty: 1, mat: 'alu',
    desc: 'Precision balanced front lock-nut adapter holding the propeller firmly on the motor shaft.',
    anchor: [0, 1240, 210],
    parts: [[14, [0, 0, 270]]],
  },
  {
    n: 4, s: 'prop', name: 'Propeller balance hub & shoulder clamp', qty: 1, mat: 'alu',
    desc: 'Precision CNC-machined balanced propeller adapter with dual shoulder clamp.',
    anchor: [0, 1240, 175],
    parts: [[13, [0, 0, 230]]],
  },
  {
    n: 5, s: 'prop', name: 'High-torque brushless test motor', qty: 1, mat: 'motor',
    desc: 'High-efficiency industrial brushless DC motor tested up to 25,000 RPM.',
    anchor: [0, 1240, 110],
    parts: [[10, [0, 0, 180]]],
  },
  {
    n: 6, s: 'head', name: 'Precision motor mount adapter plate', qty: 1, mat: 'alu',
    desc: 'Slotted aircraft-grade aluminium motor adapter plate with multi-pattern bolt holes.',
    anchor: [0, 1240, 60],
    parts: [[12, [0, 0, 110]]],
  },
  {
    n: 7, s: 'head', name: 'Thrust load-cell carriage cradle', qty: 1, mat: 'sheet',
    desc: 'Rigid folded structural steel cradle transferring thrust loads directly into the load cells.',
    anchor: [0, 1180, 0],
    parts: [[4, [0, 0, -220]]],
  },
  {
    n: 8, s: 'head', name: 'Dual S-beam load cells (20 kgf)', qty: 2, mat: 'cell',
    desc: 'Calibrated S-beam load cells measuring 0 to 20 kgf thrust and 0 to 20 N·m torque.',
    anchor: [-50, 1140, 0],
    parts: [[11, [-60, 0, -200]]],
  },
  {
    n: 9, s: 'head', name: 'Torque load-cell reaction arms', qty: 1, mat: 'sheet',
    desc: 'Calibrated torque reaction moment arm linkage with zero-backlash rod ends.',
    anchor: [60, 1140, 0],
    parts: [[5, [60, 0, -200]]],
  },
  {
    n: 10, s: 'sense', name: 'Optical RPM & vibration telemetry sensor', qty: 1, mat: 'printed',
    desc: 'High-speed optical infrared pulse sensor with tri-axial vibration accelerometer.',
    anchor: [-80, 980, 40],
    parts: [[15, [-80, 0, -160]]],
  },
  {
    n: 11, s: 'frame', name: 'Mast cross brace & corner gusset', qty: 1, mat: 'sheet',
    desc: 'Horizontal structural brace tying the twin gantry uprights together.',
    anchor: [0, 820, -40],
    parts: [[3, [0, 0, -100]]],
  },
  {
    n: 12, s: 'frame', name: 'Structural gantry upright 4040', qty: 1, mat: 'alu',
    desc: 'Dual heavy-duty 40×40 structural aluminium gantry upright columns lifting the sensing head.',
    anchor: [0, 650, 0],
    parts: [[0, [0, 0, 0]]],
  },
  {
    n: 13, s: 'frame', name: 'Diagonal reinforcement truss', qty: 2, mat: 'printed',
    desc: 'Heavy 45° inclined support struts triangulating the vertical gantry to the base bed.',
    anchor: [0, 320, -180],
    parts: [[2, [0, 0, -200]]],
  },
  {
    n: 14, s: 'frame', name: 'Frame 45° angle gusset ties', qty: 1, mat: 'sheet',
    desc: 'Corner gusset brackets securing the mast base to the longitudinal bed extrusions.',
    anchor: [0, 120, -60],
    parts: [[6, [0, 0, 0]]],
  },
  {
    n: 15, s: 'frame', name: 'Transverse base cross members', qty: 1, mat: 'alu',
    desc: 'Cross profile extrusions locking the dual longitudinal base bed rails in parallel.',
    anchor: [0, 25, 250],
    parts: [[7, [0, 0, 0]]],
  },
  {
    n: 16, s: 'frame', name: 'Heavy base bed extrusions (1100 mm)', qty: 1, mat: 'alu',
    desc: 'Dual 1100 mm aluminium extrusions resting on the test bench providing high torsional stability.',
    anchor: [-180, 25, -200],
    parts: [[16, [0, 0, 0]]],
  },
  {
    n: 17, s: 'frame', name: 'Base rail bench anchor clamps', qty: 2, mat: 'sheet',
    desc: 'Heavy-duty steel floor clamps anchoring the bed firmly to the concrete floor or workbench.',
    anchor: [220, 15, -420],
    parts: [[9, [180, 0, 0]]],
  },
];

export const STANDS = [
  {
    id: 'compact5',
    title: 'RTS Compact 5',
    tagline: '5 kgf thrust and torque stand',
    url: 'model/5kg.glb',
    mode: 'named',
    pinElectronics: true,
    unitScale: 1000,
    explodeDistance: 120,
    manual: 'manuals/compact5.pdf',
  },
  {
    id: 'pro20',
    title: 'RTS Pro 20',
    tagline: '20 kgf thrust and torque stand',
    url: 'model/20kg.glb',
    mode: 'named',
    edgeColor: '#f4f7fb',
    pinElectronics: true,
    unitScale: 1000,
    explodeDistance: 140,
    manual: 'manuals/pro20.pdf',
  },
  {
    id: 'ultra50',
    title: 'RTS Ultra 50',
    tagline: '50 kgf thrust and torque stand',
    url: 'model/50kg.glb',
    mode: 'named',
    edgeColor: '#f4f7fb',
    pinElectronics: true,
    unitScale: 1000,
    explodeDistance: 140,
    manual: 'manuals/ultra50.pdf',
  },
];

const NODE_MAP_20KG = {
  node1: 'Structural gantry upright 4040',
  node2: 'Carbon fiber propeller blades',
  node3: 'Diagonal reinforcement truss',
  node4: 'Mast cross brace & corner gusset',
  node5: 'Thrust load-cell carriage cradle',
  node6: 'Torque load-cell reaction arms',
  node7: 'Frame 45° angle gusset ties',
  node8: 'Transverse base cross members',
  node9: 'Carbon fiber propeller blades',
  node10: 'Base rail bench anchor clamps',
  node11: 'High-torque brushless test motor',
  node12: 'Dual S-beam load cells (20 kgf)',
  node13: 'Precision motor mount adapter plate',
  node14: 'Propeller balance hub & shoulder clamp',
  node15: 'Propeller hub locking adapter',
  node16: 'Optical RPM & vibration telemetry sensor',
  node17: 'Heavy base bed extrusions (1100 mm)',
};

export function isFastenerPart(name) {
  const n = String(name || '').replace(/[_]+/g, ' ').toLowerCase();
  return /screw|bolt|nut|washer|spacer|sbhcs|shcs|fastener|m\d+\s*x|threaded|stud\b|rivet|b18\b|b18\.|tee nut|countersunk/i.test(n);
}

export function cleanPartName(name) {
  const n = String(name || '').replace(/[_]+/g, ' ').trim();
  const key20 = n.toLowerCase();
  if (NODE_MAP_20KG[key20]) return NODE_MAP_20KG[key20];

  // 1. Fastener checks first
  if (/socket button head cap screw|sbhcs/i.test(n)) return 'Socket button head cap screw';
  if (/socket head cap screw|shcs/i.test(n)) return 'Socket head cap screw';
  if (/countersunk.*screw/i.test(n)) return 'Countersunk screw';
  if (/spacer/i.test(n)) return 'Hardware spacer';
  if (/tee nut/i.test(n)) return 'Series 8 PLA tee nut';
  if (/hex nut/i.test(n)) return 'Hex nut';
  if (/washer/i.test(n)) return 'Fastener washer';
  if (/screw|bolt|rivet/i.test(n)) return 'Machine fastener';

  // Propeller blades: both CW and CCW blades grouped together as single item across models
  if (/body\s*-\s*part\s*(405|406)\b/i.test(n) || /CW Blade/i.test(n) || /propeller blade/i.test(n)) {
    return 'Carbon fiber propeller blades';
  }

  // 2. Specific known CAD bodies in 20kg model
  if (/body\s*-\s*part\s*404\b/i.test(n)) return 'High-torque brushless test motor';
  if (/body\s*432\b/i.test(n)) return 'Motor shaft clamp collar';
  if (/body\s*434\b/i.test(n)) return 'Propeller hub locking adapter';
  if (/20kg\s*motor[\s_]*mount/i.test(n)) return 'Precision motor mount adapter plate';
  if (/motor mount enclosure front 3d print\b/i.test(n)) return 'Top box housing (front upper)';
  if (/motor mount enclosure front below 3d print\b/i.test(n)) return 'Top box housing (front lower)';
  if (/motor mount enclosure bottom laser/i.test(n)) return 'Top box base chassis plate';
  if (/load cell support sheet metal/i.test(n)) return 'Thrust load-cell carriage cradle';
  if (/50kg load cell/i.test(n)) return 'Dual S-beam load cells (20 kgf)';
  if (/Load cell enclosure bottom/i.test(n)) return 'Load cell enclosure cover';
  if (/Load cell enclosure 2/i.test(n)) return 'Load cell side enclosure';
  if (/load cell base 3d print/i.test(n)) return 'Load cell base mount';
  if (/rpm sensor/i.test(n)) return 'Optical RPM & telemetry sensor';
  if (/vibration sensor|Bottom sensor holder/i.test(n) || /body\s*-\s*part\s*17\b/i.test(n)) return 'Vibration telemetry sensor';
  if (/adxl/i.test(n)) return 'Vibration telemetry sensor';
  if (/body\s*-\s*part\s*[1-5]\b/i.test(n)) return 'Optical tachometer encoder disc';
  if (/POLYAMIDE HANDLE/i.test(n)) return 'Frame transport handles';
  if (/inclined version 50kg/i.test(n)) return 'Diagonal reinforcement truss';
  if (/45deg bracket/i.test(n)) return 'Frame 45° angle gusset ties';
  if (/U clamp|40 clamp/i.test(n)) return 'Base rail bench anchor clamps';
  if (/copy\s*\(4\)\s*of\s*\^imagea\(2\)/i.test(n)) return 'Heavy base bed extrusions (1100 mm)';
  if (/copy\s*\(5\)\s*of\s*\^imagea\(2\)/i.test(n)) return 'Structural gantry upright 4040';
  if (/^imagea/i.test(n) || /imagea\(2\)/i.test(n)) return 'Structural aluminium profile';
  if (/thrust bed 3/i.test(n)) return 'Transverse base cross members';
  if (/thrust bed/i.test(n)) return 'Gantry cross brace & corner gusset';
  if (/vertical support 2/i.test(n)) return 'Vertical gantry support column';
  if (/vertical support part/i.test(n)) return 'Vertical support bracket';
  if (/triangle support 2/i.test(n)) return 'Triangle gusset support';
  if (/clamp\s*1/i.test(n) || /clamp\s*2/i.test(n) || /^clamp/i.test(n)) return 'Sensor and cable clamp';

  // 3. Compact 5 specific
  if (/Motor\s*-\s*MN4110/i.test(n)) return 'Brushless motor MN4110';
  if (/torque cell holder/i.test(n)) return 'Torque cell holder';
  if (/Load cell/i.test(n)) return 'Precision load cell';
  if (/MF1302 Top Bracket/i.test(n)) return 'Top mounting bracket MF1302';
  if (/MF1302 Bottom Bracket/i.test(n)) return 'Bottom mounting bracket MF1302';
  if (/mount-1/i.test(n)) return 'Motor mounting plate';
  if (/rpm holder/i.test(n)) return 'RPM sensor bracket';
  if (/current sensor/i.test(n)) return 'Current sensor assembly';
  if (/5kg[\s_]*thrust[\s_]*stand\s*standalone/i.test(n)) return 'Corner gusset bracket 4040';
  if (/l\s*shape/i.test(n)) return 'L-bracket corner brace 4040';
  if (/^sheet/i.test(n)) return 'Structural load cell bracket plate';

  // 4. Ultra 50 specific
  if (/Motor mount 5x160mm/i.test(n)) return 'Motor mount 5x160mm Stainless steel';
  if (/Mount mount support 5x160mm/i.test(n)) return 'Mount support 5x160mm Stainless Steel';
  if (/Torque load cell Holder/i.test(n)) return 'Torque load cell holder';
  if (/100kg load cell/i.test(n)) return '100kg S-beam load cell';
  if (/gooseneck holder/i.test(n)) return 'Sensor gooseneck holder';
  if (/Aluminium Extrusion 40mmx120mm/i.test(n)) return 'Aluminium Extrusion 40x120mm';
  if (/Bracket 40x40/i.test(n)) return 'Corner bracket 40x40';
  if (/Profile-4040/i.test(n)) return 'Structural profile 4040';

  // DAQ enclosure parts (top lid + bottom base housing)
  if (/daq top 3 3d|DAQ 3D PRINT|DAQ TOP/i.test(n)) return 'DAQ enclosure module';

  // Fallback CAD name cleaning
  let raw = n.replace(/[_]+/g, ' ').replace(/\s*-\s*Part(\s*\d+)?$/i, '').trim();
  const pieces = raw.split('^').map((part) => part.trim()).filter(Boolean);
  let chosen = '';
  for (const piece of pieces) {
    let stripped = piece
      .replace(/^(copy\s*(\(\d+\))?\s*of\s*)+/gi, '')
      .replace(/\.step$/i, '')
      .replace(/-\d+$/i, '')
      .trim();
    if (/open cascade|^body\b|^pin[_-]?\d+|^solid\b|^part[_-]?\d+|^mesh\s*\d+/i.test(stripped)) continue;
    if (stripped && stripped !== 'NONE' && !/^imported\d*(?:\s+\d+)*$/i.test(stripped)) {
      chosen = stripped;
      break;
    }
  }
  chosen = chosen.replace(/\s+/g, ' ').replace(/-\d+$/i, '').trim();
  if (!chosen || /dynox/i.test(chosen) || /^surface[-\s]?imported/i.test(chosen) || /^imported\d*/i.test(chosen)) return '';
  return chosen.slice(0, 72);
}

/** DAQ boxes, PCB footprints, and discrete electronics (visible, but not exploded). */
export function isElectronicsPart(name) {
  const n = String(name || '').toLowerCase().replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!n) return false;
  if (/motor mount enclosure|load cell enclosure|load cell base|load cell/i.test(n)) return false;
  if (/propeller|blade|motor\b|mount plate|housing/i.test(n)) return false;
  const compact = n.replace(/\s+/g, '');
  if (/adxl/i.test(n)) return false; // ADXL is telemetry accelerometer sensor
  if (/daq|pcb|printed circuit|circuit board/.test(n)) return true;
  if (/enclosure assem|daq enclosure/.test(n)) return true;
  if (/hx711|xt60|tlv|crystal|sma\b|srr\b/.test(n)) return true;
  if (/open cascade|\.step\^/.test(n)) return true;
  if (/^[crdulq]\d+(\.step)?$/.test(compact)) return true;
  if (/^array\d*/i.test(compact)) return true;
  if (/\bsot\b|\bsoic\b|\blqfp\b|\bsod\b|\bqfn\b|\btssop\b/.test(n)) return true;
  if (/pinheader|pinsocket|barreljack|0402|0603|0805|1206|1005metric/.test(compact)) return true;
  if (/2\.54mm|254mm|p0\.5mm|p05mm|p1\.27mm|p127mm/.test(compact)) return true;
  if (/buzzer|^body$|^layer\s*\d+$/.test(n)) return true;
  if (/0603|0805|1206|smd\b|resistor|capacitor|diode|inductor/.test(n)) return true;
  if (/\bled\b|header pin|pin header|jst\b|molex|barrel jack/.test(n)) return true;
  if (/3d print/.test(n) && /daq|pcb|board/.test(n)) return true;
  if (/connector|terminal block|fuse\b|relay\b|mosfet|transistor/.test(n) && !/motor|prop|cell|bracket|mount|current sensor/.test(n)) return true;
  return false;
}

export function guessMaterial(name) {
  const n = name.toLowerCase();
  if (/screw|nut|bolt|washer|sbhcs|shcs|spacer|fastener/.test(n)) return 'fastener';
  if (/propeller|prop |carbon|blade/.test(n)) return 'carbon';
  if (/motor/.test(n) && !/mount|enclosure|holder/.test(n)) return 'motor';
  if (/load cell|torque cell/.test(n)) return 'cell';
  if (/pcb|daq|sot-|crystal|hx711|xt60|barrel|tlv|sma|srr|metric/.test(n)) return 'pcb';
  if (/3d print|pla|enclosure|holder|cover|sensor|print|gooseneck|housing/.test(n)) return 'printed';
  if (/sheet|laser|bracket|support|profile|extrusion|inclined|truss|gusset/.test(n)) return 'sheet';
  if (/rubber|stopper/.test(n)) return 'rubber';
  return 'alu';
}

function sectionFor(name, mat) {
  const n = name.toLowerCase();
  if (mat === 'fastener') return 'fast';
  if (/blade|propeller|prop |motor\b|shaft clamp|hub lock/i.test(n) && !/mount|enclosure|holder/i.test(n)) return 'prop';
  if (/sensor|daq|pcb|gooseneck|rpm|vibration|telemetry/i.test(n)) return 'sense';
  if (/load cell|torque cell|head|cradle|chassis|enclosure|mount|top box|housing/i.test(n)) return 'head';
  return 'frame';
}

export function catalogFromMeshes(entries, options = {}) {
  const label = options.label || 'thrust stand';
  const pinElectronics = !!options.pinElectronics;
  const hideElectronics = !!options.hideElectronics;
  const groups = new Map();
  const electronics = [];
  const hidden = [];
  for (const entry of entries) {
    // Hide unattached CAD artifact PCB outside the enclosure
    if (/20Kg_DAQ_V1_PCB/i.test(entry.stepName)) {
      hidden.push(entry);
      continue;
    }

    const name = cleanPartName(entry.stepName);
    const isFast = isFastenerPart(name) || isFastenerPart(entry.stepName);
    const isElec = !isFast && (isElectronicsPart(entry.stepName) || isElectronicsPart(name) || name === 'DAQ enclosure module');
    if (hideElectronics && isElec) {
      hidden.push(entry);
      continue;
    }
    if (name === 'DAQ enclosure module' || (pinElectronics && (!name || isElec))) {
      electronics.push(entry);
      continue;
    }
    const key = name ? name.toLowerCase() : '__other';
    if (!groups.has(key)) groups.set(key, { name: name || 'Other hardware', meshes: [], fixed: false });
    groups.get(key).meshes.push(entry);
  }
  if (electronics.length) {
    groups.set('__daq', {
      name: 'DAQ enclosure module',
      meshes: electronics,
      fixed: true,
      singleQty: true,
    });
  }
  const items = [...groups.values()].map((group) => {
    const isFast = isFastenerPart(group.name);
    const mat = group.fixed ? 'pcb' : isFast ? 'fastener' : guessMaterial(group.name);
    const fixed = !!group.fixed || isFast;
    return {
      n: 0,
      s: isFast ? 'fast' : sectionFor(group.name, mat),
      name: group.name,
      qty: group.singleQty ? 1 : group.meshes.length,
      mat,
      fixed,
      desc: isFast
        ? 'Fasteners are removed in exploded view.'
        : group.fixed
          ? 'Integrated telemetry and DAQ module; remains assembled as a single solid unit on the base extrusion.'
          : group.meshes.length > 1
            ? `${group.meshes.length} pieces in the ${label} setup.`
            : `Part of the ${label}.`,
      parts: group.meshes.map((mesh) => [mesh.idx, [0, 0, 0]]),
    };
  });
  const order = NAMED_SECTIONS.map((section) => section.id);
  items.sort((a, b) => order.indexOf(a.s) - order.indexOf(b.s) || a.name.localeCompare(b.name));
  items.forEach((item, index) => { item.n = index + 1; });
  const sections = NAMED_SECTIONS.filter((section) => items.some((item) => item.s === section.id));
  return { items, sections, hidden };
}

/**
 * Calculates mechanically accurate exploded view offsets for each component.
 * In world space (mm): Y is vertical (+Y up), Z is thrust axis (+Z forward), X is lateral.
 * Equal and generous spacing is provided between all parts along their natural assembly paths.
 */
export function getStructuredExplodeOffset(standId, itemName, section, worldPos, assemblyCenter, rawMeshName = '') {
  const n = String(itemName || '').replace(/[_]+/g, ' ').toLowerCase();
  const s = section || 'frame';
  const raw = String(rawMeshName || '').replace(/[_]+/g, ' ').toLowerCase();
  const [wx, wy, wz] = worldPos;

  if (s === 'fast' || isFastenerPart(n) || isFastenerPart(raw)) return [0, 0, 0];

  // ==========================================
  // DAQ BOX SUBASSEMBLY (All 3 Models)
  // Kept neatly grouped directly above its base rail mounting location,
  // exploding vertically: housing stays on rail, board in middle, cover on top.
  // ==========================================
  if (/daq|top 3 3d|3d print 2|daq top/i.test(n) || /daq|top 3 3d|3d print 2|daq top/i.test(raw)) {
    // Top cover / lid with REUDE logo lifts vertically
    if (/top 3 3d|daq top/i.test(raw) || /cover|lid|top/i.test(n)) {
      return [0, 110, 0];
    }
    // Base mounting housing stays on rail
    if (/3d print/i.test(raw) || /housing|base/i.test(n)) {
      return [0, 0, 0];
    }
    // Internal PCB & discrete electronics lift in the middle between housing and cover
    return [0, 55, 0];
  }

  // ==========================================
  // MODEL 2: RTS PRO 20 (20 kgf Stand)
  // Assembly center: X≈710, Base Y≈20, Gantry Y≈540, Head Y>=950, Thrust axis: +Z forward
  // ==========================================
  if (standId === 'pro20') {
    // Propulsion stack: expands forward along +Z with generous 140-160mm gaps
    if (s === 'prop' || /blade|motor\b|shaft clamp|hub locking|collar/i.test(n)) {
      // Carbon fiber propeller blades: grouped together in dedicated forward section
      if (/blade/i.test(n) || /405|406/i.test(raw)) return [0, 80, 730];
      // Propeller hub locking adapter
      if (/hub locking/i.test(n) || /434/i.test(raw)) return [0, 80, 570];
      // Motor shaft clamp collar
      if (/shaft clamp collar/i.test(n) || /432/i.test(raw)) return [0, 80, 430];
      // High-torque brushless test motor
      if (/motor\b/i.test(n) || /404/i.test(raw)) return [0, 80, 280];
      return [0, 80, 280];
    }

    if (s === 'head') {
      // Precision motor mount adapter plate: moves forward with clean clearance from head
      if (/motor mount adapter|motor_mount|precision motor mount/i.test(n) || /motor_mount/i.test(raw)) return [0, 80, 120];

      // Top box housing: grouped together behind gantry, lifting up and back
      if (/housing.*upper|front upper/i.test(n) || /enclosure front 3d print/i.test(raw)) return [0, 260, -240];
      if (/housing.*lower|front below|front lower/i.test(n) || /enclosure front below/i.test(raw)) return [0, 230, -240];
      if (/base chassis/i.test(n) || /bottom laser/i.test(raw)) return [0, 200, -240];

      // Carriage cradle: lifts vertically to reveal gantry columns
      if (/carriage cradle|load cell support/i.test(n) || /load cell support/i.test(raw)) return [0, 160, -60];
      if (/load cell base/i.test(n)) return [0, 160, -60];

      // Dual S-beam load cells: expand symmetrically left & right (280mm gap)
      if (/load cell/i.test(n) || /50kg load cell/i.test(raw)) return [wx > 710 ? 140 : -140, 160, -60];

      // Load cell side enclosures & covers: expand further outward (520mm span)
      if (/side enclosure/i.test(n) || /load cell enclosure 2/i.test(raw)) return [wx > 710 ? 260 : -260, 160, -60];
      if (/enclosure cover/i.test(n) || /load cell enclosure bottom/i.test(raw)) return [wx > 710 ? 260 : -260, 120, -60];

      return [0, 150, -60];
    }

    if (s === 'sense') {
      if (/rpm/i.test(n) || /rpm/i.test(raw)) return [-140, 95, 180];
      if (/vibration/i.test(n) || /vibration/i.test(raw)) return [140, 95, 150];
      if (/clamp/i.test(n)) return [wx > 710 ? 80 : -80, 95, 20];
      return [0, 80, 0];
    }

    // Frame components with generous, clear separation
    if (/bench anchor clamp|u clamp|40 clamp/i.test(n) || /u_clamp|40_clamp/i.test(raw)) {
      if (/40 clamp/i.test(n) || /40_clamp/i.test(raw)) return [wx > 710 ? 260 : -260, 0, 0];
      if (wz > 1278) return [-100, 0, 180];
      return [100, 0, -180];
    }
    if (/handle/i.test(n) || /handle/i.test(raw)) return [wx > 710 ? 150 : -150, 90, 0];
    if (/cross members|thrust bed 3/i.test(n) || /thrust bed 3/i.test(raw)) return [wx > 710 ? 260 : -260, 0, 0];
    if (/truss|inclined/i.test(n) || /inclined/i.test(raw)) {
      if (wx < 600 || wx > 800) return [wx > 710 ? 220 : -220, 0, 0];
      if (wz > 1278) return [-90, 0, 170];
      return [90, 0, -170];
    }
    if (/upright|column|imagea\(2\)-1|imagea\(2\)-2/i.test(n) || /copy\s*\(5\)\s*of\s*\^imagea\(2\)/i.test(raw)) {
      return [0, 100, 0];
    }
    if (/gusset|brace|tie|vertical support|triangle support/i.test(n) || /vertical support|triangle support/i.test(raw)) {
      return [0, 100, 0];
    }
    if (/encoder disc/i.test(n)) return [0, 80, 90];
    if (/bed extrusions|copy\s*\(4\)\s*of\s*\^imagea\(2\)/i.test(n) || /copy\s*\(4\)\s*of\s*\^imagea\(2\)/i.test(raw)) {
      return [0, 0, 0];
    }
    return [0, 0, 0];
  }

  // ==========================================
  // MODEL 1: RTS COMPACT 5 (5 kgf Stand)
  // Assembly center: X≈20, Y≈240, Z≈300, Thrust axis: +X forward
  // ==========================================
  if (standId === 'compact5') {
    // Propulsion stack: expands forward along +X with generous 130-160mm gaps
    if (s === 'prop' || /blade|motor|adapter/i.test(n)) {
      // Carbon fiber propeller blades: grouped together in dedicated forward section
      if (/blade/i.test(n)) return [650, 150, 0];
      // Propeller adapter (MF1302 hub brackets)
      if (/adapter|bracket mf1302|mf1302/i.test(n)) return [490, 150, 0];
      // Brushless motor MN4110
      if (/motor/i.test(n)) return [350, 150, 0];
      return [350, 150, 0];
    }
    if (s === 'head') {
      if (/motor mounting plate|mount/i.test(n)) return [200, 150, 0];
      // Beam load cells expand laterally along Z
      if (/load cell|torque cell/i.test(n)) return [70, 150, wz > 300 ? 80 : -80];
      if (/cradle|holder|bracket/i.test(n)) return [-60, 150, 0];
      return [70, 150, 0];
    }
    if (s === 'sense') {
      if (/rpm/i.test(n)) return [180, 70, 130];
      if (/current/i.test(n)) return [-70, 70, 60];
      if (/vibration/i.test(n)) return [90, 70, -80];
      return [0, 70, 0];
    }
    // Frame components
    if (/clamp|handle/i.test(n)) return [wx > 20 ? 140 : -140, 0, wz > 300 ? 140 : -140];
    if (/bracket|gusset/i.test(n)) return [wx > 20 ? 80 : -80, 50, wz > 300 ? 80 : -80];
    if (/cross arm|top/i.test(n)) return [0, 100, 0];
    if (/mast/i.test(n)) return [0, 50, 0];
    return [0, 0, 0];
  }

  // ==========================================
  // MODEL 3: RTS ULTRA 50 (50 kgf Stand)
  // Assembly center: X≈-45, Y≈390, Z≈200, Thrust axis: -Z forward
  // ==========================================
  if (standId === 'ultra50') {
    // Sensing head stack expands forward along -Z with generous 140-160mm gaps
    if (s === 'head') {
      if (/motor mount 5x160mm/i.test(n)) return [0, 180, -440];
      if (/spacer/i.test(n)) return [0, 180, -280];
      if (/mount support/i.test(n)) return [0, 180, -130];
      if (/load cell/i.test(n)) return [0, 180, 80];
      if (/vertical support/i.test(n)) return [0, 150, 0];
      return [0, 180, -70];
    }
    if (s === 'sense') {
      if (/gooseneck/i.test(n)) return [-180, 220, -230];
      if (/current/i.test(n)) return [70, 80, -70];
      if (/vibration/i.test(n)) return [-70, 180, -90];
      return [0, 90, 0];
    }
    // Frame components
    if (/truss|inclined/i.test(n)) return [0, 0, 220];
    if (/bracket/i.test(n)) return [wx > -45 ? 150 : -150, 0, 0];
    if (/frame 45/i.test(n)) return [wx > -45 ? 140 : -140, 0, wz > 200 ? 140 : -140];
    if (/upright|column|profile/i.test(n)) return [0, 0, 0];
    return [0, 0, 0];
  }

  return [0, 0, 0];
}

/**
 * Returns [startT, endT] phase intervals (within 0..1) for mechanical sequence assembly.
 * Propeller blades move synchronously in the initial phase.
 */
export function getStructuredExplodePhase(standId, itemName, section, worldPos, rawMeshName = '') {
  const n = String(itemName || '').replace(/[_]+/g, ' ').toLowerCase();
  const s = section || 'frame';
  const raw = String(rawMeshName || '').replace(/[_]+/g, ' ').toLowerCase();

  // Both propeller blades explode together in the very first phase (0.0 to 0.40)
  if (s === 'prop' || /blade|hub|collar|405|406|432|434/i.test(n) || /405|406|432|434/i.test(raw)) {
    return [0.0, 0.40];
  }
  if (/motor\b|rpm|vibration|404/i.test(n) || /404|rpm|vibration/i.test(raw)) {
    return [0.10, 0.50];
  }
  if (/housing|enclosure front|base chassis|bottom laser/i.test(n) || /enclosure front|bottom laser/i.test(raw)) {
    return [0.20, 0.65];
  }
  if (s === 'head' || /load cell|cradle|side enclosure/i.test(n) || /load cell/i.test(raw)) {
    return [0.35, 0.75];
  }
  if (/upright|column|handle|gusset|vertical support|triangle support/i.test(n) || /imagea\(2\)|handle/i.test(raw)) {
    return [0.50, 0.85];
  }
  // Base clamps, diagonal trusses, cross members
  return [0.65, 1.0];
}
