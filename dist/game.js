'use strict';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const ROOM_ORDER=[0,3,2,6,1,4,7,5];
const roomId=()=>ROOM_ORDER[level];
const keys=new Set(),TOTAL=ROOM_ORDER.length,CRUMBLE_DELAY=.09,STEP=1/120;
let level=0,deaths=0,elapsed=0,started=false,won=false,dead=0,particles=[],platforms=[],hazards=[],traps={},exitX=880,exitY=404,roomTime=0,acc=0,last=0,p={};
const rect=(x,y,w,h,kind='solid',options={})=>({x,y,w,h,kind,ox:x,oy:y,t:0,dx:0,dy:0,...options});
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function load(){
 p={x:35,y:432,w:24,h:28,vx:0,vy:0,ground:true,coyote:.09,buffer:0,support:null};
 roomTime=0;traps={};dead=0;hazards=[];exitX=895;exitY=404;
 // Keep room identities stable while ordering them by learning and combinations.
 if(roomId()===0){platforms=[rect(0,460,270,80),rect(270,460,90,80,'crumble'),rect(360,460,600,80)];}
 if(roomId()===1){platforms=[rect(0,460,730,80),rect(815,460,145,80),rect(380,354,90,16),rect(585,316,105,16)];}
 if(roomId()===2){platforms=[rect(0,460,200,80),rect(255,415,130,18),rect(420,365,130,18,'ghost'),rect(335,455,85,18),rect(570,430,120,18),rect(710,385,90,18,'dodge',{shift:110}),rect(830,325,130,215)];exitY=269;}
 if(roomId()===3){platforms=[rect(0,460,230,80),rect(305,410,120,18),rect(490,355,120,18),rect(680,410,110,18),rect(845,460,115,80)];}
 if(roomId()===4){platforms=[rect(0,460,355,80),rect(355,460,110,80,'crumble'),rect(465,460,205,80),rect(670,460,105,80,'crumble'),rect(775,460,185,80)];}
 if(roomId()===5){platforms=[rect(0,460,110,80),rect(110,460,50,80,'trapdoor'),rect(160,460,800,80)];exitX=880;}
 if(roomId()===6){platforms=[rect(0,460,180,80),rect(180,460,115,80,'crumble'),rect(295,460,245,80),rect(540,460,110,80,'crumble'),rect(650,460,155,80),rect(805,460,95,80,'trapdoor'),rect(900,460,60,80)];exitX=922;}
 if(roomId()===7){platforms=[rect(0,460,220,80),rect(225,410,90,18,'dodge',{shift:110}),rect(470,360,110,18,'ghost'),rect(400,465,70,18),rect(580,435,100,18),rect(700,385,90,18,'vanish'),rect(635,480,90,18),rect(805,425,155,115)];exitY=369;}
 p.support=platforms[0];updateHazards();document.getElementById('status').textContent='';
}
function active(b){return b.kind!=='ghost'&&!(b.kind==='crumble'&&b.t>=CRUMBLE_DELAY)&&!(b.kind==='vanish'&&b.t>0)&&!(b.kind==='trapdoor'&&traps.doorFloor);}
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
 if(b.kind==='vanish'&&!b.t&&p.vy>0&&p.x+p.w>b.x&&p.x<b.x+b.w&&p.y+p.h>b.y-55)b.t=roomTime;
 if(b.kind==='moving'){const wave=Math.sin(roomTime*b.speed+(b.phase||0))*b.amp;if(b.vertical)b.y=b.oy+wave;else b.x=b.ox+wave;}
 if(b.kind==='dodge'){if(!b.t&&p.vy<0&&p.x+p.w>b.ox-100&&p.x<b.ox+b.w)b.t=roomTime;if(b.t)b.x=b.ox+b.shift*Math.min(1,(roomTime-b.t)/.17);}
 b.dx=b.x-x;b.dy=b.y-y;
 }}
