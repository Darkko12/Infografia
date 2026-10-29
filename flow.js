'use strict';
/* =========================================================================
   Electria · flujo "De la idea al sonido"
   Reglas de las teclas (compuertas): el usuario no avanza hasta tocar
   la combinación que se le pide.  Tipos de compuerta:
     confirm  -> hay que tocar las 3 notas de UN acorde (en cualquier orden)
     choice   -> hay que tocar las 3 notas de UNO de los acordes mostrados
     sequence -> hay que tocar las notas en orden (pantalla de los círculos)
   Para tocar: teclado de la compu (A S D F G H J K), piano de abajo, o el
   piano dibujado en la pantalla 4.
   ========================================================================= */
window.Flow=(()=>{
const NOTE_IDX={DO:0,RE:1,MI:2,FA:3,SOL:4,LA:5,SI:6},NAMES=['DO','RE','MI','FA','SOL','LA','SI'],LETTER=['A','S','D','F','G','H','J'];
const CHORD_RE=/^\s*(DO|RE|MI|FA|SOL|LA|SI)\s*-\s*(DO|RE|MI|FA|SOL|LA|SI)\s*-\s*(DO|RE|MI|FA|SOL|LA|SI)\s*$/i;
const MOODS=[{id:'alegre',notes:[0,2,4]},{id:'triste',notes:[5,0,2]},{id:'enojada',notes:[6,1,3]}];
const CONTEXTS=['un concierto','una fiesta','un viaje'];           // izquierda -> derecha
const INSTRUMENTS=['guitarra eléctrica','caja de ritmos','sintetizador'];
const GATES={
 '234:91':{kind:'confirm',done:()=>go('mood')},
 'mood':{kind:'choice',pick:i=>{compose.mood=MOODS[i].id;compose.moodChosen=true;compose.chord=MOODS[i].notes;go('530:1123')}},
 '530:1123':{kind:'sequence',done:()=>go('530:1665')},
 '304:209':{kind:'confirm',done:()=>go('333:824')},
 '333:824':{kind:'choice',pick:i=>{compose.context=CONTEXTS[i];go('326:564')}},
 '342:996':{kind:'confirm',done:()=>go('359:1185')},
 '359:1185':{kind:'choice',pick:i=>{compose.instrument=INSTRUMENTS[i];compose.instrumentChosen=true;go('359:1170')}},
 '708:391':{kind:'choice',pick:i=>go(i?'769:4700':'476:540')},
 '359:1764':{kind:'confirm',stay:true,done:()=>{melody();$('#continue').hidden=false;const a=stage.querySelector('[data-node-id="410:278"]');action(a,()=>go('56:341'),'Volver al inicio')}}
};

const BLOCK={'304:209':['333:814'],'342:996':['342:1015'],'359:1764':['410:278']};
const WIPE=['mood','333:824','359:1185'];
let cfg=null,st={},pills=[],curId=null;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const nm=n=>NAMES[((n%7)+7)%7];

function init(s){
  const t=document.createElement('template');t.innerHTML=s['234:91'];const card=t.content.querySelector('[data-node-id="1019:3888"],[data-node-id="1006:3849"]');
  if(card&&s['mood-choice']){const choice=document.createElement('template');choice.innerHTML=s['mood-choice'];card.innerHTML=choice.content.firstElementChild.innerHTML;card.style.cssText='position:absolute;left:138px;top:522px;width:1164px;height:479px';}
  s.mood=t.innerHTML;
  const urls=new Set();
  [...Object.keys(GATES),'530:1123','290:278','326:564','597:916','359:1170','359:1487'].forEach(id=>(s[id]||'').replace(/assets\/[^"')\s]+/g,u=>urls.add(u)));
  ['assets/angry-face.svg','assets/ring-note.svg'].forEach(u=>urls.add(u));
  urls.forEach(u=>{const im=new Image();im.src=u});          // precarga: evita el flash de fondo azul al cambiar de pantalla
}
function buildMood(html){
  const t=document.createElement('template');t.innerHTML=html;const r=t.content;
  const ps=[...r.querySelectorAll('p')];
  for(const p of ps){const x=p.textContent.trim();
    if(x==='Contexto')p.textContent='Estado de animo';
    else if(x==='SI - RE - FA')p.textContent='FA - DO - SOL';
    else if(/^¡Toca el acorde/.test(x))p.textContent='¡Toca el acorde correspondiente para seleccionar tu emoción deseada!';
    else if(['Do mayor','La menor','Si disminuido'].includes(x))p.remove();}
  const faces=['assets/3a1b4.svg','assets/1cad1.svg','assets/angry-face.svg'];
  const icons=[...r.querySelectorAll('[data-name]')].filter(e=>/concert|night-club|travel/.test(e.dataset.name)).sort((a,b)=>parseFloat(a.style.left)-parseFloat(b.style.left));
  const pillBoxes=[...r.querySelectorAll('p')].filter(p=>CHORD_RE.test(p.textContent)).map(p=>p.parentElement.parentElement.parentElement).sort((a,b)=>parseFloat(a.style.left)-parseFloat(b.style.left));
  icons.forEach((ic,i)=>{ic.style.width=ic.style.height='152px';ic.querySelector('img').src=faces[i];ic.dataset.name='emocion-'+MOODS[i].id;
    const w=pillBoxes[i];if(w)ic.style.left=(parseFloat(w.style.left)+parseFloat(w.style.width)/2-76)+'px';});
  return t.innerHTML;
}

/* ---------- utilidades de pantalla ---------- */
function setupPills(){
  if(curId==='708:391'){            
    const chords={'DOM':[0,2,4],'LAm':[5,0,2]};
    const badges=[...stage.querySelectorAll('[data-name]')].filter(e=>NAMES.includes(e.dataset.name));
    pills=[...stage.querySelectorAll('p')].filter(p=>chords[p.textContent.trim()]).map(p=>{
      const box=p.parentElement,notes=chords[p.textContent.trim()],r=box.getBoundingClientRect();
      const nodes=badges.filter(b=>{const q=b.getBoundingClientRect(),cx=q.left+q.width/2;return cx>=r.left-5&&cx<=r.right+5&&q.top>=r.top-5&&q.top<=r.bottom+90});
      nodes.forEach(e=>{e.classList.add('nt');e.dataset.n=NOTE_IDX[e.dataset.name]});
      return {p,box,notes,nodes,name:notes.map(n=>NAMES[n]).join(' - ')};
    }).sort((a,b)=>a.p.getBoundingClientRect().left-b.p.getBoundingClientRect().left);
    return;
  }
  pills=[...stage.querySelectorAll('p')].filter(p=>CHORD_RE.test(p.textContent)).map(p=>{
    const names=p.textContent.trim().split(/\s*-\s*/).map(x=>x.toUpperCase());
    p.innerHTML=names.map(n=>`<span class="nt" data-n="${NOTE_IDX[n]}">${n}</span>`).join(' - ');
    const box=p.closest('[data-name^="Component"]')||p.parentElement.parentElement;
    return {p,box,notes:names.map(n=>NOTE_IDX[n]),name:names.join(' - ')};
  }).sort((a,b)=>a.p.getBoundingClientRect().left-b.p.getBoundingClientRect().left);
  if(!pills.length){const chords={'Do mayor':[0,2,4],'La menor':[5,0,2],'Si disminuido':[6,1,3]};
    pills=[...stage.querySelectorAll('p')].filter(p=>chords[p.textContent.trim()]).map(p=>{const box=p.parentElement,notes=chords[p.textContent.trim()];const nodes=[...box.querySelectorAll('p')].filter(e=>NAMES.includes(e.textContent.trim()));nodes.forEach(e=>{e.classList.add('nt');e.dataset.n=NOTE_IDX[e.textContent.trim()]});return {p,box,notes,nodes,name:notes.map(n=>NAMES[n]).join(' - ')}}).sort((a,b)=>a.p.getBoundingClientRect().left-b.p.getBoundingClientRect().left);
  }

}
function paintHits(win){for(const pl of pills)(pl.nodes||pl.p.querySelectorAll('.nt')).forEach(sp=>sp.classList.toggle('hit',win.includes(+sp.dataset.n)))}
function pillLabel(pl){return pl.notes.map(n=>`${nm(n)} (${LETTER[n]})`).join(' · ')}
function shake(el){if(!el)return;el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake')}
function nudge(){
  if(!cfg)return;
  if(cfg.kind==='sequence'){const n=compose.chord[st.seq];toast(`Tocá la tecla ${nm(n)} (${LETTER[n]}) — la marca el anillo rosa del piano`)}
  else if(cfg.kind==='confirm')toast(`Tocá ${pillLabel(pills[0])} para continuar`);
  else toast('Tocá las 3 notas de uno de los acordes: '+pills.map(pillLabel).join('  |  '));
}
function flashKey(i){
  const el=stage.querySelector(`[data-key="${i}"]`);if(!el)return;
  el.classList.add('key-down');setTimeout(()=>el.classList.remove('key-down'),180);
}

/* ---------- piano de la pantalla 4 ---------- */
const WHITE=['530:1479','530:1480','530:1481','530:1482','530:1483','530:1484','530:1485','530:1486'];
const BLACK=[['530:1487',0],['530:1488',1],['530:1490',3],['530:1491',4],['530:1492',5]];
function sharp(base){                                   // tecla negra: suena el sostenido pero no cuenta como nota pedida
  if(!sound)return;const ctx=ensureAudio(),t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
  o.type='sine';o.frequency.value=freq[base]*Math.pow(2,1/12);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.15,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+.65);
  o.connect(g).connect(ctx.destination);o.start(t);o.stop(t+.68);
}
function setupPiano(){
  WHITE.forEach((id,i)=>{const el=stage.querySelector(`[data-node-id="${id}"]`);if(!el)return;
    el.dataset.key=i;el.style.cursor='pointer';el.style.touchAction='manipulation';el.style.userSelect='none';
    el.addEventListener('pointerdown',e=>{e.preventDefault();noteAction(i)});});
  BLACK.forEach(([id,base])=>{const el=stage.querySelector(`[data-node-id="${id}"]`);if(!el)return;
    el.dataset.black=base;el.style.cursor='pointer';el.style.zIndex=2;el.style.touchAction='manipulation';
    el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();sharp(base);el.classList.add('key-down');setTimeout(()=>el.classList.remove('key-down'),180);
      if(cfg&&!st.locked){toast('Esa es una tecla negra. Usá las teclas blancas');}});});
  const ring=stage.querySelector('[data-node-id="530:1508"]');if(ring){ring.style.pointerEvents='none';ring.removeAttribute('tabindex');}
}
function setupSeq(){
  const need=compose.chord||[0,2,4];
  st.circles=['530:1511','530:1514','530:1517'].map(id=>stage.querySelector(`[data-node-id="${id}"]`));
  st.circles.forEach((c,i)=>{c.querySelector('img').src='assets/ring-note.svg';const p=c.querySelector('p');p.textContent=nm(need[i]);p.style.inset='33% 0 32% 0';p.style.left='0';p.style.right='0'});
  paintSeq();
}
function paintSeq(){
  const need=compose.chord||[0,2,4];
  st.circles.forEach((c,i)=>{c.classList.toggle('c-done',i<st.seq);c.classList.toggle('c-now',i===st.seq);c.style.opacity=i<=st.seq?1:.5});
  const ring=stage.querySelector('[data-node-id="530:1508"]');
  if(ring&&st.seq<3){ring.style.inset='auto';ring.style.left=(parseFloat(stage.querySelector(`[data-node-id="${WHITE[need[st.seq]]}"]`).style.left)+59.318/2-20.5)+'px';ring.style.top='328px';ring.style.width=ring.style.height='41px'}
  else if(ring)ring.style.display='none';
}

/* ---------- entrada a cada pantalla ---------- */
function enter(id){
  $('#notice').classList.remove('visible');curId=id;cfg=GATES[id]||null;st={got:new Set(),win:[],seq:0,locked:false};pills=[];
  if(id==='mood')$('#progress').textContent='De la idea al sonido';
  if(!cfg)return;
  $('#continue').hidden=true;
  setupPills();
  if(id==='530:1123'){setupPiano();setupSeq()}
  if(WIPE.includes(id)){const c=stage.querySelector('[data-name="Component 82"]');if(c){c.classList.add('wipe');c.addEventListener('animationend',()=>c.classList.remove('wipe'),{once:true})}}
  // click en cartas/botones de una pantalla con compuerta: solo da la pista
  stage.querySelectorAll('a[data-node-id],button[data-node-id]').forEach(el=>{if(!el.dataset.key&&!el.dataset.black)el.addEventListener('click',nudge)});
  if(id==='359:1764')stage.querySelector('[data-node-id="410:278"]')?.setAttribute('data-blocked','1');
}

/* ---------- teclas ---------- */
function onNote(i){
  if(!cfg)return false;
  if(i===7){if(st.done)return false;nudge();return true}
  note(i);flashKey(i);
  if(st.locked)return true;
  const n=((i%7)+7)%7;
  if(cfg.kind==='sequence')seq(n);else if(cfg.kind==='confirm')confirm(n);else choice(n);
  return true;
}
function finish(box,fn,ms=750){const entered=st;st.locked=true;if(box)box.classList.add('ok');setTimeout(()=>{if(st!==entered)return;fn();if(st===entered&&cfg&&cfg.stay){st.done=true;st.locked=false;st.got=new Set();paintHits([]);if(box)box.classList.remove('ok')}},ms)}
function confirm(n){
  const pl=pills[0];if(!pl)return;
  if(pl.notes.includes(n)){st.got.add(n);paintHits([...st.got]);
    if(st.got.size===pl.notes.length)finish(pl.box,()=>cfg.done());}
  else{shake(pl.box);toast(`Esa no es parte del acorde. Tocá ${pillLabel(pl)}`)}
}
function choice(n){
  st.win.push(n);if(st.win.length>3)st.win.shift();
  paintHits(st.win);
  if(st.win.length<3)return;
  const key=[...st.win].sort().join();
  const idx=pills.findIndex(pl=>[...pl.notes].sort().join()===key&&new Set(st.win).size===3);
  if(idx>=0){finish(pills[idx].box,()=>cfg.pick(idx));return}
  pills.forEach(pl=>shake(pl.box));
  toast('Esas notas no forman ningún acorde de los que se piden. Probá con: '+pills.map(pillLabel).join('  |  '));
}
function seq(n){
  const need=compose.chord||[0,2,4];
  if(n===need[st.seq]){st.seq++;paintSeq();if(st.seq===3)finish(null,()=>cfg.done(),900)}
  else{shake(st.circles[st.seq]);toast(`Ahora toca ${nm(need[st.seq])} (${LETTER[need[st.seq]]})`)}
}
const gated=id=>!!GATES[id]&&!(curId===id&&st.done);
const blocks=(f,id)=>(BLOCK[f]||[]).includes(id)||!!GATES[f]&&!(curId===f&&st.done);
return {init,enter,onNote,gated,blocks,nudge,GATES};
})();
