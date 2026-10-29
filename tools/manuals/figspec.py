import json
P20_FEET=['foot_FL','foot_FR','foot_RL','foot_RR','foot_OL','foot_OR']
P20_STRUTS=['strut_FL','strut_FR','strut_RL','strut_RR','strut_SL','strut_SR']
SPEC={
 'pro-20': {
  'steps':[
   ('s1',['rail_L','rail_R','cross_F','cross_R'],['rail_L','rail_R','cross_F','cross_R']),
   ('s2',['pillar_L','pillar_R'],['pillar_L','pillar_R']),
   ('s3',['out_L','out_R','uclamp_F','uclamp_R','fclamp_L','fclamp_R'],['out_L','out_R','uclamp_F','uclamp_R','fclamp_L','fclamp_R']),
   ('s4',['brace_FL','brace_FR','brace_RL','brace_RR','brace_SL','brace_SR'],['brace_FL','brace_FR','brace_RL','brace_RR','brace_SL','brace_SR']),
   ('s5',['bridge_mid','bridge_top','handle_L','handle_R'],['bridge_mid','bridge_top','handle_L','handle_R']),
   ('s6',['vsupport','vcell'],['vsupport','vcell']),
   ('s7',['sheet','hcells'],['sheet','hcells']),
   ('s8',['plate','vib','motor','rpm','prop'],['plate','vib','motor','rpm','prop']),
   ('s9',['daq','current','lccover','encl'],['daq','current','lccover','encl']),
   ('s10',[],[]),
  ],
  'head':['bridge_top','vsupport','vcell','sheet','hcells','lccover','plate','vib','rpm','motor','prop','encl'],
  'daq':['daq','current','pillar_L','pillar_R','bridge_mid','bridge_top','handle_L','handle_R'],
  'daqDir':[0.55,0.45,-1.0],
  'routeDir':[0.55,0.42,-1.0],
 },
 'compact-5': {
  'steps':[
   ('s1',['base','stopper_A','stopper_B','clamp_A','clamp_B'],['base','stopper_A','stopper_B','clamp_A','clamp_B']),
   ('s2',['cross_A','cross_B','handle_A','handle_B'],['cross_A','cross_B','handle_A','handle_B']),
   ('s3',['mast','brk_A','brk_B'],['mast','brk_A','brk_B']),
   ('s4',['arm','ubrk_A','ubrk_B','handle_C','handle_D'],['arm','ubrk_A','ubrk_B','handle_C','handle_D']),
   ('s5',['lcb','tcell','holder'],['lcb','tcell','holder']),
   ('s6',['qcell_A','qcell_B','qarm_A','qarm_B','mount'],['qcell_A','qcell_B','qarm_A','qarm_B','mount']),
   ('s7',['motor','prop'],['motor','prop']),
   ('s8',['rpm','vib','current','daq'],['rpm','vib','current','daq']),
   ('s9',[],[]),
  ],
  'head':['lcb','tcell','holder','vib','qcell_A','qcell_B','qarm_A','qarm_B','mount','motor','prop','arm'],
  'daq':['daq','current','mast','arm','cross_A','cross_B','base'],
  'daqDir':[0.75,0.45,1.0],
  'routeDir':[0.55,0.35,1.2],
 },
 'ultra-50': {
  'steps':[
   ('s1',['base'],['base']),
   ('s2',['pillar_FL','pillar_FR','pillar_RL','pillar_RR'],['pillar_FL','pillar_FR','pillar_RL','pillar_RR']),
   ('s3',['out_RF','out_LF','out_RR','out_LR'],['out_RF','out_LF','out_RR','out_LR']),
   ('s4',['sbrace_RF','sbrace_LF','sbrace_RR','sbrace_LR','brace_L','brace_R'],['sbrace_RF','sbrace_LF','sbrace_RR','sbrace_LR','brace_L','brace_R']),
   ('s5',['beam'],['beam']),
   ('s6',['gusset','vcell'],['gusset','vcell']),
   ('s7',['holder','tcell','support'],['holder','tcell','support']),
   ('s8',['plate','vib','goose'],['plate','vib','goose']),
   ('s9',['daq'],['daq']),
   ('s10',['cs'],['cs']),
   ('s11',[],[]),
  ],
  'head':['gusset','vcell','holder','tcell','support','plate','vib','goose','beam'],
  'daq':['daq','beam','gusset','vcell','holder','tcell','support','plate','vib','goose'],
  'routeDir':[1.0,0.45,1.0],
 },
}
jobs={}
for m,sp in SPEC.items():
    J=[]
    J.append({'name':'hero','view':'iso','labels':False,'pad':0.95})
    J.append({'name':'overview','view':'iso','labels':'all','pad':0.98})
    J.append({'name':'exploded','view':'side','explode':1,'labels':'all','pad':0.98})
    J.append({'name':'table','view':'table','spread':1,'labels':'all','pad':0.98})
    shown=[]
    for name,add,hl in sp['steps']:
        shown=shown+add
        last = name == sp['steps'][-1][0]
        j = {'name':name,'show':list(shown),'hl':hl,'view':'iso','labels':'hl','pad':1.0}
        if last: j.update({'hlItems':['Slot cover strips'],'labels':'cover'})
        else: j['hideItems'] = ['Slot cover strips']
        J.append(j)
    J.append({'name':'head','show':sp['head'],'hl':[],'view':'side','explode':1,'labels':'all','pad':1.05})
    J.append({'name':'daq','show':sp['daq'],'hl':[p for p in sp['daq'] if p in ('daq','current','cs')],'dir':sp.get('daqDir',[1,0.9,1.0]),'explode':0,'labels':'hl','pad':1.1})
    J.append({'name':'routes','dir':sp['routeDir'],'labels':False,'wires':True,'pad':1.0})
    jobs[m]=J
json.dump(jobs,open('figjobs.json','w'),indent=0)
print({k:len(v) for k,v in jobs.items()})
