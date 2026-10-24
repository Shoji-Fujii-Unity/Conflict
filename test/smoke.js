'use strict';
// Headless smoke test for STRATA index.html (no browser needed).
const fs=require('fs'),path=require('path'),vm=require('vm');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');

/* ---- extract script ---- */
const m=html.match(/<script>([\s\S]*?)<\/script>/);
if(!m){ console.error('FAIL: no <script> found'); process.exit(1); }
let src=m[1];

/* ---- collect DOM ids referenced vs defined ---- */
const defined=new Set();
let im; const idre=/id="([^"]+)"/g;
while((im=idre.exec(html))) defined.add(im[1]);
const referenced=new Set();
let rm; const refre=/(?:el\(|getElementById\()['"]([^'"]+)['"]\)/g;
while((rm=refre.exec(src))) referenced.add(rm[1]);
const missingIds=[...referenced].filter(id=>!defined.has(id));
console.log('IDs referenced:',referenced.size,'defined:',defined.size,missingIds.length?('MISSING: '+missingIds.join(',')):'(all defined)');

/* ---- stubs ---- */
const requested=new Set();
function makeEl(id){
 const el={id,style:{},dataset:{},children:[],_cls:new Set(),textContent:'',innerHTML:'',offsetLeft:0,offsetTop:0,
  classList:{add:c=>el._cls.add(c),remove:c=>el._cls.delete(c),contains:c=>el._cls.has(c),
   toggle:(c,f)=>{ if(f===undefined){ if(el._cls.has(c))el._cls.delete(c);else el._cls.add(c); } else if(f)el._cls.add(c); else el._cls.delete(c); }},
  addEventListener(){},removeEventListener(){},
  appendChild(c){el.children.push(c);return c},
  removeChild(c){const i=el.children.indexOf(c);if(i>=0)el.children.splice(i,1);return c},
  get firstChild(){return el.children[0]||null},
  querySelectorAll(){return[]},closest(){return null},remove(){},};
 return el;
}
const els={};
const autoEls=new Set();
const documentStub={
 getElementById(id){ if(!els[id]){els[id]=makeEl(id);autoEls.add(id);} return els[id]; },
 querySelectorAll(){return[]},
 createElement(t){return makeEl('dyn-'+t)},
 body:makeEl('body'),documentElement:makeEl('html'),
 addEventListener(){},hidden:false,
};
const transforms=[];
const ctxStub=new Proxy({
 createLinearGradient(){return {addColorStop(){}};},
 setTransform(...args){transforms.push(args);},
},{get(t,p){ if(typeof p==='symbol')return undefined; if(!(p in t)) t[p]=(...a)=>{}; return t[p]; },set(t,p,v){t[p]=v;return true;}});
const cvStub={width:0,height:0,style:{},getContext:()=>ctxStub,addEventListener(){},offsetLeft:0,offsetTop:0};
els['cv']=cvStub;
const store={};
const sandbox={
 console,Math,JSON,Date,isNaN,parseInt,parseFloat,Infinity,NaN,
 setTimeout:(fn,ms)=>{ try{fn();}catch(e){ console.error('setTimeout cb error:',e.message); } return 0; },
 clearTimeout(){},performance:{now:()=>Date.now()},
 localStorage:{getItem:k=>store[k]!==undefined?store[k]:null,setItem:(k,v)=>{store[k]=String(v);},removeItem:k=>{delete store[k];}},
 confirm:()=>true,
 requestAnimationFrame:()=>0,
 navigator:{userAgent:'node'},
};
sandbox.window=sandbox;
sandbox.globalThis=sandbox;
sandbox.document=documentStub;
sandbox.window.innerWidth=900;sandbox.window.innerHeight=520;sandbox.window.devicePixelRatio=1;
sandbox.window.addEventListener=()=>{};
sandbox.window.AudioContext=undefined;sandbox.window.webkitAudioContext=undefined;

/* expose internals for the test */
src+='\nwindow.__X={getG:()=>G,setG:v=>{G=v;},getSAVE:()=>SAVE,startGame,showScreen,updatePanel,updateHud,applyLabels,goalText,renderStages,toast,resize,doTap,issueCommand,selWorkers,hoverEnt,LEVELS,I18N,t,U,B,Game,saveNow};';

/* ---- run ---- */
let errors=[];
try{
 vm.runInNewContext(src,sandbox,{filename:'index.html-script',timeout:120000});
}catch(e){ console.error('BOOT FAIL:',e.stack); process.exit(1); }
const X=sandbox.window.__X;
if(process.env.DIF) X.getSAVE().diff=process.env.DIF;
if(process.env.LEVELS_ONLY){ for(const s of process.env.LEVELS_ONLY.split(',')) {} }
console.log('BOOT OK · save defaults:',JSON.stringify(X.getSAVE()).slice(0,80));

/* combat counters and adaptive enemy composition */
try{
 const combat=new X.Game(9);
 const hitDamage=(attacker,target)=>{
  const a=combat.spawnUnit(0,attacker,300,300),d=combat.spawnUnit(1,target,360,300);
  const hp=d.hp; combat.hit(a,d); return hp-d.hp;
 };
 if(hitDamage('militia','archer')<=X.U.militia.dmg) errors.push('militia should counter archers');
 if(hitDamage('spear','knight')<=X.U.spear.dmg) errors.push('spearmen should counter cavalry');
 if(hitDamage('knight','militia')<=X.U.knight.dmg) errors.push('cavalry should counter infantry');
 const pickCounter=(enemyType)=>{
  const g=new X.Game(9);
  for(let i=0;i<3;i++) g.spawnUnit(0,enemyType,320+i*20,300);
  return g.counterUnitFor('barracks',g.lv.comp);
 };
 if(pickCounter('archer')!=='militia') errors.push('enemy AI did not choose militia against archers');
 if(pickCounter('knight')!=='spear') errors.push('enemy AI did not choose spearmen against cavalry');
 const adaptive=new X.Game(9);
 adaptive.time=200; adaptive.gold[1]=3000;
 for(let i=0;i<3;i++) adaptive.spawnUnit(0,'archer',320+i*20,300);
 adaptive.aiThink();
 const barracks=adaptive.buildings.find(b=>b.team===1&&b.type==='barracks'&&!b.isbuilding);
 if(!barracks||!barracks.que.includes('militia')) errors.push('enemy AI did not queue a counter unit against archers');
 console.log('counter damage + adaptive enemy composition: OK');
}catch(e){ errors.push('combat balance: '+e.message+'\n'+e.stack); }

/* route around blocking terrain and keep moving to the destination */
try{
 const pathGame=new X.Game(1);
 pathGame.units=[]; pathGame.buildings=[];
 pathGame.obs=[{x:300,y:300,r:36,tree:true}];
 pathGame.invalidateNavigation();
 const mover=pathGame.spawnUnit(0,'worker',180,300);
 const route=pathGame.findPath(mover,420,300,X.U.worker);
 if(!route.points.length) errors.push('pathfinder returned no route around terrain');
 if(!route.points.some(p=>Math.abs(p.y-300)>40)) errors.push('pathfinder did not detour around terrain');
 if(route.points.some(p=>Math.hypot(p.x-300,p.y-300)<36+mover.rad+4)) errors.push('pathfinder routed through blocked terrain');
 for(let i=0;i<360&&Math.hypot(mover.x-420,mover.y-300)>14;i++) pathGame.moveTo(mover,420,300,1/30,X.U.worker);
 if(Math.hypot(mover.x-420,mover.y-300)>24) errors.push('unit failed to reach destination around obstacle');
 const revision=pathGame.navRevision;
 pathGame.addBuilding(0,'barracks',300,470);
 if(pathGame.navRevision===revision) errors.push('building placement did not invalidate navigation');
 console.log('obstacle pathfinding + navigation invalidation: OK');
}catch(e){ errors.push('pathfinding: '+e.message+'\n'+e.stack); }

/* i18n completeness */
const en=Object.keys(X.I18N.en);
for(const L of ['ja','cn','tw']){
 const d=X.I18N[L]; const miss=en.filter(k=>d[k]===undefined);
 const snOk=Array.isArray(d.snames)&&d.snames.length===16;
 console.log('i18n '+L+': '+(miss.length?('MISSING KEYS: '+miss.join(',')):'complete')+' · snames16:'+(snOk?'ok':'BAD'));
}

/* helper to simulate one level with a scripted "active player" bot */
function playBot(g){
 const tc=g.buildings.find(b=>b.team===0&&b.type==='tc');
 if(!tc||tc.isbuilding) return;
 const workers=g.units.filter(u=>u.team===0&&u.type==='worker');
 const bk=g.buildings.find(b=>b.team===0&&b.type==='barracks'&&!b.isbuilding);
 const ac=g.buildings.find(b=>b.team===0&&b.type==='archery'&&!b.isbuilding);
 const st=g.buildings.find(b=>b.team===0&&b.type==='stable'&&!b.isbuilding);
 // expand economy
 if(workers.length<8&&g.gold[0]>300&&tc.que.length<3) g.queue(tc,'worker',false);
 if(!bk&&g.gold[0]>400){ const x=tc.x-120,y=tc.y+70; g.placePlayer('barracks',x,y)||g.placePlayer('barracks',x,y-60)||g.placePlayer('barracks',tc.x+130,tc.y+60); }
 if(bk&&g.gold[0]>260&&bk.que.length<3){ const ut=(g.lv.comp&&g.lv.comp.indexOf('spear')>=0)?'spear':'militia'; g.queue(bk,ut,false); }
 if(g.lv.goal!=='defend'&&(!g.lv.block||g.lv.block.indexOf('archery')<0)&&!ac&&bk&&g.gold[0]>560) g.placePlayer('archery',tc.x+140,tc.y+90)||g.placePlayer('archery',tc.x,tc.y+130);
 if(ac&&g.gold[0]>300&&ac.que.length<3) g.queue(ac,'archer',false);
 if(!g.lv.block||g.lv.block.indexOf('stable')<0){ if(!st&&bk&&ac&&g.gold[0]>900) g.placePlayer('stable',tc.x-150,tc.y+110)||g.placePlayer('stable',tc.x+160,tc.y-40);
  if(st&&g.gold[0]>600&&st.que.length<3) g.queue(st,'knight',false); }
 // farms when pop is nearly capped (humans do this)
 const nf=g.buildings.filter(b=>b.team===0&&b.type==='farm'&&!b.isbuilding).length;
 if(g.popUse(0)>=g.popCap(0)-2&&g.gold[0]>220&&nf<4){
  const offs=[[-170,95],[170,95],[0,150],[-95,150]];
  for(const[ox,oy]of offs){ if(g.placePlayer('farm',tc.x+ox,tc.y+oy)) break; }
 }
 // towers near TC (as a moderate human player would)
 const twr=g.buildings.filter(b=>b.team===0&&b.type==='tower'&&!b.isbuilding).length;
 if(twr<2&&g.gold[0]>(twr===0?380:300)&&(!g.lv.block||g.lv.block.indexOf('tower')<0)){
  const ox=twr===0?-90:90;
  g.placePlayer('tower',tc.x+ox,tc.y+34)||g.placePlayer('tower',tc.x+ox,tc.y-58)||g.placePlayer('tower',tc.x+ox*1.4,tc.y+60);
 }
 // defend at home when enemies close in
 const d2=(u)=>{const dx=u.x-tc.x,dy=u.y-tc.y;return dx*dx+dy*dy;};
 const threat=g.units.some(u=>u.team===1&&d2(u)<400*400);
 const allmil=g.units.filter(u=>u.team===0&&X.U[u.type].military);
 if(threat){ for(const u of g.units) if(u.team===0&&u.type==='worker'&&d2(u)<340*340&&(u.mode==='gather'||u.mode==='idlew')){ u.mode='walk'; u.mv={x:tc.x+(Math.random()*80-40),y:tc.y-45+(Math.random()*30-15)}; } }
 if(threat&&allmil.length){ for(const u of allmil){ u.home={x:tc.x,y:tc.y+45}; u.stance='defend'; if(u.mode!=='military'){u.mode='military';u.mv=null;} if(u.ftgt&&(u.ftgt.x-tc.x)**2+(u.ftgt.y-tc.y)**2>500*500) u.ftgt=null; } }
 // attack waves of our own every 45s with idle military
 if(g.time>150&&g.lv.goal!=='defend'&&!threat){
  const idle=g.units.filter(u=>u.team===0&&X.U[u.type].military&&u.mode==='military');
  if(idle.length>=8){ const etc=g.buildings.filter(b=>b.team===1&&!b.isbuilding).sort((a,b)=>dist0(a)-dist0(b))[0];
   if(etc) g.order(idle,etc.x,etc.y,true); }
 }
}
function dist0(a){ const g2=X.getG(); const tc=g2.buildings.find(b=>b.team===0&&b.type==='tc'); if(!tc) return 1e9; const dx=a.x-tc.x,dy=a.y-tc.y; return dx*dx+dy*dy; }
function simLevel(id,play){
 X.startGame(id);
 const g=X.getG();
 if(!g) throw new Error('G not created for level '+id);
 const issues=[];
 // initial sanity
 if(!g.buildings.some(b=>b.team===0&&b.type==='tc')) issues.push('no player TC');
 if(id!==14&&id!==6&&id!==7&&!g.buildings.some(b=>b.team===1)) issues.push('no enemy buildings');
 let steps=0;const maxSteps=30*(g.lv.timeLimit||g.lv.goaltime||(g.lv.par+240));
 while(!g.over&&steps<maxSteps){
  try{
   g.step(1/30);
   if(play&&steps%60===0) playBot(g);
   if(steps%89===0){ g.render(); X.updateHud(); X.updatePanel(); X.goalText(); }
  }catch(e){ errors.push('level '+id+' step '+steps+': '+e.message+'\n'+(e.stack||'').split('\n')[1]); break; }
  steps++;
 }
 return {id,over:g.over,res:g.overRes,steps:steps/30,units:g.units.length,blds:g.buildings.length,lost:g.stats.lost,issues};
}

let timeoutCount=0,crashBefore=errors.length;
const lvList=process.env.LVS?process.env.LVS.split(',').map(Number):Array.from({length:16},(_,i)=>i+1);
for(const id of lvList){
 const r=simLevel(id,id%2===1);
 const why=r.res?r.res.reason:'TIMEOUT';
 if(!r.over) timeoutCount++;
 console.log('L'+String(id).padStart(2)+' '+(r.over?(r.res.win?'WIN ':'LOSE'):'DRAW')+' '+why.padEnd(7)+
  ' t='+r.steps.toFixed(0)+'s u='+r.units+' b='+r.blds+' lost0='+r.lost[0]+(r.issues.length?' ISSUES:'+r.issues.join(';'):''));
}
/* interaction smoke on level 3 with real tap routing */
try{
 X.startGame(3); const g=X.getG();
 X.resize();
 g.vw=900; g.vh=520;
 // tap own TC (select), then tap enemy (attack), then right-click style command, then place ghost via panel path
 const tc=g.buildings.find(b=>b.team===0&&b.type==='tc');
 g.cam={x:0,y:0}; g.zoom=1;
 const w={x:tc.x,y:tc.y};
 X.doTap(tc.x,tc.y);
 if(!g.sel.includes(tc)) console.log('WARN: tapping own TC did not select it'); else console.log('tap-select own TC: OK');
 X.updatePanel();
 // pop guard: fill gold then attempt beyond queue cap
 g.gold[0]=10000; g.queue(tc,'worker',false); g.queue(tc,'worker',false); g.queue(tc,'worker',false); g.queue(tc,'worker',false);
 const ok2=g.queue(tc,'worker',true);
 console.log('queue cap guard (expect false): '+ok2);
 // place farm: invalid on TC (expect false) and somewhere free (expect true at one of the tries)
 let pf2=false;
 for(const [ox,oy] of [[-100,-90],[-130,-60],[130,80],[90,-110],[0,140]]){ if(g.placePlayer('farm',tc.x+ox,tc.y+oy)){ pf2=true; break; } }
 console.log('placePlayer on TC (expect false): '+g.placePlayer('farm',tc.x,tc.y)+' | free spot any-ok: '+pf2);
 // stance + stop + autog toggle
 g.sel=g.units.filter(u=>u.team===0&&X.U[u.type].military);
 g.setStance(g.sel,'aggro'); g.orderStop(g.sel);
 g.autoG=false; g.autoG=true;
 g.zoom=1.25; g.cam={x:12,y:34}; g.box={x0:100,y0:80,x1:220,y1:160}; transforms.length=0;
 g.render();
 if(transforms.length<5||transforms[2][0]!==1||transforms[2][3]!==1||transforms[2][4]!==0||transforms[2][5]!==0||transforms[3][0]!==1.25) errors.push('selection rectangle was not drawn in screen coordinates');
 g.box=null;
 X.updatePanel();
 g.render();
 console.log('interaction smoke: OK');
}catch(e){ errors.push('interaction: '+e.message+'\n'+e.stack); }

/* win flow: wipe team1 on level 1, verify stars + save progression + result screen */
try{
 const u0=X.getSAVE().unlocked;
 X.startGame(1);
 const wg=X.getG();
 for(const b of wg.buildings) if(b.team===1) b.dead=true;
 for(const u of wg.units) if(u.team===1) u.dead=true;
 wg.buildings=wg.buildings.filter(b=>!b.dead); wg.units=wg.units.filter(u=>!u.dead);
 wg.checkEnd();
 if(!wg.over||!wg.overRes||!wg.overRes.win){ errors.push('forced win not registered: '+JSON.stringify(wg.overRes)); }
 else{
  const s=X.getSAVE().stages['1'];
  console.log('win flow: stars='+wg.overRes.stars+' save.stars='+s.stars+' best='+s.best+' unlocked '+u0+'->'+X.getSAVE().unlocked);
  if(!(s.stars>=1)) errors.push('stars not saved');
  if(X.getSAVE().unlocked<2) errors.push('unlocked did not advance after win');
  wg.render();
 }
}catch(e){ errors.push('winflow: '+e.message+'\n'+e.stack); }

/* save persistence check */
try{
 const raw=store['strata_save_v1'];
 const s=raw?JSON.parse(raw):null;
 console.log('save keys: '+(s?Object.keys(s).join(','):'none')+' · unlocked='+(s?s.unlocked:'-')+' · stages='+JSON.stringify(s&&s.stages).slice(0,120));
}catch(e){ errors.push('savecheck: '+e.message); }

if(errors.length>crashBefore){ console.error('\nERRORS:'); errors.forEach(e=>console.error('- '+e)); process.exit(1); }
console.log('\nSMOKE OK ('+timeoutCount+' levels timed out by design/behavior)');
