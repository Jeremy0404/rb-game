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
function check(ok, label) { if (!ok) throw Error(label); console.log('PASS ' + label); }
for (const route of routes) {
  level=route.room;load();started=true;won=false;deaths=0;keys.clear();keys.add('ArrowRight');
  for (let frame=0;frame<route.frames;frame++) {
    if (route.jumps.includes(frame)) {keys.delete('Space');input('Space');}
    update(STEP);
  }
  check(deaths===0 && (level!==route.room || won), 'complete room '+(route.room+1));
}
for (let room=0;room<TOTAL;room++) {
  level=room;load();started=true;won=false;deaths=0;keys.clear();keys.add('ArrowRight');
  for (let i=0;i<300&&!dead;i++) update(STEP);
  check(deaths>0, 'platform route required in room '+(room+1));
}
level=0;load();started=true;keys.clear();let ghost=platforms.find(b=>b.kind==='ghost');
p.x=ghost.x+20;p.y=ghost.y-30;p.vy=100;p.support=null;
for(let i=0;i<15;i++)update(STEP);
check(ghost.revealed&&p.y+p.h>ghost.y&&!p.ground,'fall through fake platform');
level=1;load();p.x=145;p.y=400;p.vy=-300;p.support=null;
let dodge=platforms.find(b=>b.kind==='dodge');for(let i=0;i<30;i++)update(STEP);
check(dodge.x>dodge.ox+40,'platform escapes during jump');
level=0;load();let fragile=platforms.find(b=>b.kind==='crumble');
p.x=fragile.x+10;p.y=fragile.y-28;p.vy=0;p.support=fragile;p.ground=true;
for(let i=0;i<50;i++)update(STEP);
check(!active(fragile)&&p.y+p.h>fragile.y,'fragile platform removes collision');
level=3;load();let moving=platforms[1];p.x=moving.x+20;p.y=moving.y-28;p.support=moving;
const offset=p.x-moving.x;for(let i=0;i<40;i++)update(STEP);
check(Math.abs(p.x-moving.x-offset)<.01&&p.ground,'moving platform carries player');
level=4;load();let timed=platforms[1];roomTime=2;check(!active(timed),'timed platform disappears');
roomTime=2.7;check(active(timed),'timed platform returns');
level=2;load();deaths=0;p.x=530;p.y=327;p.support=platforms[2];
for(let i=0;i<170;i++)update(STEP);
check(deaths>0,'crusher reaches player on platform');
level=3;load();deaths=0;updateHazards();p.x=hazards[0].x;p.y=hazards[0].y;p.support=null;update(STEP);
check(deaths===1,'saw collision kills');
level=4;load();roomTime=1.5;deaths=0;p.x=580;p.y=407;p.support=platforms[3];update(STEP);
check(deaths===1,'retractable spikes kill');
level=5;load();p.x=800;for(let i=0;i<30;i++)update(STEP);
check(exitX===918,'final exit escapes');
reset();started=true;p.y=600;update(STEP);check(deaths===1,'death counted once');
for(let i=0;i<50;i++)update(STEP);check(!dead&&p.x===35,'automatic respawn');
reset();check(!won&&!level&&!deaths&&!elapsed,'complete reset');
`, context);
