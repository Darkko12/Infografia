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


 // Pantallas con fotos de artistas + barras de audio (Composición tradicional y asistida)
 const ARTIST_SCREENS=['539:447','781:2988'];
 // Composición asistida: donde el diseño decía "Lali" ahora va Tini (nombre, foto y audio)
 function renameTini(){
  if(current!=='781:2988')return;
  for(const p of words('Lali'))p.textContent='Tini';
  const ph=stage.querySelector('[data-photo="5"]');
  if(ph){ph.dataset.name='Tini';const im=ph.querySelector('img');if(im){im.setAttribute('src','assets/artist-tini.jpg');im.alt='Tini'}}
 }
 /* Diseño original: la tecla (DO, RE…) se superpone al borde de la foto. Al tocar y brillar, el aro de la foto
    queda POR DEBAJO de la tecla (la tecla sube de capa y deja pasar los clics a las zonas de toque).
    Los nombres de los artistas se agrandan sin tocar el contenedor del audio. */
 function artistRows(){
  if(!ARTIST_SCREENS.includes(current))return;
  const KEY=42,NAME_PX=16;
  for(const p of [...stage.querySelectorAll('p')]){
   if(!noteNames.includes(p.textContent.trim())||Math.abs(srel(p).w-KEY)>4)continue;
   const c=p.previousElementSibling;
   for(const e of [c&&c.tagName==='DIV'?c:null,p])if(e){e.style.zIndex=7;e.style.pointerEvents='none'}
  }
  const sty=e=>e.getAttribute('style')||'';
  const boxes=[...stage.querySelectorAll('div')].filter(d=>/background(-color)?:#16194e/.test(sty(d))).map(srel).filter(b=>b.w>300&&b.w<420&&b.h>50&&b.h<100);
  const names=[...stage.querySelectorAll('p')].filter(p=>{const r=srel(p);return boxes.some(b=>r.l>=b.l&&r.l<b.l+b.w&&r.t>=b.t&&r.t<b.t+b.h)&&!noteNames.includes(p.textContent.trim())});
  const fitted=[];
  for(const name of names){
   const r=srel(name),box=boxes.find(b=>r.l>=b.l&&r.l<b.l+b.w&&r.t>=b.t&&r.t<b.t+b.h);
   name.style.whiteSpace='nowrap';name.style.width='auto';name.style.overflow='visible';
   name.style.lineHeight='19px';name.style.height='19px';name.style.top=(parseFloat(name.style.top)-1)+'px';
   let fs=NAME_PX;name.style.fontSize=fs+'px';
   const limit=box.l+box.w-14;
   while(fs>11&&srel(name).l+srel(name).w>limit){fs-=.5;name.style.fontSize=fs+'px'}
   fitted.push({name,fs});
  }
  const same=Math.min(...fitted.map(f=>f.fs));
  fitted.forEach(f=>{f.name.style.fontSize=same+'px'});
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
  if(mediaEl&&mediaKey===i){if(mediaEl.paused)mediaEl.play().then(()=>markPlaying(i)).catch(()=>toast('No se pudo continuar el audio'));else{mediaEl.pause();markPlaying(-1)}return true}stop();const el=BackgroundMusic.track(new Audio('audio/'+entry[1]));mediaEl=el;mediaKey=i;
  el.onended=stopMedia;el.play().then(()=>markPlaying(i)).catch(()=>{stopMedia();toast('Falta adjuntar el audio de '+entry[0]+'.')});return true;
 }
 function wireExtra(){
  const entries=pending[current];if(!entries)return;
  // Círculo de la nota: siempre un cuadrado (ancho = alto) centrado en el círculo de color, para que "SOL" no se deforme en óvalo
  const circleRect=label=>{
   const prev=label.previousElementSibling,pr=prev&&prev.tagName==='DIV'?srel(prev):null;
   if(pr&&pr.w>20&&pr.w<100&&Math.abs(pr.w-pr.h)<2)return pr;
   const r=srel(label),cx=r.l+r.w/2,cy=r.t+r.h/2,d=Math.max(r.h+20,36);
   return {l:cx-d/2,t:cy-d/2,w:d,h:d};
  };
  for(const [key,[name]]of Object.entries(entries))for(const label of words(noteNames[+key])){addHit(circleRect(label),'Escuchar '+name,()=>playExtra(+key),'mp-circle').dataset.mp=key;}
  if(current==='781:2988'){
   // El aro verde se ajusta exactamente al recuadro oscuro de cada audio (357×70), no a una medida estimada desde el nombre
   const boxes=[...stage.querySelectorAll('div')].filter(d=>/background:#16194e/.test(d.getAttribute('style')||'')).map(srel).filter(b=>b.w>300&&b.w<420&&b.h>50&&b.h<100);
   for(const [key,[name]]of Object.entries(entries))for(const label of words(name)){
    const r=srel(label),cx=r.l+r.w/2,cy=r.t+r.h/2;
    const b=boxes.find(b=>cx>=b.l&&cx<=b.l+b.w&&cy>=b.t&&cy<=b.t+b.h)||{l:r.l-24,t:r.t-8,w:357,h:71};
    const hit=addHit(b,'Escuchar '+name,()=>playExtra(+key),'mp-box');hit.dataset.mp=key;hit.style.borderRadius='10px';
   }
  }
  if(current==='274:260'){
   // de arriba hacia abajo: YACHT (FA) · Alan Braxe (MI) · Fred Falke (LA). Se toca la barra de audio o la foto.
   const ROW_KEYS=[3,2,5];
   const pills=[...stage.querySelectorAll('div')].filter(d=>{const s=d.getAttribute('style')||'';return /border-color:#70dec6/.test(s)&&/border-radius:19\.76px/.test(s)}).map(srel).sort((a,b)=>a.t-b.t).slice(0,3);
   pills.forEach((box,n)=>{const key=ROW_KEYS[n];addHit(box,'Escuchar '+entries[key][0],()=>playExtra(key),'mp-box').dataset.mp=key});
   ['483:1409','483:1417','483:1426'].forEach((id,n)=>{const el=byId(id)[0];if(!el)return;const key=ROW_KEYS[n],h=addHit(srel(el),'Escuchar '+entries[key][0],()=>playExtra(key),'mp-photo');h.dataset.mp=key;h.style.borderRadius='50%'});
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
  for(const entry of entries){const section=document.createElement('section'),p=document.createElement('p'),audio=document.createElement('audio'),del=document.createElement('button');p.textContent=(names[entry.category]||'Opinión')+' · '+new Date(entry.createdAt).toLocaleString('es-AR');const url=URL.createObjectURL(entry.blob);libraryUrls.push(url);audio.controls=true;audio.src=url;
   del.type='button';del.className='delete-recording';del.textContent='Eliminar';del.setAttribute('aria-label','Eliminar esta grabación');
   del.onclick=async()=>{
    if(!confirm('¿Eliminar esta grabación? No se puede deshacer.'))return;
    del.disabled=true;audio.pause();
    try{await RecordingLibrary.remove(entry.id)}catch{del.disabled=false;alert('No se pudo eliminar la grabación.');return}
    URL.revokeObjectURL(url);libraryUrls=libraryUrls.filter(u=>u!==url);section.remove();
    if(!root.querySelector('section')){const e=document.createElement('p');e.textContent='Todavía no hay grabaciones. Elegí una opinión y compartila al micrófono.';root.appendChild(e)}
   };
   section.append(p,audio,del);root.appendChild(section)}
  $('#dialog').showModal();
 }
 // Ajustes (composición tradicional): "Antes" (DO · Capturar el sonido) y "Después" (RE · Mezcla y Masterización), cada uno con su audio
 function adjustments(){
  if(current!=='616:870')return;
  const grp=id=>byId(id)[0];
  const place=(id,l,t)=>{const g=grp(id);if(!g||!g.firstElementChild)return;[...g.children].forEach(c=>{c.style.translate=''});const r=srel(g.firstElementChild);[...g.children].forEach(c=>{c.style.translate=(l-r.l)+'px '+(t-r.t)+'px'})};
  for(const id of ['616:1022','616:1023','768:2548']){const e=grp(id);if(e)e.style.display='none'}      // Masterizar y MI ya no van
  place('768:2542',628,428);place('616:920',628,504);        // Antes: DO + audio
  place('768:2545',628,620);place('616:1006',628,696);       // Después: RE + audio
  const text=(id,top,l1,l2)=>{const p=grp(id);if(!p)return;Object.assign(p.style,{left:'714px',top:top+'px',width:'600px',height:'auto',lineHeight:'28px',whiteSpace:'nowrap'});p.innerHTML=l1+'<br>'+l2};
  text('616:917',436,'Capturar el sonido:','voces e instrumentos');
  text('616:1005',628,'Mezcla y Masterización:','Equilibrio, combinación y resultado final');
  const root=stage.firstElementChild;
  [['Antes',445],['Después',637]].forEach(([t,top])=>{if(root.querySelector('[data-df-label="'+t+'"]'))return;const p=document.createElement('p');p.dataset.dfLabel=t;p.textContent=t;p.style.cssText=`position:absolute;margin:0;left:470px;top:${top}px;font:400 20px/24px Michroma,sans-serif;color:#5cf8be;pointer-events:none`;root.appendChild(p)});
 }

 /* Pantalla "Construcción del prompt" (359:1487): el texto y los 3 íconos dependen de lo que eligió la persona
    (estado de ánimo + contexto + instrumento). Los textos salen del documento PROMPTS. */
 function promptScreen(){
  if(current!=='359:1487')return;
  const id=current,p=[...stage.querySelectorAll('p')].find(e=>/^\s*Quiero una canci/.test(e.textContent)),root=stage.firstElementChild;
  if(!p||!root)return;
  const melody={triste:'triste',alegre:'feliz',enojada:'que transmita enojo'}[compose.mood]||'triste';
  const tool={'sintetizador':'el sintetizador','caja de ritmos':'la caja de ritmos','guitarra eléctrica':'la guitarra eléctrica'}[compose.instrument]||'el sintetizador';
  p.textContent=`Quiero una canción de electropop con una melodía ${melody}, pensada para ${compose.context}. El instrumento que más quiero que se destaque es ${tool}.`;
  // el texto más largo (enojo) se achica lo justo para que siempre entre en 3 renglones y deje lugar a los íconos
  const fit=()=>{if(current!==id)return;let fs=24;p.style.height='auto';p.style.fontSize=fs+'px';while(fs>16&&p.offsetHeight>96){fs-=1;p.style.fontSize=fs+'px'}};
  fit();if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);
  // íconos debajo del texto, centrados en la card: ánimo · contexto · instrumento
  root.querySelectorAll('.prompt-icons').forEach(e=>e.remove());
  const box=document.createElement('div');box.className='prompt-icons';
  box.style.cssText='position:absolute;left:521px;top:752px;width:400px;height:56px;display:flex;justify-content:center;align-items:center;gap:16px;pointer-events:none';
  [['mood',compose.mood,'Estado de ánimo: '+melody],['context',compose.context,'Contexto: '+compose.context],['instrument',compose.instrument,'Instrumento: '+compose.instrument]].forEach(([type,value,alt])=>{
   const src=assetFor(type,value);if(!src)return;
   const im=document.createElement('img');im.src=src;im.alt=alt;im.style.cssText='width:56px;height:56px;object-fit:contain;display:block'+(type==='instrument'&&/guitarra/.test(value)?';transform:scale(1.28)':'');box.appendChild(im);
  });
  root.appendChild(box);
 }

 /* Pantalla final "4. Resultado" (359:1764): botón Inicio como en el Núcleo 1, chip del acorde según el ánimo elegido
    (Do mayor / La menor / Si disminuido) y onda de audio que se anima mientras suena la canción. */
 function resultScreen(){
  if(current!=='359:1764')return;
  const root=stage.firstElementChild;if(!root)return;
  const NOTE_ASSET=['64765','1b75b','8699e','44605','0316a','80c56','01e39'],NAMES=['DO','RE','MI','FA','SOL','LA','SI'];
  const chords={alegre:{name:'Do mayor',notes:[0,2,4]},triste:{name:'La menor',notes:[5,0,2]},enojada:{name:'Si disminuido',notes:[6,1,3]}};
  const chord=chords[compose.mood]||chords.triste;
  // 1) botón "Inicio →" (mismo diseño que el del juego del Núcleo 1); conserva el id 410:278 que usa el flujo de teclas
  const old=byId('410:278')[0],tpl=document.createElement('template');tpl.innerHTML=screens['101:638'];
  const inicio=tpl.content.querySelector('a[data-node-id="850:3170"]');
  if(old&&inicio){
   inicio.dataset.nodeId='410:278';inicio.dataset.name='Inicio';old.replaceWith(inicio);
   const label=[...inicio.querySelectorAll('p')].find(p=>p.textContent.trim()==='Inicio');
   const toHome=()=>{if(window.Flow&&Flow.gated(current)){Flow.nudge();return}go('56:341')};   // respeta la compuerta del acorde
   action(inicio,toHome,'Inicio');if(label)action(label,toHome,'Inicio');
  }
  // 2) chip del acorde
  byId('612:1024').forEach(e=>e.remove());
  const chip=document.createElement('div');chip.dataset.name='Chip acorde';
  chip.style.cssText='position:absolute;left:599px;top:840px;width:244px;height:122px';
  const circles=chord.notes.map((n,k)=>`<img alt="" src="assets/${NOTE_ASSET[n]}.svg" style="position:absolute;left:${55+k*48}px;top:71px;width:38px;height:38px;pointer-events:none">`
   +`<p style="position:absolute;margin:0;left:${55+k*48}px;top:71px;width:38px;height:38px;line-height:38px;text-align:center;font:400 16.5px/38px Lexend,sans-serif;color:#fff;white-space:nowrap">${NAMES[n]}</p>`).join('');
  chip.innerHTML=`<img alt="" src="assets/3adcc.svg" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none">`
   +`<p class="chord-name" style="position:absolute;margin:0;left:0;top:27px;width:244px;text-align:center;font:700 24px/36px Orbitron,sans-serif;color:#fff;white-space:nowrap">${chord.name}</p>`+circles;
  root.appendChild(chip);
  const nameEl=chip.querySelector('.chord-name');if(nameEl.scrollWidth>210)nameEl.style.fontSize='19px';
  // 3) reproductor: botón play/pausa + onda animada (misma animación que las barras del Núcleo 1)
  ['359:1779','359:1783','359:1785','359:1787','359:1789'].forEach(id=>byId(id).forEach(e=>e.remove()));
  const H=[10,18,30,22,40,28,46,34,20,52,38,24,44,32,16,48,36,26,54,40,22,34,50,28,18,42,30,56,36,20,46,26,38,14,32,22,12];
  const bars=H.map((h,i)=>`<rect class="wv" style="animation-delay:${(i%7)*.09}s" x="${i*9.5}" y="${45-h*.68}" width="5" height="${h*1.36}" rx="2.5"/>`).join('');
  const player=document.createElement('div');player.className='result-player';player.dataset.mp='99';
  player.innerHTML='<svg class="rp-btn" viewBox="0 0 65 65" width="65" height="65" aria-hidden="true"><g class="rp-play"><circle cx="32.5" cy="32.5" r="26.2"/><path d="M26 21l19 11.5L26 44z"/></g><g class="rp-pause"><circle cx="32.5" cy="32.5" r="26.2"/><path d="M24 21h6v23h-6zM35 21h6v23h-6z"/></g></svg>'
   +`<svg class="rp-wave" viewBox="0 0 350 90" width="350" height="90" aria-hidden="true">${bars}</svg>`;
  root.appendChild(player);
  action(player,melody,'Escuchar la canción');
 }

 /* Núcleo 3.3 (productores): el nombre "YACHT" es una imagen de 98px y su caja era más ancha (308px), por eso se veía enorme */
 function producersScreen(){
  if(current!=='274:260')return;
  const y=stage.querySelector('[data-node-id="483:1413"]');if(y){y.style.width='98px';y.style.right='auto';y.style.height='32px'}
 }
 /* Núcleo 3.1 / 3.1.2 (resultados de frecuencia): la mascota marca dónde pertenece la persona según lo que contestó.
    Habitual → mascota con micrófono sobre el 24%; esporádica → mascota de brazos cruzados junto al 45%.
    Las 8 pantallas de actitudes (se llega a ellas desde 476:540 / 769:4700) mantienen la misma mascota y animan el gráfico de actitudes. */
 const ATTITUDES=['247:83','769:4752','769:4824','769:4788','769:4994','769:5030','769:5066','769:5102'];
 function frequencyScreen(){
  const results=current==='476:540'||current==='769:4700',attitudes=ATTITUDES.includes(current);
  if(!results&&!attitudes)return;
  const root=stage.firstElementChild;if(!root)return;
  let hab=current==='476:540';
  if(attitudes){   // en el gráfico de frecuencia, la porción separada hacia arriba es "habitual"; hacia abajo, "esporádica"
   const p=root.querySelector('.n3-chart[data-chart="frecuencia"] path[data-seg="hab"]');
   hab=!!p&&/translate\(\s*-?[\d.]+[\s,]+-/.test(p.getAttribute('transform')||'');
  }
  const P=hab?{img:'mascota-micro',w:126,h:130,l:88,t:329,bl:45,bt:426}:{img:'mascota-brazos',w:97,h:130,l:75,t:592,bl:36,bt:700};
  root.querySelectorAll('.freq-mascot').forEach(e=>e.remove());
  const mk=(src,css,alt)=>{const im=document.createElement('img');im.className='freq-mascot';im.src='assets/'+src+'.png';im.alt=alt||'';im.style.cssText='position:absolute;pointer-events:none;z-index:6;'+css;root.appendChild(im)};
  mk(P.img,`left:${P.l}px;top:${P.t}px;width:${P.w}px;height:${P.h}px`);
  mk('aca-burbuja',`left:${P.bl}px;top:${P.bt}px;width:170px;height:53px`);
  mk('aca-texto',`left:${P.bl+11}px;top:${P.bt+26.5}px;width:148px;height:14px`,'Acá perteneces vos!');
  if(attitudes)attitudesIntro(root);
 }
 /* Entrada del gráfico de actitudes. La mascota y el gráfico de frecuencia (con su línea y título) ya están
    desde el primer cuadro y no se tocan. Secuencia:
    1) el gráfico crece un poco hasta su tamaño normal (nunca lo pasa)  2) la porción elegida se separa
    3) la línea nace en el punto, sube y avanza hacia el título  4) el título se revela de izquierda a derecha. */
 function attitudesIntro(root){
  const chart=root.querySelector('.n3-chart[data-chart="actitudes"]'),lead=root.querySelector('.n3-lead-r');
  const title=[...root.querySelectorAll('p')].find(p=>p.textContent.trim()==='Actitudes frente a la IA');
  if(!chart||!lead||!title||!root.animate||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const EASE='cubic-bezier(.22,1,.36,1)',D0=150,GROW=650,SPLIT=650,LINE=D0+GROW+SPLIT+60;
  chart.animate([{transform:'scale(.86)',opacity:0},{transform:'scale(1)',opacity:1}],{duration:GROW,delay:D0,easing:EASE,fill:'backwards'});
  const segs=[...chart.querySelectorAll('svg path[data-seg]')].map((p,i)=>{
   const m=(p.getAttribute('transform')||'').match(/translate\(\s*(-?[\d.]+)[\s,]+(-?[\d.]+)\s*\)/);
   return {p,i,dx:m?+m[1]:0,dy:m?+m[2]:0}}).sort((a,b)=>Math.hypot(b.dx,b.dy)-Math.hypot(a.dx,a.dy));
  const sel=segs[0];
  if(sel&&Math.hypot(sel.dx,sel.dy)>1){
   const {p,i,dx,dy}=sel,glow=p.style.filter||'none',t={duration:SPLIT,delay:D0+GROW,easing:EASE,fill:'backwards'};
   p.removeAttribute('transform');p.style.transform=`translate(${dx}px,${dy}px)`;
   p.animate([{transform:'translate(0px,0px)',filter:'none'},{transform:`translate(${dx}px,${dy}px)`,filter:glow}],t);
   const label=[...chart.children].filter(e=>e.tagName==='DIV')[i];   // el % de la porción viaja con ella
   if(label)label.animate([{translate:`${-dx}px ${-dy}px`},{translate:'0 0'}],t);
  }
  lead.classList.add('n3-lead-anim');lead.innerHTML='<i class="dot"></i><i class="v"></i><i class="h"></i>';
  const [dot,v,h]=lead.children,REVEAL={duration:560,delay:LINE+380,easing:'cubic-bezier(.3,.7,.2,1)',fill:'backwards'};
  dot.animate([{opacity:0,transform:'scale(0)'},{opacity:1,transform:'scale(1)'}],{duration:240,delay:LINE,easing:EASE,fill:'backwards'});
  v.animate([{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:260,delay:LINE+140,easing:'ease-out',fill:'backwards'});
  h.animate([{transform:'scaleX(0)'},{transform:'scaleX(1)'}],REVEAL);
  title.style.width='max-content';   // el recorte sigue el texto real
  title.animate([{clipPath:'inset(0 100% 0 0)',translate:'-12px 0'},{clipPath:'inset(0 0 0 0)',translate:'0 0'}],REVEAL);   // translate (no transform): el título ya usa transform para anclarse a la derecha
 }
 function enter(){
  generationToken++;promptScreen();resultScreen();producersScreen();frequencyScreen();selectedCards();alignCards();renameTini();artistRows();adjustments();wireExtra();generation();
  if(current==='530:1665')for(const [label,value]of [['ALEGRE','alegre'],['TRISTE','triste']])for(const el of words(label))action(el,()=>{compose.mood=value;compose.chord=value==='alegre'?[0,2,4]:[5,0,2];go('501:410')},'Elegir '+value);
 }
 function onNote(i){if(i===7)return false;return playExtra(i)}
 function init(){
  const b=document.createElement('button');b.id='opinions-library';b.title='Biblioteca (B)';b.innerHTML='Biblioteca<kbd>B</kbd>';b.onclick=showLibrary;$('#toolbar nav').appendChild(b);
 }
 function hasAudio(i){return !!(pending[current]&&pending[current][i])}
 return {enter,onNote,init,showLibrary,hasAudio,assetFor};
})();
