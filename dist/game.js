'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const keys=new Set(),TOTAL=6,STEP=1/120;
let level=0,deaths=0,elapsed=0,started=false,won=false,dead=0,particles=[],platforms=[],hazards=[],traps={},exitX=880,exitY=404,roomTime=0,acc=0,last=0,p={};
const rect=(x,y,w,h,kind='solid',options={})=>({x,y,w,h,kind,ox:x,oy:y,t:0,dx:0,dy:0,...options});
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function load(){
 p={x:35,y:432,w:24,h:28,vx:0,vy:0,ground:true,coyote:.09,buffer:0,support:null};
 roomTime=0;traps={};dead=0;hazards=[];exitX=895;exitY=404;
 if(level===0){platforms=[rect(0,460,170,80),rect(235,420,80,18,'crumble'),rect(375,375,80,18,'ghost'),rect(365,465,75,18),rect(515,405,90,18,'moving',{amp:24,speed:1.8}),rect(660,360,75,18,'crumble'),rect(810,410,150,130)];exitY=354;}
 if(level===1){platforms=[rect(0,460,170,80),rect(225,425,85,18,'dodge',{shift:50}),rect(425,385,80,18),rect(565,345,80,18,'ghost'),rect(565,460,80,18,'crumble'),rect(715,395,85,18,'dodge',{shift:30}),rect(875,460,85,80)];}
 if(level===2){platforms=[rect(0,460,195,80),rect(275,410,95,18,'crumble'),rect(490,355,120,18),rect(685,410,80,18,'moving',{amp:22,speed:2}),rect(845,460,115,80)];}
 if(level===3){platforms=[rect(0,460,145,80),rect(215,415,85,18,'moving',{amp:38,speed:1.7}),rect(405,365,85,18,'moving',{amp:30,speed:2,phase:1}),rect(575,415,90,18,'moving',{vertical:true,amp:32,speed:1.5}),rect(745,365,70,18,'crumble'),rect(880,430,80,110)];exitY=374;}
 if(level===4){platforms=[rect(0,460,170,80),rect(245,420,90,18,'blink',{period:2.6,on:1.8}),rect(405,375,80,18,'blink',{period:2.6,on:1.8,phase:1.2}),rect(560,435,85,18,'crumble'),rect(705,380,80,18,'blink',{period:2.6,on:1.8,phase:.5}),rect(860,440,100,100)];exitY=384;}
 if(level===5){platforms=[rect(0,460,150,80),rect(220,420,80,18,'crumble'),rect(355,375,85,18,'ghost'),rect(365,465,75,18),rect(505,405,85,18,'dodge',{shift:35}),rect(680,355,75,18,'moving',{amp:24,speed:2}),rect(820,420,140,120)];exitX=830;exitY=364;}
 p.support=platforms[0];document.getElementById('status').textContent='';
}
function active(b){return b.kind!=='ghost'&&!(b.kind==='crumble'&&b.t>=.32)&&!(b.kind==='blink'&&(roomTime+(b.phase||0))%b.period>=b.on);}
function burst(x,y,color){for(let i=0;i<16;i++)particles.push({x,y,vx:(Math.random()-.5)*380,vy:(Math.random()-.7)*380,t:.45,color});}
function die(){if(dead||won)return;deaths++;dead=.32;burst(p.x+12,p.y+14,'#d5ff70');}
function input(k){if(!keys.has(k)&&k==='Space'&&!won)p.buffer=.12;keys.add(k);started=true;}
function release(k){keys.delete(k);if(k==='Space'&&p.vy< -180)p.vy=-180;}
addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','Space','KeyA','KeyD','KeyQ','KeyR'].includes(e.code)){e.preventDefault();if(e.code==='KeyR'&&!e.repeat)reset();else input(e.code);}});
addEventListener('keyup',e=>release(e.code));addEventListener('blur',()=>keys.clear());document.addEventListener('visibilitychange',()=>{keys.clear();last=0;acc=0;});
document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);input(b.dataset.key);});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>release(b.dataset.key));});
function reset(){level=deaths=elapsed=0;started=won=false;keys.clear();particles=[];load();canvas.focus();}document.getElementById('restart').onclick=reset;
function updatePlatforms(dt){for(const b of platforms){const x=b.x,y=b.y;
 if(b.kind==='crumble'&&b.t>0)b.t+=dt;
 if(b.kind==='moving'){const wave=Math.sin(roomTime*b.speed+(b.phase||0))*b.amp;if(b.vertical)b.y=b.oy+wave;else b.x=b.ox+wave;}
 if(b.kind==='dodge'){if(!b.t&&p.vy<0&&p.x+p.w>b.ox-100&&p.x<b.ox+b.w)b.t=roomTime;if(b.t)b.x=b.ox+b.shift*Math.min(1,(roomTime-b.t)/.17);}
 b.dx=b.x-x;b.dy=b.y-y;
 }}
