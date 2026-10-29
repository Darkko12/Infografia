'use strict';
const $=s=>document.querySelector(s),stage=$('#stage');let screens,reactions,current='88:2',history=[],sound=true,audio,sequenceTimer,noticeTimer,step=0,recording,recorder,recordedUrl;
const freq=[261.63,293.66,329.63,349.23,392,440,493.88],noteNames=['DO','RE','MI','FA','SOL','LA','SI'];const keys=['a','s','d','f','g','h','j','k'];const compose={mood:'triste',context:'una fiesta',instrument:'sintetizador',chord:[5,0,2]};
const next={'88:2':'475:262','475:262':'508:509','508:509':'507:378','507:378':'56:341','53:3':'652:1189','652:1189':'73:298','73:298':'73:402','652:1329':'73:402','652:1343':'73:402','73:402':'73:564','73:564':'101:638','101:638':'56:341','234:91':'mood','530:1123':'530:1665','530:1665':'501:410','501:410':'290:278','290:278':'304:209','304:209':'333:824','333:824':'326:564','326:564':'597:916','597:916':'342:996','342:996':'359:1185','359:1185':'359:1170','359:1170':'359:1487','359:1487':'359:1675','359:1675':'359:1700','359:1700':'359:1711','359:1711':'359:1722','359:1722':'359:1737','359:1737':'359:1764','359:1764':'56:341','708:391':'274:260','476:540':'274:260','769:4700':'274:260','274:260':'476:823','476:823':'761:2688','761:2688':'761:4140','761:3176':'56:341','761:3661':'761:3176','761:4140':'761:3661'};
for(const id of ['247:83','769:4752','769:4788','769:4824','769:4994','769:5030','769:5066','769:5102'])next[id]='274:260';

/* ===== Audios por pantalla =====
   Clave: id de la pantalla. Valor: {índice de nota: archivo}. 0=DO(A) 1=RE(S) 2=MI(D) 3=FA(F) 4=SOL(G) 5=LA(H) 6=SI(J).
   Se reproduce uno a la vez. La tecla K permite continuar el recorrido.
   Para agregar audios/videos a otras pantallas, sumá una entrada acá y copiá el archivo a /audio. */
const MEDIA={
 '539:447':{0:'audio/Shakira.mp3',1:'audio/BadBunny.mp3',2:'audio/Soledad.mp3',3:'audio/MiloJ.mp3',4:'audio/Angela.mp3',5:'audio/Lali.mp3'},
 // ajustes: DO Capturar el sonido · RE Mezclar · MI Masterizar
 '616:870':{0:'audio/Capturar.mp3',1:'audio/Mezclar.mp3',2:'audio/Masterizar.mp3'},
 // estructura (según el rótulo de cada tecla en pantalla): DO Introducción · RE Estrofa · MI Puente · FA Estribillo · SOL Puente · LA Solo · SI CODA
 '585:498':{0:'audio/Intro.mp3',1:'audio/Estrofa.mp3',2:'audio/Puente.mp3',3:'audio/Estribillo.mp3',4:'audio/Puente2.mp3',5:'audio/Solo.mp3',6:'audio/CODA.mp3'},
 // juego: DO reproduce la canción
 '101:638':{0:'audio/Cancion.mp3'}
};
let mediaEl=null,mediaKey=-1;
function markPlaying(i){stage.querySelectorAll('[data-mp]').forEach(e=>e.classList.toggle('mp-on',+e.dataset.mp===i))}
function stopMedia(){if(mediaEl){mediaEl.onended=null;mediaEl.pause();mediaEl=null}mediaKey=-1;markPlaying(-1)}
function playMedia(i){
 const src=MEDIA[current]&&MEDIA[current][i];if(!src)return false;
 if(!sound){toast('El sonido está desactivado');return true}
 if(mediaEl&&mediaKey===i){stopMedia();return true}     // misma tecla: pausa
 stopMedia();                                           // solo suena uno a la vez
 const el=new Audio(src);mediaEl=el;mediaKey=i;
 el.onended=()=>{if(mediaEl===el)stopMedia()};
 el.play().catch(()=>{if(mediaEl===el)stopMedia();toast('No se pudo reproducir el audio')});
 markPlaying(i);return true}
