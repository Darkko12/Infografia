'use strict';
// Connections recovered from the current Figma prototype. Keep musical gates in flow.js.
window.Connect=(()=>{
 const CAROUSELS={
  '781:3218':['801:2723','801:2724'],
  '781:3138':['893:2767','893:2768','893:2769','893:2770','893:2771'],
  '686:598':['687:519','687:520','687:521','687:522','687:523','687:524'],
  '690:1108':['889:3264','889:3265','889:3266']
 };
 const CAPTURE={'986:2583':'761:3661','986:2740':'761:3176','986:2770':'761:4140','986:2800':'761:2688'};
 const FROM={'761:3661':'986:2583','761:3176':'986:2740','761:4140':'986:2770','761:2688':'986:2800'};
 // Videos dentro de los carruseles: pantalla -> {id de la slide: archivo}
 const CAROUSEL_VIDEO={
  '781:3138':{'893:2768':'video/Ajuste1.mp4','893:2769':'video/Ajuste2.mp4','893:2770':'video/Ajuste3.mp4','893:2771':'video/Ajuste4.mp4'},
  '781:3218':{'801:2723':'video/ObraAsistida.mp4'}
 };
 let slideVideo=null;
 let templates={},carousel=null,pending=false,captureId=null,stream=null,limit=null;
 const recordings=new Map();let playback=null;
 function init(v){templates=v}
 // Las tres notas de voz son siempre las 3 más recientes de la categoría (la más nueva arriba).
 const ROWS=['761:a403','761:538','761:403'],MAX=3;
 const LISTEN_BY_CAT={contra:'761:2688',comp:'761:3176',apoyo:'761:3661',dep:'761:4140'};
 let idx=-1,count=0,lastCat=null;
 // idx = nota seleccionada (se queda agrandada y con el ícono pintado); playback != null = está sonando
 function paint(){ROWS.forEach((id,k)=>{const el=byId(id)[0];if(!el)return;el.classList.toggle('is-sel',k===idx);el.classList.toggle('is-playing',!!playback&&k===idx);el.classList.toggle('is-empty',k>=count)})}
 function stopPlayback(){if(playback){playback.pause();playback=null}paint()}
 function leave(id){stopPlayback();idx=-1;count=0;carousel=null;if(recording&&CAPTURE[captureId]&&id!==captureId)finish(true,false)}
 // Reproduce la opinión k de la categoría actual. wrap=true: da la vuelta al llegar a la última.
 async function play(k,wrap){
  const category=current;const entries=(await RecordingLibrary.list(category)).slice(0,MAX);if(current!==category)return;count=entries.length;
  if(!entries.length){toast('Todavía no hay opiniones guardadas en esta categoría. Volvé atrás para compartir la tuya.');return}
  if(!wrap&&k>=entries.length){toast(entries.length===1?'Por ahora hay una sola opinión guardada en esta categoría.':'Por ahora hay '+entries.length+' opiniones guardadas en esta categoría.');return}
  const i=((k%entries.length)+entries.length)%entries.length;
  stopPlayback();stop();idx=i;
  const old=recordings.get(category);if(old)URL.revokeObjectURL(old);const url=URL.createObjectURL(entries[i].blob);recordings.set(category,url);
  const me=playback=new Audio(url);me.onended=()=>{if(playback===me){playback=null;paint()}};paint();
  me.play().catch(()=>{if(playback===me)stopPlayback();toast('No se pudo reproducir la grabación')});
  if(entries.length>1)toast('Opinión '+(i+1)+' de '+entries.length);
 }
 function preview(){if(playback){stopPlayback();return}play(idx>=0?idx:0,true)}
 function nextOpinion(){play(idx+1,true)}
 async function start(id){
  if(pending||recording)return;pending=true;const origin=current;
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){pending=false;toast('Para grabar, abrí la página en localhost o HTTPS con un navegador compatible.');return}
  try{
   const input=await navigator.mediaDevices.getUserMedia({audio:true});
   if(current!==origin){input.getTracks().forEach(t=>t.stop());return}
   const chunks=[];const rec=new MediaRecorder(input);stream=input;recorder=rec;captureId=id;
   rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
   rec.onstop=async()=>{
    const keep=!rec.discard,category=CAPTURE[id];input.getTracks().forEach(t=>t.stop());if(stream===input)stream=null;
    if(keep&&chunks.length){
     const old=recordings.get(category);if(old)URL.revokeObjectURL(old);
     const blob=new Blob(chunks,{type:rec.mimeType});let saved;try{saved=await RecordingLibrary.save(category,blob)}catch{toast('No se pudo guardar la grabación. El almacenamiento del navegador está lleno o bloqueado.');return}const url=URL.createObjectURL(blob);recordings.set(category,url);recordedUrl=url;
     toast(saved.persistent?'Tu opinión quedó guardada en este navegador. Ya podés escuchar las opiniones.':'Tu opinión quedó guardada durante esta sesión. Ya podés escuchar las opiniones.');
    }
   };
   rec.start();recording=true;go(id);limit=setTimeout(()=>finish(false),60000);toast('Grabando… Tocá SOL para detener o RE para cancelar.');
  }catch{stream?.getTracks().forEach(t=>t.stop());stream=null;recording=false;toast('No se pudo iniciar la grabación. Revisá el permiso del micrófono.');}
  finally{pending=false}
 }
 function finish(cancel=false,navigate=true){
  if(!recording)return;const target=CAPTURE[captureId];recording=false;clearTimeout(limit);
  if(recorder&&recorder.state!=='inactive'){recorder.discard=cancel;recorder.stop();}
  stream?.getTracks().forEach(t=>t.stop());if(navigate&&target)go(target);
  if(cancel)toast('Grabación cancelada.');
 }
 // Pone el <video> dentro del recuadro de la miniatura; el ícono ▶ y el oscurecido se ocultan mientras reproduce
 function attachVideo(c){
  slideVideo=null;const src=(CAROUSEL_VIDEO[current]||{})[c.ids[c.index]];if(!src)return;
  const thumb=[...c.host.children].find(e=>(e.dataset.name||'').startsWith('IMG_'));if(!thumb)return;
  const ui=[...c.host.children].filter(e=>e.tagName==='DIV'&&(thumb.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING));
  ui.forEach(e=>{e.style.pointerEvents='none'});
  const show=on=>ui.forEach(e=>{e.style.visibility=on?'visible':'hidden'});
  const v=document.createElement('video');v.className='slide-video';v.playsInline=true;v.preload='auto';v.src=src+'#t=0.1';v.setAttribute('aria-label','Video '+(c.index+1)+' de '+c.ids.length);
  v.addEventListener('play',()=>show(false));v.addEventListener('pause',()=>show(true));v.addEventListener('ended',()=>show(true));
  v.addEventListener('error',()=>{show(true);toast('Falta el video: '+src.split('/').pop())});
  v.addEventListener('click',e=>{e.stopPropagation();toggleVideo()});
  thumb.appendChild(v);slideVideo=v;
 }
 function toggleVideo(){
  const v=slideVideo;if(!v)return false;
  if(!v.paused){v.pause();return true}
  v.muted=!sound;v.play().catch(()=>toast('No se pudo reproducir el video'));return true;
 }
 function wireCarousel(){
  const ids=CAROUSELS[current];if(!ids)return;
  const host=byId(ids[0])[0];if(!host)return;
  carousel={ids,host,index:0};paintCarousel();
 }
 function paintCarousel(){
  const c=carousel;if(!c)return;const t=document.createElement('template');t.innerHTML=templates[c.ids[c.index]];
  c.host.innerHTML=t.content.firstElementChild.innerHTML;
  if(c.ids[c.index]==='893:2767'){
   const paragraph=c.host.querySelector('[data-node-id="893:2699"]');if(paragraph)paragraph.style.lineHeight='normal';
   ['906:2868','906:2871','906:2874'].forEach(id=>c.host.querySelector('[data-node-id="'+id+'"]')?.remove());
  }
  if(c.ids[c.index]==='801:2724'){    // "Taryn lanzó el álbum…": el párrafo ya trae las palabras resaltadas; se borran las copias superpuestas que lo rompían
   const paragraph=c.host.querySelector('[data-node-id="801:2721"]');
   if(paragraph){paragraph.style.lineHeight='normal'}
   ['906:2877','906:2879','906:2881'].forEach(id=>c.host.querySelector('[data-node-id="'+id+'"]')?.remove());
  }
  c.host.dataset.carouselIndex=c.index;c.host.setAttribute('aria-label','Ejemplo '+(c.index+1)+' de '+c.ids.length);
  c.host.querySelectorAll('button,a').forEach(el=>action(el,cycle,'Siguiente ejemplo'));
  for(const p of words('Siguiente'))action(p,cycle,'Siguiente ejemplo');
  attachVideo(c);
 }
 function cycle(){if(!carousel)return false;stop();carousel.index=(carousel.index+1)%carousel.ids.length;paintCarousel();return true}
 // Gráfico + notas de voz de "Opiniones del público"
 function setupOpinionsUI(){
  const cat=Object.keys(LISTEN_BY_CAT).find(k=>LISTEN_BY_CAT[k]===current),root=stage.firstElementChild;if(!cat||!root)return;
  // notas: ícono y barras 
  ROWS.forEach(id=>{const row=byId(id)[0];if(!row)return;row.classList.add('n3-row');
   const mic=row.querySelector('[data-name="iconoir:microphone"]'),ico=mic&&mic.parentElement;if(ico)ico.classList.add('n3-ico');
   [...row.querySelectorAll('img')].filter(im=>!ico||!ico.contains(im)).forEach((im,i)=>{im.classList.add('n3-bar');im.style.setProperty('--i',i)});
  });
  RecordingLibrary.list(current).then(es=>{count=Math.min(es.length,MAX);paint()});paint();
  // porción + rótulo: todos crecen igual y se animan desde la selección anterior
  const setActive=c=>stage.querySelectorAll('[data-n3-cat],[data-n3-lab]').forEach(el=>el.classList.toggle('is-active',(el.dataset.n3Cat||el.dataset.n3Lab)===c));
  root.classList.add('n3-init');setActive(lastCat);void root.offsetWidth;root.classList.remove('n3-init');
  const shown=current;requestAnimationFrame(()=>requestAnimationFrame(()=>{if(current===shown)setActive(cat)}));
  lastCat=cat;
 }
 function wire(){
  if(!FROM[current])lastCat=null;
  wireCarousel();
  if(current==='781:3218'){
   const row=(text,fn,label)=>{const p=words(text)[0];if(!p)return;const r=srel(p);addHit({l:r.l-80,t:r.t-8,w:340,h:r.h+16},label,fn,'mp-box')};
   for(const p of words('Reproducir'))action(p,toggleVideo,'Reproducir video');
   row('Reproducir',toggleVideo,'Reproducir video');row('Siguiente',cycle,'Siguiente');
  }
  if(current==='476:823')for(const [label,id] of [['Se puede usar como herramienta de apoyo','986:2583'],['Se puede crear canciones completas','986:2740'],['Depende del uso que se le dé','986:2770'],['Estoy totalmente en contra','986:2800']])for(const p of words(label))action(p,()=>start(id),'Grabar opinión: '+label);

  if(CAPTURE[current]){
   for(const p of words('Cancelar'))action(p.closest('[data-node-id="986:2720"]')||p.parentElement,()=>finish(true),'Cancelar grabación');
   for(const p of words('Detener grabación'))action(p.closest('[data-node-id="986:2698"]')||p.parentElement,()=>finish(false),'Detener grabación');
   const backNode=stage.querySelector('a[data-name="IMG_0772 1"]');if(backNode)action(backNode,()=>{finish(true,false);go('476:823')},'Volver a las opciones');
  }
  if(FROM[current]){
   // "Dale a siguiente para alternar entre las opiniones"
   byId('761:397').forEach(el=>action(el,nextOpinion,'Alternar entre las opiniones'));
   for(const p of words('Para escuchar'))action(p,preview,'Escuchar opiniones');
   ROWS.forEach((id,k)=>byId(id).forEach(el=>action(el,()=>{if(playback&&idx===k){stopPlayback();return}play(k,false)},'Escuchar opinión '+(k+1))));
   setupOpinionsUI();
   // grabar de nuevo solo se puede volviendo a las opciones
   const back=()=>go('476:823');
   const arrow=stage.querySelector('a[data-name="IMG_0772 1"]');if(arrow)action(arrow,back,'Volver para compartir mi opinión');
   stage.querySelectorAll('.n3-reclabel').forEach(el=>action(el,back,'Compartí tu opinión'));
   stage.querySelectorAll('[data-n3-cat]').forEach(el=>action(el,()=>{const t=LISTEN_BY_CAT[el.dataset.n3Cat];if(t&&t!==current)go(t)},'Ver las opiniones de esta categoría'));
  }
 }
 function onNote(i){
  if(CAPTURE[current]){if(i===1)finish(true);else if(i===4)finish(false);return true}
  if(current==='476:823'){const id=({3:'986:2583',5:'986:2583',4:'986:2740',2:'986:2770',1:'986:2800'})[i];if(id){start(id);return true}}
  if(FROM[current]){const cat={1:'761:2688',2:'761:4140',3:'761:3661',4:'761:3176'}[i];if(cat){if(cat!==current)go(cat)}else if(i===5)preview();else if(i===7)nextOpinion();return true}
  if(carousel){if(i===7)cycle();else if(i===0&&!toggleVideo())toast('Esta parte no tiene video. Presioná K para continuar.');return true}
  return false;
 }
 const isCapture=id=>!!CAPTURE[id];
 window.addEventListener('pagehide',()=>{if(recording)finish(true,false);stream?.getTracks().forEach(t=>t.stop());for(const url of recordings.values())URL.revokeObjectURL(url)});
 return {init,wire,onNote,start,isCapture,leave,cycle,preview,toggleVideo};
})();
