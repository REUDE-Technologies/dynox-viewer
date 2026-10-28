// DynoX RTS Thrust Stands — Component Catalogs for 5kg and 20kg models.
// Mesh indices refer to nodes "p<i>" in model/rts-compact-5.glb and model/rts-pro-20.glb.
// Explode offsets are in mm.

export const SECTIONS = [
  { id: 'frame', name: 'Frame and base' },
  { id: 'head', name: 'Force-sensing head' },
  { id: 'prop', name: 'Motor and propeller' },
  { id: 'sense', name: 'Sensors and electronics' },
  { id: 'fast', name: 'Fasteners' },
];

export const COMPACT5_SECTIONS = SECTIONS;
export const PRO20_SECTIONS = SECTIONS;

// ==========================================
// RTS COMPACT 5 CATALOG
// ==========================================
export const COMPACT5_ITEMS = [
  {
    n: 1, s: 'frame', name: 'Base extrusion 40×120', qty: 1, mat: 'alu',
    desc: 'Wide aluminium base rail that carries the whole stand and sits on the test bench.',
    parts: [[0, [0, -220, 0]]],
  },
  {
    n: 2, s: 'frame', name: 'Mast 4040 × 400', qty: 1, mat: 'alu',
    desc: 'Vertical 40×40 aluminium profile that lifts the sensing head and propeller clear of the bench.',
    parts: [[1, [0, 0, 0]]],
  },
  {
    n: 3, s: 'frame', name: 'Top cross arm 4040', qty: 1, mat: 'alu',
    desc: 'Horizontal profile at the top of the mast that carries the sensing head and RPM sensor arm.',
    parts: [[4, [0, 70, 0]]],
  },
  {
    n: 4, s: 'frame', name: 'Bench clamps & carry handles', qty: 2, mat: 'black',
    desc: 'Clamp the base rail ends to the bench top and provide grip for repositioning.',
    parts: [[11, [0, -140, 100]], [12, [0, -140, -100]]],
  },
  {
    n: 5, s: 'frame', name: 'Base cross members & end stoppers', qty: 8, mat: 'alu',
    desc: 'Reinforcement profiles and protective end caps on the base rail.',
    parts: [
      [20, [0, -120, 80]], [21, [0, -120, -80]],
      [22, [0, -100, 60]], [23, [0, -100, -60]],
      [24, [-40, -80, 0]], [25, [40, -80, 0]],
      [26, [0, -140, 50]], [27, [0, -140, -50]],
    ],
  },
  {
    n: 6, s: 'frame', name: 'Corner brackets', qty: 4, mat: 'alu',
    desc: 'Tie the mast to the base cross members below and to the top cross arm above.',
    parts: [[13, [0, 40, 0]], [16, [-40, 50, 40]], [17, [-40, 50, -40]]],
  },
  {
    n: 7, s: 'head', name: 'Load-cell bracket cradle', qty: 1, mat: 'sheet',
    desc: 'Folded sheet-metal cradle bolted to the cross arm; anchors the thrust load cell.',
    parts: [[9, [0, 140, 0]]],
  },
  {
    n: 8, s: 'head', name: 'Torque cell holder & cradle', qty: 1, mat: 'printed',
    desc: 'Precision printed holder joining the top of the thrust load cell to the torque load-cell pair.',
    parts: [[6, [80, 230, 0]]],
  },
  {
    n: 9, s: 'head', name: 'Torque load cells', qty: 2, mat: 'cell',
    desc: 'Pair of precision beam load cells reading motor reaction torque as a calibrated force couple.',
    parts: [[28, [140, 230, 60]], [29, [140, 230, -60]]],
  },
  {
    n: 10, s: 'head', name: 'Motor mount plate', qty: 1, mat: 'sheet',
    desc: '100 × 100 mm plate that the motor under test bolts to. Swap it to fit other motor bolt patterns.',
    parts: [[7, [280, 230, 0]]],
  },
  {
    n: 11, s: 'prop', name: 'Reference motor (MN4110)', qty: 1, mat: 'motor',
    desc: 'High-efficiency brushless outrunner reference motor for dynamic propulsion validation.',
    parts: [[10, [340, 230, 0]]],
  },
  {
    n: 12, s: 'prop', name: 'Propeller adapter (MF1302)', qty: 2, mat: 'black',
    desc: 'Top and bottom hub brackets, nylon washers and shoulder screws that hold the folding blades.',
    parts: [[18, [410, 230, 0]], [19, [395, 230, 0]]],
  },
  {
    n: 13, s: 'prop', name: 'Folding propeller blades (CW)', qty: 2, mat: 'carbon',
    desc: 'Clockwise carbon-composite folding blades (~340 mm tip-to-tip) for thrust and airflow test.',
    parts: [[2, [470, 310, 0]], [3, [470, 150, 0]]],
  },
  {
    n: 14, s: 'sense', name: 'RPM sensor and arm', qty: 2, mat: 'printed',
    desc: 'Rigid arm placing a non-contact optical/magnetic RPM sensor directly beside the motor bell.',
    parts: [[5, [70, 40, 0]], [14, [110, 40, 0]]],
  },
  {
    n: 15, s: 'sense', name: 'Vibration & current sensor modules', qty: 2, mat: 'printed',
    desc: 'Dual sensor modules providing continuous 3-axis vibration and motor phase current telemetry.',
    parts: [[8, [-110, 0, -50]], [15, [-110, 0, 50]]],
  },
  {
    n: 16, s: 'sense', name: 'DAQ and electronics module', qty: 1, mat: 'pcb',
    desc: 'Integrated data acquisition board with signal conditioning, ADC, and USB/Ethernet telemetry.',
    fixed: true,
    parts: [[50, [0, 0, 0]]],
  },
  {
    n: 17, s: 'fast', name: 'Hardware fasteners and T-nuts', qty: 1, mat: 'fastener',
    desc: 'High-tensile socket head cap screws and series-8 drop-in T-nuts securing all assembly joints.',
    parts: [
      [30, [40, 230, 0]], [31, [40, 230, 0]], [32, [40, 230, 0]],
      [33, [40, 230, 0]], [34, [40, 230, 0]], [35, [40, 230, 0]],
      [51, [0, 90, 0]],
    ],
  },
];

