import{clamp,forcePhysics,weightTorque}from './physics.js';
const $=s=>document.querySelector(s),svg=$('#scene');
const s={mode:'force',pivot:50,pos:80,angle:Math.PI/2,force:10,shown:false,weights:[],selected:null,adding:false,theta:0,velocity:0};
const X=p=>60+p*6,Y=190,ns='http://www.w3.org/2000/svg';let drag=null,last=0,id=0;
function el(tag,a={},text){const n=document.createElementNS(ns,tag);for(const[k,v]of Object.entries(a))n.setAttribute(k,v);if(text!==undefined)n.textContent=text;return n;}
function add(tag,a,t,parent=svg){const n=el(tag,a,t);parent.append(n);return n;}
function line(x1,y1,x2,y2,a={},p=svg){return add('line',{x1,y1,x2,y2,stroke:'#718791','stroke-width':2,...a},undefined,p);}
function text(x,y,t,a={},p=svg){return add('text',{x,y,'text-anchor':'middle',fill:'#294459','font-size':16,...a},t,p);}
function hit(cx,cy,r,kind,extra={}){return add('circle',{cx,cy,r,fill:'transparent','data-drag':kind,...extra});}
function beam(pivot,rotation=0){const px=X(pivot);add('rect',{x:px-68,y:378,width:136,height:16,rx:5,fill:'#456170'});add('rect',{x:px-6,y:Y,width:12,height:188,rx:4,fill:'#7d929b'});const g=add('g',{transform:`rotate(${rotation*180/Math.PI} ${px} ${Y})`});add('rect',{x:60,y:Y-12,width:600,height:24,rx:3,fill:'#edcf93',stroke:'#957a47'},undefined,g);for(let p=0;p<=100;p+=5){const distance=Math.abs(p-pivot),major=distance%10===0;line(X(p),Y-12,X(p),Y+(major?0:-5),{stroke:'#7d653d','stroke-width':1},g);if(major)text(X(p),Y+34,String(distance),{'font-size':13},g);}add('circle',{cx:px,cy:Y,r:10,fill:'#008b91',stroke:'white','stroke-width':3});return g;}
function render(){svg.replaceChildren();if(s.mode==='force'){svg.setAttribute('viewBox','0 0 720 440');svg.style.maxHeight='58vh';renderForce();}else renderWeights();}
function renderForce(){beam(s.pivot);const px=X(s.pos),dx=Math.cos(s.angle),dy=Math.sin(s.angle),edgeX=Math.abs(dx)<1e-6?1000:(dx>0?px-24:696-px)/Math.abs(dx),edgeY=Math.abs(dy)<1e-6?1000:(dy>0?Y-48:410-Y)/Math.abs(dy),len=Math.min(72+s.force*3,edgeX,edgeY),tail={x:px-dx*len,y:Y-dy*len};
 if(s.shown){const pivot=X(s.pivot),dot=(pivot-px)*dx,fx=px+dot*dx,fy=Y+dot*dy;line(px-dx*900,Y-dy*900,px+dx*900,Y+dy*900,{stroke:'#e68b35','stroke-dasharray':'7 7',opacity:.5});line(pivot,Y,fx,fy,{stroke:'#008b91','stroke-width':4,'stroke-dasharray':'6 5'});text((pivot+fx)/2+15,(Y+fy)/2+62,`力臂 ${(forcePhysics(s.pivot,s.pos,s.angle,s.force).arm*100).toFixed(1)} cm`,{fill:'#008b91','font-size':16});if(Math.hypot(pivot-fx,Y-fy)>12){const nx=(pivot-fx)/Math.hypot(pivot-fx,Y-fy),ny=(Y-fy)/Math.hypot(pivot-fx,Y-fy);add('path',{d:`M ${fx+dx*10} ${fy+dy*10} l ${nx*10} ${ny*10} l ${-dx*10} ${-dy*10}`,fill:'none',stroke:'#008b91'});}}
 line(tail.x,tail.y,px,Y,{stroke:'#f08024','stroke-width':7,'data-drag':'position'});add('polygon',{points:`${px},${Y} ${px-dx*20-dy*11},${Y-dy*20+dx*11} ${px-dx*20+dy*11},${Y-dy*20-dx*11}`,fill:'#f08024'});add('circle',{cx:tail.x,cy:tail.y,r:11,fill:'white',stroke:'#f08024','stroke-width':4});text(tail.x,tail.y-22,`${s.force} N`,{fill:'#d66a18','font-weight':700});hit(tail.x,tail.y,26,'angle');hit(px,Y,23,'position');hit(X(s.pivot),Y+65,30,'pivot');text(X(s.pivot),Y+75,'↔',{'font-size':28,fill:'#008b91'});text(670,420,'cm',{'font-size':13});}
