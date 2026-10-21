import test from 'node:test';import assert from 'node:assert/strict';import{forcePhysics,weightTorque}from './physics.js';
test('垂直力、斜向力及零力矩',()=>{let p=forcePhysics(50,80,Math.PI/2,10);assert.ok(Math.abs(p.torque-3)<1e-9);assert.equal(p.direction,'順時針');assert.equal(forcePhysics(50,20,Math.PI/2,10).direction,'逆時針');assert.ok(forcePhysics(50,80,0,10).torque<1e-9);assert.equal(forcePhysics(50,50,1,10).arm,0);assert.ok(Math.abs(forcePhysics(50,80,Math.PI/6,10).arm-.15)<1e-9);});
test('多掛點力矩相加及不同砝碼數平衡',()=>{assert.equal(weightTorque([{pos:-2,count:2},{pos:4,count:1}]),0);assert.ok(weightTorque([{pos:-3,count:2},{pos:4,count:1}])<0);assert.equal(weightTorque([]),0);});

test('不同質量物品按實際質量計算力矩',()=>{assert.equal(weightTorque([{pos:-4,mass:75},{pos:3,mass:100}]),0);assert.equal(weightTorque([{pos:-2,mass:200},{pos:10,mass:20},{pos:10,mass:20}]),0);assert.ok(weightTorque([{pos:-2,mass:20},{pos:2,mass:10}])<0);});