function updateHazards(){hazards=[];
 if(level===2){if(p.x>470&&!traps.ceiling)traps.ceiling=roomTime;if(traps.ceiling){const t=roomTime-traps.ceiling;const y=Math.min(310,-65+Math.max(0,t-.48)*1150);hazards.push(rect(480,y,140,45,'crusher'));}}
 if(level===3)hazards.push(rect(540,280+Math.sin(roomTime*2.2)*48,28,28,'saw'));
 if(level===4){const phase=roomTime%2.4;if(phase>1.3)hazards.push(rect(578,407,36,28,'spikes'));traps.spikeWarning=phase>1.03&&phase<=1.3;}
 if(level===5){if(p.x>765&&!traps.exit)traps.exit=roomTime;if(traps.exit)exitX=830+Math.min(1,(roomTime-traps.exit)/.2)*88;}
}
function update(dt){
 for(const q of particles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=900*dt;q.t-=dt;}particles=particles.filter(q=>q.t>0);
 if(won||!started)return;elapsed+=dt;if(dead){dead-=dt;if(dead<=0)load();return;}roomTime+=dt;
 updatePlatforms(dt);updateHazards();
 if(p.support&&active(p.support)){p.x+=p.support.dx;p.y+=p.support.dy;}else{p.support=null;p.ground=false;}
 p.buffer=Math.max(0,p.buffer-dt);p.coyote=p.ground?.085:Math.max(0,p.coyote-dt);
 p.vx=(Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA')||keys.has('KeyQ')))*255;
 if(p.buffer>0&&p.coyote>0){p.vy=-570;p.buffer=0;p.coyote=0;p.ground=false;p.support=null;}
 p.vy=Math.min(850,p.vy+1650*dt);
 p.x=Math.max(0,Math.min(936,p.x+p.vx*dt));const previousBottom=p.y+p.h;p.y+=p.vy*dt;p.ground=false;p.support=null;
 // Top-only collision keeps jumps from below and moving platforms predictable.
 for(const b of platforms){if(p.vy>=0&&p.x+p.w>b.x&&p.x<b.x+b.w&&previousBottom<=b.y-b.dy+1&&p.y+p.h>=b.y){
  if(b.kind==='ghost'){b.revealed=true;continue;}if(!active(b))continue;
  p.y=b.y-p.h;p.vy=0;p.ground=true;p.support=b;if(b.kind==='crumble'&&!b.t)b.t=.001;
 }}
 for(const h of hazards)if(overlap({x:p.x+2,y:p.y+2,w:p.w-4,h:p.h-2},h))die();if(p.y+p.h>528)die();
 if(!dead&&overlap(p,rect(exitX,exitY,30,56))){if(level<TOTAL-1){level++;load();}else{won=true;burst(p.x,p.y,'#d5ff70');document.getElementById('status').textContent=`Terminé · ${deaths} morts · ${elapsed.toFixed(1)} s`;}}
}
function box(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
function spikes(h){ctx.fillStyle='#ff7979';for(let x=h.x;x<h.x+h.w;x+=14){ctx.beginPath();ctx.moveTo(x,h.y+h.h);ctx.lineTo(x+7,h.y);ctx.lineTo(Math.min(x+14,h.x+h.w),h.y+h.h);ctx.fill();}}
function draw(){ctx.clearRect(0,0,960,540);ctx.strokeStyle='#222936';ctx.lineWidth=1;
 for(let x=0;x<960;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,540);ctx.stroke();}for(let y=20;y<540;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}
 ctx.fillStyle='#303a4d';ctx.font='bold 100px system-ui';ctx.fillText('0'+(level+1),36,130);
 for(let i=0;i<TOTAL;i++)box(40+i*22,150,14,3,i<=level?'#d5ff70':'#394355');
 spikes(rect(0,528,960,12));
 for(const b of platforms){if(b.kind==='crumble'&&b.t>=.32)continue;
  const hidden=!active(b)&&b.kind!=='ghost',ghost=b.kind==='ghost'&&b.revealed;
  ctx.globalAlpha=hidden?.15:ghost?.22:1;const shake=b.kind==='crumble'&&b.t?Math.sin(b.t*130)*2:0;
  box(b.x+shake,b.y,b.w,b.h,'#414d62');box(b.x+shake,b.y,b.w,3,b.kind==='moving'?'#9baac4':'#8493ab');
  if(b.kind==='crumble'){ctx.strokeStyle='#252e3f';ctx.beginPath();ctx.moveTo(b.x+25,b.y+3);ctx.lineTo(b.x+38,b.y+9);ctx.lineTo(b.x+31,b.y+17);ctx.stroke();}
  if(b.kind==='blink'){const phase=(roomTime+(b.phase||0))%b.period;box(b.x,b.y+b.h-3,b.w*(phase<b.on?1-phase/b.on:(phase-b.on)/(b.period-b.on)),3,'#b69aff');}ctx.globalAlpha=1;
 }
 if(level===2){box(480,0,140,6,'#ff7979');if(traps.ceiling&&roomTime-traps.ceiling<.48){ctx.globalAlpha=.15;box(480,6,140,349,'#ff7979');ctx.globalAlpha=1;}}
 if(traps.spikeWarning)box(578,432,36,3,'#ffb077');
 for(const h of hazards){if(h.kind==='spikes')spikes(h);else if(h.kind==='saw'){ctx.save();ctx.translate(h.x+14,h.y+14);ctx.rotate(roomTime*6);ctx.fillStyle='#ff7979';for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.fillRect(-3,-18,6,36);}ctx.fillStyle='#171c27';ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();ctx.restore();}else{box(h.x,h.y,h.w,h.h,'#ff7979');spikes(rect(h.x,h.y+h.h-10,h.w,10));}}
 ctx.strokeStyle='#d5ff70';ctx.lineWidth=3;ctx.strokeRect(exitX,exitY,30,54);box(exitX+22,exitY+27,4,4,'#d5ff70');ctx.fillStyle='#d5ff70';ctx.font='20px monospace';ctx.fillText('↓',exitX+9,exitY-10);
 if(!dead){box(p.x,p.y,p.w,p.h,'#d5ff70');box(p.x+6,p.y+7,4,4,'#182319');box(p.x+15,p.y+7,4,4,'#182319');}
 for(const q of particles){ctx.globalAlpha=Math.max(0,q.t*2);box(q.x,q.y,5,5,q.color);}ctx.globalAlpha=1;
 if(!started||won){box(260,200,440,95,'#10131bea');ctx.textAlign='center';ctx.fillStyle='#eaece5';ctx.font='bold 25px system-ui';ctx.fillText(won?'Terminé.':'←  →  +  Espace',480,240);ctx.fillStyle='#9da7b9';ctx.font='14px system-ui';ctx.fillText(won?`${deaths} morts · ${elapsed.toFixed(1)} s`:'Atteins la porte.',480,272);ctx.textAlign='left';}
 document.getElementById('stats').textContent=`${level+1} / ${TOTAL} · ${deaths} MORT${deaths>1?'S':''} · ${elapsed.toFixed(1)} s`;
}
function frame(t){if(!last)last=t;acc+=Math.min((t-last)/1000,.05);last=t;while(acc>=STEP){update(STEP);acc-=STEP;}draw();requestAnimationFrame(frame);}load();requestAnimationFrame(frame);
