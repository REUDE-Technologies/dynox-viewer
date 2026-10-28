import fs from 'fs';
import { catalogFromMeshes } from '../models.js';

function readGLB(filePath) {
  const buf = fs.readFileSync(filePath);
  const chunkLength = buf.readUInt32LE(12);
  const jsonStr = buf.toString('utf8', 20, 20 + chunkLength);
  return JSON.parse(jsonStr);
}

const models = [
  { id: 'compact5', name: 'RTS Compact 5', file: 'model/5kg.glb', rating: '5 kgf thrust and torque stand' },
  { id: 'pro20', name: 'RTS Pro 20', file: 'model/20kg.glb', rating: '20 kgf thrust and torque stand' },
  { id: 'ultra50', name: 'RTS Ultra 50', file: 'model/50kg.glb', rating: '50 kgf thrust and torque stand' }
];

const csvRows = [
  ['Model ID', 'Model Name', 'Stand Rating', 'Item #', 'Component Name', 'Subassembly Section', 'Material / Category', 'Quantity', 'Technical Description']
];

models.forEach(m => {
  const gltf = readGLB(m.file);
  const named = [];
  let i = 0;
  gltf.nodes.forEach(n => {
    if (n.mesh !== undefined) {
      named.push({ idx: i++, stepName: n.name || '' });
    }
  });

  const catalog = catalogFromMeshes(named, { pinElectronics: true, label: m.name });
  catalog.items.forEach(item => {
    const sec = catalog.sections.find(s => s.id === item.s);
    const sectionName = sec ? sec.name : item.s;
    csvRows.push([
      m.id,
      m.name,
      m.rating,
      String(item.n),
      item.name,
      sectionName,
      item.mat,
      String(item.qty),
      item.desc || ''
    ]);
  });
});

function escapeCSV(val) {
  const str = String(val === undefined || val === null ? '' : val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

const csvOutput = csvRows.map(row => row.map(escapeCSV).join(',')).join('\r\n');
fs.writeFileSync('dynox_thrust_stands_components.csv', csvOutput, 'utf8');
console.log('Successfully written dynox_thrust_stands_components.csv with rows:', csvRows.length);
