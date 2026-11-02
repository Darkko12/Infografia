'use strict';
/* Motion adds a reading rhythm without changing the exported layout or gate logic. */
window.Motion=(()=>{
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const ease='cubic-bezier(.16,1,.3,1)';let animations=[];
 const owned='[data-diff],.df-off,.df-in,.df-key,.wipe,.association-synced,.n3-chart,.n3-lead-anim,.generation-status,.generated-track,.result-player';
 function run(el,frames,options){const a=el.animate(frames,options);animations.push(a);return a}
 function rendered(el){return getComputedStyle(el).display!=='contents'&&el.getBoundingClientRect().width>5&&el.getBoundingClientRect().height>5}
 function reveal(el,index=0,type='rise'){
  if(!rendered(el)||el.closest(owned)||el.getAnimations().length)return;
  const from=type==='pop'?{opacity:0,scale:'.94'}:type==='wipe'?{clipPath:'inset(0 100% 0 0)'}:{opacity:0,translate:'0 18px'};
  const to=type==='pop'?{opacity:1,scale:'1'}:type==='wipe'?{clipPath:'inset(0 0 0 0)'}:{opacity:1,translate:'0 0'};
  run(el,[from,to],{duration:type==='wipe'?1100:650,delay:Math.min(index*80,640),easing:ease,fill:'backwards'});
 }
 function enter(id){
  animations.forEach(a=>a.cancel());animations=[];
  const root=stage.firstElementChild;if(!root)return;
  root.classList.add('motion-screen');
  // Iara and Differences own their timing; do not add a competing entrance.
  if(reduced()){document.querySelectorAll('.touch-bloom').forEach(el=>{el.getAnimations().forEach(a=>a.cancel());el.remove()});stage.getAnimations().forEach(a=>a.cancel());[root,...root.querySelectorAll('*')].forEach(el=>el.getAnimations().forEach(a=>a.cancel()));return}
  if(id==='597:916'||id==='73:564'||/^diff-/.test(id))return;
  const tutorial=['475:262','508:509','507:378','1010:3416'].includes(id);
  const headers=[...root.querySelectorAll('p')].filter(el=>{
   if(el.closest(owned))return false;const r=srel(el),font=parseFloat(getComputedStyle(el).fontSize);
   return r.t<350&&r.w>200&&(font>=32||el.querySelector('img[src*="text-"]'));
  }).slice(0,3);
  headers.forEach((el,i)=>reveal(el,i));
  if(['290:278','501:410'].includes(id))byId('304:163').forEach(el=>reveal(el,2,'wipe'));
  if(id==='326:564')byId('333:868').forEach(el=>{
   if(rendered(el))reveal(el,2,'pop');else [...el.children].filter(rendered).forEach(child=>reveal(child,2,'pop'));
  });
  if(!tutorial&&!['539:447','781:2988','616:870'].includes(id)){
   const panels=[...root.children].filter(el=>{
    if(headers.includes(el)||el.closest(owned)||!rendered(el))return false;
    const r=srel(el);return r.t>300&&r.w>180&&r.h>55&&r.w<1300&&r.h<600&&!el.matches('video,audio,.media-hit')&&!el.querySelector('video');
   }).slice(0,7);
   panels.forEach((el,i)=>reveal(el,i+2));
  }
  // Byte breathes while the content stays anchored. Artwork, crop and sizing remain intact.
  root.querySelectorAll('[data-name]').forEach(el=>{
   if(!/byte|auriculares|microfono-3d/.test(el.dataset.name)||!rendered(el)||el.closest(owned))return;
   if(el.classList.contains('gentle-float')||el.offsetWidth>800)return;
   run(el,[{translate:'0 0'},{translate:'0 -6px'},{translate:'0 0'}],{duration:5000,iterations:Infinity,easing:'ease-in-out'});
  });
  // Open each tutorial in a clear order: title, diagram, then the instruction.
  if(tutorial){
   const instructions=[...root.querySelectorAll('p')].filter(el=>{const r=srel(el);return r.t>280&&r.w>140&&el.textContent.trim().length>15});
   instructions.forEach((el,i)=>reveal(el,i+3));
  }
  if(id==='56:341'){
   ['410:269','410:267','410:266'].forEach((key,i)=>byId(key).forEach(el=>{
    if(rendered(el))reveal(el,i+2,'pop');else [...el.children].filter(rendered).forEach(child=>reveal(child,i+2,'pop'));
   }));
  }
  if(['53:3','73:402'].includes(id)){
   const links=[...root.querySelectorAll('a')].filter(el=>!el.closest(owned)&&rendered(el)&&srel(el).t>300);
   links.slice(0,8).forEach((el,i)=>reveal(el,i+2,'pop'));
   [...root.querySelectorAll('[data-name]')].filter(el=>/Nombre del proyecto/.test(el.dataset.name)&&rendered(el)).slice(0,7).forEach((el,i)=>reveal(el,i+2,'pop'));
  }
  // Action surfaces get a consistent tactile response after all app-specific wiring.
  root.querySelectorAll('[role="button"],a,button,[data-key]').forEach(el=>{
   if(rendered(el)&&srel(el).w<850)el.classList.add('motion-interactive');
  });
 }
 // Feedback is an independent overlay, so it cannot move a hit target or block input.
 document.addEventListener('pointerdown',e=>{
  const target=e.target.closest('[role="button"],button,a,[data-key]');if(!target||reduced())return;
  const ring=document.createElement('span');ring.className='touch-bloom';ring.style.left=e.clientX+'px';ring.style.top=e.clientY+'px';document.body.append(ring);
  const a=ring.animate([{opacity:.85,scale:'.2'},{opacity:0,scale:'1.8'}],{duration:520,easing:'ease-out'});a.onfinish=()=>ring.remove();
 },true);
 document.addEventListener('keydown',e=>{
  if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||reduced()||e.target.closest('input,textarea,select'))return;
  const i='asdfghjk'.indexOf(e.key.toLowerCase());if(i<0)return;
  const button=document.querySelector(`[data-note="${i}"]`);if(button)button.animate([{boxShadow:'0 0 0 0 #74d6c8aa'},{boxShadow:'0 0 0 14px #74d6c800'}],{duration:450});
 });
 return {enter};
})();
