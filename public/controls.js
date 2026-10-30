/* global keys, clearControls, setControl, pause, resume, reset, paused, won, resetClock */
'use strict';
const touchPointers=new Map();
const controlButtons=[...document.querySelectorAll('[data-key]')];
const touchQuery=matchMedia('(any-pointer:coarse)');
const landscapeQuery=matchMedia('(orientation:landscape)');
const stage=document.getElementById('stage');
const menu=document.getElementById('pause-menu');
const touchMode=document.getElementById('touch-mode');
const keyActions={ArrowLeft:'ArrowLeft',KeyA:'ArrowLeft',KeyQ:'ArrowLeft',ArrowRight:'ArrowRight',KeyD:'ArrowRight',Space:'Space'};
function paintControls(){
 for(const button of controlButtons){const pressed=keys.has(button.dataset.key);button.classList.toggle('pressed',pressed);}
}
function fitScene(){
 const width=Math.min(Math.max(0,stage.clientWidth-224),stage.clientHeight*16/9);
 stage.style.setProperty('--scene-width',`${width}px`);
}
function updateTouchMode(){
 const enabled=touchMode.value==='show'||(touchMode.value==='auto'&&touchQuery.matches);
 document.body.classList.toggle('touch',enabled);fitScene();
}
function cancelContacts(){touchPointers.clear();clearControls();paintControls();}
function pauseGame(){cancelContacts();pause();}
function resumeGame(){cancelContacts();resume();}
function restartGame(){cancelContacts();reset();}
function editable(target){return target?.matches('button,select,input,textarea,a');}
addEventListener('keydown',e=>{
 if(e.code==='Escape'&&!e.repeat){e.preventDefault();if(paused)resumeGame();else pauseGame();return;}
 if(editable(e.target)||paused)return;
 if(keyActions[e.code]){e.preventDefault();setControl(`key:${e.code}`,keyActions[e.code]);paintControls();}
 else if(e.code==='KeyR'&&!e.repeat){e.preventDefault();restartGame();}
});
addEventListener('keyup',e=>{if(keyActions[e.code]){setControl(`key:${e.code}`,null);paintControls();}});
for(const button of controlButtons){
 button.addEventListener('pointerdown',e=>{
  if(paused||won||e.button!==0)return;
  e.preventDefault();
  touchPointers.set(e.pointerId,button.dataset.key==='Space'?'jump':'direction');
  button.setPointerCapture(e.pointerId);
  setControl(`pointer:${e.pointerId}`,button.dataset.key);paintControls();
 });
 button.addEventListener('pointermove',e=>{
  if(touchPointers.get(e.pointerId)!=='direction')return;
  const target=controlButtons.find(b=>{
   if(b.dataset.key==='Space')return false;
   const r=b.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<r.right&&e.clientY>=r.top&&e.clientY<r.bottom;
  });
  setControl(`pointer:${e.pointerId}`,target?.dataset.key);paintControls();
 });
 for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,e=>{
  touchPointers.delete(e.pointerId);setControl(`pointer:${e.pointerId}`,null);paintControls();
 });
 button.addEventListener('contextmenu',e=>e.preventDefault());
}
addEventListener('blur',pauseGame);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame();resetClock();});
landscapeQuery.addEventListener('change',()=>{pauseGame();fitScene();});
touchQuery.addEventListener('change',updateTouchMode);
touchMode.addEventListener('change',()=>{cancelContacts();updateTouchMode();});
new ResizeObserver(fitScene).observe(stage);
document.getElementById('pause').onclick=pauseGame;
document.getElementById('resume').onclick=resumeGame;
document.getElementById('restart').onclick=restartGame;
document.getElementById('restart-menu').onclick=restartGame;
menu.addEventListener('keydown',e=>{
 if(e.code!=='Tab')return;
 const items=[...menu.querySelectorAll('button,select')].filter(el=>!el.hidden);
 const first=items[0],lastItem=items[items.length-1];
 if(e.shiftKey&&document.activeElement===first){e.preventDefault();lastItem.focus();}
 else if(!e.shiftKey&&document.activeElement===lastItem){e.preventDefault();first.focus();}
});
const fullscreenButton=document.getElementById('fullscreen');
fullscreenButton.hidden=!document.fullscreenEnabled;
fullscreenButton.onclick=async()=>{
 try{await document.documentElement.requestFullscreen();}catch{return;}
 try{await screen.orientation?.lock('landscape');}catch{ /* Orientation is optional. */ }
};
updateTouchMode();