// ==========================================
// RTS PRO 20 CATALOG
// ==========================================
export const PRO20_ITEMS = [
  {
    n: 1, s: 'frame', name: 'Heavy base bed rails (1100 mm)', qty: 4, mat: 'alu',
    desc: 'Wide structural aluminium extrusion bed providing high torsional stiffness and bench stability under 20 kgf thrust.',
    parts: [[0, [0, -250, 0]], [1, [0, -250, 0]], [2, [0, -250, 0]], [3, [0, -250, 0]]],
  },
  {
    n: 2, s: 'frame', name: 'Gantry vertical frame (1040 mm)', qty: 1, mat: 'alu',
    desc: 'Vertical aluminium gantry structure lifting the 20 kg thrust sensor head and propeller clear of ground turbulence.',
    parts: [[4, [0, 0, 0]]],
  },
  {
    n: 3, s: 'frame', name: 'Diagonal support trusses', qty: 2, mat: 'printed',
    desc: 'Heavy triangular reinforcement trusses locking the vertical gantry to the base bed to eliminate axial bending deflection.',
    parts: [[8, [200, -100, 0]], [9, [-200, -100, 0]]],
  },
  {
    n: 4, s: 'frame', name: 'Bench clamps', qty: 2, mat: 'black',
    desc: 'Heavy-duty steel clamps locking the bed rails solidly to the test table.',
    parts: [[31, [120, -320, 0]], [32, [-120, -320, 0]]],
  },
  {
    n: 5, s: 'frame', name: 'Base cross profile ties & end caps', qty: 4, mat: 'alu',
    desc: 'Transverse tie members locking the dual base extrusions at the front and rear.',
    parts: [[10, [0, -200, 120]], [11, [0, -200, -120]], [35, [0, -240, 0]], [36, [0, -240, 0]]],
  },
  {
    n: 6, s: 'frame', name: 'Frame gusset & corner brackets', qty: 16, mat: 'alu',
    desc: 'High-rigidity 45-degree and 90-degree corner gussets securing all structural aluminum profile junctions.',
    parts: [
      [12, [50, -60, 50]], [13, [50, -60, -50]], [14, [-50, -60, 50]], [15, [-50, -60, -50]],
      [16, [70, -80, 0]], [17, [-70, -80, 0]], [18, [70, -80, -70]], [19, [-70, -80, -70]],
      [20, [-40, -40, 0]], [21, [40, -40, 0]], [22, [-40, -40, -70]], [23, [40, -40, -70]],
    ],
  },
  {
    n: 7, s: 'head', name: 'Force-sensing head cradle', qty: 1, mat: 'sheet',
    desc: 'Folded sheet-steel carriage housing the axial thrust load cell and torque arm linkage.',
    parts: [[26, [0, 120, -120]]],
  },
  {
    n: 8, s: 'head', name: 'Central torque transducer pivot', qty: 1, mat: 'printed',
    desc: 'Low-friction rotational pivot mechanism isolating reaction torque from extraneous off-axis bending moments.',
    parts: [[28, [0, 120, -180]]],
  },
  {
    n: 9, s: 'head', name: 'Dual force-sensing load cells', qty: 2, mat: 'cell',
    desc: 'Matched S-type / beam load cells calibrated for simultaneous 20 kgf axial thrust and 10 N·m torque measurement.',
    parts: [[29, [80, 120, -220]], [30, [-80, 120, -220]]],
  },
  {
    n: 10, s: 'head', name: 'Motor mount adapter plate', qty: 1, mat: 'sheet',
    desc: '200 × 200 mm precision CNC drilled mounting plate accommodating industrial drone and UAV motor bolt patterns.',
    parts: [[25, [0, 120, -280]]],
  },
  {
    n: 11, s: 'prop', name: 'High-torque test motor', qty: 1, mat: 'motor',
    desc: 'High-torque brushless outrunner motor rated up to 10 kW for heavy-lift propulsion benchmarking.',
    parts: [[24, [0, 120, -360]]],
  },
  {
    n: 12, s: 'prop', name: 'Propeller hub & blade adapter', qty: 1, mat: 'black',
    desc: 'Heavy-duty CNC machined propeller hub with shoulder bolts and balance rings.',
    parts: [[27, [0, 120, -430]]],
  },
  {
    n: 13, s: 'prop', name: 'Carbon fiber propeller blade (1026 mm)', qty: 1, mat: 'carbon',
    desc: 'High-efficiency aerodynamic carbon fiber propeller blade capable of producing up to 20 kgf static thrust.',
    parts: [[5, [0, 120, -520]]],
  },
  {
    n: 14, s: 'sense', name: 'Optical RPM pickup arm', qty: 1, mat: 'printed',
    desc: 'Adjustable sensor arm mounting a high-speed optical RPM pickup accurate to ±1 RPM.',
    parts: [[33, [-140, 120, -220]]],
  },
  {
    n: 15, s: 'sense', name: '3-Axis vibration telemetry module', qty: 1, mat: 'pcb',
    desc: 'Direct-mount triaxial accelerometer delivering real-time harmonic vibration and balance telemetry.',
    parts: [[34, [160, 0, 0]]],
  },
  {
    n: 16, s: 'fast', name: 'Structural fasteners and T-nuts', qty: 24, mat: 'fastener',
    desc: 'M8 high-tensile fasteners securing the gantry, brackets, and motor mounting plate.',
    parts: [
      [37, [40, 60, 0]], [38, [40, 60, 0]], [39, [-40, 60, 0]], [40, [-40, 60, 0]],
      [41, [0, 60, 40]], [42, [0, 60, -40]], [43, [0, 60, 0]], [44, [0, 60, 0]],
      [45, [0, 60, 0]], [46, [0, 60, 0]], [47, [0, 60, 0]], [48, [0, 60, 0]],
      [49, [0, 60, 0]], [50, [0, 60, 0]], [51, [0, 60, 0]], [52, [0, 60, 0]],
      [53, [0, 60, 0]], [54, [0, 60, 0]], [55, [0, 60, 0]], [56, [0, 60, 0]],
      [57, [0, 60, 0]], [58, [0, 60, 0]], [59, [0, 60, 0]], [60, [0, 60, 0]],
      [61, [0, 60, 0]],
    ],
  },
];

