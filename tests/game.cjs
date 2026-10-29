// Deterministic full-room replays and checks against the actual game update loop.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const stub = {textContent: '', focus(){}, getContext(){return {}}, addEventListener(){}};
const context = vm.createContext({
  console, Math, Set,
  document: {getElementById(){return stub}, addEventListener(){}, querySelectorAll(){return []}},
  addEventListener(){}, requestAnimationFrame(){},
  routes: JSON.parse(fs.readFileSync(path.join(__dirname, 'routes.json'), 'utf8'))
});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist/game.js'), 'utf8'), context);

vm.runInContext(`
function check(ok,label){if(!ok)throw Error(label);console.log('PASS '+label);}
for(const route of routes){
 level=route.room;load();started=true;won=false;deaths=0;keys.clear();
 for(let frame=0;frame<route.frames;frame++){
  keys.delete('ArrowLeft');keys.delete('ArrowRight');keys.add(roomId()===5&&traps.exit?'ArrowLeft':'ArrowRight');
  if(route.jumps.includes(frame)){keys.delete('Space');input('Space');}update(STEP);
 }
 check(deaths===0&&(level!==route.room||won),'complete room '+(route.room+1));
}
reset();started=true;
for(const route of routes){
 for(let frame=0;frame<route.frames;frame++){
  keys.delete('ArrowLeft');keys.delete('ArrowRight');keys.add(roomId()===5&&traps.exit?'ArrowLeft':'ArrowRight');
  if(route.jumps.includes(frame)){keys.delete('Space');input('Space');}update(STEP);
 }
}
check(won&&deaths===0,'full campaign in progression order');
const groundRooms=[0,4,5,6];
for(const room of groundRooms){level=ROOM_ORDER.indexOf(room);load();check(platforms.filter(b=>b.y===460).reduce((n,b)=>n+b.w,0)===960,'continuous initial floor room '+(room+1));}
for(const room of [2,3,7]){level=ROOM_ORDER.indexOf(room);load();check(platforms.filter(b=>b.y===460).reduce((n,b)=>n+b.w,0)<450,'platform room '+(room+1));}
level=ROOM_ORDER.indexOf(1);load();started=true;won=false;deaths=0;keys.clear();
check(!platforms.some(b=>active(b)&&b.x<815&&b.x+b.w>730&&b.y===460),'visible gap in front of falling block');
p.x=690;p.y=432;p.support=platforms[0];for(let i=0;i<100&&!dead;i++)update(STEP);
check(deaths===1,'stopping before visible gap is punished by falling block');
for(const id of [2,7]){
 level=ROOM_ORDER.indexOf(id);load();deaths=0;keys.clear();
 const fake=platforms.find(b=>b.kind==='ghost');p.x=fake.x+fake.w/2-p.w/2;p.y=fake.y-p.h-4;p.vy=80;p.support=null;
 for(let i=0;i<180&&!dead;i++)update(STEP);
 check(deaths===1,'room '+(level+1)+': falling through fake without correction is fatal');
 level=ROOM_ORDER.indexOf(id);load();deaths=0;keys.clear();
 const fleeing=platforms.find(b=>b.kind==='dodge'),base=platforms[platforms.indexOf(fleeing)-1];
 p.x=base.x+base.w-p.w-6;p.y=base.y-p.h;p.vy=0;p.support=base;p.ground=true;
 const target=fleeing.ox+fleeing.w/2-p.w/2;p.buffer=.12;
 for(let i=0;i<240&&!dead;i++){keys.clear();if(p.x<target)keys.add('ArrowRight');update(STEP);}
 check(deaths===1,'room '+(level+1)+': aiming at original fleeing platform misses');
}
level=ROOM_ORDER.indexOf(7);load();deaths=0;keys.clear();let landingTrap=platforms.find(b=>b.kind==='vanish');
p.x=landingTrap.x+landingTrap.w/2-p.w/2;p.y=landingTrap.y-p.h-4;p.vy=80;p.support=null;
for(let i=0;i<180&&!dead;i++)update(STEP);
check(deaths===1,'vanishing platform does not drop player onto automatic safety net');
level=ROOM_ORDER.indexOf(0);load();started=true;won=false;keys.clear();let fragile=platforms[1];
p.x=300;p.y=432;p.support=fragile;p.ground=true;update(STEP);
check(active(fragile),'floor initially solid');for(let i=0;i<12;i++)update(STEP);
check(!active(fragile)&&p.y>432,'floor collapses within 100ms');
level=ROOM_ORDER.indexOf(2);load();let ghost=platforms.find(b=>b.kind==='ghost');
p.x=ghost.x+20;p.y=ghost.y-30;p.vy=100;p.support=null;
for(let i=0;i<15;i++)update(STEP);check(ghost.revealed&&p.y+p.h>ghost.y,'fake platform has no collision');
level=ROOM_ORDER.indexOf(2);load();let dodge=platforms.find(b=>b.kind==='dodge');p.x=dodge.x-75;p.y=dodge.y-20;p.vy=-300;p.support=null;
for(let i=0;i<30;i++)update(STEP);check(dodge.x>dodge.ox+30,'platform dodges approaching jump');
level=ROOM_ORDER.indexOf(7);load();let vanish=platforms.find(b=>b.kind==='vanish');p.x=vanish.x+20;p.y=vanish.y-65;p.vy=100;p.support=null;update(STEP);
check(!active(vanish),'landing trap vanishes immediately');
level=ROOM_ORDER.indexOf(3);load();deaths=0;p.x=530;p.y=327;p.support=platforms[2];for(let i=0;i<170;i++)update(STEP);
check(deaths>0,'crusher reaches player');
level=ROOM_ORDER.indexOf(4);load();p.x=200;p.y=432;update(STEP);check(!traps.overhead,'walking avoids overhead ambush');
p.vy=-300;p.support=null;update(STEP);check(!!traps.overhead,'jump activates overhead ambush');
level=ROOM_ORDER.indexOf(6);load();p.x=780;update(STEP);check(!active(platforms.find(b=>b.kind==='trapdoor')),'exit approach opens floor');
level=ROOM_ORDER.indexOf(5);load();p.x=790;for(let i=0;i<60;i++)update(STEP);
check(exitX===60&&roomId()===5,'door returns to start and does not collect player while moving');
p.x=880;p.y=432;update(STEP);check(roomId()===5,'old exit cannot finish room');
p.x=60;p.y=432;update(STEP);check(won,'return to start completes finale');
check(traps.doorFloor,'final return changes previously safe floor');
reset();started=true;p.y=600;update(STEP);check(deaths===1,'single death count');for(let i=0;i<50;i++)update(STEP);check(!dead&&p.x===35,'automatic respawn');
reset();check(!won&&!level&&!deaths&&!elapsed,'reset');
`,context);
const source=fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8');
const render=source.slice(source.indexOf(' for(const b of platforms)',source.indexOf('function draw()')),source.indexOf(' for(const h of hazards)',source.indexOf('function draw()')));
if(/globalAlpha|Math.sin|phase|revealed|crumble|blink|fillText/.test(render))throw Error('Platform rendering leaks a trap hint');
console.log('PASS uniform intact surfaces: no countdown, crack, tint or shaking');



