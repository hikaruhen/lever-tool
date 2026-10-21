export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function forcePhysics(pivot,position,angle,force){
 const distance=(position-pivot)/100;
 const sine=Math.sin(angle);
 const perpendicular=distance===0||Math.abs(sine)<1e-12?0:distance*sine;
 const arm=Math.abs(perpendicular),signed=perpendicular*force,torque=Math.abs(signed);
 return{arm,torque,direction:torque===0?'無轉動力矩':signed>0?'順時針':'逆時針'};
}
export function formatMeasure(value){return value.toFixed(1);}
export function snapForceAngle(angle){return Math.abs(Math.sin(angle))<Math.sin(Math.PI/120)?(Math.cos(angle)<0?Math.PI:0):angle;}
export function weightTorque(weights){return weights.reduce((sum,w)=>sum+w.pos*(w.mass!==undefined?w.mass/20:w.count),0);}
