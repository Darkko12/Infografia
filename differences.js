'use strict';
/* =========================================================================
   Electria · "Diferencias entre cada proceso" (pantalla 73:564)
   1) Al entrar aparece una tecla DO. Al tocarla se revela, de izquierda a derecha, la fila "Tradicional".
      Después aparece RE (fila "Asistida") y después MI (fila "Autónoma").
   2) Con las tres filas visibles aparecen FA · SOL · LA a la derecha de cada canción:
        FA  -> proceso tradicional   (pantalla diff-trad)
        SOL -> proceso asistido      (pantalla diff-asist)
        LA  -> proceso autónomo      (pantalla diff-auto: el prompt depende del que se eligió antes)
      Las tres pantallas son solo para mirar: lo único que se puede hacer es volver con "Atrás".
   ========================================================================= */
window.Diff=(()=>{
 const ID='73:564',STUDIOS=['73:298','652:1329','652:1343'];
 const NAMES=['DO','RE','MI','FA','SOL','LA','SI'],LETTER=['A','S','D','F','G','H','J'];
 const ASSET=['64765','1b75b','8699e','44605','0316a','80c56','01e39'];   // círculo de color de cada nota
 const KEY_X=425,END_X=1372,SIZE=76;
 // Orden de aparición de cada fila (izquierda → derecha). cy = centro vertical de la fila en el diseño.
 const ROWS=[
  {note:0,cy:430,groups:[['848:2952'],['73:587','848:2962'],['73:589'],['73:598']]},
  {note:1,cy:640,groups:[['73:602','848:2954'],['101:633'],['73:603','848:2960'],['73:604'],['73:605']]},
  {note:2,cy:850,groups:[['73:612','848:2956'],['101:635'],['73:609','848:2961'],['73:610'],['73:611']]}
 ];
 const END_KEYS=[
  {note:3,id:'diff-trad',cy:430,label:'Ver el proceso de composición tradicional'},
  {note:4,id:'diff-asist',cy:640,label:'Ver el proceso de composición asistida'},
  {note:5,id:'diff-auto',cy:850,label:'Ver el proceso de composición autónoma'}
 ];
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 let S=null,done=false,phase=0,awaiting=false,busy=false,cur=null,run=0,lastStudio='652:1329';
 const dead=t=>t!==run||current!==ID;
 const parse=html=>{const t=document.createElement('template');t.innerHTML=html;return t.content.firstElementChild};
 const targets=el=>getComputedStyle(el).display==='contents'?[...el.children]:[el];
 const hide=el=>targets(el).forEach(e=>e.classList.add('df-off'));
 const show=el=>targets(el).forEach(e=>{e.classList.remove('df-off','df-in');void e.offsetWidth;e.classList.add('df-in')});
 function shake(el){if(!el)return;el.classList.remove('df-pop','shake');void el.offsetWidth;el.classList.add('shake')}

 function keyHTML(i,cx,cy,cls=''){
  return `<div class="df-key ${cls}" data-df-key="${i}" style="position:absolute;left:${cx-SIZE/2}px;top:${cy-SIZE/2}px;width:${SIZE}px;height:${SIZE}px"><img alt="" src="assets/${ASSET[i]}.svg" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none"><span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:400 30px/1 Lexend,sans-serif;color:#fff;pointer-events:none">${NAMES[i]}</span></div>`;
 }
 function hintHTML(){
  const ch=parse(S['73:402']).querySelector('[data-node-id="848:2923"]');
  if(ch){ch.style.left='1340px';ch.style.top='838px'}
  return `<div class="df-hint" style="position:absolute;inset:0;pointer-events:none">`
   +`<div style="position:absolute;left:735px;top:846px;width:420px;height:58px;background:#573dcd;border-radius:21px"></div>`
   +`<svg width="70" height="48" viewBox="0 0 70 48" style="position:absolute;left:1146px;top:852px" aria-hidden="true"><polygon fill="#573dcd" points="0,0 70,40 0,48"/></svg>`
   +`<p style="position:absolute;margin:0;left:735px;top:846px;width:420px;height:58px;line-height:58px;text-align:center;white-space:nowrap;font:400 22px/58px Michroma,sans-serif;color:#fff">Presiona para revelar</p>`
   +(ch?ch.outerHTML:'')+`</div>`;
 }

 /* ---------- pantalla interactiva ---------- */
 function offer(){
  const root=stage.firstElementChild,r=ROWS[phase];
  root.insertAdjacentHTML('beforeend',keyHTML(r.note,KEY_X,r.cy,'df-pop'));
  cur=root.lastElementChild;action(cur,()=>hit(r.note),'Tocar '+NAMES[r.note]);awaiting=true;
 }
 async function hit(i){
  if(!awaiting||busy)return;
  const r=ROWS[phase],tok=run;
  if(i!==r.note){shake(cur);toast(`Tocá ${NAMES[r.note]} (${LETTER[r.note]}) para continuar`);return}
  if(phase===ROWS.length-1)sink();   // fila Autónoma: la mascota baja para no tapar la vista
  awaiting=false;busy=true;const key=cur;key.classList.remove('df-pop');key.classList.add('df-out');
  await sleep(260);if(dead(tok))return;key.remove();
  for(const g of r.groups){g.forEach(id=>byId(id).forEach(show));await sleep(380);if(dead(tok))return}
  await sleep(250);if(dead(tok))return;
  phase++;busy=false;
  if(phase<ROWS.length){offer();return}
  finish();
 }
 function sink(){
  const hint=stage.querySelector('.df-hint');if(!hint)return;
  hint.classList.add('df-sink');setTimeout(()=>hint.remove(),1000);
 }
 function endKeys(animate){
  const root=stage.firstElementChild;
  END_KEYS.forEach((k,n)=>{
   root.insertAdjacentHTML('beforeend',keyHTML(k.note,END_X,k.cy,'df-end'));
   const el=root.lastElementChild;action(el,()=>open(k),k.label+' ('+NAMES[k.note]+')');
   if(animate){el.classList.add('df-pop');el.style.animationDelay=(n*.18)+'s'}
  });
 }
 function finish(){
  done=true;
  const hint=stage.querySelector('.df-hint');if(hint){hint.style.transition='opacity .3s';hint.style.opacity=0;setTimeout(()=>hint.remove(),350)}
  endKeys(true);byId('850:3163').forEach(show);$('#continue').hidden=false;
  toast('Tocá FA, SOL o LA para ver cada proceso.');
 }
 function open(k){note(k.note);go(k.id)}
 function nudge(){
  if(done)return;
  toast(awaiting?`Tocá ${NAMES[ROWS[phase].note]} (${LETTER[ROWS[phase].note]}) para continuar`:'Esperá a que termine la animación.');
 }
 function enter(){
  if(STUDIOS.includes(current)){lastStudio=current;return}
  if(current!==ID)return;
  run++;busy=false;awaiting=false;cur=null;phase=0;
  if(done){endKeys(false);return}
  ROWS.forEach(r=>r.groups.flat().forEach(id=>byId(id).forEach(hide)));
  byId('850:3163').forEach(hide);
  stage.firstElementChild.insertAdjacentHTML('beforeend',hintHTML());
  offer();
 }
 function onNote(i){
  if(current!==ID)return false;
  if(!done){
   if(i===7){nudge();return true}
   note(i);if(awaiting&&!busy)hit(i);
   return true;
  }
  const k=END_KEYS.find(k=>k.note===i);
  if(k){open(k);return true}
  if(i===7)return false;                  // K: continúa al juego como antes
  note(i);return true;
 }
 const gated=id=>id===ID&&!done;
 function reset(){done=false;phase=0;awaiting=false;busy=false;run++}

 /* ---------- pantallas de detalle (solo "Atrás") ---------- */
 let baseHTML='',atrasHTML='',strips={};
 function strip(id,drop){
  const root=parse(S[id]);drop.forEach(n=>root.querySelectorAll('[data-node-id="'+n+'"]').forEach(e=>e.remove()));
  return `<div style="position:absolute;inset:0;pointer-events:none">${root.innerHTML}</div>`;
 }
 function shell(kind,body){
  return `<div data-node-id="diff-${kind}" data-diff="${kind}" style="background:#16194e;position:relative;width:100%;height:100%">`
   +`<div inert style="position:absolute;inset:0;isolation:isolate">${baseHTML}</div>`
   +`<div style="position:absolute;inset:0;background:rgba(22,25,78,.9)"></div>${body}${atrasHTML}</div>`;
 }
 const BAND='<div style="position:absolute;left:0;top:290px;width:100%;height:470px;background:#16194e"></div>';
 function trackHTML(){
  const H=[10,18,30,22,40,28,46,34,20,52,38,24,44,32,16,48,36,26,54,40,22,34,50,28,18,42,30,56,36,20,46,26,38,14,32,22,12];
  const bars=H.map((h,i)=>`<rect class="wv" x="${i*9.5}" y="${33-h/2}" width="5" height="${h}" rx="2.5"/>`).join('');
  return '<div class="generated-track" style="top:335px;pointer-events:none">'
   +'<svg class="gt-tail" width="68" height="54" viewBox="0 0 68 54" aria-hidden="true"><polygon points="0,46 68,0 68,54"/></svg>'
   +'<span class="gt-btn" aria-hidden="true"><svg class="gt-play" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20"/><path d="M18 14l13 8-13 8z"/></svg></span>'
   +'<span class="gt-label">Pista generada</span>'
   +`<svg class="gt-wave" viewBox="0 0 350 66" aria-hidden="true">${bars}</svg></div>`;
 }
 function autoHTML(){
  const host=parse(S[lastStudio]||S['652:1329']).querySelector('[data-name="Component 74"],[data-name="Component 99"]');
  Object.assign(host.style,{left:'118px',top:'285px',width:'1203px',height:'540px'});
  host.insertAdjacentHTML('beforeend',trackHTML());
  return shell('auto',host.outerHTML);
 }
 function init(s){
  S=s;
  baseHTML=parse(s[ID]).innerHTML+END_KEYS.map(k=>keyHTML(k.note,END_X,k.cy)).join('');
  atrasHTML=[...parse(s['546:1129']).querySelectorAll('a')].find(a=>a.textContent.trim()==='Atrás').outerHTML;
  const define=(id,fn)=>Object.defineProperty(s,id,{get:fn,configurable:true,enumerable:false});
  define('diff-trad',()=>shell('trad',BAND+(strips.trad||(strips.trad=strip('53:3',['17:4','55:5','733:461','733:462','733:463','733:464','733:465','733:466','738:4308','848:2876','848:2880','848:2971'])))));
  define('diff-asist',()=>shell('asist',BAND+(strips.asist||(strips.asist=strip('73:402',['167:1380','73:413','733:644','733:647','733:650','733:663','733:656','848:2919','848:2923','850:3156'])))));
  define('diff-auto',autoHTML);   // se arma cada vez: el prompt cambia según lo que eligió la persona
 }
 return {init,enter,onNote,gated,nudge,reset};
})();