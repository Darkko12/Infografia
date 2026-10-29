'use strict';
window.Revisions=(()=>{
 let generationToken=0,libraryUrls=[];
 const pending={
  '781:2988':{0:['Camilo','Camilo.mp3'],1:['Duki','Duki.mp3'],2:['Romeo Santos','Romeo.mp3'],3:['Paulo Londra','Paulo.mp3'],4:['María Becerra','Maria.mp3'],5:['Tini','Tini.mp3']},
  '274:260':{3:['YACHT','YACHT.mp3'],2:['Alan Braxe','AlanBraxe.mp3'],5:['Fred Falke','FredFalke.mp3']},
  '73:298':{0:['electrónico generado','Prompt1.mp3']},
  '652:1329':{0:['reguetón generado','Prompt2.mp3']},
  '652:1343':{0:['pop generado','Prompt3.mp3']}
 };
 const moods={alegre:'ae9f4.svg',triste:'1eae4.svg',enojada:'f093f.svg'};
 function assetFor(type,value){
  if(type==='mood')return 'assets/'+moods[value];
  const template=document.createElement('template');template.innerHTML=screens[type==='context'?'333:824':'359:1185'];
  const re=type==='context'?(value==='un concierto'?/concert/:value==='un viaje'?/travel/:/night-club/):(value.includes('guitarra')?/guitar/:value.includes('caja')?/drum/:/synth/);
  return [...template.content.querySelectorAll('[data-name]')].find(e=>re.test(e.dataset.name))?.querySelector('img')?.getAttribute('src');
 }
 function selectedCards(){
  if(!['234:91','304:209','342:996','359:1675','359:1700','359:1711','359:1722','359:1737'].includes(current))return;
  if(current==='234:91'&&!compose.moodChosen)return;
  const faces=[...stage.querySelectorAll('[data-name]')].filter(e=>/at-icons:.*face/.test(e.dataset.name));
  if(faces.length){faces.forEach((e,i)=>{if(i)e.style.display='none'});const image=faces[0].querySelector('img');if(image)image.src=assetFor('mood',compose.mood)}
  if(current!=='234:91')for(const e of [...stage.querySelectorAll('[data-name]')].filter(e=>/concert|travel|night-club/.test(e.dataset.name))){const src=assetFor('context',compose.context),im=e.querySelector('img');if(src&&im)im.src=src}
  if(compose.instrumentChosen)for(const e of [...stage.querySelectorAll('[data-name]')].filter(e=>/synth|guitar|drum-machine/.test(e.dataset.name))){const src=assetFor('instrument',compose.instrument),im=e.querySelector('img');if(src&&im)im.src=src}
  if(current==='342:996')for(const p of words('tu elección')){const r=srel(p);p.textContent=r.l<450?compose.mood:compose.context.replace(/^un[ao]? /,'')}
 }
 // Cards de Estado de ánimo / Contexto / Instrumentos: todos los íconos del mismo tamaño, a la misma altura y centrados en su card
 function alignCards(){
  if(!['234:91','304:209','342:996'].includes(current))return;
  const root=stage.firstElementChild;if(!root)return;
  const rr=root.getBoundingClientRect(),k=rr.width/root.offsetWidth||1;
  const dx=r=>(r.left-rr.left)/k;
  const cards=[...stage.querySelectorAll('div')].filter(e=>{const s=e.getAttribute('style')||'';return /#fe57c7/.test(s)&&/border-radius:20px/.test(s)&&e.offsetWidth>200}).map(e=>{const r=e.getBoundingClientRect();return dx(r)+r.width/k/2});
  if(cards.length!==3)return;
  const SIZE=128,TOP=650;   // centro en 714: entre la línea (634) y "tu elección" (794)
  [...stage.querySelectorAll('[data-name]')].filter(e=>/face|concert|travel|night-club|synth|guitar|drum/.test(e.dataset.name)&&e.offsetWidth>0).forEach(e=>{
   const r=e.getBoundingClientRect(),c=dx(r)+r.width/k/2;
   const cx=cards.reduce((a,b)=>Math.abs(b-c)<Math.abs(a-c)?b:a);
   const pr=(e.offsetParent||root).getBoundingClientRect(),ox=(pr.left-rr.left)/k,oy=(pr.top-rr.top)/k;   // algunos íconos viven dentro de la card y otros en la raíz
   e.style.inset='auto';e.style.left=(cx-ox-SIZE/2)+'px';e.style.top=(TOP-oy)+'px';e.style.width=e.style.height=SIZE+'px';e.style.margin='0';
  });
 }

 function trackBubble(){
  const H=[10,18,30,22,40,28,46,34,20,52,38,24,44,32,16,48,36,26,54,40,22,34,50,28,18,42,30,56,36,20,46,26,38,14,32,22,12];
  const bars=H.map((h,i)=>`<rect class="wv" style="animation-delay:${(i%7)*.09}s" x="${i*9.5}" y="${33-h/2}" width="5" height="${h}" rx="2.5"/>`).join('');
  const el=document.createElement('div');el.className='generated-track';el.dataset.generationPlay='true';el.dataset.mp='0';
  el.innerHTML='<svg class="gt-tail" width="68" height="54" viewBox="0 0 68 54" aria-hidden="true"><polygon points="0,46 68,0 68,54"/></svg>'
   +'<span class="gt-btn" aria-hidden="true"><svg class="gt-play" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20"/><path d="M18 14l13 8-13 8z"/></svg><svg class="gt-pause" viewBox="0 0 44 44"><circle cx="22" cy="22" r="20"/><path d="M16 14h4v16h-4zM24 14h4v16h-4z"/></svg></span>'
   +'<span class="gt-label">Pista generada</span>'
   +`<svg class="gt-wave" viewBox="0 0 350 66" aria-hidden="true">${bars}</svg>`;
  return el;
 }
 function generation(){
  const id=current,token=++generationToken;if(!['73:298','652:1329','652:1343'].includes(id))return;
  const host=stage.querySelector('[data-name="Component 74"],[data-name="Component 99"]');if(!host)return;
  const status=document.createElement('div');status.className='generation-status';status.setAttribute('role','status');status.textContent='Preparando el prompt…';host.appendChild(status);
  stage.querySelectorAll('[data-generation-play]').forEach(e=>e.hidden=true);
  setTimeout(()=>{if(current!==id||generationToken!==token)return;status.classList.add('is-loading');status.innerHTML='<span class="generation-spinner" aria-hidden="true"></span> Generando pista…';},800);
  setTimeout(()=>{if(current!==id||generationToken!==token)return;status.remove();const play=trackBubble();action(play,()=>playExtra(0),'Reproducir pista generada');host.appendChild(play);stage.querySelectorAll('[data-generation-play]').forEach(e=>e.hidden=false);},1600);
 }
 function playExtra(i){
  const entry=pending[current]?.[i];if(!entry)return false;
  if(['73:298','652:1329','652:1343'].includes(current)&&!stage.querySelector('.generated-track')){toast('Esperá a que termine la generación.');return true}
  if(!sound){toast('El sonido está desactivado');return true}
  if(mediaEl&&mediaKey===i){stopMedia();return true}stop();const el=new Audio('audio/'+entry[1]);mediaEl=el;mediaKey=i;
  el.onended=stopMedia;el.play().then(()=>markPlaying(i)).catch(()=>{stopMedia();toast('Falta adjuntar el audio de '+entry[0]+'.')});return true;
 }
 function wireExtra(){
  const entries=pending[current];if(!entries)return;
  for(const [key,[name]]of Object.entries(entries))for(const label of words(noteNames[+key])){const r=srel(label);addHit({l:r.l-10,t:r.t-10,w:r.w+20,h:r.h+20},'Escuchar '+name,()=>playExtra(+key),'mp-circle').dataset.mp=key;}
  if(current==='781:2988'){
   for(const [key,[name]]of Object.entries(entries))for(const label of words(name)){
    const r=srel(label),hit={l:r.l-16,t:r.t-14,w:360,h:72};addHit(hit,'Escuchar '+name,()=>playExtra(+key),'mp-box').dataset.mp=key;
   }
  }
  if(current==='274:260')for(const [key,[name]]of Object.entries(entries))for(const label of words(name)){
   const r=srel(label);const top=r.t+(name==='YACHT'?127:name==='Alan Braxe'?121:99);
   addHit({l:r.l,t:top,w:330,h:52},'Escuchar '+name,()=>playExtra(+key),'mp-box').dataset.mp=key;
  }
  if(['73:298','652:1329','652:1343'].includes(current)){
   for(const p of words('Reproducir')){p.dataset.generationPlay='true';action(p,()=>playExtra(0),'Reproducir pista generada')}
   const bubble=byId('979:2597')[0];
   if(bubble){const r=srel(bubble),hit=addHit({l:r.l,t:r.t,w:r.w,h:r.h},'Reproducir pista generada (DO)',()=>playExtra(0),'mp-box');hit.dataset.generationPlay='true';hit.dataset.mp='0'}
  }
 }
 async function showLibrary(){
  stop();for(const url of libraryUrls)URL.revokeObjectURL(url);libraryUrls=[];
  const entries=await RecordingLibrary.list();const root=$('#dialog-content');root.innerHTML='<h2>Biblioteca de opiniones</h2><p>Las grabaciones se guardan en este navegador y no se envían a ningún servidor.</p>';
  const names={'761:3661':'Herramienta de apoyo','761:3176':'Canciones completas','761:4140':'Depende del uso','761:2688':'En contra'};
  if(!entries.length){const p=document.createElement('p');p.textContent='Todavía no hay grabaciones. Elegí una opinión y compartila al micrófono.';root.appendChild(p)}
  for(const entry of entries){const section=document.createElement('section'),p=document.createElement('p'),audio=document.createElement('audio');p.textContent=(names[entry.category]||'Opinión')+' · '+new Date(entry.createdAt).toLocaleString('es-AR');const url=URL.createObjectURL(entry.blob);libraryUrls.push(url);audio.controls=true;audio.src=url;section.append(p,audio);root.appendChild(section)}
  $('#dialog').showModal();
 }
 function enter(){
  generationToken++;selectedCards();alignCards();wireExtra();generation();
  if(current==='530:1665')for(const [label,value]of [['ALEGRE','alegre'],['TRISTE','triste']])for(const el of words(label))action(el,()=>{compose.mood=value;compose.chord=value==='alegre'?[0,2,4]:[5,0,2];go('501:410')},'Elegir '+value);
 }
 function onNote(i){if(i===7)return false;return playExtra(i)}
 function init(){
  const b=document.createElement('button');b.id='opinions-library';b.title='Biblioteca (B)';b.innerHTML='Biblioteca<kbd>B</kbd>';b.onclick=showLibrary;$('#toolbar nav').appendChild(b);
 }
 return {enter,onNote,init,showLibrary};
})();
