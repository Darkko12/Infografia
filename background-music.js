'use strict';
/* Persistent soundtrack. It lives outside #stage so navigation/reset cannot remove it. */
window.BackgroundMusic=(()=>{
 const music=new Audio('audio/ElectroPop-Fondo.mp3');music.loop=true;music.preload='auto';music.volume=.10;
 const active=new Set(),registered=new WeakSet(),holds=new Set();let enabled=true,unlocked=true,queued=false,starting=false;
 function reconcile(){
  queued=false;
  for(const el of active)if(el.paused||el.ended||el.error)active.delete(el);
  if(!enabled||!unlocked||active.size||holds.size){if(!music.paused)music.pause();return}
  if(music.paused&&!starting){
   starting=true;
   music.play().catch(error=>{if(error.name==='NotAllowedError')unlocked=false}).finally(()=>{starting=false;if(active.size||holds.size||!enabled)music.pause()});
  }
 }
 function sync(){if(!queued){queued=true;queueMicrotask(reconcile)}}
 function track(el){
  if(el===music||registered.has(el))return el;registered.add(el);
  const update=()=>{if(!el.paused&&!el.ended&&!el.error)active.add(el);else active.delete(el);sync()};
  for(const event of ['play','playing','pause','ended','emptied','error'])el.addEventListener(event,update);
  update();return el;
 }
 // Capture also covers native audio controls in the opinions library and all videos.
 for(const event of ['play','playing','pause','ended','emptied','error'])document.addEventListener(event,e=>{
  if(e.target instanceof HTMLMediaElement&&e.target!==music){track(e.target);if(!e.target.paused&&!e.target.ended&&!e.target.error)active.add(e.target);else active.delete(e.target);sync()}
 },true);
 function hold(kind='tone'){const token={kind};holds.add(token);sync();return ()=>{holds.delete(token);sync()}}
 let recordingRelease=null;
 function setRecording(value){if(value&&!recordingRelease)recordingRelease=hold('recording');else if(!value&&recordingRelease){recordingRelease();recordingRelease=null}}
 function clearTones(){for(const token of holds)if(token.kind==='tone')holds.delete(token);sync()}
 function setEnabled(value){enabled=!!value;sync()}
 function unlock(){unlocked=true;sync()}
 for(const event of ['pointerdown','keydown','click'])document.addEventListener(event,unlock,true);
 window.addEventListener('pageshow',sync);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)sync()});
 music.addEventListener('pause',sync);music.addEventListener('ended',sync);
 sync();
 return {track,hold,clearTones,setRecording,setEnabled,get element(){return music}};
})();