function addHit(r,label,fn,cls){const root=stage.firstElementChild,d=document.createElement('div');d.className='media-hit '+(cls||'');d.style.cssText=`left:${r.l}px;top:${r.t}px;width:${r.w}px;height:${r.h}px`;root.appendChild(d);action(d,fn,label);return d}
function wireMedia(){
 const m=MEDIA[current];if(!m)return;
 const sty=d=>d.getAttribute('style')||'';
 const boxes=[...stage.querySelectorAll('div')].filter(d=>/background-color:#16194e/.test(sty(d))).map(srel).filter(b=>b.w>150&&b.w<600&&b.h>40&&b.h<160);
 const labels=[...stage.querySelectorAll('p')].filter(p=>noteNames.includes(p.textContent.trim()));
 for(const p of labels){
  const i=noteNames.indexOf(p.textContent.trim());if(!m[i])continue;
  const lr=srel(p),cx=lr.l+lr.w/2,cy=lr.t+lr.h/2;
  const dist=b=>Math.hypot(Math.max(b.l-cx,0,cx-(b.l+b.w)),Math.max(b.t-cy,0,cy-(b.t+b.h)));
  // la barra de audio que corresponde a la tecla: la más cercana que esté debajo o a la derecha del círculo
  const best=boxes.filter(b=>b.t+b.h>lr.t&&b.l+b.w>lr.l).map(b=>[dist(b),b]).sort((x,y)=>x[0]-y[0])[0];
  const lab='Reproducir audio '+noteNames[i];
  if(best&&best[0]<100)addHit(best[1],lab,()=>playMedia(i),'mp-box').dataset.mp=i;
  const c=p.previousElementSibling,cr=c&&c.tagName==='DIV'?srel(c):null;
  const circ=cr&&cr.w>20&&cr.w<100?cr:{l:cx-Math.max(lr.h*0.95,17),t:cy-Math.max(lr.h*0.95,17),w:Math.max(lr.h*1.9,34),h:Math.max(lr.h*1.9,34)};
  addHit(circ,lab,()=>playMedia(i),'mp-circle').dataset.mp=i;
 }
}
/* ===== Videos por pantalla =====
   rect=[x,y,ancho,alto] del recuadro del video en el diseño (1440x1024). play=nodos del ícono ▶ que se ocultan mientras reproduce.
   clips=lista en orden. Si hay más de uno, K (o la flecha →) pasa al siguiente y después del último vuelve al primero. K nunca cambia de pantalla.
   Para sumar otro video: copialo a /video (mp4 H.264) y agregalo a clips. */
const VIDEO={
 '546:1129':{rect:[526,429,625,357],play:['546:1263'],clips:['video/Melodia.mp4']},
 '546:1270':{rect:[494,484,690,242],play:['549:1310'],counter:'850:3177',arrow:'549:1314',pos:'center bottom',clips:['video/Ritmo1.mp4','video/Ritmo2.mp4','video/Ritmo3.mp4']},
 '566:1774':{rect:[525,411,625,357],play:['566:1713','566:1714','566:1715','566:1716'],counter:'851:3208',arrow:'566:1748',clips:['video/Armonia1.mp4','video/Armonia2.mp4','video/Armonia3.mp4','video/Armonia4.mp4']},
 '616:1040':{rect:[533,436,611,344],play:['616:1146'],clips:['video/ObraTradicional.mp4']}
};
let vid=null;
function srel(el){const sb=stage.getBoundingClientRect(),sc=sb.width/1440||1,r=el.getBoundingClientRect();return{l:(r.left-sb.left)/sc,t:(r.top-sb.top)/sc,w:r.width/sc,h:r.height/sc}}
function setPlayIcons(show){if(!vid)return;vid.cfg.play.forEach(id=>byId(id).forEach(e=>{e.style.visibility=show?'visible':'hidden'}))}
function setCounter(){const c=vid.cfg.counter&&byId(vid.cfg.counter)[0];if(c)c.textContent=(vid.idx+1)+'/'+vid.cfg.clips.length}
function loadClip(i,autoplay){
 vid.idx=i;vid.started=false;setCounter();setPlayIcons(true);
 vid.el.src=vid.cfg.clips[i]+'#t=0.1';vid.el.load();
 if(autoplay)playVideo()}
function playVideo(){
 if(!vid)return;const v=vid.el;
 if(!v.paused){v.pause();return}
 v.muted=!sound;v.play().catch(()=>toast(v.error?'Falta el video: '+vid.cfg.clips[vid.idx].split('/').pop():'No se pudo reproducir el video'))}
function nextClip(){
 if(!vid)return false;
 const n=vid.cfg.clips.length;
 if(n>1)loadClip((vid.idx+1)%n,vid.started);   // 4/4 vuelve a 1/4; si ya estaba mirando, sigue reproduciendo el próximo
 return true}
function wireVideo(){
 vid=null;const cfg=VIDEO[current];if(!cfg)return;
 const root=stage.firstElementChild,[l,t,w,h]=cfg.rect;
 const v=document.createElement('video');v.className='clip';v.playsInline=true;v.preload='auto';
 v.style.cssText=`left:${l}px;top:${t}px;width:${w}px;height:${h}px;object-fit:${cfg.fit||'cover'};object-position:${cfg.pos||'center'}`;
 root.appendChild(v);vid={el:v,cfg,idx:0,started:false};
 v.addEventListener('play',()=>{vid.started=true;setPlayIcons(false)});
 v.addEventListener('pause',()=>setPlayIcons(true));
 v.addEventListener('ended',()=>setPlayIcons(true));
 v.addEventListener('error',()=>{setPlayIcons(true);toast('Falta el video: '+cfg.clips[vid.idx].split('/').pop())});
 v.addEventListener('click',playVideo);
 cfg.play.forEach(id=>byId(id).forEach(e=>{e.style.zIndex=7;e.style.pointerEvents='none'}));   // el ▶ queda sobre el video y no tapa los clicks
 const hit=(r,label,fn)=>{const d=document.createElement('div');d.className='media-hit';d.style.cssText=`left:${r.l}px;top:${r.t}px;width:${r.w}px;height:${r.h}px`;root.appendChild(d);action(d,fn,label)};
 const row=text=>{const p=words(text)[0];if(!p)return null;const r=srel(p);return{l:612,t:r.t-8,w:328,h:r.h+16}};
 const rp=row('Reproducir');if(rp)hit(rp,'Reproducir video',playVideo);
 if(cfg.clips.length>1){
  const rs=row('Siguiente');if(rs)hit(rs,'Siguiente video',nextClip);
  const ar=cfg.arrow&&byId(cfg.arrow)[0];if(ar){const r=srel(ar);hit({l:r.l-10,t:r.t-10,w:r.w+20,h:r.h+20},'Siguiente video',nextClip)}}
 loadClip(0,false)}

/* ===== Juego: ¿podés reconocer cómo se creó esta canción? =====
   DO reproduce la canción. RE/MI/FA = tradicional/asistida/autónoma. opts = nodos de las opciones, correct = índice de la correcta. */
const GAME={'101:638':{opts:['659:1563','659:1599','659:1595'],keys:['RE','MI','FA'],correct:2}};
let game=null;
function answer(i){
 if(!game||game.done)return;game.done=true;
 const {opts,correct}=game.cfg,paint=(k,ms)=>setTimeout(()=>{const el=byId(opts[k])[0];if(el)el.classList.add(k===correct?'opt-ok':'opt-bad')},ms);
 paint(i,0);                                  // primero se anima la que eligió
 opts.forEach((_,k)=>{if(k!==i)paint(k,350)}); // después se revelan las otras
 toast(i===correct?'¡Correcto! Esta canción se creó con composición autónoma.':'Casi. Esta canción se creó con composición autónoma.')}
function wireGame(){
 game=null;const cfg=GAME[current];if(!cfg)return;game={cfg,done:false};
 cfg.opts.forEach((id,i)=>{const el=byId(id)[0];if(!el)return;el.classList.add('opt');action(el,()=>answer(i),'Elegir '+el.textContent.trim())});
 const labels=[...stage.querySelectorAll('p')].filter(p=>cfg.keys.includes(p.textContent.trim()));
 for(const p of labels){const i=cfg.keys.indexOf(p.textContent.trim()),c=p.previousElementSibling,r=c&&c.tagName==='DIV'?srel(c):srel(p);addHit(r,'Elegir opción '+p.textContent.trim(),()=>answer(i),'mp-circle')}}


function fixPrompts(){
 const re=/^(Crea una canción con\s+ritmo\s+(?:de\s+)?)([^,]+,\s*voz)(\s+)([^,]+)(,\s*sonido\s+)(\S+)(\s+y un estribillo\s+)([^.]+)(\.)$/i;
 let fixed=0;
 for(const p of [...stage.querySelectorAll('p')]){
  const m=p.textContent.replace(/\u200b/g,'').trim().match(re);if(!m)continue;
  const h=s=>`<span class="hl">${s}</span>`;
  p.style.lineHeight='normal';p.style.whiteSpace='normal';p.innerHTML=(m[1]+h(m[2])+m[3]+h(m[4])+m[5]+h(m[6])+m[7]+h(m[8])+m[9]).replace(/ {2,}/g,' ');fixed++}
 if(!fixed)return;
 for(const el of [...stage.querySelectorAll('p,div')])   // palabras sueltas superpuestas (color violeta fijo)
  if(el.style.color==='rgb(87, 61, 205)'&&!el.querySelector('.hl')&&!el.classList.contains('hl')&&el.dataset.nodeId)el.remove()}
const traditional=['539:447','546:1129','546:1270','566:1774','585:498','616:870','616:1040'];const assisted=['781:2988','781:3218','781:3138','686:598','690:1108'];
/* Los avisos ya no se dibujan en pantalla: salen por la consola del navegador (F12) */
function toast(t){console.log('[Electria] '+t)}
function fit(){const v=$('#viewport'),scale=Math.min(v.clientWidth/1440,v.clientHeight/1024);stage.style.transform=`scale(${scale})`;stage.style.left=(v.clientWidth-1440*scale)/2+'px';stage.style.top=(v.clientHeight-1024*scale)/2+'px'}
function stop(){stopMedia();stage.querySelectorAll('video').forEach(v=>v.pause());clearTimeout(sequenceTimer);if(audio){audio.close().catch(()=>{});audio=null;}stage.querySelectorAll('.playing').forEach(e=>e.classList.remove('playing'))}
function ensureAudio(){if(!audio)audio=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();return audio}
function note(i,duration=.65,delay=0,wave='sine'){if(!sound)return;const ctx=ensureAudio(),t=ctx.currentTime+delay;const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type=wave;osc.frequency.value=freq[((i%7)+7)%7]*(i>=7?2:1);gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(.15,t+.012);gain.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(gain).connect(ctx.destination);osc.start(t);osc.stop(t+duration+.03);const b=document.querySelector(`[data-note="${i}"]`);if(b){setTimeout(()=>b.classList.add('active'),delay*1000);setTimeout(()=>b.classList.remove('active'),(delay+duration)*1000)}}
function chord(type=0){(type===0?[0,2,4]:type===1?[5,0,2]:[6,1,3]).forEach(i=>note(i,1))}
function melody(){stop();const minor=compose.mood==='triste'||compose.mood==='enojada';const notes=minor?[5,0,2,0,4,6,1,6,5,0,2,4,3,2,0,5]:[0,2,4,2,1,3,5,3,0,2,4,6,5,4,2,0];const speed=compose.context==='una fiesta'?.2:.28;const wave=compose.instrument.includes('guitarra')?'sawtooth':compose.instrument.includes('caja')?'square':'triangle';notes.forEach((n,i)=>note(n,.38,i*speed,wave));toast('Demostración sonora · notas sintetizadas según tus elecciones')}
function toggleDemo(el){if(el.classList.contains('playing')){stop();return;}melody();el.classList.add('playing');setTimeout(()=>el.classList.remove('playing'),5000)}
/* ===== Núcleos: I / O / P saltan al comienzo de cada uno. Un núcleo cuenta como completo al llegar a su última pantalla. ===== */
const NUC_START={1:'53:3',2:'234:91',3:'708:391'};   // 1 Composición tradicional e IA · 2 De la idea al sonido · 3 ¿Qué piensan los humanos?
const NUC_END={'101:638':1,'359:1764':2};
let nucDone=new Set();try{nucDone=new Set(JSON.parse(sessionStorage.getItem('electria-nucleos')||'[]'))}catch{}
function markNucleo(id){const n=NUC_END[id];if(!n||nucDone.has(n))return;nucDone.add(n);try{sessionStorage.setItem('electria-nucleos',JSON.stringify([...nucDone]))}catch{}}
function gotoNucleo(n){
 for(let k=1;k<n;k++)if(!nucDone.has(k)){toast('Primero completá el núcleo '+k+'.');return}
 go(NUC_START[n]);
}
function go(id,remember=true){if(Connect.isCapture(id)&&!recording){Connect.start(id);return;}Connect.leave(id);if(!screens[id]){toast('Esta pantalla todavía no está disponible');return;}if(remember&&id!==current)history.push(current);current=id;markNucleo(id);step=0;stop();stage.innerHTML=screens[id];if(window.__shown&&stage.animate&&!matchMedia('(prefers-reduced-motion: reduce)').matches)stage.animate([{opacity:0},{opacity:1}],{duration:350,easing:'ease-out'});window.__shown=true;window.history.replaceState(null,'','#'+id);fit();wire();const title=stage.querySelector('[data-name]')?.getAttribute('data-name')||'Electria';$('#progress').textContent=['88:2','475:262','508:509','507:378'].includes(id)?'Introducción':id==='56:341'?'Elegí tu recorrido':traditional.includes(id)||assisted.includes(id)||['53:3','652:1189','73:298','73:402','73:564','101:638'].includes(id)?'Composición tradicional e IA':id.startsWith('359:')||['234:91','530:1123','530:1665','501:410','290:278','304:209','333:824','326:564','597:916','342:996'].includes(id)?'De la idea al sonido':'¿Qué piensan los humanos?';$('#continue').hidden=(!next[id]&&!(traditional.includes(id)||assisted.includes(id)))||!!(window.Flow&&Flow.GATES[id]);$('#continue').innerHTML=(next[id]==='56:341'?'Volver al inicio →':'Continuar →')+'<kbd>C</kbd>';$('#back').disabled=history.length===0;
 if(window.Flow)Flow.enter(id);
 if(id==='359:1487'){const p=[...stage.querySelectorAll('p')].find(p=>p.textContent.startsWith('Quiero una canción'));if(p)p.textContent=`Quiero una canción de electropop con una melodía ${compose.mood}, pensada para ${compose.context}. El instrumento que más quiero que se destaque es el ${compose.instrument}.`;}
 const timed=reactions.flatMap(r=>r.f===id?r.r:[]).find(r=>r.t==='AFTER_TIMEOUT'&&r.a.some(a=>a.nav==='NAVIGATE'&&screens[a.d]));if(timed){const target=timed.a.find(a=>a.nav==='NAVIGATE'&&screens[a.d]).d;sequenceTimer=setTimeout(()=>{if(current===id)go(target,false)},(id==='359:1737'?3:(timed.timeout||.8))*1000);}
}
function action(el,fn,label){if(!el)return;if(el.dataset.bound){if(label)el.setAttribute('aria-label',label);return;}el.dataset.bound='1';el.setAttribute('role','button');el.tabIndex=0;el.setAttribute('aria-label',label||el.getAttribute('data-name')||el.textContent.trim()||'Explorar');el.addEventListener('click',e=>{e.stopPropagation();fn(el)});el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();fn(el)}})}
function byId(id){return [...stage.querySelectorAll('[data-node-id]')].filter(e=>(e.dataset.nodeId===id||e.dataset.nodeId.endsWith(';'+id)||e.dataset.nodeId===id.split(';').pop()))}
function words(text){return [...stage.querySelectorAll('p,span,a')].filter(e=>e.textContent.trim().toLowerCase()===text.toLowerCase())}
function wire(){
 Connect.wire();Revisions.enter();
 const rr=reactions.filter(r=>r.f===current);
 for(const r of rr)for(const reaction of r.r){const nav=reaction.a.find(a=>a.nav==='NAVIGATE'&&screens[a.d]);if(reaction.t==='ON_CLICK'&&nav)if(!(window.Flow&&Flow.blocks(current,r.id)))for(const el of byId(r.id))action(el,()=>go(nav.d),el.textContent.trim()||'Explorar');}
 for(const text of ['Siguiente','siguiente','Continuemos!','Inicio','Atrás','Diferencias','Juego','Composición autónoma'])for(const el of words(text)){if(text==='Siguiente'&&['546:1270','566:1774'].includes(current))continue;action(el,()=>{if(text==='Atrás'){if(current==='476:823'){go('274:260',false);return}if(current==='274:260'){go('708:391',false);return}back();return}if(text==='Inicio'){go('56:341');return}if(text==='Diferencias'){go('73:564');return}if(text==='Juego'){go('101:638');return}if(text==='Composición autónoma'){go('652:1189');return}advance()},text);}
 if(current==='88:2'){const el=stage.querySelector('[data-node-id="512:776"]');action(el,()=>go('475:262'),'Comenzar');action(stage.querySelector('[data-name="auriculares 3"]'),()=>go('475:262'),'Ponete los auriculares para comenzar');}
 if(current==='56:341'){['410:269','410:267','410:266'].forEach((id,i)=>byId(id).forEach(e=>action(e,()=>go(['53:3','234:91','708:391'][i]),['Composición tradicional e IA','De la idea al sonido','Qué piensan los humanos'][i])))}
 if(current==='53:3')traditional.forEach((id,i)=>words(noteNames[i]).forEach(e=>action(e,()=>{note(i);go(id)},'Explorar '+noteNames[i])));
 if(current==='73:402')assisted.forEach((id,i)=>words(noteNames[i]).forEach(e=>action(e,()=>{note(i);go(id)},'Explorar '+noteNames[i])));
 if(!MEDIA[current]&&!VIDEO[current]&&!['781:2988','274:260','73:298','652:1329','652:1343','781:3138','781:3218'].includes(current)){for(const el of stage.querySelectorAll('[data-name]'))if(/play|reproducir|audio-wave/i.test(el.dataset.name))action(el,e=>toggleDemo(e),'Reproducir demostración sonora');
 for(const el of words('Reproducir'))action(el,e=>toggleDemo(e),'Reproducir demostración sonora');}
 if(current==='359:1487')for(const e of words('Quiero cambiar algo..'))action(e,()=>go('234:91'),'Modificar mi canción');
 if(current==='359:1764'){for(const e of stage.querySelectorAll('[data-name]'))if(/play|wave|synth/i.test(e.dataset.name))action(e,melody,'Escuchar melodía de demostración');}
 if(/^761:/.test(current)){for(const e of words('Mantén apretado para grabar'))action(e,record,'Grabar mi opinión');for(const e of stage.querySelectorAll('[data-name]'))if(/Group 88/.test(e.dataset.name))action(e,record,'Grabar mi opinión');}

 if(current==='708:391')for(const [i,t]of ['De forma habitual','De forma esporádica'].entries())for(const e of words(t))action(e,()=>{if(window.Flow&&Flow.gated(current)){Flow.nudge();return}go(i?'769:4700':'476:540')},t);
 if(['476:540','769:4700'].includes(current)){const dest=current==='476:540'?['247:83','769:4752','769:4824','769:4788']:['769:4994','769:5030','769:5066','769:5102'];for(const[i,t]of ['Experiencia de uso reciente','Curiosidad y exploración','Desinterés/indiferencia','Rechazo'].entries())for(const e of words(t))action(e,()=>go(dest[i]),t);}
 if(current==='476:823')for(const[i,t]of ['Se puede usar como herramienta de apoyo','Se puede crear canciones completas','Depende del uso que se le dé','Estoy totalmente en contra'].entries())for(const e of words(t))action(e,()=>{try{localStorage.setItem('electria-opinion',String(i+1))}catch{}go(['761:3661','761:3176','761:4140','761:2688'][i])},t);
 wireMedia();wireVideo();wireGame();fixPrompts();
 if(current==='652:1189'){const dest=['73:298','652:1329','652:1343'];const prompts=[...stage.querySelectorAll('p')].filter(e=>e.textContent.trim().startsWith('Crea una canción'));
  const target=t=>/electr/i.test(t)?dest[0]:/regue/i.test(t)?dest[1]:dest[2];   // DO electrónico · RE reguetón · MI pop
  prompts.forEach(e=>action(e,()=>go(target(e.textContent)),'Elegir este prompt'));
  // los círculos DO / RE / MI de abajo también eligen (izquierda → derecha)
  const dots=['DO','RE','MI'].map(n=>words(n).find(p=>p.previousElementSibling?.tagName==='DIV'&&srel(p).t>700));
  dots.forEach((p,i)=>{if(!p)return;const c=srel(p.previousElementSibling),r=c.w>20&&c.w<120?c:srel(p);addHit(r,'Elegir prompt '+['DO','RE','MI'][i],()=>go(dest[i]),'mp-circle')});
 }
}

