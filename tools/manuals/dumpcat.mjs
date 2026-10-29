import fs from 'fs';
const out = {};
for (const id of ['compact-5', 'pro-20', 'ultra-50']) {
  const m = (await import(`/home/claude/dynox-viewer/models/${id}.js`)).default;
  out[id] = { title: m.title, subtitle: m.subtitle, sections: m.sections, wires: m.wires || [], items: m.items.map((it, k) => ({ n: k + 1, ...it, nodes: undefined, matOverrides: undefined })) };
}
fs.writeFileSync('/home/claude/manual/catalog.json', JSON.stringify(out, null, 1));
console.log(Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.items.length])));
