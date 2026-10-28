import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import * as physics from './physics.js';

// Exercise the app's pointer handlers with a minimal DOM; no browser dependency.
function setup(){
 const listeners=new Map(),nodes=new Map();
 function node(){return {children:[],dataset:{},style:{setProperty(){}},classList:{toggle(){}},setAttribute(k,v){this[k]=v;},append(n){this.children.push(n);},replaceChildren(){this.children=[];},addEventListener(k,fn){listeners.set(this.name+':'+k,fn);},setPointerCapture(){},getBoundingClientRect(){return {left:0,right:720,top:0,bottom:1000};},getScreenCTM(){return {a:1,b:0,inverse(){return this;}};},createSVGPoint(){return {matrixTransform(){return {x:this.x,y:this.y};}};}};}
 const document={querySelector(sel){if(!nodes.has(sel)){const n=node();n.name=sel;nodes.set(sel,n);}return nodes.get(sel);},querySelectorAll(){return [];},createElement:node,createElementNS:node,addEventListener(k,fn){listeners.set(k,fn);},body:node(),documentElement:node()};
 document.querySelector('#tray').getBoundingClientRect=()=>({left:800,right:1000,top:0,bottom:1000});
 const context=vm.createContext({...physics,document,window:{addEventListener(){}},innerWidth:1000,innerHeight:700,requestAnimationFrame(){},ResizeObserver:class{observe(){}}});
 vm.runInContext(readFileSync(new URL('./app.js',import.meta.url),'utf8').replace(/^import[^\n]*\n/,'')+'\nglobalThis.api={s,render};',context);
 const {s,render}=context.api;
 s.mode='weights';
 s.weights=[{id:1,pos:-4,item:'w20',mass:20},{id:2,pos:-4,item:'w10',mass:10},{id:3,pos:-4,item:'giftA',mass:75},{id:4,pos:4,item:'giftB',mass:200}];
 function event(id,x=240,y=245){return {target:{dataset:{drag:'weight',id:String(id)}},currentTarget:nodes.get('#scene'),pointerId:1,clientX:x,clientY:y,preventDefault(){}};}
 return {s,down(id){listeners.get('#scene:pointerdown')(event(id));},move(x,y=245){listeners.get('pointermove')(event(0,x,y));render();},up(x,y=245){listeners.get('pointerup')(event(0,x,y));},cancel(){listeners.get('pointercancel')();},preview(){return nodes.get('#scene').children.filter(n=>n['data-weight']==='preview');}};
}

test('top weight previews and moves the entire mixed chain on release',()=>{
 const a=setup();a.down(1);a.move(480);
 assert.equal(a.preview().length,3);
 assert.deepEqual(Array.from(a.s.weights,w=>w.pos),[-4,-4,-4,4]);
 a.up(480);
 assert.deepEqual(Array.from(a.s.weights,w=>w.id),[4,1,2,3]);
 assert.deepEqual(Array.from(a.s.weights,w=>w.pos),[4,4,4,4]);
 assert.equal(a.s.weights[3].mass,75);
});
test('middle weight still moves individually',()=>{
 const a=setup();a.down(2);a.move(360);assert.equal(a.preview().length,1);a.up(360);
 assert.deepEqual(Array.from(a.s.weights,w=>[w.id,w.pos]),[[1,-4],[3,-4],[4,4],[2,0]]);
});
test('returning the top weight returns the whole chain',()=>{
 const a=setup();a.down(1);a.move(850);a.up(850);
 assert.deepEqual(Array.from(a.s.weights,w=>w.id),[4]);
});
test('cancel and invalid drops preserve the original chain',()=>{
 for(const cancel of [true,false]){const a=setup();a.down(1);a.move(-80);if(cancel)a.cancel();else a.up(-80);assert.deepEqual(Array.from(a.s.weights,w=>[w.id,w.pos]),[[1,-4],[2,-4],[3,-4],[4,4]]);}
});