const SKIP={'mood':'530:1123','708:391':'476:540'};
function skipGate(){                              
 if(current==='mood')compose.moodChosen=true;
 if(current==='359:1185')compose.instrumentChosen=true}
function advance(force){if(!force&&window.Flow&&Flow.gated(current)){Flow.nudge();return}if(force){skipGate();if(SKIP[current]){go(SKIP[current]);return}}if(next[current])go(next[current]);else if(traditional.includes(current))go('53:3');else if(assisted.includes(current))go('73:402');else go('56:341')}
function back(){while(history.length&&Connect.isCapture(history[history.length-1]))history.pop();if(history.length)go(history.pop(),false);else go('56:341')}
function noteAction(i){if(window.Flow&&Flow.onNote(i))return;if(Revisions.onNote(i))return;if(Connect.onNote(i))return;if(i===7){if(VIDEO[current]&&VIDEO[current].clips.length>1){nextClip();return}advance();return}if(VIDEO[current]){if(i===0)playVideo();return}if(GAME[current]&&i>=1&&i<=3){answer(i-1);return}if(MEDIA[current]){playMedia(i);return}note(i);if(current==='53:3'){go(traditional[i]);return}if(current==='73:402'&&i<5){go(assisted[i]);return}if(current==='530:1123'){step++;if(step>=3)go('530:1665');return}if(current==='530:1665'){compose.mood=i===0?'alegre':'triste';go('501:410');return}if(current==='333:824'){compose.context=['un concierto','un viaje','una fiesta'][i%3];chord(i%3);go('326:564');return}if(current==='359:1185'){compose.instrument=['sintetizador','caja de ritmos','guitarra eléctrica'][i%3];chord(i%3);go('359:1170');return}if(current==='652:1189'&&i<3){go(['73:298','652:1329','652:1343'][i]);return}if(current==='708:391'){go(i<3?'476:540':'769:4700');return}if(['476:540','769:4700'].includes(current)&&i>=1&&i<=4){const branch=current==='476:540'?['247:83','769:4752','769:4824','769:4788']:['769:4994','769:5030','769:5066','769:5102'];go(branch[i-1]);return}if(current==='476:823'&&i>=1&&i<=4){const target=['761:3661','761:3176','761:4140','761:2688'][i-1];try{localStorage.setItem('electria-opinion',String(i))}catch{}go(target);return}}
async function record(){const id=({'761:3661':'986:2583','761:3176':'986:2740','761:4140':'986:2770','761:2688':'986:2800'})[current];if(id)Connect.start(id);else toast('Elegí una categoría para compartir tu opinión.')}
$('#continue').onclick=()=>advance();$('#back').onclick=back;$('#home').onclick=()=>go('56:341');function resetAll(){compose.chord=[5,0,2];compose.moodChosen=false;compose.instrumentChosen=false;compose.mood='triste';compose.context='una fiesta';compose.instrument='sintetizador';history=[];nucDone=new Set();try{sessionStorage.removeItem('electria-nucleos')}catch{}go('88:2',false)}$('#reset').onclick=resetAll;$('#sound').onclick=()=>{sound=!sound;if(!sound)stop();$('#sound').setAttribute('aria-pressed',String(sound));$('#sound').textContent=sound?'Sonido activado':'Sonido desactivado'};$('#help').onclick=()=>go('475:262');$('#close-dialog').onclick=()=>$('#dialog').close();document.querySelectorAll('[data-note]').forEach(b=>b.onpointerdown=()=>noteAction(+b.dataset.note));/* Atajos: V volver · B biblioteca · C continuar · R reiniciar */
const SHORTCUTS={
 v:()=>{if(history.length)back();else toast('Estás en la primera pantalla.')},
 b:()=>Revisions.showLibrary(),
 c:()=>{if(!SKIP[current]&&!next[current]&&!traditional.includes(current)&&!assisted.includes(current)){toast('No hay una pantalla siguiente.');return}advance(true)},   // atajo de desarrollador: ignora los acordes
 r:resetAll,
 i:()=>gotoNucleo(1),o:()=>gotoNucleo(2),p:()=>gotoNucleo(3)
};
document.addEventListener('keydown',e=>{
 if(e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;
 const k=e.key.toLowerCase();
 if($('#dialog').open){if(k==='b'){e.preventDefault();$('#dialog').close()}return}      // con la biblioteca abierta, B la cierra
 if(e.target.closest&&e.target.closest('input,textarea,select'))return;
 if(SHORTCUTS[k]){e.preventDefault();SHORTCUTS[k]();return}
 const i=keys.indexOf(k);if(i>=0){e.preventDefault();noteAction(i)}if(e.key==='Escape')back()});window.addEventListener('resize',fit);
window.addEventListener('hashchange',()=>{const id=decodeURIComponent(location.hash.slice(1));if(screens?.[id]&&id!==current)go(id)});
Promise.all([fetch('screens.json').then(r=>r.json()),fetch('reactions.json').then(r=>r.json()),fetch('variants.json').then(r=>r.json())]).then(([s,r,v])=>{screens=s;reactions=r;Connect.init(v);Revisions.init();Flow.init(s);go(s[location.hash.slice(1)]?location.hash.slice(1):'88:2',false)}).catch(()=>{stage.innerHTML='<div class="loading">No se pudo abrir la experiencia. Recargá la página.</div>'});