function updateHazards(){hazards=[];
 if(roomId()===0)hazards.push(rect(620,438,40,22,'spikes'));
 if(roomId()===1){
  hazards.push(rect(265,438,50,22,'spikes'),rect(550,438,55,22,'spikes'));
  if(p.x>325&&!traps.pop)traps.pop=roomTime;
  if(traps.pop&&roomTime-traps.pop>.12)hazards.push(rect(375,438,24,22,'spikes'));
  if(p.x>660&&!traps.fall)traps.fall=roomTime;
  if(traps.fall)hazards.push(rect(675,Math.min(418,-60+Math.max(0,roomTime-traps.fall-.12)*1350),55,42,'crusher'));
 }
 if(roomId()===3){if(p.x>470&&!traps.ceiling)traps.ceiling=roomTime;if(traps.ceiling)hazards.push(rect(480,Math.min(310,-65+Math.max(0,roomTime-traps.ceiling-.70)*1150),140,45,'crusher'));}
 // A jump that looks sensible trips an overhead ambush. Walking underneath is safe.
 if(roomId()===4){if(p.x>155&&p.x<290&&p.vy<0&&!traps.overhead)traps.overhead=roomTime;
  if(traps.overhead)hazards.push(rect(155,348,150,25,'crusher'));
  if(p.x>510&&!traps.pop)traps.pop=roomTime;
  if(traps.pop&&roomTime-traps.pop>.10)hazards.push(rect(555,432,42,28,'spikes'));
 }
 if(roomId()===5){hazards.push(rect(235,438,50,22,'spikes'),rect(440,438,50,22,'spikes'),rect(655,438,50,22,'spikes'));
  if(p.x>775&&!traps.exit)traps.exit=roomTime;
  if(traps.exit){exitX=Math.max(60,880-(roomTime-traps.exit)*2400);if(p.x<195)traps.doorFloor=true;}
 }
 if(roomId()===6){if(p.x>775)traps.doorFloor=true;hazards.push(rect(390,438,42,22,'spikes'));}
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
 if(!dead&&!(roomId()===5&&(!traps.exit||exitX>60))&&overlap(p,rect(exitX,exitY,30,56))){if(level<TOTAL-1){level++;load();}else{won=true;burst(p.x,p.y,'#d5ff70');document.getElementById('status').textContent=`Terminé · ${deaths} morts · ${elapsed.toFixed(1)} s`;}}
}
function box(x,y,w,h,color){ctx.fillStyle=color;ctx.fillRect(x,y,w,h);}
function spikes(h){ctx.fillStyle='#ff7979';for(let x=h.x;x<h.x+h.w;x+=14){ctx.beginPath();ctx.moveTo(x,h.y+h.h);ctx.lineTo(x+7,h.y);ctx.lineTo(Math.min(x+14,h.x+h.w),h.y+h.h);ctx.fill();}}
function draw(){ctx.clearRect(0,0,960,540);ctx.strokeStyle='#222936';ctx.lineWidth=1;
 for(let x=0;x<960;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,540);ctx.stroke();}for(let y=20;y<540;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(960,y);ctx.stroke();}
 ctx.fillStyle='#303a4d';ctx.font='bold 100px system-ui';ctx.fillText('0'+(level+1),36,130);
 for(let i=0;i<TOTAL;i++)box(40+i*22,150,14,3,i<=level?'#d5ff70':'#394355');
 spikes(rect(0,528,960,12));
 for(const b of platforms){
  // Same appearance for all intact surfaces: no cracks, flash, tint or countdown.
  if(!active(b)&&b.kind!=='ghost')continue;
  box(b.x,b.y,b.w,b.h,'#414d62');box(b.x,b.y,b.w,3,'#8493ab');
 }
 for(const h of hazards){if(h.kind==='spikes')spikes(h);else if(h.kind==='saw'){ctx.save();ctx.translate(h.x+14,h.y+14);ctx.rotate(roomTime*6);ctx.fillStyle='#ff7979';for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.fillRect(-3,-18,6,36);}ctx.fillStyle='#171c27';ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill();ctx.restore();}else{box(h.x,h.y,h.w,h.h,'#ff7979');spikes(rect(h.x,h.y+h.h-10,h.w,10));}}
 ctx.strokeStyle='#d5ff70';ctx.lineWidth=3;ctx.strokeRect(exitX,exitY,30,54);box(exitX+22,exitY+27,4,4,'#d5ff70');ctx.fillStyle='#d5ff70';ctx.font='20px monospace';ctx.fillText('↓',exitX+9,exitY-10);
 if(!dead){box(p.x,p.y,p.w,p.h,'#d5ff70');box(p.x+6,p.y+7,4,4,'#182319');box(p.x+15,p.y+7,4,4,'#182319');}
 for(const q of particles){ctx.globalAlpha=Math.max(0,q.t*2);box(q.x,q.y,5,5,q.color);}ctx.globalAlpha=1;
 if(!started||won){box(260,200,440,95,'#10131bea');ctx.textAlign='center';ctx.fillStyle='#eaece5';ctx.font='bold 25px system-ui';ctx.fillText(won?'Terminé.':'←  →  +  Espace',480,240);ctx.fillStyle='#9da7b9';ctx.font='14px system-ui';ctx.fillText(won?`${deaths} morts · ${elapsed.toFixed(1)} s`:'Atteins la porte.',480,272);ctx.textAlign='left';}
 document.getElementById('stats').textContent=`${level+1} / ${TOTAL} · ${deaths} MORT${deaths>1?'S':''} · ${elapsed.toFixed(1)} s`;
}
function frame(t){if(!last)last=t;acc+=Math.min((t-last)/1000,.05);last=t;while(acc>=STEP){update(STEP);acc-=STEP;}draw();requestAnimationFrame(frame);}load();requestAnimationFrame(frame);






