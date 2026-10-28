'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const keys=new Set();let level=0,deaths=0,elapsed=0,started=false,won=false,dead=0,particles=[],platforms=[],hazards=[],traps={},exitX=880,roomTime=0,acc=0,last=0;
let p={};const rect=(x,y,w,h,kind='solid')=>({x,y,w,h,kind,t:0});
function load(){p={x:40,y:410,w:24,h:28,vx:0,vy:0,ground:false,coyote:0,buffer:0};roomTime=0;traps={};exitX=880;dead=0;
if(level===0){platforms=[rect(0,460,270,80),rect(270,460,120,80,'crumble'),rect(390,460,570,80)];hazards=[rect(540,438,55,22),rect(715,438,55,22)];}
if(level===1){platforms=[rect(0,460,960,80),rect(380,354,90,16),rect(585,316,105,16)];hazards=[rect(265,438,50,22),rect(485,438,55,22)];}
if(level===2){platforms=[rect(0,460,230,80),rect(305,410,120,18),rect(490,355,120,18),rect(680,410,110,18),rect(845,460,115,80)];hazards=[];}
if(level===3){platforms=[rect(0,460,960,80)];hazards=[rect(235,438,50,22),rect(440,438,50,22),rect(655,438,50,22)];}
document.getElementById('status').textContent='';}
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function die(){if(dead||won)return;deaths++;dead=.32;for(let i=0;i<18;i++)particles.push({x:p.x+12,y:p.y+14,vx:(Math.random()-.5)*420,vy:(Math.random()-.7)*420,t:.5});}
function input(k){if(!keys.has(k)&&k==='Space'){if(won)return;p.buffer=.12;}keys.add(k);started=true;}
addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Space','KeyA','KeyD','KeyQ','KeyR'].includes(e.code)){e.preventDefault();if(e.code==='KeyR')reset();else input(e.code);}});
addEventListener('keyup',e=>{keys.delete(e.code);if(e.code==='Space'&&p.vy< -180)p.vy=-180;});
addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{keys.clear();last=0;});
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);input(b.dataset.key);});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>keys.delete(b.dataset.key));});
function reset(){level=deaths=elapsed=0;started=won=false;keys.clear();particles=[];load();canvas.focus();}document.getElementById('restart').onclick=reset;
function update(dt){for(const q of particles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=900*dt;q.t-=dt;}particles=particles.filter(q=>q.t>0);
if(won||!started)return;elapsed+=dt;if(dead){dead-=dt;if(dead<=0)load();return;}roomTime+=dt;
p.buffer=Math.max(0,p.buffer-dt);p.coyote=p.ground?.09:Math.max(0,p.coyote-dt);
let dir=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA')||keys.has('KeyQ'));p.vx=dir*255;
if(p.buffer>0&&p.coyote>0){p.vy=-570;p.buffer=0;p.coyote=0;p.ground=false;}
p.vy=Math.min(850,p.vy+1650*dt);
for(const b of platforms)if(b.kind==='crumble'&&b.t>0)b.t+=dt;
const solids=platforms.filter(b=>b.kind!=='crumble'||b.t<.27);
p.x+=p.vx*dt;for(const b of solids)if(overlap(p,b)){if(p.vx>0)p.x=b.x-p.w;else if(p.vx<0)p.x=b.x+b.w;}p.x=Math.max(0,Math.min(936,p.x));
p.y+=p.vy*dt;p.ground=false;for(const b of solids)if(overlap(p,b)){if(p.vy>0){p.y=b.y-p.h;p.ground=true;if(b.kind==='crumble'&&!b.t)b.t=.001;}else if(p.vy<0)p.y=b.y+b.h;p.vy=0;}
if(level===1){if(p.x>325&&!traps.pop)traps.pop=roomTime;if(traps.pop&&roomTime-traps.pop>.27){const h=rect(365,460-Math.min(85,(roomTime-traps.pop-.27)*500),38,85);if(overlap(p,h))die();}if(p.x>700&&!traps.fall)traps.fall=roomTime;if(traps.fall){const t=roomTime-traps.fall;const h=rect(755,Math.min(418,-60+Math.max(0,t-.35)*630),65,42);if(overlap(p,h))die();}}
if(level===2){if(p.x>280&&!traps.ceiling)traps.ceiling=roomTime;if(traps.ceiling){const t=roomTime-traps.ceiling;const h=rect(480,Math.min(260,-65+Math.max(0,t-.55)*430),140,45);if(overlap(p,h))die();}}
if(level===3){if(p.x>775&&!traps.exit){traps.exit=roomTime;exitX=60;}if(traps.exit){exitX=Math.max(60,880-(roomTime-traps.exit)*1100);}}
for(const h of hazards)if(overlap({x:p.x+3,y:p.y+3,w:p.w-6,h:p.h-3},h))die();if(p.y>580)die();
if(!dead&&overlap(p,rect(exitX,404,32,56))&&!(level===3&&traps.exit&&roomTime-traps.exit<.85)){if(level<3){level++;load();}else{won=true;document.getElementById('status').textContent='Terminé ! '+deaths+' morts · '+elapsed.toFixed(1)+' s';}}
}
function box(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}function spikes(h){ctx.fillStyle='#ff7979';for(let x=h.x;x<h.x+h.w;x+=14){ctx.beginPath();ctx.moveTo(x,h.y+h.h);ctx.lineTo(x+7,h.y);ctx.lineTo(Math.min(x+14,h.x+h.w),h.y+h.h);ctx.fill();}}
function draw(){ctx.clearRect(0,0,960,540);ctx.strokeStyle='#222936';ctx.lineWidth=1;for(let x=0;x<960;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,540);ctx.stroke();}for(let y=20;y<540;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}
ctx.fillStyle='#303a4d';ctx.font='bold 120px system-ui';ctx.fillText('0'+(level+1),36,148);ctx.font='12px monospace';ctx.fillStyle='#768298';ctx.fillText('PARCOURS / 04',43,174);
for(const b of platforms){if(b.kind==='crumble'&&b.t>=.27)continue;const shake=b.t?Math.sin(b.t*120)*2:0;box(b.x+shake,b.y,b.w,b.h,'#414d62');box(b.x+shake,b.y,b.w,3,'#8493ab');if(b.kind==='crumble'){ctx.strokeStyle='#242d3e';ctx.beginPath();ctx.moveTo(b.x+45,b.y+4);ctx.lineTo(b.x+59,b.y+16);ctx.lineTo(b.x+51,b.y+30);ctx.stroke();}}
for(const h of hazards)spikes(h);
if(level===1){if(traps.pop){let t=roomTime-traps.pop;if(t<.27)box(365,457,38,3,'#ffb077');else spikes(rect(365,460-Math.min(85,(t-.27)*500),38,85));}if(traps.fall){let t=roomTime-traps.fall;box(755,Math.min(418,-60+Math.max(0,t-.35)*630),65,42,'#ff7979');}box(775,32,25,3,'#ff7979');}
if(level===2&&traps.ceiling){let t=roomTime-traps.ceiling;box(480,Math.min(260,-65+Math.max(0,t-.55)*430),140,45,'#ff7979');}
ctx.strokeStyle='#d5ff70';ctx.lineWidth=3;ctx.strokeRect(exitX,404,32,54);box(exitX+23,430,4,4,'#d5ff70');ctx.fillStyle='#d5ff70';ctx.font='20px monospace';ctx.fillText('↓',exitX+10,393);
if(!dead){box(p.x,p.y,p.w,p.h,'#d5ff70');box(p.x+6,p.y+7,4,4,'#182319');box(p.x+15,p.y+7,4,4,'#182319');}
for(const q of particles){ctx.globalAlpha=Math.max(0,q.t*2);box(q.x,q.y,5,5,'#d5ff70');}ctx.globalAlpha=1;
if(!started||won){box(250,204,460,112,'#10131bea');ctx.textAlign='center';ctx.fillStyle='#eaece5';ctx.font='bold 28px system-ui';ctx.fillText(won?'Bien joué. Enfin.':'Atteins la porte.',480,249);ctx.fillStyle='#9da7b9';ctx.font='14px system-ui';ctx.fillText(won?'Les quatre salles sont terminées.':'←  → pour bouger · Espace pour sauter',480,283);ctx.textAlign='left';}
document.getElementById('stats').textContent=`SALLE ${level+1} / 4 · ${deaths} MORT${deaths>1?'S':''} · ${elapsed.toFixed(1)} s`;
}
function frame(t){if(!last)last=t;acc+=Math.min((t-last)/1000,.05);last=t;while(acc>=1/120){update(1/120);acc-=1/120;}draw();requestAnimationFrame(frame);}load();requestAnimationFrame(frame);