export const ITEMS = COMPACT5_ITEMS;

// Material definitions
export const MATERIALS = {
  // Clear-anodised 6063 extrusion.
  alu:      { color: 0xd7dbe0, metalness: 0.72, roughness: 0.34, env: 0.85 },
  // Folded steel bracket and motor plate.
  sheet:    { color: 0x7f8b96, metalness: 0.62, roughness: 0.46, env: 0.5 },
  // Polished beam load cell, brighter than the extrusion.
  cell:     { color: 0xf4f6f8, metalness: 0.5,  roughness: 0.22, env: 0.7 },
  // Printed parts in the REUDE blue used on the hardware.
  printed:  { color: 0x1f6cbc, metalness: 0.0,  roughness: 0.55 },
  black:    { color: 0x1b1e22, metalness: 0.12, roughness: 0.58 },
  rubber:   { color: 0x121416, metalness: 0.0,  roughness: 0.95 },
  // Outrunner can: dark metal, not the same as the plastic handles.
  motor:    { color: 0x3a4048, metalness: 0.55, roughness: 0.38, env: 0.6 },
  // Carbon blade, slightly lighter than the black plastics so the prop reads.
  carbon:   { color: 0x2a3038, metalness: 0.22, roughness: 0.32 },
  // Steel screws, dark but metallic.
  fastener: { color: 0x6a7078, metalness: 0.78, roughness: 0.36, env: 0.55 },
  pcb:      { color: 0x1c8a46, metalness: 0.04, roughness: 0.48 },
  brass:    { color: 0xd4a017, metalness: 0.82, roughness: 0.28, env: 0.7 },
};
