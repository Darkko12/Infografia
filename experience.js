'use strict';
/* UI and motion layered onto the original exported Figma screens. */
window.Experience=(()=>{
 const tutorials=['475:262','508:509','507:378'];
 const colors=['#fa575a','#ef885c','#f1d64e','#70e959','#00acc1','#6971f4','#ad6fea'];
 let narration=null,raf=0,associationToggle=null,narrationUrl=null,narrationRequest=null;
 const reduce=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const button=(label,fn,cls='')=>{const b=document.createElement('button');b.type='button';b.className='experience-btn '+cls;b.textContent=label;b.onclick=fn;return b};
 function init(s){
  next['761:3176']='1185:3087';
 }
 function stop(){narrationRequest?.abort();narrationRequest=null;cancelAnimationFrame(raf);raf=0;if(narration){narration.pause();narration.removeAttribute('src');narration.load();narration=null}associationToggle=null;if(narrationUrl){URL.revokeObjectURL(narrationUrl);narrationUrl=null;}}
 function mute(value){if(narration)narration.muted=value;}
 function tutorial(){
  if(!['475:262','508:509','507:378'].includes(current))return;
  const second=current==='508:509';
  addHit({l:525,t:second?441:449,w:34,h:34},'Volver a la pantalla anterior',back);
  addHit({l:second?566:578,t:second?441:449,w:34,h:34},'Reiniciar el recorrido',resetAll);
  for(const p of stage.querySelectorAll('p')){
   const i=noteNames.indexOf(p.textContent.trim());if(i<0)continue;
   const rect=srel(p);if(rect.t>600)addHit({l:rect.l-5,t:rect.t-5,w:rect.w+10,h:rect.h+10},'Tocar '+noteNames[i],()=>note(i));
  }
 }
 function association(){
  if(current!=='597:916')return;
  const root=stage.firstElementChild,cfg=window.ASSOCIATION_AUDIO;
  if(!cfg?.src)return;
  root.classList.add('association-screen');
  const entries=[...cfg.terms.map(term=>({...term,kind:'term'})),...cfg.outcomes.map(term=>({...term,kind:'outcome'}))]
   .map(term=>({...term,el:byId(term.id)[0]})).filter(term=>term.el);
  for(const term of entries){term.el.classList.add('association-synced');term.el.dataset.concept=term.label;}
  const track=narration=document.createElement('audio');track.preload='auto';track.muted=!sound;track.hidden=true;root.append(track);
  const request=narrationRequest=new AbortController();
  async function autoplay(){
   if(narration!==track||request.signal.aborted)return;
   try{await track.play()}catch(error){
    if(error.name==='NotAllowedError'&&!request.signal.aborted){
     const retry=()=>{if(narration===track)track.play().catch(()=>{})};
     document.addEventListener('pointerdown',retry,{once:true,signal:request.signal});
     document.addEventListener('keydown',retry,{once:true,signal:request.signal});
    }
   }
  }
  fetch(cfg.src,{signal:request.signal}).then(response=>{if(!response.ok)throw Error('Audio '+response.status);return response.blob()}).then(blob=>{
   if(narration!==track||request.signal.aborted)return;
   narrationUrl=URL.createObjectURL(blob);track.src=narrationUrl;track.load();autoplay();
  }).catch(error=>{if(error.name!=='AbortError'&&narration===track)toast('No se pudo cargar la narración de Iara. Volvé a entrar a esta pantalla.')});
  track.addEventListener('play',()=>{cancelAnimationFrame(raf);tick()});
  track.addEventListener('pause',()=>{cancelAnimationFrame(raf);render(track.currentTime)});
  track.addEventListener('seeked',()=>render(track.currentTime));
  track.addEventListener('timeupdate',()=>render(track.currentTime));
  track.addEventListener('ended',()=>render(track.duration));
  function render(t){
   for(const term of entries){
    const visible=t>=term.at,active=!!term.focus?.some(([from,to])=>t>=from&&t<to);
    const phase=visible?Math.min(1,(t-term.at)/.42):0;
    term.el.classList.toggle('cue-visible',visible);term.el.classList.toggle('cue-current',active);
    term.el.style.setProperty('--cue-alpha',reduce()?(visible?1:0):phase);
    term.el.style.setProperty('--cue-offset',reduce()?'0px':`${(1-phase)*14}px`);
    term.el.style.setProperty('--cue-glow',active?`${14+4*Math.sin(t*5)}px`:'0px');
    term.el.setAttribute('aria-hidden',String(!visible));
   }
  }
  function tick(){render(track.currentTime);if(!track.paused&&!track.ended)raf=requestAnimationFrame(tick)}
  function toggle(){
   if(track.paused){if(track.ended)track.currentTime=0;autoplay()}
   else track.pause();
  }
  associationToggle=toggle;
  render(0);
 }
 // Barras ecualizador (inicio y pantalla final): cada SVG se incrusta y cada barra sube y baja a su propio ritmo
 const svgCache=new Map();let eqToken=0;
 function loadSvg(src){if(!svgCache.has(src))svgCache.set(src,fetch(src).then(r=>{if(!r.ok)throw Error(src);return r.text()}));return svgCache.get(src)}
 function equalizers(){
  const token=++eqToken,shown=current;
  if(!['88:2','1185:3087'].includes(current))return;
  const imgs=[...stage.querySelectorAll('img[src$=".svg"]')].filter(im=>{const r=srel(im);return r.t>850&&r.h>150&&r.w>100&&!im.closest('[data-experience]')});
  imgs.forEach(async im=>{
   let text;try{text=await loadSvg(im.getAttribute('src'))}catch{return}
   if(token!==eqToken||current!==shown||!im.isConnected)return;
   const svg=new DOMParser().parseFromString(text,'image/svg+xml').documentElement;
   if(!svg||svg.nodeName.toLowerCase()!=='svg')return;
   if(!svg.getAttribute('viewBox')){const w=parseFloat(svg.getAttribute('width')),h=parseFloat(svg.getAttribute('height'));if(w&&h)svg.setAttribute('viewBox','0 0 '+w+' '+h)}
   svg.setAttribute('width','100%');svg.setAttribute('height','100%');svg.setAttribute('aria-hidden','true');svg.setAttribute('class','eq-svg');svg.style.cssText='display:block;position:absolute;inset:0;overflow:visible';
   const skip=el=>el.closest('defs,clipPath,mask,linearGradient,radialGradient,pattern,symbol');
   // un solo <path> con varias barras: se parte en una pieza por barra
   svg.querySelectorAll('path').forEach(p=>{const d=p.getAttribute('d')||'';if(skip(p)||/m/.test(d)||(d.match(/M/g)||[]).length<2)return;
    d.split(/(?=M)/).filter(x=>x.trim()).forEach(part=>{const c=p.cloneNode();c.setAttribute('d',part);p.before(c)});p.remove()});
   const shapes=[...svg.querySelectorAll('rect,path,line,polygon,polyline')].filter(e=>!skip(e));
   const target=shapes.length>1?shapes:[svg];
   target.forEach(e=>{e.classList.add('eq-bar');e.style.setProperty('--d',(0.55+Math.random()*0.9).toFixed(2)+'s');e.style.setProperty('--dl',(-Math.random()*1.5).toFixed(2)+'s');e.style.setProperty('--lo',(0.2+Math.random()*0.35).toFixed(2))});
   im.replaceWith(svg);
  });
 }
 function enter(){
  const locked=current==='1185:3087';   // pantalla final: lo único activo es Reiniciar
  document.body.classList.toggle('final-lock',locked);
  for(const el of document.querySelectorAll('#back,#home,#help,#continue,[data-note]'))el.disabled=locked;
  tutorial();association();equalizers();
  stage.querySelectorAll('[data-experience]').forEach(b=>b.onclick=()=>{const a=b.dataset.experience;if(a==='reset')resetAll();else if(a==='back')back();else advance()});
  if(/^761:/.test(current)){
   const finish=button('',()=>go('1185:3087'),'finish-experience');finish.innerHTML='<span>Finalizar experiencia</span><svg class="fe-arrow" viewBox="0 0 32 20" aria-hidden="true"><path d="M1 10h28M20 2l9 8-9 8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';finish.setAttribute('aria-label','Finalizar experiencia (tecla K)');stage.firstElementChild.append(finish);
  }
  if(current==='1185:3087'){
   const backBtn=stage.querySelector('[data-experience="back"]');if(backBtn)backBtn.onclick=()=>{window.__finalBack=true;try{back()}finally{window.__finalBack=false}}   // Atrás activo, igual que la tecla V
   $('#progress').textContent='Fin de la experiencia';
   stage.firstElementChild.classList.add('final-screen');
  }
 }
 function onNote(i){if(current==='1185:3087')return true;   // pantalla final: ninguna nota hace nada
 if(current==='597:916'&&i===0&&associationToggle){associationToggle();return true}return false}
 // Pantalla final: se bloquea cualquier tecla (letras y Escape) salvo R y V, antes de que llegue a otros atajos
 window.addEventListener('keydown',e=>{
  if(current!=='1185:3087'||e.ctrlKey||e.metaKey||e.altKey)return;
  if((e.key.length===1||e.key==='Escape')&&!['r','v'].includes(e.key.toLowerCase())){e.preventDefault();e.stopImmediatePropagation()}
 },true);
 return {init,enter,stop,mute,onNote};
})();