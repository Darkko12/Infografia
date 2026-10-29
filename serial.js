'use strict';
/* =========================================================================
   Pulsadores Arduino → Electria (Web Serial)
   El Arduino manda por USB líneas como  "Boton 3 ON"  /  "Boton 3 OFF"  (9600 baudios).
   Cada "ON" ejecuta lo mismo que apretar la tecla del teclado asignada abajo.
   Requisitos: Chrome o Edge, y abrir la página en http://localhost o https.
   Primera vez: apretar la tecla U y elegir el puerto del Arduino. Después se reconecta solo.
   ========================================================================= */
window.ArduinoButtons=(()=>{
 /* ----- CONFIGURACIÓN: qué hace cada pulsador -----
    {note:N}  = nota del piano (0 DO · 1 RE · 2 MI · 3 FA · 4 SOL · 5 LA · 6 SI · 7 DO agudo = tecla K)
    {key:'x'} = atajo (v volver · b biblioteca · c continuar · r reiniciar · i/o/p núcleos)
    Cambiá los números/teclas a gusto; "Boton N" es el N-ésimo pin de tu lista {2,3,…,12,A0,A1}. */
 const MAP={
   1:{note:0},  2:{note:1},  3:{note:2},  4:{note:3},
   5:{note:4},  6:{note:5},  7:{note:6},  8:{note:7},
   9:{key:'v'}, 10:{key:'b'}, 11:{key:'c'}, 12:{key:'r'},
   13:{key:'i'}
 };
 const BAUD=9600;
 let port=null,reader=null,closing=false;

 function press(n){
  const m=MAP[n];if(!m){console.log('[Arduino] Botón '+n+' sin asignar');return}
  if(m.note!==undefined)noteAction(m.note);
  else if(m.key&&SHORTCUTS[m.key])SHORTCUTS[m.key]();
 }
 function handleLine(line){
  const m=line.trim().match(/^Boton\s+(\d+)\s+(ON|OFF)$/i);if(!m)return;
  if(m[2].toUpperCase()==='ON'){console.log('[Arduino] Botón '+m[1]);press(+m[1])}   // OFF se ignora: cada pulsación actúa una sola vez
 }
 async function listen(p){
  try{
   await p.open({baudRate:BAUD});port=p;closing=false;console.log('[Arduino] Conectado');
   const dec=new TextDecoderStream(),done=p.readable.pipeTo(dec.writable).catch(()=>{});
   reader=dec.readable.getReader();let buf='';
   for(;;){const {value,done:end}=await reader.read();if(end)break;buf+=value;let i;while((i=buf.search(/\r?\n/))>=0){handleLine(buf.slice(0,i));buf=buf.slice(i).replace(/^\r?\n/,'')}}
   await done;
  }catch(err){if(!closing)console.log('[Arduino] Conexión interrumpida: '+err.message)}
  finally{try{reader?.releaseLock()}catch{}try{await p.close()}catch{}port=null;reader=null;
   if(!closing)setTimeout(()=>auto(),2000)}    // se desenchufó: reintenta solo
 }
 async function auto(){                     // puertos ya autorizados antes: se conectan sin preguntar
  if(port||!navigator.serial)return;
  try{const ports=await navigator.serial.getPorts();if(ports.length)listen(ports[0])}catch{}
 }
 async function connect(){
  if(!navigator.serial){console.log('[Arduino] Este navegador no soporta Web Serial. Usá Chrome o Edge en localhost/https.');return}
  if(port){console.log('[Arduino] Ya está conectado');return}
  try{listen(await navigator.serial.requestPort())}catch{console.log('[Arduino] No se eligió ningún puerto')}
 }
 document.addEventListener('keydown',e=>{if(!e.repeat&&!e.ctrlKey&&!e.altKey&&!e.metaKey&&e.key.toLowerCase()==='u'){e.preventDefault();connect()}});
 if(navigator.serial){navigator.serial.addEventListener('disconnect',()=>console.log('[Arduino] Desenchufado'));auto()}
 return {connect,press,MAP};
})();
