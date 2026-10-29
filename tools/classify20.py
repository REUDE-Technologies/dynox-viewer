import json,re,sys
N=json.load(open('/home/claude/glb20b/names.json'))
D={d['i']:d for d in json.load(open('/home/claude/glb20b/nodes.json'))}
B={int(d['name'][1:]):d for d in json.load(open('/home/claude/glb20b/nodesb.json'))}
# graft nodes from the built glb
for i in (1307,1308,1309): D[i]=B[i]
REMOVED=json.load(open('/home/claude/glb20b/specd.json'))['remove']
for i in REMOVED: D.pop(i,None)
CMAP={int(k):v for k,v in json.load(open('/home/claude/glb20b/covermap.json')).items()}
name=lambda i: ' / '.join(N[i]) if i<len(N) else 'current sensor'
R=lambda a,b: list(range(a,b+1))
S={ # structural & named pieces
 'rail_L':[0],'rail_R':[3],'cross_F':[167],'cross_R':[249],'out_L':[168],'out_R':[1226],
 'pillar_L':[1],'pillar_R':[2],'bridge_top':[83],'bridge_mid':[87],
 'brace_FL':[169],'brace_FR':[171],'brace_SL':[170],'brace_SR':[1225],'brace_RL':[1223],'brace_RR':[1224],
 'uclamp_F':[165,166],'uclamp_R':[252,253],'fclamp_L':[172],'fclamp_R':[1227],
 'handle_L':[173],'handle_R':[1228],
 'vsupport':R(88,91),'vcell':[95,97,148,149,150],'sheet':[92],'hcells':[93,94],
 'lccover':[154,155,156,1220,1221,1222,86],'encl':[151,152,153],
 'plate':[96],'vib':R(98,147),'rpm':R(157,164),'motor':R(229,234),'prop':R(235,237),
 'daq':R(254,1215),'current':[1307,1308,1309],
}
taken={i for v in S.values() for i in v}
cover=sorted(CMAP.values())
def kind(i):
    n=name(i).lower()
    if '45deg' in n: return 'ab45'
    if 'tee nut' in n or 'copy (11) of ^imagea' in n: return 'tnut'
    if 'screw' in n or 'sbhcs' in n or 'copy (10) of ^imagea' in n: return 'screw'
    if 'copy (2) of^imagea' in n or D[i]['tri'] in (304,) : return 'cb90'
    return None
hw={k:[] for k in ('cb90','ab45','tnut','screw')}
rest=[i for i in D if i not in taken and i not in cover]
for i in rest:
    k=kind(i)
    if k is None: print('UNCLASSIFIED',i,name(i),D[i]['min'],D[i]['max']); continue
    hw[k].append(i)
def gap(a,b):
    return max(max(a['min'][x]-b['max'][x], b['min'][x]-a['max'][x], 0) for x in range(3))
def box(ids):
    return {'min':[min(D[i]['min'][a] for i in ids) for a in range(3)],'max':[max(D[i]['max'][a] for i in ids) for a in range(3)]}
PB={k:box(v) for k,v in S.items()}
PROF=['rail_L','rail_R','cross_F','cross_R','out_L','out_R','pillar_L','pillar_R','bridge_top','bridge_mid','brace_FL','brace_FR','brace_SL','brace_SR','brace_RL','brace_RR']
pieces={k:list(v) for k,v in S.items()}
# covers: the profile whose box contains it (smallest gap, prefer containment)
for prof_node,cv in CMAP.items():
    k=[k for k in PROF if prof_node in S[k]][0]
    pieces[k].append(cv)
COV={}
for k in PROF: COV[k]=[i for i in pieces[k] if i in cover]
# 90 brackets: priority pillars > bridges > cross > outriggers > rails among touching profiles
prio=['bridge_mid','bridge_top','pillar_L','pillar_R','cross_F','cross_R','out_L','out_R','rail_L','rail_R']
owner={}
for i in hw['cb90']:
    touch=[k for k in prio if gap(D[i],PB[k])<1.5]
    k=touch[0] if touch else min(prio,key=lambda k:gap(D[i],PB[k]))
    owner[i]=k