function weightPoint(pos){const r=pos*30;return{x:360+r*Math.cos(s.theta),y:Y+r*Math.sin(s.theta)};}
function chainLayout(excludeId=null){
 const levels=new Map();return s.weights.filter(w=>w.id!==excludeId).map(w=>{const level=levels.get(w.pos)||0;levels.set(w.pos,level+1);const p=weightPoint(w.pos);return{...w,x:p.x,y:p.y+45+level*50};});
}
function drawWeight(x,y,{id,selected=false,preview=false}={}){
 const g=add('g',{'data-weight':id??'preview',opacity:preview?.65:1,'pointer-events':preview?'none':'auto'});
 add('path',{d:`M ${x-5} ${y-8} q -5 -12 4 -12 q 9 0 4 10 L ${x} ${y}`,fill:'none',stroke:preview?'#008b91':'#5e7684','stroke-width':3},undefined,g);
 add('rect',{x:x-21,y,width:42,height:30,rx:5,fill:preview?'#a8e5df':selected?'#a8d9d6':'#bac8d0',stroke:preview||selected?'#008b91':'#718895','stroke-width':2,'stroke-dasharray':preview?'5 3':''},undefined,g);
 text(x,y+20,'20 g',{'font-size':13},g);
 line(x,y+30,x,y+36,{stroke:'#718895'},g);
 if(!preview)hit(x,y+10,24,'weight',{'data-id':id});
}
function renderWeights(){
 const layout=chainLayout(),bottom=Math.max(440,...layout.map(w=>w.y+65));
 svg.setAttribute('viewBox',`0 0 720 ${bottom}`);svg.style.maxHeight='none';
 beam(50,s.theta);
 const positions=new Set();for(const w of layout){if(!positions.has(w.pos)){const p=weightPoint(w.pos);line(p.x,p.y+12,p.x,w.y-20,{stroke:'#485d68'});positions.add(w.pos);}drawWeight(w.x,w.y,{id:w.id,selected:w.id===s.selected});}
 if(drag&&['weight','new-weight'].includes(drag.kind)&&drag.moved){
  const p=drag.pointer;
  if(drag.valid){const pos=drag.previewPos,top=weightPoint(pos),others=chainLayout(drag.kind==='weight'?drag.id:null).filter(w=>w.pos===pos);const y=top.y+45+others.length*50;
   line(top.x,top.y-40,top.x,y+38,{stroke:'#008b91','stroke-width':3,'stroke-dasharray':'6 5',opacity:.6});
   add('circle',{cx:top.x,cy:top.y,r:15,fill:'#c6eeeb',stroke:'#008b91','stroke-width':3});
   drawWeight(top.x,y,{preview:true});text(top.x,top.y-53,`${Math.abs(pos)*5} cm`,{fill:'#008b91','font-size':21,'font-weight':700});
  }
 }
 if(s.adding)text(360,70,'點選刻度或砝碼下方，串掛一個砝碼',{fill:'#008b91'});
}
function ui(){const force=s.mode==='force';$('#force-controls').hidden=!force;$('#weight-controls').hidden=force;$('#hint').textContent=force?'拖曳箭尾圓點轉向 · 拖曳箭頭施力點或支點換位置':'逐顆拖曳串掛 · 虛線預示位置，放開後移動';$('#force-value').textContent=`${s.force} N`;$('#magnitude').value=s.force;$('#result').hidden=!s.shown;const p=forcePhysics(s.pivot,s.pos,s.angle,s.force);$('#result').innerHTML=`力臂 <strong>${p.arm.toFixed(3)} m</strong><br>力矩＝${p.arm.toFixed(3)} × ${s.force}≈<strong>${p.torque.toFixed(3)} N·m</strong><br>${p.direction}`;$('#remaining').textContent=`剩餘 ${20-total()} 個`;const w=s.weights.find(w=>w.id===s.selected);$('#selection').hidden=!w;if(w)$('#selected-label').textContent=`已選取一個 20 g 砝碼`;render();}
function total(){return s.weights.reduce((n,w)=>n+w.count,0);}
function place(pos){if(total()>=20)return;const w={id:++id,pos,count:1};s.weights.push(w);s.selected=w.id;s.adding=false;ui();}
function point(e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse());}
function snap(x){return clamp(Math.round((x-60)/30)*5,0,100);}
function weightPos(p){return clamp(Math.round((p.x-360)/(30*Math.cos(s.theta))),-10,10);}
const floating=document.createElement('div');floating.className='drag-weight';floating.textContent='20 g';floating.hidden=true;document.body.append(floating);
function previewDrop(e){
 const rect=svg.getBoundingClientRect(),tray=$('#tray').getBoundingClientRect();
 drag.returning=e.clientX>=tray.left&&e.clientX<=tray.right&&e.clientY>=tray.top&&e.clientY<=tray.bottom;
 drag.valid=e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom;
 drag.pointer=point(e);drag.previewPos=weightPos(drag.pointer);
 floating.hidden=!drag.moved;floating.style.left=`${e.clientX}px`;floating.style.top=`${e.clientY-48}px`;
 floating.classList.toggle('invalid',!drag.valid&&!drag.returning);floating.textContent=drag.returning?'放回砝碼盒':'20 g';
}
function startDrag(e,kind,idValue){e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);drag={kind,id:idValue,start:{x:e.clientX,y:e.clientY},moved:false,pointer:point(e),valid:false};if(kind==='weight')s.selected=idValue;}
svg.addEventListener('pointerdown',e=>{
 const p=point(e),kind=e.target.dataset.drag;
 if(s.mode==='weights'){
  if(s.adding){place(weightPos(p));return;}
  if(kind==='weight'){startDrag(e,kind,Number(e.target.dataset.id));ui();}return;
 }
 if(!kind)return;startDrag(e,kind,0);
});
$('#tray').addEventListener('pointerdown',e=>{if(total()<20)startDrag(e,'new-weight',0);});
let pendingFrame=false;
document.addEventListener('pointermove',e=>{
 if(!drag)return;drag.moved ||= Math.hypot(e.clientX-drag.start.x,e.clientY-drag.start.y)>7;
 if(['weight','new-weight'].includes(drag.kind)){previewDrop(e);if(!pendingFrame){pendingFrame=true;requestAnimationFrame(()=>{pendingFrame=false;if(drag)render();});}return;}
 const p=point(e);if(drag.kind==='angle')s.angle=Math.atan2(Y-p.y,X(s.pos)-p.x);if(drag.kind==='position')s.pos=snap(p.x);if(drag.kind==='pivot')s.pivot=snap(p.x);s.shown=false;ui();
});
document.addEventListener('pointerup',e=>{
 if(!drag)return;const d=drag;
 if(['weight','new-weight'].includes(d.kind)){
  previewDrop(e);
  if(d.moved){if(d.kind==='weight'){const w=s.weights.find(w=>w.id===d.id);if(w&&d.returning){s.weights=s.weights.filter(v=>v.id!==d.id);s.selected=null;}else if(w&&d.valid){w.pos=d.previewPos;s.weights=s.weights.filter(v=>v!==w).concat(w);}}else if(d.valid)place(d.previewPos);}
  else if(d.kind==='new-weight')s.adding=!s.adding;
 }
 drag=null;floating.hidden=true;ui();
});
document.addEventListener('pointercancel',()=>{drag=null;floating.hidden=true;ui();});
document.querySelectorAll('nav button').forEach(b=>b.onclick=()=>{s.mode=b.dataset.mode;s.adding=false;document.querySelectorAll('nav button').forEach(n=>n.classList.toggle('active',n===b));ui();});
function setForce(v){s.force=clamp(v,0,20);s.shown=false;ui();}$('#magnitude').oninput=e=>setForce(Number(e.target.value));$('#less').onclick=()=>setForce(s.force-.5);$('#more').onclick=()=>setForce(s.force+.5);$('#show').onclick=()=>{s.shown=true;ui();};$('#reset-force').onclick=()=>{Object.assign(s,{pivot:50,pos:80,angle:Math.PI/2,force:10,shown:false});ui();};
$('#remove').onclick=()=>{s.weights=s.weights.filter(w=>w.id!==s.selected);s.selected=null;ui();};$('#reset-weights').onclick=()=>{s.weights=[];s.selected=null;s.adding=false;s.theta=0;s.velocity=0;ui();};
function animate(now){const dt=Math.min((now-last)/1000||.016,.033);last=now;if(s.mode==='weights'&&!drag){const torque=weightTorque(s.weights);const target=torque===0?0:Math.sign(torque)*.20;const a=22*(target-s.theta)-4.5*s.velocity;s.velocity+=a*dt;s.theta+=s.velocity*dt;if(Math.abs(s.theta-target)<.0001&&Math.abs(s.velocity)<.0001){s.theta=target;s.velocity=0;}if(!drag)render();}requestAnimationFrame(animate);}ui();requestAnimationFrame(animate);
