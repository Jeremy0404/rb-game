const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
function element(key){
 const handlers={};
 return {dataset:{key},hidden:false,value:'auto',clientWidth:800,clientHeight:300,
  classList:{toggle(){},contains(){return false}},style:{setProperty(){}},
  focus(){},matches(){return false},getContext(){return {}},setPointerCapture(){},
  getBoundingClientRect(){const left=key==='ArrowLeft'?0:70;return {left,right:left+60,top:0,bottom:64};},
  addEventListener(name,fn){handlers[name]=fn;},
  fire(name,event={}){handlers[name]?.({preventDefault(){},button:0,...event});}
 };
}
const elements=new Map();
const buttons=['ArrowLeft','ArrowRight','Space'].map(element);
const documentEvents={},windowEvents={},queries=new Map();
const document={hidden:false,body:element(),documentElement:element(),
 getElementById(id){if(!elements.has(id))elements.set(id,element());return elements.get(id);},
 querySelectorAll(){return buttons;},addEventListener(name,fn){documentEvents[name]=fn;}
};
const context=vm.createContext({document,console,requestAnimationFrame(){},
 addEventListener(name,fn){windowEvents[name]=fn;},
 matchMedia(query){const media={matches:false,addEventListener(name,fn){this.change=fn;}};queries.set(query,media);return media;},
 ResizeObserver:class{observe(){}}
});
for(const file of ['game.js','controls.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'../public',file),'utf8'),context);
const run=code=>vm.runInContext(code,context);
const pressed=key=>run(`keys.has('${key}')`);
const down=(index,id)=>buttons[index].fire('pointerdown',{pointerId:id});
const up=(index,id,event='pointerup')=>buttons[index].fire(event,{pointerId:id});
const key=(code,type='keydown')=>windowEvents[type]({code,target:document.body,preventDefault(){}});
const check=(condition,label)=>{assert.ok(condition,label);console.log('PASS '+label);};
run('reset()');down(1,1);down(2,2);run('update(STEP)');
check(run('p.x>35&&p.vy<0'),'two fingers move and jump together');
up(1,1);check(pressed('Space')&&!pressed('ArrowRight'),'releasing direction preserves jump');
up(2,2);check(run('p.vy===-180'),'releasing final jump contact shortens jump');
run('reset()');down(2,1);down(2,2);run('update(STEP)');up(2,1);
check(pressed('Space')&&run('p.vy < -180'),'one of two jump contacts cannot release the other');
up(2,2,'pointercancel');check(!pressed('Space')&&run('p.vy===-180'),'last cancelled contact releases jump');
up(2,2,'lostpointercapture');check(!pressed('Space'),'capture cleanup is idempotent');
run('reset()');key('KeyD');down(1,1);up(1,1);
check(pressed('ArrowRight'),'touch release preserves keyboard source');key('KeyD','keyup');
check(!pressed('ArrowRight'),'last keyboard source releases movement');
key('KeyA');key('ArrowLeft');key('KeyA','keyup');
check(pressed('ArrowLeft'),'keyboard aliases aggregate');key('ArrowLeft','keyup');
run('reset()');down(0,1);buttons[0].fire('pointermove',{pointerId:1,clientX:90,clientY:30});
check(pressed('ArrowRight')&&!pressed('ArrowLeft'),'captured pointer slides between directions');
buttons[0].fire('pointermove',{pointerId:1,clientX:160,clientY:30});
check(!pressed('ArrowRight'),'leaving direction region releases movement');
run('reset()');down(0,1);down(1,2);run('update(STEP)');
check(run('p.x===35'),'opposing directions neutralize');up(0,1);run('update(STEP)');
check(run('p.x>35'),'remaining direction resumes immediately');
run('reset()');down(2,1);run('for(let i=0;i<100;i++)update(STEP)');
check(run('p.ground&&p.buffer===0'),'holding jump does not auto-jump on landing');
run('reset()');down(1,1);down(2,2);run('update(STEP)');windowEvents.blur();
const frozen=run('JSON.stringify([p.x,p.y,p.vy,elapsed,roomTime,dead])');
run('for(let i=0;i<120;i++)update(STEP)');
check(run('paused&&keys.size===0&&p.buffer===0')&&frozen===run('JSON.stringify([p.x,p.y,p.vy,elapsed,roomTime,dead])'),'blur freezes world and timer, clears buffered input');
buttons[1].fire('pointermove',{pointerId:1,clientX:90,clientY:30});
check(!pressed('ArrowRight'),'old contact cannot reactivate during pause');
elements.get('resume').onclick();run('update(STEP)');
check(!pressed('ArrowRight')&&!pressed('Space')&&run('!paused'),'resume needs fresh contacts');
down(1,3);document.hidden=true;documentEvents.visibilitychange();elements.get('resume').onclick();
check(run('paused'),'hidden page cannot resume');document.hidden=false;documentEvents.visibilitychange();
check(run('paused'),'visible page waits for explicit resume');elements.get('resume').onclick();
queries.get('(orientation:landscape)').change();check(run('paused'),'orientation change pauses');
elements.get('resume').onclick();run('die()');const deathTimer=run('dead');windowEvents.blur();run('update(1)');
check(run('dead')===deathTimer,'death countdown freezes while paused');
elements.get('restart-menu').onclick();check(run('!paused&&!started&&!deaths&&!elapsed'),'restart clears pause and campaign');
elements.get('pause').onclick();check(run('paused'),'settings can open before starting');
console.log('PASS mobile controls and interruption scenarios');