for i in hw['ab45']:
    owner[i]=min([k for k in PROF if k.startswith('brace')],key=lambda k:gap(D[i],PB[k]))
# small fasteners: nearest bracket (inherit) or piece
cand={i:owner[i] for i in owner}
for k in ['handle_L','handle_R','encl','uclamp_F','uclamp_R','fclamp_L','fclamp_R']+PROF: cand.setdefault(k,k)
for i in hw['tnut']+hw['screw']:
    best=None;bg=1e9
    for j,k in owner.items():
        g=gap(D[i],D[j])
        if g<bg: bg=g;best=k
    for k in ['handle_L','handle_R','encl']+PROF:
        g=gap(D[i],PB[k])+ (0.5 if k in PROF else 0)
        if k=='encl': g=gap(D[i],PB[k])+0.2
        if g<bg: bg=g;best=k
    owner[i]=best
for i,k in owner.items(): pieces[k].append(i)
allids=set(D)
got=[i for v in pieces.values() for i in v]
print('nodes',len(allids),'assigned',len(got),'dupes',len(got)-len(set(got)),'missing',sorted(allids-set(got))[:20])
mats={}
for i in cover: mats[i]='slotcover'
out={'pieces':pieces,'hw':hw,'covers':sorted(cover),'mats':mats}
open('/home/claude/dynox-viewer/models/pro-20.nodes.js','w').write('// Generated from model/rts-pro-20.glb (node indices p<i>) by tools/classify20.py. Do not edit by hand.\nexport default '+json.dumps(out,separators=(',',':'))+';\n')
for k,v in pieces.items(): print(k,len(v))
print({k:len(v) for k,v in hw.items()})

# ---- per-node materials for electronics, from the CAD colours ----
def elec_mat(col):
    r,g,b=col
    if col==[0.91,0.19,0]: return 'slotcover'
    if abs(r-0.08)<0.02 and abs(g-0.21)<0.02: return 'pcb'
    if g>0.4 and r<0.3: return 'pcb'
    if max(col)<0.2: return 'black'
    if r>0.95 and g>0.85 and b>0.75 and b<0.9: return 'fastener'   # screws
    if r>0.9 and g>0.9 and b>0.9: return 'white'
    if abs(r-0.6)<0.03 and abs(b-0.87)<0.02: return 'dark'           # CAD default colour
    if r>0.68 and b<0.45: return 'brass'                             # gold-plated pins, crystal, LEDs
    if r>0.55 and abs(r-g)<0.05: return 'steel'                      # tinned leads, metal bodies
    return 'dark'
def daq_mats(ids, col_of):
    out={}
    for i in ids:
        c=col_of(i)
        if c is None: continue
        out[i]=elec_mat(c)
    return out
M=daq_mats(pieces['daq']+pieces['vib'], lambda i: D[i]['col'] if i in D else None)
M.update({1307:'pcb',1308:'printed',1309:'printed'})
out['mats'].update({str(k):v for k,v in M.items()})
open('/home/claude/dynox-viewer/models/pro-20.nodes.js','w').write('// Generated from model/rts-pro-20.glb (node indices p<i>) by tools/classify20.py. Do not edit by hand.\nexport default '+json.dumps(out,separators=(',',':'))+';\n')
import collections; print(collections.Counter(M.values()))
# Compact 5: the grafted DAQ keeps the same colours
gm=json.load(open('/home/claude/glb5/map.json'))
C={str(v):elec_mat(D[int(k)]['col']) for k,v in gm.items()}
open('/home/claude/dynox-viewer/models/compact-5.daq.js','w').write('// DAQ unit grafted from the RTS Pro 20 model (node indices p<i> in model/rts-compact-5.glb). Generated.\nexport default '+json.dumps({'nodes':sorted(gm.values()),'mats':C},separators=(',',':'))+';\n')
