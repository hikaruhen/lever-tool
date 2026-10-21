export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function forcePhysics(pivot,position,angle,force){const distance=(position-pivot)/100;const signed=distance*force*Math.sin(angle);return{arm:Math.abs(distance*Math.sin(angle)),torque:Math.abs(signed),direction:Math.abs(signed)<1e-8?'無轉動力矩':signed>0?'順時針':'逆時針'};}
export function weightTorque(weights){return weights.reduce((sum,w)=>sum+w.pos*w.count,0);}
